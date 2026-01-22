
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, InventoryRecord } from './types';
import { fetchInventoryData } from './services/googleSheets';
import { getInventoryInsights } from './services/aiService';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Metrics } from './components/Metrics';
import { Auth } from './components/Auth';
import { 
  ShieldAlert, 
  Key, 
  Lock, 
  Save,
  Fingerprint,
  Terminal,
  Info,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [data, setData] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string[] | null>(null);

  // Connection Settings
  const [usePrivateAPI, setUsePrivateAPI] = useState(() => localStorage.getItem('inventory_use_private') === 'true');
  const [googleAPIKey, setGoogleAPIKey] = useState(() => localStorage.getItem('inventory_google_key') || '');
  const [googleAccessToken, setGoogleAccessToken] = useState(() => localStorage.getItem('inventory_access_token') || '');

  useEffect(() => {
    const savedSession = localStorage.getItem('inventory_session');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('inventory_session');
      }
    }
    setLoading(false);
  }, []);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsSyncing(true);
    
    setError(null);
    try {
      const inventory = await fetchInventoryData({
        apiKey: googleAPIKey,
        accessToken: googleAccessToken,
        usePrivateAPI: usePrivateAPI
      });
      setData(inventory);
      setLastUpdated(new Date());

      if (inventory.length > 0) {
        getInventoryInsights(inventory).then(setAiInsights);
      }
    } catch (err: any) {
      setError(err.message);
      if (!isSilent) setData([]);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [googleAPIKey, googleAccessToken, usePrivateAPI]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleSaveSettings = () => {
    localStorage.setItem('inventory_use_private', String(usePrivateAPI));
    localStorage.setItem('inventory_google_key', googleAPIKey);
    localStorage.setItem('inventory_access_token', googleAccessToken);
    loadData();
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('inventory_session');
    setUser(null);
    setIsAuthenticated(false);
    setData([]);
    setAiInsights(null);
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 border-2 border-slate-100 rounded-full border-t-indigo-600 animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  return (
    <AppLayout 
      activeView={view} 
      setView={setView} 
      onLogout={handleLogout}
      onRefresh={() => loadData(true)}
      isSyncing={isSyncing}
      lastUpdated={lastUpdated}
    >
      {error && !isSyncing && (
        <div className="mb-10 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-rose-800">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shrink-0 shadow-sm">
                <ShieldAlert size={24} />
              </div>
              <div className="text-sm">
                <p className="font-bold text-lg mb-1">Access Denied</p>
                <p className="opacity-90 leading-relaxed font-medium">{error}</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setView('settings')} 
                className="flex-1 md:flex-none bg-rose-600 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
              >
                Fix Connection
              </button>
            </div>
          </div>

          {error.includes('IDENTITY_MISMATCH') && (
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-indigo-600">
                <Info size={20} />
                <h4 className="font-bold text-sm uppercase tracking-widest">Architect's Diagnostic</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-900 text-sm">The Problem</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You've shared the sheet with a <strong>Service Account</strong>, but the app is connecting via an <strong>API Key</strong>. Google treats API Key requests as anonymous "visitors."
                  </p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Env Check</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">VITE_API_KEY Detect:</span>
                      <span className={process.env.API_KEY ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                        {process.env.API_KEY ? "YES" : "MISSING"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-900 text-sm">Required Fix</h5>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs text-slate-600">
                      <div className="mt-0.5 p-1 bg-indigo-100 text-indigo-600 rounded-md shrink-0"><CheckCircle size={12} /></div>
                      Open your Google Sheet Sharing settings.
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-600">
                      <div className="mt-0.5 p-1 bg-indigo-100 text-indigo-600 rounded-md shrink-0"><CheckCircle size={12} /></div>
                      Set General Access to <strong>"Anyone with the link can view"</strong>.
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-600">
                      <div className="mt-0.5 p-1 bg-indigo-100 text-indigo-600 rounded-md shrink-0"><CheckCircle size={12} /></div>
                      Keep the Service Account access (it ensures the API Key works for this specific file).
                    </li>
                  </ul>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Check API Key Status <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'dashboard' && <Dashboard data={data} insights={aiInsights} />}
      {view === 'inventory' && <Inventory data={data} />}
      {view === 'metrics' && <Metrics data={data} />}
      {view === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
          <div className="flex flex-col gap-1 px-1">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">Settings</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">Manage your Google Sheet connection.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-5 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-row items-start justify-between gap-4 mb-10">
              <div className="flex items-start md:items-center gap-4 flex-1">
                <div className={`p-3 rounded-2xl shrink-0 transition-all duration-300 ${usePrivateAPI || !!process.env.API_KEY ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-400'}`}>
                  <Fingerprint size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">Advanced Connection</h3>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Using Vercel environment variables by default.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Active System</span>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Local Override Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={googleAPIKey}
                      onChange={(e) => setGoogleAPIKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all outline-none placeholder:text-slate-300"
                      placeholder={process.env.API_KEY ? "Using Vercel API Key..." : "Enter Google API Key..."}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Access Token</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={googleAccessToken}
                      onChange={(e) => setGoogleAccessToken(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/30 transition-all outline-none placeholder:text-slate-300"
                      placeholder="Enter OAuth Token (Optional)..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 rounded-[40px] bg-slate-900 text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <Terminal size={18} className="text-indigo-400" />
                  <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-indigo-200">Security Configuration</h4>
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 text-white border border-white/5 shadow-xl">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Set Permissions</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Change Google Sheet access to <strong>"Anyone with the link can view"</strong>. This is mandatory when using API Keys.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 text-white border border-white/5 shadow-xl">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Service Account</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Ensure your Service Account still has "Viewer" access. This validates the project's right to see the file.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[11px] font-black shrink-0 text-white border border-white/5 shadow-xl">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Vercel Setup</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Your current key is being pulled from <code>process.env.API_KEY</code>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              className="mt-8 md:mt-10 w-full py-5 bg-indigo-600 text-white rounded-[24px] font-bold text-sm md:text-base hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              Update System Config
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default App;
