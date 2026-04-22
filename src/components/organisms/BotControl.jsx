import React from 'react';

export default function BotControl({ theme = 'emerald' }) {
    // Mapping internal theme prop to CSS class if needed, but mostly relying on parent class
    // actually, let's keep it simple and just use the global styles
    
    return (
        <div className="w-full h-full p-6 rounded-3xl empire-glass flex flex-col justify-center items-center gap-4 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-xl font-bold tracking-widest text-white/90">SWARM CONTROL</h2>
            
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 shadow-lg border border-white/10 transition-all active:scale-95">
                    ACTIVATE
                </button>
                <button className="py-4 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95">
                    HALT
                </button>
            </div>
            
            <div className="w-full bg-black/20 rounded-full h-8 flex items-center px-3 border border-white/5 mt-2">
                 <span className="text-xs text-white/50 uppercase mr-auto">Power Lvl</span>
                 <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
            </div>
        </div>
    );
}
