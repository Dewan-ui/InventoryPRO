
import React from 'react';
import { InventoryRecord, DailyStats } from '../types';
import { StockVelocityChart, Sparkline } from './Charts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Package, MapPin } from 'lucide-react';

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
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-600">
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
  
  const totalValue = data.reduce((acc, curr) => acc + (curr.currentCount * 800), 0); // Mock value calculation
  const totalItems = data.reduce((acc, curr) => acc + curr.currentCount, 0);
  
  // Find top moving branch
  const branchInflows = data.reduce((acc, curr) => {
    acc[curr.branchName] = (acc[curr.branchName] || 0) + curr.stockOut;
    return acc;
  }, {} as Record<string, number>);
  
  // Fix: Explicitly cast values to number for sorting to avoid arithmetic errors on potentially inferred unknown types
  const topBranch = Object.entries(branchInflows).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-slate-500">Real-time performance metrics and inventory velocity.</p>
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
          <h3 className="text-lg font-bold mb-6">Recent Alerts</h3>
          <div className="space-y-4 flex-1">
            {[
              { label: 'Low Stock: iPhone 15', branch: 'Dubai Mall', time: '2m ago', type: 'warning' },
              { label: 'Bulk Transfer Complete', branch: 'Global Village', time: '1h ago', type: 'success' },
              { label: 'Discrepancy Detected', branch: 'Emirates Towers', time: '4h ago', type: 'error' },
            ].map((alert, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors group">
                <div className={`w-1.5 rounded-full ${
                  alert.type === 'warning' ? 'bg-amber-400' : 
                  alert.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{alert.label}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500">{alert.branch}</span>
                    <span className="text-[10px] text-slate-400">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors border border-dashed border-indigo-200">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
};
