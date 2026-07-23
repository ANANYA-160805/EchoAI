import { cx } from '../../utils/cx';
import styles from './Loader.module.css';

export default function Loader({ size = 'md', label, fullScreen = false }) {
  const content = (
    <div className={cx(styles.wrap, fullScreen && styles.fullScreen)}>
      <span className={cx(styles.rings, styles[size])} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.ring} />
        <span className={styles.core} />
      </span>
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );

  return content;
}
