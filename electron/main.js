const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { fork, execSync } = require('child_process');
const fs = require('fs');

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
  const serverDir = getServerDir();
  const prismaDir = getPrismaDir();
  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  // Create an empty DB file if it doesn't exist so Prisma can work with it
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  // Try to run prisma migrate or push to ensure schema is up to date
  try {
    const prismaCli = path.join(serverDir, 'node_modules', 'prisma', 'build', 'index.js');
    const schemaPath = path.join(prismaDir, 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      execSync(
        `node "${prismaCli}" db push --schema="${schemaPath}" --skip-generate`,
        {
          cwd: serverDir,
          env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
          stdio: 'pipe',
          timeout: 30000,
        },
      );
    }
  } catch (err) {
    console.warn('[db] Migration failed, will try to continue:', err.message);
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverDir = getServerDir();
    const dbPath = getDbPath();

    const env = {
      ...process.env,
      PORT: String(PORT),
      DATABASE_URL: `file:${dbPath}`,
      NODE_ENV: isDev ? 'development' : 'production',
    };

    if (isDev) {
      serverProcess = fork(
        path.join(serverDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
        ['dev', '-p', String(PORT)],
        { cwd: serverDir, stdio: 'pipe', env },
      );
    } else {
      serverProcess = fork(
        path.join(serverDir, 'server.js'),
        [],
        { cwd: serverDir, stdio: 'pipe', env },
      );
    }

    const onData = (data) => {
      const text = data.toString();
      console.log('[server]', text);
      if (text.includes('http://localhost:' + PORT) || text.includes('ready started server') || text.includes('started server')) {
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
    }, 60000);
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
