
import React, { useState, useMemo, useEffect } from 'react';
import { InventoryRecord } from '../types';
import { BranchStockChart } from './Charts';
import { 
  Search, 
  MoreVertical, 
  Package, 
  Truck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight,
  MapPin,
  AlertCircle
} from 'lucide-react';

interface InventoryProps {
  data: InventoryRecord[];
}

export const Inventory: React.FC<InventoryProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemsPerPage = 10;

  const safeData = useMemo(() => data || [], [data]);

  const branches = useMemo(() => {
    const b = [...new Set(safeData.map(d => d.branchName))].filter(Boolean);
    return b.length > 0 ? b : ['Main Hub'];
  }, [safeData]);

  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  useEffect(() => {
    if (!branches.includes(selectedBranch)) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  const branchData = useMemo(() => {
    return safeData.filter(record => record.branchName === selectedBranch);
  }, [safeData, selectedBranch]);

  const insights = useMemo(() => {
    if (branchData.length === 0) return null;

    const sortedByCount = [...branchData].sort((a, b) => (b.currentCount || 0) - (a.currentCount || 0));
    const highestStock = sortedByCount[0];
    
    const inbounds = branchData.filter(d => d.stockIn > 0)
      .sort((a, b) => {
        const getTime = (d: string) => {
          const parsed = new Date(d).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };
        return getTime(b.date) - getTime(a.date);
      });
    const lastInbound = inbounds[0];

    const skuMap = new Map<string, number>();
    branchData.forEach(item => {
      if (item.deviceName) {
        skuMap.set(item.deviceName, (skuMap.get(item.deviceName) || 0) + (item.currentCount || 0));
      }
    });
    
    const chartData = Array.from(skuMap.entries())
      .map(([name, qty]) => ({ 
        name: name ? name.split(' ')[0] : 'Unknown', 
        full: name || 'Unknown SKU', 
        qty 
      }))
      .filter(item => item.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return { highestStock, lastInbound, chartData };
  }, [branchData]);

  const filteredTableData = useMemo(() => {
    const uniqueSKUs: Record<string, InventoryRecord> = {};
    branchData.forEach(record => {
      if (record.deviceName) {
        if (!uniqueSKUs[record.deviceName] || (record.currentCount || 0) > (uniqueSKUs[record.deviceName].currentCount || 0)) {
          uniqueSKUs[record.deviceName] = record;
        }
      }
    });
    
    return Object.values(uniqueSKUs).filter(record => 
      record.deviceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branchData, searchTerm]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage);
  const paginatedData = filteredTableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 relative">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{selectedBranch}</h2>
          <p className="text-sm text-slate-500 font-medium">Branch operations and local SKU inventory allocation.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95 group"
            >
              <MoreVertical size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-[28px] shadow-2xl z-50 animate-in fade-in zoom-in-95 p-2 origin-top-right">
                  <div className="p-4 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Branch</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                    {branches.map(branch => (
                      <button
                        key={branch}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setIsMenuOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          selectedBranch === branch 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 lg:p-10 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500 min-h-[220px]">
          <div className="absolute -top-6 -right-6 p-8 text-indigo-50/20 group-hover:text-indigo-100/30 transition-colors">
            <TrendingUp size={160} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                <Package size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Leader</p>
                <h4 className="text-sm font-bold text-slate-900">Highest In-Stock SKU</h4>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-4 truncate pr-12">
              {insights?.highestStock?.deviceName || 'Data Sync Required'}
            </h3>
            
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black text-indigo-600 tracking-tighter">
                {(insights?.highestStock?.currentCount || 0).toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Units Available</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 lg:p-10 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 min-h-[220px]">
          <div className="absolute -top-6 -right-6 p-8 text-white/5 group-hover:text-white/10 transition-colors">
            <Clock size={160} />
          </div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-4 bg-white/10 text-white rounded-3xl">
                <Truck size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Flow</p>
                <h4 className="text-sm font-bold text-indigo-100">Latest Movement</h4>
              </div>
            </div>

            {insights?.lastInbound ? (
              <>
                <h3 className="text-2xl font-black mb-2 truncate pr-12 text-white">
                  {insights.lastInbound.deviceName}
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      +{insights.lastInbound.stockIn?.toLocaleString() || '0'}
                    </span>
                    <span className="text-sm font-bold text-indigo-300">Units Received</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-2 px-4 bg-white/5 rounded-2xl w-fit border border-white/5">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Updated: {insights.lastInbound.date}</span>
                    </div>
                    {insights.lastInbound.remarks && (
                      <div className="flex items-center gap-2 text-indigo-300">
                        <MapPin size={14} className="text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-widest">Ref: {insights.lastInbound.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10">
                <p className="text-slate-500 italic font-medium">No recent inbound activity detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] p-8 lg:p-10 shadow-sm">
        <div className="mb-12">
          <h3 className="text-xl font-black text-slate-900 mb-1">Local Stock Concentration</h3>
          <p className="text-sm text-slate-500 font-medium">Top 10 SKU distribution in {selectedBranch}.</p>
        </div>
        <div className="h-[400px]">
          {insights?.chartData && insights.chartData.length > 0 ? (
            <BranchStockChart data={insights.chartData} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
               <AlertCircle size={32} className="opacity-20" />
               <p className="text-sm italic">Insufficient data for concentration analysis.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-slate-900">
          <div>
            <h3 className="text-xl font-black mb-1">SKU Audit Log</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Branch Database Access</p>
          </div>
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white transition-all outline-none font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product / SKU</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">In</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Out</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Logistics / Source</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{record.deviceName || 'Unknown SKU'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{record.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className={`text-sm font-bold ${record.stockIn > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {record.stockIn > 0 ? `+${record.stockIn}` : '0'}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className={`text-sm font-bold ${record.stockOut > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                      {record.stockOut > 0 ? `-${record.stockOut}` : '0'}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${record.remarks ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                        <MapPin size={12} />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${record.remarks ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                        {record.remarks || 'Stock Hub'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xl font-black text-slate-900 tracking-tight">{(record.currentCount || 0).toLocaleString()}</span>
                      <ArrowRight size={14} className="text-slate-200" />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                      <div className="p-8 bg-slate-50 rounded-full text-slate-300">
                        <Search size={48} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black uppercase tracking-widest mb-2">No Records Detected</p>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          Check tab <span className="text-indigo-600 font-bold">"{selectedBranch}"</span> for headers named "Product", "SKU", or "Balance".
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            {filteredTableData.length} records in this branch
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all bg-white"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all bg-white"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
