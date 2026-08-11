/**
 * Taskbar.tsx — Windows XP style taskbar fixed at the bottom of the screen.
 * Reusable: pass `activePage` to show the current window name in the task button.
 */

import windowsLogo from '../assets/windows-logo.png';

interface TaskbarProps {
  /** Label shown on the active window task button (e.g. "Home", "PDF to Word") */
  activePage: string;
}

export default function Taskbar({ activePage }: TaskbarProps) {
  return (
    <div className="xp-taskbar" role="navigation" aria-label="Taskbar">

      {/* ── Start / Menu button ── */}
      <button className="xp-start-btn" aria-label="Menu">
        <img
          src={windowsLogo}
          alt=""
          className="xp-start-logo"
          aria-hidden="true"
        />
        <span>Menu</span>
      </button>

      {/* ── Separator ── */}
      <div className="xp-taskbar-sep" aria-hidden="true" />

      {/* ── Active window task button ── */}
      <button className="xp-task-btn active" aria-current="page">
        <span className="xp-task-thumb" aria-hidden="true" />
        <span>{activePage}</span>
      </button>

    </div>
  );
}
