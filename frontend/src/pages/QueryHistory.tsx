import React from 'react';
import { History, Play, ArrowRight, Download, CheckCircle, Code } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QueryHistory: React.FC = () => {
  const { queryHistory, setCurrentQuery, runQuery, setActiveTab } = useApp();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <History size={24} className="text-purple-400" />
          Query History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Chronological record of all natural language queries run against your datasets in this session.
        </p>
      </div>

      {queryHistory.length === 0 ? (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <History size={24} />
          </div>
          <p className="text-sm text-slate-300 font-medium">No queries run yet in this session.</p>
          <button
            onClick={() => setActiveTab('studio')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold"
          >
            Go to Query Studio
          </button>
        </div>
      ) : (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#12192e] text-slate-400 text-[10px] uppercase border-b border-[#1a233d]">
              <tr>
                <th className="px-5 py-3">Query Prompt</th>
                <th className="px-4 py-3">Matched Records</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Memory</th>
                <th className="px-4 py-3">Audit</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161e36]">
              {queryHistory.map((q, idx) => (
                <tr key={idx} className="hover:bg-[#141b30]/60 transition-colors">
                  <td className="px-5 py-3 text-slate-100 font-sans font-medium max-w-md">
                    {q.query_text}
                  </td>
                  <td className="px-4 py-3 text-cyan-400 font-bold">
                    {q.total_rows_matching}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {q.execution_time_ms}ms
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {q.memory_used_mb}MB
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle size={10} />
                      <span>PASS</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setCurrentQuery(q.query_text);
                        runQuery(q.query_text, false, q.dataset_id);
                        setActiveTab('studio');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#151c33] hover:bg-purple-600 text-purple-300 hover:text-white border border-[#232e52] text-[11px] font-sans font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <Play size={10} className="fill-current" />
                      <span>Run Again</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
