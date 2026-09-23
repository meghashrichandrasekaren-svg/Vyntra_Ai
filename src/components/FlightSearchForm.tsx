import React, { useState, useEffect, useRef } from 'react';
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  ArrowRightLeft,
  Search,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { FlightSearchCriteria, AirportInfo } from '../types/travel.ts';
import { searchAirports } from '../services/api.ts';

interface FlightSearchFormProps {
  onSearch: (criteria: FlightSearchCriteria) => void;
  isLoading: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch, isLoading }) => {
  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ONE_WAY');
  const [origin, setOrigin] = useState('MAA');
  const [originLabel, setOriginLabel] = useState('Chennai (MAA)');
  const [destination, setDestination] = useState('DEL');
  const [destinationLabel, setDestinationLabel] = useState('Delhi (DEL)');

  // Default to 14 days in future
  const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [departureDate, setDepartureDate] = useState(getFutureDate(10));
  const [returnDate, setReturnDate] = useState(getFutureDate(17));
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'>('ECONOMY');

  // Autocomplete states
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [originAirports, setOriginAirports] = useState<AirportInfo[]>([]);
  const [destAirports, setDestAirports] = useState<AirportInfo[]>([]);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setIsDestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch airport suggestions
  useEffect(() => {
    if (isOriginOpen) {
      searchAirports(originSearch).then(setOriginAirports);
    }
  }, [originSearch, isOriginOpen]);

  useEffect(() => {
    if (isDestOpen) {
      searchAirports(destSearch).then(setDestAirports);
    }
  }, [destSearch, isDestOpen]);

  const handleSwapAirports = () => {
    const tempIata = origin;
    const tempLabel = originLabel;
    setOrigin(destination);
    setOriginLabel(destinationLabel);
    setDestination(tempIata);
    setDestinationLabel(tempLabel);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    onSearch({
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined,
      passengers,
      cabinClass,
    });
  };

  const setQuickRoute = (fromIata: string, fromText: string, toIata: string, toText: string) => {
    setOrigin(fromIata);
    setOriginLabel(fromText);
    setDestination(toIata);
    setDestinationLabel(toText);
  };

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Search Header & Type Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTripType('ONE_WAY')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              tripType === 'ONE_WAY'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType('ROUND_TRIP')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              tripType === 'ROUND_TRIP'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Quick Popular Routes */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Popular:</span>
          <button
            type="button"
            onClick={() => setQuickRoute('MAA', 'Chennai (MAA)', 'DEL', 'Delhi (DEL)')}
            className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition-colors"
          >
            MAA → DEL
          </button>
          <button
            type="button"
            onClick={() => setQuickRoute('BOM', 'Mumbai (BOM)', 'BLR', 'Bengaluru (BLR)')}
            className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition-colors"
          >
            BOM → BLR
          </button>
          <button
            type="button"
            onClick={() => setQuickRoute('DEL', 'Delhi (DEL)', 'DXB', 'Dubai (DXB)')}
            className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition-colors"
          >
            DEL → DXB
          </button>
        </div>
      </div>

      {/* Main Search Inputs Grid */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-2">
          {/* Origin Airport Input */}
          <div className="relative lg:col-span-3" ref={originRef}>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              From (Origin)
            </label>
            <div
              onClick={() => {
                setIsOriginOpen(true);
                setOriginSearch('');
              }}
              className="flex h-14 cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <PlaneTakeoff className="h-5 w-5 text-sky-400" />
                <div>
                  <div className="text-base font-bold text-white tracking-wide">{origin}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[140px]">{originLabel}</div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>

            {/* Origin Dropdown Autocomplete */}
            {isOriginOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                <input
                  type="text"
                  placeholder="Search city, airport or IATA..."
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
                />
                <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
                  {originAirports.map((airport) => (
                    <div
                      key={airport.iataCode}
                      onClick={() => {
                        setOrigin(airport.iataCode);
                        setOriginLabel(`${airport.city} (${airport.iataCode})`);
                        setIsOriginOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-800"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {airport.city} ({airport.iataCode})
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[190px]">{airport.name}</div>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-sky-400">
                        {airport.iataCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button (between From & To) */}
          <div className="flex items-center justify-center lg:col-span-1">
            <button
              type="button"
              onClick={handleSwapAirports}
              aria-label="Swap departure and arrival"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-slate-300 transition-transform hover:rotate-180 hover:bg-slate-700 hover:text-white"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Destination Airport Input */}
          <div className="relative lg:col-span-3" ref={destRef}>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              To (Destination)
            </label>
            <div
              onClick={() => {
                setIsDestOpen(true);
                setDestSearch('');
              }}
              className="flex h-14 cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <PlaneLanding className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="text-base font-bold text-white tracking-wide">{destination}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[140px]">{destinationLabel}</div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>

            {/* Destination Dropdown Autocomplete */}
            {isDestOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                <input
                  type="text"
                  placeholder="Search city, airport or IATA..."
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
                  {destAirports.map((airport) => (
                    <div
                      key={airport.iataCode}
                      onClick={() => {
                        setDestination(airport.iataCode);
                        setDestinationLabel(`${airport.city} (${airport.iataCode})`);
                        setIsDestOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-800"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {airport.city} ({airport.iataCode})
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[190px]">{airport.name}</div>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-indigo-400">
                        {airport.iataCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Departure Date */}
          <div className={`lg:${tripType === 'ROUND_TRIP' ? 'col-span-2' : 'col-span-3'}`}>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Departure Date
            </label>
            <div className="flex h-14 items-center rounded-2xl border border-slate-800 bg-slate-950/70 px-3 transition-all focus-within:border-sky-500">
              <Calendar className="mr-2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={departureDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Return Date (if Round Trip) */}
          {tripType === 'ROUND_TRIP' && (
            <div className="lg:col-span-2">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Return Date
              </label>
              <div className="flex h-14 items-center rounded-2xl border border-slate-800 bg-slate-950/70 px-3 transition-all focus-within:border-sky-500">
                <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={returnDate}
                  min={departureDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          )}

          {/* Passenger & Cabin */}
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Travelers & Class
            </label>
            <div className="flex h-14 items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n} className="bg-slate-900 text-white">
                      {n} {n === 1 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as any)}
                className="bg-transparent text-[11px] font-medium text-sky-400 outline-none cursor-pointer max-w-[85px] truncate"
              >
                <option value="ECONOMY" className="bg-slate-900 text-white">Economy</option>
                <option value="PREMIUM_ECONOMY" className="bg-slate-900 text-white">Prem. Econ</option>
                <option value="BUSINESS" className="bg-slate-900 text-white">Business</option>
                <option value="FIRST" className="bg-slate-900 text-white">First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Search live fares from global distribution systems (Amadeus GDS / NDC)</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:opacity-95 disabled:opacity-50 active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Searching Flights...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Find Flights</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
