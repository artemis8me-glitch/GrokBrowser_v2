const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8081');

ws.on('open', () => {
    console.log('Test Client Connected. Sending Ping...');
    ws.send(JSON.stringify({ type: 'prompt', text: 'SYSTEM STATUS CHECK. SHORT RESPONSE.' }));
});

ws.on('message', (data) => {
    // The server logs to stdout, but doesn't necessarily echo back the AI response via WS in my current implementation of grok-3d-terminal.js?
    // Let me check grok-3d-terminal.js code.
    // ... console.log('> GROK: ' + responseText) ...
    // It logs to the SERVER console, not the client.
    // I need to watch the SERVER logs to see the response.
    ws.close();
});
