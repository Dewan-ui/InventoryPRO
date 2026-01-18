
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, InventoryRecord } from './types';
import { fetchInventoryData } from './services/googleSheets';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Metrics } from './components/Metrics';
import { Auth } from './components/Auth';
import { 
  Loader2, 
  AlertCircle, 
  ShieldAlert, 
  Key, 
  Database, 
  Lock, 
  Unlock, 
  Server,
  Save,
  Info
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

  // Connection Settings (Persisted in LocalStorage)
  const [usePrivateAPI, setUsePrivateAPI] = useState(() => localStorage.getItem('inventory_use_private') === 'true');
  const [googleAPIKey, setGoogleAPIKey] = useState(() => localStorage.getItem('inventory_google_key') || '');

  // Check for existing session on mount
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
        usePrivateAPI: usePrivateAPI
      });
      setData(inventory);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
      // If data exists, don't clear it on silent refresh error, but show warning
      if (!isSilent) setData([]);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [googleAPIKey, usePrivateAPI]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleSaveSettings = () => {
    localStorage.setItem('inventory_use_private', String(usePrivateAPI));
    localStorage.setItem('inventory_google_key', googleAPIKey);
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
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-slate-100 rounded-full border-t-indigo-600 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium animate-pulse uppercase tracking-widest">Verifying Connection...</p>
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
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-rose-600" />
            <div className="text-sm">
              <span className="font-bold">Sync Error:</span> {error}
            </div>
          </div>
          <button 
            onClick={() => setView('settings')}
            className="text-xs font-bold uppercase tracking-wider text-rose-700 hover:text-rose-900 underline"
          >
            Fix Connection
          </button>
        </div>
      )}

      {data.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100">
            <Lock size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Access Restricted</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {usePrivateAPI 
                ? "Your API Key might be invalid or restricted."
                : "The sheet is private. Enable 'Secure Sync' in settings or make the sheet public."}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('settings')}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
            >
              Update Settings
            </button>
            <button 
              onClick={() => loadData()}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {view === 'dashboard' && <Dashboard data={data} />}
          {view === 'inventory' && <Inventory data={data} />}
          {view === 'metrics' && <Metrics data={data} />}
          {view === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Settings & Security</h2>
                <p className="text-slate-500">Configure your enterprise connection and audit system health.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Secure Connection Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${usePrivateAPI ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Server size={20} />
                      </div>
                      <h3 className="text-lg font-bold">Secure Sync</h3>
                    </div>
                    <button 
                      onClick={() => setUsePrivateAPI(!usePrivateAPI)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${usePrivateAPI ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${usePrivateAPI ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Google API Key</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="password" 
                          value={googleAPIKey}
                          onChange={(e) => setGoogleAPIKey(e.target.value)}
                          disabled={!usePrivateAPI}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          placeholder="AIzaSyA..."
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight px-1 flex gap-1 items-start mt-2">
                        <Info size={10} className="mt-0.5 shrink-0" />
                        Requires 'Google Sheets API' enabled in Google Cloud Console.
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${usePrivateAPI ? 'bg-indigo-50/50 border-indigo-100 text-indigo-900' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <p className="text-xs font-bold flex items-center gap-2 mb-1">
                        {usePrivateAPI ? <Lock size={12} /> : <Unlock size={12} />}
                        {usePrivateAPI ? 'Encrypted Sync Active' : 'Public Link Sync Active'}
                      </p>
                      <p className="text-[10px] leading-relaxed opacity-70">
                        {usePrivateAPI 
                          ? 'Using official API v4. This supports private sheets but requires a valid API key from your cloud project.'
                          : 'Using CSV export mode. Your Google Sheet must be set to "Anyone with link can view".'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveSettings}
                    className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save & Re-sync
                  </button>
                </div>

                {/* Audit & Stats */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                        <ShieldAlert size={20} />
                      </div>
                      <h3 className="text-lg font-bold">Security Health</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="text-slate-400 mt-0.5"><Database size={16} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Local Cache</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {data.length} records currently cached for performance.
                          </p>
                        </div>
                      </div>
                      {!usePrivateAPI && (
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                          <div className="text-amber-500 mt-0.5"><Info size={16} /></div>
                          <div>
                            <p className="text-sm font-bold text-amber-900">Public Vulnerability</p>
                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                              You are currently in Public Sync mode. Anyone with your sheet URL can access raw data.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Branch Coverage</h4>
                    <p className="text-3xl font-bold">14 Active Hubs</p>
                    <div className="mt-4 flex gap-1">
                      {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-1 flex-1 bg-indigo-500 rounded-full" />)}
                      <div className="h-1 flex-1 bg-slate-700 rounded-full" />
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 font-medium">Monitoring 2.4k devices globally.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default App;
