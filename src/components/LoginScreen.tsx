import React, { useState } from 'react';
import { Plane, ShieldCheck, Sparkles, Radio, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginScreenProps {
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[550px] w-[550px] rounded-full bg-sky-600/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute top-[40%] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Logo & Headline */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25">
              <Plane className="h-7 w-7 text-white -rotate-45" />
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Welcome to <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">VYNTRA</span>
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Intelligent Travel Platform & AURA Ring Ecosystem
            </p>
          </div>

          {/* Value Highlights */}
          <div className="mt-6 space-y-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Real-time flight search & confirmed PNR generation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Radio className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>AURA Ring hands-free Airport Lounge & Gate access</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
              <span>Secure Google Identity & encrypted traveler profile</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-white px-5 py-3.5 text-xs font-bold text-slate-900 shadow-xl transition-all hover:bg-slate-100 active:scale-[0.99] disabled:opacity-50"
            >
              {isSigningIn ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {onContinueAsGuest && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                Or explore as Guest Traveler →
              </button>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
            <span className="text-[10px] text-slate-500">
              Protected by Firebase Authentication & Zero-Trust ABAC Security Rules
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
