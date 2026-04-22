import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal as TerminalIcon, Key, Settings, Trash2 } from 'lucide-react';

export default function GrokTerminal({ theme }) {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { role: 'system', content: 'Empire Local Terminal v2.0.5 initialized...' },
        { role: 'system', content: 'Connection to Grok AI module: STANDBY' },
        { role: 'assistant', content: 'Greetings, Operator. I am Grok. Ready to assist with code, analysis, or system commands.' }
    ]);
    const [apiKey, setApiKey] = useState(localStorage.getItem('grok_api_key') || '');
    const [isSettingsOpen, setIsSettingsOpen] = useState(!localStorage.getItem('grok_api_key'));
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const saveApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('grok_api_key', key);
        setIsSettingsOpen(false);
        setHistory(prev => [...prev, { role: 'system', content: 'API Key updated successfully.' }]);
    };

    const handleCommand = async (cmd) => {
        // Simulated terminal commands
        const validCmd = cmd.trim();
        if (validCmd === 'clear') {
            setHistory([]);
            return;
        }
        if (validCmd === 'help') {
            // Intentionally formatting as an assistant response
            return { role: 'system', content: 'Available commands:\n- clear: Clear terminal\n- status: System status\n- help: Show this menu\n- Any other text will be sent to Grok AI.' };
        }
        if (validCmd === 'status') {
            return { role: 'system', content: 'SYSTEM STATUS: NOMINAL\nUPTIME: 420h 69m\nCPU: 12% | MEM: 34%\nGROK LINK: ACTIVE' };
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setHistory(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Check for local commands first
        const localResponse = await handleCommand(input);
        if (localResponse) {
            setHistory(prev => [...prev, localResponse]);
            setIsLoading(false);
            return;
        }

        if (!apiKey) {
            setHistory(prev => [...prev, { role: 'system', content: 'ERROR: API Key missing. Please configure via settings.' }]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are Grok, an AI assistant integrated into the 'Empire 2025' dashboard. You are helpful, technical, and slightly witty. You prefer markdown responses." },
                        ...history.filter(h => h.role !== 'system').map(h => ({ role: h.role, content: h.content })),
                        userMsg
                    ],
                    model: "grok-beta",
                    stream: false,
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'Unknown API Error');
            }

            const botMsg = data.choices?.[0]?.message || { role: 'assistant', content: 'No response from Grok.' };
            setHistory(prev => [...prev, botMsg]);

        } catch (error) {
            setHistory(prev => [...prev, { role: 'system', content: `CONNECTION ERROR: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl overflow-hidden font-mono shadow-2xl relative group">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold tracking-widest text-emerald-100/70">GROK_TERMINAL_V1</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setHistory([])}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-red-400"
                        title="Clear Terminal"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${isSettingsOpen ? 'text-emerald-400 bg-white/10' : 'text-white/50'}`}
                        title="Settings"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Main Terminal Output */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent"
            >
                {isSettingsOpen && (
                    <div className="mb-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                            <Key className="w-3 h-3" /> CONFIGURATION
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter x.ai API Key (starts with xai-...)"
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                            />
                            <button
                                onClick={() => saveApiKey(apiKey)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                SAVE
                            </button>
                        </div>
                    </div>
                )}

                {history.map((msg, idx) => (
                    <div key={idx} className={`text-sm break-words ${msg.role === 'user' ? 'text-white text-right' :
                            msg.role === 'system' ? 'text-yellow-500/80 italic' :
                                'text-emerald-400'
                        }`}>
                        <span className="opacity-50 text-[10px] uppercase mr-2 block mb-0.5">
                            [{msg.role === 'user' ? 'OPR' : msg.role === 'system' ? 'SYS' : 'GRK'}]
                        </span>
                        <div className={`inline-block px-3 py-2 rounded-lg max-w-[90%] ${msg.role === 'user' ? 'bg-white/10 rounded-tr-none' :
                                msg.role === 'system' ? '' :
                                    'bg-emerald-950/30 border border-emerald-500/10 rounded-tl-none'
                            }`}>
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i} className="min-h-[1em]">{line}</p>
                            ))}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="text-emerald-500/50 text-xs animate-pulse">
                        &gt; PROCESSING DATA STREAM...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-black/20 border-t border-white/5 flex gap-2">
                <div className="text-emerald-500 py-2 select-none">&gt;</div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter command or chat..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder-white/20"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-white/5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>

            {/* CRT Scanline Effect Overlay (Optional, for aesthetics) */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%] opacity-20"></div>
        </div>
    );
}
