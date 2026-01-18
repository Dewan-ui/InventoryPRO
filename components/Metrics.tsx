
import React from 'react';
import { InventoryRecord } from '../types';
import { MetricsBarChart } from './Charts';
import { Zap, ShieldCheck, RefreshCw } from 'lucide-react';

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Efficiency Metrics</h2>
        <p className="text-slate-500">Analyzing stock retention and distribution efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Zap size={20} />, label: 'Inflow Velocity', value: 'High', color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: <ShieldCheck size={20} />, label: 'Data Accuracy', value: '99.4%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: <RefreshCw size={20} />, label: 'Sync Status', value: 'Live', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold">Inflow vs. Retention</h3>
            <p className="text-sm text-slate-500">Comparison of total stock brought in versus current inventory levels.</p>
          </div>
          <select className="bg-slate-50 border-none text-xs font-semibold py-2 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>Highest Inflow</option>
            <option>Lowest Retention</option>
          </select>
        </div>
        <MetricsBarChart data={branchMetrics} />
      </div>
    </div>
  );
};
