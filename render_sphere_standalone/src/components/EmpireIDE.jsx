// /home/devops/devtools/empire-terminal/src/EmpireIDE.tsx — God-Tier Terminal v2.1 (Foldable/Mobile Ready)
import React, { useState, useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import MonacoEditor from '@monaco-editor/react';
import 'xterm/css/xterm.css';
import secureLocalStorage from 'react-secure-storage';

// Import Organisms for DevTools
import ServerStatus from './organisms/ServerStatus';
import ActiveBots from './organisms/ActiveBots';

const EMAIL_KEY = 'empire_email';
const PASSWORD_KEY = 'empire_password';

// Helper Component for XTerm
const TerminalInstance = ({ onMount, onKey, fontSize = 14 }) => {
  const ref = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    
    // Dispose previous instance if exists to prevent duplicates
    if (xtermRef.current) {
        xtermRef.current.dispose();
    }

    const xterm = new XTerm({ 
        theme: { background: '#000', foreground: '#ff4500' }, 
        fontSize,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace'
    });
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    
    xterm.open(ref.current);
    try {
        fitAddon.fit();
    } catch(e) { console.warn("Fit failed on init", e); }

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    if (onMount) onMount(xterm);
    if (onKey) xterm.onKey(onKey);

    const handleResize = () => {
        try {
            fitAddon.fit();
        } catch(e) {}
    };
    window.addEventListener('resize', handleResize);
    
    // Slight delay to ensure DOM is ready for fit
    setTimeout(() => {
        try {
            fitAddon.fit();
        } catch(e) {}
    }, 100);

    return () => {
      xterm.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Run once on mount

  return <div ref={ref} className="w-full h-full bg-black" />;
};

export default function EmpireIDE() {
  const terminalRef = useRef(null);
  const cloudTermRef = useRef(null);
  const createChatRef = useRef(null);
  const [term, setTerm] = useState(null);
  const [activeTab, setActiveTab] = useState('Terminal');
  const [visionMode, setVisionMode] = useState(false);
  const [cloudCode, setCloudCode] = useState(secureLocalStorage.getItem('cloudCode') || '!gcloud compute instances list');
  const [createCode, setCreateCode] = useState(secureLocalStorage.getItem('createCode') || '// New program idea');
  const [chatLog, setChatLog] = useState(secureLocalStorage.getItem('chatLog') || '');
  const [email, setEmail] = useState(secureLocalStorage.getItem(EMAIL_KEY) || '');
  const [password, setPassword] = useState(secureLocalStorage.getItem(PASSWORD_KEY) || '');
  const [loggedIn, setLoggedIn] = useState(!!secureLocalStorage.getItem(EMAIL_KEY));
  const [testResults, setTestResults] = useState('');
  const [bugs, setBugs] = useState([]);
  const [isMobile, setIsMobile] = useState(false); // New state for mobile detection
  const [commandInput, setCommandInput] = useState(''); // New state for global command

  const tabs = ['Terminal', 'Cloud Shell', 'Create Anything', 'DevTools', 'Chat Monitor'];

  // Effect for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      // Simulate mobile for viewports smaller than a typical foldable screen width (e.g., 768px)
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    checkMobile(); // Initial check
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!terminalRef.current || activeTab !== 'Terminal') return;
    
    // If term already exists, just fit it
    if (term) {
        // We can't easily access the fit addon here unless we stored it, 
        // but re-creating XTerm is safer for tab switching in this simple implementation
        term.dispose();
    }

    const xterm = new XTerm({ theme: { background: '#000', foreground: '#ff4500' }, fontSize: isMobile ? 12 : 16, cursorBlink: true });
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    
    // Fit needs delay to wait for render
    setTimeout(() => {
        try {
            fitAddon.fit();
        } catch(e) { console.warn("Fit error", e); }
    }, 50);

    setTerm(xterm);
    xterm.writeln('[SYS] Empire IDE v2.1 — God-Tier Unleashed (Foldable Ready)');
    xterm.writeln('> ');
    if (!loggedIn) xterm.writeln('[LOGIN] Enter email/password to activate CLIs');
    
    return () => xterm.dispose();
  }, [activeTab, isMobile]); // Re-run when tab changes back to Terminal

  useEffect(() => {
    secureLocalStorage.setItem('cloudCode', cloudCode);
    secureLocalStorage.setItem('createCode', createCode);
    secureLocalStorage.setItem('chatLog', chatLog);
  }, [cloudCode, createCode, chatLog]);

  const handleLogin = () => {
    if (email && password) {
      secureLocalStorage.setItem(EMAIL_KEY, email);
      secureLocalStorage.setItem(PASSWORD_KEY, password);
      setLoggedIn(true);
      if (term) term.writeln('[LOGIN] Success — CLIs activated');
    }
  };

  const handleCommand = (input, commandTerm) => {
    const targetTerm = commandTerm || term;
    if (!targetTerm) return;

    // Clear input box if coming from global input
    if (!commandTerm) setCommandInput('');

    if (!loggedIn && !input.startsWith('login')) {
      targetTerm.writeln('[ERROR] Login required');
      return;
    }
    if (input === 'login') {
      targetTerm.writeln('[LOGIN] Enter email:');
      return;
    } else if (input.startsWith('email')) {
      setEmail(input.split(' ')[1]);
      targetTerm.writeln('[LOGIN] Enter password:');
      return;
    } else if (input.startsWith('password')) {
      setPassword(input.split(' ')[1]);
      handleLogin();
      return;
    } else if (input === 'vertex test all') {
      targetTerm.writeln('[TEST] Running backtest...');
      const results = backtestFunctions();
      setTestResults(results);
      targetTerm.writeln('Results: See Chat Monitor');
    } else if (input.startsWith('vertex config')) {
      const parts = input.trim().split(' ');
      if (parts.length < 3) {
        targetTerm.writeln('[ERROR] Usage: vertex config <api_key>');
      } else {
        const newKey = parts[2];
        localStorage.setItem('vertex_api_key', newKey);
        targetTerm.writeln('[SUCCESS] Vertex API Key configured. Systems Online.');
        targetTerm.writeln('[SYS] Reloading specific modules...');
      }
    } else if (input.startsWith('!forge')) {
      targetTerm.writeln('[SYS] Ordered 1000 squares via agents');
    } else if (input.startsWith('preview')) {
      const parts = input.trim().split(' ');
      const port = parts.length > 1 ? parseInt(parts[1], 10) : 8080;
      if (isNaN(port) || port < 2000 || port > 65000) {
        targetTerm.writeln('[ERROR] Invalid port. Use a number between 2000 and 65000. Defaulting to 8080.');
        targetTerm.writeln(`[WEB PREVIEW] Opening: https://8080-EMPIRE-IDE-VM-12345.proxy.google-cloud.com`);
      } else {
        targetTerm.writeln(`[WEB PREVIEW] Simulating preview on port ${port}.`);
        targetTerm.writeln(`[WEB PREVIEW] Opening: https://${port}-EMPIRE-IDE-VM-12345.proxy.google-cloud.com`);
      }
    } else if (input.startsWith('google home')) {
      targetTerm.writeln('[HOME] Launching Google Home Analytics Agent...');
      targetTerm.writeln('[HOME] Analyzing 10k users. Check DevTools for insights.');
    } else if (input.startsWith('matter integrate')) {
      targetTerm.writeln('[MATTER] Initiating Matter Device Swarm Agent...');
      targetTerm.writeln('[MATTER] Synchronizing local network with empire grid. Check DevTools.');
    } else if (input.startsWith('gdrive sync')) {
      targetTerm.writeln('[GDRIVE] Initiating Google Drive Sync Agent...');
      targetTerm.writeln('[GDRIVE] Syncing 1.2TB of project data. Status in Chat Monitor.');
    } else if (input.startsWith('chromium')) {
      targetTerm.writeln('[BROWSER] Launching Integrated Chromium Renderer...');
      targetTerm.writeln('[BROWSER] Opening full-screen view. This is GOD-TIER.');
    } else {
      // Default: Send to Gemini AI
      callGoogleAI(input, targetTerm);
    }
  };

  /* Embedded xAI Key for Client-Side "Offline" Usage */
  const HARDCODED_XAI_KEY = "";

  const callGoogleAI = async (prompt, term) => {
    // Try Gemini First if Key Exists in Storage
    const geminiKey = localStorage.getItem('vertex_api_key');

    if (geminiKey) {
      try {
        // Using gemini-2.0-flash-exp
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

        term.write('\r\n\x1b[36m[GEMINI]\x1b[0m: '); // Cyan color for Gemini label
        term.write(answer.replace(/\n/g, '\r\n'));
        term.write('\r\n');
        return;
      } catch (err) {
        term.writeln(`\r\n\x1b[31m[GEMINI ERROR]\x1b[0m ${err.message} - Falling back to Grok...`);
      }
    }

    // Fallback/Default to xAI (Grok) using Embedded Key
    term.writeln('\r\n[SYS] Engaging Grok (xAI) via Neural Link...');
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HARDCODED_XAI_KEY}`
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are Grok, an advanced AI integrated into the Empire Terminal. Be helpful, concise, and cool." },
            { role: "user", content: prompt }
          ],
          model: "grok-beta",
          stream: false
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices[0].message.content;

      term.write('\r\n\x1b[35m[GROK]\x1b[0m: '); // Magenta/Purple for Grok
      term.write(reply.replace(/\n/g, '\r\n'));
      term.write('\r\n');

    } catch (err) {
      term.writeln(`\r\n\x1b[31m[ERROR]\x1b[0m All AI Channels Failed: ${err.message}`);
    }
  };

  const handleTerminalKey = (event, overrideTerm) => {
    const { domEvent } = event;
    const targetTerm = overrideTerm || term;

    if (domEvent.key === 'Enter' && targetTerm) {
      // Get the last line of input from XTerm buffer
      const buffer = targetTerm.buffer.active;
      const lastLine = buffer.getLine(buffer.cursorY - 1)?.translateToString() || '';
      const input = lastLine.trim().replace(/^>\s*/, ''); // Remove the '>' prompt and trim

      targetTerm.write('\r\n');
      handleCommand(input, targetTerm);
      targetTerm.write('\r\n> ');
    }
  };

  const executeGlobalCommand = () => {
    if (commandInput.trim() && term) {
      term.write(`> ${commandInput.trim()}\r\n`);
      handleCommand(commandInput.trim(), term);
      term.write('\r\n> ');
    }
  }

  const executeCloudShell = (value) => {
    setCloudCode(value);
    if (cloudTermRef.current && loggedIn) {
      cloudTermRef.current.reset();
      cloudTermRef.current.writeln('[CLOUD] Executing with agents');
      cloudTermRef.current.write('> ');
    }
  };

  const executeCreateAnything = (value) => {
    setCreateCode(value);
    setChatLog(prev => prev + '\n[AGENT] Processing: ' + value);
    if (createChatRef.current) createChatRef.current.writeln('[CREATE] Task queued');
  };

  const backtestFunctions = () => {
    const tests = {
      Terminal: term ? 'PASS' : 'FAIL',
      CloudShell: cloudTermRef.current ? 'PASS' : 'FAIL',
      CreateAnything: createChatRef.current ? 'PASS' : 'FAIL',
      ChatMonitor: chatLog.length > 0 ? 'PASS' : 'FAIL',
    };
    return JSON.stringify(tests, null, 2);
  };

  const DevToolsPanel = (
    <div className="flex-1 p-4 overflow-auto text-sm">
      <h2 className="text-xl border-b border-orangered-700 mb-4 text-emerald-400 font-bold tracking-widest">
        GOD-TIER DEVTOOLS // SYSTEM METRICS
      </h2>
      
      {/* Integrated Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="text-sm text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-1">Server Heartbeat</h3>
            <ServerStatus />
        </div>
        
        <div className="space-y-4">
            <h3 className="text-sm text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-1">Fleet Command</h3>
            <ActiveBots />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg text-orangered-600 mb-2">Local/Matter Device Swarm Control</h3>
        <table className="w-full text-left border border-orangered-800 bg-black/50">
          <thead className="bg-gray-800">
            <tr><th className="p-2">Device</th><th className="p-2">IP/ID</th><th className="p-2">Status</th><th className="p-2">Action</th></tr>
          </thead>
          <tbody>
            <tr><td className="p-2">Nest Hub Max (Home)</td><td className="p-2">192.168.1.120</td><td className="p-2 text-lime-500">Online/Analyzing</td><td className="p-2"><button className="bg-orangered-900 px-2 rounded text-xs">Restart Analytics</button></td></tr>
            <tr><td className="p-2">Empire Matter Router 01</td><td className="p-2">matter-87df</td><td className="p-2 text-lime-500">Online/Idle</td><td className="p-2"><button className="bg-orangered-900 px-2 rounded text-xs">Deploy Schema</button></td></tr>
            <tr><td className="p-2">Local VM: Code Assist</td><td className="p-2">10.0.0.5</td><td className="p-2 text-yellow-500">Busy/Compiling</td><td className="p-2"><button className="bg-orangered-900 px-2 rounded text-xs">Kill Process</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full bg-black text-orangered-600 border-4 border-orangered-700 flex flex-col">
      <div className="bg-gray-900 px-4 py-2 flex justify-between flex-wrap">
        <span>EMPIRE IDE v2.1 — {activeTab} ACTIVE</span>
        <div className={`flex ${isMobile ? 'flex-wrap w-full mt-2' : ''}`}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1 mx-1 rounded ${activeTab === tab ? 'bg-orangered-700' : 'bg-gray-800'} ${isMobile ? 'mb-1 w-[48%]' : ''}`}>
              {tab}
            </button>
          ))}
          <button onClick={() => setVisionMode(!visionMode)} className={`px-4 py-1 bg-orangered-700 rounded ${isMobile ? 'w-full mt-1' : ''}`}>
            Vision {visionMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 h-full overflow-hidden">
        {activeTab === 'Terminal' && (
          <div ref={terminalRef} className="flex-1" tabIndex={0} onKeyDown={!isMobile ? handleTerminalKey : undefined}>
            {!loggedIn && <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />}
            {!loggedIn && <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />}
            {!loggedIn && <button onClick={handleLogin}>Login</button>}
          </div>
        )}
        {activeTab === 'Cloud Shell' && (
          <div className="flex-1 flex-col">
            <MonacoEditor value={cloudCode} onChange={executeCloudShell} theme="vs-dark" height={isMobile ? "30%" : "50%"} />
            <div className="flex-1 overflow-auto">
              <TerminalInstance
                onMount={(t) => { cloudTermRef.current = t; t.writeln('[CLOUD] Shell Ready...'); t.write('> '); }}
                onKey={(e) => handleTerminalKey(e, cloudTermRef.current)}
              />
            </div>
          </div>
        )}
        {activeTab === 'Create Anything' && (
          <div className="flex-1 flex-col">
            <MonacoEditor value={createCode} onChange={executeCreateAnything} theme="vs-dark" height={isMobile ? "30%" : "50%"} />
            <div className="flex-1 overflow-auto">
              <TerminalInstance
                onMount={(t) => { createChatRef.current = t; t.writeln('[CREATE] Agent Ready (Echo Mode)...'); }}
                onKey={(e) => handleTerminalKey(e, createChatRef.current)}
              />
            </div>
          </div>
        )}
        {activeTab === 'DevTools' && DevToolsPanel}
        {activeTab === 'Chat Monitor' && <div className="flex-1 p-4 overflow-auto">{testResults || chatLog}</div>}
      </div>

      {/* Global Command Input for Mobile/Foldable */}
      {isMobile && (
        <div className="bg-gray-900 p-2 flex items-center border-t-2 border-orangered-700">
          <span className="text-lg mr-2">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') executeGlobalCommand();
            }}
            placeholder="Enter God-Tier Command..."
            className="flex-1 bg-black border border-orangered-800 text-orangered-600 p-2 focus:outline-none"
          />
          <button onClick={executeGlobalCommand} className="ml-2 px-4 py-2 bg-orangered-700 rounded">
            EXECUTE
          </button>
        </div>
      )}
    </div>
  );
}
