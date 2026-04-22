const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
// const chalk = require('chalk'); // Use standard colors if chalk fails install, but we'll try to be fancy

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 8080;
const AGENTS = new Map();

// --- LOG BROADCASTER ---
// Override console.log to stream to connected clients (The "Monitor")
const originalLog = console.log;
console.log = function (...args) {
    originalLog.apply(console, args);
    // Broadcast raw text to any client listening on 'server_logs'
    // This allows the user to see the "Terminal" from their tablet/computer
    io.emit('server_logs', {
        timestamp: new Date().toISOString(),
        message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
    });
};

// --- THE CORE ---
console.clear();
console.log(`
\x1b[36m███████╗███╗   ███╗██████╗ ██╗██████╗ ███████╗
██╔════╝████╗ ████║██╔══██╗██║██╔══██╗██╔════╝
█████╗  ██╔████╔██║██████╔╝██║██████╔╝█████╗  
██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║██╔══██╗██╔══╝  
███████╗██║ ╚═╝ ██║██║     ██║██║  ██║███████╗
╚══════╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝\x1b[0m
`);
console.log(`\x1b[32m[SYSTEM] Antigravity Nexus v1.0 Initialized\x1b[0m`);
console.log(`\x1b[33m[NET] Listening on port ${PORT}\x1b[0m`);

io.on('connection', (socket) => {
    const address = socket.handshake.address;
    console.log(`\x1b[35m[CONN] Incoming uplink from ${address}\x1b[0m`);

    socket.on('register', (data) => {
        const { id, type, name } = data;
        AGENTS.set(socket.id, { id, type, name, status: 'online' });
        console.log(`\x1b[32m[AUTH] Agent Verified: ${name} (${type})\x1b[0m`);
        io.emit('swarm_update', Array.from(AGENTS.values()));
    });

    socket.on('log', (data) => {
        console.log(`\x1b[36m[LOG] ${data.agent}: ${data.message}\x1b[0m`);
        // Broadcast to mission control
        io.emit('feed', data);
    });

    socket.on('disconnect', () => {
        const agent = AGENTS.get(socket.id);
        if (agent) {
            console.log(`\x1b[31m[LOST] Signal lost from ${agent.name}\x1b[0m`);
            AGENTS.delete(socket.id);
            io.emit('swarm_update', Array.from(AGENTS.values()));
        }
    });

    socket.on('command', (cmd) => {
        console.log(`\x1b[33m[CMD] Execution Request: ${cmd}\x1b[0m`);
        // Echo back or execute
        io.emit('feed', { agent: 'CORE', message: `Executing: ${cmd}`, type: 'cmd' });
    });
});

app.get('/', (req, res) => {
    res.send('Antigravity Nexus Online. Status: NOMINAL.');
});

server.listen(PORT, () => {
    console.log(`\x1b[32m[READY] Server Node Active. Waiting for fleet...\x1b[0m`);
});
