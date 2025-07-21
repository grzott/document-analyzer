import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy PDF.js worker file to public directory
const sourceFile = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const targetFile = path.join(__dirname, '..', 'public', 'pdf.worker.min.js');

try {
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✓ PDF.js worker file copied to public directory');
  } else {
    console.log('⚠ PDF.js worker source file not found');
  }
} catch (error) {
  console.error('Error copying PDF.js worker:', error.message);
}
