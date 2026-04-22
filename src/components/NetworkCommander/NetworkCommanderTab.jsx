import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { cn } from './lib/utils';
import { Globe, HardDrive, Network, Terminal, Power, Bot, ShieldAlert, Radio } from 'lucide-react';
import { api } from './lib/api';
import Toolbox from './components/Toolbox';
import FileTransfer from './components/FileTransfer';
import PortManager from './components/PortManager';
import RemoteClient from './components/RemoteClient';
import AgentAccess from './components/AgentAccess';
import SecurityDashboard from './components/SecurityDashboard';
import ConnectivityHub from './components/ConnectivityHub';

function NetworkCommanderTab() {
  const [activeTab, setActiveTab] = useState('toolbox');
  const [peerCount, setPeerCount] = useState(0);

  // Poll for peers to trigger global "Light It Up" effect
  useEffect(() => {
    const checkPeers = async () => {
      try {
        const peers = await api.get('/connect/peers');
        setPeerCount(peers.length || 0);
      } catch (e) { }
    };
    checkPeers();
    const interval = setInterval(checkPeers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShutdown = async () => {
    if (!confirm("Gracefully shutdown Network Commander?")) return;
    try { await api.post('/system/shutdown', {}); } catch (e) { }
    window.close();
    document.body.innerHTML = "<div style='color:white;text-align:center;padding:50px;'>Create a safe landing. System Shutdown.</div>";
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200",
        activeTab === id
          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/20"
          : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex font-sans selection:bg-blue-500/30">

      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-[#0d0d12] flex flex-col p-4 shrink-0">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Antigravity
            </h1>
            <p className="text-xs text-gray-500">Network Commander v2</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem id="toolbox" icon={Globe} label="Network Toolbox" />
          <NavItem id="connect" icon={Radio} label="Connectivity Hub" />
          <NavItem id="files" icon={HardDrive} label="File Transfer" />
          <NavItem id="ports" icon={Network} label="Port Commander" />
          <NavItem id="remote" icon={Terminal} label="Remote / Moon" />
          <NavItem id="security" icon={ShieldAlert} label="Security Center" />
          <NavItem id="agents" icon={Bot} label="Agent Access" />
        </nav>

        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={handleShutdown}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Power className="w-5 h-5" />
            <span className="font-medium text-sm">Graceful Shutdown</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeTab === 'toolbox' && 'Network Utilities'}
              {activeTab === 'files' && 'File Transfer System'}
              {activeTab === 'ports' && 'Port Process Manager'}
              {activeTab === 'remote' && 'Remote Device Manager'}
              {activeTab === 'security' && 'Security Intelligence Center'}
              {activeTab === 'connect' && 'Connectivity & Discovery'}
              {activeTab === 'agents' && 'Agent & API Interface'}
            </h2>
            <div className={`flex items-center gap-2 transition-all duration-500 ${peerCount > 0 ? 'bg-blue-500/20 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/50' : ''}`}>
              <span className={`w-2 h-2 rounded-full ${peerCount > 0 ? 'bg-blue-400 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
              <span className={`text-xs font-mono ${peerCount > 0 ? 'text-blue-300 font-bold' : 'text-green-500'}`}>
                {peerCount > 0 ? `${peerCount} PEER(S) DETECTED` : 'SYSTEM ONLINE [5260]'}
              </span>
            </div>
          </div>

          {/* Views */}
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'toolbox' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6"><Toolbox /></div>
                <div className="hidden lg:block p-6 rounded-xl border border-gray-800 bg-black/40 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
                  <Globe className="w-16 h-16 text-gray-800 mb-4" />
                  <p>Global Network Map</p>
                  <span className="text-xs bg-gray-900 px-2 py-1 rounded border border-gray-800 mt-2">Coming Phase 3</span>
                </div>
              </div>
            )}
            {activeTab === 'connect' && <ConnectivityHub />}
            {activeTab === 'files' && <FileTransfer />}
            {activeTab === 'ports' && <PortManager />}
            {activeTab === 'remote' && <RemoteClient />}
            {activeTab === 'security' && <SecurityDashboard />}
            {activeTab === 'agents' && <AgentAccess />}
          </div>

        </div>
      </main>
    </div>
  );
}

export default NetworkCommanderTab;
