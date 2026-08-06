/**
 * api.ts — HTTP client for communicating with the Python FastAPI sidecar.
 * All requests go to 127.0.0.1 (localhost only — never leaves the machine).
 */

const BASE_URL = 'http://127.0.0.1:8000';

export type ConversionType = 'word' | 'image';
export type ImageFormat = 'png' | 'jpeg' | 'webp';

/** Check if the backend sidecar is running and ready. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Convert a PDF file to a Word (.docx) document. Returns the result as a Blob. */
export async function convertPdfToWord(file: File): Promise<Blob> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/convert/pdf-to-word`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Conversion failed.' }));
    throw new Error(err.detail ?? 'Conversion failed.');
  }

  return res.blob();
}

/** Convert a PDF file to images (ZIP archive, one image per page). Returns the ZIP as a Blob. */
export async function convertPdfToImage(file: File, format: ImageFormat): Promise<Blob> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/convert/pdf-to-image?format=${format}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Conversion failed.' }));
    throw new Error(err.detail ?? 'Conversion failed.');
  }

  return res.blob();
}

/** Trigger a native file download from a Blob. Works in Tauri's webview. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Build the output filename based on original PDF name and conversion type. */
export function buildOutputFilename(
  originalName: string,
  type: ConversionType,
  format?: ImageFormat,
): string {
  const base = originalName.replace(/\.pdf$/i, '');
  if (type === 'word') return `${base}.docx`;
  return `${base}_images_${format ?? 'png'}.zip`;
}
