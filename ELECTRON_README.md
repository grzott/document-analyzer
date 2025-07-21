# Document Analyzer - Desktop Application

A desktop application built with Next.js and Electron for analyzing PDF and DOCX documents using AI.

## Features

- 📄 **PDF Text Extraction**: Extract text from PDF files using PDF.js
- 📝 **DOCX Text Extraction**: Extract text from Word documents using mammoth.js
- 🤖 **AI Analysis**: Analyze documents using Ollama (local AI)
- 🖥️ **Desktop App**: Standalone executable for Windows, macOS, and Linux
- 🌐 **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Prerequisites

- **Node.js** (v18 or higher)
- **Ollama** installed and running locally with the `llama3.2:latest` model

### Installing Ollama

1. Download and install Ollama from [https://ollama.com](https://ollama.com)
2. Install the required model:
   ```bash
   ollama pull llama3.2:latest
   ```
3. Start Ollama (if not already running):
   ```bash
   ollama serve
   ```
4. Verify Ollama is running:

   ```bash
   ollama list
   ```

   You should see `llama3.2:latest` in the list of available models.

## Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running in Development Mode

To run as a web application:

```bash
npm run dev
```

To run as an Electron desktop app:

```bash
npm run electron-dev
```

This will:

- Start the Next.js development server on http://localhost:3000
- Launch the Electron desktop application
- Enable hot reloading for both web and desktop versions

## Building Standalone Executables

### Prerequisites for Building

- All development dependencies installed (`npm install`)
- Ollama running locally during development/testing

### Build Commands

#### Build for Windows (.exe)

```bash
npm run build-win
```

#### Build for macOS (.dmg)

```bash
npm run build-mac
```

#### Build for Linux (AppImage)

```bash
npm run build-linux
```

#### Build for All Platforms

```bash
npm run build-electron
```

### Build Output

Built applications will be saved in the `dist/` directory:

- **Windows**: `dist/win-unpacked/Document Analyzer.exe` (unpacked directory format)
- **macOS**: `dist/Document Analyzer.dmg` (if built on macOS)
- **Linux**: `dist/Document Analyzer.AppImage` (if built on Linux)

**Note**: The current Windows build is configured to create an unpacked directory rather than an installer to avoid code signing requirements. The executable is fully functional and can be distributed as a portable application.

## Quick Start (Production)

If you just want to run the built application:

1. **Ensure Ollama is running**:

   ```bash
   ollama serve
   ```

2. **Navigate to the executable**:

   ```bash
   cd dist/win-unpacked
   ```

3. **Run the application**:
   ```bash
   .\Document\ Analyzer.exe
   ```
   Or simply double-click the file in Windows Explorer.

The application will open as a desktop app with the same interface as the web version, but optimized for desktop use.

## Usage

1. **Launch the Application**

   - Development: Run `npm run electron-dev`
   - Production: Navigate to `dist/win-unpacked/` and double-click `Document Analyzer.exe`

2. **Ensure Ollama is Running**

   - The application requires Ollama to be running locally on port 11434
   - Make sure the `llama3.2:latest` model is available
   - If Ollama isn't running, start it with: `ollama serve`

3. **Upload Documents**

   - Drag and drop PDF or DOCX files into the application
   - Or click "Choose files" to select documents

4. **Analyze Documents**
   - Click "Analyze Documents" to process the uploaded files
   - The AI will extract text and provide analysis

## Architecture

### Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **File Processing**:
  - PDF.js for PDF text extraction
  - mammoth.js for DOCX text extraction

### Backend API

- **Runtime**: Next.js API routes
- **AI Integration**: Ollama API client
- **Model**: llama3.2:latest (3B parameters)

### Desktop Application (Electron)

- **Main Process**: `electron/main.js` with manual development environment detection
- **Renderer**: Next.js web application served locally in production
- **Build Tool**: electron-builder with simplified configuration
- **Architecture**: Multi-process (main + renderer processes visible in Task Manager)
- **Dependencies**: Resolved electron-is-dev dependency issues for packaged builds

## Configuration Files

- `package.json`: Scripts and dependencies for both Next.js and Electron
- `electron-builder.json`: Electron build configuration (currently set to "dir" target for Windows)
- `next.config.ts`: Next.js configuration with PDF.js worker setup
- `electron/main.js`: Electron main process with manual dev environment detection
- `eslint.config.mjs`: ESLint configuration with Next.js and Electron support
- `scripts/copy-pdf-worker.mjs`: Script to copy PDF.js worker file to public directory

## Troubleshooting

### Common Issues

1. **"Ollama connection failed"**

   - Ensure Ollama is installed and running: `ollama serve`
   - Check that `llama3.2:latest` model is available: `ollama list`
   - Verify Ollama is accessible at http://localhost:11434
   - Try testing the connection: `curl http://localhost:11434`

2. **"PDF worker failed to load"**

   - The application uses a local PDF.js worker file
   - This is automatically set up during `npm install` via the postinstall script
   - If issues persist, try running: `npm run postinstall`

3. **Build fails with code signing errors**

   - These warnings can be ignored for development builds
   - The application will still be built successfully in `dist/win-unpacked/`
   - Code signing is disabled in the current configuration

4. **Electron app doesn't start**
   - Ensure all dependencies are installed: `npm install`
   - Check that the Next.js build completed successfully
   - Verify the `electron/main.js` file exists

### Platform-Specific Requirements

#### Windows

- No additional requirements for building unpacked .exe files
- Current configuration creates a portable application in `dist/win-unpacked/`
- Code signing is disabled to avoid permission requirements

#### macOS

- macOS 10.15 or later for building .dmg files
- Xcode Command Line Tools may be required
- Configuration would need to be updated for macOS builds

#### Linux

- Standard build tools (gcc, make) for building AppImage files
- Configuration would need to be updated for Linux builds

### Current Build Status

✅ **Windows**: Fully functional unpacked executable
🔄 **macOS**: Configuration available but untested
🔄 **Linux**: Configuration available but untested

## License

This project is for educational and personal use.

## Support

If you encounter issues:

1. Check that Ollama is running and accessible
2. Verify all dependencies are installed
3. Check the console for detailed error messages
4. Ensure you're using Node.js v18 or higher
