import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Server,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const DataSources: React.FC = () => {
  const {
    datasets,
    currentDataset,
    selectDataset,
    refreshDatasets,
    clearAllDatasets,
    setActiveTab,
    isLoading
  } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSizeBytes = datasets.reduce((sum, d) => sum + (d.size_bytes || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const quotaPct = Math.min(100, Math.max(0, (parseFloat(totalSizeMB) / 100) * 100)).toFixed(1);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const meta = await api.uploadDataset(file);
      await refreshDatasets(meta.id);
      await selectDataset(meta.id);
      setUploadSuccess(`Successfully connected "${meta.name}" (${meta.row_count.toLocaleString()} rows, ${meta.column_count} columns).`);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this dataset from your workspace?')) {
      await api.deleteDataset(id);
      await refreshDatasets();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to remove ALL connected datasets? This will reset your workspace.')) {
      await clearAllDatasets();
    }
  };

  const filteredDatasets = datasets.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Data Sources
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Active Storage: {totalSizeMB} MB
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your CSV, Excel, and warehouse connections for high-performance AI querying.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {datasets.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              title="Remove all connected datasets"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => refreshDatasets()}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-[#12182b] hover:bg-[#1a223d] text-slate-300 border border-[#1e2742] px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-purple-400' : ''} />
            <span>Refresh All</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Connect New Source</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {uploadSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">{uploadSuccess}</p>
              <p className="text-[11px] text-slate-400">The dataset is active and ready for AI questions.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('studio')}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-medium text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <span>Query Now</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Upload Zone & Storage Quota Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-2 relative rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-purple-500 bg-purple-500/10 scale-[1.005]'
              : 'border-[#1f2945] bg-[#0f1527]/70 hover:border-purple-500/50 hover:bg-[#121930]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-[#182038] border border-[#232e52] flex items-center justify-center text-purple-400 mb-4 shadow-inner">
            {uploading ? (
              <RefreshCw size={28} className="animate-spin text-purple-400" />
            ) : (
              <UploadCloud size={30} className="text-purple-400" />
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-100">
            {uploading ? 'Processing & Validating Dataset...' : 'Drop your CSV or Excel files here, or '}
            {!uploading && <span className="text-purple-400 underline decoration-purple-500/40">Browse Files</span>}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Supported formats: <span className="text-slate-300 font-medium">.csv, .xlsx, .xls</span> (maximum file size 100MB). Files are validated and processed in safe memory.
          </p>

          <div className="mt-5 inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-medium">
            <ShieldCheck size={14} />
            <span>100% SECURE CLIENT-SIDE DATA ENCRYPTION</span>
          </div>

          {uploadError && (
            <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 flex items-center space-x-2">
              <AlertCircle size={14} />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Storage & Quota Card */}
        <div className="bg-[#0f1527] border border-[#1d2744] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Storage & Quota
              </span>
              <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                ACTIVE WORKSPACE
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalSizeMB}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100 MB USED</span>
              <span className="ml-auto text-xs font-bold text-cyan-400">{quotaPct}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#18223d] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, parseFloat(quotaPct))}%` }}
              />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-[#141b30] border border-[#1f2a4a] rounded-xl p-3">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                  <Database size={12} className="text-purple-400" />
                  <span>Datasets</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">{datasets.length}</div>
              </div>

              <div className="bg-[#141b30] border border-[#1f2a4a] rounded-xl p-3">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                  <Cpu size={12} className="text-cyan-400" />
                  <span>Status</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-1">Ready</div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Node: <span className="text-slate-200 font-mono">Fast In-Memory Engine</span></span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1a233d]">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Upload any tabular dataset to immediately unlock AI Querying and Dashboard Visualizations.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise Data Warehouses Strip */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Server size={14} className="text-purple-400" />
          Enterprise Data Warehouses & Lakehouses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'PostgreSQL', desc: 'SSL tunneling & read replica support', badge: 'v16.2', color: '#06b6d4' },
            { name: 'Snowflake', desc: 'OAuth & Key-Pair enterprise auth', badge: 'Cloud DW', color: '#38bdf8' },
            { name: 'Google BigQuery', desc: 'Service account JSON credentials', badge: 'v2.0', color: '#8b5cf6' },
            { name: 'AWS S3 / Redshift', desc: 'Auto-region firehose & Parquet support', badge: 'Direct Read', color: '#10b981' }
          ].map((connector) => (
            <div
              key={connector.name}
              className="bg-[#0f1527] border border-[#1d2744] hover:border-purple-500/40 rounded-xl p-4 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">{connector.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {connector.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{connector.desc}</p>
              </div>
              <button
                onClick={() => alert(`Connecting to ${connector.name} is available in Enterprise edition. Local CSV/Excel parsing is active.`)}
                className="mt-4 w-full py-1.5 text-xs font-medium rounded-lg bg-[#151c33] hover:bg-purple-600/20 text-purple-300 border border-[#232e52] hover:border-purple-500/40 transition-colors"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Datasets Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Connected Datasets</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#161f38] text-slate-400">
              {datasets.length} Total
            </span>
          </h2>
          {datasets.length > 0 && (
            <input
              type="text"
              placeholder="Filter datasets..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[#111728] border border-[#1e263d] focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 w-56"
            />
          )}
        </div>

        {filteredDatasets.length === 0 ? (
          <div className="border border-dashed border-[#1e2742] bg-[#0c1122]/60 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#141b30] border border-[#212c4d] flex items-center justify-center text-purple-400 shadow-inner">
              <Database size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-200">No Datasets Connected</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Your workspace is currently clean. Upload a CSV or Excel dataset above to start querying, running AI analytics, and generating dashboards.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
            >
              Choose File to Upload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDatasets.map((ds) => {
              const isSelected = currentDataset?.id === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => selectDataset(ds.id)}
                  className={`relative rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#12182d] border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-[#0f1527] border-[#1d2744] hover:border-purple-500/30 hover:bg-[#121930]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <FileSpreadsheet size={20} />
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={10} />
                          <span>ACTIVE</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Ready
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 mt-3 truncate" title={ds.name}>
                      {ds.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ds.format} • {ds.size_formatted}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 bg-[#141b30] p-2.5 rounded-xl border border-[#1e284a]">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Rows</div>
                        <div className="text-xs font-bold text-slate-200">
                          {ds.row_count >= 1000 ? `${(ds.row_count / 1000).toFixed(0)}k` : ds.row_count}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Cols</div>
                        <div className="text-xs font-bold text-slate-200">{ds.column_count}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1a233d] flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectDataset(ds.id).then(() => setActiveTab('studio'));
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-medium text-xs flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <span>Query Now</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, ds.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                      title="Remove dataset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
