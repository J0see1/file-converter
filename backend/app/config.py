"""
config.py — Central configuration file.
All tuneable constants live here so they are easy to find and change.
"""

# ── File Size Limit ───────────────────────────────────────────────────────────
# Maximum allowed PDF upload size in megabytes.
# Change this single value to adjust the limit across the entire app.
MAX_FILE_SIZE_MB: int = 100
MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024

# ── Server ────────────────────────────────────────────────────────────────────
# Bound to localhost only — the API is never exposed to the network.
HOST: str = "127.0.0.1"
PORT: int = 8000

# ── Image Conversion ──────────────────────────────────────────────────────────
# DPI used when rendering PDF pages to images.
# Higher = sharper but larger file. 150 is a good balance; 300 is print quality.
IMAGE_DPI: int = 150

# Supported output image formats
SUPPORTED_IMAGE_FORMATS: list[str] = ["png", "jpeg", "webp"]
