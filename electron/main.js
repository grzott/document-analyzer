const { app, BrowserWindow } = require("electron");
const path = require("path");

// Determine if we're in development mode without external dependency
const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.ELECTRON_IS_DEV === "true" ||
  !app.isPackaged;

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow loading local files in development
    },
    icon: path.join(__dirname, "../public/favicon.ico"),
    show: false, // Don't show until ready
    title: "Document Analyzer",
  });

  // Load the app
  const startUrl = isDev
    ? process.env.NEXT_DEV_URL || "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on("window-all-closed", () => {
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
