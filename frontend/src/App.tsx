import { useState, useEffect } from 'react';
import bgImage from './assets/background.png';
import HomePage from './components/HomePage';
import ConversionPage from './components/ConversionPage';
import Taskbar from './components/Taskbar';
import { checkHealth } from './services/api';
import './index.css';

type Page = 'home' | 'word' | 'image';

const WINDOW_TITLE: Record<Page, string> = {
  home:  'Home',
  word:  'PDF to DOCs',
  image: 'PDF to Images',
};

const TASKBAR_LABEL: Record<Page, string> = {
  home:  'Home',
  word:  'PDF to DOCs',
  image: 'PDF to Images',
};

export default function App() {
  const [page, setPage]                   = useState<Page>('home');
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const ok = await checkHealth();
      if (!cancelled) setBackendOnline(ok);
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="xp-root">
      <div
        className="xp-desktop"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="xp-window">

          {/* ── Title bar — back arrow lives here on sub-pages ── */}
          <div className="xp-titlebar">
            {page !== 'home' && (
              <button
                className="xp-titlebar-back"
                onClick={() => setPage('home')}
                aria-label="Back to Home"
                title="Back to Home"
              >
                ←
              </button>
            )}
            <span className="xp-title-text">{WINDOW_TITLE[page]}</span>
            <div className="xp-status" role="status">
              <span>{backendOnline ? 'ready' : 'offline'}</span>
              <span
                className={`xp-status-dot ${backendOnline ? 'online' : 'offline'}`}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* ── Page content ── */}
          <div className="xp-content">
            {page === 'home' && (
              <HomePage
                onSelectWord={() => setPage('word')}
                onSelectImage={() => setPage('image')}
              />
            )}
            {(page === 'word' || page === 'image') && (
              <ConversionPage type={page} backendOnline={backendOnline} />
            )}
          </div>

        </div>
      </div>

      <Taskbar activePage={TASKBAR_LABEL[page]} />
    </div>
  );
}
