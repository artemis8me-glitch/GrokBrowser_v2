import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const IcebergDetectorSquare = () => {
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly detect an iceberg
            if (Math.random() > 0.7) {
                const size = (Math.random() * 50 + 10).toFixed(2);
                const price = (42000 + Math.random() * 500).toLocaleString();
                
                setAlert({
                    price,
                    size,
                    visible: (Math.random() * 2).toFixed(2), // Small visible size
                    side: Math.random() > 0.5 ? 'BUY' : 'SELL'
                });
                
                // Clear after 3s
                setTimeout(() => setAlert(null), 3000);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox 
            title="Iceberg Detector" 
            theme={alert ? (alert.side === 'BUY' ? 'emerald' : 'ruby') : 'void'} 
            height="h-full"
            className={alert ? 'animate-pulse shadow-[0_0_20px_currentColor]' : ''}
        >
            <div className="flex flex-col h-full justify-center items-center relative overflow-hidden">
                 {/* Underwater Effect */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/30 pointer-events-none" />

                {alert ? (
                    <div className="text-center z-10 space-y-1">
                        <div className="text-4xl animate-bounce">🧊</div>
                        <div className={`text-sm font-black font-mono uppercase ${alert.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {alert.side} ICEBERG
                        </div>
                        <div className="text-xs font-bold text-white">
                            @{alert.price}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-mono mt-1 bg-black/50 px-2 py-1 rounded border border-cyan-500/30">
                            HIDDEN: {alert.size} BTC
                        </div>
                        <div className="text-[9px] text-slate-400">
                            Visible: {alert.visible} BTC
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-600 opacity-50">
                        <div className="text-3xl mb-2">🌊</div>
                        <div className="text-[10px] uppercase tracking-widest">Scanning Depth...</div>
                    </div>
                )}
            </div>
        </EmpireBox>
    );
};

export default IcebergDetectorSquare;
