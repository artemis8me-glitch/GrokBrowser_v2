import React, { useState } from 'react';
import EmpireBox from '../EmpireBox';

const OneClickDeploy = () => {
    const [status, setStatus] = useState('idle'); // idle, deploying, active

    const handleDeploy = () => {
        if (status === 'active') return;
        setStatus('deploying');
        setTimeout(() => setStatus('active'), 2500);
    };

    return (
        <EmpireBox title="1-Click Deploy" description="Instantly deploys the current strategy configuration to the cloud swarm." theme={status === 'active' ? 'emerald' : 'void'} height="h-full">
            <div className="flex flex-col h-full justify-center items-center text-center space-y-2">
                <div className={`text-3xl transition-all duration-500 ${status === 'deploying' ? 'animate-spin' : ''}`}>
                    {status === 'idle' ? '🚀' : (status === 'deploying' ? '⚙️' : '✅')}
                </div>
                
                <div className="text-xs font-bold text-white">
                    {status === 'idle' ? 'READY TO LAUNCH' : (status === 'deploying' ? 'DEPLOYING SWARM...' : 'SWARM ACTIVE')}
                </div>

                <button 
                    onClick={handleDeploy}
                    disabled={status !== 'idle'}
                    className={`w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                        status === 'idle' 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                        : (status === 'deploying' ? 'bg-slate-700 text-slate-400' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30')
                    }`}
                >
                    {status === 'idle' ? 'DEPLOY' : (status === 'deploying' ? '...' : 'MANAGE')}
                </button>
            </div>
        </EmpireBox>
    );
};

export default OneClickDeploy;
