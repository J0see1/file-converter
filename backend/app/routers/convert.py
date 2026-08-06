"""
convert.py — Conversion API router.
Defines the HTTP endpoints for PDF conversion:
  POST /convert/pdf-to-word
  POST /convert/pdf-to-image
"""

import logging
from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import Response

from app.utils.validator import validate_pdf
from app.converters import pdf_to_word, pdf_to_image
from app.config import SUPPORTED_IMAGE_FORMATS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/convert", tags=["Conversion"])


@router.post("/pdf-to-word")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    """
    Convert an uploaded PDF to a Word (.docx) file.

    - Validates PDF magic bytes and file size before processing
    - Returns the .docx as a binary file download
    - Temp files are always deleted after the response is sent
    """
    logger.info("Received PDF→Word request. Filename: %s", file.filename)

    # Validate: checks magic bytes + file size
    pdf_bytes = await validate_pdf(file)

    # Convert
    docx_bytes = pdf_to_word.convert(pdf_bytes)

    # Derive a sensible output filename
    original_name = file.filename or "document"
    output_name = original_name.rsplit(".", 1)[0] + ".docx"

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{output_name}"'},
    )


@router.post("/pdf-to-image")
async def convert_pdf_to_image(
    file: UploadFile = File(...),
    format: str = Query(
        default="png",
        description=f"Output image format. Supported: {', '.join(SUPPORTED_IMAGE_FORMATS)}",
    ),
):
    """
    Convert an uploaded PDF to images (one image per page), returned as a ZIP archive.

    - Each page of the PDF becomes a separate image file (e.g. page_001.png)
    - All images are bundled into a single ZIP for download
    - Validates PDF magic bytes and file size before processing
    - Everything processed in memory — no temp files written for image conversion
    """
    logger.info(
        "Received PDF→Image request. Filename: %s, Format: %s",
        file.filename, format,
    )

    # Validate: checks magic bytes + file size
    pdf_bytes = await validate_pdf(file)

    # Convert — raises ValueError for bad format, RuntimeError for bad PDF
    zip_bytes = pdf_to_image.convert(pdf_bytes, output_format=format)

    # Derive a sensible output filename
    original_name = file.filename or "document"
    output_name = original_name.rsplit(".", 1)[0] + f"_images_{format}.zip"

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{output_name}"'},
    )
