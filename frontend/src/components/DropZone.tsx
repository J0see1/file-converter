/**
 * DropZone.tsx — Drag & drop PDF file input.
 * Accepts PDF files via drag-and-drop or click-to-browse.
 * Validates that the selected file is a PDF before calling onChange.
 */

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface DropZoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

/** Format bytes into a human-readable string (KB / MB). */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DropZone({ file, onChange, disabled = false }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;

    const picked = files[0];

    // Client-side type check (extension + MIME type)
    if (!picked.name.toLowerCase().endsWith('.pdf') && picked.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }

    onChange(picked);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Reset input value so the same file can be re-selected after clearing
    e.target.value = '';
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function clearFile(e: React.MouseEvent) {
    e.stopPropagation();
    setError(null);
    onChange(null);
  }

  const zoneClass = [
    'dropzone',
    dragging && !disabled ? 'dragging' : '',
    file ? 'has-file' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="dropzone-wrapper">
      <div
        id="drop-zone"
        className={zoneClass}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="PDF file drop zone"
        onKeyDown={(e) => e.key === 'Enter' && openPicker()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={onInputChange}
          aria-hidden="true"
        />

        <div className="dropzone-icon">
          {file ? '📄' : dragging ? '📂' : '📁'}
        </div>

        {file ? (
          <span className="dropzone-title">File ready to convert</span>
        ) : (
          <span className="dropzone-title">
            {dragging ? 'Drop it here!' : 'Drop your PDF here'}
          </span>
        )}

        <span className="dropzone-sub">
          {file
            ? 'Click to replace with a different file'
            : 'or click to browse your files'}
        </span>

        {!file && (
          <span className="dropzone-badge">PDF only · max 100 MB</span>
        )}
      </div>

      {/* Selected file info strip */}
      {file && (
        <div className="file-info">
          <span className="file-info-icon">📑</span>
          <span className="file-info-name" title={file.name}>{file.name}</span>
          <span className="file-info-size">{formatSize(file.size)}</span>
          <button
            className="file-clear-btn"
            onClick={clearFile}
            aria-label="Remove selected file"
            title="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      {/* Client-side validation error */}
      {error && (
        <div className="error-banner" style={{ marginTop: 12 }}>
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
    </div>
  );
}
