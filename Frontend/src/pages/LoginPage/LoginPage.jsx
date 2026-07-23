import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from '../../styles/AuthPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = err?.response?.data?.message || 'Invalid email or password.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleResetRequest(e) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
  }

  function closeForgotModal() {
    setForgotOpen(false);
    setTimeout(() => {
      setResetSent(false);
      setResetEmail('');
    }, 200);
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>
            <span className={styles.ring} />
            <span className={styles.dot} />
          </span>
          Echo AI
        </Link>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue your conversation.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => setForgotOpen(true)}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Log in
          </Button>
        </form>

        <p className={styles.footerText}>
          New to Echo AI? <Link to="/register">Create an account</Link>
        </p>
      </div>

      <Modal open={forgotOpen} onClose={closeForgotModal} title="Reset your password">
        {resetSent ? (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            If an account exists for <strong style={{ color: 'var(--text-primary)' }}>{resetEmail}</strong>,
            you'll receive password reset instructions shortly.
          </p>
        ) : (
          <form onSubmit={handleResetRequest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button type="submit" fullWidth>
              Send reset link
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
