import React, { useState, useEffect } from 'react';
import { X, Search, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PreviewResponse } from '../types';

export const FullSheetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentDataset } = useApp();
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentDataset) {
      loadData();
    }
  }, [isOpen, currentDataset, page, search, sortBy, sortAsc]);

  const loadData = async () => {
    if (!currentDataset) return;
    setLoading(true);
    try {
      const res = await api.getPreview(
        currentDataset.id,
        pageSize,
        page * pageSize,
        search || undefined,
        sortBy,
        sortAsc
      );
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentDataset) return null;

  const totalPages = data ? Math.ceil(data.filtered_rows / pageSize) : 1;

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(true);
    }
    setPage(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1527] border border-[#1e2847] w-full max-w-6xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1a233d] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Full Sheet Preview:</span>
              <span className="text-purple-400 font-mono">{currentDataset.name}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {data?.filtered_rows.toLocaleString() || 0} matching records of {currentDataset.row_count.toLocaleString()} total
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search all rows..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-[#12182b] border border-[#1e2847] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={() => {
                const url = api.getExportUrl(currentDataset.id, 'csv');
                window.open(url, '_blank');
              }}
              className="p-2 rounded-lg bg-[#141b30] hover:bg-[#1b2440] text-slate-300 border border-[#212c4d] transition-colors"
              title="Download CSV"
            >
              <Download size={15} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
              Loading preview data...
            </div>
          ) : data && data.rows.length > 0 ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12192e] text-slate-400 uppercase text-[10px] sticky top-0 z-10 border-b border-[#1a233d]">
                <tr>
                  <th className="px-3 py-2.5">#</th>
                  {data.columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-3 py-2.5 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{col}</span>
                        {sortBy === col && (
                          <span className="text-purple-400">{sortAsc ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161e36]">
                {data.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#141b30]/60">
                    <td className="px-3 py-2 text-slate-400">{page * pageSize + idx + 1}</td>
                    {data.columns.map((col) => (
                      <td key={col} className="px-3 py-2 text-slate-200 truncate max-w-xs">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
              No matching records found.
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-[#1a233d] bg-[#0c101c] flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-[#141b30] hover:bg-[#1a233d] text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-[#141b30] hover:bg-[#1a233d] text-slate-300 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
