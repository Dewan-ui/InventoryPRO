
import React, { useState, useMemo } from 'react';
import { InventoryRecord, BranchInventory } from '../types';
import { Search, Filter, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-slate-500">Detailed breakdown of stock across all branches.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm"
            />
          </div>
          <button className="p-2 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-8"></th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Name</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inflow (Total)</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <React.Fragment key={branch.branchName}>
                <tr 
                  className={`hover:bg-slate-50 transition-colors cursor-pointer group ${expandedBranch === branch.branchName ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => setExpandedBranch(expandedBranch === branch.branchName ? null : branch.branchName)}
                >
                  <td className="px-8 py-5">
                    {expandedBranch === branch.branchName ? <ChevronDown size={16} className="text-indigo-600" /> : <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />}
                  </td>
                  <td className="px-4 py-5 font-semibold text-slate-900">{branch.branchName}</td>
                  <td className="px-4 py-5 text-slate-600">{branch.totalItems}</td>
                  <td className="px-4 py-5 text-slate-600">+{branch.totalStockIn}</td>
                  <td className="px-4 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      branch.totalItems > 100 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {branch.totalItems > 100 ? 'Healthy' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right pr-8">
                    <button className="p-1 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
                {expandedBranch === branch.branchName && (
                  <tr>
                    <td colSpan={6} className="px-16 py-6 bg-slate-50/50 border-y border-slate-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Object.entries(branch.items).map(([name, count]) => (
                          <div key={name} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Device Model</p>
                            <p className="text-sm font-semibold text-slate-900 mb-2">{name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-indigo-600">{count}</span>
                              <span className="text-[10px] text-slate-400">units</span>
                            </div>
                            <div className="mt-3 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                // Fix: Explicitly cast count to number to satisfy arithmetic operation requirements
                                style={{ width: `${Math.min(((count as number) / 50) * 100, 100)}%` }}
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
        {branches.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <Search size={32} />
            </div>
            <p className="text-slate-500">No branches found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
