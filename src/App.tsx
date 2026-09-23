import React, { useState, useEffect } from 'react';
import {
  Plane,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  Radio,
  Luggage,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { FlightSearchForm } from './components/FlightSearchForm.tsx';
import { FlightCard } from './components/FlightCard.tsx';
import { FareDetailsModal } from './components/FareDetailsModal.tsx';
import { PassengerForm } from './components/PassengerForm.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { BookingConfirmation } from './components/BookingConfirmation.tsx';
import { MyTrips } from './components/MyTrips.tsx';
import { FlightStatusTracker } from './components/FlightStatusTracker.tsx';
import { AuraRingModal } from './components/AuraRingModal.tsx';
import { AIAssistantModal } from './components/AIAssistantModal.tsx';
import { ApiSettingsModal } from './components/ApiSettingsModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MobileRemoteView } from './components/MobileRemoteView.tsx';
import { useAuth } from './context/AuthContext.tsx';

import {
  FlightSearchCriteria,
  VyntraFlightOffer,
  BookingOrder,
  Passenger,
} from './types/travel.ts';

import {
  searchFlights,
  createBooking,
  fetchTrips,
  getConfigStatus,
} from './services/api.ts';

export default function App() {
  // Check if opened as Mobile Remote on physical smartphone
  const isMobileRemote = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mobileRemote') === 'true';
  if (isMobileRemote) {
    return <MobileRemoteView />;
  }

  const { user, loading: authLoading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);

  // Navigation tabs: 'search' | 'trips' | 'status'
  const [activeTab, setActiveTab] = useState<'search' | 'trips' | 'status'>('search');

  // Booking Flow Steps: 'SEARCH' | 'PASSENGER_FORM' | 'CONFIRMATION'
  const [bookingStep, setBookingStep] = useState<'SEARCH' | 'PASSENGER_FORM' | 'CONFIRMATION'>('SEARCH');

  // Data states
  const [searchCriteria, setSearchCriteria] = useState<FlightSearchCriteria | null>(null);
  const [flightOffers, setFlightOffers] = useState<VyntraFlightOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<VyntraFlightOffer | null>(null);
  const [trips, setTrips] = useState<BookingOrder[]>([]);
  const [activeBooking, setActiveBooking] = useState<BookingOrder | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'AMADEUS_LIVE' | 'SANDBOX_VERIFIED'>('SANDBOX_VERIFIED');
  const [searchNotification, setSearchNotification] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sorting and Filtering
  const [sortBy, setSortBy] = useState<'CHEAPEST' | 'FASTEST' | 'EARLIEST'>('CHEAPEST');
  const [nonStopOnly, setNonStopOnly] = useState(false);

  // Modals
  const [isFareModalOpen, setIsFareModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuraModalOpen, setIsAuraModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Config Status
  const [amadeusStatus, setAmadeusStatus] = useState<{
    configured: boolean;
    mode: string;
    connected?: boolean;
    message?: string;
  }>({
    configured: false,
    mode: 'SANDBOX_SIMULATION',
  });

  const [pendingPassengers, setPendingPassengers] = useState<Passenger[]>([]);

  // Load trips and connection status on mount
  useEffect(() => {
    loadTrips();
    checkAmadeusConnection();
    // Default initial search
    handleSearch({
      origin: 'MAA',
      destination: 'DEL',
      departureDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      passengers: 1,
      cabinClass: 'ECONOMY',
    });
  }, []);

  const loadTrips = async () => {
    const list = await fetchTrips();
    setTrips(list);
  };

  const checkAmadeusConnection = async () => {
    const status = await getConfigStatus();
    setAmadeusStatus(status);
  };

  const handleSearch = async (criteria: FlightSearchCriteria) => {
    setSearchCriteria(criteria);
    setIsLoading(true);
    setSearchError(null);
    setBookingStep('SEARCH');
    setActiveTab('search');

    try {
      const result = await searchFlights(criteria);
      setFlightOffers(result.offers);
      setSearchSource(result.source);
      setSearchNotification(result.message || null);
    } catch (err: any) {
      setSearchError(err.message || 'Flight search failed. Please check origin and destination.');
      setFlightOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort and filter offers
  const sortedOffers = [...flightOffers]
    .filter((offer) => {
      if (nonStopOnly) {
        return offer.itineraries[0].segments.length === 1;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'CHEAPEST') return a.price.total - b.price.total;
      if (sortBy === 'EARLIEST') {
        const timeA = new Date(a.itineraries[0].segments[0].departure.at).getTime();
        const timeB = new Date(b.itineraries[0].segments[0].departure.at).getTime();
        return timeA - timeB;
      }
      return 0;
    });

  // Flow handlers
  const handleSelectOffer = (offer: VyntraFlightOffer) => {
    setSelectedOffer(offer);
    setBookingStep('PASSENGER_FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePassengersSubmit = (passengers: Passenger[]) => {
    setPendingPassengers(passengers);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentData: {
    method: string;
    amount: number;
    transactionId: string;
  }) => {
    setIsPaymentModalOpen(false);
    if (!selectedOffer) return;

    try {
      const newBooking = await createBooking(selectedOffer, pendingPassengers, paymentData);
      setActiveBooking(newBooking);
      setBookingStep('CONFIRMATION');
      await loadTrips();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Booking creation error: ${err.message}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400">Loading VYNTRA...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated and hasn't chosen guest mode, show Google Login entrance
  if (!user && !guestMode) {
    return <LoginScreen onContinueAsGuest={() => setGuestMode(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-sky-600/10 blur-[130px]" />
        <div className="absolute top-[20%] right-[-5%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'search' && bookingStep === 'CONFIRMATION') {
              setBookingStep('SEARCH');
            }
          }}
          openAuraModal={() => setIsAuraModalOpen(true)}
          openAiModal={() => setIsAiModalOpen(true)}
          openSettingsModal={() => setIsSettingsModalOpen(true)}
          isAmadeusConnected={amadeusStatus.mode === 'AMADEUS_LIVE_TEST'}
          tripCount={trips.length}
        />

        {/* Main Content Viewport */}
        <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6">
          {/* TAB 1: FLIGHT SEARCH & BOOKING */}
          {activeTab === 'search' && (
            <div className="space-y-8">
              {/* STEP 1: Search Form & Results */}
              {bookingStep === 'SEARCH' && (
                <>
                  {/* Hero Headline */}
                  <div className="text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>End-to-End Live Flight Distribution Engine</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                      Book Flights with <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Instant GDS Pricing</span>
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      Real-time flight search powered by Amadeus Self-Service API, tokenized PNR creation, and seamless AURA Ring credential integration.
                    </p>
                  </div>

                  {/* Flight Search Input Box */}
                  <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} />

                  {/* Search Notification Banner */}
                  {searchNotification && (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-3.5 text-xs text-emerald-300">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{searchNotification}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>GDS CONNECTED</span>
                      </div>
                    </div>
                  )}

                  {/* Error Notification */}
                  {searchError && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-xs text-red-300">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{searchError}</span>
                    </div>
                  )}

                  {/* Search Results Filter & List */}
                  {flightOffers.length > 0 && (
                    <div className="space-y-4">
                      {/* Filter & Sort Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-bold text-white">{sortedOffers.length} Flights Available</span>
                          <span>•</span>
                          <span>
                            {searchCriteria?.origin} ➔ {searchCriteria?.destination}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Non-stop filter */}
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={nonStopOnly}
                              onChange={(e) => setNonStopOnly(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                            />
                            <span>Direct Flights Only</span>
                          </label>

                          {/* Sort selector */}
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs">
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as any)}
                              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
                            >
                              <option value="CHEAPEST" className="bg-slate-900">Cheapest First</option>
                              <option value="EARLIEST" className="bg-slate-900">Earliest Departure</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Flight Cards Grid */}
                      <div className="space-y-4">
                        {sortedOffers.map((offer) => (
                          <FlightCard
                            key={offer.id}
                            offer={offer}
                            onSelect={handleSelectOffer}
                            onViewDetails={(off) => {
                              setSelectedOffer(off);
                              setIsFareModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: Passenger Information Form */}
              {bookingStep === 'PASSENGER_FORM' && selectedOffer && (
                <PassengerForm
                  offer={selectedOffer}
                  passengerCount={searchCriteria?.passengers || 1}
                  onBack={() => setBookingStep('SEARCH')}
                  onSubmit={handlePassengersSubmit}
                />
              )}

              {/* STEP 3: Booking Confirmation & Boarding Pass */}
              {bookingStep === 'CONFIRMATION' && activeBooking && (
                <BookingConfirmation
                  booking={activeBooking}
                  onViewTrips={() => setActiveTab('trips')}
                  onBookAnother={() => setBookingStep('SEARCH')}
                  openAuraModal={() => setIsAuraModalOpen(true)}
                />
              )}
            </div>
          )}

          {/* TAB 2: MY TRIPS */}
          {activeTab === 'trips' && (
            <MyTrips
              trips={trips}
              onSelectBooking={(b) => {
                setActiveBooking(b);
                setBookingStep('CONFIRMATION');
                setActiveTab('search');
              }}
              onBookFlight={() => {
                setActiveTab('search');
                setBookingStep('SEARCH');
              }}
              openAuraModal={() => setIsAuraModalOpen(true)}
            />
          )}

          {/* TAB 3: FLIGHT STATUS RADAR */}
          {activeTab === 'status' && <FlightStatusTracker />}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">VYNTRA</span>
              <span>— Intelligent Travel Platform</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Amadeus GDS NDC Distribution</span>
              <span>•</span>
              <span>AURA Ring Credential Interface</span>
              <span>•</span>
              <span>ISO 8601 Airline Standards</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {/* Fare Details Modal */}
      {isFareModalOpen && selectedOffer && (
        <FareDetailsModal
          offer={selectedOffer}
          onClose={() => setIsFareModalOpen(false)}
          onSelectOffer={handleSelectOffer}
        />
      )}

      {/* Sandbox Payment Modal */}
      {isPaymentModalOpen && selectedOffer && (
        <PaymentModal
          offer={selectedOffer}
          passengers={pendingPassengers}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* AURA Ring Modal */}
      {isAuraModalOpen && (
        <AuraRingModal
          pnr={activeBooking?.pnr || trips[0]?.pnr || 'VY7K9M'}
          booking={activeBooking || trips[0]}
          onClose={() => setIsAuraModalOpen(false)}
        />
      )}

      {/* Okay Vyntra AI Assistant Modal */}
      {isAiModalOpen && (
        <AIAssistantModal onClose={() => setIsAiModalOpen(false)} trips={trips} />
      )}

      {/* API Settings Modal */}
      {isSettingsModalOpen && (
        <ApiSettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onConfigUpdated={async () => {
            await checkAmadeusConnection();
            if (searchCriteria) {
              handleSearch(searchCriteria);
            }
          }}
          isConfigured={amadeusStatus.configured}
          activeMode={amadeusStatus.mode}
        />
      )}
    </div>
  );
}
