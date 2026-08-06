"""
cleanup.py — Secure temporary file deletion utilities.
Ensures temp files are always deleted after use, even if an error occurs.
"""

import os
import logging

logger = logging.getLogger(__name__)


def safe_delete(filepath: str) -> None:
    """
    Safely delete a file from disk.
    Logs a warning if deletion fails but does NOT raise an exception,
    so it is safe to call inside a `finally` block.
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.debug("Deleted temp file: %s", filepath)
    except OSError as e:
        logger.warning("Could not delete temp file %s: %s", filepath, e)


def safe_delete_many(filepaths: list[str]) -> None:
    """
    Safely delete multiple files from disk.
    Calls safe_delete for each path — errors on individual files do not
    stop the rest from being deleted.
    """
    for filepath in filepaths:
        safe_delete(filepath)
