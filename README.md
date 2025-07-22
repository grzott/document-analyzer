# Health & Safety Document Analyzer

A specialized### 3. Download Llama2 Model

````bash
ollama pull llama2
```h and safety compliance verification tool powered by AI using Ollama and Llama2 model.

## Features

- **11 Health & Safety Questions**: Pre-defined questionnaire covering essential compliance areas
- **Document Upload per Question**: Upload up to 3 PDF/DOCX files per question
- **Additional Context**: Optional text field for specific requirements per question
- **AI-Powered Analysis**: Uses Ollama with Llama2 model to verify document compliance
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

1. **Node.js** (version 18 or higher)
2. **Ollama** installed and running locally
3. **Llama2 model** pulled in Ollama

## Setup Instructions

### PDF.js Worker Issues

- If you get "Setting up fake worker failed" errors, run: `node scripts/copy-pdf-worker.mjs`
- The PDF.js worker file should be present at `public/pdf.worker.min.js`
- PDF extraction only works in browser environment (client-side)

### Development Issues

```bash
curl -fsSL https://ollama.ai/install.sh | sh
````

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
