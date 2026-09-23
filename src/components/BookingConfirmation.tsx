import React, { useState } from 'react';
import {
  CheckCircle2,
  Plane,
  QrCode,
  Radio,
  Printer,
  Copy,
  Check,
  Calendar,
  User,
  ShieldCheck,
  ArrowRight,
  Bluetooth,
  Smartphone,
} from 'lucide-react';
import { BookingOrder } from '../types/travel.ts';
import { syncAuraRing } from '../services/api.ts';

interface BookingConfirmationProps {
  booking: BookingOrder;
  onViewTrips: () => void;
  onBookAnother: () => void;
  openAuraModal: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onViewTrips,
  onBookAnother,
  openAuraModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAuraSynced, setIsAuraSynced] = useState(booking.auraCredentialSynced || false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(booking.pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAuraSync = async () => {
    setIsSyncing(true);
    await syncAuraRing(booking.bookingId);
    setTimeout(() => {
      setIsAuraSynced(true);
      setIsSyncing(false);
    }, 1200);
  };

  const offer = booking.flightOffer;
  const outbound = offer.itineraries[0];
  const firstSeg = outbound.segments[0];
  const lastSeg = outbound.segments[outbound.segments.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/30 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Booking Confirmed!</h2>
        <p className="mt-1 text-sm text-slate-300">
          Your flight reservation is confirmed and ticketed with {offer.airlineName}.
        </p>

        {/* PNR Banner */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/80 px-6 py-3 shadow-inner">
          <span className="text-xs uppercase tracking-wider text-slate-400">Booking Reference (PNR):</span>
          <span className="font-mono text-2xl font-black tracking-widest text-sky-400">{booking.pnr}</span>
          <button
            onClick={handleCopyPNR}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Pass Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <Plane className="h-5 w-5 text-sky-400 -rotate-45" />
            <div>
              <span className="text-sm font-bold text-white">{offer.airlineName}</span>
              <span className="ml-2 font-mono text-xs text-slate-400">{offer.flightNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/20">
              {offer.fareDetails.cabin} Class
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Flight Route Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            {/* Origin */}
            <div className="md:col-span-4">
              <span className="text-xs font-medium text-slate-400">Departure</span>
              <div className="text-3xl font-black text-white">{firstSeg.departure.iataCode}</div>
              <div className="text-xs font-semibold text-slate-300">
                Terminal {firstSeg.departure.terminal || 'T1'}
              </div>
              <div className="mt-1 text-xs text-sky-400">
                {new Date(firstSeg.departure.at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {/* Flight Path */}
            <div className="flex flex-col items-center justify-center text-center md:col-span-4">
              <span className="text-[11px] text-slate-400">Duration: {outbound.duration.replace('PT', '').toLowerCase()}</span>
              <div className="relative my-2 flex w-full max-w-[160px] items-center justify-center">
                <div className="h-[2px] w-full bg-slate-700" />
                <Plane className="h-4 w-4 text-sky-400" />
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">Non-Stop</span>
            </div>

            {/* Destination */}
            <div className="text-left md:col-span-4 md:text-right">
              <span className="text-xs font-medium text-slate-400">Arrival</span>
              <div className="text-3xl font-black text-white">{lastSeg.arrival.iataCode}</div>
              <div className="text-xs font-semibold text-slate-300">
                Terminal {lastSeg.arrival.terminal || 'T2'}
              </div>
              <div className="mt-1 text-xs text-indigo-400">
                {new Date(lastSeg.arrival.at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Passenger details & QR Code Row */}
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-800 pt-6 sm:grid-cols-12">
            <div className="sm:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Passenger(s)</span>
                <div className="mt-2 space-y-2">
                  {booking.passengers.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl bg-slate-950/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-bold text-white">
                          {p.firstName} {p.lastName}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        E-Ticket: ETKT-VY-88{i + 1}9
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Receipt Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Paid with {booking.payment.method}</span>
                  <span className="font-mono font-bold text-white">
                    {booking.payment.currency} {booking.payment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  Transaction Ref: {booking.payment.transactionId}
                </div>
              </div>
            </div>

            {/* Simulated Airport Turnstile QR */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:col-span-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-white p-2 text-slate-950 shadow-md">
                <QrCode className="h-full w-full" />
              </div>
              <span className="mt-2 text-[10px] font-mono text-slate-400">SCAN AT GATE TURNSTILE</span>
            </div>
          </div>
        </div>

        {/* Pass Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Phone Bluetooth / AURA Ring Gate Access */}
            <button
              onClick={openAuraModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              <Bluetooth className="h-4 w-4" />
              <span>Open Gate with Phone Bluetooth / Ring</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Printer className="h-4 w-4" />
              <span>Print E-Ticket</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBookAnother}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Book Another Flight
            </button>
            <button
              onClick={onViewTrips}
              className="flex items-center gap-1 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:bg-sky-400"
            >
              <span>View in My Trips</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
