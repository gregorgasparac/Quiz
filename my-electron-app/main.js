// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const indexPath = path.join('C:/xampp/htdocs/Quiz', 'code', 'login.html');
  console.log("Loading file:", indexPath);
  win.loadFile(indexPath);

  // Open the DevTools.
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow).catch(err => console.error("Error on app ready:", err));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
