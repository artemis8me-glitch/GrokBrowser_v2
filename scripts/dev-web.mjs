import { spawn } from 'child_process';

console.log('[Dev-Web] Starting Vite...');
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

vite.on('close', (code) => {
    console.log(`[Dev-Web] Vite exited with code ${code}`);
    process.exit(code);
});
