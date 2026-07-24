import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createChat, getChats } from '../services/chat.service';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const ChatContext = createContext(null);

function messagesStorageKey(userId) {
  return `echo_ai_messages_${userId}`;
}

function readMessagesCache(userId) {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(messagesStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

const GENERIC_TITLE_RE = /^New chat( \d+)?$/;

function deriveTitleFromContent(content) {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  // Message history has no backend endpoint yet, so it's still cached
  // per-browser in localStorage, keyed by user id.
  const [messagesByChat, setMessagesByChat] = useState(() =>
    readMessagesCache(user?.id)
  );
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const pendingRef = useRef(false);
  const messagesRef = useRef(messagesByChat);
  messagesRef.current = messagesByChat;

  // Fetch the real chat list from the backend whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setChats([]);
      setCurrentChatId(null);
      setMessagesByChat({});
      return;
    }

    setMessagesByChat(readMessagesCache(user.id));

    let cancelled = false;
    setChatsLoading(true);
    getChats()
      .then((data) => {
        if (cancelled) return;
        const sorted = [...(data.chats || [])].sort(
          (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
        );
        setChats(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || 'Could not load your chats. Please refresh.';
        showToast(message, 'error');
      })
      .finally(() => {
        if (!cancelled) setChatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, showToast]);

  // Persist message cache on change (chats list itself is server-backed now).
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(messagesStorageKey(user.id), JSON.stringify(messagesByChat));
  }, [messagesByChat, user]);

  // Listen for AI responses
  useEffect(() => {
    if (!socket) return;

    function handleResponse(data) {
      setIsAiTyping(false);
      setIsSending(false);
      pendingRef.current = false;

      if (data.error) {
        showToast(data.error || 'Echo AI could not respond. Please try again.', 'error');
        return;
      }

      setMessagesByChat((prev) => {
        const existing = prev[data.chat] || [];
        return {
          ...prev,
          [data.chat]: [
            ...existing,
            {
              id: nextLocalId(),
              role: 'model',
              content: data.content,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === data.chat ? { ...c, lastActivity: new Date().toISOString() } : c
        )
      );
    }

    socket.on('ai-response', handleResponse);
    return () => socket.off('ai-response', handleResponse);
  }, [socket, showToast]);

  const startNewChat = useCallback(async (title) => {
    const data = await createChat({ title });
    const chat = {
      id: data.chat.id,
      title: data.chat.title,
      lastActivity: data.chat.lastActivity || new Date().toISOString(),
    };
    setChats((prev) => [chat, ...prev]);
    setMessagesByChat((prev) => ({ ...prev, [chat.id]: [] }));
    setCurrentChatId(chat.id);
    return chat;
  }, []);

  const selectChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
  }, []);

  const sendMessage = useCallback(
    (content) => {
      if (!content.trim() || !currentChatId) return;
      if (pendingRef.current) return; // prevent duplicate in-flight requests
      if (!socket || socket.disconnected) {
        showToast('Not connected to Echo AI. Reconnecting…', 'error');
        return;
      }

      pendingRef.current = true;
      setIsSending(true);
      setIsAiTyping(true);

      const isFirstMessage = (messagesRef.current[currentChatId] || []).length === 0;

      const userMessage = {
        id: nextLocalId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      setMessagesByChat((prev) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), userMessage],
      }));

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== currentChatId) return c;
          const shouldRename = isFirstMessage && GENERIC_TITLE_RE.test(c.title);
          return {
            ...c,
            title: shouldRename ? deriveTitleFromContent(content) || c.title : c.title,
            lastActivity: new Date().toISOString(),
          };
        })
      );

      socket.emit('ai-message', { chat: currentChatId, content });
    },
    [currentChatId, socket, showToast]
  );

  const startChatWithMessage = useCallback(
    async (content, title) => {
      if (!content.trim()) return;
      if (!socket || socket.disconnected) {
        showToast('Not connected to Echo AI. Reconnecting…', 'error');
        return;
      }

      const data = await createChat({ title });
      const chat = {
        id: data.chat.id,
        title: data.chat.title,
        lastActivity: data.chat.lastActivity || new Date().toISOString(),
      };

      const userMessage = {
        id: nextLocalId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      setChats((prev) => [chat, ...prev]);
      setMessagesByChat((prev) => ({ ...prev, [chat.id]: [userMessage] }));
      setCurrentChatId(chat.id);

      pendingRef.current = true;
      setIsSending(true);
      setIsAiTyping(true);

      socket.emit('ai-message', { chat: chat.id, content });
      return chat;
    },
    [socket, showToast]
  );

  const currentMessages = messagesByChat[currentChatId] || [];
  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  return (
    <ChatContext.Provider
      value={{
        chats,
        chatsLoading,
        currentChatId,
        currentChat,
        currentMessages,
        isAiTyping,
        isSending,
        startNewChat,
        startChatWithMessage,
        selectChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}