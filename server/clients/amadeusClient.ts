import { FlightSearchCriteria } from '../types/flight.js';

interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class AmadeusClient {
  private baseUrl = 'https://test.api.amadeus.com';
  private clientId: string;
  private clientSecret: string;
  private cachedToken: string | null = null;
  private tokenExpiryTime: number = 0;

  constructor(clientId?: string, clientSecret?: string) {
    this.clientId = clientId || process.env.AMADEUS_CLIENT_ID || '';
    this.clientSecret = clientSecret || process.env.AMADEUS_CLIENT_SECRET || '';
  }

  public updateCredentials(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.cachedToken = null;
    this.tokenExpiryTime = 0;
  }

  public hasCredentials(): boolean {
    return Boolean(this.clientId.trim() && this.clientSecret.trim());
  }

  /**
   * Acquire or reuse cached OAuth2 Bearer token from Amadeus
   */
  private async getAccessToken(): Promise<string> {
    if (!this.hasCredentials()) {
      throw new Error('Amadeus API credentials not configured. Provide AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET.');
    }

    const now = Date.now();
    // Use cached token if still valid for at least 30 seconds
    if (this.cachedToken && this.tokenExpiryTime > now + 30000) {
      return this.cachedToken;
    }

    const tokenUrl = `${this.baseUrl}/v1/security/oauth2/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.clientId.trim());
    params.append('client_secret', this.clientSecret.trim());

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Amadeus Auth Failed (${response.status}): ${response.statusText}`;
      try {
        const errJson = JSON.parse(errorText);
        errorMsg = errJson.error_description || errJson.title || errorMsg;
      } catch (_) {
        // fallback
      }
      throw new Error(errorMsg);
    }

    const data = (await response.json()) as AmadeusTokenResponse;
    this.cachedToken = data.access_token;
    this.tokenExpiryTime = now + (data.expires_in * 1000);
    return this.cachedToken;
  }

  /**
   * Test Amadeus connection with currently configured keys
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getAccessToken();
      return { success: true, message: 'Successfully connected to Amadeus Test API via OAuth2!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  }

  /**
   * Search Flight Offers using Amadeus /v2/shopping/flight-offers
   */
  public async searchFlightOffers(criteria: FlightSearchCriteria): Promise<any> {
    const token = await this.getAccessToken();

    const url = new URL(`${this.baseUrl}/v2/shopping/flight-offers`);
    url.searchParams.set('originLocationCode', criteria.origin.toUpperCase());
    url.searchParams.set('destinationLocationCode', criteria.destination.toUpperCase());
    url.searchParams.set('departureDate', criteria.departureDate);
    if (criteria.returnDate) {
      url.searchParams.set('returnDate', criteria.returnDate);
    }
    url.searchParams.set('adults', String(criteria.passengers || 1));
    if (criteria.cabinClass) {
      url.searchParams.set('travelClass', criteria.cabinClass);
    }
    url.searchParams.set('currencyCode', 'INR');
    url.searchParams.set('max', String(criteria.maxOffers || 15));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let detailedMsg = `Amadeus search error: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.errors && parsed.errors.length > 0) {
          detailedMsg = parsed.errors.map((e: any) => `${e.title}: ${e.detail}`).join(', ');
        }
      } catch (_) {
        // fallback
      }
      throw new Error(detailedMsg);
    }

    return await response.json();
  }

  /**
   * Price/Confirm Flight Offer using Amadeus /v1/shopping/flight-offers/pricing
   */
  public async priceFlightOffer(rawOffer: any): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/v1/shopping/flight-offers/pricing`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [rawOffer],
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Amadeus pricing check error: ${errorBody}`);
    }

    return await response.json();
  }

  /**
   * Search airports / locations from Amadeus Reference Data
   */
  public async searchLocations(keyword: string): Promise<any> {
    if (!this.hasCredentials()) {
      return null;
    }
    const token = await this.getAccessToken();
    const url = new URL(`${this.baseUrl}/v1/reference-data/locations`);
    url.searchParams.set('subType', 'AIRPORT,CITY');
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('page[limit]', '8');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }
}

export const amadeusClient = new AmadeusClient();
