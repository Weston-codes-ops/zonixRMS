import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {

  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Points safely to your CommonJS preload bridge file
      preload: path.join(__dirname, 'preload.js'), 
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.setZoomFactor(0.9);

  // FORCE ELECTRON TO LOAD VITE'S NETWORK DOMAIN, NOT LOCAL FILES
  mainWindow.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
