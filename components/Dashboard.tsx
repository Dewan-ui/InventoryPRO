
import React from 'react';
import { InventoryRecord, DailyStats } from '../types';
import { StockVelocityChart, Sparkline } from './Charts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Package, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

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
  <div className="group bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkline data={sparkData} color={trend > 0 ? '#10b981' : '#f43f5e'} />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        <span className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
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
  const topBranch = Object.entries(branchInflows).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'Main Hub';

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">Inventory Dashboard</h2>
          <p className="text-slate-500 font-medium">Overview of stock levels and movement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <KPICard 
          title="Total Value" 
          value={`$${(totalValue / 1000).toFixed(1)}k`} 
          trend={12.5} 
          icon={<DollarSign size={24} />} 
          sparkData={[30, 35, 32, 45, 40, 50, 55]}
        />
        <KPICard 
          title="Total Stock" 
          value={totalItems.toLocaleString()} 
          trend={-2.4} 
          icon={<Package size={24} />} 
          sparkData={[50, 48, 52, 45, 42, 40, 38]}
        />
        <KPICard 
          title="Top Branch" 
          value={topBranch.split(' ')[0]} 
          trend={8.9} 
          icon={<MapPin size={24} />} 
          sparkData={[20, 25, 40, 35, 50, 55, 60]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-[40px] p-8 lg:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Stock Trends</h3>
              <p className="text-sm text-slate-500 mt-1">Movement over the last 7 days.</p>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Inbound
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                Outbound
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <StockVelocityChart data={dailyStats.slice(-7)} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[40px] p-8 lg:p-10 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Alerts</h3>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { label: 'High Outflow', branch: 'Retail Hub', time: 'Just now', type: 'warning', icon: <ArrowUpRight size={16} /> },
              { label: 'Low Stock', branch: 'Dist. Center', time: '18m ago', type: 'error', icon: <AlertTriangle size={16} /> },
              { label: 'Sync Status', branch: 'Database', time: '2h ago', type: 'success', icon: <RefreshCw size={16} /> },
            ].map((alert, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all duration-300 cursor-pointer group">
                <div className={`p-2.5 rounded-2xl h-fit shrink-0 transition-colors ${
                  alert.type === 'error' ? 'bg-rose-100 text-rose-600' : 
                  alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{alert.label}</p>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">{alert.time}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.branch}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-slate-900 rounded-2xl transition-all duration-300 border border-dashed border-slate-200 hover:border-slate-900 active:scale-95">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
