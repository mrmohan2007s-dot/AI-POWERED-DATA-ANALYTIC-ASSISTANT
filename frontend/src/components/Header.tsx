import React, { useState } from 'react';
import {
  Search,
  HelpCircle,
  Download,
  Database,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const { currentDataset, datasets, activeTab, queryResult, queryHistory, setActiveTab, setCurrentQuery, runQuery, selectDataset } = useApp();
  const [searchText, setSearchText] = useState('');

  const handleSearch = async () => {
    const term = searchText.trim().toLowerCase();
    if (!term) return;
    const previousQuery = queryHistory.find((query) => query.query_text.toLowerCase().includes(term));
    if (previousQuery) {
      setCurrentQuery(previousQuery.query_text);
      await runQuery(previousQuery.query_text, false, previousQuery.dataset_id);
      setActiveTab('studio');
      return;
    }
    const matchingDataset = datasets.find((dataset) => dataset.name.toLowerCase().includes(term));
    if (matchingDataset) {
      await selectDataset(matchingDataset.id);
      setActiveTab('sources');
      return;
    }
    const matchingColumn = currentDataset?.columns.find((column) => column.name.toLowerCase().includes(term));
    if (matchingColumn) {
      setCurrentQuery(`Show top 10 records by ${matchingColumn.name}`);
      setActiveTab('studio');
      return;
    }
    setActiveTab('sources');
  };

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'sources':
        return 'Data Sources';
      case 'studio':
        return 'Query Studio';
      case 'analytics':
        return 'Analytics Dashboard';
      case 'insights':
        return 'AI Insights';
      case 'history':
        return 'Query History';
      case 'saved':
        return 'Saved Reports';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  const handleQuickExport = () => {
    if (!currentDataset) return;
    const url = api.getExportUrl(currentDataset.id, 'csv', queryResult?.id);
    window.open(url, '_blank');
  };

  return (
    <header className="h-16 border-b border-[#1a2136] bg-[#0c101c]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Left: Breadcrumbs & Dataset status badge */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
          <span onClick={() => setActiveTab('sources')} className="hover:text-slate-200 transition-colors cursor-pointer">Workspace</span>
          <ChevronRight size={13} className="text-slate-600" />
          <span onClick={() => setActiveTab('sources')} className="hover:text-slate-200 transition-colors cursor-pointer truncate max-w-[150px]">
            {currentDataset ? currentDataset.name.replace(/\.[^/.]+$/, '') : 'No Source'}
          </span>
          <ChevronRight size={13} className="text-slate-600" />
          <span className="text-purple-400 font-semibold">{getBreadcrumbLabel()}</span>
        </div>

        {/* Dataset Pill Badge */}
        {currentDataset ? (
          <div
            onClick={() => setActiveTab('sources')}
            className="flex items-center space-x-2 bg-[#141b2e] hover:bg-[#1a243e] border border-[#222d4c] px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150"
            title="Click to switch or manage datasets"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px] truncate max-w-[190px]">
              {currentDataset.name}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded font-mono">
              {currentDataset.row_count >= 1000 ? `${(currentDataset.row_count / 1000).toFixed(0)}k rows` : `${currentDataset.row_count} rows`}
            </span>
          </div>
        ) : (
          <div
            onClick={() => setActiveTab('sources')}
            className="flex items-center space-x-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 text-purple-300"
            title="Click to connect a dataset"
          >
            <Database size={11} className="text-purple-400" />
            <span className="font-medium text-[11px]">Connect Dataset</span>
          </div>
        )}
      </div>

        {/* Middle/Right: Search, Help, Export */}
      <div className="flex items-center space-x-4">
        {/* Search input */}
        <div className="relative w-64 md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search queries, tables, schemas..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && void handleSearch()}
            className="w-full bg-[#111728] border border-[#1e263d] focus:border-purple-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-1.5 text-slate-400">
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-lg hover:bg-[#151c30] hover:text-slate-200 transition-colors"
            title="Settings & API Keys"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button 
            onClick={() => alert("InsightAI v1.0.0\n\nWorkflow:\n1. Upload or select dataset in Data Sources\n2. Enter Natural Language Query in Query Studio\n3. Inspect extracted rows\n4. Click 'Analyze These Results' or 'Analyze Entire Dataset' to view charts & AI insights.")}
            className="p-2 rounded-lg hover:bg-[#151c30] hover:text-slate-200 transition-colors"
            title="Help & Workflow"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={handleQuickExport}
          disabled={!currentDataset}
          title={currentDataset ? 'Export current dataset or query results' : 'Connect a dataset to export'}
          className="flex items-center space-x-1.5 bg-[#141b2e] hover:bg-[#1c2642] text-slate-200 border border-[#222d4c] px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} className="text-purple-400" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
