import { forwardRef, useState } from 'react';
import { cx } from '../../utils/cx';
import styles from './Input.module.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.6 6.7C4.4 8.1 3 12 3 12s3.5 7 10 7c1.8 0 3.3-.4 4.5-1.1M9.9 4.2A10.6 10.6 0 0 1 12 4c6.5 0 10 7 10 7-.4.7-1 1.6-1.8 2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );

const Input = forwardRef(
  ({ label, error, type = 'text', className, id, hint, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cx(styles.field, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={cx(styles.wrapper, error && styles.wrapperError)}>
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={styles.input}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          )}
        </div>
        {error && <span className={styles.error}>{error}</span>}
        {!error && hint && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
