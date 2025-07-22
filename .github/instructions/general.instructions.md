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

# Specification

## Input Window

11 checkboxes, each with a question. By default, checkboxes are not checked. questions:

1. Do you have a health and safety policy and procedures?
2. Do you have access to competent health and safety advice?
3. Do you provide health and safety training to your employees?
4. Do you produce risk assessments and method statements (RAMS)?
5. Do you record and investigate accidents and incidents?
6. Are you aware of your duties under CDM 2015?
7. Do you assess occupational health risks and provide welfare?
8. How do you assess and manage subcontractors?
9. How do you monitor and review your health and safety performance?
10. Do you hold valid and adequate insurance (e.g., Employers’ Liability)?
11. Can you provide examples of your health and safety documentation?

For each question, you can include:

1. An additional prompt (to be added to the default prompt in the ollamy query)
2. A PDF or docx file(s) confirming the question, if required by the question

Maximum number of documents per question: 3

## Analysis Progress

The analysis should focus on the answers to the questions through the attached documents (whether the document confirms the question).
During the analysis phase, the program should display:

- A progress bar indicating the overall analysis status.
- Real-time updates on the analysis progress for each document.
- Notifications for any errors or issues encountered during analysis.

## Summary Display

Summary, checkboxes - checked if the answer to the question is positive, and the documents confirm the question.

After the analysis is complete, the program should present:

- A summary of the analysis results for each document.
- Options to download the summary in various formats (e.g., PDF, DOCX).
