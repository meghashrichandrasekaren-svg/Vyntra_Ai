import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Radio,
  Lock,
  Unlock,
  Battery,
  AlertTriangle,
  DoorOpen,
  Coffee,
  Plane,
  Footprints,
  CheckCircle2,
  Volume2,
  Smartphone,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { verifyAuraGateAccess, broadcastMobileBeacon, pollMobileBeacon } from '../services/api.ts';
import { AuraBluetoothService, AuraDeviceProfile } from '../services/AuraBluetoothService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { BookingOrder } from '../types/travel.ts';

interface AuraRingModalProps {
  onClose: () => void;
  pnr?: string;
  booking?: BookingOrder;
}

export const AuraRingModal: React.FC<AuraRingModalProps> = ({ onClose, pnr, booking }) => {
  const { user } = useAuth();
  const currentPnr = pnr || booking?.pnr || 'VY7K9M';
  const registeredPassenger = booking?.passengers[0];
  const registeredName =
    (registeredPassenger ? `${registeredPassenger.firstName} ${registeredPassenger.lastName}` : '') ||
    user?.displayName ||
    'Meghashri Chandrasekaran';
  const registeredPhone = registeredPassenger?.phone || '+91 98401 23456';

  const [selectedGate, setSelectedGate] = useState<'LOUNGE' | 'BOARDING_GATE'>('BOARDING_GATE');
  const [distance, setDistance] = useState<number>(3.5); // Meters
  const [isLocked, setIsLocked] = useState(false);
  const [isAutoUnlocking, setIsAutoUnlocking] = useState(false);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [hapticBuzz, setHapticBuzz] = useState(false);
  const [accessLog, setAccessLog] = useState<string[]>([]);
  const [batteryLevel] = useState(94);
  const [copiedLink, setCopiedLink] = useState(false);

  // Phone Connection States
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(true);
  const [activeDevicePhone, setActiveDevicePhone] = useState(registeredPhone);
  const [deviceType, setDeviceType] = useState<'REGISTERED' | 'UNAUTHORIZED'>('REGISTERED');
  const [companionTabOpen, setCompanionTabOpen] = useState(false);

  // Web Bluetooth AURA Ring Pairing States
  const [pairedRing, setPairedRing] = useState<AuraDeviceProfile | null>(() =>
    AuraBluetoothService.getConnectedDevice()
  );
  const [isScanningBle, setIsScanningBle] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);

  // Register disconnect listener
  useEffect(() => {
    const unsubscribe = AuraBluetoothService.onDisconnected(() => {
      setPairedRing(null);
    });
    return unsubscribe;
  }, []);

  // Web Bluetooth Scan Triggered ONLY within direct user gesture (onClick)
  const handleScanBleRing = async () => {
    setIsScanningBle(true);
    setBleError(null);
    try {
      const deviceProfile = await AuraBluetoothService.requestAuraRingPairing({
        pnr: currentPnr,
        passengerPhone: registeredPhone,
        targetNamePrefix: 'AURA',
        allowSimulatedFallback: true,
      });
      setPairedRing(deviceProfile);
      const time = new Date().toLocaleTimeString();
      setAccessLog((prev) => [
        `[${time}] 💍 BLE PAIRED: ${deviceProfile.name} (${deviceProfile.id}) Battery ${deviceProfile.batteryLevel}%`,
        ...prev.slice(0, 4),
      ]);
    } catch (err: any) {
      setBleError(err.message || 'BLE Pairing failed');
    } finally {
      setIsScanningBle(false);
    }
  };

  const handleDisconnectBle = async () => {
    await AuraBluetoothService.disconnect();
    setPairedRing(null);
  };

  // Poll for real phone beacon updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const beaconData = await pollMobileBeacon(currentPnr);
        if (beaconData && beaconData.active && beaconData.beacon) {
          const { phone, bluetoothActive, distance: bDist } = beaconData.beacon;
          setActiveDevicePhone(phone);
          setIsBluetoothEnabled(bluetoothActive);
          setDistance(bDist);

          if (beaconData.gateAccess) {
            handleGateResult(beaconData.gateAccess);
          }
        }
      } catch (_) {}
    }, 1500);

    return () => clearInterval(interval);
  }, [currentPnr]);

  // Handle gate check when distance, phone, or bluetooth changes
  useEffect(() => {
    if (isLocked) {
      setGateUnlocked(false);
      return;
    }

    verifyAccess(distance);
  }, [distance, selectedGate, isLocked, activeDevicePhone, isBluetoothEnabled]);

  const verifyAccess = (dist: number) => {
    setIsAutoUnlocking(true);
    verifyAuraGateAccess(
      selectedGate,
      dist,
      currentPnr,
      'AURA-MOBILE-KEY',
      activeDevicePhone,
      isBluetoothEnabled
    ).then((result) => {
      setIsAutoUnlocking(false);
      handleGateResult(result);
    });
  };

  const handleGateResult = (result: any) => {
    if (!result) return;

    if (result.securityAlert) {
      // Security intrusion: Unauthorized phone detected!
      setGateUnlocked(false);
      setSecurityAlert(result.message);
      playSecurityAlarm();
      const time = new Date().toLocaleTimeString();
      setAccessLog((prev) => [`[${time}] 🚨 BLOCKED: ${result.message}`, ...prev.slice(0, 4)]);
    } else if (result.gateOpen) {
      // Authorized passenger phone with Bluetooth ON within 1m
      setGateUnlocked(true);
      setSecurityAlert(null);
      setHapticBuzz(true);
      playAirportChime();
      setTimeout(() => setHapticBuzz(false), 900);

      const time = new Date().toLocaleTimeString();
      const logEntry = `[${time}] ✅ AUTHENTICATED: ${result.gateName} Opened for ${result.passengerName} (${activeDevicePhone})`;
      setAccessLog((prev) => [logEntry, ...prev.slice(0, 4)]);
    } else {
      setGateUnlocked(false);
      setSecurityAlert(null);
    }
  };

  // Toggle between Registered Phone vs Stranger / Unauthorized Phone
  const handleSwitchDevice = (type: 'REGISTERED' | 'UNAUTHORIZED') => {
    setDeviceType(type);
    if (type === 'REGISTERED') {
      setActiveDevicePhone(registeredPhone);
    } else {
      setActiveDevicePhone('+91 91234 56789'); // Unauthorized phone
    }
  };

  // Toggle Bluetooth State
  const handleToggleBluetooth = () => {
    const newState = !isBluetoothEnabled;
    setIsBluetoothEnabled(newState);
    // Broadcast live update
    broadcastMobileBeacon(currentPnr, activeDevicePhone, newState, distance);
  };

  // Sound Synthesizers
  const playAirportChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.85);
    } catch (_) {}
  };

  const playSecurityAlarm = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Buzzer sawtooth tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  // Walk controls
  const handleWalkToGate = () => {
    if (isLocked) return;
    setDistance(3.5);
    setGateUnlocked(false);

    setTimeout(() => setDistance(2.2), 300);
    setTimeout(() => setDistance(1.4), 700);
    setTimeout(() => {
      setDistance(0.6);
      broadcastMobileBeacon(currentPnr, activeDevicePhone, isBluetoothEnabled, 0.6);
    }, 1100);
  };

  const handleStepBack = () => {
    setDistance(4.0);
    setGateUnlocked(false);
    broadcastMobileBeacon(currentPnr, activeDevicePhone, isBluetoothEnabled, 4.0);
  };

  const mobileRemoteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?mobileRemote=true&pnr=${encodeURIComponent(currentPnr)}&phone=${encodeURIComponent(registeredPhone)}`
    : '';

  const handleCopyLink = () => {
    if (mobileRemoteUrl) {
      navigator.clipboard.writeText(mobileRemoteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleOpenMobileTab = () => {
    if (mobileRemoteUrl) {
      window.open(mobileRemoteUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                securityAlert
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-bounce'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}
            >
              {securityAlert ? <ShieldAlert className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Smart Phone Bluetooth Boarding Gate</h3>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  PNR: {currentPnr}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Only the passenger's registered phone number with Bluetooth ON can unlock this gate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* SECURITY STATUS BANNER (RED FOR BREACH, GREEN FOR VERIFIED) */}
          {securityAlert ? (
            <div className="rounded-2xl border-2 border-red-500 bg-red-950/40 p-4 text-red-200 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-red-400 text-xs uppercase tracking-wider">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                SECURITY ALERT: UNAUTHORIZED PHONE DETECTED
              </div>
              <p className="mt-1 text-xs text-red-200">{securityAlert}</p>
              <div className="mt-2 text-[11px] font-mono text-red-300">
                Gate will remain permanently LOCKED until passenger phone ({registeredPhone}) is present.
              </div>
            </div>
          ) : gateUnlocked ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase tracking-wider">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                PASSENGER AUTHENTICATED & VERIFIED
              </div>
              <p className="mt-1 text-xs text-emerald-100">
                Registered phone ({registeredPhone}) verified via Bluetooth BLE Handshake (&lt;1m). Gate is unlocked!
              </p>
            </div>
          ) : null}

          {/* PASSENGER IDENTITY & BLUETOOTH CONTROL TERMINAL */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Registered Passenger & Ticket
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white">{registeredName}</span>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                    Flight 6E 521
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Authorized Phone Number
                </span>
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                  {registeredPhone}
                </span>
              </div>
            </div>

            {/* LIVE DEVICE & BLUETOOTH CONTROLS */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bluetooth Antenna Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      isBluetoothEnabled
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isBluetoothEnabled ? <Bluetooth className="h-5 w-5" /> : <BluetoothOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Phone Bluetooth</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isBluetoothEnabled ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {isBluetoothEnabled ? 'BROADCASTING TOKEN (ON)' : 'BLUETOOTH OFF (DISCONNECTED)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleBluetooth}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isBluetoothEnabled
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isBluetoothEnabled ? 'TURN OFF' : 'TURN ON'}
                </button>
              </div>

              {/* Security Test: Switch Phone Number */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Security Verification Test
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {deviceType === 'REGISTERED' ? 'My Authorized Phone' : "Stranger / Hacker's Phone"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSwitchDevice('REGISTERED')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      deviceType === 'REGISTERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    My Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchDevice('UNAUTHORIZED')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      deviceType === 'UNAUTHORIZED'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Stranger Phone
                  </button>
                </div>
              </div>
            </div>

            {/* Connecting Device Details Bar */}
            <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-900/40 rounded-lg p-2.5 border border-slate-800/60">
              <span className="text-slate-400">
                Currently Transmitting Device: <strong className="text-white">{activeDevicePhone}</strong>
              </span>
              <span
                className={`font-bold ${
                  deviceType === 'REGISTERED' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {deviceType === 'REGISTERED' ? '✓ Registered with Ticket' : '✗ Unregistered Device'}
              </span>
            </div>

            {/* AURA RING WEB BLUETOOTH BLE PAIRING SECTION */}
            <div className="mt-4 rounded-xl border border-cyan-500/20 bg-slate-900/90 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      AURA Ring Hardware BLE Pairing
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Web Bluetooth API (User-Initiated Gesture Required)
                    </span>
                  </div>
                </div>

                {pairedRing?.connected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      <BluetoothConnected className="h-3 w-3" />
                      BLE Paired & Connected
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnectBle}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-white"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleScanBleRing}
                    disabled={isScanningBle}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 disabled:opacity-50"
                  >
                    <Bluetooth className={`h-3.5 w-3.5 ${isScanningBle ? 'animate-spin' : ''}`} />
                    <span>{isScanningBle ? 'Scanning BLE Devices...' : 'Scan & Pair AURA Ring (BLE)'}</span>
                  </button>
                )}
              </div>

              {/* Paired Device Info Card or Prompt */}
              {pairedRing?.connected ? (
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Device</span>
                    <span className="text-cyan-300 font-bold truncate block">{pairedRing.name}</span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Battery</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      {pairedRing.batteryLevel}%
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Firmware</span>
                    <span className="text-slate-300">{pairedRing.firmwareVersion}</span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">PNR Token</span>
                    <span className="text-sky-400 font-bold">{pairedRing.pnrToken}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>
                    Click "Scan & Pair AURA Ring" to open the browser's native Bluetooth pairing dialog.
                  </span>
                  <span className="text-cyan-400/80 font-mono">BLE GATT UUID: 0x180F</span>
                </div>
              )}

              {bleError && (
                <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg p-2">
                  ⚠️ {bleError}
                </div>
              )}
            </div>
          </div>

          {/* TURNSTILE PHYSICAL FLAPPERS VISUALIZER */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center shadow-inner">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  gateUnlocked ? 'bg-emerald-400 animate-ping' : securityAlert ? 'bg-red-500 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-white">
                FLIGHT 6E 521 • GATE 18A TURNSTILE
              </span>
            </div>

            {/* Physical Barrier Flappers */}
            <div className="my-6 flex items-center justify-center gap-4 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="h-24 w-8 rounded-t-xl bg-slate-800 border-t-2 border-l-2 border-r-2 border-slate-700" />
                <div className="h-8 w-12 rounded-b-lg bg-slate-900" />
              </div>

              {/* Glass Flappers */}
              <div className="relative flex h-28 w-44 sm:w-56 items-center justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-2">
                <div
                  className={`h-20 w-16 rounded-xl border transition-transform duration-700 ${
                    gateUnlocked
                      ? '-translate-x-14 rotate-[-35deg] border-emerald-400/50 bg-emerald-500/20'
                      : securityAlert
                      ? 'border-red-500/50 bg-red-500/20'
                      : 'border-cyan-400/40 bg-cyan-500/20'
                  }`}
                />

                <div className="flex flex-col items-center justify-center z-10">
                  {gateUnlocked ? (
                    <div className="flex flex-col items-center text-emerald-400 animate-bounce">
                      <DoorOpen className="h-8 w-8 text-emerald-400" />
                      <span className="text-[10px] font-black tracking-wider uppercase mt-1">OPEN — WALK IN</span>
                    </div>
                  ) : securityAlert ? (
                    <div className="flex flex-col items-center text-red-400">
                      <ShieldAlert className="h-7 w-7 text-red-400 mb-1 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-wider">ACCESS DENIED</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <Lock className="h-6 w-6 text-slate-600 mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {!isBluetoothEnabled ? 'BLUETOOTH OFF' : 'GATE LOCKED'}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`h-20 w-16 rounded-xl border transition-transform duration-700 ${
                    gateUnlocked
                      ? 'translate-x-14 rotate-[35deg] border-emerald-400/50 bg-emerald-500/20'
                      : securityAlert
                      ? 'border-red-500/50 bg-red-500/20'
                      : 'border-cyan-400/40 bg-cyan-500/20'
                  }`}
                />
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-8 rounded-t-xl bg-slate-800 border-t-2 border-l-2 border-r-2 border-slate-700" />
                <div className="h-8 w-12 rounded-b-lg bg-slate-900" />
              </div>
            </div>

            {/* Proximity Distance Gauge */}
            <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Footprints className="h-4 w-4 text-cyan-400" />
                  Your Proximity to Gate 18A:
                </span>
                <span className="font-mono text-sm font-black text-white">
                  {distance.toFixed(1)} meters
                  {distance <= 1.0 && <span className="ml-2 text-emerald-400 text-xs">(Within Unlock Zone)</span>}
                </span>
              </div>

              <input
                type="range"
                min="0.3"
                max="5.0"
                step="0.1"
                value={distance}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setDistance(val);
                  broadcastMobileBeacon(currentPnr, activeDevicePhone, isBluetoothEnabled, val);
                }}
                className="w-full cursor-pointer accent-cyan-400"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>0.3m (At Gate)</span>
                <span className="text-cyan-400 font-bold">◄ 1.0m Auto-Unlock Threshold ►</span>
                <span>5.0m (Far Away)</span>
              </div>
            </div>

            {/* Walk Simulator Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleWalkToGate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-95"
              >
                <Footprints className="h-4 w-4" />
                <span>Walk to Gate (&lt;1m)</span>
              </button>

              <button
                type="button"
                onClick={handleStepBack}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Step Back (4m)
              </button>
            </div>
          </div>

          {/* REAL MOBILE PHONE REMOTE CONNECT (QR CODE & DIRECT LINK) */}
          <div className="rounded-2xl border-2 border-dashed border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-sky-950/30 p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code */}
              <div className="shrink-0 bg-white p-2 rounded-xl shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=0&data=${encodeURIComponent(mobileRemoteUrl)}`}
                  alt="Scan QR with Phone"
                  className="h-24 w-24 object-contain"
                />
              </div>

              {/* Description & Buttons */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Smartphone className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">
                    Scan with Your Real Mobile Phone Camera
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                  Open this link on your physical phone! When your real phone's Bluetooth is ON and you walk towards the gate (&lt;1m),
                  <strong> this airport turnstile will automatically open with chime!</strong>
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? 'Copied Phone Link!' : 'Copy Mobile Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenMobileTab}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Mobile Remote (New Tab)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Proximity Access Log */}
          {accessLog.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Real-Time Proximity Access Log:
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                {accessLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${
                      log.includes('BLOCKED') ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
