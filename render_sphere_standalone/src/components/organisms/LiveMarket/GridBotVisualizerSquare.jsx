import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const GridBotVisualizerSquare = () => {
    const [grids, setGrids] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(100);
    const [profit, setProfit] = useState(0);

    // Setup Grid Levels
    useEffect(() => {
        const levels = [];
        for (let i = 0; i < 10; i++) {
            levels.push({
                price: 90 + (i * 2), // 90, 92, ..., 108
                status: 'open', // open, filled
                type: i < 5 ? 'buy' : 'sell' // lower half buys, upper half sells
            });
        }
        setGrids(levels);
    }, []);

    // Simulate Market Movement
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPrice(prev => {
                const move = (Math.random() * 2 - 1); // -1 to +1
                let nextPrice = prev + move;
                
                // Check for fills
                setGrids(currentGrids => {
                    return currentGrids.map(g => {
                        // Simple logic: if price crosses grid level
                        if (Math.abs(g.price - nextPrice) < 0.5 && g.status === 'open') {
                            setProfit(p => p + 0.5); // Cha-ching
                            return { ...g, status: 'filled' }; 
                        }
                        // Reset fill if price moves away significantly? 
                        // For viz, let's just flicker them or keep them filled for a bit
                        if (g.status === 'filled' && Math.abs(g.price - nextPrice) > 3) {
                            return { ...g, status: 'open' }; // Reset grid
                        }
                        return g;
                    });
                });

                return nextPrice;
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Grid Matrix [Active]" theme="emerald" height="h-full">
            <div className="flex flex-row h-full">
                {/* Profit Side Panel */}
                <div className="w-1/3 border-r border-white/5 flex flex-col justify-center items-center p-2 text-center bg-black/20">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Total PnL</div>
                    <div className="text-xl font-mono text-emerald-400 font-bold mb-4">
                        +${profit.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-600">
                        {grids.filter(g => g.status === 'filled').length} Active Fills
                    </div>
                </div>

                {/* Visualizer */}
                <div className="flex-1 relative p-4 flex flex-col justify-between">
                    {/* Price Line (Simulated) */}
                    <div 
                        className="absolute left-0 right-0 border-t-2 border-yellow-400 z-20 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-500 ease-linear"
                        style={{ top: `${100 - (currentPrice - 90) * 5}%` }} // Scale roughly to map 90-110 range to 0-100% height (inverted)
                    >
                        <div className="absolute right-0 -top-3 bg-yellow-400 text-black text-[9px] font-bold px-1 rounded">
                            ${currentPrice.toFixed(2)}
                        </div>
                    </div>

                    {/* Grid Levels */}
                    {grids.slice().reverse().map((grid, i) => ( // Reverse to put high price at top
                        <div 
                            key={i} 
                            className={`w-full h-[1px] flex items-center ${grid.type === 'sell' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`h-4 w-3/4 rounded relative transition-all duration-300
                                    ${grid.status === 'filled' 
                                        ? 'bg-white shadow-[0_0_10px_white]' 
                                        : (grid.type === 'sell' ? 'bg-rose-500/20 border-r-2 border-rose-500' : 'bg-emerald-500/20 border-l-2 border-emerald-500')
                                    }
                                `}
                            >
                                <span className={`absolute ${grid.type === 'sell' ? 'right-2' : 'left-2'} top-0 text-[9px] opacity-50`}>
                                    {grid.price}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </EmpireBox>
    );
};

export default GridBotVisualizerSquare;
