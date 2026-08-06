"""
pdf_to_word.py — PDF to Word (.docx) converter.
Uses pdf2docx which produces the best quality PDF→DOCX output available
in open-source Python libraries.
"""

import tempfile
import os
import logging
from pdf2docx import Converter
from app.utils.cleanup import safe_delete_many

logger = logging.getLogger(__name__)


def convert(pdf_bytes: bytes) -> bytes:
    """
    Convert a PDF (provided as raw bytes) to a Word .docx file.

    Process:
      1. Write PDF bytes to a temporary file (pdf2docx requires a file path)
      2. Convert using pdf2docx
      3. Read the resulting .docx back into memory as bytes
      4. Delete both temp files in a `finally` block (guaranteed cleanup)

    Returns the .docx file as raw bytes.
    Raises RuntimeError if conversion fails.
    """
    tmp_pdf_path = None
    tmp_docx_path = None

    try:
        # Write input PDF to a temp file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_pdf:
            tmp_pdf.write(pdf_bytes)
            tmp_pdf_path = tmp_pdf.name

        # Define output temp path (pdf2docx needs a target path)
        tmp_docx_path = tmp_pdf_path.replace(".pdf", ".docx")

        logger.info("Starting PDF→Word conversion. Input: %s bytes", len(pdf_bytes))

        # Run the conversion
        cv = Converter(tmp_pdf_path)
        cv.convert(tmp_docx_path, start=0, end=None)
        cv.close()

        # Read the output back into memory
        with open(tmp_docx_path, "rb") as docx_file:
            docx_bytes = docx_file.read()

        logger.info("PDF→Word conversion complete. Output: %s bytes", len(docx_bytes))
        return docx_bytes

    except Exception as e:
        logger.error("PDF→Word conversion failed: %s", e)
        raise RuntimeError(f"Conversion failed: {e}") from e

    finally:
        # Always clean up temp files, even if an error occurred
        paths_to_delete = [p for p in [tmp_pdf_path, tmp_docx_path] if p is not None]
        safe_delete_many(paths_to_delete)
