import { spawn } from 'child_process';
import waitOn from 'wait-on';
import electron from 'electron';
import path from 'path';

const resource = 'http://localhost:5176';

console.log(`[Electron Dev] Waiting for ${resource}...`);

waitOn({ resources: [resource], timeout: 30000 }).then(() => {
    console.log('[Electron Dev] Vite is ready, spawning Electron...');
    const app = spawn(electron, ['.', '--no-sandbox'], { stdio: 'inherit' });
    app.on('close', code => process.exit(code));
}).catch(err => {
    console.error('[Electron Dev] Error waiting for Vite:', err);
    process.exit(1);
});
