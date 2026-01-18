
import React from 'react';
import { InventoryRecord } from '../types';
import { MetricsBarChart } from './Charts';
import { Zap, ShieldCheck, Layers } from 'lucide-react';

interface MetricsProps {
  data: InventoryRecord[];
}

export const Metrics: React.FC<MetricsProps> = ({ data }) => {
  const branchMetrics = React.useMemo(() => {
    const map = new Map<string, { branchName: string, stockIn: number, stockOut: number, stockRemaining: number }>();
    data.forEach(item => {
      const existing = map.get(item.branchName) || { branchName: item.branchName, stockIn: 0, stockOut: 0, stockRemaining: 0 };
      existing.stockIn += item.stockIn;
      existing.stockOut += item.stockOut;
      existing.stockRemaining += item.currentCount;
      map.set(item.branchName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.stockIn - a.stockIn);
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="px-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Branch Stats</h2>
        <p className="text-sm md:text-base text-slate-500">Track stock movement and remaining balance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: <Zap size={20} />, label: 'Inflow Speed', value: 'Active', color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: <ShieldCheck size={20} />, label: 'Accuracy', value: 'High', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: <Layers size={20} />, label: 'Stock Levels', value: 'Balanced', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-[28px] p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-[20px] ${item.bg} ${item.color} shrink-0`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">{item.label}</p>
              <p className="text-lg font-bold text-slate-900 truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Stock In vs. Remaining</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Compare stock coming in vs. stock remaining in the warehouse.</p>
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:inline">Sort:</span>
             <select className="w-full sm:w-48 bg-slate-50 border border-slate-100 text-[11px] font-bold uppercase tracking-widest py-3 px-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all appearance-none">
              <option>Total In</option>
              <option>Total Remaining</option>
            </select>
          </div>
        </div>
        
        <div className="w-full overflow-hidden">
          <MetricsBarChart data={branchMetrics} />
        </div>
      </div>
    </div>
  );
};
