import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from '../../styles/AuthPage.module.css';

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required';
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 6) {
    errors.password = 'Use at least 6 characters';
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      showToast('Account created. Welcome to Echo AI.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
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

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start a conversation that remembers.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <Input
              label="First name"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange('firstName')}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange('lastName')}
              error={errors.lastName}
              autoComplete="family-name"
            />
          </div>

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
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            hint={!errors.password ? 'At least 6 characters' : undefined}
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Create account
          </Button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
