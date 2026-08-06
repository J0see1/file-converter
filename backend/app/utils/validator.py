"""
validator.py — File validation utilities.
Validates files by inspecting their magic bytes (file signature),
NOT just their file extension, which can be easily spoofed.
"""

from fastapi import HTTPException, UploadFile
from app.config import MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB

# PDF magic bytes: every valid PDF starts with "%PDF-"
PDF_MAGIC_BYTES = b"%PDF-"


async def validate_pdf(file: UploadFile) -> bytes:
    """
    Read and validate an uploaded file as a PDF.

    Checks:
      1. File size does not exceed MAX_FILE_SIZE_BYTES
      2. File content starts with the PDF magic bytes (%PDF-)

    Returns the raw file bytes on success so callers don't need to re-read.
    Raises HTTPException on any validation failure.
    """
    content = await file.read()

    # ── Size check ────────────────────────────────────────────
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB. "
                f"Received: {len(content) / (1024 * 1024):.1f} MB."
            ),
        )

    # ── Magic bytes check ─────────────────────────────────────
    if not content.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid file type. Only valid PDF files are accepted. "
                "The file extension alone is not enough — the file content must be a real PDF."
            ),
        )

    return content
