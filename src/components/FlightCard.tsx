import React from 'react';
import {
  Clock,
  Luggage,
  ShieldCheck,
  ChevronRight,
  Info,
  Radio,
} from 'lucide-react';
import { VyntraFlightOffer } from '../types/travel.ts';

interface FlightCardProps {
  offer: VyntraFlightOffer;
  onSelect: (offer: VyntraFlightOffer) => void;
  onViewDetails: (offer: VyntraFlightOffer) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ offer, onSelect, onViewDetails }) => {
  const outbound = offer.itineraries[0];
  const returnItinerary = offer.itineraries[1];
  const firstSeg = outbound?.segments[0];
  const lastSeg = outbound?.segments[outbound.segments.length - 1];

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const parseDuration = (isoDuration: string) => {
    // e.g. PT2H45M
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return isoDuration;
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? ` ${match[2]}m` : '';
    return `${hours}${minutes}`.trim();
  };

  const stopsCount = outbound.segments.length - 1;

  // Airline background color style accents
  const getAirlineColor = (code: string) => {
    switch (code) {
      case '6E':
        return 'from-blue-600 to-indigo-600';
      case 'AI':
        return 'from-red-600 to-amber-600';
      case 'UK':
        return 'from-purple-600 to-pink-700';
      case 'SG':
        return 'from-amber-600 to-red-600';
      case 'QP':
        return 'from-orange-500 to-amber-500';
      default:
        return 'from-sky-600 to-indigo-600';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-sky-950/20">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr ${getAirlineColor(
              offer.airlineCode
            )} text-[11px] font-black text-white shadow-sm`}
          >
            {offer.airlineCode}
          </div>
          <div>
            <span className="text-sm font-bold text-white">{offer.airlineName}</span>
            <span className="ml-2 font-mono text-xs text-slate-400">{offer.flightNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {offer.source === 'AMADEUS_LIVE' ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Amadeus GDS Live
            </span>
          ) : (
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
              Verified Route
            </span>
          )}

          <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/20">
            {offer.fareDetails.cabin}
          </span>
        </div>
      </div>

      {/* Main Itinerary Visuals */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
        {/* Outbound Journey */}
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center justify-between sm:justify-start sm:gap-8">
            {/* Departure */}
            <div>
              <div className="text-xl font-extrabold text-white">
                {formatTime(firstSeg?.departure.at)}
              </div>
              <div className="text-xs font-semibold text-slate-300">
                {firstSeg?.departure.iataCode}
                {firstSeg?.departure.terminal && (
                  <span className="ml-1 text-[10px] text-slate-400">({firstSeg.departure.terminal})</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">{formatDate(firstSeg?.departure.at)}</div>
            </div>

            {/* Flight Flight Path Graphic */}
            <div className="flex flex-1 flex-col items-center max-w-[190px]">
              <div className="text-[10px] font-medium text-slate-400">
                {parseDuration(outbound.duration)}
              </div>
              <div className="relative my-1 flex w-full items-center justify-center">
                <div className="h-[2px] w-full bg-slate-700" />
                <div className="absolute flex h-2 w-2 items-center justify-center rounded-full bg-sky-400 ring-4 ring-slate-900" />
              </div>
              <div className="text-[10px] font-semibold text-sky-400">
                {stopsCount === 0 ? 'Non-stop' : `${stopsCount} Stop (${outbound.segments[0].arrival.iataCode})`}
              </div>
            </div>

            {/* Arrival */}
            <div>
              <div className="text-xl font-extrabold text-white">
                {formatTime(lastSeg?.arrival.at)}
              </div>
              <div className="text-xs font-semibold text-slate-300">
                {lastSeg?.arrival.iataCode}
                {lastSeg?.arrival.terminal && (
                  <span className="ml-1 text-[10px] text-slate-400">({lastSeg.arrival.terminal})</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">{formatDate(lastSeg?.arrival.at)}</div>
            </div>
          </div>

          {/* Return flight row if round-trip */}
          {returnItinerary && (
            <div className="mt-2 border-t border-slate-800/60 pt-2 flex items-center justify-between sm:justify-start sm:gap-8">
              <div>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400 uppercase">
                  Return
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  {formatTime(returnItinerary.segments[0]?.departure.at)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {returnItinerary.segments[0]?.departure.iataCode}
                </div>
              </div>

              <div className="flex flex-1 flex-col items-center max-w-[190px]">
                <div className="text-[10px] text-slate-400">{parseDuration(returnItinerary.duration)}</div>
                <div className="relative my-1 flex w-full items-center justify-center">
                  <div className="h-[2px] w-full bg-slate-700" />
                  <div className="absolute h-2 w-2 rounded-full bg-indigo-400 ring-4 ring-slate-900" />
                </div>
                <div className="text-[10px] text-slate-400">Non-stop</div>
              </div>

              <div>
                <div className="text-base font-bold text-white">
                  {formatTime(returnItinerary.segments[0]?.arrival.at)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {returnItinerary.segments[0]?.arrival.iataCode}
                </div>
              </div>
            </div>
          )}

          {/* Quick Perks / Baggage info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Luggage className="h-3 w-3 text-slate-400" />
              Cabin: {offer.fareDetails.baggageAllowance.cabinBaggage} • Check-in: {offer.fareDetails.baggageAllowance.checkedBaggage}
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Radio className="h-3 w-3" />
              AURA Pass Ready
            </span>
          </div>
        </div>

        {/* Pricing & Selection CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t border-slate-800 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 md:col-span-4">
          <div className="text-left md:text-right">
            <div className="text-xs text-slate-400">Total Price</div>
            <div className="text-2xl font-black text-white">
              {offer.price.currency === 'INR' ? '₹' : offer.price.currency + ' '}
              {offer.price.total.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Taxes & fees included</div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onViewDetails(offer)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              <Info className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onSelect(offer)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:opacity-95 active:scale-95"
            >
              <span>Select</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
