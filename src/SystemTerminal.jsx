import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Plus, X, Terminal as TerminalIcon, Copy, ClipboardPaste } from 'lucide-react';
import 'xterm/css/xterm.css';

// Electron IPC
let ipcRenderer;
let electronClipboard;
try {
    if (window.require) {
        const electron = window.require('electron');
        ipcRenderer = electron.ipcRenderer;
        electronClipboard = electron.clipboard;
    }
} catch (e) {
    console.warn("Electron IPC not found. Terminal will not function.");
}

async function readClipboardText() {
    try {
        if (electronClipboard?.readText) return electronClipboard.readText() || '';
    } catch { }
    try {
        if (navigator?.clipboard?.readText) return await navigator.clipboard.readText();
    } catch { }
    return '';
}

async function writeClipboardText(text) {
    try {
        if (electronClipboard?.writeText) {
            electronClipboard.writeText(text);
            return;
        }
    } catch { }
    try {
        if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
    } catch { }
}

// --- Individual Terminal Tab Component ---
function TerminalSession({ id, isActive, onRegister }) {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm.js (Safe Mode)
        const term = new Terminal({
            cursorBlink: true,
            fontFamily: '"Menlo", "Consolas", "Courier New", monospace',
            fontSize: 14,
            theme: {
                background: '#09090b',
                foreground: '#ffffff',
                cursor: '#10b981',
                selectionBackground: 'rgba(16, 185, 129, 0.3)'
            },
            allowTransparency: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);


        // Clipboard shortcuts:
        // - Copy: Ctrl+Shift+C (or Cmd+C)
        // - Paste: Ctrl+Shift+V (or Cmd+V)
        term.attachCustomKeyEventHandler((ev) => {
            const isCopy = (ev.ctrlKey && ev.shiftKey && ev.code === 'KeyC') || (ev.metaKey && ev.code === 'KeyC');
            const isPaste = (ev.ctrlKey && ev.shiftKey && ev.code === 'KeyV') || (ev.metaKey && ev.code === 'KeyV');

            if (isCopy) {
                const selection = term.getSelection();
                if (selection) void writeClipboardText(selection);
                return false;
            }

            if (isPaste) {
                void readClipboardText().then((clip) => {
                    if (!clip) return;
                    if (ipcRenderer && isInitializedRef.current) {
                        ipcRenderer.send('terminal-write', { id, data: clip });
                    }
                });
                return false;
            }

            return true;
        });

        const terminalEl = terminalRef.current;
        const handlePasteEvent = (e) => {
            try {
                const clip = e.clipboardData?.getData('text');
                if (clip && ipcRenderer && isInitializedRef.current) {
                    ipcRenderer.send('terminal-write', { id, data: clip });
                    e.preventDefault();
                }
            } catch { }
        };
        terminalEl?.addEventListener('paste', handlePasteEvent);

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Register with Parent
        onRegister(id, term);

        // Resize Observer
        const resizeObserver = new ResizeObserver(entries => {
            if (!isActive || !ipcRenderer) return;
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    try {
                        fitAddon.fit();
                        if (!isInitializedRef.current) {
                            ipcRenderer.send('terminal-init', { id, cols: term.cols || 80, rows: term.rows || 24 });
                            isInitializedRef.current = true;
                            term.focus();
                        } else {
                            ipcRenderer.send('terminal-resize', { id, cols: term.cols, rows: term.rows });
                        }
                    } catch (e) { console.error(e); }
                }
            }
        });
        resizeObserver.observe(terminalRef.current);

        // Data Listener
        if (ipcRenderer) {
            term.onData(data => {
                if (isInitializedRef.current) ipcRenderer.send('terminal-write', { id, data });
            });
        }

        return () => {
            onRegister(id, null);
            try { terminalRef.current?.removeEventListener('paste', handlePasteEvent); } catch { }
            resizeObserver.disconnect();
            term.dispose();
            if (ipcRenderer && isInitializedRef.current) ipcRenderer.send('terminal-kill', { id });
        };
    }, []);

    // Handle Active State Change (Re-fit when tab becomes visible)
    useEffect(() => {
        if (isActive && fitAddonRef.current && xtermRef.current) {
            // Small delay to allow CSS display:block to take effect
            requestAnimationFrame(() => {
                try {
                    fitAddonRef.current.fit();
                    const term = xtermRef.current;
                    ipcRenderer.send('terminal-resize', {
                        id,
                        cols: term.cols,
                        rows: term.rows
                    });
                    term.focus();
                } catch (e) { }
            });
        }
    }, [isActive, id]);

    return (
        <div
            className={`w-full h-full ${isActive ? 'block' : 'hidden'} bg-black`}
            onClick={() => xtermRef.current?.focus()}
        >
            <div ref={terminalRef} className="w-full h-full ml-1" />
        </div>
    );
}

// --- Main Manager Component ---
export default function SystemTerminal({ id: windowId, browserData, onNavigate }) {
    // Generate a unique prefix based on timestamp to ensure absolutely unique PTY IDs
    // independent of the windowId (which might be reused)
    const [instanceId] = useState(() => `win-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

    // State
    const [tabs, setTabs] = useState([{ id: `${instanceId}-t1`, title: 'Terminal' }]);
    const [activeTabId, setActiveTabId] = useState(`${instanceId}-t1`);

    // Centralized Terminal Refs { "unique-id": xtermInstance }
    const termRefs = useRef({});
    const [terminalLog, setTerminalLog] = useState('');
    const activeTabRef = useRef(activeTabId);

    useEffect(() => {
        activeTabRef.current = activeTabId;
    }, [activeTabId]);

    // Register/Unregister callback for children
    const registerTerm = (tId, termInstance) => {
        if (termInstance) {
            termRefs.current[tId] = termInstance;
        } else {
            delete termRefs.current[tId];
        }
    };

    // Single Global Listener for Data Incoming (Main -> Parent -> Child)
    useEffect(() => {
        if (!ipcRenderer) return;

        const handleIncoming = (event, { id, data }) => {
            // Dispatch to correct terminal
            const term = termRefs.current[id];
            if (term) {
                term.write(data);
                if (id === activeTabRef.current) {
                    setTerminalLog(prev => (prev + data).slice(-4000));
                }
            }
        };

        ipcRenderer.on('terminal-incoming', handleIncoming);
        return () => {
            ipcRenderer.removeListener('terminal-incoming', handleIncoming);
            // Cleanup all PTYs for this window on unmount
            tabs.forEach(t => ipcRenderer.send('terminal-kill', { id: t.id }));
        };
    }, []);

    // AI Integration State
    const [aiInput, setAiInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeAiResponse, setActiveAiResponse] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [visionEnabled, setVisionEnabled] = useState(true);

    // AI Keys - Embedded for "Offline"/Client-Side Usage
    const HARDCODED_XAI_KEY = "";

    // Priority: LocalStorage -> Hardcoded -> Null
    const apiKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('vertex_api_key') || localStorage.getItem('grok_api_key') || HARDCODED_XAI_KEY) : HARDCODED_XAI_KEY;

    const addTab = () => {
        const newId = `${instanceId}-t${Date.now()}`;
        setTabs(prev => [...prev, { id: newId, title: 'Terminal' }]);
        setActiveTabId(newId);
    };

    const closeTab = (e, id) => {
        e.stopPropagation();
        const newTabs = tabs.filter(t => t.id !== id);
        if (newTabs.length === 0) return; // Don't close last tab
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };


    const handleCopy = async () => {
        const term = termRefs.current?.[activeTabRef.current];
        const selection = term?.getSelection?.() || '';
        const fallback = terminalLog || '';
        const textToCopy = selection || fallback;
        if (!textToCopy) return;
        await writeClipboardText(textToCopy);
    };

    const handlePaste = async () => {
        const clip = await readClipboardText();
        if (!clip) return;
        if (!ipcRenderer) return;
        ipcRenderer.send('terminal-write', { id: activeTabRef.current, data: clip });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => setAttachedFile({ name: file.name, content: event.target.result });
        reader.readAsText(file);
    };

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!aiInput.trim() && !attachedFile) return;
        setIsLoading(true);
        setActiveAiResponse(null);
        try {
            let finalContent = `You are a System AI Helper connected to a Linux Terminal.\nUser Query: ${aiInput}\nPROTOCOL:\n1. If command: "$CMD: <command>"\n2. Else answer.\n`;
            if (attachedFile) finalContent += `\n[FILE: ${attachedFile.name}]\n${attachedFile.content}`;
            if (visionEnabled && browserData?.content) {
                finalContent += `\n[BROWSER]\n${browserData.url}\n${browserData.content.substring(0, 1000)}`;
            }
            if (visionEnabled && terminalLog) {
                finalContent += `\n[TERMINAL]\nLast output:\n${terminalLog.slice(-2000)}\n[END TERMINAL]`;
            }

            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    messages: [{ role: "system", content: "Expert Linux Admin AI" }, { role: "user", content: finalContent }],
                    model: "grok-beta", stream: false
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            const reply = data.choices[0].message.content;

            if (reply.includes("$CMD:")) {
                const cmd = reply.split("$CMD:")[1].trim().split('\n')[0];
                setActiveAiResponse(`>> Executing: ${cmd}`);
                ipcRenderer.send('terminal-write', { id: activeTabId, data: cmd + '\r' });
            } else {
                setActiveAiResponse(reply);
            }
        } catch (err) { setActiveAiResponse(`Error: ${err.message}`); }
        finally { setIsLoading(false); setAiInput(''); setAttachedFile(null); }
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950">
            {/* Tab Bar */}
            <div className="h-10 bg-black/40 border-b border-white/5 flex items-center px-2 gap-1 overflow-x-auto shrink-0">
                <div className="text-xs font-bold text-emerald-500 mr-2 flex items-center gap-1 uppercase tracking-wider">
                    <TerminalIcon className="w-4 h-4" /> System
                </div>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`
                            group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer select-none transition-colors
                            ${activeTabId === tab.id ? 'bg-zinc-900 border-t border-x border-white/10 text-white' : 'hover:bg-white/5 text-white/50 hover:text-white/80'}
                        `}
                    >
                        <span>sys-root@empire:~</span>
                        <button
                            onClick={(e) => closeTab(e, tab.id)}
                            className={`opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5 ${tabs.length === 1 ? 'hidden' : ''}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={handleCopy}
                    className="ml-1 p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                    title="Copy (selection or recent output)"
                >
                    <Copy className="w-4 h-4" />
                </button>

                <button
                    onClick={handlePaste}
                    className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                    title="Paste"
                >
                    <ClipboardPaste className="w-4 h-4" />
                </button>

                <button
                    onClick={addTab}
                    className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-emerald-400 transition-colors"
                    title="New terminal tab"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Terminal Area */}
            <div className="flex-1 relative p-2 overflow-hidden bg-black/50">
                {tabs.map(tab => (
                    <TerminalSession
                        key={tab.id}
                        id={tab.id}
                        isActive={tab.id === activeTabId}
                        onRegister={registerTerm}
                    />
                ))}
            </div>

            {/* AI Command Bar Overlay */}
            <div className="bg-zinc-900 border-t border-white/10 p-2">
                {activeAiResponse && (
                    <div className="mb-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-300 font-mono max-h-24 overflow-y-auto">
                        <div className="font-bold mb-1 opacity-50">AI RESPONSE:</div>
                        {activeAiResponse}
                    </div>
                )}

                <form onSubmit={handleAiSubmit} className="flex gap-2 items-center relative">
                    {/* File Attachment Indicator */}
                    {attachedFile && (
                        <div className="absolute -top-10 left-0 bg-zinc-800 text-white text-xs p-1 rounded border border-white/10 flex items-center gap-1">
                            <span className="max-w-[100px] truncate">{attachedFile.name}</span>
                            <button type="button" onClick={() => setAttachedFile(null)}><X className="w-3 h-3" /></button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${attachedFile ? 'text-emerald-400' : 'text-white/50'}`}
                        title="Attach File for AI Analysis"
                    >
                        <Plus className="w-4 h-4" />
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    </button>

                    <input
                        className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500/50 focus:outline-none placeholder-white/20"
                        placeholder="Ask AI to run a command (e.g., 'Check disk usage')..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                    />

                    {browserData?.url && (
                        <button
                            type="button"
                            onClick={() => setVisionEnabled(v => !v)}
                            className={`text-[10px] px-2 py-1 rounded border select-none transition-colors ${visionEnabled
                                ? 'text-blue-400 border-blue-500/40 bg-blue-500/10'
                                : 'text-white/40 border-white/10 bg-black/40'
                                }`}
                            title={
                                visionEnabled
                                    ? 'Vision ON: browser + terminal context sent to AI'
                                    : 'Vision OFF: context not sent'
                            }
                        >
                            VISION
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                        {isLoading ? '...' : <TerminalIcon className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
