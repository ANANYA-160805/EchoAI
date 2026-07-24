import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('echoai-theme', theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('echoai-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle theme"
    >
      <span className={styles.icon}>{theme === 'dark' ? '☀︎' : '☾'}</span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
