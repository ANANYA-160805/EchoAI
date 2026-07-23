import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../services/auth.service';

const AuthContext = createContext(null);
const STORAGE_KEY = 'echo_ai_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [initializing, setInitializing] = useState(false);

  const persistUser = useCallback((u) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await loginUser(credentials);
      persistUser(data.user);
      return data;
    },
    [persistUser]
  );

  const register = useCallback(
    async (payload) => {
      const data = await registerUser(payload);
      persistUser(data.user);
      return data;
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    persistUser(null);
    const userId = user?.id;
    if (userId) {
      localStorage.removeItem(`echo_ai_chats_${userId}`);
    }
    localStorage.removeItem('echo_ai_chats');
  }, [persistUser, user?.id]);

  useEffect(() => {
    setInitializing(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
