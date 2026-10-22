import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  Download,
  Share2,
  Sparkles,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ZAxis
} from 'recharts';
import { useApp } from '../context/AppContext';

export const AnalyticsDashboard: React.FC = () => {
  const {
    analyticsData,
    currentDataset,
    analysisScope,
    triggerAnalysis,
    isLoading,
    setActiveTab
  } = useApp();

  const [trajectoryMode, setTrajectoryMode] = useState<'monthly' | 'weekly'>('monthly');

  if (!analyticsData) {
    return (
      <div className="p-12 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#141b30] border border-[#212c4d] flex items-center justify-center text-purple-400 mx-auto">
          <BarChart2 size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">No Active Analysis Loaded</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Run a natural language query in Query Studio, or generate instant analytics for the currently selected dataset.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => setActiveTab('studio')}
            className="px-4 py-2 rounded-xl bg-[#141b30] hover:bg-[#1a233b] text-slate-200 border border-[#212c4d] text-xs font-medium"
          >
            Go to Query Studio
          </button>
          <button
            onClick={() => triggerAnalysis('entire_dataset')}
            disabled={isLoading || !currentDataset}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
          >
            Analyze Entire Dataset
          </button>
        </div>
      </div>
    );
  }

  const {
    scope,
    scope_badge,
    kpis,
    revenue_trajectory,
    sales_channels,
    category_breakdown,
    category_total,
    top_products,
    margin_volume_matrix,
    autonomous_ai_summary
  } = analyticsData;

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1424] border border-[#232e50] p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-300 font-bold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || '#a78bfa' }} className="flex justify-between gap-4">
              <span>{p.name}:</span>
              <span className="font-semibold">
                {typeof p.value === 'number' && p.value > 1000
                  ? `₹${p.value.toLocaleString()}`
                  : p.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Analytics Dashboard
          </h1>
          <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {scope_badge || 'Active Scope'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Synthesized from {scope} • Audited
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          {/* Date range picker pill */}
          <div className="flex items-center space-x-2 bg-[#12182b] border border-[#1e2744] px-3 py-1.5 rounded-xl text-xs text-slate-300 font-mono">
            <Calendar size={13} className="text-purple-400" />
            <span>Oct 1, 2026 - Dec 31, 2026</span>
          </div>

          {/* Region filter pill */}
          <div className="flex items-center space-x-2 bg-[#12182b] border border-[#1e2744] px-3 py-1.5 rounded-xl text-xs text-slate-300 font-mono">
            <MapPin size={13} className="text-cyan-400" />
            <span>Chennai, Tamil Nadu</span>
            <ChevronDown size={12} className="text-slate-400" />
          </div>

          {/* Switch Scope */}
          <button
            onClick={() => triggerAnalysis(analysisScope === 'query_result' ? 'entire_dataset' : 'query_result')}
            disabled={isLoading}
            className="flex items-center space-x-1.5 bg-[#141b30] hover:bg-[#1a233d] text-slate-200 border border-[#212c4d] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : 'text-purple-400'} />
            <span>{analysisScope === 'query_result' ? 'Switch to Full Dataset' : 'Switch to Filtered Query'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-5 shadow-card flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {kpi.label}
              </span>
              <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight size={11} />
                <span>+{kpi.change_pct}%</span>
              </span>
            </div>

            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {kpi.formatted_value}
              </span>
              {kpi.unit && (
                <span className="text-xs text-slate-400 font-mono">{kpi.unit}</span>
              )}
            </div>

            {/* Sparkline & Subtitle */}
            <div className="mt-4 pt-3 border-t border-[#1a233d] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {kpi.subtitle || 'Active period'}
              </span>
              {/* Mini SVG Sparkline */}
              <div className="w-16 h-5">
                <svg viewBox="0 0 60 20" className="w-full h-full stroke-purple-400 fill-none stroke-[2]">
                  <polyline points="0,15 15,12 30,14 45,8 60,3" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Row: Revenue Trajectory (Large) + Sales Channels (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trajectory vs Target Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                <h3 className="text-sm font-bold text-white">
                  Revenue Trajectory vs Target (Monthly)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Net Q4 Actual Revenue vs Projected Run-rate
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-[#0c101c] rounded-lg p-0.5 border border-[#1a233d] text-[10px] font-semibold">
                <button
                  onClick={() => setTrajectoryMode('monthly')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trajectoryMode === 'monthly' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTrajectoryMode('weekly')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trajectoryMode === 'weekly' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Actual Revenue
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Dynamic Forecast
            </span>
            <span className="ml-auto text-emerald-400 font-bold">
              Peak: ₹18.84 Lakhs
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue_trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGradient)" />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth={2} fillOpacity={1} fill="url(#cyanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Channels Bar Chart (1 Col) */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Sales Channels</h3>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                B2B Enterprise vs Retail
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Revenue breakdown by sales pipeline</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales_channels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="channel" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {sales_channels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#1a233d] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Leading: Enterprise B2B</span>
            <span className="text-emerald-400 font-bold">+₹24.1M</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Category Donut + Top Products Progress + Margin Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across 4 core product families</p>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_breakdown}
                  dataKey="value"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {category_breakdown.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-extrabold text-white">{category_total}</span>
              <span className="text-[10px] text-slate-400 font-mono">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1a233d]">
            {category_breakdown.map((cat) => (
              <div key={cat.category} className="flex items-center space-x-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 truncate">{cat.category}</span>
                <span className="text-slate-400 font-mono ml-auto">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products (Ranked) */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Top Products (Ranked)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Gross Revenue Leaders (Q4)</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              TOP 5
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {top_products.map((p) => (
              <div key={p.rank} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate max-w-[180px]">
                    <span className="text-purple-400 font-mono mr-1.5">{p.rank}.</span>
                    {p.name}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{p.formatted_value}</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full h-1.5 bg-[#161e36] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, p.percentage * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1a233d] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Total account for: 78.4%</span>
            <span className="text-purple-400">View All</span>
          </div>
        </div>

        {/* Margin vs Volume Matrix */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Margin vs Volume Matrix</h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                Profitability
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Product volume against margin %</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis type="number" dataKey="volume" name="Units" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="margin_pct" name="Margin %" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Products" data={margin_volume_matrix} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#1a233d] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Avg Margin: 42.4%</span>
            <span className="text-cyan-400">Optimal quadrant: High-High</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Autonomous AI Synthesis Strip */}
      <div className="bg-[#0f1527] border border-purple-500/30 rounded-2xl p-5 shadow-glow-purple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">Autonomous AI Synthesis:</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                EXECUTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              {autonomous_ai_summary}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('insights')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
          >
            <span>View Full AI Insights</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
