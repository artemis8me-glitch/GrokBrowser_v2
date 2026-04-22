import React, { useState, useEffect, useRef } from 'react';
import {
    Trophy, Users, Sword, Shield, Lock, Plus, LogOut, Sparkles, MessageSquare, 
    Crown, Activity, DollarSign, Zap, ChevronRight, LayoutDashboard, ListOrdered, User, MessageCircle,
    TrendingUp, TrendingDown, Hash, Send
} from 'lucide-react';
import EmpireBox from './EmpireBox';

const INTRO_KEY = 'fantasy_intro_seen_v1';

// --- EMPIRE DESIGN SYSTEM (Jules' Templates) ---

const Card = ({ children, className = "", neon = false, border = "slate" }) => {
    const borderColors = {
        slate: "border-slate-800 hover:border-slate-700",
        fuchsia: "border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]",
        cyan: "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
        orange: "border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
    };

    return (
        <div className={`bg-[#0a0b14]/90 border ${neon ? borderColors[border] : borderColors.slate} rounded-xl backdrop-blur-md overflow-hidden flex flex-col relative transition-all ${className}`}>
            {children}
        </div>
    );
};

const Badge = ({ children, color = "blue", className = "", icon: Icon }) => {
    const colors = {
        blue: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        magenta: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
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

// --- SUB-COMPONENTS ---

const BannerPanel = ({ myScore, oppScore, teamName, momentum }) => (
    <Card className="flex flex-row items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 mb-4" neon border="fuchsia">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
             <div className="h-full bg-gradient-to-r from-emerald-500 to-fuchsia-500 transition-all duration-1000 ease-in-out" style={{ width: `${Math.max(20, Math.min(80, momentum))}%` }} />
        </div>

        <div className="flex flex-col">
            <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1 flex items-center gap-1">
                <Crown size={12} /> {teamName}
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-lg">
                {myScore.toLocaleString()}
            </div>
        </div>

        <div className="flex flex-col items-center justify-center relative">
            <div className="text-4xl font-black italic text-slate-800 tracking-tighter absolute select-none">VS</div>
            <Badge color="orange" className="relative z-10 animate-pulse" icon={Activity}>LIVE</Badge>
        </div>

        <div className="flex flex-col items-end">
            <div className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-1">Opponent</div>
            <div className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-lg">
                {oppScore.toLocaleString()}
            </div>
        </div>
    </Card>
);

const ChatPanel = ({ messages }) => {
    const [input, setInput] = useState("");
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Card className="h-full flex flex-col bg-slate-900/50">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <MessageSquare size={14} className="text-cyan-400"/> Division Chat
                </h3>
                <div className="flex -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-[8px] text-cyan-200">J</div>
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-[8px] text-purple-200">M</div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[8px] text-emerald-200">S</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.u === 'You' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border flex-shrink-0 ${msg.u === 'You' ? 'bg-emerald-900/50 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                            {msg.u.substring(0,1)}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${msg.u === 'You' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-3 py-2 rounded-lg text-xs border ${msg.u === 'You' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
                                {msg.m}
                            </div>
                            <span className="text-[8px] text-slate-600 mt-0.5 px-1">{msg.t}</span>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="p-2 bg-slate-900 border-t border-slate-800">
                <div className="relative flex gap-2">
                    <input
                        className="flex-1 bg-black/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="Type to chat..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg border border-cyan-600/30 hover:bg-cyan-600/30 transition-colors">
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

const FeedPanel = ({ feed }) => (
    <Card className="h-full flex flex-col bg-slate-900/50">
        <div className="p-3 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Activity size={14} className="text-fuchsia-400"/> Live Actions
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {feed.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${
                            item.type === 'trade' ? 'bg-cyan-500/10 text-cyan-400' :
                            item.type === 'points' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-slate-700/30 text-slate-400'
                        }`}>
                            {item.type === 'trade' ? <TrendingUp size={12}/> : item.type === 'points' ? <Trophy size={12}/> : <Hash size={12}/>}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200">{item.u}</span>
                            <span className="text-[10px] text-slate-500">{item.action} <span className="text-white font-mono">{item.asset}</span></span>
                        </div>
                    </div>
                    <div className="text-right">
                        {item.profit && (
                            <div className={`text-xs font-mono font-bold ${item.profit.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.profit}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const LeaderboardPanel = () => {
    const players = [
        { rank: 1, u: "Jules_Trader", score: 2450, change: "+12%", div: "Kings" },
        { rank: 2, u: "Satoshi_Disciple", score: 2120, change: "+8%", div: "Kings" },
        { rank: 3, u: "MoonWalker", score: 1980, change: "-2%", div: "Kings" },
        { rank: 4, u: "DiamondHands", score: 1850, change: "+5%", div: "Barons" },
        { rank: 5, u: "RektKing", score: 1200, change: "-15%", div: "Degens" },
    ];

    return (
        <Card className="h-full flex flex-col" border="cyan">
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Crown size={14} className="text-amber-400"/> Division Standings
                </h3>
                <Badge color="platinum">Season 4</Badge>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-[10px] text-slate-500 uppercase sticky top-0">
                        <tr>
                            <th className="p-3 pl-4">Rank</th>
                            <th className="p-3">Franchise</th>
                            <th className="p-3 text-right pr-4">Score</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {players.map((p, i) => (
                            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <td className="p-3 pl-4 font-mono text-slate-500">
                                    {i === 0 ? <Crown size={14} className="text-amber-400"/> : `#${p.rank}`}
                                </td>
                                <td className="p-3">
                                    <div className="font-bold text-white">{p.u}</div>
                                    <div className="text-[9px] text-slate-500">{p.div}</div>
                                </td>
                                <td className="p-3 text-right pr-4">
                                    <div className="font-mono font-bold text-emerald-400">{p.score}</div>
                                    <div className="text-[9px] text-slate-500">{p.change}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const SquadPanel = ({ roster }) => (
    <Card className="h-full flex flex-col p-4 bg-slate-900/50">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-full p-0.5 shadow-lg shadow-fuchsia-500/30">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <User size={32} className="text-fuchsia-200" />
                </div>
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">Team Alpha</h2>
                <div className="flex gap-2 mt-1">
                    <Badge color="purple">Crypto Kings</Badge>
                    <Badge color="green">Level 12</Badge>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Win Rate</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">68%</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total PnL</div>
                <div className="text-xl font-bold text-cyan-400 font-mono">+$12.4k</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Badges</div>
                <div className="text-xl font-bold text-amber-400 font-mono">14</div>
            </div>
        </div>

        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Active Roster</h3>
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {roster ? roster.map((player, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-800 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${player.type === 'Offense' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {player.name.substring(0,3)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">{player.name}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{player.role}</div>
                        </div>
                    </div>
                    <Badge color={player.type === 'Offense' ? 'blue' : 'red'}>{player.type}</Badge>
                </div>
            )) : <div className="text-center text-xs text-slate-600 italic p-4">Draft your squad in the Arena</div>}
        </div>
    </Card>
);

// --- MAIN BOX COMPONENT ---

const FantasyFinanceBox = React.forwardRef((props, ref) => {
    const [activeTab, setActiveTab] = useState('arena');
    const [teamData, setTeamData] = useState(null);
    const [marketStatus, setMarketStatus] = useState("closed");
    const [myScore, setMyScore] = useState(1240);
    const [oppScore, setOppScore] = useState(1150);
    const [roster, setRoster] = useState(null);
    const [messages, setMessages] = useState([
        { u: "System", m: "Welcome to the Season 4 Finals.", t: "10:00" },
        { u: "Jules_Trader", m: "Good luck everyone!", t: "10:01" }
    ]);
    const [feed, setFeed] = useState([
        { type: "trade", u: "Sarah_X", action: "Long", asset: "BTC", profit: null },
        { type: "points", u: "Team Alpha", action: "Rank Up", asset: "Global", profit: "+500" }
    ]);

    // Live Updates
    useEffect(() => {
        if (marketStatus === 'open') {
            const interval = setInterval(() => {
                // Score
                setMyScore(s => s + Math.floor(Math.random() * 50 - 20));
                setOppScore(s => s + Math.floor(Math.random() * 50 - 20));
                
                // Feed
                if (Math.random() > 0.7) {
                    setFeed(prev => [{
                        type: "trade", 
                        u: "Bot_X", 
                        action: Math.random() > 0.5 ? "Buy" : "Sell", 
                        asset: ["SOL", "ETH", "DOGE"][Math.floor(Math.random()*3)],
                        profit: Math.random() > 0.5 ? "+2%" : "-1%"
                    }, ...prev].slice(0, 20));
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [marketStatus]);

    const handleLockLineup = () => {
        setMarketStatus('open');
        setRoster([
            { name: "Bitcoin", role: "Striker", type: "Offense" },
            { name: "Ethereum", role: "Flex", type: "Offense" },
            { name: "Dogecoin", role: "Wildcard", type: "Offense" },
            { name: "Tether", role: "Shield", type: "Defense" },
            { name: "BTC-DOWN", role: "Safety", type: "Defense" },
        ]);
    };

    const momentum = 50 + ((myScore - oppScore) / 50);

    const tabs = [
        { id: 'arena', label: 'Arena', icon: LayoutDashboard },
        { id: 'leaderboard', label: 'Leaderboard', icon: ListOrdered },
        { id: 'squad', label: 'Squad', icon: User },
        { id: 'chat', label: 'Comms', icon: MessageCircle },
    ];

    return (
        <EmpireBox title="FANTASY LEAGUE" {...props} ref={ref} className="flex flex-col bg-[#050505]">
            {/* Tab Nav */}
            <div className="flex border-b border-slate-800 bg-black/40 backdrop-blur">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-wider transition-all relative ${
                            activeTab === tab.id 
                                ? 'text-fuchsia-400 bg-white/5' 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-hidden p-2 bg-gradient-to-b from-transparent to-slate-900/20">
                {activeTab === 'arena' && (
                    <div className="h-full flex flex-col gap-2">
                        {!teamData ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                <Crown size={48} className="text-fuchsia-500 mb-4 animate-bounce-slow" />
                                <h2 className="text-xl font-bold text-white mb-2">Join the Empire League</h2>
                                <p className="text-slate-400 text-xs mb-6 max-w-xs">Draft your crypto portfolio, battle other traders, and climb the ranks.</p>
                                <button 
                                    onClick={() => setTeamData({ name: "Alpha Squad" })}
                                    className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-lg text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                                >
                                    Initialize Franchise
                                </button>
                            </div>
                        ) : (
                            <>
                                {marketStatus === 'open' && (
                                    <BannerPanel myScore={myScore} oppScore={oppScore} teamName={teamData.name} momentum={momentum} />
                                )}
                                
                                <div className="flex-1 flex gap-2 min-h-0">
                                    {marketStatus === 'closed' ? (
                                        <Card className="w-full p-6 flex flex-col items-center justify-center text-center" border="orange">
                                            <Trophy size={32} className="text-orange-400 mb-2" />
                                            <h3 className="text-lg font-bold text-white">Matchup Pending</h3>
                                            <p className="text-slate-400 text-xs mb-4">Draft your starting 5 assets to begin.</p>
                                            <button 
                                                onClick={handleLockLineup}
                                                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold text-xs uppercase tracking-widest transition-colors"
                                            >
                                                Draft & Lock
                                            </button>
                                        </Card>
                                    ) : (
                                        <>
                                            <div className="flex-1 min-w-0">
                                                <FeedPanel feed={feed} />
                                            </div>
                                            <div className="w-1/3 hidden sm:block">
                                                <Card className="h-full p-3 bg-slate-900/50">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">MVP</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center text-cyan-400 font-bold">BTC</div>
                                                        <div>
                                                            <div className="text-xs font-bold text-white">Bitcoin</div>
                                                            <div className="text-[10px] text-emerald-400">+4.2%</div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'leaderboard' && <LeaderboardPanel />}
                {activeTab === 'squad' && <SquadPanel roster={roster} />}
                {activeTab === 'chat' && <ChatPanel messages={messages} />}
            </div>
        </EmpireBox>
    );
});

export default FantasyFinanceBox;
