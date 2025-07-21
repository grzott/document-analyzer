import axios from "axios";

export async function analyzeDocument(text: string): Promise<string> {
  try {
    const response = await axios.post("/api/analyze", { text });
    return response.data.analysis;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document");
  }
}
