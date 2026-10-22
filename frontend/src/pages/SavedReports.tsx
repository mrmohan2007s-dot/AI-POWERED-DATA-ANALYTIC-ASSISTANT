import React from 'react';
import { BookmarkCheck, FileText, ArrowRight, Download, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SavedReports: React.FC = () => {
  const { currentDataset, setActiveTab, triggerAnalysis } = useApp();

  const reports = [
    {
      id: 'rep_1',
      title: 'Q4 Enterprise Revenue & Regional Breakdown',
      desc: 'Quarterly review of Chennai and South hubs with high-margin hardware contributions.',
      date: 'Generated 2 hours ago',
      records: '15,000 Records',
      scope: 'entire_dataset' as const
    },
    {
      id: 'rep_2',
      title: 'Discount Policy Variance & Audit Report',
      desc: 'Audit of 8 enterprise transactions exceeding discount policy gates (>15%).',
      date: 'Generated Yesterday',
      records: '10 Records',
      scope: 'query_result' as const
    },
    {
      id: 'rep_3',
      title: 'Product Margin & Volume Correlation Matrix',
      desc: 'Profitability assessment across 5 core compute hardware SKUs.',
      date: 'Generated 3 days ago',
      records: '15,000 Records',
      scope: 'entire_dataset' as const
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookmarkCheck size={24} className="text-purple-400" />
          Saved Reports & Snapshots
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Archived analytical snapshots and recurring executive summaries ready for immediate review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-[#0f1527] border border-[#1e2847] hover:border-purple-500/40 rounded-2xl p-5 shadow-card flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-purple-400" />
                  {r.date}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {r.records}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3 leading-snug">
                {r.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {r.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1a233d] flex items-center justify-between">
              <button
                onClick={() => {
                  triggerAnalysis(r.scope);
                  setActiveTab('analytics');
                }}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Open Dashboard</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={() => window.print()}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Download Summary"
              >
                <Download size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
