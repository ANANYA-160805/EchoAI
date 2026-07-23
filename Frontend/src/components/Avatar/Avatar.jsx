import { cx } from '../../utils/cx';
import styles from './Avatar.module.css';

function getInitials(fullName) {
  if (!fullName) return '?';
  const first = fullName.firstName?.[0] || '';
  const last = fullName.lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
}

export default function Avatar({ fullName, size = 'md', isAi = false, className }) {
  if (isAi) {
    return (
      <div className={cx(styles.avatar, styles[size], styles.ai, className)}>
        <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none">
          <circle cx="12" cy="12" r="3.2" fill="currentColor" />
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
          <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.1" opacity="0.3" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cx(styles.avatar, styles[size], styles.user, className)}>
      {getInitials(fullName)}
    </div>
  );
}
