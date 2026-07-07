const { app, BrowserWindow, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');
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
  const serverDir = getServerDir();
  const prismaDir = getPrismaDir();
  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  // Create an empty DB file if it doesn't exist so Prisma can work with it
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  // Try to run prisma db push to ensure schema is up to date
  const prismaCli = path.join(serverDir, 'node_modules', 'prisma', 'build', 'index.js');
  const schemaPath = path.join(prismaDir, 'schema.prisma');
  if (!fs.existsSync(prismaCli) || !fs.existsSync(schemaPath)) {
    console.warn('[db] Prisma CLI or schema not found, skipping migration');
    return;
  }
  try {
    require('child_process').execFileSync(
      process.execPath,
      [prismaCli, 'db', 'push', `--schema="${schemaPath}"`, '--skip-generate'],
      {
        cwd: serverDir,
        env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
        stdio: 'pipe',
        timeout: 30000,
      },
    );
  } catch (err) {
    console.warn('[db] Migration failed, will try to continue:', err.message);
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverDir = getServerDir();
    const dbPath = getDbPath();

    process.env.PORT = String(PORT);
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.NODE_ENV = 'production';
    process.chdir(serverDir);

    if (isDev) {
      const nextBin = path.join(serverDir, 'node_modules', 'next', 'dist', 'bin', 'next');
      const { fork } = require('child_process');
      serverProcess = fork(nextBin, ['dev', '-p', String(PORT)], {
        cwd: serverDir,
        stdio: 'pipe',
        env: process.env,
      });
      serverProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        if (text.includes('http://localhost:' + PORT)) resolve();
      });
      serverProcess.stderr?.on('data', (d) => process.stderr.write(d));
      serverProcess.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Dev server exited with code ${code}`));
      });
      serverProcess.on('error', (err) => reject(new Error(`Dev server spawn: ${err.message}`)));
      return;
    }

    // Production: load Next.js standalone server in-process
    try {
      require(path.join(serverDir, 'server.js'));
    } catch (err) {
      reject(new Error(`Failed to load server: ${err.message}`));
      return;
    }

    // Poll until the server is reachable
    const poll = (attempts) => {
      if (attempts <= 0) {
        reject(new Error('Server start timeout'));
        return;
      }
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        req.destroy();
        setTimeout(() => poll(attempts - 1), 1000);
      });
      req.setTimeout(5000, () => { req.destroy(); setTimeout(() => poll(attempts - 1), 1000); });
    };
    poll(30);
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
