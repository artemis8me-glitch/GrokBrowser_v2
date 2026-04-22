import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { StrategyParametersBox, RiskManagementBox, BotControlBox } from './Gemini_Strategies';
import { LiveDecisionBox } from './wired/LiveDecisionBox';
import { DbStatsBox } from './wired/DbStatsBox';
import FantasyFinanceBox from './FantasyFinanceBox';

// Live Market Squares
import OrderBookDepthSquare from './LiveMarket/OrderBookDepthSquare';
import LiquidationHeatmapSquare from './LiveMarket/LiquidationHeatmapSquare';
import FundingRateTrackerSquare from './LiveMarket/FundingRateTrackerSquare';
import WhaleAlertSquare from './LiveMarket/WhaleAlertSquare';
import CorrelationMatrixSquare from './LiveMarket/CorrelationMatrixSquare';

// Batch 2 Squares
import DeltaExposureSquare from './LiveMarket/DeltaExposureSquare';
import SlippageMonitorSquare from './LiveMarket/SlippageMonitorSquare';
import OrderFlowImbalanceSquare from './LiveMarket/OrderFlowImbalanceSquare';
import FomoMeterSquare from './LiveMarket/FomoMeterSquare';
import GridBotVisualizerSquare from './LiveMarket/GridBotVisualizerSquare';

// Batch 3 Squares
import CvdSquare from './LiveMarket/CvdSquare';
import OrderBookPressureSquare from './LiveMarket/OrderBookPressureSquare';
import PnlSplitSquare from './LiveMarket/PnlSplitSquare';
import AvgHoldTimeSquare from './LiveMarket/AvgHoldTimeSquare';
import StrategyContributionSquare from './LiveMarket/StrategyContributionSquare';

// Batch 4 Squares
import ExchangeLatencyRadarSquare from './LiveMarket/ExchangeLatencyRadarSquare';
import ProfitFactorTimelineSquare from './LiveMarket/ProfitFactorTimelineSquare';
import MoonBagTrackerSquare from './LiveMarket/MoonBagTrackerSquare';
import AutoRebalanceSquare from './LiveMarket/AutoRebalanceSquare';
import EmpireMoodRingSquare from './LiveMarket/EmpireMoodRingSquare';

// Batch 5 Squares
import RealTimeOrderFlowSquare from './LiveMarket/RealTimeOrderFlowSquare';
import VwapDeviationSquare from './LiveMarket/VwapDeviationSquare';
import ActiveOrdersLadderSquare from './LiveMarket/ActiveOrdersLadderSquare';
import RollingSharpeSquare from './LiveMarket/RollingSharpeSquare';
import PositionAgeHeatmapSquare from './LiveMarket/PositionAgeHeatmapSquare';

// Batch 6 Squares
import IcebergDetectorSquare from './LiveMarket/IcebergDetectorSquare';
import ConsecutiveCandleSquare from './LiveMarket/ConsecutiveCandleSquare';
import SmartMoneyFlowSquare from './LiveMarket/SmartMoneyFlowSquare';
import OcoManagerSquare from './LiveMarket/OcoManagerSquare';
import DailyLossLimitSquare from './LiveMarket/DailyLossLimitSquare';

// Batch 7 Squares (New)
import FundingRateAlert from './LiveMarket/FundingRateAlert';
import LiquidationHeatmapV2 from './LiveMarket/LiquidationHeatmap';
import SentimentStream from './LiveMarket/SentimentStream';
import WhaleWatcherV2 from './LiveMarket/WhaleWatcher';
import GasFeeTracker from './LiveMarket/GasFeeTracker';
import PortfolioRebalance from './LiveMarket/PortfolioRebalance';

// Batch 8 Squares (New)
import PaperTradingMirror from './LiveMarket/PaperTradingMirror';
import LeaderboardLive from './LiveMarket/LeaderboardLive';
import OneClickDeploy from './LiveMarket/OneClickDeploy';

// Import RGL styles if not globally imported
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const LegionGrid = () => {
    // Initial Layout Definition
    // 12 Column Grid
    const initialLayouts = {
        lg: [
            { i: 'control', x: 0, y: 0, w: 3, h: 4 },
            { i: 'decision', x: 3, y: 0, w: 3, h: 4 },
            { i: 'stats', x: 6, y: 0, w: 3, h: 2 },
            { i: 'risk', x: 9, y: 0, w: 3, h: 6 },
            { i: 'funding', x: 6, y: 2, w: 3, h: 2 }, 
            { i: 'strat', x: 0, y: 4, w: 6, h: 6 },
            { i: 'fantasy', x: 6, y: 4, w: 6, h: 8 },
            // Batch 1
            { i: 'depth', x: 0, y: 10, w: 3, h: 8 },
            { i: 'heatmap', x: 3, y: 10, w: 3, h: 8 },
            { i: 'whale', x: 6, y: 12, w: 3, h: 6 },
            { i: 'corr', x: 9, y: 6, w: 3, h: 6 },
            // Batch 2
            { i: 'delta', x: 0, y: 18, w: 3, h: 6 },
            { i: 'slippage', x: 3, y: 18, w: 3, h: 6 },
            { i: 'orderflow', x: 6, y: 18, w: 3, h: 6 },
            { i: 'fomo', x: 9, y: 12, w: 3, h: 6 }, 
            { i: 'gridviz', x: 0, y: 24, w: 6, h: 8 },
            // Batch 3
            { i: 'cvd', x: 6, y: 24, w: 3, h: 8 }, 
            { i: 'pressure', x: 9, y: 18, w: 3, h: 6 }, 
            { i: 'pnlsplit', x: 0, y: 32, w: 3, h: 6 },
            { i: 'holdtime', x: 3, y: 32, w: 3, h: 6 },
            { i: 'stratpie', x: 6, y: 32, w: 6, h: 6 },
            // Batch 4
            { i: 'radar', x: 0, y: 38, w: 3, h: 6 },
            { i: 'pf', x: 3, y: 38, w: 3, h: 6 },
            { i: 'moon', x: 6, y: 38, w: 3, h: 6 },
            { i: 'rebal', x: 9, y: 38, w: 3, h: 6 },
            { i: 'mood', x: 0, y: 44, w: 12, h: 4 }, // Full width mood ring
            // Batch 5
            { i: 'tape', x: 0, y: 48, w: 3, h: 8 },
            { i: 'vwap', x: 3, y: 48, w: 3, h: 8 },
            { i: 'orders', x: 6, y: 48, w: 3, h: 8 },
            { i: 'sharpe', x: 9, y: 48, w: 3, h: 4 },
            { i: 'age', x: 9, y: 52, w: 3, h: 4 },
            // Batch 6
            { i: 'iceberg', x: 0, y: 56, w: 3, h: 6 },
            { i: 'candle', x: 3, y: 56, w: 3, h: 6 },
            { i: 'smart', x: 6, y: 56, w: 3, h: 6 },
            { i: 'oco', x: 9, y: 56, w: 3, h: 6 },
            { i: 'limit', x: 0, y: 62, w: 12, h: 4 },
            // Batch 7
            { i: 'fund_v2', x: 0, y: 66, w: 4, h: 6 },
            { i: 'liq_v2', x: 4, y: 66, w: 4, h: 6 },
            { i: 'sent', x: 8, y: 66, w: 4, h: 6 },
            { i: 'whale_v2', x: 0, y: 72, w: 4, h: 6 },
            { i: 'gas', x: 4, y: 72, w: 4, h: 6 },
            { i: 'rebal_v2', x: 8, y: 72, w: 4, h: 6 },
            // Batch 8
            { i: 'paper', x: 0, y: 78, w: 4, h: 6 },
            { i: 'leader', x: 4, y: 78, w: 4, h: 6 },
            { i: 'deploy', x: 8, y: 78, w: 4, h: 6 },
        ],
        md: [
            { i: 'control', x: 0, y: 0, w: 6, h: 4 },
            { i: 'decision', x: 6, y: 0, w: 6, h: 4 },
            { i: 'stats', x: 0, y: 4, w: 6, h: 2 },
            { i: 'funding', x: 0, y: 6, w: 6, h: 2 },
            { i: 'risk', x: 6, y: 4, w: 6, h: 6 },
            { i: 'strat', x: 0, y: 10, w: 12, h: 6 },
            { i: 'fantasy', x: 0, y: 16, w: 12, h: 8 },
            { i: 'depth', x: 0, y: 24, w: 6, h: 6 },
            { i: 'heatmap', x: 6, y: 24, w: 6, h: 6 },
            { i: 'whale', x: 0, y: 30, w: 6, h: 6 },
            { i: 'corr', x: 6, y: 30, w: 6, h: 6 },
            { i: 'delta', x: 0, y: 36, w: 6, h: 6 },
            { i: 'slippage', x: 6, y: 36, w: 6, h: 6 },
            { i: 'orderflow', x: 0, y: 42, w: 6, h: 6 },
            { i: 'fomo', x: 6, y: 42, w: 6, h: 6 },
            { i: 'gridviz', x: 0, y: 48, w: 12, h: 8 },
            { i: 'cvd', x: 0, y: 56, w: 6, h: 8 },
            { i: 'pressure', x: 6, y: 56, w: 6, h: 8 },
            { i: 'pnlsplit', x: 0, y: 64, w: 6, h: 6 },
            { i: 'holdtime', x: 6, y: 64, w: 6, h: 6 },
            { i: 'stratpie', x: 0, y: 70, w: 12, h: 6 },
            { i: 'radar', x: 0, y: 76, w: 6, h: 6 },
            { i: 'pf', x: 6, y: 76, w: 6, h: 6 },
            { i: 'moon', x: 0, y: 82, w: 6, h: 6 },
            { i: 'rebal', x: 6, y: 82, w: 6, h: 6 },
            { i: 'mood', x: 0, y: 88, w: 12, h: 4 },
            // Batch 5
            { i: 'tape', x: 0, y: 92, w: 6, h: 8 },
            { i: 'vwap', x: 6, y: 92, w: 6, h: 8 },
            { i: 'orders', x: 0, y: 100, w: 6, h: 8 },
            { i: 'sharpe', x: 6, y: 100, w: 6, h: 4 },
            { i: 'age', x: 6, y: 104, w: 6, h: 4 },
            // Batch 6
            { i: 'iceberg', x: 0, y: 108, w: 6, h: 6 },
            { i: 'candle', x: 6, y: 108, w: 6, h: 6 },
            { i: 'smart', x: 0, y: 114, w: 6, h: 6 },
            { i: 'oco', x: 6, y: 114, w: 6, h: 6 },
            { i: 'limit', x: 0, y: 120, w: 12, h: 4 },
            // Batch 7
            { i: 'fund_v2', x: 0, y: 124, w: 6, h: 6 },
            { i: 'liq_v2', x: 6, y: 124, w: 6, h: 6 },
            { i: 'sent', x: 0, y: 130, w: 6, h: 6 },
            { i: 'whale_v2', x: 6, y: 130, w: 6, h: 6 },
            { i: 'gas', x: 0, y: 136, w: 6, h: 6 },
            { i: 'rebal_v2', x: 6, y: 136, w: 6, h: 6 },
            // Batch 8
            { i: 'paper', x: 0, y: 142, w: 6, h: 6 },
            { i: 'leader', x: 6, y: 142, w: 6, h: 6 },
            { i: 'deploy', x: 0, y: 148, w: 12, h: 6 },
        ]
    };

    const [layouts, setLayouts] = useState(initialLayouts);

    const onLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        // Save to local storage or DB in real app
    };

    return (
        <div className="w-full mb-8">
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                margin={[16, 16]}
                isDraggable={true}
                isResizable={true}
                onLayoutChange={onLayoutChange}
                draggableCancel=".no-drag" // Add class to inputs if needed
            >
                <div key="control">
                    <BotControlBox className="h-full w-full" />
                </div>
                <div key="decision">
                    <LiveDecisionBox className="h-full w-full" />
                </div>
                <div key="stats">
                    <DbStatsBox className="h-full w-full" />
                </div>
                <div key="risk">
                    <RiskManagementBox className="h-full w-full" />
                </div>
                <div key="strat">
                    <StrategyParametersBox className="h-full w-full" />
                </div>
                <div key="fantasy">
                    <FantasyFinanceBox className="h-full w-full" />
                </div>

                {/* Batch 1 Squares */}
                <div key="funding">
                    <FundingRateTrackerSquare className="h-full w-full" />
                </div>
                <div key="depth">
                    <OrderBookDepthSquare className="h-full w-full" />
                </div>
                <div key="heatmap">
                    <LiquidationHeatmapSquare className="h-full w-full" />
                </div>
                <div key="whale">
                    <WhaleAlertSquare className="h-full w-full" />
                </div>
                <div key="corr">
                    <CorrelationMatrixSquare className="h-full w-full" />
                </div>

                {/* Batch 2 Squares */}
                <div key="delta">
                    <DeltaExposureSquare className="h-full w-full" />
                </div>
                <div key="slippage">
                    <SlippageMonitorSquare className="h-full w-full" />
                </div>
                <div key="orderflow">
                    <OrderFlowImbalanceSquare className="h-full w-full" />
                </div>
                <div key="fomo">
                    <FomoMeterSquare className="h-full w-full" />
                </div>
                <div key="gridviz">
                    <GridBotVisualizerSquare className="h-full w-full" />
                </div>

                {/* Batch 3 Squares */}
                <div key="cvd">
                    <CvdSquare className="h-full w-full" />
                </div>
                <div key="pressure">
                    <OrderBookPressureSquare className="h-full w-full" />
                </div>
                <div key="pnlsplit">
                    <PnlSplitSquare className="h-full w-full" />
                </div>
                <div key="holdtime">
                    <AvgHoldTimeSquare className="h-full w-full" />
                </div>
                <div key="stratpie">
                    <StrategyContributionSquare className="h-full w-full" />
                </div>

                {/* Batch 4 Squares */}
                <div key="radar">
                    <ExchangeLatencyRadarSquare className="h-full w-full" />
                </div>
                <div key="pf">
                    <ProfitFactorTimelineSquare className="h-full w-full" />
                </div>
                <div key="moon">
                    <MoonBagTrackerSquare className="h-full w-full" />
                </div>
                <div key="rebal">
                    <AutoRebalanceSquare className="h-full w-full" />
                </div>
                <div key="mood">
                    <EmpireMoodRingSquare className="h-full w-full" />
                </div>

                {/* Batch 5 Squares */}
                <div key="tape">
                    <RealTimeOrderFlowSquare className="h-full w-full" />
                </div>
                <div key="vwap">
                    <VwapDeviationSquare className="h-full w-full" />
                </div>
                <div key="orders">
                    <ActiveOrdersLadderSquare className="h-full w-full" />
                </div>
                <div key="sharpe">
                    <RollingSharpeSquare className="h-full w-full" />
                </div>
                <div key="age">
                    <PositionAgeHeatmapSquare className="h-full w-full" />
                </div>

                {/* Batch 6 Squares */}
                <div key="iceberg">
                    <IcebergDetectorSquare className="h-full w-full" />
                </div>
                <div key="candle">
                    <ConsecutiveCandleSquare className="h-full w-full" />
                </div>
                <div key="smart">
                    <SmartMoneyFlowSquare className="h-full w-full" />
                </div>
                <div key="oco">
                    <OcoManagerSquare className="h-full w-full" />
                </div>
                <div key="limit">
                    <DailyLossLimitSquare className="h-full w-full" />
                </div>

                {/* Batch 7 Squares */}
                <div key="fund_v2">
                    <FundingRateAlert className="h-full w-full" />
                </div>
                <div key="liq_v2">
                    <LiquidationHeatmapV2 className="h-full w-full" />
                </div>
                <div key="sent">
                    <SentimentStream className="h-full w-full" />
                </div>
                <div key="whale_v2">
                    <WhaleWatcherV2 className="h-full w-full" />
                </div>
                <div key="gas">
                    <GasFeeTracker className="h-full w-full" />
                </div>
                <div key="rebal_v2">
                    <PortfolioRebalance className="h-full w-full" />
                </div>

                {/* Batch 8 Squares */}
                <div key="paper">
                    <PaperTradingMirror className="h-full w-full" />
                </div>
                <div key="leader">
                    <LeaderboardLive className="h-full w-full" />
                </div>
                <div key="deploy">
                    <OneClickDeploy className="h-full w-full" />
                </div>

            </ResponsiveGridLayout>
        </div>
    );
};

export default LegionGrid;
