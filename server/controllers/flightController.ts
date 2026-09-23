import { Router, Request, Response } from 'express';
import { flightService } from '../services/flightService.js';
import { amadeusClient } from '../clients/amadeusClient.js';
import { FlightSearchCriteria } from '../types/flight.js';

export const flightRouter = Router();

/**
 * GET /api/flights/search
 * Search flight offers
 */
flightRouter.get('/flights/search', async (req: Request, res: Response) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
    } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: 'Missing required search criteria: origin, destination, and departureDate are required.',
      });
    }

    const criteria: FlightSearchCriteria = {
      origin: String(origin),
      destination: String(destination),
      departureDate: String(departureDate),
      returnDate: returnDate ? String(returnDate) : undefined,
      passengers: passengers ? parseInt(String(passengers), 10) : 1,
      cabinClass: cabinClass as any,
    };

    const result = await flightService.searchFlights(criteria);
    return res.json({
      success: true,
      data: result.offers,
      source: result.source,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Search flights controller error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Flight search failed',
    });
  }
});

/**
 * POST /api/flights/price
 * Verify price & availability
 */
flightRouter.post('/flights/price', async (req: Request, res: Response) => {
  try {
    const { offerId, rawOffer } = req.body;
    if (!offerId) {
      return res.status(400).json({ error: 'Missing offerId' });
    }

    const priced = await flightService.priceOffer(offerId, rawOffer);
    return res.json({ success: true, ...priced });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/flights/book
 * Book flight and create PNR
 */
flightRouter.post('/flights/book', async (req: Request, res: Response) => {
  try {
    const { flightOffer, passengers, paymentDetails } = req.body;

    if (!flightOffer || !passengers || !passengers.length || !paymentDetails) {
      return res.status(400).json({
        error: 'Incomplete booking payload: flightOffer, passengers, and paymentDetails are required.',
      });
    }

    const order = await flightService.createBooking(flightOffer, passengers, paymentDetails);
    return res.status(201).json({
      success: true,
      booking: order,
      pnr: order.pnr,
    });
  } catch (err: any) {
    console.error('Booking controller error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/airports
 * Autocomplete airports and IATA codes
 */
flightRouter.get('/airports', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '');
    const airports = await flightService.searchAirports(query);
    return res.json({ success: true, data: airports });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/trips
 * Get list of booked trips
 */
flightRouter.get('/trips', (_req: Request, res: Response) => {
  const trips = flightService.getAllBookings();
  return res.json({ success: true, data: trips });
});

/**
 * GET /api/trips/:id
 * Get single trip details
 */
flightRouter.get('/trips/:id', (req: Request, res: Response) => {
  const trip = flightService.getBookingByPnrOrId(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }
  return res.json({ success: true, data: trip });
});

/**
 * POST /api/trips/:id/aura-sync
 * Sync booking with AURA Ring credential
 */
flightRouter.post('/trips/:id/aura-sync', (req: Request, res: Response) => {
  const synced = flightService.syncAuraRingCredential(req.params.id, true);
  return res.json({ success: synced });
});

/**
 * POST /api/aura/proximity-unlock
 * Auto-unlock Airport Lounge or Flight Boarding Gate based on BLE proximity
 */
flightRouter.post('/aura/proximity-unlock', (req: Request, res: Response) => {
  try {
    const { ringId, pnr, gateType, distanceMeters, phone, bluetoothActive } = req.body;
    const distance = typeof distanceMeters === 'number' ? distanceMeters : 0.5;

    const accessResult = flightService.validateGateAccess(
      String(ringId || 'AURA-TITANIUM-098X'),
      String(pnr || ''),
      (gateType as any) || 'BOARDING_GATE',
      distance,
      phone ? String(phone) : undefined,
      typeof bluetoothActive === 'boolean' ? bluetoothActive : true
    );

    return res.json({ success: true, data: accessResult });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/aura/mobile-beacon
 * Live beacon broadcast from passenger's real phone
 */
flightRouter.post('/aura/mobile-beacon', (req: Request, res: Response) => {
  try {
    const { pnr, phone, bluetoothActive, distance } = req.body;
    if (!pnr) {
      return res.status(400).json({ error: 'PNR is required' });
    }

    const updated = flightService.updateMobileBeacon(
      String(pnr),
      String(phone || ''),
      Boolean(bluetoothActive),
      typeof distance === 'number' ? distance : 0.6
    );

    // Also run gate validation
    const validation = flightService.validateGateAccess(
      'AURA-MOBILE-KEY',
      String(pnr),
      'BOARDING_GATE',
      updated.distance,
      updated.phone,
      updated.bluetoothActive
    );

    return res.json({ success: true, beacon: updated, gateAccess: validation });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/aura/mobile-beacon
 * Polled by gate terminal to detect passenger's real phone
 */
flightRouter.get('/aura/mobile-beacon', (req: Request, res: Response) => {
  const pnr = String(req.query.pnr || 'VY7K9M');
  const beacon = flightService.getMobileBeacon(pnr);
  if (!beacon) {
    return res.json({ active: false });
  }

  const gateAccess = flightService.validateGateAccess(
    'AURA-MOBILE-KEY',
    pnr,
    'BOARDING_GATE',
    beacon.distance,
    beacon.phone,
    beacon.bluetoothActive
  );

  return res.json({ active: true, beacon, gateAccess });
});

/**
 * GET /api/flight-status
 * Real-time status lookup
 */
flightRouter.get('/flight-status', (req: Request, res: Response) => {
  const query = String(req.query.flightNumber || req.query.route || '6E 521');
  const date = req.query.date ? String(req.query.date) : undefined;
  const status = flightService.getFlightStatus(query, date);
  return res.json({ success: true, data: status });
});

/**
 * GET /api/config/status
 * Check Amadeus connection status
 */
flightRouter.get('/config/status', async (_req: Request, res: Response) => {
  const hasCreds = amadeusClient.hasCredentials();
  if (!hasCreds) {
    return res.json({
      configured: false,
      mode: 'SANDBOX_SIMULATION',
      message: 'Amadeus API credentials not set. Sandbox verified schedules active.',
    });
  }

  const testResult = await amadeusClient.testConnection();
  return res.json({
    configured: true,
    mode: testResult.success ? 'AMADEUS_LIVE_TEST' : 'SANDBOX_FALLBACK',
    connected: testResult.success,
    message: testResult.message,
  });
});

/**
 * POST /api/config/amadeus
 * Save or update Amadeus API keys at runtime
 */
flightRouter.post('/config/amadeus', async (req: Request, res: Response) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'clientId and clientSecret are required.' });
  }

  amadeusClient.updateCredentials(clientId, clientSecret);
  const test = await amadeusClient.testConnection();

  return res.json({
    success: test.success,
    message: test.message,
  });
});
