import { useContext } from 'react';
import { chatContext } from './chatContextInstance';

export function useChat() {
  const ctx = useContext(chatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

