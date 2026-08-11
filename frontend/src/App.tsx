import { useState, useEffect } from 'react';
import bgImage from './assets/background.png';
import HomePage from './components/HomePage';
import Taskbar from './components/Taskbar';
import { checkHealth } from './services/api';
import './index.css';

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);

  // Poll backend health every 5 s
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
    // xp-root: flex column — desktop fills top, taskbar pinned at bottom
    <div className="xp-root">

      {/* ── Desktop area with pixel-art background ── */}
      <div
        className="xp-desktop"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* XP Window */}
        <div className="xp-window">

          {/* Title bar */}
          <div className="xp-titlebar">
            <span className="xp-title-text">Home</span>
            <div className="xp-status" role="status">
              <span>{backendOnline ? 'ready' : 'offline'}</span>
              <span
                className={`xp-status-dot ${backendOnline ? 'online' : 'offline'}`}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Page content */}
          <div className="xp-content">
            <HomePage
              onSelectWord={() => alert('PDF → Word — coming soon!')}
              onSelectImage={() => alert('PDF → Images — coming soon!')}
            />
          </div>

        </div>
      </div>

      {/* ── Taskbar pinned at the bottom ── */}
      <Taskbar activePage="Home" />

    </div>
  );
}
