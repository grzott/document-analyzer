import DocumentAnalyzer from "@/components/DocumentAnalyzer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload PDF or DOCX documents and get AI-powered analysis using
            Ollama and Llama3.2 model. Extract insights, summaries, and key
            information from your documents.
          </p>
        </div>
        <DocumentAnalyzer />
      </div>
    </div>
  );
}
