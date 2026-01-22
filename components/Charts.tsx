
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';

interface StockVelocityChartProps {
  data: any[];
}

export const StockVelocityChart: React.FC<StockVelocityChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="stockIn" 
            stroke="#4f46e5" 
            fillOpacity={1} 
            fill="url(#colorIn)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="stockOut" 
            stroke="#94a3b8" 
            fillOpacity={1} 
            fill="url(#colorOut)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MetricsBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="branchName" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <Tooltip 
             cursor={{ fill: 'transparent' }}
             contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="stockIn" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} name="Stock In" />
          <Bar dataKey="stockRemaining" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={12} name="Stock Remaining" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BranchStockChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#64748b' }}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#64748b' }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '11px'
            }}
          />
          <Bar 
            dataKey="qty" 
            fill="#4f46e5" 
            radius={[6, 6, 0, 0]} 
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const Sparkline: React.FC<{ data: number[], color?: string }> = ({ data, color = "#4f46e5" }) => {
  const chartData = data.map((val, i) => ({ val, i }));
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            fill="transparent" 
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
