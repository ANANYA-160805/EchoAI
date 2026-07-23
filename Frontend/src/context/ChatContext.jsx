import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createChat } from '../services/chat.service';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const ChatContext = createContext(null);

function storageKey(userId) {
  return `echo_ai_chats_${userId}`;
}

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const pendingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Load persisted chats/messages when the user changes
  useEffect(() => {
    if (!user) {
      setChats([]);
      setCurrentChatId(null);
      setMessagesByChat({});
      hasLoadedRef.current = false;
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) {
        const parsed = JSON.parse(raw);
        setChats(parsed.chats || []);
        setMessagesByChat(parsed.messagesByChat || {});
      }
    } catch {
      // ignore corrupt cache
    } finally {
      hasLoadedRef.current = true;
    }
  }, [user]);

  // Persist on change — but never before the initial load has completed,
  // otherwise the still-empty initial state overwrites the saved cache.
  useEffect(() => {
    if (!user || !hasLoadedRef.current) return;
    localStorage.setItem(
      storageKey(user.id),
      JSON.stringify({ chats, messagesByChat })
    );
  }, [chats, messagesByChat, user]);

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

  const startNewChat = useCallback(
    async (title) => {
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
    },
    []
  );

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
        prev.map((c) =>
          c.id === currentChatId ? { ...c, lastActivity: new Date().toISOString() } : c
        )
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