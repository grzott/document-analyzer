const { app, BrowserWindow } = require("electron");
const path = require("path");
const fetch = require("node-fetch");

// Determine if we're in development mode without external dependency
const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.ELECTRON_IS_DEV === "true" ||
  (!app.isPackaged && process.env.NODE_ENV !== "production");

let mainWindow;
let staticServer;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Disabled for local file access - acceptable for local content
      preload: path.join(__dirname, "preload.js"),
      sandbox: false, // Keep false to allow file access
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
    icon: path.join(__dirname, "../public/favicon.ico"),
    show: false, // Don't show until ready
    title: "Document Analyzer",
  });

  // Load the app
  const startUrl = isDev
    ? process.env.NEXT_DEV_URL || "http://localhost:3000"
    : "http://localhost:3001";

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open DevTools in development mode only
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Log navigation events for debugging in development only
  if (isDev) {
    mainWindow.webContents.on("did-finish-load", () => {
      console.log("Page finished loading");
    });

    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.error("Failed to load:", errorCode, errorDescription);
      }
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Start local HTTP server for production instead of custom protocol
  if (!isDev) {
    const express = require("express");
    const expressApp = express();
    const port = 3001;

    // Parse JSON bodies
    expressApp.use(express.json());

    // Add the analyze API route
    expressApp.post("/api/analyze", async (req, res) => {
      try {
        const { text } = req.body;

        if (!text || typeof text !== "string") {
          return res.status(400).json({ error: "Text content is required" });
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

        const ollamaResponse = await fetch(
          "http://localhost:11434/api/generate",
          {
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
          }
        );

        if (!ollamaResponse.ok) {
          const errorText = await ollamaResponse.text();
          if (isDev) {
            console.error("Ollama API error:", {
              status: ollamaResponse.status,
              statusText: ollamaResponse.statusText,
              error: errorText,
            });
          }
          throw new Error(
            `Ollama API responded with status ${ollamaResponse.status}: ${errorText}`
          );
        }

        const data = await ollamaResponse.json();

        if (!data.response) {
          throw new Error("No response from Ollama model");
        }

        res.json({ analysis: data.response });
      } catch (error) {
        if (isDev) {
          console.error("Error in analyze API route:", error);
        }

        // Check if it's a connection error to Ollama
        if (error instanceof Error && error.message.includes("fetch")) {
          return res.status(503).json({
            error:
              "Unable to connect to Ollama. Please ensure Ollama is running on localhost:11434",
          });
        }

        res.status(500).json({ error: "Failed to analyze document" });
      }
    });

    // Serve static files from the out directory
    expressApp.use(express.static(path.join(__dirname, "..", "out")));

    staticServer = expressApp.listen(port, "localhost", () => {
      if (isDev) {
        console.log(`Static server running on http://localhost:${port}`);
      }
      createWindow();
    });
  } else {
    createWindow();
  }
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (staticServer) {
    staticServer.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle certificate errors for localhost
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith("http://localhost:")) {
      // Verification logic for localhost
      event.preventDefault();
      callback(true);
    } else {
      // Verification logic for other URLs
      callback(false);
    }
  }
);
