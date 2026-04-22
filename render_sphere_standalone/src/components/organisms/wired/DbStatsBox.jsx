import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

const useDbStats = () => {
    // Mocking db_utils.py stats
    const [stats, setStats] = useState({
        totalTrades: 1240,
        winRate: 64.2,
        dbSize: '1.2 GB',
        lastOptimization: '2h ago'
    });

    return stats;
};

export const DbStatsBox = () => {
    const stats = useDbStats();

    return (
        <EmpireBox title="Archive Status" description="Health monitor for the local SQLite database. Tracks storage size, trade history volume, and optimization status." theme="void" height="h-32">
            <div className="grid grid-cols-2 gap-4 h-full items-center">
                <div className="text-center">
                    <div className="text-[10px] uppercase text-slate-500">Total Trades</div>
                    <div className="text-xl font-mono text-slate-200">{stats.totalTrades}</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] uppercase text-slate-500">Global Win Rate</div>
                    <div className="text-xl font-mono text-emerald-400">{stats.winRate}%</div>
                </div>
                <div className="text-center col-span-2 border-t border-white/5 pt-2">
                    <span className="text-[10px] text-slate-600">DB Size: {stats.dbSize} • Last Vacuum: {stats.lastOptimization}</span>
                </div>
            </div>
        </EmpireBox>
    );
};
