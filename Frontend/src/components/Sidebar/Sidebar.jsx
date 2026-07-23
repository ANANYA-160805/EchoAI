import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/useChat';
import { useSocket } from '../../context/SocketContext';
import { formatRelative } from '../../utils/formatDate';
import { cx } from '../../utils/cx';
import styles from './Sidebar.module.css';

const statusCopy = {
  connected: { label: 'Connected', tone: 'connected' },
  connecting: { label: 'Connecting…', tone: 'connecting' },
  disconnected: { label: 'Offline', tone: 'offline' },
  error: { label: 'Connection error', tone: 'offline' },
};

export default function Sidebar({ isOpen, onClose, onNewChat, creatingChat = false }) {
  const { user, logout } = useAuth();
  const { chats, currentChatId, selectChat } = useChat();
  const { status } = useSocket();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
  }, [chats, query]);

  function handleSelectChat(id) {
    selectChat(id);
    onClose?.();
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const s = statusCopy[status] || statusCopy.disconnected;

  return (
    <>
      {isOpen && <div className={styles.scrim} onClick={onClose} />}
      <aside className={cx(styles.sidebar, isOpen && styles.open)}>
        <div className={styles.top}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>
              <span className={styles.logoRing} />
              <span className={styles.logoDot} />
            </span>
            Echo AI
          </div>
          <button className={styles.closeMobile} onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <Button variant="primary" fullWidth onClick={onNewChat} icon={<span>+</span>} loading={creatingChat}>
          New chat
        </Button>

        <div className={styles.search}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Search chats"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.chatList}>
          <p className={styles.sectionLabel}>Recent chats</p>
          {filteredChats.length === 0 && (
            <p className={styles.empty}>
              {chats.length === 0 ? 'No chats yet — start one above.' : 'No matches found.'}
            </p>
          )}
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              className={cx(styles.chatItem, chat.id === currentChatId && styles.chatItemActive)}
              onClick={() => handleSelectChat(chat.id)}
            >
              <span className={styles.chatTitle}>{chat.title}</span>
              <span className={styles.chatTime}>{formatRelative(chat.lastActivity)}</span>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.status}>
            <span className={cx(styles.statusDot, styles[s.tone])} />
            {s.label}
          </div>
          <div className={styles.profile}>
            <Avatar fullName={user?.fullName} size="md" />
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>
                {user?.fullName?.firstName} {user?.fullName?.lastName}
              </p>
              <p className={styles.profileEmail}>{user?.email}</p>
            </div>
            <button className={styles.logout} onClick={handleLogout} aria-label="Log out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
