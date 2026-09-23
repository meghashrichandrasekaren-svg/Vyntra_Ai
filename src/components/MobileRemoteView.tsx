import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Bluetooth,
  BluetoothOff,
  Plane,
  ShieldCheck,
  ShieldAlert,
  Footprints,
  Radio,
  DoorOpen,
  Volume2,
  Lock,
} from 'lucide-react';
import { broadcastMobileBeacon } from '../services/api.ts';

export const MobileRemoteView: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pnr = urlParams.get('pnr') || 'VY7K9M';
  const defaultPhone = urlParams.get('phone') || '+91 98401 23456';

  const [phone, setPhone] = useState(defaultPhone);
  const [isBluetoothOn, setIsBluetoothOn] = useState(true);
  const [distance, setDistance] = useState(3.5);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [gateStatus, setGateStatus] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Send beacon update whenever phone, bluetooth, or distance changes
  const syncBeacon = async (dist: number, btOn: boolean, phoneNumber: string) => {
    setIsTransmitting(true);
    try {
      const response = await broadcastMobileBeacon(pnr, phoneNumber, btOn, dist);
      if (response && response.gateAccess) {
        setGateStatus(response.gateAccess);
      }
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Beacon sync error:', err);
    } finally {
      setIsTransmitting(false);
    }
  };

  useEffect(() => {
    syncBeacon(distance, isBluetoothOn, phone);
  }, []);

  const handleToggleBluetooth = () => {
    const nextState = !isBluetoothOn;
    setIsBluetoothOn(nextState);
    syncBeacon(distance, nextState, phone);
  };

  const handleDistanceChange = (newDist: number) => {
    setDistance(newDist);
    syncBeacon(newDist, isBluetoothOn, phone);
  };

  const handleWalkToGate = () => {
    setDistance(3.5);
    syncBeacon(3.5, isBluetoothOn, phone);

    setTimeout(() => {
      setDistance(1.8);
      syncBeacon(1.8, isBluetoothOn, phone);
    }, 400);

    setTimeout(() => {
      setDistance(0.5);
      syncBeacon(0.5, isBluetoothOn, phone);
    }, 900);
  };

  const handleStepBack = () => {
    setDistance(4.0);
    syncBeacon(4.0, isBluetoothOn, phone);
  };

  const isGateOpen = gateStatus?.gateOpen;
  const isSecurityAlert = gateStatus?.securityAlert;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans max-w-md mx-auto flex flex-col justify-between">
      {/* Mobile Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">VYNTRA Mobile Key</div>
              <div className="text-[10px] text-cyan-400 font-mono">PNR: {pnr}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[10px]">
            <Radio className={`h-3 w-3 ${isTransmitting ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
            <span className="text-slate-300">{isTransmitting ? 'Broadcasting...' : 'Synced'}</span>
          </div>
        </div>

        {/* Boarding Pass Identity Card */}
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-900 via-sky-950/30 to-slate-900 p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passenger</span>
              <div className="text-sm font-bold text-white">Meghashri Chandrasekaran</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Flight</span>
              <div className="text-sm font-bold text-sky-400">6E 521 • Gate 18A</div>
            </div>
          </div>

          {/* Registered Phone Input / Test */}
          <div className="mt-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Phone Number on this Device:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => syncBeacon(distance, isBluetoothOn, phone)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const testPhone = phone === defaultPhone ? '+91 91234 56789' : defaultPhone;
                  setPhone(testPhone);
                  syncBeacon(distance, isBluetoothOn, testPhone);
                }}
                className="shrink-0 rounded-xl bg-slate-800 border border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white"
              >
                {phone === defaultPhone ? 'Test Stranger Phone' : 'Reset My Phone'}
              </button>
            </div>
          </div>
        </div>

        {/* LIVE GATE STATUS ON LAPTOP */}
        <div
          className={`rounded-2xl border p-4 mb-4 text-center transition-all ${
            isGateOpen
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
              : isSecurityAlert
              ? 'border-red-500 bg-red-950/50 text-red-200 animate-pulse'
              : 'border-slate-800 bg-slate-900/60 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {isGateOpen ? (
              <>
                <DoorOpen className="h-6 w-6 text-emerald-400 animate-bounce" />
                <span className="text-sm font-black text-emerald-300 tracking-wider">GATE 18A IS UNLOCKED!</span>
              </>
            ) : isSecurityAlert ? (
              <>
                <ShieldAlert className="h-6 w-6 text-red-400" />
                <span className="text-sm font-black text-red-400 tracking-wider">SECURITY REJECTED!</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-slate-500" />
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  {!isBluetoothOn ? 'BLUETOOTH OFF (GATE LOCKED)' : 'GATE LOCKED (WALK CLOSER)'}
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] leading-snug">
            {gateStatus?.message || 'Transmit Bluetooth signal within 1.0m to unlock the turnstile gate.'}
          </p>
        </div>

        {/* BLUETOOTH ANTENNA TOGGLE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  isBluetoothOn
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {isBluetoothOn ? <Bluetooth className="h-6 w-6" /> : <BluetoothOff className="h-6 w-6" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Device Bluetooth</div>
                <div className={`text-[10px] font-bold ${isBluetoothOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isBluetoothOn ? 'TRANSMITTING TOKEN (ON)' : 'BLUETOOTH OFF'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleBluetooth}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isBluetoothOn
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isBluetoothOn ? 'TURN OFF' : 'TURN ON'}
            </button>
          </div>
        </div>

        {/* DISTANCE TO GATE PROXIMITY SLIDER */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Footprints className="h-4 w-4 text-cyan-400" />
              Proximity to Gate 18A:
            </span>
            <span className="font-mono text-sm font-black text-white">
              {distance.toFixed(1)}m
              {distance <= 1.0 && <span className="ml-1 text-emerald-400 text-xs">(Zone)</span>}
            </span>
          </div>

          <input
            type="range"
            min="0.3"
            max="5.0"
            step="0.1"
            value={distance}
            onChange={(e) => handleDistanceChange(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-cyan-400"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span>0.3m (At Gate)</span>
            <span className="text-cyan-400 font-bold">&lt; 1.0m Auto-Unlock</span>
            <span>5.0m (Far Away)</span>
          </div>

          {/* Quick Action Walk Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleWalkToGate}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 active:scale-95"
            >
              Walk to Gate (&lt;1m)
            </button>
            <button
              type="button"
              onClick={handleStepBack}
              className="shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white active:scale-95"
            >
              Step Back (4m)
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
        Physical Phone Live Controller • Connected to Airport Gate 18A Terminal
      </div>
    </div>
  );
};
