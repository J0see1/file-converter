"""
pdf_to_image.py — PDF to Image converter.
Uses PyMuPDF (fitz) to render each PDF page as an image.
PyMuPDF is already a dependency of pdf2docx, so no extra installs needed.
Each page becomes a separate image file, all bundled into a single ZIP archive.
"""

import io
import zipfile
import logging
import fitz  # PyMuPDF
from PIL import Image
from app.config import IMAGE_DPI, SUPPORTED_IMAGE_FORMATS

logger = logging.getLogger(__name__)

# Map output format name to PIL format string and file extension
FORMAT_MAP: dict[str, tuple[str, str]] = {
    "png":  ("PNG",  ".png"),
    "jpeg": ("JPEG", ".jpg"),
    "webp": ("WEBP", ".webp"),
}


def convert(pdf_bytes: bytes, output_format: str) -> bytes:
    """
    Convert every page of a PDF (provided as raw bytes) to images,
    then bundle all images into a ZIP archive returned as raw bytes.

    Args:
        pdf_bytes:      Raw bytes of the input PDF.
        output_format:  One of 'png', 'jpeg', 'webp'.

    Returns:
        Raw bytes of a ZIP file containing one image per PDF page.
        Filenames inside ZIP: page_001.png, page_002.png, etc.

    Raises:
        ValueError:     If output_format is not supported.
        RuntimeError:   If PDF rendering fails.
    """
    output_format = output_format.lower()
    if output_format not in SUPPORTED_IMAGE_FORMATS:
        raise ValueError(
            f"Unsupported format '{output_format}'. "
            f"Choose from: {', '.join(SUPPORTED_IMAGE_FORMATS)}"
        )

    pil_format, extension = FORMAT_MAP[output_format]

    try:
        # Open PDF from bytes — no temp file needed, fitz supports in-memory loading
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        page_count = len(pdf_document)
        logger.info(
            "Starting PDF→Image conversion. Pages: %d, Format: %s, DPI: %d",
            page_count, output_format, IMAGE_DPI,
        )

        # Build ZIP archive in memory — nothing written to disk
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for page_index in range(page_count):
                page = pdf_document.load_page(page_index)

                # Render page to a pixel map at the configured DPI
                matrix = fitz.Matrix(IMAGE_DPI / 72, IMAGE_DPI / 72)  # 72 is PDF base DPI
                pixmap = page.get_pixmap(matrix=matrix, alpha=False)

                # Convert fitz pixmap → PIL Image for format flexibility
                img = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)

                # Save image to an in-memory buffer
                img_buffer = io.BytesIO()
                save_kwargs = {}
                if pil_format == "JPEG":
                    save_kwargs["quality"] = 92
                    save_kwargs["optimize"] = True
                elif pil_format == "WEBP":
                    save_kwargs["quality"] = 90

                img.save(img_buffer, format=pil_format, **save_kwargs)
                img_buffer.seek(0)

                # Add image to ZIP with a zero-padded filename
                filename = f"page_{page_index + 1:03d}{extension}"
                zf.writestr(filename, img_buffer.getvalue())
                logger.debug("Rendered page %d/%d → %s", page_index + 1, page_count, filename)

        pdf_document.close()
        zip_bytes = zip_buffer.getvalue()
        logger.info("PDF→Image conversion complete. ZIP size: %s bytes", len(zip_bytes))
        return zip_bytes

    except fitz.FileDataError as e:
        logger.error("Could not open PDF (possibly corrupted): %s", e)
        raise RuntimeError("The PDF file appears to be corrupted or invalid.") from e
    except Exception as e:
        logger.error("PDF→Image conversion failed: %s", e)
        raise RuntimeError(f"Conversion failed: {e}") from e
