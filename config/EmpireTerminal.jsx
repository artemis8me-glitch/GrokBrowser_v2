import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal, Minimize2, Maximize2, Play, Cpu, Wifi, Shield, Plus, Settings, Type, AlignLeft, Lock, Unlock, Camera, Cast, Trash2, Server, Users, Layers, AlertTriangle, BrainCircuit, Clock, Trophy, Ghost, FileText, Globe, Radio } from 'lucide-react';
import GrokSession from './GrokSession';

const SYSTEM_LOGS = [
  "INITIALIZING EMPIRE_KERNEL v2.5.0...",
  "LOADING NEURAL NETWORKS... [OK]",
  "CONNECTING TO HELMSDEEP MAIN... [OK]",
  "VERIFYING ADMIN CREDENTIALS... [VERIFIED]",
  "MOUNTING FILE SYSTEM... /dev/root -> /",
  "STARTING DAEMONS: [bot_swarm, data_feed, sentinel]",
  "ESTABLISHING SECURE UPLINK... [ENCRYPTED]",
  "AWAITING INPUT..."
];

const COMMANDS = {
  help: "Available commands: status, swarm, clear, whoami, deploy, exit, server, vertex, cloud, grok",
  whoami: "USER: ADMIN_PRIME | CLEARANCE: LEVEL 5 (GOD MODE)",
  status: "SYSTEM OPTIMAL | CPU: 12% | MEM: 4.2GB | SWARM: ACTIVE (85 BOTS)",
  swarm: "SWARM PROTOCOL ENGAGED. TARGETING ALPHA SEEKERS.",
  deploy: "INITIATING DEPLOYMENT SEQUENCE... [SIMULATION]",
  vertex: "CONNECTING TO GOOGLE CLOUD VERTEX AI...",
  cloud: "INITIALIZING GOOGLE CLOUD SDK SHELL...",
  grok: "ESTABLISHING UPLINK TO xAI MAINNET...",
  server: "LAUNCHING SERVER CONFIGURATION PANEL...",
  debugger: "ATTACHING DEBUGGER TO PROCESS 8942...",
  ls: "bin  boot  dev  etc  home  lib  opt  proc  root  sys  tmp  usr  var",
  date: new Date().toString(),
};

export default function EmpireTerminal({ onClose }) {
  // Session State
  const [sessions, setSessions] = useState([
    { id: 1, name: 'TERM-1', history: SYSTEM_LOGS, input: '', loginSession: null, mode: 'standard' }
  ]);
  const [activeSessionId, setActiveSessionId] = useState(1);

  // Server / Auth State
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverStatus, setServerStatus] = useState("STOPPED");
  const [serverLogs, setServerLogs] = useState([]);
  const [serverPort, setServerPort] = useState("8000");
  const [authLoading, setAuthLoading] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [authVideoState, setAuthVideoState] = useState('idle'); // 'idle', 'success', 'fail'

  // Terminal Settings / UI State
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [terminalSettings, setTerminalSettings] = useState({
    fontSize: 12,
    opacity: 95,
    timestamps: false,
    wordWrap: true,
    autoScroll: true
  });
  const [historyIndex, setHistoryIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Refs
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Helper to get active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // --- LOGIC: SERVER HEALTH ---
  const checkServerHealth = async (port) => {
    setServerStatus("CHECKING");
    addServerLog(`> Pinging http://localhost:${port}...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://localhost:${port}/`, {
        signal: controller.signal,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setServerStatus("RUNNING");
        addServerLog(`> Connection established: ${data.status || 'OK'}`);
        addServerLog(`> System: ${data.system || 'Operational'}`);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      setServerStatus("STOPPED");
      addServerLog(`> Connection failed: ${err.message}`);
      addServerLog(`> Ensure api_server.py is running on port ${port}.`);
    }
  };

  const addServerLog = (msg) => {
    setServerLogs(prev => [...prev.slice(-9), msg]); // Keep last 10 logs
  };

  useEffect(() => {
    let interval;
    if (showServerConfig) {
      checkServerHealth(serverPort);
      interval = setInterval(() => checkServerHealth(serverPort), 5000);
    }
    return () => clearInterval(interval);
  }, [showServerConfig, serverPort]);

  // --- LOGIC: UI INTERACTION ---
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (terminalSettings.autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession.history, terminalSettings.autoScroll]);

  useEffect(() => {
    if (!activeSession.loginSession && !showServerConfig && activeSession.mode === 'standard') {
      inputRef.current?.focus();
    }
  }, [activeSessionId, activeSession.loginSession, showServerConfig, activeSession.mode]);

  // --- HANDLERS ---
  const updateSessionHistory = (id, newHistory) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, history: newHistory } : s));
  };

  const updateSessionLogin = (id, loginState) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, loginSession: loginState } : s));
    if (!loginState) {
      setAuthUsername("");
      setAuthPassword("");
    }
  };

  const createNewSession = () => {
    const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
    setSessions([...sessions, { id: newId, name: `TERM-${newId}`, history: ["NEW SESSION INITIALIZED..."], input: '', loginSession: null, mode: 'standard' }]);
    setActiveSessionId(newId);
    setShowServerConfig(false);
  };

  const closeSession = (id) => {
    const remaining = sessions.filter(s => s.id !== id);
    if (remaining.length === 0) {
      onClose();
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[remaining.length - 1].id);
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthUsername("");
      setAuthPassword("");

      const service = activeSession.loginSession?.service;

      if (service === 'GROK_XAI_MAINNET') {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, loginSession: null, mode: 'grok' } : s));
      } else if (service === 'EMPIRE_ADMIN_PROTOCOL') {
        if (authPassword === 'Travelers') {
          // Play Success Video
          setAuthVideoState('success');
        } else {
          // Play Fail Video
          setAuthVideoState('fail');
        }
      } else {
        updateSessionLogin(activeSessionId, null);
        updateSessionHistory(activeSessionId, [...activeSession.history, `AUTHENTICATION SUCCESSFUL. SECURE LINK ESTABLISHED WITH ${service}.`]);
      }
    }, 1500);
  };

  const handleInputChange = (val) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, input: val } : s));
  };

  const handleKeyDown = (e) => {
    // Ctrl+F Search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      const term = prompt("SEARCH PROTOCOL - ENTER KEYWORD:");
      if (term && term.trim()) {
        const matches = activeSession.history.filter(line => line.toLowerCase().includes(term.toLowerCase()));
        updateSessionHistory(activeSessionId, [...activeSession.history, `> SEARCHING FOR: "${term}"...`, ...matches.map(m => `  MATCH: ${m}`), `> END OF SEARCH.`]);
      }
      return;
    }

    // History Navigation
    if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'ArrowUp')) {
      e.preventDefault();
      const userHistory = activeSession.history.filter(line => line.startsWith("root@empire:~$")).map(line => line.replace("root@empire:~$ ", ""));
      if (userHistory.length === 0) return;
      const newIndex = historyIndex === null ? userHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      handleInputChange(userHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const userHistory = activeSession.history.filter(line => line.startsWith("root@empire:~$")).map(line => line.replace("root@empire:~$ ", ""));
      if (userHistory.length === 0) return;
      if (historyIndex === null || historyIndex >= userHistory.length - 1) {
        setHistoryIndex(null);
        handleInputChange("");
      } else {
        const newIndex = Math.min(userHistory.length - 1, historyIndex + 1);
        setHistoryIndex(newIndex);
        handleInputChange(userHistory[newIndex]);
      }
    } else if (e.key === 'Enter') {
      setHistoryIndex(null);
      const cmd = activeSession.input.trim().toLowerCase();
      const newHistory = [...activeSession.history, `root@empire:~$ ${activeSession.input}`];
      let nextLogin = null;

      if (cmd === 'clear') {
        updateSessionHistory(activeSessionId, []);
      } else if (cmd === 'exit') {
        if (sessions.length > 1) closeSession(activeSessionId);
        else onClose();
        return;
      } else if (cmd === 'vertex' || cmd === 'cloud') {
        updateSessionHistory(activeSessionId, newHistory);
        nextLogin = { service: 'GOOGLE_CLOUD_VERTEX_AI', type: 'key' };
        updateSessionLogin(activeSessionId, nextLogin);
      } else if (cmd === 'grok') {
        updateSessionHistory(activeSessionId, newHistory);
        nextLogin = { service: 'GROK_XAI_MAINNET', type: 'user_pass' };
        updateSessionLogin(activeSessionId, nextLogin);
      } else if (cmd === 'server' || cmd === 'server start') {
        updateSessionHistory(activeSessionId, newHistory);
        if (adminUnlocked) {
          setShowServerConfig(true);
        } else {
          nextLogin = { service: 'EMPIRE_ADMIN_PROTOCOL', type: 'passphrase' };
          updateSessionLogin(activeSessionId, nextLogin);
        }
      } else if (COMMANDS[cmd]) {
        updateSessionHistory(activeSessionId, [...newHistory, COMMANDS[cmd]]);
      } else if (cmd === '') {
        updateSessionHistory(activeSessionId, newHistory);
      } else {
        updateSessionHistory(activeSessionId, [...newHistory, `Command not found: ${cmd}. Type 'help'.`]);
      }
      if (!nextLogin) handleInputChange("");
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileName = e.dataTransfer.files[0].name;
      const size = (e.dataTransfer.files[0].size / 1024).toFixed(2);
      updateSessionHistory(activeSessionId, [...activeSession.history, `> UPLOADING FILE: ${fileName} (${size} KB)...`, `> UPLOAD COMPLETE. SAVED TO /tmp/uploads/${fileName}`]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col font-mono text-sm border border-slate-700 bg-[#0a0b14]/95 backdrop-blur-md
                ${isMaximized ? 'inset-0 m-0 rounded-none' : 'bottom-4 right-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]'} animate-in slide-in-from-bottom-10 fade-in`}
      style={isMaximized ? {} : { width: dimensions.width, height: dimensions.height }}
      onContextMenu={handleContextMenu}
    >

      {/* HEADER / TABS */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900 border-b border-slate-800 cursor-move shrink-0"
        onMouseDown={(e) => { /* logic to drag window could go here */ }}
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[70%]">
          <Terminal size={14} className="text-emerald-500 mr-2 shrink-0" />
          {sessions.map(s => (
            <div key={s.id}
              onClick={() => { setActiveSessionId(s.id); setShowServerConfig(false); }}
              className={`flex items-center gap-2 px-3 py-1 rounded-t-lg text-[10px] cursor-pointer transition-colors whitespace-nowrap
                             ${activeSessionId === s.id && !showServerConfig ? 'bg-slate-800 text-emerald-400 font-bold border-t-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {s.name}
              <X size={10} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); closeSession(s.id); }} />
            </div>
          ))}
          <button onClick={createNewSession} className="p-1 hover:text-emerald-400 text-slate-600"><Plus size={12} /></button>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <button onClick={() => setShowTools(!showTools)} className={`hover:text-white transition-colors ${showTools ? 'text-emerald-400' : ''}`}>
            <Settings size={14} />
          </button>
          <button onClick={() => setIsMaximized(!isMaximized)} className="hover:text-white transition-colors">
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={onClose} className="hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* SETTINGS TOOLBAR */}
      {showTools && (
        <div className="bg-slate-950 border-b border-slate-800 p-2 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 shrink-0">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase flex items-center gap-2"><Type size={10} /> Font Size: {terminalSettings.fontSize}px</label>
            <input type="range" min="8" max="32" value={terminalSettings.fontSize} onChange={(e) => setTerminalSettings({ ...terminalSettings, fontSize: Number(e.target.value) })} className="w-full accent-emerald-500 h-1" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase flex items-center gap-2"><AlignLeft size={10} /> Opacity: {terminalSettings.opacity}%</label>
            <input type="range" min="50" max="100" value={terminalSettings.opacity} onChange={(e) => setTerminalSettings({ ...terminalSettings, opacity: Number(e.target.value) })} className="w-full accent-emerald-500 h-1" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTerminalSettings(p => ({ ...p, wordWrap: !p.wordWrap }))} className={`p-1.5 rounded text-[10px] border ${terminalSettings.wordWrap ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500'}`}>WRAP</button>
            <button onClick={() => setTerminalSettings(p => ({ ...p, timestamps: !p.timestamps }))} className={`p-1.5 rounded text-[10px] border ${terminalSettings.timestamps ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500'}`}>TIME</button>
            <button onClick={() => setTerminalSettings(p => ({ ...p, autoScroll: !p.autoScroll }))} className={`p-1.5 rounded text-[10px] border ${terminalSettings.autoScroll ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500'}`}>
              {terminalSettings.autoScroll ? <Lock size={10} /> : <Unlock size={10} />}
            </button>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => addServerLog("SCREENSHOT SAVED TO ~/empire-dropbox/screenshots/")} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-slate-400"><Camera size={12} /></button>
            <button onClick={() => addServerLog("CASTING TERMINAL TO NETWORK ID: #88392...")} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-slate-400"><Cast size={12} /></button>
            <button onClick={() => updateSessionHistory(activeSessionId, [])} className="p-1.5 bg-slate-800 rounded hover:bg-red-900/30 text-red-400"><Trash2 size={12} /></button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div
        className="flex-1 relative overflow-hidden bg-black transition-opacity duration-300"
        style={{ opacity: terminalSettings.opacity / 100 }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
      >
        {/* SERVER CONFIG VIEW */}
        {showServerConfig ? (
          <div className="absolute inset-0 bg-[#050510] flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* DECK HEADER */}
            <div className="p-4 border-b border-indigo-500/30 flex items-center justify-between bg-indigo-900/10 shrink-0">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-widest">
                  <Server size={20} className="text-indigo-400" /> SERVER GOD MODE
                </h1>
                <div className="text-[10px] text-indigo-400 font-mono flex gap-4 mt-1">
                  <span>CREDITS: <span className="text-white">$1,800.00</span></span>
                  <span>REGION: <span className="text-white">US-CENTRAL1-A</span></span>
                  <span>MIRROR: <span className="text-emerald-400 animate-pulse">CONNECTED</span></span>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Latency</div>
                  <div className="text-emerald-400 font-mono font-bold">12ms</div>
                </div>
                <button
                  onClick={() => setShowServerConfig(false)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ACTION GRID */}
            <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto custom-scrollbar">
              {[
                { id: 'swarm', name: 'SWARM SCALE', desc: 'FAILSAFE: 100K BOTS', icon: Users, color: 'text-purple-400', border: 'hover:border-purple-500', shadow: 'hover:shadow-purple-500/20' },
                { id: 'mirror', name: 'MIRROR CLONE', desc: 'FULL EMPIRE BACKUP', icon: Layers, color: 'text-cyan-400', border: 'hover:border-cyan-500', shadow: 'hover:shadow-cyan-500/20' },
                { id: 'killswitch', name: 'KILLSWITCH ALL', desc: 'EMERGENCY HALT', icon: AlertTriangle, color: 'text-red-500', border: 'border-red-500/50 hover:border-red-500', shadow: 'hover:shadow-red-500/40', bg: 'bg-red-950/20' },
                { id: 'vertex', name: 'VERTEX IGNITE', desc: 'GEMINI 3 PRO CLUSTER', icon: BrainCircuit, color: 'text-blue-400', border: 'hover:border-blue-500', shadow: 'hover:shadow-blue-500/20' },
                { id: 'vault', name: 'VAULT OPEN', desc: 'MOUNT 10TB SECURE', icon: Shield, color: 'text-emerald-400', border: 'hover:border-emerald-500', shadow: 'hover:shadow-emerald-500/20' },
                { id: 'timewarp', name: 'TIME WARP', desc: '30D BACKTEST IN 30S', icon: Clock, color: 'text-orange-400', border: 'hover:border-orange-500', shadow: 'hover:shadow-orange-500/20' },
                { id: 'arena', name: 'ARENA HOST', desc: 'LAUNCH TOURNAMENT', icon: Trophy, color: 'text-yellow-400', border: 'hover:border-yellow-500', shadow: 'hover:shadow-yellow-500/20' },
                { id: 'possess', name: 'GROK POSSESS', desc: 'TERMINAL OVERRIDE', icon: Ghost, color: 'text-white', border: 'hover:border-white', shadow: 'hover:shadow-white/20' },
                { id: 'ledger', name: 'LEDGER AUDIT', desc: 'PROOF OF PROFIT', icon: FileText, color: 'text-green-400', border: 'hover:border-green-500', shadow: 'hover:shadow-green-500/20' },
                { id: 'oneclick', name: 'ONE-CLICK EMPIRE', desc: 'DEPLOY FULL STACK', icon: Globe, color: 'text-indigo-400', border: 'hover:border-indigo-500', shadow: 'hover:shadow-indigo-500/50', ring: 'ring-1 ring-indigo-500/30' },
                { id: 'broadcast', name: 'BROADCAST', desc: 'GLOBAL MESSAGE', icon: Radio, color: 'text-pink-400', border: 'hover:border-pink-500', shadow: 'hover:shadow-pink-500/20' },
                { id: 'godmode', name: 'GOD MODE', desc: 'ROOT ACCESS (5M)', icon: Terminal, color: 'text-red-500', border: 'hover:border-red-500', shadow: 'hover:shadow-red-500/50', bg: 'bg-slate-900' },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => {
                    addServerLog(`> ORBITAL STRIKE: ${btn.name}...`);
                    addServerLog(`> ${btn.desc} - EXECUTING...`);
                    setTimeout(() => addServerLog(`> SUCCESS: PROTOCOL ${btn.id.toUpperCase()} ACTIVE.`), 800);
                  }}
                  className={`relative p-3 rounded-xl border border-slate-800 bg-black/40 ${btn.bg || ''} backdrop-blur-sm transition-all duration-200 group text-left flex flex-col justify-between h-24
                                     ${btn.border} ${btn.shadow} hover:-translate-y-1 hover:bg-slate-900 active:scale-95 ${btn.ring || ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-1.5 rounded-lg bg-white/5 group-hover:scale-110 transition-transform ${btn.color}`}>
                      <btn.icon size={20} />
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-white animate-pulse" />
                  </div>
                  <div>
                    <div className={`font-bold text-xs tracking-wider group-hover:text-white transition-colors ${btn.color} uppercase truncate`}>{btn.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5 group-hover:text-slate-400 truncate">{btn.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* LOCAL OVERRIDE */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0">
              <div className="flex flex-col lg:flex-row gap-4 h-full">
                <div className="flex-1 flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Wifi size={12} /> Local Override
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serverPort}
                      onChange={(e) => setServerPort(e.target.value)}
                      className="w-24 bg-black border border-slate-800 rounded px-3 py-2 text-slate-300 font-mono text-xs focus:border-indigo-500 outline-none"
                    />
                    <button
                      className={`px-4 py-2 rounded font-bold text-xs uppercase transition-all ${serverStatus === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20'}`}
                      onClick={() => checkServerHealth(serverPort)}
                    >
                      {serverStatus === 'CHECKING' ? '...' : serverStatus === 'RUNNING' ? 'PING' : 'CONNECT'}
                    </button>
                  </div>
                </div>
                <div className="flex-[2] bg-black/60 rounded-lg p-2 font-mono text-[10px] overflow-y-auto custom-scrollbar h-24 border border-slate-800/50">
                  {serverLogs.length === 0 && <span className="text-slate-700">System Ready. Awaiting Command...</span>}
                  {serverLogs.map((log, i) => (
                    <div key={i} className={`mb-0.5 truncate ${log.includes('failed') || log.includes('KILLSWITCH') || log.includes('HALT') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {log}
                    </div>
                  ))}
                  <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>
              </div>
            </div>
          </div>
        ) : activeSession.mode === 'grok' ? (
          <GrokSession onExit={() => setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, mode: 'standard' } : s))} />
        ) : (
          /* TERMINAL SESSION VIEW */
          <>
            {!activeSession.loginSession && (
              <div
                className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar"
                onClick={() => inputRef.current?.focus()}
                style={{ fontSize: `${terminalSettings.fontSize}px` }}
              >
                {activeSession.history.map((line, i) => (
                  <div key={i} className={`mb-1 ${terminalSettings.wordWrap ? 'break-words' : 'whitespace-nowrap overflow-x-auto'}`}>
                    {terminalSettings.timestamps && (
                      <span className="text-slate-600 mr-2 select-none">
                        [{new Date().toLocaleTimeString('en-US', { hour12: false })}]
                      </span>
                    )}
                    <span className="text-emerald-500/80 select-none">{line.startsWith("root@") ? "" : "> "}</span>
                    <span className={line.startsWith("root@") ? "text-cyan-400" : "text-slate-300"}>{line}</span>
                  </div>
                ))}

                {/* INPUT LINE */}
                <div className="flex items-center gap-2 mt-2">
                  {terminalSettings.timestamps && (
                    <span className="text-slate-600 select-none">
                      [{new Date().toLocaleTimeString('en-US', { hour12: false })}]
                    </span>
                  )}
                  <span
                    className="text-emerald-500 font-bold select-none"
                    style={{ fontSize: `${terminalSettings.fontSize}px` }}
                  >
                    root@empire:~$
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={activeSession.input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono focus:ring-0 p-0"
                    style={{ fontSize: `${terminalSettings.fontSize}px` }}
                    autoFocus
                  />
                </div>
                <div ref={bottomRef} />
              </div>
            )}

            {/* LOGIN OVERLAY */}
            {activeSession.loginSession && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-50 overflow-hidden">

                {/* 1. COVER IMAGE BACKGROUND (Only visible when idle or failing video isn't covering yet) */}
                {authVideoState === 'idle' && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: 'url(/traveler_cover.jpg)' }}
                  >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  </div>
                )}

                {/* 2. VIDEO LAYERS */}
                {authVideoState === 'success' && (
                  <video
                    src="/access_granted.mp4"
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover z-[60]"
                    onEnded={() => {
                      setAuthVideoState('idle');
                      setAdminUnlocked(true);
                      updateSessionLogin(activeSessionId, null);
                      setShowServerConfig(true);
                      updateSessionHistory(activeSessionId, [...activeSession.history, `> ACCESS GRANTED. WELCOME, COMMANDER.`]);
                    }}
                  />
                )}

                {authVideoState === 'fail' && (
                  <video
                    src="/access_denied.mp4"
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover z-[60]"
                    onEnded={() => {
                      setAuthVideoState('idle');
                      updateSessionLogin(activeSessionId, null);
                      updateSessionHistory(activeSessionId, [...activeSession.history, `> ACCESS DENIED. INCORRECT PASSPHRASE.`]);
                    }}
                  />
                )}

                {/* 3. LOGIN FORM (Only visible when idle) */}
                {authVideoState === 'idle' && (
                  <div className="w-full max-w-sm border border-slate-700 bg-black/90 p-6 rounded-lg shadow-2xl relative z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-center mb-6">
                      <div className="p-3 bg-slate-800 rounded-full border border-slate-600">
                        <Shield size={32} className="text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-center text-emerald-500 font-bold text-lg mb-1">SECURE LOGIN REQUIRED</h3>
                    <p className="text-center text-slate-500 text-xs mb-6 uppercase tracking-widest">{activeSession.loginSession.service}</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                      {activeSession.loginSession.type === 'key' ? (
                        <>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Identify Class</label>
                            <input type="text" disabled value="ADMIN_PRIME" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300 font-mono opacity-50 cursor-not-allowed" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Enter Master Key</label>
                            <input type="password" placeholder="••••••••••••••••" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-emerald-500 outline-none transition-colors" autoFocus />
                          </div>
                        </>
                      ) : activeSession.loginSession.type === 'passphrase' ? (
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Enter Passphrase</label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-emerald-500 outline-none transition-colors"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Username / ID</label>
                            <input
                              type="text"
                              value={authUsername}
                              onChange={(e) => setAuthUsername(e.target.value)}
                              placeholder="root_user"
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-emerald-500 outline-none transition-colors"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Password</label>
                            <input
                              type="password"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-emerald-500 outline-none transition-colors"
                            />
                          </div>
                        </>
                      )}

                      <button type="submit" disabled={authLoading} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2">
                        {authLoading ? (
                          <><span>VERIFYING...</span><Cpu size={14} className="animate-spin" /></>
                        ) : (
                          "AUTHENTICATE CONNECTION"
                        )}
                      </button>
                    </form>
                    <div className="mt-4 text-center">
                      <button onClick={() => updateSessionLogin(activeSessionId, null)} className="text-[10px] text-slate-600 hover:text-slate-400 underline">CANCEL SEQUENCE</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER STATUS */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 grid grid-cols-3 text-[10px] text-slate-500 uppercase rounded-b-xl relative shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={10} className={activeSession.loginSession ? "text-yellow-500" : "text-emerald-500"} />
          {activeSession.loginSession ? "AUTH REQUESTED" : "SECURE CONNECTION"}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Cpu size={10} className="text-blue-500" /> Process ID: 8942
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${showServerConfig && serverStatus === 'STOPPED' ? 'bg-red-500' : 'bg-emerald-500'}`} />
          {showServerConfig ? serverStatus : "ONLINE"}
        </div>

        {/* RESIZE HANDLE */}
        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 opacity-50 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = dimensions.width;
              const startHeight = dimensions.height;

              const onMouseMove = (moveEvent) => {
                setDimensions({
                  width: Math.max(400, startWidth + (moveEvent.clientX - startX)),
                  height: Math.max(300, startHeight + (moveEvent.clientY - startY))
                });
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H0L6 0V6Z" fill="#475569" />
            </svg>
          </div>
        )}
      </div>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 text-xs text-slate-300 w-48 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const selection = window.getSelection().toString();
              if (selection) {
                navigator.clipboard.writeText(selection);
                updateSessionHistory(activeSessionId, [...activeSession.history, `> COPIED TO CLIPBOARD.`]);
              } else {
                updateSessionHistory(activeSessionId, [...activeSession.history, `> NO SELECTION TO COPY.`]);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
          >
            <span className="group-hover:text-emerald-400">📋</span> Copy
          </button>
          <button
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                handleInputChange(activeSession.input + text);
                inputRef.current?.focus();
                setContextMenu(null);
              } catch (e) {
                updateSessionHistory(activeSessionId, [...activeSession.history, `> CLIPBOARD ACCESS DENIED.`]);
              }
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
          >
            <span className="group-hover:text-emerald-400">⌨️</span> Paste
          </button>
          <div className="h-[1px] bg-slate-800 my-1" />
          <button className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white flex items-center gap-2 group opacity-50 cursor-not-allowed">
            <span className="group-hover:text-emerald-400">⬇️</span> Download File...
          </button>
          <button onClick={() => { updateSessionHistory(activeSessionId, []); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white flex items-center gap-2 group">
            <span className="group-hover:text-emerald-400">🧹</span> Clear Terminal
          </button>
        </div>
      )}
    </div>
  );
}
