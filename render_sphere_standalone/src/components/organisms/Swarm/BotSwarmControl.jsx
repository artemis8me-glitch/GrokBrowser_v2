
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Slider } from '@mui/material';
import { Zap, Play, Pause, Square } from 'lucide-react';

const THEME = {
    bg: 'bg-[#0a0b14]',
    card: 'bg-slate-900/90 backdrop-blur-md border border-slate-800',
    neonPurple: '#a855f7',
    neonGreen: '#10b981',
    neonCyan: '#06b6d4',
    neonRed: '#ef4444',
    neonYellow: '#eab308',
};

const Gauge = ({ value, max, color, label, suffix = '' }) => {
    const data = [
        { name: 'val', value: value },
        { name: 'rest', value: max - value }
    ];
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-16 h-16">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={20}
                            outerRadius={25}
                            startAngle={180}
                            endAngle={0}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill={color} />
                            <Cell fill="#1e293b" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center pb-4">
                    <span className="text-[10px] font-bold text-slate-300">{value}{suffix}</span>
                </div>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-500 mt-[-10px]">{label}</span>
        </div>
    );
};

const BotSwarmControl = ({ activeBots, setActiveBots, playState, setPlayState }) => {
    return (
        <div className={`h-full flex flex-col p-4 ${THEME.card} rounded-xl`}>
            <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Zap size={16} /> BOT SWARM CONTROL
            </h3>

            {/* Controls */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setPlayState('play')}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center transition-all ${playState === 'play' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                    <Play size={24} fill="currentColor" />
                </button>
                <button
                    onClick={() => setPlayState('pause')}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center transition-all ${playState === 'pause' ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                    <Pause size={24} fill="currentColor" />
                </button>
                <button
                    onClick={() => setPlayState('stop')}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center transition-all ${playState === 'stop' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                    <Square size={24} fill="currentColor" />
                </button>
            </div>

            {/* Slider */}
            <div className="mb-6 px-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>SCALE SWARM</span>
                    <span className="text-cyan-400 font-mono">{activeBots} / 100</span>
                </div>
                <Slider
                    value={activeBots}
                    onChange={(_, v) => setActiveBots(v)}
                    min={1} max={100}
                    sx={{
                        color: '#06b6d4',
                        height: 6,
                        '& .MuiSlider-thumb': {
                            width: 16, height: 16, border: '2px solid #0a0b14', boxShadow: '0 0 10px rgba(6,182,212,0.5)'
                        },
                        '& .MuiSlider-rail': { opacity: 0.2 }
                    }}
                />
            </div>

            {/* Risk Gauges */}
            <div className="flex-1 grid grid-cols-2 gap-2 border-t border-slate-800 pt-2">
                <Gauge value={5} max={10} color="#a855f7" label="LEVERAGE" suffix="x" />
                <Gauge value={25} max={100} color="#eab308" label="MARGIN" suffix="%" />
                <Gauge value={19500} max={25000} color="#ef4444" label="STOP LOSS" suffix="" />
                <Gauge value={1.5} max={10} color="#ef4444" label="MAX DRAWDOWN" suffix="%" />
            </div>
        </div>
    );
};

export default BotSwarmControl;
