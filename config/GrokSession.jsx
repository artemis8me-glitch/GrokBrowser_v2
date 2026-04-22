import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal as TerminalIcon, Key, Settings, Trash2, Cpu } from 'lucide-react';

export default function GrokSession({ initialHistory = [], onExit }) {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { role: 'system', content: 'Empire Local Terminal v2.0.5 initialized...' },
        { role: 'system', content: 'Connection to Grok AI module: ESTABLISHED' },
        { role: 'assistant', content: 'Greetings, Operator. I am Grok. Ready to assist with code, analysis, or system commands.' }
    ]);
    const [apiKey, setApiKey] = useState(localStorage.getItem('grok_api_key') || '');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
        const validCmd = cmd.trim().toLowerCase();
        if (validCmd === 'clear') {
            setHistory([]);
            return true;
        }
        if (validCmd === 'exit') {
            onExit && onExit();
            return true;
        }
        if (validCmd === 'help') {
            setHistory(prev => [...prev, { role: 'system', content: 'Available commands:\n- clear: Clear terminal\n- status: System status\n- help: Show this menu\n- exit: Close session\n- Any other text will be sent to Grok AI.' }]);
            return true;
        }
        if (validCmd === 'status') {
            setHistory(prev => [...prev, { role: 'system', content: 'SYSTEM STATUS: NOMINAL\nUPTIME: 420h 69m\nCPU: 12% | MEM: 34%\nGROK LINK: ACTIVE' }]);
            return true;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setHistory(prev => [...prev, userMsg]);
        setInput('');

        // Handle local commands first
        if (await handleCommand(input)) return;

        setIsLoading(true);

        if (!apiKey) {
            // SIMULATION MODE
            setTimeout(() => {
                setHistory(prev => [...prev, { role: 'assistant', content: `[SIMULATION MODE] I received your query: "${userMsg.content}".\nTo enable real GROK intelligence, please configure your x.ai API Key in settings.` }]);
                setIsLoading(false);
            }, 800);
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
        <div className="flex flex-col h-full bg-black/50 font-mono relative group">

            {/* Toolbar */}
            <div className="absolute top-2 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setHistory([])}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded transition-colors"
                    title="Clear Terminal"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-1.5 bg-slate-800 hover:bg-emerald-500/20 rounded transition-colors ${isSettingsOpen ? 'text-emerald-400' : 'text-slate-400'}`}
                    title="Settings"
                >
                    <Settings className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Output */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
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
                    <div key={idx} className={`text-sm break-words ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <span className={`text-[10px] uppercase mr-2 mb-0.5 inline-block opacity-50 ${msg.role === 'user' ? 'text-slate-400' : 'text-emerald-500'}`}>
                            [{msg.role === 'user' ? 'OPR' : msg.role === 'system' ? 'SYS' : 'GRK'}]
                        </span>
                        <div className={`inline-block px-3 py-2 rounded-lg max-w-[90%] text-left ${msg.role === 'user' ? 'bg-slate-800 text-slate-200 rounded-tr-none' :
                                msg.role === 'system' ? 'text-yellow-500/80 italic' :
                                    'bg-emerald-950/30 border border-emerald-500/10 text-emerald-400 rounded-tl-none'
                            }`}>
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i} className="min-h-[1em]">{line}</p>
                            ))}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="text-emerald-500/50 text-xs animate-pulse flex items-center gap-2">
                        <Cpu className="w-3 h-3 animate-spin" /> PROCESSING DATA STREAM...
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 flex items-center gap-2">
                <span className="text-emerald-500 font-bold">grok@empire:~$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Grok..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 font-mono p-0"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="text-slate-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
