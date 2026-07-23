import { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import { cx } from '../../utils/cx';

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function Toast({ type = 'info', children, onClose }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    return () => {};
  }, []);

  function handleClose() {
    setLeaving(true);
    setTimeout(onClose, 200);
  }

  return (
    <div className={cx(styles.toast, styles[type], leaving && styles.leaving)} role="status">
      <span className={styles.icon}>{ICONS[type] || ICONS.info}</span>
      <p className={styles.message}>{children}</p>
      <button className={styles.close} onClick={handleClose} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}
