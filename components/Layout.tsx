
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  RefreshCw,
  X,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setView: (view: ViewType) => void;
  onLogout: () => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  lastUpdated?: Date | null;
}

const SidebarLink: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group w-full ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="text-sm whitespace-nowrap">{label}</span>
  </button>
);

export const AppLayout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setView, 
  onLogout, 
  onRefresh,
  isSyncing,
  lastUpdated
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'branches', label: 'Branches', icon: <MapPin size={20} /> },
    { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleViewChange = (view: ViewType) => {
    setView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar Drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-indigo-600/30">B</div>
              <h1 className="text-xl font-bold tracking-tight">Bluetti<span className="text-indigo-600">Pro</span></h1>
            </div>
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          
          <nav className="space-y-2 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Operations</p>
            {navigationItems.map((link) => (
              <SidebarLink 
                key={link.id}
                icon={link.icon} 
                label={link.label} 
                active={activeView === link.id} 
                onClick={() => handleViewChange(link.id as ViewType)}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-6">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cloud Sync</p>
                  <p className="text-xs font-bold text-slate-900">Live Connection</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[92%] rounded-full transition-all duration-1000" />
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all w-full group font-medium"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-3 bg-slate-50 rounded-2xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="hidden sm:inline font-medium hover:text-slate-600 cursor-pointer">Platform</span>
              <ChevronRight size={14} className="hidden sm:inline" />
              <span className="text-slate-900 font-bold capitalize">{activeView}</span>
              {lastUpdated && (
                <div className="hidden xs:flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-600 border border-emerald-100">
                  <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`} />
                  UPDATED {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="pl-11 pr-4 py-2 bg-slate-100/50 border border-transparent rounded-2xl text-sm w-44 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500/20 focus:w-64 transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onRefresh}
                className={`p-2.5 text-slate-400 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50 ${isSyncing ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={20} />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 transition-all relative rounded-xl ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                </button>
                
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-4 w-80 bg-white border border-slate-200 rounded-[32px] shadow-2xl z-50 animate-in fade-in zoom-in-95 p-2 origin-top-right overflow-hidden">
                      <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h4 className="font-bold text-sm">Activity Feed</h4>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-3 space-y-2">
                        <div className="p-4 bg-indigo-50 rounded-[24px] border border-indigo-100/50">
                          <p className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                            <RefreshCw size={12} /> Data Synchronized
                          </p>
                          <p className="text-[10px] text-indigo-700/70 mt-1 leading-relaxed">System successfully polled Google Sheets.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer uppercase">
                B
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 lg:p-12 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
