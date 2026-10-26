# 💾 Conversion, Retro Offline File Converter

A 100% offline, privacy-first desktop file converter disguised in a nostalgic Windows XP aesthetic. All conversions happen entirely on your local CPU—zero telemetry, zero cloud uploads, and zero internet connection required.

---

## 🚀 Features

- **🔒 100% Local & Offline**: All processing is strictly local. Sensitive files never leave your machine.
- **📄 PDF to DOCX**: Converts PDF documents into editable Microsoft Word (`.docx`) files with preserved formatting, tables, and layouts.
- **🖼️ PDF to Images**: Extracts and converts PDF pages into high-resolution images (`PNG`, `JPEG`, or `WEBP`) bundled neatly inside a `.zip` archive.
- **🪟 Authentic Windows XP UI**: Fully custom retro styling featuring classic title bars, bevels, taskbars, status indicators, and retro typography.
- **⚡ Native Windows Integration**: Native OS file dialogs for saving converted files directly to your preferred folder.

---

## 🛠️ Technology Stack

This application is built with a **decoupled hybrid desktop architecture**, pairing a modern, responsive web frontend with a fast, self-contained Python conversion engine managed by **Tauri v2**.

## 📐 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Tauri Application                    │
│                                                        │
│  ┌───────────────────────┐   Native IPC    ┌────────┐  │
│  │   React 19 Frontend   │ ──────────────> │ Tauri  │  │
│  │ (WebView2 / Retro UI) │ <────────────── │ (Rust) │  │
│  └──────────┬────────────┘                 └───┬────┘  │
│             │ HTTP (localhost:8000)            │       │
└─────────────┼──────────────────────────────────┼───────┘
              │                                  │ Spawns &
              ▼                                  │ Manages
┌───────────────────────────────────────────┐    │ Lifecycle
│     Python FastAPI Sidecar (.exe)         │ ◄──┘
│                                           │
│  • pdf2docx (Word generation)             │
│  • PyMuPDF (PDF page parsing)             │
│  • Pillow (Image processing)              │
└───────────────────────────────────────────┘
```

---

## 📦 How to Build from Source

### Prerequisites

1. **Node.js** (v18+ recommended) & `npm`
2. **Python** (v3.11+ recommended) with virtual environment
3. **Rust & Cargo** (for Tauri v2 compilation)
4. **Visual Studio C++ Build Tools** (MSVC)

---

### Step 1: Compile the Backend Sidecar

Activate your Python environment and build the sidecar with PyInstaller:

```powershell
# From project root:
.\.venv\Scripts\pyinstaller.exe --onefile `
  --name api-sidecar-x86_64-pc-windows-msvc `
  --distpath .\frontend\src-tauri\bin `
  .\backend\app\main.py
```

> This outputs the compiled backend binary to `frontend/src-tauri/bin/api-sidecar-x86_64-pc-windows-msvc.exe`.

---

### Step 2: Compile the Desktop Application

Make sure no lingering instances of the app are running, then build with Tauri:

```powershell
# Ensure any background test process is stopped:
taskkill /F /IM Conversion.exe /T; taskkill /F /IM api-sidecar-x86_64-pc-windows-msvc.exe /T

# Navigate to frontend and build:
cd frontend
npm run tauri build
```

Once completed, your production installers will be available in:

- **NSIS Setup (.exe)**: `frontend/src-tauri/target/release/bundle/nsis/Conversion_0.1.0_x64-setup.exe`
- **MSI Installer (.msi)**: `frontend/src-tauri/target/release/bundle/msi/Conversion_0.1.0_x64_en-US.msi`

---

## 📥 Download & Installation

### 1. Download

Head over to the **[Releases](../../releases)** page on GitHub and download the latest installer:

- **`Conversion_[version]_x64-setup.exe`**

### 2. Install & Run

1. Run the downloaded `.exe` installer and follow the on-screen prompts.
2. _(Note for Windows Defender / SmartScreen)_: Because this is an open-source application without an expensive enterprise certificate, Windows may show _"Windows protected your PC"_. Simply click **More info** &rarr; **Run anyway**.

---

## 📖 How to Use

1. **Launch**: Open **Conversion** from your Desktop or Start Menu.
2. **Select Mode**:
   - Click **PDF to DOCs** to convert documents into editable Microsoft Word format.
   - Click **PDF to Images** to export pages into PNG, JPEG, or WEBP images.
3. **Upload**: Drag and drop your `.pdf` file into the retro window or click the file area to browse.
4. **Convert**: Click the **Convert** button and watch the progress bar.
5. **Save**: Click **Save File / Download** to choose where to save the converted file on your computer.
