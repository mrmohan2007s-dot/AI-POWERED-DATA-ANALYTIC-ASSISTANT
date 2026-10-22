import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Check, Shield, Server, Cpu, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const { settings, refreshDatasets } = useApp();
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setProvider(settings.llm_provider || 'gemini');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        groq_api_key: groqKey || undefined,
        llm_provider: provider
      });
      setSavedSuccess(true);
      await refreshDatasets();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon size={24} className="text-purple-400" />
          System Settings & API Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure AI LLM credentials, execution engine parameters, and storage thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Provider Config */}
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Key size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">LLM API Credentials</h3>
                <p className="text-xs text-slate-400">
                  Enable natural language query understanding and executive summaries with your own API key.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Zero Key Dependency: Fallback Engine Active
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder={settings?.gemini_configured ? '•••••••••••••••••••••••••••••••• (Configured)' : 'AIzaSy...'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-[#12182b] border border-[#1e2847] focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supports Gemini 1.5 Flash / Pro.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                placeholder={settings?.openai_configured ? '•••••••••••••••••••••••••••••••• (Configured)' : 'sk-...'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-[#12182b] border border-[#1e2847] focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Groq Cloud API Key (Optional)
              </label>
              <input
                type="password"
                placeholder={settings?.groq_configured ? '•••••••••••••••••••••••••••••••• (Configured)' : 'gsk_...'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-[#12182b] border border-[#1e2847] focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Local Security & Sandbox Guarantee */}
        <div className="bg-[#0f1527] border border-[#1e2847] rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security & Execution Sandbox</h3>
              <p className="text-xs text-slate-400">Strict guarantees applied to all dataset operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="bg-[#12182b] p-3 rounded-xl border border-[#1e2744] flex items-center space-x-2">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>Zero <code className="text-purple-300">eval()</code> or <code className="text-purple-300">exec()</code> in Python engine</span>
            </div>
            <div className="bg-[#12182b] p-3 rounded-xl border border-[#1e2744] flex items-center space-x-2">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>Allowlist validated operators & column schemas</span>
            </div>
            <div className="bg-[#12182b] p-3 rounded-xl border border-[#1e2744] flex items-center space-x-2">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>100MB maximum upload limit enforced</span>
            </div>
            <div className="bg-[#12182b] p-3 rounded-xl border border-[#1e2744] flex items-center space-x-2">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>In-memory DataFrame sandboxing with zero data leakage</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-medium">
            {savedSuccess && '✓ Settings updated and applied to active session.'}
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
