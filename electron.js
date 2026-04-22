import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import net from 'net';

// Needed for node-pty in electron
import pty from 'node-pty';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_PATH = path.join(__dirname, 'venv/bin/python');

// --- Antigravity Engine Integration ---
// The "Levitation Engine" - handles chiral drift and pulses
// Spawn immediately so it runs even if UI fails in headless mode
console.log("[ELECTRON] Spawning Antigravity Engine...");
const antigravity = spawn(PYTHON_PATH, ['antigravity.py', '--seed', 'vertex', '--loop']);

antigravity.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(output);
});

antigravity.stderr.on('data', (data) => {
    console.error(`[ANTIGRAVITY ERR]: ${data}`);
});

antigravity.on('close', (code) => {
    console.log(`[ANTIGRAVITY] process exited with code ${code}`);
});

// --- Shared port helpers ---
const EMPIRE_MACHINE_PORT = 8001;
const HELMSDEEP_API_PORT = 9002;

function isPortOpen(port, host = '127.0.0.1') {
    return new Promise((resolve) => {
        const socket = net.createConnection({ port, host });
        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.once('error', () => {
            resolve(false);
        });
    });
}

async function ensureHelmsdeepApiServer() {
    const host = '127.0.0.1';

    if (await isPortOpen(HELMSDEEP_API_PORT, host)) {
        console.log(`[ELECTRON] Helmsdeep API already running on ${host}:${HELMSDEEP_API_PORT}`);
        return;
    }

    console.log(`[ELECTRON] Spawning Helmsdeep API server on port ${HELMSDEEP_API_PORT}...`);
    const apiProcess = spawn(PYTHON_PATH, ['api_server.py'], {
        cwd: path.join(__dirname, 'bot_engine'),
        env: { ...process.env, PYTHONUNBUFFERED: '1', EMPIRE_API_PORT: String(HELMSDEEP_API_PORT), PYTHONPATH: __dirname }
    });

    apiProcess.stdout.on('data', (data) => {
        console.log(`[HELMDEEP API]: ${data.toString().trim()}`);
    });

    apiProcess.stderr.on('data', (data) => {
        console.error(`[HELMDEEP API ERR]: ${data.toString().trim()}`);
    });

    apiProcess.on('close', (code) => {
        console.log(`[HELMDEEP API] process exited with code ${code}`);
    });

    const maxAttempts = 40;
    const delayMs = 500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (await isPortOpen(HELMSDEEP_API_PORT, host)) {
            console.log(`[ELECTRON] Helmsdeep API is online at ${host}:${HELMSDEEP_API_PORT}`);
            return;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    console.warn('[ELECTRON] Helmsdeep API did not come online in time. UI will still launch.');
}

// --- Empire Machine (Nexus) Server ---
// Ensures the FastAPI server on localhost:8001 is running before the UI opens.
async function ensureEmpireMachineServer() {
    const host = '127.0.0.1';

    if (await isPortOpen(EMPIRE_MACHINE_PORT, host)) {
        console.log(`[ELECTRON] Empire Machine already running on ${host}:${EMPIRE_MACHINE_PORT}`);
        return;
    }

    console.log(`[ELECTRON] Spawning Empire Machine server on port ${EMPIRE_MACHINE_PORT}...`);
    const nexusProcess = spawn(PYTHON_PATH, ['nexus_server.py'], {
        cwd: path.join(__dirname, 'bot_engine', 'server'),
        env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONPATH: __dirname }
    });

    nexusProcess.stdout.on('data', (data) => {
        console.log(`[EMPIRE MACHINE]: ${data.toString().trim()}`);
    });

    nexusProcess.stderr.on('data', (data) => {
        console.error(`[EMPIRE MACHINE ERR]: ${data.toString().trim()}`);
    });

    nexusProcess.on('close', (code) => {
        console.log(`[EMPIRE MACHINE] process exited with code ${code}`);
    });

    // Wait for the server to start listening on the port
    const maxAttempts = 40;
    const delayMs = 500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (await isPortOpen(EMPIRE_MACHINE_PORT, host)) {
            console.log(`[ELECTRON] Empire Machine server is online at ${host}:${EMPIRE_MACHINE_PORT}`);
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    console.warn('[ELECTRON] Empire Machine server did not come online in time. UI will still launch.');
}

// --- Master Crypto Bot Engine Integration ---
// Spawns the main API server that powers the dashboard
// console.log("[ELECTRON] Spawning Master Crypto Bot Engine...");
// const botEngine = spawn('python3', ['api_server.py'], {
//     cwd: path.join(__dirname, 'bot_engine'),
//     env: { ...process.env, PYTHONUNBUFFERED: '1' }
// });

// botEngine.stdout.on('data', (data) => {
//     console.log(`[BOT ENGINE]: ${data.toString().trim()}`);
// });

// botEngine.stderr.on('data', (data) => {
//     console.error(`[BOT ENGINE ERR]: ${data}`);
// });

// botEngine.on('close', (code) => {
//     console.log(`[BOT ENGINE] process exited with code ${code}`);
// });

// --- Admin Function Server (Streamlit Dashboard) ---
// Launches the "launcher_dashboard.py" which the user refers to as the admin server
// console.log("[ELECTRON] Spawning Admin Function Server (Streamlit)...");
// const adminServer = spawn('python3', ['-m', 'streamlit', 'run', 'launcher_dashboard.py', '--server.port', '8502', '--server.headless', 'true'], {
//     cwd: path.join(__dirname, 'bot_engine'),
//     env: { ...process.env, PYTHONUNBUFFERED: '1' }
// });

// adminServer.stdout.on('data', (data) => {
//     console.log(`[ADMIN SERVER]: ${data.toString().trim()}`);
// });

// adminServer.stderr.on('data', (data) => {
//     // Streamlit outputs to stderr by default
//     const output = data.toString().trim();
//     if (output.includes('http://')) {
//         console.log(`[ADMIN SERVER URL]: ${output}`);
//     } else {
//         console.log(`[ADMIN SERVER]: ${output}`);
//     }
// });

// adminServer.on('close', (code) => {
//     console.log(`[ADMIN SERVER] process exited with code ${code}`);
// });

let mainWindow;
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

function probeViteDevServer(devServerUrl, timeoutMs = 750) {
    return new Promise((resolve) => {
        let url;
        try {
            url = new URL('/@vite/client', devServerUrl);
        } catch (e) {
            resolve(false);
            return;
        }

        const req = http.request(
            {
                method: 'GET',
                hostname: url.hostname,
                port: url.port || 80,
                path: url.pathname,
                timeout: timeoutMs,
            },
            (res) => {
                res.resume();
                resolve(res.statusCode === 200);
            }
        );

        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });

        req.on('error', () => resolve(false));
        req.end();
    });
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        backgroundColor: '#09090b', // zinc-950
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For easier prototyping/local use
            webviewTag: true, // Enable <webview>
        },
    });

    const isDev = !app.isPackaged;
    const distIndexPath = path.join(__dirname, 'dist', 'index.html');
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5176';
    const preferViteDevServer = process.env.USE_VITE_DEV_SERVER === '1';

    if (isDev) {
        let fellBackToFile = false;

        mainWindow.webContents.on('did-fail-load', async () => {
            if (fellBackToFile) return;
            if (!fs.existsSync(distIndexPath)) return;

            fellBackToFile = true;
            try {
                await mainWindow.loadFile(distIndexPath);
            } catch (e) {
                console.error('[ELECTRON] Failed to load dist fallback', e);
            }
        });

        if (preferViteDevServer) {
            const isViteReady = await probeViteDevServer(devServerUrl);
            if (isViteReady) {
                await mainWindow.loadURL(devServerUrl);
            } else if (fs.existsSync(distIndexPath)) {
                fellBackToFile = true;
                await mainWindow.loadFile(distIndexPath);
            } else {
                await mainWindow.loadURL(devServerUrl);
            }
        } else if (fs.existsSync(distIndexPath)) {
            fellBackToFile = true;
            await mainWindow.loadFile(distIndexPath);
        } else {
            const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Empire Terminal</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #0b0b0f; color: #e5e7eb; margin: 0; padding: 24px; }
      code { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 6px; }
      .muted { color: #9ca3af; }
    </style>
  </head>
  <body>
    <h2>UI bundle not found</h2>
    <p class="muted">No <code>dist/index.html</code> yet. Build the UI, then re-run.</p>
    <p>Run: <code>npm run build</code> (or <code>npm run build:watch</code>)</p>
    <p class="muted">Tip: set <code>USE_VITE_DEV_SERVER=1</code> to run off Vite instead.</p>
  </body>
</html>`;
            await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
        }

        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        await mainWindow.loadFile(distIndexPath);
    }

    // --- Terminal PTY Setup ---
    const ptyProcesses = {};

    ipcMain.on('terminal-init', (event, { id, cols, rows }) => {
        // If restarting a specific tab ID, kill old one first
        if (ptyProcesses[id]) {
            try { ptyProcesses[id].kill(); } catch (e) { }
        }

        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: cols || 80,
            rows: rows || 30,
            cwd: process.env.HOME,
            env: process.env
        });

        ptyProcesses[id] = ptyProcess;

        ptyProcess.on('data', function (data) {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('terminal-incoming', { id, data });
            }
        });

        // Clean up on exit
        ptyProcess.on('exit', () => {
            delete ptyProcesses[id];
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('terminal-closed', { id });
            }
        });

        console.log(`PTY spawned: ID ${id} PID ${ptyProcess.pid}`);
    });

    ipcMain.on('terminal-resize', (event, { id, cols, rows }) => {
        if (ptyProcesses[id]) {
            try { ptyProcesses[id].resize(cols, rows); } catch (e) { }
        }
    });

    ipcMain.on('terminal-write', (event, { id, data }) => {
        if (ptyProcesses[id]) {
            ptyProcesses[id].write(data);
        }
    });

    ipcMain.on('terminal-kill', (event, { id }) => {
        if (ptyProcesses[id]) {
            try {
                ptyProcesses[id].kill();
                delete ptyProcesses[id];
            } catch (e) { }
        }
    });

    // --- Configuration IPC ---
    ipcMain.handle('get-config', async () => {
        try {
            const configPath = path.join(__dirname, 'config', 'vertex.json');
            if (fs.existsSync(configPath)) {
                console.log(`[ELECTRON] Loading config from ${configPath}`);
                const data = fs.readFileSync(configPath, 'utf-8');
                return JSON.parse(data);
            } else {
                console.log(`[ELECTRON] No config found at ${configPath}`);
            }
        } catch (e) {
            console.error("[ELECTRON] Failed to load config", e);
        }
        return {};
    });
}

// Disable GPU acceleration to prevent crashes on Linux/VMs
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');

app.whenReady().then(async () => {
    await createWindow();
    void ensureHelmsdeepApiServer();
    void ensureEmpireMachineServer();
});

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
