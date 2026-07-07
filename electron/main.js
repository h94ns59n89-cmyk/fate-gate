const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

const isDev = !app.isPackaged;
const PORT = 3456;

let mainWindow = null;
let serverProcess = null;

function getConfigPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'ai-config.json');
}

function readConfig() {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {}
  return { provider: 'DeepSeek', apiKey: '', baseUrl: 'https://api.deepseek.com/v1', model: '' };
}

function writeConfig(config) {
  try {
    const configPath = getConfigPath();
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverDir = isDev
      ? path.join(__dirname, '..')
      : path.join(process.resourcesPath, '.next', 'standalone');

    if (isDev) {
      serverProcess = fork(
        path.join(serverDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
        ['dev', '-p', String(PORT)],
        { cwd: serverDir, stdio: 'pipe' },
      );
    } else {
      process.env.PORT = String(PORT);
      serverProcess = fork(
        path.join(serverDir, 'server.js'),
        [],
        { cwd: serverDir, stdio: 'pipe', env: { ...process.env, PORT: String(PORT) } },
      );
    }

    const onData = (data) => {
      const text = data.toString();
      console.log('[server]', text);
      if (text.includes('http://localhost:' + PORT) || text.includes('ready started server')) {
        cleanup();
        resolve();
      }
    };

    const onError = (data) => {
      const text = data.toString();
      console.error('[server error]', text);
    };

    const onExit = (code) => {
      cleanup();
      if (code !== 0) reject(new Error(`Server exited with code ${code}`));
    };

    const cleanup = () => {
      if (serverProcess) {
        serverProcess.stdout?.removeListener('data', onData);
        serverProcess.stderr?.removeListener('data', onError);
        serverProcess.removeListener('exit', onExit);
      }
    };

    serverProcess.stdout?.on('data', onData);
    serverProcess.stderr?.on('data', onError);
    serverProcess.on('exit', onExit);

    setTimeout(() => {
      cleanup();
      reject(new Error('Server start timeout'));
    }, 30000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    title: '星隅',
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  ipcMain.handle('read-config', () => readConfig());
  ipcMain.handle('write-config', (_event, config) => writeConfig(config));

  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error('Failed to start:', err);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
