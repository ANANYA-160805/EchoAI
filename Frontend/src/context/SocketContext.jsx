import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../services/axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setStatus('disconnected');
      return;
    }

    if (socketRef.current) return;

    setStatus('connecting');
    const instance = io(API_BASE_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    instance.on('connect', () => setStatus('connected'));
    instance.on('disconnect', () => setStatus('disconnected'));
    instance.on('connect_error', () => setStatus('error'));
    instance.io.on('reconnect_attempt', () => setStatus('connecting'));

    socketRef.current = instance;
    setSocket(instance);

    return () => {
      instance.off('connect');
      instance.off('disconnect');
      instance.off('connect_error');
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return <SocketContext.Provider value={{ socket, status }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
