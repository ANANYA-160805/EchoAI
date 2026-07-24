import { useState } from 'react';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';
import { cx } from '../../utils/cx';
import styles from './ChatInput.module.css';

export default function ChatInput({ onSend, disabled, connected = true }) {
  const [value, setValue] = useState('');
  const textareaRef = useAutosizeTextarea(value, 200);

  function handleSubmit() {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={cx(styles.box, disabled && styles.boxDisabled)}>
        <textarea
  ref={textareaRef}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder={connected ? 'Message Echo AI…' : 'Reconnecting to Echo AI…'}
  rows={1}
  disabled={!connected}
  spellCheck={false}
  autoCorrect="off"
  autoCapitalize="off"
  autoComplete="off"
/>
        <button
          className={styles.sendBtn}
          onClick={handleSubmit}
          disabled={disabled || !value.trim() || !connected}
          aria-label="Send message"
        >
          {disabled ? (
            <span className={styles.dots}>
              <span />
              <span />
              <span />
            </span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      <p className={styles.hint}>Enter to send · Shift + Enter for a new line</p>
    </div>
  );
}
