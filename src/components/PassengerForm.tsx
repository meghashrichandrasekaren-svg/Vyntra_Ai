import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Plane,
  ArrowLeft,
  CreditCard,
  Armchair,
  Check,
  Utensils,
  Luggage,
} from 'lucide-react';
import { VyntraFlightOffer, Passenger } from '../types/travel.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PassengerFormProps {
  offer: VyntraFlightOffer;
  passengerCount: number;
  onBack: () => void;
  onSubmit: (passengers: Passenger[]) => void;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  offer,
  passengerCount,
  onBack,
  onSubmit,
}) => {
  const { user } = useAuth();
  const nameParts = user?.displayName ? user.displayName.split(' ') : [];
  const defaultFirst = nameParts[0] || 'Meghashri';
  const defaultLast = nameParts.slice(1).join(' ') || 'Chandrasekaran';
  const defaultEmail = user?.email || 'meghashrichandrasekaren@gmail.com';

  // Initialize passengers list
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    return Array.from({ length: passengerCount }, (_, i) => ({
      id: `p-${i + 1}`,
      firstName: i === 0 ? defaultFirst : '',
      lastName: i === 0 ? defaultLast : '',
      dateOfBirth: i === 0 ? '2001-08-15' : '1998-01-01',
      gender: i === 0 ? 'FEMALE' : 'MALE',
      email: i === 0 ? defaultEmail : '',
      phone: i === 0 ? '+91 98401 23456' : '',
      passportNumber: '',
    }));
  });

  // Seat Selection State (e.g. '12A', '12B')
  const [selectedSeat, setSelectedSeat] = useState('14A (Window)');
  const [mealPreference, setMealPreference] = useState('Asian Vegetarian (AVML)');

  const handleFieldChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(passengers);
  };

  const outbound = offer.itineraries[0];
  const firstSeg = outbound.segments[0];
  const lastSeg = outbound.segments[outbound.segments.length - 1];

  // Aircraft seat matrix
  const seatRows = ['11', '12', '14', '15', '16'];
  const seatCols = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Flight Results
        </button>
        <span className="text-xs text-slate-400">Step 2 of 3: Passenger Information & Seat Selection</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Passenger Details Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {passengers.map((passenger, idx) => (
              <div
                key={passenger.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-xs font-bold text-sky-400">
                      {idx + 1}
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Traveler {idx + 1} ({idx === 0 ? 'Primary Passenger' : 'Adult'})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Standard Adult (12+ yrs)</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      First Name (as on Gov ID / Passport) *
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-sky-500">
                      <User className="mr-2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => handleFieldChange(idx, 'firstName', e.target.value)}
                        required
                        placeholder="e.g. Rahul"
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Last Name *
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-sky-500">
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => handleFieldChange(idx, 'lastName', e.target.value)}
                        required
                        placeholder="e.g. Sharma"
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Date of Birth *
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-sky-500">
                      <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleFieldChange(idx, 'dateOfBirth', e.target.value)}
                        required
                        className="w-full bg-transparent text-xs text-white outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Gender *
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-sky-500">
                      <select
                        value={passenger.gender}
                        onChange={(e) => handleFieldChange(idx, 'gender', e.target.value as any)}
                        className="w-full bg-transparent text-xs text-white outline-none"
                      >
                        <option value="FEMALE" className="bg-slate-900">Female</option>
                        <option value="MALE" className="bg-slate-900">Male</option>
                        <option value="OTHER" className="bg-slate-900">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Email Address (for E-Ticket & PNR) *
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-sky-500">
                      <Mail className="mr-2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) => handleFieldChange(idx, 'email', e.target.value)}
                        required={idx === 0}
                        placeholder="traveler@example.com"
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Mobile Number (for SMS & Flight Updates) *
                    </label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-sky-500">
                      <Phone className="mr-2 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) => handleFieldChange(idx, 'phone', e.target.value)}
                        required={idx === 0}
                        placeholder="+91 98765 43210"
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Interactive Airplane Seat Selection Matrix */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Armchair className="h-5 w-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Select Your Aircraft Seat</h3>
                </div>
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  Seat: {selectedSeat}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-3">
                  Aircraft: Airbus A321neo • 3-3 Configuration (A, B, C | D, E, F)
                </p>

                {/* Seat Matrix Visual */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2 mb-3 px-2">
                    <span>Window</span>
                    <span>Aisle</span>
                    <span>Aisle</span>
                    <span>Window</span>
                  </div>

                  <div className="space-y-2">
                    {seatRows.map((row) => (
                      <div key={row} className="flex items-center justify-between gap-1">
                        <span className="w-5 text-center font-mono text-[10px] text-slate-500">{row}</span>

                        {/* Left Side: A, B, C */}
                        <div className="flex items-center gap-1.5">
                          {['A', 'B', 'C'].map((col) => {
                            const seatId = `${row}${col}`;
                            const isSelected = selectedSeat.startsWith(seatId);
                            const isWindow = col === 'A';
                            return (
                              <button
                                key={seatId}
                                type="button"
                                onClick={() => setSelectedSeat(`${seatId} (${isWindow ? 'Window' : col === 'C' ? 'Aisle' : 'Middle'})`)}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all ${
                                  isSelected
                                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aircraft Aisle Walking Corridor */}
                        <div className="w-4 border-l border-r border-dashed border-slate-800 h-8" />

                        {/* Right Side: D, E, F */}
                        <div className="flex items-center gap-1.5">
                          {['D', 'E', 'F'].map((col) => {
                            const seatId = `${row}${col}`;
                            const isSelected = selectedSeat.startsWith(seatId);
                            const isWindow = col === 'F';
                            return (
                              <button
                                key={seatId}
                                type="button"
                                onClick={() => setSelectedSeat(`${seatId} (${isWindow ? 'Window' : col === 'D' ? 'Aisle' : 'Middle'})`)}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all ${
                                  isSelected
                                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* In-Flight Meal & Add-ons */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Utensils className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Special Meal & Dietary Preference</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  'Asian Vegetarian (AVML)',
                  'Standard Non-Vegetarian',
                  'Jain Special Meal (VJML)',
                  'Gluten Free Meal (GFML)',
                ].map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setMealPreference(meal)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold text-left transition-all ${
                      mealPreference === meal
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{meal}</span>
                    {mealPreference === meal && <Check className="h-4 w-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Encrypted PNR transmission directly to airline reservation system.</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-cyan-500 px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:opacity-95"
              >
                <CreditCard className="h-4 w-4" />
                Proceed to Payment
              </button>
            </div>
          </form>
        </div>

        {/* Right: Flight Summary Sticky Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
            <h4 className="border-b border-slate-800 pb-3 text-sm font-bold text-white flex items-center gap-2">
              <Plane className="h-4 w-4 text-sky-400" />
              Trip Summary
            </h4>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{offer.airlineName}</span>
                <span className="font-mono text-slate-400">{offer.flightNumber}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-950/70 p-3 text-xs">
                <div>
                  <div className="font-bold text-white">{firstSeg.departure.iataCode}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(firstSeg.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-400">
                  <div>{outbound.duration.replace('PT', '').toLowerCase()}</div>
                  <div className="h-0.5 w-12 bg-sky-500/50 my-1 mx-auto" />
                  <div>Direct</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{lastSeg.arrival.iataCode}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(lastSeg.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Seat</span>
                  <span className="text-sky-400 font-bold font-mono">{selectedSeat}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Meal</span>
                  <span className="text-slate-200">{mealPreference.split('(')[0]}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cabin Class</span>
                  <span className="text-slate-200">{offer.fareDetails.cabin}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Baggage</span>
                  <span className="text-slate-200">{offer.fareDetails.baggageAllowance.checkedBaggage}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Amount</span>
                  <span className="text-lg font-black text-white">
                    {offer.price.currency} {offer.price.total.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400">Includes all taxes and surcharges</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
