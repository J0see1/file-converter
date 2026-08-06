/**
 * ConvertOptions.tsx — Conversion type and format selector.
 * Step 1: Choose "Word Document" or "Images"
 * Step 2 (if Images): Choose PNG / JPEG / WebP
 */

import { type ConversionType, type ImageFormat } from '../services/api';

interface ConvertOptionsProps {
  type: ConversionType;
  format: ImageFormat;
  onTypeChange: (type: ConversionType) => void;
  onFormatChange: (format: ImageFormat) => void;
}

const CONVERSION_TABS: { id: ConversionType; emoji: string; label: string; sub: string }[] = [
  { id: 'word',  emoji: '📝', label: 'Word Document', sub: '.docx' },
  { id: 'image', emoji: '🖼️', label: 'Images',        sub: 'ZIP archive' },
];

const IMAGE_FORMATS: { id: ImageFormat; label: string }[] = [
  { id: 'png',  label: 'PNG'  },
  { id: 'jpeg', label: 'JPEG' },
  { id: 'webp', label: 'WebP' },
];

export default function ConvertOptions({
  type, format, onTypeChange, onFormatChange,
}: ConvertOptionsProps) {
  return (
    <div className="options-section">
      <span className="options-label">Convert to</span>

      {/* Conversion type selector */}
      <div className="options-tabs" role="radiogroup" aria-label="Conversion type">
        {CONVERSION_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`option-tab ${type === tab.id ? 'active' : ''}`}
            onClick={() => onTypeChange(tab.id)}
            role="radio"
            aria-checked={type === tab.id}
          >
            <span className="option-tab-emoji">{tab.emoji}</span>
            <span className="option-tab-label">{tab.label}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              {tab.sub}
            </span>
          </button>
        ))}
      </div>

      {/* Image format sub-selector — only visible when "Images" is selected */}
      {type === 'image' && (
        <div>
          <span className="options-label" style={{ marginBottom: 8, display: 'block' }}>
            Image format
          </span>
          <div className="format-row" role="radiogroup" aria-label="Image format">
            {IMAGE_FORMATS.map((f) => (
              <button
                key={f.id}
                id={`format-${f.id}`}
                className={`format-chip ${format === f.id ? 'active' : ''}`}
                onClick={() => onFormatChange(f.id)}
                role="radio"
                aria-checked={format === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
