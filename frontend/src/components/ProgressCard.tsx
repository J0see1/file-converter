/**
 * ProgressCard.tsx — Animated progress indicator shown during conversion.
 * Displays a spinner, indeterminate progress bar, and contextual status text.
 */

interface ProgressCardProps {
  type: 'word' | 'image';
}

export default function ProgressCard({ type }: ProgressCardProps) {
  const label = type === 'word' ? 'Word Document' : 'Images';

  return (
    <div className="progress-card" role="status" aria-live="polite">
      <div className="spinner-ring" aria-hidden="true" />

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p className="progress-title">Converting to {label}…</p>
        <p className="progress-sub">
          This may take a moment for large PDFs.
          <br />
          Your file never leaves this machine.
        </p>
      </div>

      <div className="progress-bar-track" aria-hidden="true">
        <div className="progress-bar-fill" />
      </div>
    </div>
  );
}
