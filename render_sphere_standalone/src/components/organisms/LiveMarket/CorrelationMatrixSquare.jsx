import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const CorrelationMatrixSquare = () => {
    const coins = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];
    const [matrix, setMatrix] = useState([]);

    const getColor = (value) => {
        // -1 (Red) -> 0 (Black/Grey) -> 1 (Cyan)
        if (value > 0) {
            // Cyan scale
            const intensity = Math.floor(value * 255);
            return `rgba(6, 182, 212, ${value})`; // Cyan with opacity
        } else {
            // Red scale
            const intensity = Math.floor(Math.abs(value) * 255);
            return `rgba(244, 63, 94, ${Math.abs(value)})`; // Rose with opacity
        }
    };

    useEffect(() => {
        const updateMatrix = () => {
            const newMatrix = [];
            for (let i = 0; i < coins.length; i++) {
                const row = [];
                for (let j = 0; j < coins.length; j++) {
                    if (i === j) {
                        row.push(1); // Self correlation is always 1
                    } else {
                        // Mock correlation between -0.8 and 0.9
                        row.push(Math.random() * 1.7 - 0.8);
                    }
                }
                newMatrix.push(row);
            }
            setMatrix(newMatrix);
        };

        updateMatrix();
        const interval = setInterval(updateMatrix, 15 * 60 * 1000); // 15 mins
        // For demo purposes, maybe update faster? 
        // User said "updates every 15min", but for a "live" feel in a demo I might want it to render once initially. 
        // I'll stick to 15m but run once on mount.
        
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Correlation Matrix [1H]" theme="void" height="h-full">
            <div className="flex flex-col h-full justify-center">
                 {/* Header Row */}
                <div className="grid grid-cols-6 gap-1 mb-1 text-[10px] text-center font-mono text-slate-500">
                    <div></div>
                    {coins.map(c => <div key={c}>{c}</div>)}
                </div>

                {/* Rows */}
                {matrix.map((row, i) => (
                    <div key={i} className="grid grid-cols-6 gap-1 mb-1 items-center">
                        {/* Row Label */}
                        <div className="text-[10px] font-mono text-slate-500 text-right pr-2">{coins[i]}</div>
                        
                        {/* Cells */}
                        {row.map((val, j) => (
                            <div 
                                key={j}
                                className="aspect-square rounded flex items-center justify-center text-[8px] font-bold text-white shadow-sm transition-colors duration-1000"
                                style={{ 
                                    backgroundColor: getColor(val),
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                title={`${coins[i]}/${coins[j]}: ${val.toFixed(2)}`}
                            >
                                {val.toFixed(1)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </EmpireBox>
    );
};

export default CorrelationMatrixSquare;
