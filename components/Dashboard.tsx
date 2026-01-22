import React, { useMemo } from 'react';
import { InventoryRecord, DailyStats, ProductCategory } from '../types';
import { StockVelocityChart, Sparkline } from './Charts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Warehouse,
  Globe
} from 'lucide-react';

interface DashboardProps {
  data: InventoryRecord[];
  insights?: string[] | null;
  category: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
}

const KPICard: React.FC<{ 
  title: string; 
  value: string; 
  trend: number; 
  icon: React.ReactNode; 
  sparkData: number[];
}> = ({ title, value, trend, icon, sparkData }) => (
  <div className="group bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 text-slate-900">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 rounded-2xl transition-all duration-300 bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkline data={sparkData} color={trend > 0 ? '#10b981' : '#f43f5e'} />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-slate-400">{title}</p>
      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</h3>
        <span className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data, insights, category, onCategoryChange }) => {
  const calculations = useMemo(() => {
    const dailyStatsMap = new Map<string, DailyStats>();
    let globalTotal = 0;
    let mainBranchTotal = 0;

    data.forEach(item => {
      // Aggregate Daily Stats
      const existing = dailyStatsMap.get(item.date) || { date: item.date, stockIn: 0, stockOut: 0, count: 0 };
      existing.stockIn += item.stockIn;
      existing.stockOut += item.stockOut;
      existing.count += item.currentCount;
      dailyStatsMap.set(item.date, existing);

      // Aggregate Global Stock
      globalTotal += item.currentCount;

      // Aggregate Main Branch Stock
      const isMain = item.branchName.toLowerCase().includes('main') || item.branchName.toLowerCase().includes('hub');
      if (isMain) {
        mainBranchTotal += item.currentCount;
      }
    });

    const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return { dailyStats, globalTotal, mainBranchTotal };
  }, [data]);

  const { dailyStats, globalTotal, mainBranchTotal } = calculations;

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header with Title and Tri-State Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time status of {category === 'both' ? 'complete network' : category.replace('-', ' ')}.</p>
        </div>

        {/* Professional White Tri-State Toggle */}
        <div className="bg-white p-1 rounded-2xl flex items-center shadow-sm border border-slate-200 shrink-0 self-start md:self-center">
          {[
            { id: 'power-stations', label: 'Power Stations' },
            { id: 'accessories', label: 'Accessories' },
            { id: 'both', label: 'Both' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id as ProductCategory)}
              className={`
                px-5 py-2.5 rounded-[14px] text-[11px] font-bold transition-all duration-300 whitespace-nowrap
                ${category === cat.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <KPICard 
          title="Total Stock (Global)" 
          value={globalTotal.toLocaleString()} 
          trend={12.5} 
          icon={<Globe size={24} />} 
          sparkData={[40, 45, 42, 50, 55, 60, 65]}
        />
        <KPICard 
          title="Total Stock (Main Branch)" 
          value={mainBranchTotal.toLocaleString()} 
          trend={-2.4} 
          icon={<Warehouse size={24} />} 
          sparkData={[60, 58, 55, 52, 50, 48, 47]}
        />
      </div>

      {/* AI Strategy Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-indigo-950 rounded-[40px] p-8 lg:p-10 text-white shadow-2xl shadow-indigo-900/20 border border-indigo-900/50 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600/30 rounded-2xl">
              <Sparkles className="text-indigo-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Strategy Analysis</h3>
              <p className="text-xs text-indigo-300 font-medium">Data-driven intelligence for {category.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <p className="text-sm leading-relaxed text-indigo-100 italic group-hover:text-white transition-colors">"{insight}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-Series Charts - Spanning full width */}
      <div className="bg-white border border-slate-200 rounded-[40px] p-8 lg:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Inbound vs. Outbound Rate</h3>
            <p className="text-sm text-slate-500 mt-1">Daily flow of {category === 'both' ? 'all' : category.replace('-', ' ')} inventory units.</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Inbound Rate
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
              Outbound Rate
            </div>
          </div>
        </div>
        <div className="h-[400px]">
          <StockVelocityChart data={dailyStats.slice(-7)} />
        </div>
      </div>
    </div>
  );
};
