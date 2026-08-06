/**
 * App.tsx — Root component. Manages application state and orchestrates all components.
 *
 * State machine:
 *   idle → (file selected) → ready → (convert clicked) → converting
 *   converting → done (success) | error
 *   done / error → idle (reset)
 */

import { useState, useEffect, useCallback } from 'react';
import DropZone from './components/DropZone';
import ConvertOptions from './components/ConvertOptions';
import ProgressCard from './components/ProgressCard';
import OutputPanel from './components/OutputPanel';
import {
  checkHealth,
  convertPdfToWord,
  convertPdfToImage,
  downloadBlob,
  buildOutputFilename,
  type ConversionType,
  type ImageFormat,
} from './services/api';
import './index.css';

type AppState = 'idle' | 'ready' | 'converting' | 'done' | 'error';

export default function App() {
  // ── State ──────────────────────────────────────────────────────
  const [appState, setAppState]       = useState<AppState>('idle');
  const [file, setFile]               = useState<File | null>(null);
  const [convType, setConvType]       = useState<ConversionType>('word');
  const [imgFormat, setImgFormat]     = useState<ImageFormat>('png');
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [resultBlob, setResultBlob]   = useState<Blob | null>(null);
  const [outputName, setOutputName]   = useState<string>('');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // ── Backend health polling ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const online = await checkHealth();
      if (!cancelled) setBackendOnline(online);
    }

    poll(); // immediate first check
    const interval = setInterval(poll, 5000); // re-check every 5 seconds
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ── File selection handler ──────────────────────────────────────
  const handleFileChange = useCallback((picked: File | null) => {
    setFile(picked);
    setErrorMsg(null);
    setResultBlob(null);
    setAppState(picked ? 'ready' : 'idle');
  }, []);

  // ── Reset to initial state ──────────────────────────────────────
  const handleReset = useCallback(() => {
    setFile(null);
    setResultBlob(null);
    setErrorMsg(null);
    setOutputName('');
    setAppState('idle');
  }, []);

  // ── Conversion handler ──────────────────────────────────────────
  async function handleConvert() {
    if (!file || !backendOnline) return;

    setAppState('converting');
    setErrorMsg(null);

    try {
      let blob: Blob;
      if (convType === 'word') {
        blob = await convertPdfToWord(file);
      } else {
        blob = await convertPdfToImage(file, imgFormat);
      }

      const name = buildOutputFilename(file.name, convType, imgFormat);
      setResultBlob(blob);
      setOutputName(name);
      setAppState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
      setAppState('error');
    }
  }

  // ── Download handler ────────────────────────────────────────────
  function handleDownload() {
    if (resultBlob && outputName) {
      downloadBlob(resultBlob, outputName);
    }
  }

  // ── Derived flags ───────────────────────────────────────────────
  const isConverting = appState === 'converting';
  const isDone       = appState === 'done';
  const showOptions  = (appState === 'ready' || appState === 'error') && !!file;
  const canConvert   = !!file && backendOnline && !isConverting;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="app-layout">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon" aria-hidden="true">🔒</div>
          <span className="app-title">SecureConvert</span>
        </div>
        <div className="backend-status" role="status" aria-live="polite">
          <span
            className={`status-dot ${backendOnline ? 'online' : 'offline'}`}
            aria-hidden="true"
          />
          {backendOnline ? 'Engine ready' : 'Engine offline'}
        </div>
      </header>

      {/* ── Backend offline warning ── */}
      {!backendOnline && (
        <div className="error-banner" role="alert">
          <span className="error-icon">⚠️</span>
          <span className="error-text">
            The conversion engine is not running. Please start the backend sidecar and try again.
          </span>
        </div>
      )}

      {/* ── Main conversion card ── */}
      {!isDone && (
        <main className="card" id="main-card">

          {/* Drop Zone */}
          <DropZone
            file={file}
            onChange={handleFileChange}
            disabled={isConverting}
          />

          {/* Conversion options — visible once a file is selected */}
          {showOptions && (
            <ConvertOptions
              type={convType}
              format={imgFormat}
              onTypeChange={setConvType}
              onFormatChange={setImgFormat}
            />
          )}

          {/* Error message from a failed conversion */}
          {appState === 'error' && errorMsg && (
            <div style={{ padding: '0 28px 16px' }}>
              <div className="error-banner">
                <span className="error-icon">❌</span>
                <span className="error-text">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Progress indicator — overlays the card during conversion */}
          {isConverting && <ProgressCard type={convType} />}

          {/* Convert button */}
          {!isConverting && (
            <div className="convert-section">
              <button
                id="btn-convert"
                className="convert-btn"
                onClick={handleConvert}
                disabled={!canConvert}
                aria-label={
                  !backendOnline
                    ? 'Cannot convert — engine is offline'
                    : !file
                    ? 'Select a PDF file first'
                    : `Convert to ${convType === 'word' ? 'Word document' : `${imgFormat.toUpperCase()} images`}`
                }
              >
                {!file
                  ? 'Select a PDF to get started'
                  : `Convert to ${convType === 'word' ? 'Word (.docx)' : `Images (.${imgFormat})`}`}
              </button>
            </div>
          )}
        </main>
      )}

      {/* ── Output panel — replaces main card on success ── */}
      {isDone && (
        <OutputPanel
          filename={outputName}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      )}

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>🔒 Files never leave your machine</span>
        <span className="footer-dot">·</span>
        <span>Processed locally</span>
        <span className="footer-dot">·</span>
        <span>No cloud</span>
      </footer>

    </div>
  );
}
