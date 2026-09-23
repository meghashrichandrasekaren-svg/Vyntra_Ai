import React, { useState } from 'react';
import {
  Luggage,
  Plane,
  Calendar,
  Clock,
  QrCode,
  Radio,
  Search,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { BookingOrder } from '../types/travel.ts';

interface MyTripsProps {
  trips: BookingOrder[];
  onSelectBooking: (booking: BookingOrder) => void;
  onBookFlight: () => void;
  openAuraModal: () => void;
}

export const MyTrips: React.FC<MyTripsProps> = ({
  trips,
  onSelectBooking,
  onBookFlight,
  openAuraModal,
}) => {
  const [searchPnr, setSearchPnr] = useState('');

  const filteredTrips = trips.filter(
    (t) =>
      t.pnr.toLowerCase().includes(searchPnr.toLowerCase()) ||
      t.flightOffer.airlineName.toLowerCase().includes(searchPnr.toLowerCase()) ||
      t.passengers.some((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchPnr.toLowerCase())
      )
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Title & PNR Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">My Trips & Reservations</h2>
          <p className="text-xs text-slate-400">View upcoming flights, e-tickets, and manage AURA credentials.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-10 items-center rounded-xl border border-slate-800 bg-slate-900 px-3 focus-within:border-sky-500">
            <Search className="mr-2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by PNR or Traveler..."
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-48 sm:w-56"
            />
          </div>
          <button
            onClick={onBookFlight}
            className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:bg-sky-400 transition-all"
          >
            + Book Flight
          </button>
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <Luggage className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">No Trips Found</h3>
          <p className="mt-1 text-xs text-slate-400">
            {searchPnr
              ? `No booking found matching "${searchPnr}". Please verify the PNR code.`
              : 'You have no active flights booked yet.'}
          </p>
          <button
            onClick={onBookFlight}
            className="mt-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            Search Flights Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const offer = trip.flightOffer;
            const outbound = offer.itineraries[0];
            const firstSeg = outbound.segments[0];
            const lastSeg = outbound.segments[outbound.segments.length - 1];

            return (
              <div
                key={trip.bookingId}
                className="group rounded-3xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-slate-700 hover:bg-slate-900 shadow-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-sky-400">PNR: {trip.pnr}</span>
                    <span className="text-xs text-slate-400">• Booked on {new Date(trip.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {trip.auraCredentialSynced ? (
                      <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                        <Radio className="h-3 w-3" />
                        AURA Credential Synced
                      </span>
                    ) : (
                      <button
                        onClick={openAuraModal}
                        className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300"
                      >
                        + Sync AURA Ring
                      </button>
                    )}
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {trip.status}
                    </span>
                  </div>
                </div>

                {/* Flight Summary */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-8 flex items-center justify-between sm:justify-start sm:gap-8">
                    <div>
                      <div className="text-xl font-bold text-white">{firstSeg.departure.iataCode}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(firstSeg.departure.at).toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                        {new Date(firstSeg.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-slate-400">{offer.airlineName} ({offer.flightNumber})</div>
                      <div className="relative my-1 flex w-24 items-center justify-center">
                        <div className="h-[2px] w-full bg-slate-700" />
                        <Plane className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400">Non-Stop</div>
                    </div>

                    <div>
                      <div className="text-xl font-bold text-white">{lastSeg.arrival.iataCode}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(lastSeg.arrival.at).toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                        {new Date(lastSeg.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Traveler info & action button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-800 pt-3 sm:border-t-0 sm:pt-0 sm:col-span-4">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-semibold text-white">
                        {trip.passengers[0].firstName} {trip.passengers[0].lastName}
                        {trip.passengers.length > 1 && ` +${trip.passengers.length - 1} more`}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {trip.payment.currency} {trip.payment.amount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectBooking(trip)}
                      className="flex items-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700"
                    >
                      <span>View Pass</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
