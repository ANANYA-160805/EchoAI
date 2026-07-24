import { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatMessage from '../../components/ChatMessage/ChatMessage';
import ChatInput from '../../components/ChatInput/ChatInput';
import Avatar from '../../components/Avatar/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/useChat';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';
import styles from './DashboardPage.module.css';

function TypingIndicator() {
  return (
    <div className={styles.answerRow}>
      <Avatar isAi size="sm" />
      <div className={styles.typingDots}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function deriveTitleFromContent(content) {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'New chat';
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

function HomeComposer({ onSubmit, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useAutosizeTextarea(value, 160);

  function submit() {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className={styles.homeComposer}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything…"
        rows={1}
      />
      <button
        className={styles.homeComposerSend}
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Ask Echo AI"
      >
        {disabled ? (
          <span className={styles.dots}>
            <span />
            <span />
            <span />
          </span>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { status } = useSocket();
  const { showToast } = useToast();
  const {
    currentChat,
    currentChatId,
    currentMessages,
    isAiTyping,
    isSending,
    memoryHint,
    startChatWithMessage,
    selectChat,
    sendMessage,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentMessages, isAiTyping]);

  // "+ New chat" no longer creates anything on the backend. It just clears
  // the current selection so the home composer shows up. The chat itself
  // (with a real, content-based title) is only created once you actually
  // ask something — see handleAskFromHome below.
  function handleNewChat() {
    selectChat(null);
    setSidebarOpen(false);
  }

  async function handleAskFromHome(content) {
    try {
      await startChatWithMessage(content, deriveTitleFromContent(content));
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not start a new chat. Please try again.';
      showToast(message, 'error');
    }
  }

  const connected = status === 'connected';

  // Pair up user/model messages into Q&A turns
  const turns = [];
  for (const m of currentMessages) {
    if (m.role === 'user') {
      turns.push({ query: m, answer: null });
    } else if (turns.length > 0) {
      turns[turns.length - 1].answer = m;
    } else {
      turns.push({ query: null, answer: m });
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={handleNewChat} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className={styles.chatHeading}>{currentChat ? currentChat.title : 'Echo AI'}</h2>
          {memoryHint ? <span className={styles.memoryBadge}>{memoryHint}</span> : null}
          <div className={styles.topbarSpacer} />
        </header>

        {!currentChatId ? (
          <div className={styles.home}>
            <div className={styles.homeRing} aria-hidden="true">
              <span />
              <span />
              <span className={styles.homeCore} />
            </div>
            <h1 className={styles.homeTitle}>
              Hi {user?.fullName?.firstName || 'there'}, what are we exploring today?
            </h1>
            <HomeComposer onSubmit={handleAskFromHome} disabled={isSending} />
          </div>
        ) : (
          <>
            <div className={styles.thread} ref={scrollRef}>
              <div className={styles.threadInner}>
                {turns.map((turn, i) => (
                  <div className={styles.turn} key={turn.query?.id || turn.answer?.id || i}>
                    {turn.query && (
                      <div className={styles.queryRow}>
                        <div className={styles.queryBubble}>{turn.query.content}</div>
                      </div>
                    )}
                    {turn.answer ? (
                      <div className={styles.answerRow}>
                        <Avatar isAi size="sm" />
                        <ChatMessage
                          role="model"
                          content={turn.answer.content}
                          createdAt={turn.answer.createdAt}
                          variant="flat"
                        />
                      </div>
                    ) : (
                      i === turns.length - 1 && isAiTyping && <TypingIndicator />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <ChatInput onSend={sendMessage} disabled={isSending} connected={connected} />
          </>
        )}
      </div>
    </div>
  );
}