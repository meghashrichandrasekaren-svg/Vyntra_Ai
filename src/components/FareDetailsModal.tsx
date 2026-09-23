import React from 'react';
import {
  X,
  Luggage,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Plane,
  Receipt,
  Radio,
} from 'lucide-react';
import { VyntraFlightOffer } from '../types/travel.ts';

interface FareDetailsModalProps {
  offer: VyntraFlightOffer;
  onClose: () => void;
  onSelectOffer: (offer: VyntraFlightOffer) => void;
}

export const FareDetailsModal: React.FC<FareDetailsModalProps> = ({
  offer,
  onClose,
  onSelectOffer,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Plane className="h-5 w-5 -rotate-45" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Fare Details & Policy</h3>
              <p className="text-xs text-slate-400">
                {offer.airlineName} ({offer.flightNumber}) • {offer.fareDetails.cabin}
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

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Price Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Receipt className="h-4 w-4 text-sky-400" />
              Fare Breakdown
            </h4>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Base Airfare</span>
                <span className="font-mono">
                  {offer.price.currency} {offer.price.base.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Airport Taxes, Fuel Surcharge & User Development Fee</span>
                <span className="font-mono">
                  {offer.price.currency} {offer.price.taxes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white">
                <span>Total Fare (per traveler)</span>
                <span className="font-mono text-sky-400">
                  {offer.price.currency} {offer.price.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Baggage Policy */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Luggage className="h-4 w-4 text-sky-400" />
              Baggage Rules
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div className="text-xs font-semibold text-slate-400">Cabin (Hand) Baggage</div>
                <div className="mt-1 text-base font-bold text-white">
                  {offer.fareDetails.baggageAllowance.cabinBaggage}
                </div>
                <div className="text-[11px] text-slate-400">1 standard bag + laptop/handbag</div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div className="text-xs font-semibold text-slate-400">Checked-in Baggage</div>
                <div className="mt-1 text-base font-bold text-white">
                  {offer.fareDetails.baggageAllowance.checkedBaggage}
                </div>
                <div className="text-[11px] text-slate-400">Per paying passenger</div>
              </div>
            </div>
          </div>

          {/* Cancellation & Rescheduling */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              {offer.fareDetails.refundable ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              )}
              Refund & Change Policy
            </h4>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  {offer.fareDetails.refundable
                    ? 'Partially refundable up to 24 hours prior to scheduled departure (airline cancellation fees apply).'
                    : 'Standard non-refundable saver ticket; government and airport taxes refundable upon cancellation.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Date change permitted up to 4 hours before departure with difference in fare.</span>
              </div>
            </div>
          </div>

          {/* Credential & Amenities */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Radio className="h-4 w-4 text-cyan-400" />
              Vyntra Travel Credentials & Amenities
            </h4>
            <div className="mt-2 space-y-1.5 text-xs text-slate-300">
              {offer.fareDetails.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>{amenity}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-cyan-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Compatible with AURA Ring digital credential sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onSelectOffer(offer);
            }}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:opacity-95"
          >
            Proceed with this Fare ({offer.price.currency} {offer.price.total.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  );
};
