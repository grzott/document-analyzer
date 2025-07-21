// Client-side PDF text extraction using PDF.js
// Based on Mozilla PDF.js documentation examples

let pdfjs: typeof import("pdfjs-dist") | null = null;

// Dynamically load PDF.js to avoid SSR issues
async function loadPDFJS() {
  if (pdfjs) return pdfjs;

  if (typeof window === "undefined") {
    throw new Error("PDF extraction is only available in the browser");
  }

  pdfjs = await import("pdfjs-dist");

  // Configure worker using local file to avoid CDN issues
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }

  return pdfjs;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Load PDF.js dynamically
    const pdfjsLib = await loadPDFJS();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document using PDF.js
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      // Configure options for better compatibility
      disableFontFace: true,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);

    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text items - using the same approach as the working HTML example
      const pageText = textContent.items
        .map((item: unknown) => {
          // Handle both TextItem and TextMarkedContent types
          if (typeof item === "object" && item !== null && "str" in item) {
            return (item as { str: string }).str || "";
          }
          return "";
        })
        .join(" ");

      // Add page text with clear separation
      if (pageText.trim()) {
        fullText += `Page ${pageNum}:\n${pageText.trim()}\n\n`;
      }

      // Clean up page resources
      if (typeof page.cleanup === "function") {
        page.cleanup();
      }
    }

    // Clean up PDF document
    if (typeof pdf.cleanup === "function") {
      pdf.cleanup();
    }

    return fullText.trim();
  } catch (error) {
    console.error("PDF extraction error:", error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF structure")) {
        throw new Error("The PDF file appears to be corrupted or invalid");
      }
      if (error.message.includes("worker")) {
        throw new Error(
          "PDF worker failed to load. Please ensure the worker file is accessible"
        );
      }
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        throw new Error("Failed to load PDF worker file");
      }
      if (error.message.includes("browser")) {
        throw new Error(
          "PDF extraction is only available in the browser environment"
        );
      }

      throw new Error(`PDF extraction failed: ${error.message}`);
    }

    throw new Error("Failed to extract text from PDF file");
  }
}
