import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import {
    Activity, Settings, BarChart2, Zap, Play, Pause,
    TrendingUp, TrendingDown, AlertTriangle, DollarSign,
    Cpu, Shield, ChevronRight, Lock, Unlock, Eye, Share2, Trophy, Users, Layers, Plus, Save,
    Globe, MessageSquare, Copy, ArrowUpRight, ArrowDownRight, Wallet, Bell, CheckCircle,
    Sword, Target, UserPlus, LogOut, Clock, Calendar, Crown, Sparkles
} from 'lucide-react';

// --- 1. TRADING ENGINE CORE (SIMULATED BACKEND) ---

const IndicatorEngine = {
    sma: (data, period) => {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
                continue;
            }
            const slice = data.slice(i - period + 1, i + 1);
            const sum = slice.reduce((a, b) => a + b, 0);
            result.push(sum / period);
        }
        return result;
    },

    stdDev: (data, period, sma) => {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
                continue;
            }
            const slice = data.slice(i - period + 1, i + 1);
            const mean = sma[i];
            const squaredDiffs = slice.map(val => Math.pow(val - mean, 2));
            const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / period;
            result.push(Math.sqrt(avgSquaredDiff));
        }
        return result;
    },

    rsi: (data, period) => {
        const result = [];
        let gains = 0;
        let losses = 0;

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                result.push(null);
                continue;
            }

            const change = data[i] - data[i - 1];
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? Math.abs(change) : 0;

            if (i < period) {
                gains += gain;
                losses += loss;
                result.push(null);
            } else if (i === period) {
                gains = gains / period;
                losses = losses / period;
                const rs = gains / losses;
                result.push(100 - (100 / (1 + rs)));
            } else {
                gains = (gains * (period - 1) + gain) / period;
                losses = (losses * (period - 1) + loss) / period;
                const rs = gains / losses;
                result.push(100 - (100 / (1 + rs)));
            }
        }
        return result;
    },

    bollingerBands: (prices, period, stdDevMult) => {
        const sma = IndicatorEngine.sma(prices, period);
        const sd = IndicatorEngine.stdDev(prices, period, sma);
        return prices.map((price, i) => {
            if (sma[i] === null) return { upper: null, lower: null, middle: null };
            return {
                middle: sma[i],
                upper: sma[i] + (sd[i] * stdDevMult),
                lower: sma[i] - (sd[i] * stdDevMult)
            };
        });
    }
};

// --- 2. MOCK DATA GENERATORS ---

const generateMarketData = (points = 100, volatility = 1.0) => {
    const data = [];
    let price = 42000;
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.5) * 200 * volatility;
        price += change;
        data.push({
            time: i,
            price: price,
            volume: Math.floor(Math.random() * 1000) + 100
        });
    }
    return data;
};

const generateOrderBook = (currentPrice) => {
    const bids = Array.from({ length: 8 }, (_, i) => ({
        price: currentPrice - (i * 5) - Math.random() * 2,
        size: (Math.random() * 1.5).toFixed(4),
        total: 0
    }));
    const asks = Array.from({ length: 8 }, (_, i) => ({
        price: currentPrice + (i * 5) + Math.random() * 2,
        size: (Math.random() * 1.5).toFixed(4),
        total: 0
    })).reverse();
    return { bids, asks };
};

// --- 3. UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md overflow-hidden shadow-xl shadow-black/20 ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, color = "blue", className = "", icon: Icon }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        gold: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        platinum: "bg-slate-200/10 text-slate-200 border-slate-200/20",
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border flex items-center gap-1 ${colors[color]} ${className}`}>
            {Icon && <Icon size={10} />}
            {children}
        </span>
    );
};

const Toast = ({ message, type = "success", onClose }) => (
    <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 ${type === 'success' ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/50' : 'bg-blue-900/90 text-blue-200 border border-blue-500/50'
        }`}>
        {type === 'success' ? <CheckCircle size={20} /> : <Activity size={20} />}
        <div>
            <h4 className="font-bold text-sm">{type === 'success' ? 'System Notification' : 'Update'}</h4>
            <p className="text-xs opacity-90">{message}</p>
        </div>
    </div>
);

const SliderControl = ({ label, value, min, max, step, onChange, suffix = "" }) => (
    <div className="mb-5 group">
        <div className="flex justify-between mb-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider group-hover:text-cyan-400 transition-colors">{label}</label>
            <span className="text-xs text-white font-mono bg-slate-800 px-2 rounded">{value}{suffix}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
        />
    </div>
);

const ToggleControl = ({ label, active, onChange, description }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/50 mb-3 transition-colors cursor-pointer" onClick={() => onChange(!active)}>
        <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            {description && <span className="text-[10px] text-slate-500">{description}</span>}
        </div>
        <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${active ? 'bg-cyan-500' : 'bg-slate-600'}`}>
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
    </div>
);

// --- 4. LEAGUE / FANTASY COMPONENTS ---

const LeagueOnboarding = ({ onComplete }) => {
    const [teamName, setTeamName] = useState("");
    const [division, setDivision] = useState("Tech Titans");

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <Card className="w-full max-w-md p-8 border-t-4 border-t-orange-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Crown size={120} />
                </div>
                <div className="text-center mb-8 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-orange-500/30">
                        <Trophy size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Market Blitz</h1>
                    <Badge color="platinum" className="inline-flex mb-4">Official League</Badge>
                    <p className="text-slate-400 text-sm">Build your franchise. Dominate the market. Win the cup.</p>
                </div>

                <div className="space-y-5 relative z-10">
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Franchise Name</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Wall St. Wolves"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Select Division</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Tech Titans', 'Industrial Giants', 'Crypto Kings', 'Energy Barons'].map(div => (
                                <button
                                    key={div}
                                    onClick={() => setDivision(div)}
                                    className={`p-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center text-center h-12 ${division === div
                                        ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    {div}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => teamName && onComplete(teamName, division)}
                        disabled={!teamName}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wide rounded-lg transition-all shadow-lg shadow-orange-900/20 mt-2"
                    >
                    </button>
                </div>
            </Card>
        </div>
    );
};

const DraftRoom = ({ onLockLineup }) => {
    const [roster, setRoster] = useState({
        offense: [null, null, null], // 3 slots
        defense: [null, null]        // 2 slots
    });

    const assets = [
        { symbol: "NVDA", name: "NVIDIA Corp", type: "Offense", sector: "Tech", beta: 1.8 },
        { symbol: "AMD", name: "Adv Micro Devices", type: "Offense", sector: "Tech", beta: 2.1 },
        { symbol: "F", name: "Ford Motor Co", type: "Offense", sector: "Auto", beta: 1.1 },
        { symbol: "STLA", name: "Stellantis (Ram)", type: "Offense", sector: "Auto", beta: 1.3 },
        { symbol: "MSTR", name: "MicroStrategy", type: "Offense", sector: "Crypto", beta: 3.2 },
        { symbol: "SQQQ", name: "ProShares UltraShort", type: "Defense", sector: "Hedge", beta: -3.0 },
        { symbol: "SPXS", name: "Direxion Bear 3X", type: "Defense", sector: "Hedge", beta: -3.0 },
        { symbol: "TLT", name: "20+ Year Treasury", type: "Defense", sector: "Bonds", beta: 0.5 },
    ];

    const addToRoster = (asset) => {
        const typeKey = asset.type.toLowerCase();
        const emptyIndex = roster[typeKey].indexOf(null);
        if (emptyIndex !== -1) {
            const newRoster = { ...roster };
            newRoster[typeKey][emptyIndex] = asset;
            setRoster(newRoster);
        }
    };

    const removeFromRoster = (type, index) => {
        const newRoster = { ...roster };
        newRoster[type][index] = null;
        setRoster(newRoster);
    };

    const isFull = !roster.offense.includes(null) && !roster.defense.includes(null);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 p-1">
            {/* DRAFT POOL */}
            <Card className="flex-1 p-5 flex flex-col">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-cyan-400" /> Asset Pool
                    </h3>
                    <div className="text-xs text-slate-400 flex gap-2">
                        <span className="px-2 py-1 bg-slate-800 rounded">Tech</span>
                        <span className="px-2 py-1 bg-slate-800 rounded">Auto</span>
                        <span className="px-2 py-1 bg-slate-800 rounded">Hedge</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {assets.map((asset) => (
                        <div key={asset.symbol} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-800 transition-colors group">
                            <div>
                                <div className="font-bold text-white">{asset.symbol}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    {asset.name}
                                    <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-300" title="Fair Play Multiplier applied based on Beta">β{asset.beta}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge color={asset.type === "Offense" ? "blue" : "purple"}>{asset.type}</Badge>
                                <button
                                    onClick={() => addToRoster(asset)}
                                    className="p-1.5 bg-slate-700 hover:bg-emerald-600 text-white rounded transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* MY ROSTER */}
            <Card className="flex-1 p-5 flex flex-col bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-orange-500">
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Trophy size={18} className="text-orange-400" /> Starting Lineup
                    </h3>
                    <Badge color={isFull ? "green" : "orange"}>{isFull ? "Ready" : "Incomplete"}</Badge>
                </div>

                {/* OFFENSE */}
                <div className="mb-6">
                    <label className="text-xs uppercase font-bold text-blue-400 mb-2 block flex items-center gap-1"><Sword size={12} /> Offense (Longs)</label>
                    <div className="space-y-2">
                        {roster.offense.map((slot, i) => (
                            <div key={`off-${i}`} className={`h-14 rounded-lg border border-dashed flex items-center px-4 transition-all ${slot ? 'bg-slate-800 border-slate-700' : 'bg-slate-900/50 border-slate-800'}`}>
                                {slot ? (
                                    <div className="flex-1 flex justify-between items-center animate-in fade-in">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm">{slot.symbol}</span>
                                            <span className="text-[10px] text-slate-500">{slot.name}</span>
                                        </div>
                                        <button onClick={() => removeFromRoster('offense', i)} className="text-slate-500 hover:text-rose-400"><LogOut size={14} /></button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-600 flex items-center gap-2"><Plus size={10} /> Draft Asset</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* DEFENSE */}
                <div className="flex-1">
                    <label className="text-xs uppercase font-bold text-purple-400 mb-2 block flex items-center gap-1"><Shield size={12} /> Defense (Shorts/Hedges)</label>
                    <div className="space-y-2">
                        {roster.defense.map((slot, i) => (
                            <div key={`def-${i}`} className={`h-14 rounded-lg border border-dashed flex items-center px-4 transition-all ${slot ? 'bg-slate-800 border-slate-700' : 'bg-slate-900/50 border-slate-800'}`}>
                                {slot ? (
                                    <div className="flex-1 flex justify-between items-center animate-in fade-in">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm">{slot.symbol}</span>
                                            <span className="text-[10px] text-slate-500">{slot.name}</span>
                                        </div>
                                        <button onClick={() => removeFromRoster('defense', i)} className="text-slate-500 hover:text-rose-400"><LogOut size={14} /></button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-600 flex items-center gap-2"><Plus size={10} /> Draft Asset</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onLockLineup}
                    disabled={!isFull}
                    className="w-full py-3 mt-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                >
                    <Lock size={16} /> Lock Lineup
                </button>
            </Card>
        </div>
    );
};

const RivalryCard = ({ teamA, teamB, spread, onPick }) => (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-4 mb-4 group hover:border-slate-600 transition-all">
        <div className="absolute top-0 left-0 w-1/2 h-1 bg-blue-500/50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1 bg-red-500/50"></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="text-center">
                <div className="text-2xl font-black text-white">{teamA}</div>
                <button onClick={() => onPick(teamA)} className="mt-2 px-4 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors uppercase tracking-wider">Pick</button>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">VS</span>
                <span className="text-lg font-mono text-slate-300 my-1">{spread}</span>
                <Badge color="orange" icon={Sparkles}>Rivalry</Badge>
            </div>
            <div className="text-center">
                <div className="text-2xl font-black text-white">{teamB}</div>
                <button onClick={() => onPick(teamB)} className="mt-2 px-4 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-[10px] font-bold hover:bg-red-600 hover:text-white transition-colors uppercase tracking-wider">Pick</button>
            </div>
        </div>
    </div>
);

// --- 5. UPDATED VIEWS ---

const DashboardView = ({ data, orderBook, showToast }) => {
    const currentPrice = data[data.length - 1].price;
    return (
        <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto pb-20 animate-in fade-in duration-500 custom-scrollbar">
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between">
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Total Equity</div>
                            <div className="text-3xl font-bold text-white font-mono tracking-tight">$124,500.42</div>
                            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +$2,450 (24h)</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Wallet className="text-emerald-400" size={20} />
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-l-4 border-l-blue-500">
                    <div className="flex justify-between">
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Realized P/L</div>
                            <div className="text-3xl font-bold text-white font-mono tracking-tight">+$12,840.00</div>
                            <div className="text-xs text-blue-400 mt-1 flex items-center gap-1"><Activity size={12} /> 68% Win Rate</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Trophy className="text-blue-400" size={20} />
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-l-4 border-l-purple-500">
                    <div className="flex justify-between">
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Active Strategies</div>
                            <div className="text-3xl font-bold text-white font-mono tracking-tight">3</div>
                            <div className="text-xs text-purple-400 mt-1 flex items-center gap-1"><Cpu size={12} /> AI Optimized</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Zap className="text-purple-400" size={20} />
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                <Card className="h-[500px] flex flex-col">
                    <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">₿</div>
                            <div>
                                <h3 className="font-bold text-white leading-none">BTC/USD</h3>
                                <span className="text-[10px] text-slate-400">Bitcoin Perpetual</span>
                            </div>
                            <Badge color="green" className="ml-2 animate-pulse">LIVE</Badge>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono font-bold text-white">${currentPrice.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="flex-1 flex min-h-0">
                        <div className="flex-1 p-2 relative" style={{ minWidth: 100, minHeight: 100 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorPriceLive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} orientation="right" stroke="#475569" tick={{ fontSize: 10 }} width={40} />
                                    <Area type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} fill="url(#colorPriceLive)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-64 border-l border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase flex justify-between bg-slate-950">
                                <span>Price (USD)</span>
                                <span>Size (BTC)</span>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <div className="absolute inset-0 flex flex-col">
                                    <div className="flex-1 flex flex-col-reverse overflow-hidden">
                                        {orderBook.asks.slice(0, 12).map((ask, i) => (
                                            <div key={`ask-${i}`} className="flex justify-between px-2 py-0.5 text-xs hover:bg-rose-500/10 cursor-pointer group">
                                                <span className="text-rose-400 font-mono group-hover:font-bold">{ask.price.toFixed(1)}</span>
                                                <span className="text-slate-400">{ask.size}</span>
                                                <div className="absolute right-0 h-[18px] bg-rose-500/10 -z-10" style={{ width: `${Math.random() * 80}%` }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="py-2 text-center border-y border-slate-800 bg-slate-800/30">
                                        <span className={`text-sm font-bold font-mono ${currentPrice > 42000 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {currentPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        {orderBook.bids.slice(0, 12).map((bid, i) => (
                                            <div key={`bid-${i}`} className="flex justify-between px-2 py-0.5 text-xs hover:bg-emerald-500/10 cursor-pointer group relative">
                                                <span className="text-emerald-400 font-mono group-hover:font-bold">{bid.price.toFixed(1)}</span>
                                                <span className="text-slate-400">{bid.size}</span>
                                                <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 -z-10" style={{ width: `${Math.random() * 80}%` }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 border-t border-slate-800 bg-slate-900">
                                <div className="flex gap-2 mb-2">
                                    <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-all active:scale-95 shadow-lg shadow-emerald-900/20" onClick={() => showToast("Buy Order Placed at Market", "success")}>BUY</button>
                                    <button className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded transition-all active:scale-95 shadow-lg shadow-rose-900/20" onClick={() => showToast("Sell Order Placed at Market", "success")}>SELL</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <Card className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Globe size={14} className="text-cyan-400" /> Community Pulse</h3>
                        <Badge color="green" className="animate-pulse">● LIVE</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                        {[
                            { u: "WhaleWatcher", a: "Bought", s: "BTC", q: "2.5", t: "Just now", p: "text-emerald-400" },
                            { u: "Jules_Trader", a: "Short", s: "ETH", q: "15.0", t: "2m ago", p: "text-rose-400" },
                            { u: "SatoshiGhost", a: "Long", s: "SOL", q: "500", t: "5m ago", p: "text-emerald-400" },
                            { u: "AlphaSeeker", a: "Closed", s: "BTC", q: "0.5", t: "12m ago", p: "text-blue-400" },
                            { u: "CryptoKing", a: "Bought", s: "DOGE", q: "50k", t: "15m ago", p: "text-emerald-400" },
                        ].map((item, i) => (
                            <div key={i} className="px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                    {item.u.substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-200">{item.u}</span>
                                        <span className="text-[10px] text-slate-500">{item.t}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">
                                        <span className={`${item.p} font-bold`}>{item.a}</span> {item.q} {item.s}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                        <button className="w-full py-2 border border-slate-700 rounded text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <MessageSquare size={14} /> Join Discussion
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const StrategyView = ({ params, setParams, processedData, showToast }) => {
    const chartData = processedData.slice(-50);
    return (
        <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-2 pb-20 custom-scrollbar">
                <Card className="p-5 animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings size={18} className="text-cyan-400" />
                        <h2 className="font-bold text-white">Strategy Config</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <Activity size={14} /> Bollinger Bands
                            </h3>
                            <SliderControl
                                label="Period"
                                value={params.bbPeriod}
                                min={10} max={50} step={1}
                                onChange={(v) => setParams(p => ({ ...p, bbPeriod: v }))}
                            />
                            <SliderControl
                                label="Std Deviation"
                                value={params.bbStdDev}
                                min={1} max={4} step={0.1}
                                onChange={(v) => setParams(p => ({ ...p, bbStdDev: v }))}
                            />
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <Zap size={14} /> RSI Momentum
                            </h3>
                            <SliderControl
                                label="RSI Period"
                                value={params.rsiPeriod}
                                min={2} max={30} step={1}
                                onChange={(v) => setParams(p => ({ ...p, rsiPeriod: v }))}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <SliderControl label="Overbought" value={params.rsiUpper} min={50} max={90} step={1} onChange={(v) => setParams(p => ({ ...p, rsiUpper: v }))} />
                                <SliderControl label="Oversold" value={params.rsiLower} min={10} max={50} step={1} onChange={(v) => setParams(p => ({ ...p, rsiLower: v }))} />
                            </div>
                        </div>
                        <Card className={`p-4 border transition-colors ${params.aiEnabled ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-slate-800'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Cpu size={16} className={params.aiEnabled ? "text-cyan-400" : "text-slate-500"} />
                                    <span className="font-bold text-white text-sm">AI Signal Filter</span>
                                </div>
                                <ToggleControl label="" active={params.aiEnabled} onChange={(v) => setParams(p => ({ ...p, aiEnabled: v }))} />
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Uses `query_xai` to validate Mean Reversion signals. Reduces false positives by 15% (simulated).
                            </p>
                        </Card>
                    </div>
                </Card>
            </div>
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden pb-20">
                <Card className="flex-1 p-4 flex flex-col min-h-[300px] animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-300">Indicator Visualization</h3>
                        <div className="flex gap-2">
                            <Badge color="blue">BB({params.bbPeriod}, {params.bbStdDev})</Badge>
                            <Badge color="purple">RSI({params.rsiPeriod})</Badge>
                        </div>
                    </div>
                    <div className="flex-1 w-full" style={{ minWidth: 100, minHeight: 100 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" stroke="#475569" tick={{ fontSize: 10 }} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ fontSize: '12px' }} />
                                <Area type="monotone" dataKey="bbUpper" stroke="none" fill="#3b82f6" fillOpacity={0.1} />
                                <Area type="monotone" dataKey="bbLower" stroke="none" fill="#3b82f6" fillOpacity={0.1} />
                                <Line type="monotone" dataKey="bbUpper" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="bbLower" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="bbMiddle" stroke="#1e40af" strokeWidth={1} dot={false} />
                                <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="h-[200px] p-4 flex flex-col animate-in zoom-in-95 duration-300 delay-75">
                    <h3 className="text-sm font-bold text-slate-300 mb-2">RSI Oscillator</h3>
                    <div className="flex-1 w-full" style={{ minWidth: 100, minHeight: 100 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <YAxis domain={[0, 100]} orientation="right" stroke="#475569" tick={{ fontSize: 10 }} ticks={[30, 70]} />
                                <ReferenceLine y={params.rsiUpper} stroke="#ef4444" strokeDasharray="3 3" />
                                <ReferenceLine y={params.rsiLower} stroke="#10b981" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="rsi" stroke="#c084fc" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ArenaView = ({ teamData, setTeamData, showToast }) => {
    // --- STATE FOR ARENA LOGIC ---
    const [marketStatus, setMarketStatus] = useState("closed");
    const [myScore, setMyScore] = useState(1240);
    const [oppScore, setOppScore] = useState(1150);
    const [roster, setRoster] = useState(null);

    const [oppRoster] = useState([
        { name: "AMD", role: "Striker", type: "Offense", change: 1.2, points: 120 },
        { name: "ETH", role: "Flex", type: "Offense", change: 0.5, points: 50 },
        { name: "COIN", role: "Wildcard", type: "Offense", change: 3.1, points: 310 },
        { name: "SPXS", role: "Shield", type: "Defense", change: -0.1, points: -10 },
        { name: "GLD", role: "Safety", type: "Defense", change: 0.4, points: 40 },
    ]);

    useEffect(() => {
        if (marketStatus === 'open' && roster) {
            const interval = setInterval(() => {
                const deltaMe = Math.floor(Math.random() * 20) - 5;
                const deltaOpp = Math.floor(Math.random() * 20) - 5;
                setMyScore(s => s + deltaMe);
                setOppScore(s => s + deltaOpp);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [marketStatus, roster]);

    const handleLockLineup = () => {
        setMarketStatus('open');
        setRoster([
            { name: "NVDA", role: "Striker", type: "Offense", change: 0.0, points: 0 },
            { name: "TSLA", role: "Flex", type: "Offense", change: 0.0, points: 0 },
            { name: "MSTR", role: "Wildcard", type: "Offense", change: 0.0, points: 0 },
            { name: "SQQQ", role: "Shield", type: "Defense", change: 0.0, points: 0 },
            { name: "TLT", role: "Safety", type: "Defense", change: 0.0, points: 0 },
        ]);
        showToast("Lineup Locked! Match Starting...", "success");
    };

    const momentum = 50 + ((myScore - oppScore) / 50);

    if (!teamData) {
        return <LeagueOnboarding onComplete={(name, div) => {
            setTeamData({ name, division: div });
            showToast(`Welcome to the ${div}, ${name}!`, "success");
        }} />;
    }

    return (
        <div className="h-full overflow-y-auto pb-20 animate-in fade-in duration-500 custom-scrollbar">
            {/* HEADER & STATUS TOGGLE */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                        <Trophy size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            Market Blitz League <span className="text-slate-600 mx-1">|</span> <span className="text-slate-500 font-mono">Powered by Gemini</span>
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">{teamData.name} <span className="text-slate-500 text-lg font-normal">vs.</span> Jules_Trader</h1>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setMarketStatus('closed')}
                        className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-2 ${marketStatus === 'closed' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Clock size={14} /> PRE-MARKET
                    </button>
                    <button
                        onClick={() => roster ? setMarketStatus('open') : showToast("Draft Team First!", "error")}
                        className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-2 ${marketStatus === 'open' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Activity size={14} /> MARKET OPEN
                    </button>
                </div>
            </div>

            {/* VIEW LOGIC: DRAFT vs LIVE */}
            {marketStatus === 'closed' ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2">
                            <DraftRoom onLockLineup={handleLockLineup} />
                        </div>
                        <div className="lg:col-span-1 space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Calendar size={16} /> Rivalry Week</h3>
                                <RivalryCard teamA="AMD" teamB="INTC" spread="+12%" onPick={(t) => showToast(`You picked ${t} for +50 bonus points`, 'success')} />
                                <RivalryCard teamA="F" teamB="RIVN" spread="-3%" onPick={(t) => showToast(`You picked ${t} for +50 bonus points`, 'success')} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in zoom-in-95 duration-500">
                    {/* LIVE SCOREBOARD */}
                    <Card className="p-0 mb-6 overflow-hidden relative border-orange-500/30">
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-1000 ease-in-out"
                                style={{ width: `${Math.max(20, Math.min(80, momentum))}%` }}
                            />
                        </div>
                        <div className="p-8 flex items-center justify-between bg-gradient-to-b from-slate-800/50 to-slate-900/80">
                            <div className="text-center w-1/3">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-2">{teamData.name}</div>
                                <div className="text-4xl font-bold text-white font-mono mb-1">{myScore}</div>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge color="green">You</Badge>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-black text-slate-700 italic tracking-tighter">VS</div>
                                <div className="text-[10px] text-emerald-400 mt-2 uppercase tracking-widest animate-pulse">● LIVE SCORING</div>
                            </div>
                            <div className="text-center w-1/3">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Jules_Trader</div>
                                <div className="text-4xl font-bold text-white font-mono mb-1">{oppScore}</div>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge color="orange">Opponent</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ROSTERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-0 h-full">
                            <div className="p-4 border-b border-slate-800 bg-emerald-900/10 flex justify-between items-center">
                                <h3 className="font-bold text-white text-sm">My Lineup</h3>
                                <Badge color="green">Active</Badge>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {roster && roster.map((player, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                                        <div className={`p-2 rounded-lg ${player.type === 'Offense' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                            {player.type === 'Offense' ? <Sword size={16} /> : <Shield size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-white">{player.name}</span>
                                                <span className="text-xs text-slate-400 font-mono">{player.role}</span>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-slate-400">Live P/L</span>
                                                <span className="text-xs font-bold text-white bg-slate-800 px-1.5 rounded">...</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-0 h-full border-slate-800 opacity-75">
                            <div className="p-4 border-b border-slate-800 bg-orange-900/10 flex justify-between items-center">
                                <h3 className="font-bold text-slate-300 text-sm">Opponent Lineup</h3>
                                <Badge color="orange">Locked</Badge>
                            </div>
                            <div className="divide-y divide-slate-800">
{oppRoster.map((player, i) => (
    <div key={i} className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-slate-800 text-slate-500">
            {player.type === 'Offense' ? <Target size={16} /> : <Shield size={16} />}
        </div>
        <div className="flex-1">
            <div className="flex justify-between">
                <span className="font-bold text-slate-400">{player.name}</span>
                <span className="text-xs text-slate-500 font-mono">{player.role}</span>
            </div>
        </div>
    </div>
))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

const BacktestView = ({ params, showToast }) => {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState(null);

    const runBacktest = () => {
        setRunning(true);
        setTimeout(() => {
            // SIMULATED BACKTEST LOGIC
            const days = 30;
            const data = [];
            let equity = 10000;
            const winRate = 0.55 + (Math.random() * 0.1);

            for (let i = 0; i < days; i++) {
                const dailyReturn = (Math.random() - (1 - winRate)) * 500;
                equity += dailyReturn;
                data.push({ day: i, equity: equity });
            }

            setResults({
                data: data,
                totalReturn: ((equity - 10000) / 100).toFixed(2),
                trades: Math.floor(Math.random() * 50) + 20,
                winRate: (winRate * 100).toFixed(1)
            });
            setRunning(false);
            showToast("Backtest Completed Successfully", "success");
        }, 1500); // Fake processing delay
    };

    return (
        <div className="h-full overflow-y-auto pb-20 px-1 custom-scrollbar">
            <div className="grid grid-cols-12 gap-6">
                {/* CONFIG */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <Card className="p-5">
                        <div className="flex items-center gap-2 mb-6">
                            <Layers size={18} className="text-purple-400" />
                            <h2 className="font-bold text-white">Simulation Lab</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Capital</label>
                                <div className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2 mt-1 border border-slate-700">
                                    <span className="text-slate-400">$</span>
                                    <input type="number" defaultValue={10000} className="bg-transparent w-full outline-none text-white font-mono text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Range</label>
                                <select className="w-full bg-slate-800 rounded px-3 py-2 mt-1 border border-slate-700 text-white text-sm outline-none">
                                    <option>Last 30 Days</option>
                                    <option>Last 90 Days</option>
                                    <option>2023 Full Year</option>
                                </select>
                            </div>
                            <button
                                onClick={runBacktest}
                                disabled={running}
                                className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${running ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                                    }`}
                            >
                                {running ? <span className="animate-spin">●</span> : <Play size={16} fill="currentColor" />}
                                {running ? 'Simulating...' : 'Run Backtest'}
                            </button>
                        </div>
                    </Card>
                </div>

                {/* RESULTS */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    {results ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="p-4 border-t-2 border-t-emerald-500">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">Total Return</div>
                                    <div className="text-2xl font-mono font-bold text-emerald-400">+{results.totalReturn}%</div>
                                </Card>
                                <Card className="p-4 border-t-2 border-t-blue-500">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">Win Rate</div>
                                    <div className="text-2xl font-mono font-bold text-blue-400">{results.winRate}%</div>
                                </Card>
                                <Card className="p-4 border-t-2 border-t-purple-500">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">Total Trades</div>
                                    <div className="text-2xl font-mono font-bold text-purple-400">{results.trades}</div>
                                </Card>
                                <Card className="p-4 border-t-2 border-t-orange-500">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">Profit Factor</div>
                                    <div className="text-2xl font-mono font-bold text-orange-400">1.85</div>
                                </Card>
                            </div>

                            <Card className="p-6 h-[400px] flex flex-col">
                                <h3 className="font-bold text-slate-300 mb-4">Equity Curve</h3>
                                <div className="flex-1 w-full">
                                    <ResponsiveContainer>
                                        <AreaChart data={results.data}>
                                            <defs>
                                                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10 }} />
                                            <YAxis stroke="#475569" tick={{ fontSize: 10 }} orientation="right" domain={['auto', 'auto']} />
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                            <Area type="monotone" dataKey="equity" stroke="#8b5cf6" fill="url(#equityGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-12">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <h3 className="font-bold text-lg">Ready to Simulate</h3>
                            <p className="text-sm">Configure parameters and press Run to test strategy.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 5. MAIN APP CONTROLLER ---

export default function HelmsdeepCommandCenter() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [rawMarketData, setRawMarketData] = useState(generateMarketData(100));
    const [toast, setToast] = useState(null);
    const [teamData, setTeamData] = useState(null); // Stores fantasy team info

    const [strategyParams, setStrategyParams] = useState({
        bbPeriod: 20,
        bbStdDev: 2.0,
        rsiPeriod: 14,
        rsiUpper: 70,
        rsiLower: 30,
        aiEnabled: false
    });

    /* ADDED: Remote Config State */
    const [remoteConfig, setRemoteConfig] = useState(null);

    useEffect(() => {
        // Fetch Network Config
        fetch('http://localhost:8001/v1/config/dashboard')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'loaded') {
                    setRemoteConfig(data.config);
                    showToast("Network Config Sync: COMPLETE", "success");
                    // Hydrate strategy params from Python Config
                    setStrategyParams(prev => ({
                        ...prev,
                        bbPeriod: data.config.indicators.bollinger_bands?.period || 20,
                        bbStdDev: data.config.indicators.bollinger_bands?.std_dev || 2.0,
                        rsiPeriod: data.config.indicators.rsi?.period || 14,
                        aiEnabled: data.config.ai_enabled
                    }));
                } else {
                    showToast("Network Config: Default Mode", "warning");
                }
            })
            .catch(err => {
                console.error("Config Fetch Error", err);
                showToast("Network Offline", "error");
            });
    }, []); // Run once on mount

    const processedData = useMemo(() => {
        const prices = rawMarketData.map(d => d.price);
        const bb = IndicatorEngine.bollingerBands(prices, strategyParams.bbPeriod, strategyParams.bbStdDev);
        const rsi = IndicatorEngine.rsi(prices, strategyParams.rsiPeriod);

        return rawMarketData.map((d, i) => ({
            ...d,
            bbUpper: bb[i].upper,
            bbLower: bb[i].lower,
            bbMiddle: bb[i].middle,
            rsi: rsi[i]
        }));
    }, [rawMarketData, strategyParams]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRawMarketData(prev => {
                const last = prev[prev.length - 1];
                const change = (Math.random() - 0.5) * 50;
                const newPoint = {
                    time: last.time + 1,
                    price: last.price + change,
                    volume: Math.random() * 1000
                };
                return [...prev.slice(1), newPoint];
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const showToast = useCallback((msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const currentPrice = rawMarketData[rawMarketData.length - 1].price;
    const orderBook = useMemo(() => generateOrderBook(currentPrice), [Math.floor(currentPrice)]);

    return (
        <div className="flex h-screen bg-[#0a0b14] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden">
            {toast && <Toast message={toast.msg} type={toast.type} />}

            {/* SIDEBAR NAVIGATION */}
            <div className="w-16 lg:w-64 border-r border-slate-800 flex flex-col bg-[#0a0b14] z-20">
                <div className="p-4 lg:p-6 border-b border-slate-800 h-20 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] flex-shrink-0">
                            <Activity size={20} className="text-white" />
                        </div>
                        <span className="hidden lg:block font-bold text-lg tracking-tight text-white truncate">
                            HELMSDEEP <span className="text-cyan-500">.AI</span>
                        </span>
                    </div>
                    {/* USER BRANDING WATERMARK */}
                    <div className="hidden lg:block text-[9px] text-slate-500 font-medium uppercase tracking-wider pl-11">
                        Architected by User
                    </div>
                </div>

                <nav className="flex-1 p-2 lg:p-4 space-y-2 overflow-y-auto">
                    {[
                        { id: 'dashboard', icon: Activity, label: 'Command Center' },
                        { id: 'strategy', icon: Cpu, label: 'Strategy Engine' },
                        { id: 'arena', icon: Trophy, label: 'League Arena' },
                        { id: 'backtest', icon: Layers, label: 'Simulation Lab' },
                        { id: 'analysis', icon: BarChart2, label: 'Deep Analysis' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeTab === item.id
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? "animate-pulse" : ""} />
                            <span className="hidden lg:block font-medium">{item.label}</span>
                            {activeTab === item.id && <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 hidden lg:block">
                    <Card className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${strategyParams.aiEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                            <div className="flex-1">
                                <div className="text-xs font-semibold text-slate-300">System Status</div>
                                <div className="text-[10px] text-slate-500">{strategyParams.aiEnabled ? 'AI ONLINE' : 'STANDBY'}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* HEADER */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-[#0a0b14]/95 backdrop-blur sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg lg:text-xl font-semibold text-white truncate flex items-center gap-2">
                            {activeTab === 'dashboard' ? 'Command Center' :
                                activeTab === 'strategy' ? 'Strategy Engine' :
                                    activeTab === 'arena' ? 'Market Blitz League' :
                                        activeTab === 'backtest' ? 'Simulation Lab' : 'Analytics'}
                        </h1>
                        {activeTab === 'dashboard' && (
                            <Badge color="green" className="hidden md:flex animate-pulse border-green-500/30 text-green-400 bg-green-500/10">
                                ● CONNECTED (APCA-****-2F9A)
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => showToast("Dashboard Published to Community", "success")}
                            className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                            <Share2 size={14} /> Publish Setup
                        </button>
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-medium text-white font-mono">${currentPrice.toFixed(2)}</div>
                            <div className="text-[10px] text-emerald-400">+1.2%</div>
                        </div>
                        <button className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* DYNAMIC CONTENT */}
                <main className="flex-1 overflow-hidden p-4 lg:p-8 relative">
                    {activeTab === 'dashboard' && <DashboardView data={rawMarketData} orderBook={orderBook} showToast={showToast} />}
                    {activeTab === 'strategy' && <StrategyView params={strategyParams} setParams={setStrategyParams} processedData={processedData} showToast={showToast} />}
                    {activeTab === 'arena' && <ArenaView teamData={teamData} setTeamData={setTeamData} showToast={showToast} />}
                    {activeTab === 'backtest' && <BacktestView params={strategyParams} showToast={showToast} />}
                    {activeTab === 'analysis' && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                            <Lock size={48} className="mb-4 opacity-20" />
                            <h3 className="font-bold text-lg">Module Locked</h3>
                            <p className="text-sm">Requires Pro Subscription</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}