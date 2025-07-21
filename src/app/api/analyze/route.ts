import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Create a detailed analysis prompt
    const analysisPrompt = `
Please analyze the following document and provide a comprehensive summary that includes:

1. Main topic and purpose of the document
2. Key points and findings
3. Important facts, figures, or data mentioned
4. Conclusions or recommendations (if any)
5. Overall assessment and significance

Document content:
${text}

Please provide a structured and detailed analysis:`;

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: analysisPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error("Ollama API error:", {
        status: ollamaResponse.status,
        statusText: ollamaResponse.statusText,
        error: errorText,
      });
      throw new Error(
        `Ollama API responded with status ${ollamaResponse.status}: ${errorText}`
      );
    }

    const data = await ollamaResponse.json();

    if (!data.response) {
      throw new Error("No response from Ollama model");
    }

    return NextResponse.json({ analysis: data.response });
  } catch (error) {
    console.error("Error in analyze API route:", error);

    // Check if it's a connection error to Ollama
    if (error instanceof Error && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Unable to connect to Ollama. Please ensure Ollama is running on localhost:11434",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
