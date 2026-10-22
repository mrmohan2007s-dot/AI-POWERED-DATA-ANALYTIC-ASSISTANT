import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DataSources } from './pages/DataSources';
import { QueryStudio } from './pages/QueryStudio';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AIInsights } from './pages/AIInsights';
import { QueryHistory } from './pages/QueryHistory';
import { SavedReports } from './pages/SavedReports';
import { Settings } from './pages/Settings';
import { FullSheetModal } from './components/FullSheetModal';
import { AlertCircle, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, error, clearError } = useApp();
  const [fullSheetOpen, setFullSheetOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'sources':
        return <DataSources />;
      case 'studio':
        return <QueryStudio onOpenFullSheet={() => setFullSheetOpen(true)} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'insights':
        return <AIInsights />;
      case 'history':
        return <QueryHistory />;
      case 'saved':
        return <SavedReports />;
      case 'settings':
        return <Settings />;
      case 'overview':
      default:
        // Overview can show QueryStudio with default preloads
        return <QueryStudio onOpenFullSheet={() => setFullSheetOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-slate-100 font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Global Error Banner */}
        {error && (
          <div className="mx-8 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-300 animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-rose-500/20 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 pb-16">{renderContent()}</main>
      </div>

      {/* Full Sheet Preview Modal */}
      <FullSheetModal isOpen={fullSheetOpen} onClose={() => setFullSheetOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
