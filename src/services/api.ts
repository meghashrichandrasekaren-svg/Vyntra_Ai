import {
  FlightSearchCriteria,
  VyntraFlightOffer,
  BookingOrder,
  Passenger,
  AirportInfo,
  FlightStatusData,
} from '../types/travel.ts';

const API_BASE = '/api';

export async function searchFlights(criteria: FlightSearchCriteria): Promise<{
  offers: VyntraFlightOffer[];
  source: 'AMADEUS_LIVE' | 'SANDBOX_VERIFIED';
  message?: string;
}> {
  const params = new URLSearchParams();
  params.set('origin', criteria.origin);
  params.set('destination', criteria.destination);
  params.set('departureDate', criteria.departureDate);
  if (criteria.returnDate) {
    params.set('returnDate', criteria.returnDate);
  }
  params.set('passengers', String(criteria.passengers));
  params.set('cabinClass', criteria.cabinClass);

  const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Flight search failed with status ${res.status}`);
  }

  const result = await res.json();
  return {
    offers: result.data || [],
    source: result.source || 'SANDBOX_VERIFIED',
    message: result.message,
  };
}

export async function priceFlightOffer(offerId: string, rawOffer?: any): Promise<any> {
  const res = await fetch(`${API_BASE}/flights/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, rawOffer }),
  });
  if (!res.ok) {
    throw new Error('Price confirmation failed');
  }
  return await res.json();
}

export async function createBooking(
  flightOffer: VyntraFlightOffer,
  passengers: Passenger[],
  paymentDetails: { method: string; amount: number; transactionId?: string }
): Promise<BookingOrder> {
  const res = await fetch(`${API_BASE}/flights/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightOffer, passengers, paymentDetails }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Booking creation failed');
  }

  const data = await res.json();
  return data.booking;
}

export async function searchAirports(query: string): Promise<AirportInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/airports?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (_) {
    return [];
  }
}

export async function fetchTrips(): Promise<BookingOrder[]> {
  const res = await fetch(`${API_BASE}/trips`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function syncAuraRing(bookingId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/trips/${bookingId}/aura-sync`, {
    method: 'POST',
  });
  return res.ok;
}

export async function verifyAuraGateAccess(
  gateType: 'LOUNGE' | 'BOARDING_GATE',
  distanceMeters: number,
  pnr?: string,
  ringId?: string,
  phone?: string,
  bluetoothActive?: boolean
): Promise<{
  authorized: boolean;
  gateOpen: boolean;
  passengerName: string;
  flightNumber: string;
  gateName: string;
  accessType: string;
  message: string;
  securityAlert?: boolean;
  timestamp: string;
}> {
  const res = await fetch(`${API_BASE}/aura/proximity-unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gateType,
      distanceMeters,
      pnr,
      ringId,
      phone,
      bluetoothActive: typeof bluetoothActive === 'boolean' ? bluetoothActive : true,
    }),
  });
  const data = await res.json();
  return data.data;
}

export async function broadcastMobileBeacon(
  pnr: string,
  phone: string,
  bluetoothActive: boolean,
  distance: number = 0.6
): Promise<any> {
  const res = await fetch(`${API_BASE}/aura/mobile-beacon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr, phone, bluetoothActive, distance }),
  });
  return await res.json();
}

export async function pollMobileBeacon(pnr: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/aura/mobile-beacon?pnr=${encodeURIComponent(pnr)}`);
    if (!res.ok) return { active: false };
    return await res.json();
  } catch (_) {
    return { active: false };
  }
}

export async function fetchFlightStatus(flightNumberOrRoute: string, date?: string): Promise<FlightStatusData> {
  const params = new URLSearchParams();
  params.set('flightNumber', flightNumberOrRoute);
  if (date) params.set('date', date);

  const res = await fetch(`${API_BASE}/flight-status?${params.toString()}`);
  if (!res.ok) throw new Error('Status lookup failed');
  const data = await res.json();
  return data.data;
}

export async function getConfigStatus(): Promise<{
  configured: boolean;
  mode: string;
  connected?: boolean;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/config/status`);
    if (!res.ok) return { configured: false, mode: 'SANDBOX_SIMULATION' };
    return await res.json();
  } catch (_) {
    return { configured: false, mode: 'SANDBOX_SIMULATION' };
  }
}

export async function updateAmadeusConfig(clientId: string, clientSecret: string): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/config/amadeus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  return await res.json();
}
