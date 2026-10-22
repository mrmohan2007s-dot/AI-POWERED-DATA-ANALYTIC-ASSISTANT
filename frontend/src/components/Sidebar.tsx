import React from 'react';
import {
  Database,
  TerminalSquare,
  BarChart3,
  Sparkles,
  History,
  BookmarkCheck,
  Settings,
  Plus,
  LayoutDashboard,
  MoreVertical,
  Activity
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentDataset } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'sources', label: 'Data Sources', icon: <Database size={18} /> },
    { id: 'studio', label: 'Query Studio', icon: <TerminalSquare size={18} /> },
    { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles size={18} /> },
    { id: 'history', label: 'Query History', icon: <History size={18} /> },
    { id: 'saved', label: 'Saved Reports', icon: <BookmarkCheck size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-[#0c101c] border-r border-[#1a2136] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-20">
      <div>
        {/* Brand Header */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-[#1a2136]/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                InsightAI
                <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                  PRO
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* New Analysis Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('studio')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-medium text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>New Analysis</span>
          </button>
        </div>

        {/* Nav Links */}
        <div className="px-3 py-3">
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c30]/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-purple-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#1a2136]/80 bg-[#0a0d17]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-purple-500/40">
                AS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0a0d17]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                Arjun Sharma
              </p>
              <p className="text-[10px] text-slate-400">Sr. Data Architect</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
