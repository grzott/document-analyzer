# Document Analyzer

A PDF and DOCX document analysis tool powered by AI using Ollama and Llama2 model.

## Features

- Upload and analyze PDF and DOCX files (up to 10 files)
- AI-powered document analysis using Ollama with Llama2 model
- Real-time progress tracking during analysis
- Download analysis results as text files
- Drag and drop file upload interface
- Responsive and user-friendly design

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Ollama** installed and running locally
3. **Llama3.2 model** pulled in Ollama

## Setup Instructions

### PDF.js Worker Issues

- If you get "Setting up fake worker failed" errors, run: `node scripts/copy-pdf-worker.mjs`
- The PDF.js worker file should be present at `public/pdf.worker.min.js`
- PDF extraction only works in browser environment (client-side)

### Development Issues

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Install Llama3.2 Model

```bash
ollama pull llama3.2
```

### 3. Start Ollama Server

```bash
ollama serve
```

The server should be running on `http://localhost:11434`

### 4. Install Project Dependencies

```bash
npm install
```

This will automatically copy the PDF.js worker file to the public directory.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Documents**: Click "Choose Files" or drag and drop PDF/DOCX files into the upload area
2. **Analyze**: Click "Analyze Documents" to start the AI analysis process
3. **Monitor Progress**: Watch the real-time progress indicator as documents are processed
4. **View Results**: Review the detailed analysis results for each document
5. **Download**: Click "Download Results" to save all analyses as a text file

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **PDF Processing**: PDF.js
- **DOCX Processing**: Mammoth.js
- **AI**: Ollama with Llama3.2 model
- **Notifications**: Sonner
