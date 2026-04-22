import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, X } from 'lucide-react';

export default function BrowserView({ onUpdate, initialUrl, forceUrl, visionEnabled, onToggleVision }) {
    const [url, setUrl] = useState(initialUrl || 'https://www.google.com');
    const [inputUrl, setInputUrl] = useState(initialUrl || 'https://www.google.com');
    const webviewRef = useRef(null);

    // React to external navigation commands (from AI)
    useEffect(() => {
        if (forceUrl) {
            setUrl(forceUrl);
            setInputUrl(forceUrl);
        }
    }, [forceUrl]);

    useEffect(() => {
        const wv = webviewRef.current;
        if (!wv) return;

        const handleDomReady = async () => {
            // Webview might not be supported in standard browser
            if (!wv.getTitle) return;

            const title = wv.getTitle();
            const currentUrl = wv.getURL();

            // Extract text content for AI context
            // Be careful with large pages
            try {
                const content = await wv.executeJavaScript('document.body.innerText');
                onUpdate({
                    url: currentUrl,
                    title: title,
                    content: content ? content.substring(0, 5000) : '' // Limit to 5k chars to save tokens
                });
                setInputUrl(currentUrl);
            } catch (e) {
                console.error("Failed to extract browser content", e);
            }
        };

        wv.addEventListener('dom-ready', handleDomReady);
        return () => {
            wv.removeEventListener('dom-ready', handleDomReady);
        };
    }, [onUpdate]);

    const handleGo = (e) => {
        e.preventDefault();
        let target = inputUrl.trim();

        // Smart URL detection
        const hasProtocol = target.startsWith('http://') || target.startsWith('https://');
        const hasDot = target.includes('.');
        const hasSpace = target.includes(' ');

        if (hasSpace || !hasDot) {
            // Treat as search query
            target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
        } else if (!hasProtocol) {
            // Treat as domain
            target = 'https://' + target;
        } // else: it's a full URL

        setUrl(target);
    };

    const isHome = url === 'https://www.google.com' || url === 'about:blank';

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950">
            {/* Browser Toolbar */}
            <div className="h-12 bg-[#09090b] border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/70 transition-colors"> <ArrowLeft className="w-4 h-4" /> </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/70 transition-colors"> <ArrowRight className="w-4 h-4" /> </button>
                    <button onClick={() => { setUrl('https://www.google.com'); setInputUrl('https://www.google.com'); }} className="p-2 hover:bg-white/10 rounded-lg text-white/70 transition-colors"> <RefreshCw className="w-4 h-4" /> </button>
                </div>

                <div className="flex-1 max-w-3xl mx-auto w-full relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        {url.includes('https://') ? <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <div className="w-2 h-2 rounded-full bg-slate-500" />}
                    </div>
                    <form onSubmit={handleGo} className="w-full">
                        <input
                            className="w-full bg-[#18181b] hover:bg-[#27272a] focus:bg-[#09090b] border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono shadow-inner"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onFocus={(e) => e.target.select()}
                        />
                    </form>
                </div>

                <button
                    onClick={onToggleVision}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${visionEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                        }`}
                    title={visionEnabled ? "AI Vision ACTIVE" : "AI Vision DISABLED"}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${visionEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                    VISION
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                {isHome ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white p-8 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
                        </div>

                        <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                    <div className="w-10 h-10 border-4 border-white rounded-full opacity-80" />
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Empire Browser</h1>
                                <p className="text-white/40 text-sm tracking-widest uppercase">Secure . Fast . Vision-Enabled</p>
                            </div>

                            <div className="w-full max-w-xl">
                                <form onSubmit={handleGo} className="relative group">
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-xl backdrop-blur-md placeholder:text-white/20"
                                        placeholder="Search the web or enter URL..."
                                        onChange={(e) => setInputUrl(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <kbd className="text-xs text-white/30 font-mono border border-white/10 px-2 py-1 rounded">ENTER</kbd>
                                    </div>
                                </form>
                            </div>

                            {/* Quick Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all cursor-pointer group flex flex-col gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <div className="text-blue-400 font-bold">V</div>
                                    </div>
                                    <h3 className="font-bold text-lg text-white/90">Vertex AI Search</h3>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        Commerce API: Retail Search, Browse & Recs. Implement personalized search models.
                                    </p>
                                    <div className="mt-auto pt-4 flex gap-2">
                                        <button className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors">API Keys</button>
                                        <button className="text-[10px] bg-white/5 text-white/50 px-2 py-1 rounded hover:bg-white/10 transition-colors">Docs</button>
                                    </div>
                                </div>

                                <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all cursor-pointer group flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <div className="text-emerald-400 font-bold">$</div>
                                    </div>
                                    <h3 className="font-bold text-lg text-white/90">Market Watch</h3>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        Live monitoring of deployed bots and asset valuation across the Empire grid.
                                    </p>
                                </div>

                                <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all cursor-pointer group flex flex-col gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <div className="text-purple-400 font-bold">AI</div>
                                    </div>
                                    <h3 className="font-bold text-lg text-white/90">Grok & Gemini</h3>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        Manage API quotas and model fine-tuning parameters directly.
                                    </p>
                                </div>
                            </div>

                            {/* User Pasted Info (Hidden or Subtle) */}
                            <div className="mt-8 p-4 rounded-xl border border-white/5 bg-black/20 text-white/20 text-[10px] font-mono max-w-2xl text-center">
                                BETA BUILD v2.1.0 // VERTEX AI MODULES ACTIVE
                            </div>
                        </div>
                    </div>
                ) : (
                    <webview
                        ref={webviewRef}
                        src={url}
                        style={{ width: '100%', height: '100%' }}
                        className="w-full h-full"
                        allowpopups="true"
                    ></webview>
                )}
            </div>
        </div>
    );
}
