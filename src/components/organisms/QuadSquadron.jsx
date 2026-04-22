import React, { useState } from 'react';
import TerminalInstance from '../atoms/TerminalInstance';
import { Shield, Cpu, Cloud, Terminal, CheckCircle } from 'lucide-react';

const SimVM = ({ id, name, theme, script }) => {
    const [status, setStatus] = useState('BOOTING');

    const runScript = async (term) => {
        term.writeln(`\x1b[33m[BOOT] Initializing VM-${id}: ${name}...\x1b[0m`);
        await new Promise(r => setTimeout(r, 800));

        for (const line of script) {
            term.writeln(`root@${id}:~# ${line.cmd}`);
            if (line.output) {
                await new Promise(r => setTimeout(r, Math.random() * 500 + 200));
                // Simulate output typing or bulk print
                if (Array.isArray(line.output)) {
                    line.output.forEach(l => term.writeln(l));
                } else {
                    term.writeln(line.output);
                }
            }
            await new Promise(r => setTimeout(r, 500));
        }

        term.writeln(`\x1b[32m[SUCCESS] VM-${id} READY. WAITING FOR INPUT.\x1b[0m`);
        term.write(`user@${id}:~$ `);
        setStatus('ONLINE');
    };

    return (
        <div className="flex flex-col h-full border border-slate-700 bg-black/80 rounded overflow-hidden shadow-lg shadow-black/50">
            <div className="bg-slate-900 px-3 py-1 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className={status === 'ONLINE' ? 'text-emerald-400' : 'text-yellow-400'} />
                    <span className="text-xs font-bold text-slate-300 font-mono">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 rounded ${status === 'ONLINE' ? 'bg-emerald-900 text-emerald-400' : 'bg-yellow-900 text-yellow-400'}`}>
                        {status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">10.0.0.{100 + id}</span>
                </div>
            </div>
            <div className="flex-1 relative">
                <TerminalInstance
                    theme={theme}
                    fontSize={12}
                    onMount={(term) => runScript(term)}
                />
            </div>
        </div>
    );
};

const QuadSquadron = () => {
    const installScript = [
        { cmd: 'apt-get update -y', output: ['Hit:1 http://us.archive.ubuntu.com/ubuntu focal InRelease', 'Reading package lists... Done'] },
        { cmd: 'apt-get install -y google-cloud-sdk', output: ['Reading package lists... Done', 'Building dependency tree... Done', 'Unpacking google-cloud-sdk...'] },
        { cmd: 'gcloud auth login', output: ['Go to the following link in your browser:', 'https://accounts.google.com/o/oauth2/auth...', 'Enter verification code: *****************'] },
        { cmd: 'pip install google-generativeai', output: ['Collecting google-generativeai', 'Downloading google_generativeai-0.3.0-py3-none-any.whl', 'Successfully installed google-generativeai-0.3.0'] },
    ];

    const vms = [
        { id: 1, name: "Worker_Alpha (Clean)", theme: "default", user: "dev_jake" },
        { id: 2, name: "Worker_Beta (Content)", theme: "matrix", user: "content_lead" },
        { id: 3, name: "Worker_Gamma (Review)", theme: "ocean", user: "editor_chief" },
        { id: 4, name: "Worker_Delta (Publish)", theme: "sunset", user: "pub_bot" },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-950/50 p-4 gap-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Cloud className="text-blue-400" />
                    SQUADRON COMMAND
                    <span className="text-sm bg-blue-900/30 text-blue-400 px-2 rounded-full border border-blue-500/30">4 NODES ACTIVE</span>
                </h2>
                <div className="text-xs text-slate-400 font-mono flex gap-4">
                    <span>CPU: 12%</span>
                    <span>MEM: 4.2GB / 16GB</span>
                    <span>NET: 1.2 MB/s</span>
                </div>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
                {vms.map(vm => (
                    <SimVM
                        key={vm.id}
                        id={vm.id}
                        name={vm.name}
                        theme={vm.theme}
                        script={[
                            ...installScript,
                            { cmd: `export USER=${vm.user}`, output: '' },
                            { cmd: 'echo "Ready for Cleanup Task"', output: 'Task Queue: 142 items' }
                        ]}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuadSquadron;
