const { app, BrowserWindow, ipcMain, Menu, shell, nativeImage } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

const isDev = !app.isPackaged;
const PORT = 3456;

let mainWindow = null;
let serverProcess = null;

function getConfigPath() {
  return path.join(app.getPath('userData'), 'ai-config.json');
}

function getDbPath() {
  return path.join(app.getPath('userData'), 'fate-gate.db');
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

function getServerDir() {
  if (isDev) return path.join(__dirname, '..');
  return path.join(process.resourcesPath, '.next', 'standalone');
}

function getPrismaDir() {
  if (isDev) return path.join(__dirname, '..', 'prisma');
  return path.join(process.resourcesPath, 'prisma');
}

function setupDatabase() {
  const prismaDir = getPrismaDir();
  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  // If the database already exists and is non-empty, nothing to do
  if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0) {
    return;
  }

  // Copy the pre-built init.db to the target location
  const initDb = path.join(prismaDir, 'init.db');
  if (fs.existsSync(initDb) && fs.statSync(initDb).size > 0) {
    fs.copyFileSync(initDb, dbPath);
    console.log('[db] Initialized from init.db');
  } else {
    console.warn('[db] init.db not found, creating empty database');
    fs.writeFileSync(dbPath, '');
  }
}

function killPort(port) {
  try {
    const stdout = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', timeout: 3000 });
    for (const line of stdout.split('\n')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && /^\d+$/.test(pid)) {
        try { process.kill(parseInt(pid)); } catch {}
      }
    }
  } catch {}
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverDir = getServerDir();
    const dbPath = getDbPath();
    killPort(PORT);

    process.env.PORT = String(PORT);
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.NODE_ENV = 'production';

    // Override env AI keys with saved config (fallback for user-facing AI calls)
    const savedAiConfig = readConfig();
    if (savedAiConfig.apiKey) {
      process.env.DEEPSEEK_API_KEY = savedAiConfig.apiKey;
      if (savedAiConfig.model) process.env.DEEPSEEK_MODEL = savedAiConfig.model;
    }

    const serverScript = isDev
      ? path.join(serverDir, 'node_modules', 'next', 'dist', 'bin', 'next')
      : path.join(serverDir, 'server.js');
    const serverArgs = isDev ? ['dev', '-p', String(PORT)] : [];

    serverProcess = spawn(process.execPath, [serverScript, ...serverArgs], {
      cwd: serverDir,
      stdio: 'pipe',
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    });

    const onData = (data) => {
      const text = data.toString();
      if (text.includes('http://localhost:' + PORT) || text.includes('ready started server') || text.includes('started server')) {
        cleanup();
        resolve();
      }
    };

    const onStderr = (data) => {
      const text = data.toString();
      process.stderr.write('[server] ' + text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, ''));
    };

    const onExit = (code) => {
      cleanup();
      if (code !== 0) reject(new Error(`Server exited with code ${code}`));
    };

    const onError = (err) => {
      cleanup();
      reject(new Error(`Server spawn failed: ${err.message}`));
    };

    const cleanup = () => {
      if (serverProcess) {
        serverProcess.stdout?.removeListener('data', onData);
        serverProcess.stderr?.removeListener('data', onStderr);
        serverProcess.removeListener('exit', onExit);
        serverProcess.removeListener('error', onError);
      }
    };

    serverProcess.stdout?.on('data', onData);
    serverProcess.stderr?.on('data', onStderr);
    serverProcess.on('exit', onExit);
    serverProcess.on('error', onError);

    setTimeout(() => {
      cleanup();
      reject(new Error('Server start timeout'));
    }, 60000);
  });
}

function getIconPath() {
  const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  if (fs.existsSync(icoPath)) return icoPath;
  // Fallback: try resources directory (packaged mode)
  const resIco = path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'favicon.ico');
  if (fs.existsSync(resIco)) return resIco;
  return null;
}

function createWindow() {
  const icon = getIconPath();
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 375,
    minHeight: 600,
    title: '星隅',
    icon: icon,
    ...(icon ? {} : { icon: undefined }),
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
  Menu.setApplicationMenu(null);
  ipcMain.handle('read-config', () => readConfig());
  ipcMain.handle('write-config', (_event, config) => writeConfig(config));

  try {
    setupDatabase();
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
