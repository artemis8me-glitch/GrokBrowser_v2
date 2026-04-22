import React from 'react';
import StrategyControls from '../molecules/StrategyControls';

export default function TradeEntry({ theme = 'emerald' }) {
    // Theme mapping for the main button
    const btnClass = theme === 'cyber' 
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]' 
        : theme === 'void'
        ? 'bg-red-900 border border-red-500 text-red-100 hover:bg-red-800'
        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]';

    return (
        <div className="w-full h-full p-5 rounded-3xl empire-glass flex flex-col gap-4 relative overflow-hidden group">
             {/* Header */}
            <div className="flex justify-between items-center z-10">
                <h2 className="text-lg font-bold text-white tracking-wide">QUICK TRADE</h2>
                <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-white/50 border border-white/5">BTC/USDT</div>
            </div>

            {/* The Molecules */}
            <div className="flex-1 overflow-y-auto">
                <StrategyControls theme={theme} />
            </div>

            {/* Action Atom (Inline for now, could be its own atom) */}
            <button className={`w-full py-4 rounded-xl font-bold tracking-widest text-white shadow-lg transition-all active:scale-95 ${btnClass}`}>
                EXECUTE ORDER
            </button>
            
            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors"></div>
        </div>
    );
}
