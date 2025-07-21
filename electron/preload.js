const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
});

// Simple preload script
window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});
