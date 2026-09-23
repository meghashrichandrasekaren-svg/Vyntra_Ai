export interface FlightSearchCriteria {
  origin: string; // 3-letter IATA code, e.g. MAA
  destination: string; // 3-letter IATA code, e.g. DEL
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD for round-trip
  passengers: number;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  maxOffers?: number;
}

export interface FlightSegment {
  id: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  aircraftEquipment?: string;
  duration: string; // e.g. PT2H30M
  cabin: string;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface VyntraFlightOffer {
  id: string;
  source: 'AMADEUS_LIVE' | 'SANDBOX_VERIFIED';
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  itineraries: FlightItinerary[];
  numberOfBookableSeats: number;
  price: {
    currency: string;
    total: number;
    base: number;
    taxes: number;
    perPassenger: number;
  };
  fareDetails: {
    cabin: string;
    fareClass: string;
    refundable: boolean;
    baggageAllowance: {
      cabinBaggage: string;
      checkedBaggage: string;
    };
    amenities: string[];
  };
  rawOffer?: any; // Preserved for Amadeus pricing confirmation
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email: string;
  phone: string;
  passportNumber?: string;
}

export interface BookingOrder {
  bookingId: string;
  pnr: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  flightOffer: VyntraFlightOffer;
  passengers: Passenger[];
  payment: {
    transactionId: string;
    method: string;
    status: 'SUCCESS' | 'FAILED';
    amount: number;
    currency: string;
    paidAt: string;
  };
  createdAt: string;
  auraCredentialSynced?: boolean;
}

export interface AirportInfo {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}
