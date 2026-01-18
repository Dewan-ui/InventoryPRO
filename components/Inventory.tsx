
import React, { useState, useMemo } from 'react';
import { InventoryRecord, BranchInventory } from '../types';
import { Search, Filter, MoreHorizontal, ArrowRight } from 'lucide-react';

interface InventoryProps {
  data: InventoryRecord[];
}

export const Inventory: React.FC<InventoryProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  const branches = useMemo(() => {
    const branchMap = new Map<string, BranchInventory>();
    
    data.forEach(record => {
      const existing = branchMap.get(record.branchName) || {
        branchName: record.branchName,
        totalItems: 0,
        totalStockIn: 0,
        totalStockOut: 0,
        avgRetention: 0,
        items: {}
      };

      existing.totalItems += record.currentCount;
      existing.totalStockIn += record.stockIn;
      existing.totalStockOut += record.stockOut;
      existing.items[record.deviceName] = (existing.items[record.deviceName] || 0) + record.currentCount;
      
      branchMap.set(record.branchName, existing);
    });

    return Array.from(branchMap.values()).filter(b => 
      b.branchName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Branch Inventory</h2>
          <p className="text-sm md:text-base text-slate-500">View stock levels for each branch.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none shadow-sm"
            />
          </div>
          <button className="hidden sm:flex p-3.5 border border-slate-200 bg-white rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-12"></th>
                <th className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Branch Name</th>
                <th className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Stock</th>
                <th className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total In</th>
                <th className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <React.Fragment key={branch.branchName}>
                  <tr 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer group ${expandedBranch === branch.branchName ? 'bg-indigo-50/20' : ''}`}
                    onClick={() => setExpandedBranch(expandedBranch === branch.branchName ? null : branch.branchName)}
                  >
                    <td className="px-6 md:px-8 py-6">
                      <div className={`transition-transform duration-300 ${expandedBranch === branch.branchName ? 'rotate-90' : ''}`}>
                        <ArrowRight size={18} className={expandedBranch === branch.branchName ? 'text-indigo-600' : 'text-slate-300'} />
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <p className="font-bold text-slate-900">{branch.branchName}</p>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{branch.totalItems}</span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-tight">items</span>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <span className="text-sm font-bold text-emerald-600">+{branch.totalStockIn}</span>
                    </td>
                    <td className="px-4 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-[0.15em] ${
                        branch.totalItems > 100 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {branch.totalItems > 100 ? 'Good' : 'Low'}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-right pr-8">
                      <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 active:scale-90">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                  {expandedBranch === branch.branchName && (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-12 py-8 bg-slate-50/30 border-y border-slate-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                          {Object.entries(branch.items).map(([name, count]) => (
                            <div key={name} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm group hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mb-1">Product</p>
                              <p className="text-sm font-bold text-slate-900 mb-4 line-clamp-1">{name}</p>
                              <div className="flex items-end justify-between mb-4">
                                <span className="text-2xl font-black text-indigo-600 tracking-tighter">{count}</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Stock</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                  style={{ width: `${Math.min(((count as number) / 60) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
