import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  ArrowRight,
  Code2,
  Terminal,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const QueryStudio: React.FC<{ onOpenFullSheet: () => void }> = ({ onOpenFullSheet }) => {
  const {
    currentDataset,
    previewData,
    currentQuery,
    setCurrentQuery,
    queryResult,
    runQuery,
    triggerAnalysis,
    isLoading,
    setActiveTab
  } = useApp();

  const [deepMode, setDeepMode] = useState(false);
  const [pipelineTab, setPipelineTab] = useState<'python' | 'sql'>('python');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [previewFilter, setPreviewFilter] = useState('');

  const exampleChips = [
    'Show the top 10 products by revenue in Chennai during the last 3 months with quantity sold and average margin',
    'What is top 5 products by revenue',
    'Filter sales above ₹50,000',
    'Compare Chennai vs Bangalore',
    'Show monthly trend for 2026',
    'Calculate the average order value'
  ];

  const handleCopyCode = () => {
    if (!queryResult) return;
    const code = pipelineTab === 'python' ? queryResult.python_pipeline : queryResult.sql_equivalent;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyJson = () => {
    if (!queryResult) return;
    navigator.clipboard.writeText(JSON.stringify(queryResult.rows, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    if (!currentDataset) return;
    const url = api.getExportUrl(currentDataset.id, format, queryResult?.id);
    window.open(url, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Turn your data into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">decisions.</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload a dataset, ask questions in plain English, and extract insights in seconds.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('sources')}
            className="px-3.5 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233b] text-slate-300 border border-[#222d4c] text-xs font-medium transition-colors"
          >
            Browse Explorer
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233b] text-slate-300 border border-[#222d4c] text-xs font-medium transition-colors"
          >
            Export Session
          </button>
        </div>
      </div>

      {/* 2. Active Dataset Card */}
      {currentDataset && (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-slate-100">{currentDataset.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    CURRENT DATASET
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    100% Loaded
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>FORMAT: {currentDataset.format}</span>
                  <span>•</span>
                  <span>{currentDataset.row_count >= 1000 ? `${(currentDataset.row_count / 1000).toFixed(0)}k rows` : `${currentDataset.row_count} rows`}</span>
                  <span>•</span>
                  <span>{currentDataset.column_count} cols</span>
                  <span>•</span>
                  <span>{currentDataset.size_formatted}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('sources')}
                className="px-3 py-1.5 rounded-lg bg-[#141b30] hover:bg-[#19223c] text-slate-300 border border-[#212c4d] text-xs font-medium transition-colors"
              >
                Replace Dataset
              </button>
            </div>
          </div>

          {/* Schema Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#1a233d]">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Schema:
            </span>
            {currentDataset.columns.slice(0, 7).map((col) => (
              <span
                key={col.name}
                className="inline-flex items-center space-x-1.5 bg-[#141b30] border border-[#1f2a4a] px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300"
              >
                <span className="text-purple-400 font-semibold">{col.name}</span>
                <span className="text-[10px] text-slate-400">({col.semantic_type})</span>
              </span>
            ))}
            {currentDataset.columns.length > 7 && (
              <span className="text-xs text-slate-400 self-center">
                +{currentDataset.columns.length - 7} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Quick Data Preview Table Card */}
      {previewData && (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Quick Data Preview</h3>
              <p className="text-xs text-slate-400">
                Showing {Math.min(5, previewData.total_rows)} of {previewData.total_rows.toLocaleString()} rows
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Filter preview rows..."
                value={previewFilter}
                onChange={(e) => setPreviewFilter(e.target.value)}
                className="bg-[#12182b] border border-[#1e2847] rounded-lg px-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 w-48"
              />
              <button
                onClick={onOpenFullSheet}
                className="px-3 py-1 rounded-lg bg-[#151c33] hover:bg-purple-600/20 text-purple-300 border border-[#232e52] hover:border-purple-500/40 text-xs font-medium transition-colors"
              >
                View Full Sheet
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1a233d]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#13192e] text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-[#1a233d]">
                <tr>
                  {previewData.columns.slice(0, 6).map((c) => (
                    <th key={c} className="px-4 py-2.5 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161e36]">
                {previewData.rows
                  .filter((row) =>
                    !previewFilter
                      ? true
                      : Object.values(row).some((val) =>
                          String(val).toLowerCase().includes(previewFilter.toLowerCase())
                        )
                  )
                  .slice(0, 5)
                  .map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#141b30]/60 transition-colors">
                      {previewData.columns.slice(0, 6).map((c) => (
                        <td key={c} className="px-4 py-2.5 text-slate-300 font-mono">
                          {row[c] !== null && row[c] !== undefined ? (
                            typeof row[c] === 'number' && c.toLowerCase().includes('revenue') ? (
                              `₹${row[c].toLocaleString()}`
                            ) : (
                              String(row[c])
                            )
                          ) : (
                            <span className="text-slate-600 italic">null</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Natural-Language Query Studio Card */}
      <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Ask your data anything
                <span className="text-[10px] font-mono font-bold bg-[#17203b] text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                  NATURAL LANGUAGE SQL
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Deep Mode</span>
            <button
              onClick={() => setDeepMode(!deepMode)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                deepMode ? 'bg-purple-600' : 'bg-[#1a233d]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  deepMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Describe what you want to find. InsightAI will query your uploaded dataset and return the exact matching results.
        </p>

        {/* Big multiline query textarea */}
        <div className="relative rounded-xl border border-[#232e52] focus-within:border-purple-500 bg-[#0a0d17] p-3 transition-colors">
          <textarea
            rows={3}
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            placeholder="e.g. Show top 10 products by revenue in Chennai with units sold and profit margin"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none font-medium leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#182038]">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-[#13192e] border border-[#1e2744] text-purple-300 font-semibold">
                SQL
              </span>
              <span className="px-2 py-0.5 rounded bg-[#13192e] border border-[#1e2744] text-cyan-300">
                FAST ENGINE
              </span>
              <span>7.2s est. run</span>
              <span>•</span>
              <span>Aggr & Filter Config</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentQuery('')}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#141b30] transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => runQuery(currentQuery, deepMode)}
                disabled={isLoading || !currentQuery.trim()}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all duration-150 disabled:opacity-50"
              >
                <Sparkles size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Example Query Chips */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Suggested Prompts:
          </div>
          <div className="flex flex-wrap gap-2">
            {exampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQuery(chip);
                  runQuery(chip, deepMode);
                }}
                className="text-xs bg-[#12182b] hover:bg-[#19223c] text-slate-300 hover:text-purple-300 border border-[#1e2847] hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Optimized SQL / Python Pipeline Snippet */}
        {queryResult && (
          <div className="rounded-xl border border-[#1e2847] bg-[#0c101c] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#101526] border-b border-[#1a233d]">
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-purple-400 font-semibold flex items-center gap-1.5">
                  <Code2 size={14} />
                  Optimized Pipeline
                </span>
                <div className="flex bg-[#0c101c] rounded-md p-0.5 border border-[#1a233d]">
                  <button
                    onClick={() => setPipelineTab('python')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      pipelineTab === 'python' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setPipelineTab('sql')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      pipelineTab === 'sql' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SQL
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {pipelineTab === 'python' ? queryResult.python_pipeline : queryResult.sql_equivalent}
            </pre>
          </div>
        )}
      </div>

      {/* 5. Execution Metrics Bar */}
      {queryResult && (
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#0f1527] border border-[#1d2744] px-5 py-3 rounded-xl text-xs font-mono">
          <div className="flex items-center space-x-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Zap size={13} />
              Execution: {queryResult.execution_time_ms}ms (Local)
            </span>
            <span>•</span>
            <span className="text-slate-200 font-semibold">
              {queryResult.total_rows_matching} Records Extracted
            </span>
            <span>•</span>
            <span className="text-cyan-400">Memory: {queryResult.memory_used_mb}MB</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle size={10} />
              <span>Audit Passed</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              0 Synthesis Error
            </span>
          </div>
        </div>
      )}

      {/* 6. Results Section */}
      {queryResult && (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">
                  Found {queryResult.total_rows_matching} records matching your conditions.
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {queryResult.rows.length} of {queryResult.total_rows_matching} rows shown • {queryResult.columns.length} columns • Execution: {queryResult.execution_time_ms}ms
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141b30] hover:bg-[#1b2440] text-slate-300 border border-[#212c4d] text-xs font-medium transition-colors"
              >
                <Download size={13} className="text-purple-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141b30] hover:bg-[#1b2440] text-slate-300 border border-[#212c4d] text-xs font-medium transition-colors"
              >
                <Download size={13} className="text-cyan-400" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141b30] hover:bg-[#1b2440] text-slate-300 border border-[#212c4d] text-xs font-medium transition-colors"
              >
                {copiedJson ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedJson ? 'JSON Copied' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>

          {/* Execution Logic Explanation Banner */}
          <div className="bg-[#12192e] border border-purple-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
            <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={13} />
            </div>
            <div>
              <span className="font-semibold text-purple-300">InsightAI Execution Logic: </span>
              <span className="text-slate-300 leading-relaxed">
                {queryResult.interpreted_logic}
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1a233d]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#13192e] text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-[#1a233d]">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  {queryResult.columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold">
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161e36]">
                {queryResult.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#141b30]/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                    {queryResult.columns.map((col) => {
                      const val = row[col];
                      const isRev = col.toLowerCase().includes('revenue') || col.toLowerCase().includes('amount');
                      const isMargin = col.toLowerCase().includes('margin');
                      return (
                        <td key={col} className="px-4 py-3 text-slate-200 font-mono">
                          {val !== null && val !== undefined ? (
                            isRev ? (
                              <span className="text-emerald-400 font-bold">
                                ₹{typeof val === 'number' ? val.toLocaleString() : val}
                              </span>
                            ) : isMargin ? (
                              <span className="text-cyan-400">
                                {typeof val === 'number' && val <= 1 ? `${(val * 100).toFixed(1)}%` : `${val}%`}
                              </span>
                            ) : (
                              String(val)
                            )
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => triggerAnalysis('query_result')}
                        className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Bottom Call to Action Banner (Analyze These Results vs Analyze Entire Dataset) */}
      {queryResult && (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
              DATA VISUALIZATION ENGINE
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Ready to translate this query into visual intelligence?
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Choose whether to dive deeper into these <span className="text-purple-400 font-semibold">{queryResult.total_rows_matching} filtered records</span> or expand automated correlation models across the entire <span className="text-cyan-400 font-semibold">{currentDataset?.row_count.toLocaleString()} dataset</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Primary Action Card: Analyze These Results */}
            <button
              onClick={() => triggerAnalysis('query_result')}
              disabled={isLoading}
              className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-indigo-900/40 border border-purple-500/50 hover:border-purple-400 shadow-lg shadow-purple-600/10 text-left flex items-start justify-between group transition-all duration-200"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-purple-400" />
                  <span className="font-bold text-sm text-white group-hover:text-purple-200">
                    Analyze These Results
                  </span>
                </div>
                <p className="text-xs text-purple-200/80 mt-1.5 leading-relaxed">
                  Generate visualizations and AI insights using only these <strong className="text-white">{queryResult.total_rows_matching} records</strong>.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </button>

            {/* Secondary Action Card: Analyze Entire Dataset */}
            <button
              onClick={() => triggerAnalysis('entire_dataset')}
              disabled={isLoading}
              className="p-5 rounded-2xl bg-[#12182b] hover:bg-[#161f38] border border-[#1e2744] hover:border-cyan-500/40 text-left flex items-start justify-between group transition-all duration-200"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Layers size={16} className="text-cyan-400" />
                  <span className="font-bold text-sm text-white group-hover:text-cyan-200">
                    Analyze Entire Dataset
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Generate comprehensive overview across all <strong className="text-slate-200">{currentDataset?.row_count.toLocaleString()} records</strong>.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#182038] flex items-center justify-center text-slate-400 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
