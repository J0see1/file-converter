/**
 * ConversionPage.tsx — Upload + convert page.
 * Features:
 *  - Drag-and-drop / click-to-browse PDF upload
 *  - Animated upload progress bar when file is selected
 *  - Delete button always visible after file is loaded
 *  - Calls conversion API and triggers download on success
 *  - Convert button hidden once done (success banner handles download)
 */

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import {
  convertPdfToWord,
  convertPdfToImage,
  downloadBlob,
  buildOutputFilename,
  type ImageFormat,
} from '../services/api';

interface ConversionPageProps {
  type: 'word' | 'image';
  backendOnline: boolean;
}

type Status = 'idle' | 'uploading' | 'ready' | 'converting' | 'done' | 'error';

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ConversionPage({ type, backendOnline }: ConversionPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef   = useRef<number | null>(null);

  const [file, setFile]             = useState<File | null>(null);
  const [dragging, setDragging]     = useState(false);
  const [imgFormat, setImgFormat]   = useState<ImageFormat>('png');
  const [status, setStatus]         = useState<Status>('idle');
  const [uploadPct, setUploadPct]   = useState(0);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputName, setOutputName] = useState('');

  // Animate upload progress bar when a new file is set
  useEffect(() => {
    if (!file) { setUploadPct(0); return; }

    setUploadPct(0);
    setStatus('uploading');

    const DURATION = 700;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setUploadPct(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setStatus('ready');
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [file]);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const picked = list[0];
    if (!picked.name.toLowerCase().endsWith('.pdf') && picked.type !== 'application/pdf') return;
    setFile(picked);
    setResultBlob(null);
    setErrorMsg(null);
  }

  function onDragOver(e: DragEvent)  { e.preventDefault(); setDragging(true); }
  function onDragLeave(e: DragEvent) { e.preventDefault(); setDragging(false); }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }
  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = '';
  }
  function openPicker() { inputRef.current?.click(); }

  function clearFile() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFile(null);
    setUploadPct(0);
    setStatus('idle');
    setResultBlob(null);
    setErrorMsg(null);
  }

  async function handleConvert() {
    if (!file || !backendOnline) return;
    setStatus('converting');
    setErrorMsg(null);
    try {
      const blob =
        type === 'word'
          ? await convertPdfToWord(file)
          : await convertPdfToImage(file, imgFormat);
      const name = buildOutputFilename(file.name, type, imgFormat);
      setResultBlob(blob);
      setOutputName(name);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed.');
      setStatus('error');
    }
  }

  function handleDownload() {
    if (resultBlob && outputName) downloadBlob(resultBlob, outputName);
  }

  const isUploading  = status === 'uploading';
  const isConverting = status === 'converting';
  const isDone       = status === 'done';

  return (
    <div className="conv-page-content">

      {/* Image format selector — only for image type */}
      {type === 'image' && (
        <div className="xp-format-row">
          <span className="xp-format-label">Format:</span>
          {(['png', 'jpeg', 'webp'] as ImageFormat[]).map((f) => (
            <button
              key={f}
              id={`fmt-${f}`}
              className={`xp-format-btn ${imgFormat === f ? 'active' : ''}`}
              onClick={() => setImgFormat(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      <div
        id="conv-dropzone"
        className={`conv-dropzone${dragging ? ' dragging' : ''}`}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Drop PDF file here or click to browse"
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
        <p className="conv-drop-title">Drag and Drop Your Files</p>
        <p className="conv-drop-sub">Max File Size: 100 MB</p>
      </div>

      {/* File item */}
      {file && (
        <div className="conv-files-section">
          <p className="conv-files-label">Files:</p>
          <div className="conv-file-item">
            <div className="conv-file-thumb" aria-hidden="true" />
            <div className="conv-file-details">
              <p className="conv-file-name">{file.name}</p>
              <p className="conv-file-size">{formatSize(file.size)}</p>
              <div
                className="conv-file-track"
                role="progressbar"
                aria-valuenow={Math.round(uploadPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`conv-file-fill${isDone ? ' done' : ''}`}
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
            {!isConverting && (
              <button
                className="conv-file-delete"
                onClick={clearFile}
                aria-label="Remove file"
                title="Remove file"
              >
                🗑
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error banner */}
      {status === 'error' && errorMsg && (
        <div className="xp-error">
          <span aria-hidden="true">⚠</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success banner */}
      {isDone && (
        <div className="conv-success">
          <span>✓ Conversion complete!</span>
          <button
            id="btn-download"
            className="xp-btn xp-btn-primary"
            onClick={handleDownload}
          >
            Download {outputName}
          </button>
        </div>
      )}

      {/* Convert button — hidden once done */}
      {!isDone && (
        <button
          id="btn-convert"
          className="conv-convert-btn"
          onClick={handleConvert}
          disabled={!file || isUploading || isConverting || !backendOnline}
        >
          {isConverting ? 'Converting...' : 'Convert File'}
        </button>
      )}

    </div>
  );
}
