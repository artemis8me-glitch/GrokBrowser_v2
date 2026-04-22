import React, { useState } from 'react';
import EmpireBox from '../EmpireBox';

const OcoManagerSquare = () => {
    const [status, setStatus] = useState('idle'); // idle, arming, armed
    const [stop, setStop] = useState(41500);
    const [target, setTarget] = useState(43000);

    const handleArm = () => {
        setStatus('arming');
        setTimeout(() => setStatus('armed'), 1000);
    };

    return (
        <EmpireBox title="OCO Manager" theme={status === 'armed' ? 'gold' : 'void'} height="h-full">
            <div className="flex flex-col h-full justify-between space-y-2">
                
                {/* Visual Sliders (Mock Drag) */}
                <div className="space-y-3 relative">
                    {/* Target */}
                    <div className="relative">
                        <div className="flex justify-between text-[9px] uppercase text-emerald-400 mb-1">
                            <span>Target</span>
                            <span>${target.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" min="42000" max="44000" step="50"
                            value={target} onChange={(e) => setTarget(parseInt(e.target.value))}
                            className="w-full h-1 bg-emerald-500/30 rounded appearance-none cursor-pointer accent-emerald-500"
                            disabled={status === 'armed'}
                        />
                    </div>

                    {/* Center Price Line */}
                    <div className="w-full h-[1px] bg-white/20 flex items-center justify-center">
                        <span className="text-[9px] bg-black px-1 text-slate-400">ENTRY @ $42,000</span>
                    </div>

                    {/* Stop */}
                    <div className="relative">
                        <div className="flex justify-between text-[9px] uppercase text-rose-400 mb-1">
                            <span>Stop Loss</span>
                            <span>${stop.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" min="40000" max="42000" step="50"
                            value={stop} onChange={(e) => setStop(parseInt(e.target.value))}
                            className="w-full h-1 bg-rose-500/30 rounded appearance-none cursor-pointer accent-rose-500"
                            disabled={status === 'armed'}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={status === 'armed' ? () => setStatus('idle') : handleArm}
                    className={`w-full py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                        status === 'armed' 
                            ? 'bg-amber-500 text-black hover:bg-amber-400 animate-pulse' 
                            : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                >
                    {status === 'idle' ? 'ARM OCO' : (status === 'arming' ? 'SYNCING...' : 'LIVE - CANCEL')}
                </button>
            </div>
        </EmpireBox>
    );
};

export default OcoManagerSquare;
