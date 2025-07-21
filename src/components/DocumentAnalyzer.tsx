"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { extractTextFromPDF } from "@/services/pdf-extractor";
import { extractTextFromDOCX } from "@/services/docx-extractor";
import { analyzeDocument } from "@/services/ollama";
import { FileText, Upload, Download, X, AlertCircle } from "lucide-react";

interface FileWithStatus {
  file: File;
  status: "pending" | "extracting" | "analyzing" | "completed" | "error";
  error?: string;
}

interface AnalysisResult {
  filename: string;
  analysis: string;
  timestamp: Date;
}

export default function DocumentAnalyzer() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const fileArray = Array.from(uploadedFiles);

    if (files.length + fileArray.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const validFiles = fileArray.filter((file) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      return (
        fileType === "application/pdf" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".docx")
      );
    });

    if (validFiles.length !== fileArray.length) {
      toast.warning(
        "Some files were skipped. Only PDF and DOCX formats are supported."
      );
    }

    const newFiles: FileWithStatus[] = validFiles.map((file) => ({
      file,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const analyzeFiles = async () => {
    if (files.length === 0) {
      toast.error("Please upload files first");
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    const newResults: AnalysisResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fileWithStatus = files[i];
        const { file } = fileWithStatus;

        // Update file status to extracting
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "extracting" } : f))
        );

        try {
          let text = "";

          // Extract text based on file type
          if (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
          ) {
            text = await extractTextFromPDF(file);
          } else {
            text = await extractTextFromDOCX(file);
          }

          if (!text.trim()) {
            throw new Error("No text content found in document");
          }

          // Update file status to analyzing
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "analyzing" } : f
            )
          );

          // Analyze with Ollama
          const analysis = await analyzeDocument(text);

          newResults.push({
            filename: file.name,
            analysis,
            timestamp: new Date(),
          });

          // Update file status to completed
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "completed" } : f
            )
          );
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "error", error: errorMessage } : f
            )
          );

          toast.error(`Failed to analyze ${file.name}: ${errorMessage}`);
        }

        // Update progress
        setProgress(((i + 1) / files.length) * 100);
      }

      setResults((prev) => [...prev, ...newResults]);

      if (newResults.length > 0) {
        toast.success(
          `Analysis complete! ${newResults.length} document(s) analyzed successfully.`
        );
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze documents");
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) {
      toast.error("No results to download");
      return;
    }

    const resultsText = results
      .map((result) => {
        return (
          `# Analysis Report: ${result.filename}\n` +
          `**Generated:** ${result.timestamp.toLocaleString()}\n\n` +
          `${result.analysis}\n\n` +
          `${"=".repeat(80)}\n\n`
        );
      })
      .join("");

    const blob = new Blob([resultsText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-analysis-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Results downloaded successfully");
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  };

  const getStatusColor = (status: FileWithStatus["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "extracting":
        return "text-blue-500";
      case "analyzing":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: FileWithStatus["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "extracting":
        return "Extracting text...";
      case "analyzing":
        return "Analyzing...";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upload Documents</h2>
          {files.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={analyzing}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={(e) => {
              console.log("File input onChange triggered:", e.target.files);
              handleFileUpload(e.target.files);
            }}
            className="hidden"
            disabled={analyzing}
          />

          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />

          <Button
            variant="outline"
            onClick={() => {
              console.log("Choose Files button clicked");
              fileInputRef.current?.click();
            }}
            disabled={analyzing}
            className="mb-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            Choose Files
          </Button>

          <p className="text-gray-600">or drag and drop PDF/DOCX files here</p>
          <p className="text-sm text-gray-500 mt-2">
            Maximum 10 files • PDF and DOCX formats only
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((fileWithStatus, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-medium">{fileWithStatus.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {Math.round(fileWithStatus.file.size / 1024)} KB
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${getStatusColor(
                        fileWithStatus.status
                      )}`}
                    >
                      {getStatusText(fileWithStatus.status)}
                    </p>
                    {fileWithStatus.error && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fileWithStatus.error}
                      </p>
                    )}
                  </div>
                </div>
                {!analyzing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      <div className="space-y-4">
        <Button
          onClick={analyzeFiles}
          disabled={analyzing || files.length === 0}
          className="w-full"
          size="lg"
        >
          {analyzing ? "Analyzing Documents..." : "Analyze Documents"}
        </Button>

        {analyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analysis Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <Button onClick={downloadResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
          </div>

          <div className="space-y-6">
            {results.map((result, index) => (
              <div
                key={index}
                className="border rounded-lg p-6 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{result.filename}</h3>
                  <span className="text-sm text-gray-500">
                    {result.timestamp.toLocaleString()}
                  </span>
                </div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {result.analysis}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Make sure Ollama is installed and running with the llama2 model
          </li>
          <li>• Upload PDF or DOCX files (maximum 10 files)</li>
          <li>
            • Click &ldquo;Analyze Documents&rdquo; to start the AI analysis
          </li>
          <li>• Download the results when analysis is complete</li>
        </ul>
      </div>
    </div>
  );
}
