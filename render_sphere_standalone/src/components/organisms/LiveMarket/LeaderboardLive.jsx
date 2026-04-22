import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const LeaderboardLive = () => {
    const [leaders, setLeaders] = useState([
        { name: 'Jules_Trader', score: 2450, change: 1 },
        { name: 'Satoshi_D', score: 2380, change: 0 },
        { name: 'Moon_Walk', score: 2100, change: -1 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLeaders(prev => prev.map(l => ({
                ...l,
                score: l.score + Math.floor(Math.random() * 10),
                change: Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0
            })).sort((a, b) => b.score - a.score));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <EmpireBox title="Top 3 Traders" description="Live leaderboard of the top performers in your division." theme="gold" height="h-full">
            <div className="flex flex-col h-full justify-center space-y-2">
                {leaders.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-1 last:border-0">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold w-4 ${i === 0 ? 'text-amber-400' : (i === 1 ? 'text-slate-300' : 'text-orange-700')}`}>
                                #{i + 1}
                            </span>
                            <span className="text-white">{l.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">{l.score}</span>
                            {l.change !== 0 && (
                                <span className={`text-[8px] ${l.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {l.change > 0 ? '▲' : '▼'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </EmpireBox>
    );
};

export default LeaderboardLive;
