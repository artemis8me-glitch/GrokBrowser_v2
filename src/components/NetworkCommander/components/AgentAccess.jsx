import React, { useState, useEffect, useRef } from 'react';
import { Bot, Code, Terminal, Activity, Wifi, Shield, Server, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const AGENTS = [
    { id: 'ag-01', name: 'Scout-Alpha', role: 'Reconnaissance', status: 'active', color: 'text-green-400' },
    { id: 'ag-02', name: 'Miner-04', role: 'Resource Extraction', status: 'idle', color: 'text-yellow-400' },
    { id: 'ag-03', name: 'DeepSeeker', role: 'Pattern Analysis', status: 'active', color: 'text-blue-400' },
    { id: 'ag-04', name: 'Echo-One', role: 'Communications', status: 'offline', color: 'text-gray-500' }
];

const LOG_MESSAGES = [
    "Scanning remote host 192.168.1.x...",
    "Vulnerability detected in sector 7.",
    "Packet intercepted: 4kb encrypted payload.",
    "Updating local node registry.",
    "Handshake complete. Tunnel established.",
    "Idle. Waiting for directives.",
    "Ping latency: 12ms.",
    "Syncing with S.W.A.M. network..."
];

export default function AgentAccess() {
    const [agents, setAgents] = useState(AGENTS);
    const [logs, setLogs] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const scrollRef = useRef(null);

    // Simulate Agent Activity
    useEffect(() => {
        const interval = setInterval(() => {
            const randomAgent = agents[Math.floor(Math.random() * agents.length)];
            if (randomAgent.status === 'offline') return;

            const message = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
            const newLog = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                agent: randomAgent.name,
                message: message
            };

            setLogs(prev => [...prev.slice(-15), newLog]);
        }, 2000);

        return () => clearInterval(interval);
    }, [agents]);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const toggleAgentStatus = (id) => {
        setAgents(prev => prev.map(a =>
            a.id === id ? { ...a, status: a.status === 'active' ? 'idle' : 'active' } : a
        ));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Column: Agent Registry */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-blue-400 animate-pulse" /> Active Network Agents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-3">
                        {agents.map(agent => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={`p-3 rounded border cursor-pointer transition-all ${selectedAgent?.id === agent.id
                                        ? 'bg-blue-900/30 border-blue-500/50'
                                        : 'bg-black/40 border-gray-800 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Bot size={18} className={agent.color} />
                                        <span className={`font-bold text-sm ${agent.color}`}>{agent.name}</span>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' :
                                            agent.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-600'
                                        }`} />
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                                    <span>{agent.role}</span>
                                    <span className="uppercase">{agent.status}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Live Feed & Control */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
                {/* Agent Activity Terminal */}
                <Card className="flex-1 flex flex-col min-h-0 bg-black/80 border-gray-800">
                    <CardHeader className="bg-gray-900/50 border-b border-gray-800 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-sm text-gray-300">
                                <Terminal className="w-4 h-4 text-green-500" />
                                {selectedAgent ? `TERMINAL://${selectedAgent.name.toUpperCase()}` : 'GLOBAL_EVENT_BUS'}
                            </CardTitle>
                            <div className="flex gap-2 text-[10px] text-gray-500 uppercase">
                                <span>Encrypted: AES-256</span>
                                <span>Link: Stable</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2" ref={scrollRef}>
                            {logs.length === 0 && <span className="text-gray-600">Initializing stream...</span>}
                            {logs.filter(l => !selectedAgent || l.agent === selectedAgent.name).map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in fade-in duration-200">
                                    <span className="text-gray-600 text-xs w-20 shrink-0">{log.timestamp}</span>
                                    <span className={`text-xs font-bold w-24 shrink-0 ${agents.find(a => a.name === log.agent)?.color}`}>
                                        @{log.agent}
                                    </span>
                                    <span className="text-gray-300">{log.message}</span>
                                </div>
                            ))}
                        </div>
                        {selectedAgent && (
                            <div className="p-3 border-t border-gray-800 bg-gray-900/30 flex gap-2">
                                <button
                                    onClick={() => toggleAgentStatus(selectedAgent.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 border ${selectedAgent.status === 'active'
                                            ? 'bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40'
                                            : 'bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-900/40'
                                        }`}
                                >
                                    {selectedAgent.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                                    {selectedAgent.status === 'active' ? 'PAUSE AGENT' : 'ACTIVATE AGENT'}
                                </button>
                                <div className="bg-gray-800 px-3 py-1.5 rounded text-xs text-gray-400 flex items-center gap-2 border border-gray-700">
                                    <Shield size={12} /> Security Level: 4
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* API Quick Reference (Retained but compressed) */}
                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded">
                            <Code size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-200">External API Gateway</h4>
                            <p className="text-xs text-gray-500">http://localhost:5260/api/v1/agents</p>
                        </div>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded border border-blue-500/30 transition-colors">
                        View API Docs
                    </button>
                </div>
            </div>
        </div>
    );
}
