
import React, { useState, useEffect } from 'react';
import { InventoryRecord, DailyStats } from '../types';
import { StockVelocityChart, Sparkline } from './Charts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Package, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import { getInventoryInsights } from '../services/aiService';

interface DashboardProps {
  data: InventoryRecord[];
}

const KPICard: React.FC<{ 
  title: string; 
  value: string; 
  trend: number; 
  icon: React.ReactNode; 
  sparkData: number[];
}> = ({ title, value, trend, icon, sparkData }) => (
  <div className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <Sparkline data={sparkData} color={trend > 0 ? '#10b981' : '#f43f5e'} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        <span className={`text-xs font-semibold flex items-center gap-0.5 mb-1.5 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [aiInsight, setAiInsight] = useState<string>("Analyzing current trends...");
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      setIsAiLoading(true);
      const insight = await getInventoryInsights(data);
      setAiInsight(insight || "Optimization suggested for low-velocity items.");
      setIsAiLoading(false);
    };
    fetchAI();
  }, [data]);

  // Aggregate daily stats
  const dailyStatsMap = new Map<string, DailyStats>();
  data.forEach(item => {
    const existing = dailyStatsMap.get(item.date) || { date: item.date, stockIn: 0, stockOut: 0, count: 0 };
    existing.stockIn += item.stockIn;
    existing.stockOut += item.stockOut;
    existing.count += item.currentCount;
    dailyStatsMap.set(item.date, existing);
  });

  const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalValue = data.reduce((acc, curr) => acc + (curr.currentCount * 800), 0);
  const totalItems = data.reduce((acc, curr) => acc + curr.currentCount, 0);
  
  const branchInflows = data.reduce((acc, curr) => {
    acc[curr.branchName] = (acc[curr.branchName] || 0) + curr.stockOut;
    return acc;
  }, {} as Record<string, number>);
  
  const topBranch = Object.entries(branchInflows).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
          <p className="text-slate-500">Real-time performance metrics and inventory velocity.</p>
        </div>
        
        {/* AI Insight Pill */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 max-w-md animate-in slide-in-from-right-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-indigo-600 animate-pulse" size={16} />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">AI Strategy Engine</span>
          </div>
          <p className={`text-xs text-indigo-900/80 leading-relaxed italic ${isAiLoading ? 'animate-pulse' : ''}`}>
            {aiInsight}
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Inventory Value" 
          value={`$${(totalValue / 1000).toFixed(1)}k`} 
          trend={12.5} 
          icon={<DollarSign size={20} />} 
          sparkData={[40, 45, 42, 50, 48, 55, 60]}
        />
        <KPICard 
          title="Total Items Stocked" 
          value={totalItems.toLocaleString()} 
          trend={-2.4} 
          icon={<Package size={20} />} 
          sparkData={[60, 58, 62, 55, 50, 52, 48]}
        />
        <KPICard 
          title="Top Activity Hub" 
          value={topBranch.split(' ')[0]} 
          trend={8.2} 
          icon={<MapPin size={20} />} 
          sparkData={[30, 35, 45, 42, 50, 55, 65]}
        />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Stock Velocity</h3>
              <p className="text-sm text-slate-500">Inbound vs Outbound tracking (7 Days)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span className="text-slate-600">Stock In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="text-slate-600">Stock Out</span>
              </div>
            </div>
          </div>
          <StockVelocityChart data={dailyStats.slice(-7)} />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Active Issues</h3>
            <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">3 Priority</span>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { label: 'Critical: Stock Depleted', branch: 'Dubai Mall', time: 'Just now', type: 'error', item: 'iPhone 15 Pro' },
              { label: 'Data Sync Delay', branch: 'Network', time: '12m ago', type: 'warning', item: 'System-wide' },
              { label: 'Unusual Outflow Spike', branch: 'Al Wahda', time: '1h ago', type: 'warning', item: 'iPad Air' },
            ].map((alert, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group hover:bg-white hover:shadow-md">
                <div className={`p-2 rounded-xl h-fit ${
                  alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{alert.label}</p>
                  <p className="text-xs text-slate-500 mb-2">{alert.item}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium text-slate-400 uppercase">{alert.branch}</span>
                    <span className="text-[10px] text-slate-400">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 py-3 text-sm font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-dashed border-slate-200 hover:border-indigo-300">
            View All Resolution Center
          </button>
        </div>
      </div>
    </div>
  );
};
