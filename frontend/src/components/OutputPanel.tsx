/**
 * OutputPanel.tsx — Success state shown after conversion completes.
 * Displays the output filename, a download button, and a "Convert another" reset button.
 */

interface OutputPanelProps {
  filename: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function OutputPanel({ filename, onDownload, onReset }: OutputPanelProps) {
  return (
    <div className="card output-card" role="region" aria-label="Conversion result">
      {/* Animated success checkmark */}
      <div className="success-icon-ring" aria-hidden="true">✓</div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p className="output-title">Conversion complete!</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Your file is ready to download
        </p>
      </div>

      {/* Output filename badge */}
      <span className="output-filename" title={filename}>
        {filename}
      </span>

      {/* Action buttons */}
      <div className="output-actions">
        <button
          id="btn-download"
          className="btn-download"
          onClick={onDownload}
          aria-label={`Download ${filename}`}
        >
          ↓ Download File
        </button>
        <button
          id="btn-reset"
          className="btn-reset"
          onClick={onReset}
          aria-label="Convert another file"
        >
          Convert another
        </button>
      </div>
    </div>
  );
}
