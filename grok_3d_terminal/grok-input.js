const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:8081');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Grok-3D> '
});

ws.on('open', () => {
    console.log('Connected to Grok 3D Matrix.');
    console.log('Type your prompt to spawn a new node in the matrix.');
    rl.prompt();
});

ws.on('message', (data) => {
    try {
        const msg = JSON.parse(data);
        if (msg.type === 'response') {
            console.log(`\n> GROK: ${msg.text}\n`);
            rl.prompt();
        }
    } catch (e) {
        console.log('Received raw:', data.toString());
    }
});

rl.on('line', (line) => {
    if (line.trim()) {
        ws.send(JSON.stringify({ type: 'prompt', text: line.trim() }));
        console.log(' [Signal Transmitted]');
    }
    rl.prompt();
});

ws.on('error', (err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
});
