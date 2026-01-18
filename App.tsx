
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, InventoryRecord } from './types';
import { fetchInventoryData } from './services/googleSheets';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Metrics } from './components/Metrics';
import { Auth } from './components/Auth';
import { Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [data, setData] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('inventory_session');
    if (savedSession) {
      const userData = JSON.parse(savedSession);
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setLoading(false); // If no session, stop loading to show Auth screen
    }
  }, []);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsSyncing(true);
    
    setError(null);
    try {
      const inventory = await fetchInventoryData();
      setData(inventory);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to connect to data source.");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Handle visibility change (auto-sync when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        loadData(true); // Silent refresh
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, loadData]);

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full border-t-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600">I</div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Syncing with Google Sheets...</p>
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
      {data.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Access Restricted or No Data</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We connected to Google but couldn't read the records. Please ensure the sheet sharing is set to <b>"Anyone with the link can view"</b>.
            </p>
          </div>
          <button 
            onClick={() => loadData()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retry Sync
          </button>
        </div>
      ) : (
        <>
          {view === 'dashboard' && <Dashboard data={data} />}
          {view === 'inventory' && <Inventory data={data} />}
          {view === 'metrics' && <Metrics data={data} />}
          {view === 'settings' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                <Loader2 size={32} />
              </div>
              <h3 className="text-xl font-bold">Preferences Under Construction</h3>
              <p className="text-slate-500 max-w-sm">Hello {user?.name}, configuration options for API endpoints and notification webhooks are currently in development.</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default App;
