import React from 'react';
import ServerStatus from '../ServerStatus';
import MarketSentinel from '../MarketSentinel';
import DataStream from '../DataStream';
import TradeHistory from '../TradeHistory';
import LiveChart from '../LiveChart';
import LegionGrid from '../LegionGrid';

// Simple inline ErrorBoundary if atoms/ErrorBoundary is missing
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="p-4 border border-red-500 bg-red-900/20 text-red-400 text-xs font-mono">COMPONENT CRASHED</div>;
        }
        return this.props.children;
    }
}

const CommandCenter = () => {
    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in p-6 pb-20 overflow-y-auto h-full">

            {/* --- SECTOR 1: THE LEGION GRID --- */}
            {/* Draggable, Resizable, Alive */}
            <ErrorBoundary>
                <LegionGrid />
            </ErrorBoundary>

            {/* --- SECTOR 2: THEATER OF WAR (Charts & Sentinel) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
                <div className="lg:col-span-3 min-h-[500px] border border-white/5 rounded-lg bg-black/20 overflow-hidden relative">
                    <ErrorBoundary>
                        <LiveChart />
                    </ErrorBoundary>
                </div>
                <div className="flex flex-col gap-4">
                    <ErrorBoundary>
                        <MarketSentinel />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <ServerStatus />
                    </ErrorBoundary>
                </div>
            </div>

            {/* --- SECTOR 3: ARCHIVES & STREAMS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-96">
                    <ErrorBoundary>
                        <TradeHistory />
                    </ErrorBoundary>
                </div>
                <div className="h-96">
                    <ErrorBoundary>
                        <DataStream />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
