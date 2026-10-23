import React from 'react';
import { BookmarkCheck, Download, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SavedReports: React.FC = () => {
  const { savedReports, openSavedReport, removeSavedReport } = useApp();

  const downloadReport = (report: (typeof savedReports)[number]) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/[^a-z0-9-_]+/gi, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookmarkCheck size={24} className="text-purple-400" />
          Saved Reports & Snapshots
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Saved dashboard snapshots are kept in this browser and can be reopened or downloaded.
        </p>
      </div>

      {savedReports.length === 0 ? (
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-12 text-center space-y-3">
          <BookmarkCheck size={28} className="text-purple-400 mx-auto" />
          <p className="text-sm text-slate-300 font-medium">No reports saved yet.</p>
          <p className="text-xs text-slate-400">Run an analysis and choose “Save Report” from the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedReports.map((report) => (
            <div key={report.id} className="bg-[#0f1527] border border-[#1e2847] hover:border-purple-500/40 rounded-2xl p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-purple-400" />
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {report.analytics.record_count.toLocaleString()} rows
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-3 leading-snug">{report.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {report.dataset_name} · {report.analysis_scope === 'entire_dataset' ? 'Entire dataset' : 'Query result'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1a233d] flex items-center justify-between">
                <button onClick={() => openSavedReport(report)} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <span>Open Snapshot</span><ArrowRight size={13} />
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => downloadReport(report)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" title="Download JSON snapshot">
                    <Download size={15} />
                  </button>
                  <button onClick={() => removeSavedReport(report.id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800" title="Delete saved report">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
