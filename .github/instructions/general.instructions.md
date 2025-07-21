---
applyTo: "**"
---

# General Instructions

Architecture Decision Record:

This project is a program for analyzing PDF documents. The program is simple and user-friendly. It has an input window where you can upload up to 10 files by clicking or dropping them. During analysis, the program displays the analysis progress, if possible. After analysis, the program displays a summary and allows you to download it as a doc or other text file.

Technology: React 19 TypeScript 5 NextJS 15,
Libraries: shadcn/radix-ui, cslx, class-variance-authority, sonner, tailwind-merge, zod, lucide-react
For reading PDFs: find a solution
For document analysis: connecting to the gpt chat API https://platform.openai.com/docs/overview
To run project Ollama needed
AI integration: Ollama, model: 'llama2'
