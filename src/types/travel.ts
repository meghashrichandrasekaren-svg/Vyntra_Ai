export interface AirportInfo {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  id: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  aircraftEquipment?: string;
  duration: string;
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
  rawOffer?: any;
}

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
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

export interface FlightStatusData {
  flightNumber: string;
  airline: string;
  aircraft: string;
  origin: {
    iata: string;
    city: string;
    terminal: string;
    gate: string;
    scheduled: string;
    actual?: string;
  };
  destination: {
    iata: string;
    city: string;
    terminal: string;
    gate: string;
    scheduled: string;
    estimated?: string;
  };
  status: 'ON TIME' | 'BOARDING' | 'EN ROUTE' | 'DELAYED' | 'LANDED';
  progressPercent: number;
  altitude: string;
  speed: string;
  baggageBelt: string;
}
