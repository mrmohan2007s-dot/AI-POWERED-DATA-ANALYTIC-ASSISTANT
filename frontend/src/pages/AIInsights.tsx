import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Send,
  MessageSquare,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const AIInsights: React.FC = () => {
  const {
    insightsData,
    currentDataset,
    analysisScope,
    refreshInsights,
    runQuery,
    setCurrentQuery,
    setActiveTab,
    isLoading
  } = useApp();

  const [copilotInput, setCopilotInput] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: 'user' | 'copilot'; text: string; actions?: string[] }>>([
    {
      sender: 'copilot',
      text: 'Ask about a column or a value in the selected dataset. I can calculate summaries from the loaded records.',
      actions: ['Show summary metrics', 'Filter top records', 'Analyze trends']
    }
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  const handleSendCopilot = async (msg?: string) => {
    const textToSend = msg || copilotInput;
    if (!textToSend.trim() || !currentDataset) return;

    setCopilotHistory((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setCopilotInput('');
    setIsCopilotThinking(true);

    try {
      const resp = await api.sendCopilotMessage(currentDataset.id, textToSend);
      setCopilotHistory((prev) => [
        ...prev,
        { sender: 'copilot', text: resp.reply, actions: resp.suggested_actions }
      ]);
    } catch (err: any) {
      setCopilotHistory((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: `Analysis error: ${err.message || 'Unable to reconcile data.'}`
        }
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const handleFollowUpQuery = (queryText: string) => {
    setCurrentQuery(queryText);
    runQuery(queryText);
    setActiveTab('studio');
  };

  if (!insightsData) {
    return (
      <div className="p-12 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#141b30] border border-[#212c4d] flex items-center justify-center text-purple-400 mx-auto">
          <Sparkles size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">No AI Synthesis Generated Yet</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Execute a query or run analytics to synthesize executive insights, risk audits, and recommended actions.
          </p>
        </div>
        <button
          onClick={() => refreshInsights()}
          disabled={isLoading || !currentDataset}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
        >
          Generate Synthesis Now
        </button>
      </div>
    );
  }

  const {
    dataset_name,
    scope,
    key_findings,
    trends_and_patterns,
    anomalies,
    recommendations,
    suggested_queries,
    executive_summary,
    is_llm_powered
  } = insightsData;

  const handleShareInsights = async () => {
    const shareText = `${dataset_name} — ${scope}\n\n${executive_summary}\n\nKey findings:\n${key_findings.map((finding) => `• ${finding.title}: ${finding.description}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage('Summary copied');
    } catch {
      window.prompt('Copy this insights summary:', shareText);
      setShareMessage('Copy the summary from the dialog');
    }
    window.setTimeout(() => setShareMessage(''), 2500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {dataset_name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {is_llm_powered ? 'LLM Enhanced' : 'Local Statistical Engine'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Insights & Executive Summary
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Generated from {scope}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => refreshInsights()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 bg-[#141b30] hover:bg-[#1a233d] text-slate-200 border border-[#212c4d] px-3.5 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : 'text-purple-400'} />
            <span>Regenerate Analysis</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-[#141b30] hover:bg-[#1a233d] text-slate-200 border border-[#212c4d] px-3.5 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <Download size={13} className="text-cyan-400" />
            <span>Export Executive Memo (PDF)</span>
          </button>
          <button
            onClick={handleShareInsights}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-md shadow-purple-600/30 transition-all"
          >
            <Share2 size={13} />
            <span>{shareMessage || 'Copy Insights Summary'}</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Callout */}
      <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-5 shadow-card flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Executive Intelligence Summary
          </h3>
          <p className="text-sm text-slate-200 mt-1 leading-relaxed">
            {executive_summary}
          </p>
        </div>
      </div>

      {/* 2. Main Grid: Left 2/3 Content, Right 1/3 Insight Co-pilot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Findings, Trends, Anomalies, Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Key Findings */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Key Findings (High Impact)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {key_findings.map((finding) => (
                <div
                  key={finding.id}
                  className="bg-[#0f1527] border border-[#1d2744] hover:border-purple-500/40 rounded-2xl p-5 shadow-card flex flex-col justify-between transition-all"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                      {finding.tag}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2.5">{finding.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {finding.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1a233d] flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {finding.metric_badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Trends & Seasonal Patterns */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" />
              Trends & Seasonal Patterns
            </h2>
            {trends_and_patterns.length === 0 && <p className="text-xs text-slate-400">No time based trend can be calculated because the dataset has no usable date column or multiple time periods.</p>}
            {trends_and_patterns.map((trend) => (
              <div
                key={trend.id}
                className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {trend.tag}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">{trend.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {trend.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-cyan-400 font-mono">
                      {trend.multiplier}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Observed change</div>
                  </div>
                  {/* Mini trend visualization */}
                  <div className="flex items-end gap-1 h-7 mt-2">
                  {trend.trend_data.slice(0, 7).map((value, i, values) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-t bg-cyan-500/70"
                      style={{ height: `${Math.max(3, (value / Math.max(...values, 1)) * 28)}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Anomalies & Outliers */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-400" />
              Anomalies & Outliers
            </h2>
            {anomalies.length === 0 && <p className="text-xs text-slate-400">No records exceeded the anomaly rule applied to the available numeric fields.</p>}
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="bg-[#0f1527] border border-rose-500/30 rounded-2xl p-5 shadow-card space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {anom.alert_type}
                    </span>
                    <h3 className="text-sm font-bold text-white">{anom.title}</h3>
                  </div>
                  <div className="text-xs font-mono font-bold text-rose-400">
                    Flagged records: {anom.impact_amount}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {anom.description}
                </p>

                {/* Table of anomalous rows */}
                <div className="overflow-x-auto rounded-xl border border-[#1a233d]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#12192e] text-slate-400 text-[10px] uppercase border-b border-[#1a233d]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Order ID</th>
                        <th className="px-3 py-2 font-semibold">Product</th>
                        <th className="px-3 py-2 font-semibold">Observed Value</th>
                        <th className="px-3 py-2 font-semibold">Threshold</th>
                        <th className="px-3 py-2 font-semibold text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#161e36]">
                      {anom.transactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-[#141b30]/60">
                          <td className="px-3 py-2 text-slate-300">{tx.order_id}</td>
                          <td className="px-3 py-2 text-slate-200">{tx.product}</td>
                          <td className="px-3 py-2 text-rose-400 font-bold">{tx.applied_discount}</td>
                          <td className="px-3 py-2 text-slate-400">{tx.authorized_limit}</td>
                          <td className="px-3 py-2 text-rose-400 font-bold text-right">{tx.margin_impact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Actionable Recommendations */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Actionable Business Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {rec.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{rec.title}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{rec.description}</p>
                  </div>
                  <button
                    onClick={() => handleFollowUpQuery(suggested_queries[index % Math.max(1, suggested_queries.length)]?.query || 'Show top 10 records')}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#151c33] hover:bg-emerald-600/20 text-emerald-300 border border-[#232e52] hover:border-emerald-500/40 text-xs font-semibold transition-all"
                  >
                    Explore with Query
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Insight Co-pilot Sidebar Widget */}
        <div className="space-y-6">
          <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-5 shadow-card flex flex-col h-[580px]">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-[#1a233d]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Insight Co-pilot</h3>
                <p className="text-[10px] text-slate-400">Interactive Assistant Engine</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Chat conversation area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
              {copilotHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    item.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                      item.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-[#141b30] border border-[#1f2a4a] text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {item.text}
                  </div>

                  {item.actions && item.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendCopilot(act)}
                          className="text-[10px] font-mono bg-[#111729] hover:bg-[#18213b] text-purple-300 border border-[#202b4d] px-2 py-0.5 rounded-md transition-colors"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isCopilotThinking && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
                  <RefreshCw size={12} className="animate-spin text-purple-400" />
                  <span>Cross-reconciling dataset metrics...</span>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="pt-3 border-t border-[#1a233d]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about these findings..."
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                  className="w-full bg-[#111728] border border-[#1e263d] focus:border-purple-500 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSendCopilot()}
                  disabled={!copilotInput.trim() || isCopilotThinking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white p-1 rounded-md transition-colors disabled:opacity-30"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Follow-up Queries Card */}
          <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-5 shadow-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Suggested Follow-up Queries</span>
              <Sparkles size={13} className="text-purple-400" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any query below to load it into Query Studio and execute instantly:
            </p>

            <div className="space-y-2 pt-1">
              {suggested_queries.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => handleFollowUpQuery(q.query)}
                  className="p-3 rounded-xl bg-[#12182b] hover:bg-[#18213b] border border-[#1d2744] hover:border-purple-500/40 cursor-pointer transition-all flex items-start justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      {q.tag} • {q.category}
                    </span>
                    <p className="text-xs font-medium text-slate-200 group-hover:text-purple-300 mt-1">
                      {q.query}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-500 group-hover:text-purple-400 transition-colors shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
