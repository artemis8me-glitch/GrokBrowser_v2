import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Slider, Select, MenuItem, InputLabel, FormControl, TextField, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Play, Settings, Activity, Layers, BarChart2, X } from 'lucide-react';

// Import RGL styles if not globally imported
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- THEME & STYLES ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#b026ff' }, // Neon Purple
    secondary: { main: '#00f0ff' }, // Neon Blue
    background: { default: '#000000', paper: '#0a0a0a' },
    text: { primary: '#ffffff', secondary: '#aaaaaa' },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiSlider: {
      styleOverrides: {
        root: { color: '#b026ff' },
        thumb: { boxShadow: '0 0 10px #b026ff' },
        track: { boxShadow: '0 0 5px #b026ff' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { color: '#ffffff', borderColor: '#333' },
        icon: { color: '#b026ff' },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
            color: '#fff',
            fontFamily: 'Rajdhani',
            '& fieldset': { borderColor: '#333' },
            '&:hover fieldset': { borderColor: '#b026ff' },
            '&.Mui-focused fieldset': { borderColor: '#00f0ff' },
        }
      }
    },
    MuiInputLabel: {
        styleOverrides: {
            root: { color: '#aaa', fontFamily: 'Rajdhani', '&.Mui-focused': { color: '#00f0ff' } }
        }
    },
    MuiButton: {
        styleOverrides: {
            root: { fontFamily: 'Rajdhani', fontWeight: 'bold' }
        }
    }
  },
});

const styles = {
  container: {
    backgroundColor: '#000',
    height: '100%',
    color: '#fff',
    fontFamily: 'Rajdhani, sans-serif',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '10px',
  },
  square: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)',
    transition: 'border-color 0.3s',
  },
  squareHeader: {
    padding: '8px 12px',
    borderBottom: '1px solid #222',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#00f0ff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(90deg, rgba(176, 38, 255, 0.1) 0%, transparent 100%)',
    letterSpacing: '1px',
    cursor: 'move',
  },
  content: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    position: 'relative',
  },
  statValue: { fontSize: '24px', fontWeight: 'bold', fontFamily: 'Rajdhani' },
  statLabel: { fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' },
  positive: { color: '#39ff14', textShadow: '0 0 5px rgba(57, 255, 20, 0.5)' },
  negative: { color: '#ff3131', textShadow: '0 0 5px rgba(255, 49, 49, 0.5)' },
  neutral: { color: '#00f0ff' },
  tableHeader: { color: '#888', fontSize: '10px', textAlign: 'left', paddingBottom: '10px', borderBottom: '1px solid #222' },
  tableCell: { padding: '8px 0', borderBottom: '1px solid #111', fontSize: '12px', fontFamily: 'Rajdhani' },
  runBtn: {
    background: 'linear-gradient(45deg, #00f0ff 0%, #b026ff 100%)',
    border: 0,
    borderRadius: 4,
    boxShadow: '0 0 15px rgba(176, 38, 255, 0.4)',
    color: 'white',
    height: 40,
    width: '100%',
    fontWeight: 'bold',
    marginTop: '20px',
    fontSize: '14px',
    letterSpacing: '1px',
    transition: 'all 0.3s'
  },
  progressBar: {
    height: '2px',
    backgroundColor: '#222',
    marginTop: '15px',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00f0ff',
    boxShadow: '0 0 10px #00f0ff',
    transition: 'width 0.1s linear',
  },
};

// --- MOCK DATA ---
const initialChartData = Array.from({ length: 50 }, (_, i) => ({
  name: `Day ${i}`,
  uv: 0,
}));

const simulatedChartData = Array.from({ length: 50 }, (_, i) => ({
    name: `Day ${i}`,
    uv: Math.max(0, i * 1000 + (Math.random() - 0.5) * 5000),
}));

// --- SUB-COMPONENTS ---

const StrategyParams = ({ onRun, isRunning, progress }) => {
  const [params, setParams] = useState({
    lookback: 120,
    entry: 0.8,
    exit: -0.8,
    stopLoss: 2.0,
    takeProfit: 4.5,
    capital: 100000,
    exchange: 'Binance',
    pair: 'BTC/USDT'
  });

  const handleChange = (key, value) => setParams(prev => ({ ...prev, [key]: value }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <InputLabel style={{ color: '#aaa', fontSize: '10px', marginBottom: '5px' }}>LOOKBACK (CANDLES): <span style={{color:'#fff'}}>{params.lookback}</span></InputLabel>
        <Slider
          value={params.lookback}
          min={10} max={500}
          onChange={(_, v) => handleChange('lookback', v)}
          size="small"
        />
      </div>
      <div>
        <InputLabel style={{ color: '#aaa', fontSize: '10px', marginBottom: '5px' }}>ENTRY THRESHOLD: <span style={{color:'#fff'}}>{params.entry}%</span></InputLabel>
        <Slider
          value={params.entry}
          min={-1.5} max={1.5} step={0.1}
          onChange={(_, v) => handleChange('entry', v)}
          size="small"
        />
      </div>
      <div style={{display: 'flex', gap: '10px'}}>
          <div style={{flex: 1}}>
            <InputLabel style={{ color: '#aaa', fontSize: '10px', marginBottom: '5px' }}>STOP LOSS: <span style={{color:'#ff3131'}}>{params.stopLoss}%</span></InputLabel>
            <Slider value={params.stopLoss} min={0} max={5} step={0.1} onChange={(_, v) => handleChange('stopLoss', v)} size="small" />
          </div>
          <div style={{flex: 1}}>
            <InputLabel style={{ color: '#aaa', fontSize: '10px', marginBottom: '5px' }}>TAKE PROFIT: <span style={{color:'#39ff14'}}>{params.takeProfit}%</span></InputLabel>
            <Slider value={params.takeProfit} min={0} max={10} step={0.1} onChange={(_, v) => handleChange('takeProfit', v)} size="small" />
          </div>
      </div>

      <TextField
        label="INITIAL CAPITAL"
        variant="outlined"
        size="small"
        fullWidth
        value={params.capital}
        onChange={(e) => handleChange('capital', e.target.value)}
        sx={{ input: { fontFamily: 'Rajdhani', fontSize: '14px' } }}
      />

      <FormControl fullWidth size="small">
        <InputLabel>EXCHANGE</InputLabel>
        <Select
          value={params.exchange}
          label="EXCHANGE"
          onChange={(e) => handleChange('exchange', e.target.value)}
          sx={{ fontSize: '14px' }}
        >
          <MenuItem value="Binance">Binance</MenuItem>
          <MenuItem value="FTX">FTX</MenuItem>
          <MenuItem value="Coinbase">Coinbase Pro</MenuItem>
        </Select>
      </FormControl>

      <Button
        style={styles.runBtn}
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning ? 'PROCESSING...' : 'RUN SIMULATION'}
      </Button>
      {isRunning && (
          <div style={{textAlign: 'center', marginTop: '5px', color: '#00f0ff', fontSize: '10px', fontFamily: 'Rajdhani'}}>
              CALCULATING... {progress}%
              <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, width: `${progress}%`}}></div>
              </div>
          </div>
      )}
    </div>
  );
};

const HistoricalPerformance = ({ data }) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b026ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#b026ff" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#333" tick={{fontSize: 10}} />
            <YAxis stroke="#333" tick={{fontSize: 10}} />
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', fontSize: '12px' }} />
            <Area type="monotone" dataKey="uv" stroke="#b026ff" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const KeyMetrics = ({ simulated }) => {
    const metrics = simulated ? {
        success: '72.5%',
        trades: '1,240',
        avgProfit: '$36.45',
        drawdown: '-12.1%',
        sharpe: '2.1',
        latency: '45ms',
    } : {
        success: '0.0%',
        trades: '0',
        avgProfit: '$0.00',
        drawdown: '0.0%',
        sharpe: '0.0',
        latency: '-',
    };

    const Metric = ({ label, value, type }) => (
        <div className="bg-[#111] border border-[#222] p-2 rounded flex flex-col justify-center">
            <div style={styles.statLabel}>{label}</div>
            <div style={{...styles.statValue, ...(type === 'pos' ? styles.positive : type === 'neg' ? styles.negative : styles.neutral)}}>{value}</div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-2 h-full">
            <Metric label="Success Rate" value={metrics.success} type="pos" />
            <Metric label="Total Trades" value={metrics.trades} />
            <Metric label="Avg Profit" value={metrics.avgProfit} type="pos" />
            <Metric label="Max Drawdown" value={metrics.drawdown} type="neg" />
            <Metric label="Sharpe Ratio" value={metrics.sharpe} />
            <Metric label="Latency" value={metrics.latency} />
        </div>
    );
};

const AssetAllocation = () => {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '10px' }}>
        {[
            { label: 'BTC', val: 45, color: '#00f0ff' },
            { label: 'ETH', val: 30, color: '#b026ff' },
            { label: 'SOL', val: 15, color: '#39ff14' },
            { label: 'USDT', val: 10, color: '#555' }
        ].map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '20%' }}>
                <div className="relative w-full group flex items-end justify-center" style={{height: '100%'}}>
                    <div style={{ width: '100%', background: item.color, height: `${item.val}%`, borderRadius: '2px 2px 0 0', opacity: 0.8, boxShadow: `0 0 10px ${item.color}40` }}></div>
                    <span className="absolute bottom-full mb-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{item.val}%</span>
                </div>
                <span style={{ marginTop: '5px', fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>{item.label}</span>
            </div>
        ))}
    </div>
  );
};

const RecentTrades = () => (
    <div style={{overflowY: 'auto', height: '100%'}} className="custom-scrollbar">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10}}>
                <tr>
                    <th style={styles.tableHeader}>PAIR</th>
                    <th style={styles.tableHeader}>TYPE</th>
                    <th style={styles.tableHeader}>PRICE</th>
                    <th style={styles.tableHeader}>PNL</th>
                </tr>
            </thead>
            <tbody>
                {[1,2,3,4,5,6].map(i => (
                    <tr key={i}>
                        <td style={styles.tableCell}>BTC/USDT</td>
                        <td style={{...styles.tableCell, color: i%2===0 ? '#39ff14' : '#ff3131'}}>{i%2===0 ? 'BUY' : 'SELL'}</td>
                        <td style={styles.tableCell}>${(23500 + i*100).toLocaleString()}</td>
                        <td style={{...styles.tableCell, color: i%2===0 ? '#39ff14' : '#ff3131'}}>{i%2===0 ? '+$420' : '-$150'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- MAIN COMPONENT ---

const StrategyLab = () => {
    const [layout, setLayout] = useState({
        lg: [
            { i: 'params', x: 0, y: 0, w: 3, h: 14 },
            { i: 'chart', x: 3, y: 0, w: 6, h: 10 },
            { i: 'metrics', x: 9, y: 0, w: 3, h: 8 },
            { i: 'allocation', x: 3, y: 10, w: 6, h: 4 },
            { i: 'trades', x: 9, y: 8, w: 3, h: 6 },
        ]
    });

    const [chartData, setChartData] = useState(initialChartData);
    const [isSimulated, setIsSimulated] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleRunSimulation = () => {
        setIsRunning(true);
        setIsSimulated(false);
        setChartData(initialChartData);
        setProgress(0);

        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setIsRunning(false);
                setIsSimulated(true);
                setChartData(simulatedChartData);
            }
        }, 30);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div style={{position: 'relative', height: '100%', width: '100%', overflow: 'hidden'}}>
                
                <div style={styles.container} className="transition-opacity duration-1000 opacity-100">
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layout}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={30}
                        draggableHandle=".drag-handle"
                        onLayoutChange={(l) => setLayout({ lg: l })}
                    >
                        <div key="params" style={styles.square}>
                            <div className="drag-handle" style={styles.squareHeader}>
                                <span>STRATEGY PARAMETERS</span>
                                <Settings size={14} />
                            </div>
                            <div style={styles.content}>
                                <StrategyParams
                                    onRun={handleRunSimulation}
                                    isRunning={isRunning}
                                    progress={progress}
                                />
                            </div>
                        </div>

                        <div key="chart" style={styles.square}>
                             <div className="drag-handle" style={styles.squareHeader}>
                                <span>CUMULATIVE PnL (USDT)</span>
                                <Activity size={14} />
                            </div>
                            <div style={styles.content}>
                                <HistoricalPerformance data={chartData} />
                            </div>
                        </div>

                        <div key="metrics" style={styles.square}>
                            <div className="drag-handle" style={styles.squareHeader}>
                                <span>KEY METRICS</span>
                                <Layers size={14} />
                            </div>
                            <div style={styles.content}>
                                <KeyMetrics simulated={isSimulated} />
                            </div>
                        </div>

                        <div key="allocation" style={styles.square}>
                             <div className="drag-handle" style={styles.squareHeader}>
                                <span>ASSET ALLOCATION (EOP)</span>
                                <BarChart2 size={14} />
                            </div>
                            <div style={styles.content}>
                                <AssetAllocation />
                            </div>
                        </div>

                        <div key="trades" style={styles.square}>
                             <div className="drag-handle" style={styles.squareHeader}>
                                <span>RECENT TRADES</span>
                                <Settings size={14} />
                            </div>
                             <div style={styles.content}>
                                <RecentTrades />
                            </div>
                        </div>

                    </ResponsiveGridLayout>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default StrategyLab;
