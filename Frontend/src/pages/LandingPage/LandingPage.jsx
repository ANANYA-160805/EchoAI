import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/Button/Button';
import styles from './LandingPage.module.css';

const FEATURES = [
  {
    title: 'Remembers what matters',
    desc: 'Echo AI keeps semantic memory of your conversations, so context carries forward without you repeating yourself.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.1" opacity="0.3" />
      </svg>
    ),
  },
  {
    title: 'Real-time responses',
    desc: 'Built on a live socket connection for instant back-and-forth, with typing indicators so you always know what is happening.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Organized conversations',
    desc: 'Every topic gets its own thread. Jump between chats without ever losing your place.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 9.5h9M7.5 13.5h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Built for developers',
    desc: 'Markdown, syntax-highlighted code blocks, and one-click copy make Echo AI a natural fit for technical work.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="m9 8-4 4 4 4M15 8l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.glow} aria-hidden="true">
          <span className={styles.ripple1} />
          <span className={styles.ripple2} />
          <span className={styles.ripple3} />
        </div>

        <span className={styles.eyebrow}>Now with long-term memory</span>
        <h1 className={styles.heroTitle}>
          Meet <span className={styles.heroAccent}>Echo AI</span>
        </h1>
        <p className={styles.heroSubtitle}>
          A conversation partner that actually keeps up — instant replies, real
          context, and a memory that outlasts the tab you closed yesterday.
        </p>
        <div className={styles.heroActions}>
          <Button size="lg" onClick={() => navigate('/register')}>
            Get started free
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
            Log in
          </Button>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2>Everything you'd expect. A few things you wouldn't.</h2>
        </div>
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div className={styles.card} key={f.title}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.footerMark}>
            <span className={styles.footerRing} />
            <span className={styles.footerDot} />
          </span>
          Echo AI
        </div>
        <p className={styles.footerNote}>Built for conversations that go somewhere.</p>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} Echo AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
