import React from 'react';
import {
  Plane,
  Luggage,
  Activity,
  Bot,
  KeyRound,
  ShieldCheck,
  Radio,
  Sparkles,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  activeTab: 'search' | 'trips' | 'status';
  setActiveTab: (tab: 'search' | 'trips' | 'status') => void;
  openAuraModal: () => void;
  openAiModal: () => void;
  openSettingsModal: () => void;
  isAmadeusConnected: boolean;
  tripCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuraModal,
  openAiModal,
  openSettingsModal,
  isAmadeusConnected,
  tripCount,
}) => {
  const { user, signIn, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('search')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Plane className="h-5 w-5 text-sky-400 -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-white">VYNTRA</span>
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-400 border border-sky-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] tracking-tight text-slate-400">Intelligent Travel Platform</p>
          </div>
        </div>

        {/* Central Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-800/80 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            Flight Search
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'trips'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Luggage className="h-3.5 w-3.5" />
            My Trips
            {tripCount > 0 && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-sky-300">
                {tripCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Flight Status
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Okay Vyntra AI Assistant Button */}
          <button
            onClick={openAiModal}
            className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-all hover:border-indigo-400/50 hover:from-indigo-500/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">"Okay Vyntra"</span>
          </button>

          {/* AURA Ring Credential Button */}
          <button
            onClick={openAuraModal}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-900/40 shadow-sm shadow-cyan-500/10"
            title="AURA Ring: Airport Lounge & Gate Auto-Unlock"
          >
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline">AURA Ring Gate & Lounge</span>
            <span className="lg:hidden">AURA Gate</span>
          </button>

          {/* API Connection Indicator & Settings */}
          <button
            onClick={openSettingsModal}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-900/40 shadow-sm shadow-emerald-500/10"
            title="GDS Flight Engine Status"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">
              {isAmadeusConnected ? 'Amadeus Live GDS' : 'Vyntra Live GDS'}
            </span>
            <span className="sm:hidden">Live GDS</span>
            <KeyRound className="h-3 w-3 opacity-60" />
          </button>

          {/* User Profile / Google Sign-In */}
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 py-1 pl-1 pr-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-6 w-6 rounded-full object-cover border border-slate-600"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
              <span className="max-w-[75px] sm:max-w-[105px] truncate text-xs font-semibold text-white">
                {user.displayName?.split(' ')[0] || 'Traveler'}
              </span>
              <button
                onClick={logout}
                title="Sign out of Google"
                className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 transition-all hover:bg-sky-500/20 shadow-sm shadow-sky-500/10"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Google Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
