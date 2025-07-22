# Health & Safety Document Analyzer

A specialized health and safety compliance verification tool powered by AI using Ollama and Llama3.2 model.

## Features

- **11 Health & Safety Questions**: Pre-defined questionnaire covering essential compliance areas
- **Document Upload per Question**: Upload up to 3 PDF/DOCX files per question
- **Additional Context**: Optional text field for specific requirements per question
- **AI-Powered Analysis**: Uses Ollama with Llama3.2 model to verify document compliance
- **Checkbox Confirmation**: Visual feedback showing which questions are confirmed by documentation
- **Analysis Summary**: Clear overview of confirmed vs not confirmed questions
- **Progress Tracking**: Real-time progress during document analysis
- **Results Export**: Download detailed analysis results as text files
- **Responsive Design**: User-friendly interface optimized for compliance workflows

## Health & Safety Questions Covered

1. Do you have a health and safety policy and procedures?
2. Do you have access to competent health and safety advice?
3. Do you provide health and safety training to your employees?
4. Do you produce risk assessments and method statements (RAMS)?
5. Do you record and investigate accidents and incidents?
6. Are you aware of your duties under CDM 2015?
7. Do you assess occupational health risks and provide welfare?
8. How do you assess and manage subcontractors?
9. How do you monitor and review your health and safety performance?
10. Do you hold valid and adequate insurance (e.g., Employers' Liability)?
11. Can you provide examples of your health and safety documentation?

## Prerequisites

### For End Users

- **Ollama** installed and running locally
- **Llama3.2 model** downloaded via Ollama
- **Windows 10/11** (64-bit)

### For Developers

- **Node.js** (version 18 or higher)
- **Ollama** installed and running locally
- **Llama3.2 model** pulled in Ollama
- **Git** (for cloning the repository)

## Quick Start (For End Users)

If you have received the executable file, follow these simple steps:

### 1. Install Ollama

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

### 2. Install the AI Model

Open Command Prompt (cmd) and run:

```bash
ollama pull llama3.2
```

### 3. Start Ollama

In Command Prompt, run:

```bash
ollama serve
```

Keep this window open while using the application.

### 4. Run the Application

Double-click the `Document Analyzer.exe` file to start the application.

**That's it!** The Health & Safety Document Analyzer is ready to use.

---

## Development Setup (For Developers)

### 1. Install Ollama

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

### 5. Run Application

#### Development Mode

```bash
npm run electron-dev
```

This will start both the Next.js development server and Electron app.

#### Production Build

```bash
npm run build-win
```

This creates a Windows executable in the `dist/` folder.

## Usage

1. **Select Questions**: Review the 11 health & safety questions
2. **Add Context**: Optionally add additional context for specific questions
3. **Upload Documents**: Upload up to 3 PDF/DOCX files per question
4. **Analyze**: Click "Analyze Documents" to start the AI verification process
5. **Monitor Progress**: Watch the real-time progress indicator
6. **View Results**: Review which questions are confirmed by your documentation
7. **Download**: Save the detailed analysis results as a text file

## Troubleshooting

### Common Issues (End Users)

**Application won't start:**

- Make sure Ollama is running (`ollama serve` in Command Prompt)
- Verify the Llama3.2 model is installed (`ollama list` to check)
- Ensure no antivirus is blocking the .exe file

**Analysis fails:**

- Check that Ollama server is running on port 11434
- Restart Ollama: Close Command Prompt and run `ollama serve` again
- Try uploading smaller PDF files first

**Can't upload files:**

- Only PDF and DOCX files are supported
- Maximum 3 files per question
- File size should be reasonable (under 50MB per file)

### Developer Issues

**PDF.js Worker Issues:**

- If you get "Setting up fake worker failed" errors, run: `node scripts/copy-pdf-worker.mjs`
- The PDF.js worker file should be present at `public/pdf.worker.min.js`
- PDF extraction only works in browser environment (client-side)

**Ollama Model Issues:**

- Ensure Ollama is running: `ollama serve`
- Verify model is installed: `ollama list`
- If using a different model, update the model name in the API routes

**Development Issues:**

- Use `npm run electron-dev` instead of `npm run dev` for the full Electron experience
- Make sure ports 3000 and 11434 are available
- Check that all dependencies are installed with `npm install`

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Desktop**: Electron 37
- **PDF Processing**: PDF.js
- **DOCX Processing**: Mammoth.js
- **AI**: Ollama with Llama3.2 model
- **Notifications**: Sonner

## File Structure

```
health-safety-analyzer/
├── electron/           # Electron main process
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── services/      # PDF, DOCX, Ollama services
│   └── lib/           # Utilities
├── public/            # Static assets
└── dist/              # Production builds
```

## License

MIT License - See LICENSE file for details
