"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { extractTextFromPDF } from "@/services/pdf-extractor";
import { extractTextFromDOCX } from "@/services/docx-extractor";
import { analyzeDocument } from "@/services/ollama";
import {
  FileText,
  Upload,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface QuestionData {
  id: number;
  question: string;
  additionalPrompt: string;
  files: File[];
  confirmed: boolean;
  analyzed: boolean;
}

interface AnalysisResult {
  questionId: number;
  question: string;
  confirmed: boolean;
  analysis: string;
  timestamp: Date;
}

const HEALTH_SAFETY_QUESTIONS = [
  "Do you have a health and safety policy and procedures?",
  "Do you have access to competent health and safety advice?",
  "Do you provide health and safety training to your employees?",
  "Do you produce risk assessments and method statements (RAMS)?",
  "Do you record and investigate accidents and incidents?",
  "Are you aware of your duties under CDM 2015?",
  "Do you assess occupational health risks and provide welfare?",
  "How do you assess and manage subcontractors?",
  "How do you monitor and review your health and safety performance?",
  "Do you hold valid and adequate insurance (e.g., Employers' Liability)?",
  "Can you provide examples of your health and safety documentation?",
];

export default function DocumentAnalyzer() {
  const [questions, setQuestions] = useState<QuestionData[]>(
    HEALTH_SAFETY_QUESTIONS.map((q, index) => ({
      id: index + 1,
      question: q,
      additionalPrompt: "",
      files: [],
      confirmed: false,
      analyzed: false,
    }))
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileUpload = (
    questionId: number,
    uploadedFiles: FileList | null
  ) => {
    if (!uploadedFiles) return;

    const fileArray = Array.from(uploadedFiles);
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

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newFiles = [...q.files, ...validFiles].slice(0, 3); // Max 3 files per question
          return { ...q, files: newFiles };
        }
        return q;
      })
    );

    if (validFiles.length !== fileArray.length) {
      toast.warning(
        "Some files were skipped. Only PDF and DOCX formats are supported."
      );
    }

    if (validFiles.length > 0) {
      toast.success(
        `${validFiles.length} file(s) added to question ${questionId}`
      );
    }
  };

  const removeFile = (questionId: number, fileIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newFiles = q.files.filter((_, index) => index !== fileIndex);
          return { ...q, files: newFiles };
        }
        return q;
      })
    );
  };

  const updateAdditionalPrompt = (questionId: number, prompt: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return { ...q, additionalPrompt: prompt };
        }
        return q;
      })
    );
  };

  const analyzeQuestions = async () => {
    const questionsWithFiles = questions.filter((q) => q.files.length > 0);

    if (questionsWithFiles.length === 0) {
      toast.error("Please upload files for at least one question");
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    const newResults: AnalysisResult[] = [];
    let processedQuestions = 0;

    try {
      for (const question of questionsWithFiles) {
        // Mark question as being analyzed
        setQuestions((prev) =>
          prev.map((q) => (q.id === question.id ? { ...q, analyzed: true } : q))
        );

        // Extract text from all files for this question
        let combinedText = "";

        for (const file of question.files) {
          try {
            let fileText = "";
            if (
              file.type === "application/pdf" ||
              file.name.toLowerCase().endsWith(".pdf")
            ) {
              fileText = await extractTextFromPDF(file);
            } else {
              fileText = await extractTextFromDOCX(file);
            }
            combinedText += `\n\nDocument: ${file.name}\n${fileText}`;
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            combinedText += `\n\nDocument: ${file.name}\nError: Could not extract text from this document.`;
          }
        }

        // Create analysis prompt
        const analysisPrompt = `
Analyze the following documents to determine if they provide evidence or confirmation for this health and safety question:

Question: "${question.question}"

${
  question.additionalPrompt
    ? `Additional context: ${question.additionalPrompt}`
    : ""
}

Documents to analyze:
${combinedText}

Please provide:
1. YES or NO - Does the documentation confirm this question positively?
2. A detailed explanation of your reasoning
3. Specific evidence found in the documents (if any)
4. Any gaps or missing information

Format your response as:
CONFIRMATION: [YES/NO]
ANALYSIS: [Your detailed analysis]
`;

        // Analyze with Ollama
        const analysis = await analyzeDocument(analysisPrompt);

        // Determine if confirmed based on analysis
        const confirmed = analysis.toLowerCase().includes("confirmation: yes");

        // Update question confirmation status
        setQuestions((prev) =>
          prev.map((q) => (q.id === question.id ? { ...q, confirmed } : q))
        );

        newResults.push({
          questionId: question.id,
          question: question.question,
          confirmed,
          analysis,
          timestamp: new Date(),
        });

        processedQuestions++;
        setProgress((processedQuestions / questionsWithFiles.length) * 100);
      }

      setResults(newResults);
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Error during analysis:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadResults = () => {
    const summary = results
      .map(
        (result) =>
          `Question ${result.questionId}: ${result.question}\nConfirmed: ${
            result.confirmed ? "YES" : "NO"
          }\nAnalysis: ${result.analysis}\n\n---\n\n`
      )
      .join("");

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-safety-analysis-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Results downloaded successfully");
  };

  const totalFilesUploaded = questions.reduce(
    (sum, q) => sum + q.files.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Health & Safety Document Analyzer
        </h1>
        <p className="text-gray-600">
          Upload documents for each question to verify health and safety
          compliance
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  question.confirmed
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300"
                }`}
              >
                {question.confirmed && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {question.id}. {question.question}
                </h3>
              </div>
            </div>

            {/* Additional Prompt */}
            <div className="ml-9">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={question.additionalPrompt}
                onChange={(e) =>
                  updateAdditionalPrompt(question.id, e.target.value)
                }
                placeholder="Add any additional context or specific requirements for this question..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={2}
                disabled={analyzing}
              />
            </div>

            {/* File Upload */}
            <div className="ml-9">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={(el) => {
                    fileInputRefs.current[question.id] = el;
                  }}
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={(e) =>
                    handleFileUpload(question.id, e.target.files)
                  }
                  className="hidden"
                  disabled={analyzing}
                />

                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRefs.current[question.id]?.click()}
                    disabled={analyzing || question.files.length >= 3}
                    className="mb-2"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Documents ({question.files.length}/3)
                  </Button>
                  <p className="text-sm text-gray-500">
                    PDF and DOCX files only • Maximum 3 files per question
                  </p>
                </div>
              </div>

              {/* Uploaded Files */}
              {question.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files:</h4>
                  {question.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      {!analyzing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(question.id, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Section */}
      {totalFilesUploaded > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Analysis</h3>

          {analyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing documents...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={analyzeQuestions}
              disabled={analyzing || totalFilesUploaded === 0}
              className="flex-1"
            >
              {analyzing ? "Analyzing..." : "Analyze Documents"}
            </Button>

            {results.length > 0 && (
              <Button
                variant="outline"
                onClick={downloadResults}
                disabled={analyzing}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Analysis Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Confirmed</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {results.filter((r) => r.confirmed).length}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Not Confirmed</span>
              </div>
              <p className="text-2xl font-bold text-red-800">
                {results.filter((r) => !r.confirmed).length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.questionId} className="border rounded p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      result.confirmed
                        ? "bg-green-500 border-green-500"
                        : "bg-red-500 border-red-500"
                    }`}
                  >
                    {result.confirmed ? (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    ) : (
                      <X className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{result.question}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.confirmed
                        ? "Confirmed by documentation"
                        : "Not confirmed by documentation"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
