import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Avatar from '../Avatar/Avatar';
import { formatTime } from '../../utils/formatDate';
import { cx } from '../../utils/cx';
import styles from './ChatMessage.module.css';

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const language = /language-(\w+)/.exec(className || '')?.[1] || 'text';
  const code = String(children).replace(/\n$/, '');

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{language}</span>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ChatMessage({ role, content, createdAt, variant = 'bubble' }) {
  const isUser = role === 'user';
  const isFlat = variant === 'flat';

  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ children }) {
          return <>{children}</>;
        },
        code({ className, children, ...props }) {
          const codeText = String(children);
          const isBlock = /language-/.test(className || '') || codeText.includes('\n');
          if (!isBlock) {
            return (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        p({ children }) {
          return <p className={styles.paragraph}>{children}</p>;
        },
        ul({ children }) {
          return <ul className={styles.list}>{children}</ul>;
        },
        ol({ children }) {
          return <ol className={styles.list}>{children}</ol>;
        },
        a({ children, href }) {
          return (
            <a href={href} target="_blank" rel="noreferrer" className={styles.link}>
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  if (isFlat) {
    return (
      <div className={styles.flatWrap}>
        <div className={styles.flatContent}>{markdown}</div>
        <span className={styles.flatTimestamp}>{formatTime(createdAt)}</span>
      </div>
    );
  }

  return (
    <div className={cx(styles.row, isUser && styles.rowUser)}>
      <Avatar isAi={!isUser} fullName={null} size="sm" />
      <div className={cx(styles.bubbleCol, isUser && styles.bubbleColUser)}>
        <div className={cx(styles.bubble, isUser ? styles.userBubble : styles.aiBubble)}>
          {markdown}
        </div>
        <span className={styles.timestamp}>{formatTime(createdAt)}</span>
      </div>
    </div>
  );
}
