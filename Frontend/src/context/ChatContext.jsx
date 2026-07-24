import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createChat, getChats, getMessages } from '../services/chat.service';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const ChatContext = createContext(null);

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
  const [messagesByChat, setMessagesByChat] = useState({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [memoryHint, setMemoryHint] = useState('');

  const pendingRef = useRef(false);
  const messagesRef = useRef(messagesByChat);
  messagesRef.current = messagesByChat;
  const loadedChatsRef = useRef(new Set());

  // Fetch the real chat list from the backend whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setChats([]);
      setCurrentChatId(null);
      setMessagesByChat({});
      loadedChatsRef.current = new Set();
      return;
    }

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

  // Fetch a chat's message history the first time it's opened.
  useEffect(() => {
    if (!currentChatId) return;
    if (loadedChatsRef.current.has(currentChatId)) return;

    let cancelled = false;
    setMessagesLoading(true);
    getMessages(currentChatId)
      .then((data) => {
        if (cancelled) return;
        loadedChatsRef.current.add(currentChatId);
        setMessagesByChat((prev) => ({
          ...prev,
          [currentChatId]: (data.messages || []).map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })),
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || 'Could not load this chat. Please try again.';
        showToast(message, 'error');
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentChatId, showToast]);

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

      if (data.memoryUsed) {
        setMemoryHint('Using remembered context');
      } else {
        setMemoryHint('');
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
    loadedChatsRef.current.add(chat.id); // brand new — nothing to fetch
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
      if (pendingRef.current) return;
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

      loadedChatsRef.current.add(chat.id);
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
        messagesLoading,
        isAiTyping,
        isSending,
        memoryHint,
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