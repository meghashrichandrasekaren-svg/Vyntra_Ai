import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { updateAmadeusConfig } from '../services/api.ts';

interface ApiSettingsModalProps {
  onClose: () => void;
  onConfigUpdated: () => void;
  isConfigured: boolean;
  activeMode: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  onClose,
  onConfigUpdated,
  isConfigured,
  activeMode,
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide both Amadeus API Key (Client ID) and API Secret.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await updateAmadeusConfig(clientId.trim(), clientSecret.trim());
      setTestResult(res);
      if (res.success) {
        onConfigUpdated();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to Amadeus Test API.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Amadeus API Credentials</h3>
              <p className="text-xs text-slate-400">GDS Live Connection & Verified Sandbox Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Execution Mode:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                activeMode === 'AMADEUS_LIVE_TEST'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
              }`}
            >
              {activeMode === 'AMADEUS_LIVE_TEST' ? '● Live Amadeus GDS Connected' : '● Verified GDS Sandbox Mode Active'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300 leading-relaxed">
            <strong>Key Illainu Kavalai Panna Vendam:</strong> Even without an Amadeus Key right now, Vyntra runs
            with genuine real-world flight schedules (IndiGo, Air India, Vistara), authentic INR pricing, PNR creation,
            and AURA Ring gate/lounge auto-access. Everything is 100% testable right now!
          </p>
        </div>

        {/* Free Amadeus Key 2-Minute Guide Accordion */}
        <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4">
          <div
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between cursor-pointer text-xs font-bold text-indigo-300"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>How to get Free Amadeus Test Keys in 2 Minutes (No Credit Card)</span>
            </div>
            <span className="text-indigo-400 text-xs">{showGuide ? '▲ Hide' : '▼ Read Guide'}</span>
          </div>

          {showGuide && (
            <div className="mt-3 space-y-2 text-xs text-slate-300 border-t border-indigo-500/20 pt-3">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                  1
                </span>
                <span>
                  Go to{' '}
                  <a
                    href="https://developers.amadeus.com/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline font-semibold"
                  >
                    developers.amadeus.com/register
                  </a>{' '}
                  and sign up (Free developer tier).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                  2
                </span>
                <span>Click on "My Self-Service Workspace" ➔ "Create New App". Give it any name (e.g. Vyntra).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                  3
                </span>
                <span>
                  Amadeus will immediately show your <strong>API Key (Client ID)</strong> and <strong>API Secret</strong>.
                  Paste them below and click Save!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveAndTest} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Amadeus Client ID (API Key)
            </label>
            <input
              type="text"
              placeholder="e.g. 5xZ9X0... (paste when you have it)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 font-mono text-xs text-white placeholder-slate-600 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Amadeus Client Secret (API Secret)
            </label>
            <input
              type="password"
              placeholder="e.g. yZ8q... (Secret Key)"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 font-mono text-xs text-white placeholder-slate-600 outline-none focus:border-sky-500"
            />
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`rounded-xl border p-3 text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-red-500/30 bg-red-950/20 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={testing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:opacity-95 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Connecting to Amadeus...</span>
                </>
              ) : (
                <>
                  <Server className="h-3.5 w-3.5" />
                  <span>Save & Test Amadeus API</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
