import React from 'react';
import EmpireBox from '../EmpireBox';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Grid', value: 42, color: '#10b981' }, // Emerald
  { name: 'Scalp', value: 28, color: '#06b6d4' }, // Cyan
  { name: 'Arb', value: 18, color: '#f59e0b' }, // Amber
  { name: 'HODL', value: 12, color: '#64748b' }, // Slate
];

const StrategyContributionSquare = () => {
    return (
        <EmpireBox title="Strategy Contribution" theme="void" height="h-full">
            <div className="flex h-full items-center">
                <div className="h-full w-1/2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={40}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="w-1/2 flex flex-col justify-center gap-1.5 pr-2">
                    {data.map(d => (
                        <div key={d.name} className="flex justify-between items-center text-[10px] cursor-pointer hover:opacity-100 opacity-80 transition-opacity group">
                             <div className="flex items-center gap-1.5">
                                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                 <span className="text-slate-300">{d.name}</span>
                             </div>
                             <span className="font-mono font-bold group-hover:text-white transition-colors">{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </EmpireBox>
    );
};

export default StrategyContributionSquare;
