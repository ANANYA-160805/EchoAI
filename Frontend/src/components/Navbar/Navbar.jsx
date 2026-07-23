import { Link, useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        <span className={styles.brandMark}>
          <span className={styles.ring} />
          <span className={styles.dot} />
        </span>
        Echo AI
      </Link>

      <nav className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
          Log in
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
          Get started
        </Button>
      </nav>
    </header>
  );
}
