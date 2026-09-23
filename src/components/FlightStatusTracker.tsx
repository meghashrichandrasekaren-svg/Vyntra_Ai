import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Plane,
  Clock,
  Compass,
  Gauge,
  Luggage,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { fetchFlightStatus } from '../services/api.ts';
import { FlightStatusData } from '../types/travel.ts';

export const FlightStatusTracker: React.FC = () => {
  const [query, setQuery] = useState('6E 521');
  const [status, setStatus] = useState<FlightStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await fetchFlightStatus(query);
      setStatus(data);
    } catch (err: any) {
      setError('Unable to fetch live status for this flight.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Search Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl font-black text-white sm:text-2xl flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-400" />
          Live Flight Status & Terminal Radar
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Track real-time flight position, terminal, boarding gate, and baggage carousel updates.
        </p>

        <form onSubmit={handleSearch} className="mt-5 flex flex-wrap gap-2">
          <div className="flex flex-1 min-w-[240px] items-center rounded-2xl border border-slate-800 bg-slate-950 px-4 focus-within:border-sky-500">
            <Search className="mr-2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. 6E 521, AI 430, UK 836..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none uppercase font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-sky-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 transition-all disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track Flight'}
          </button>
        </form>

        {/* Quick flight tags */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">Try Sample:</span>
          {['6E 521', 'AI 430', 'UK 836', '6E 204'].map((flt) => (
            <button
              key={flt}
              type="button"
              onClick={() => {
                setQuery(flt);
              }}
              className="rounded-lg bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300 hover:text-sky-400"
            >
              {flt}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Status Results Display */}
      {status && (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 font-mono font-bold text-sm">
                {status.flightNumber.split(' ')[0]}
              </div>
              <div>
                <div className="text-base font-bold text-white">
                  {status.airline} • {status.flightNumber}
                </div>
                <div className="text-xs text-slate-400">Aircraft: {status.aircraft}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold border ${
                  status.status === 'ON TIME' || status.status === 'LANDED'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : status.status === 'BOARDING'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse'
                    : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                }`}
              >
                {status.status}
              </span>
            </div>
          </div>

          {/* Main Visual Tracker */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
              {/* Origin Station */}
              <div className="sm:col-span-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Departed</span>
                <div className="text-3xl font-black text-white">{status.origin.iata}</div>
                <div className="text-xs font-semibold text-slate-300">{status.origin.city}</div>
                <div className="mt-2 text-xs text-slate-400">
                  Terminal: <span className="font-bold text-white">{status.origin.terminal}</span> • Gate:{' '}
                  <span className="font-bold text-sky-400">{status.origin.gate}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Scheduled: {status.origin.scheduled.split(' ')[1]}
                </div>
              </div>

              {/* Progress Flight Graphic */}
              <div className="sm:col-span-4 flex flex-col items-center">
                <span className="text-xs font-bold text-sky-400">{status.progressPercent}% Complete</span>
                <div className="relative my-3 flex w-full items-center justify-center">
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                      style={{ width: `${status.progressPercent}%` }}
                    />
                  </div>
                  <Plane className="absolute text-sky-400 h-5 w-5 drop-shadow" style={{ left: `calc(${status.progressPercent}% - 10px)` }} />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                  <span>Alt: {status.altitude}</span>
                  <span>Speed: {status.speed}</span>
                </div>
              </div>

              {/* Destination Station */}
              <div className="sm:col-span-4 text-left sm:text-right">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Arriving</span>
                <div className="text-3xl font-black text-white">{status.destination.iata}</div>
                <div className="text-xs font-semibold text-slate-300">{status.destination.city}</div>
                <div className="mt-2 text-xs text-slate-400">
                  Terminal: <span className="font-bold text-white">{status.destination.terminal}</span> • Gate:{' '}
                  <span className="font-bold text-indigo-400">{status.destination.gate}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Estimated: {status.destination.estimated ? status.destination.estimated.split(' ')[1] : status.destination.scheduled.split(' ')[1]}
                </div>
              </div>
            </div>

            {/* Airport Operations Banner */}
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-800 pt-5 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/60 p-3">
                <MapPin className="h-5 w-5 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Arrival Carousel</div>
                  <div className="text-xs font-bold text-white">{status.baggageBelt}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/60 p-3">
                <Gauge className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Ground Speed</div>
                  <div className="text-xs font-bold text-white">{status.speed}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/60 p-3">
                <Compass className="h-5 w-5 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Cruising Altitude</div>
                  <div className="text-xs font-bold text-white">{status.altitude}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
