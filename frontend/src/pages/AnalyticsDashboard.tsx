import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  BarChart2,
  BookmarkPlus,
  Download
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
} from 'recharts';
import { useApp } from '../context/AppContext';

export const AnalyticsDashboard: React.FC = () => {
  const {
    analyticsData,
    currentDataset,
    analysisScope,
    triggerAnalysis,
    isLoading,
    setActiveTab,
    saveCurrentReport,
  } = useApp();

  const downloadChartSvg = () => {
    const svg = document.querySelector<SVGSVGElement>('.recharts-wrapper svg.recharts-surface');
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${currentDataset?.name || 'analytics'}-chart.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

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
                  ? p.value.toLocaleString()
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
          <button
            onClick={downloadChartSvg}
            disabled={revenue_trajectory.length === 0}
            className="flex items-center space-x-1.5 bg-[#141b30] hover:bg-[#1a233d] disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-[#212c4d] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            title="Download the rendered time-series chart as SVG"
          >
            <Download size={13} />
            <span>Download Chart</span>
          </button>
          {/* Switch Scope */}
          <button
            onClick={() => triggerAnalysis(analysisScope === 'query_result' ? 'entire_dataset' : 'query_result')}
            disabled={isLoading}
            className="flex items-center space-x-1.5 bg-[#141b30] hover:bg-[#1a233d] text-slate-200 border border-[#212c4d] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : 'text-purple-400'} />
            <span>{analysisScope === 'query_result' ? 'Switch to Full Dataset' : 'Switch to Filtered Query'}</span>
          </button>
          <button
            onClick={() => {
              const title = window.prompt('Name this report snapshot', `${currentDataset?.name || 'Dataset'} analysis`);
              if (title !== null) saveCurrentReport(title);
            }}
            className="flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            <BookmarkPlus size={13} />
            <span>Save Report</span>
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
              <span className={`inline-flex items-center space-x-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${kpi.trend_direction === 'neutral' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                {kpi.trend_direction === 'neutral' ? <span>No comparison</span> : <><ArrowUpRight size={11} /><span>{kpi.change_pct}%</span></>}
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
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Row: Date Trend (Large) + Group Breakdown (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trajectory vs Target Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                <h3 className="text-sm font-bold text-white">{kpis[0]?.label || 'Metric'} by Month</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated values across the available date periods
              </p>
            </div>

          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Monthly actuals
            </span>
            <span className="ml-auto text-slate-400">{revenue_trajectory.length} monthly periods</span>
          </div>

        <div className="h-64 w-full">
            {revenue_trajectory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No usable date and numeric columns were found for a time series.</div>
            ) : (
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
                <YAxis stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => val.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGradient)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categorical Group Breakdown (1 Col) */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Group Breakdown</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Selected metric by an available category or group</p>
          </div>

          <div className="h-56 w-full">
            {sales_channels.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No categorical group and numeric metric were found.</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales_channels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="channel" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {sales_channels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-[#1a233d] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Leading group: {sales_channels[0]?.channel || '—'}</span>
            <span className="text-emerald-400 font-bold">{sales_channels[0]?.share_pct ?? 0}%</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Category Donut + Top Products Progress + Margin Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Share of the selected metric by category</p>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center">
            {category_breakdown.length === 0 ? (
              <div className="text-xs text-slate-400">No category column and numeric metric were found.</div>
            ) : (
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
            )}
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
              <h3 className="text-sm font-bold text-white">Top Items</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by {kpis[0]?.label || 'numeric value'}</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              TOP 5
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {top_products.length === 0 && <p className="text-xs text-slate-400">No product or item column was found.</p>}
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
            <span>Top 5 share of total: {top_products.reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%</span>
            <span className="text-purple-400">{top_products.length} items</span>
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
            {margin_volume_matrix.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Add a product and margin or profit column to see this matrix.</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis type="number" dataKey="volume" name="Units" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="margin_pct" name="Margin %" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Products" data={margin_volume_matrix} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-[#1a233d] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Avg margin: {margin_volume_matrix.length ? (margin_volume_matrix.reduce((sum, item) => sum + item.margin_pct, 0) / margin_volume_matrix.length).toFixed(1) : '—'}%</span>
            <span className="text-cyan-400">{margin_volume_matrix.length} items</span>
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
              <span className="font-bold text-sm text-white">Dataset Summary:</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                COMPUTED
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
