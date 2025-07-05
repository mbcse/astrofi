import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Add this at the top of the file, outside the class
function formatTimezoneOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export interface BirthDetails {
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm:ss
  latitude: number;
  longitude: number;
  timezone: number; // e.g. +5.5
}

export interface Planet {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  is_retro: boolean;
  sign: string;
  sign_longitude: number;
  house: number;
  nakshatra: string;
  nakshatra_longitude: number;
}

export interface House {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  sign: string;
  sign_longitude: number;
}

export interface Nakshatra {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  pada: number;
  ruler: string;
}

export interface Upagraha {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  sign: string;
  sign_longitude: number;
}

export interface AstroChartData {
  planets: Planet[];
  houses: House[];
  ascendant: string;
  nakshatra: Nakshatra;
  upagrahas?: Upagraha[];
  birthDetails: BirthDetails;
  generatedAt: string;
}

export class ProkeralaService {
  private accessToken: string;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private authUrl: string;
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.accessToken = process.env.PROKERALA_ACCESS_TOKEN || '';
    this.baseUrl = process.env.PROKERALA_API_BASE || 'https://api.prokerala.com/v2/astrology';
    this.clientId = process.env.PROKERALA_CLIENT_ID || '';
    this.clientSecret = process.env.PROKERALA_CLIENT_SECRET || '';
    this.authUrl = 'https://api.prokerala.com/token';

    if (!this.accessToken && (!this.clientId || !this.clientSecret)) {
      throw new Error('Either PROKERALA_ACCESS_TOKEN or PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET are required.');
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Client credentials not available for token refresh');
    }

    try {
      console.log('Refreshing Prokerala access token...');
      const response = await axios.post(this.authUrl, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        console.log('Successfully refreshed access token');
        return this.accessToken;
      } else {
        throw new Error('No access token received from OAuth server');
      }
    } catch (error) {
      console.error('Failed to refresh OAuth access token:', error);
      throw new Error(`OAuth token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Create cache key from endpoint and params
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log('Prokerala API cache hit for:', endpoint);
      return cached.data;
    }
    
    try {
      console.log('Making Prokerala API request:', { url, params });
      
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Prokerala API HTTP status:', response.status);
      console.log('Prokerala API response headers:', response.headers);
      console.log('Prokerala API full response data:', JSON.stringify(response.data, null, 2));

      // Check if the HTTP request was successful
      if (response.status !== 200) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Check if response has data
      if (!response.data) {
        throw new Error('API Error: No data returned from API');
      }

      // Check for API-level errors
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessage = response.data.errors[0].detail || response.data.errors[0].message || 'API returned errors';
        throw new Error(`API Error: ${errorMessage}`);
      }

      // Check for success status (some APIs use different status fields)
      if (response.data.status && response.data.status !== 'success' && response.data.status !== 'ok') {
        throw new Error(`API Error: ${response.data.message || response.data.status || 'API returned non-success status'}`);
      }

      // Cache the successful response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Prokerala API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          params: error.config?.params
        });
        
        // Log the specific error details
        if (error.response?.data?.errors) {
          console.error('Prokerala API Error Details:', JSON.stringify(error.response.data.errors, null, 2));
        }
        
        // If we get a 401 Unauthorized error, try to refresh the token
        if (error.response?.status === 401 && this.clientId && this.clientSecret) {
          console.log('Token expired, attempting to refresh...');
          try {
            await this.refreshAccessToken();
            console.log('Token refreshed successfully, retrying request...');
            
            // Retry the request with the new token
            const retryResponse = await axios.get(url, {
              params,
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            });
            
            console.log('Retry HTTP status:', retryResponse.status);
            console.log('Retry response data:', JSON.stringify(retryResponse.data, null, 2));
            
            // Apply the same validation logic as the main request
            if (retryResponse.status !== 200) {
              throw new Error(`HTTP Error: ${retryResponse.status} - ${retryResponse.statusText}`);
            }

            if (!retryResponse.data) {
              throw new Error('API Error: No data returned from API');
            }

            if (retryResponse.data.errors && retryResponse.data.errors.length > 0) {
              const errorMessage = retryResponse.data.errors[0].detail || retryResponse.data.errors[0].message || 'API returned errors';
              throw new Error(`API Error: ${errorMessage}`);
            }

            if (retryResponse.data.status && retryResponse.data.status !== 'success' && retryResponse.data.status !== 'ok') {
              throw new Error(`API Error: ${retryResponse.data.message || retryResponse.data.status || 'API returned non-success status'}`);
            }

            // Cache the successful retry response
            this.cache.set(cacheKey, {
              data: retryResponse.data,
              timestamp: Date.now()
            });

            return retryResponse.data;
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            throw new Error(`Token refresh failed: ${refreshError instanceof Error ? refreshError.message : 'Unknown error'}`);
          }
        }
        
        throw new Error(`API request failed: ${error.response?.data?.message || error.message}`);
      }
      
      throw error;
    }
  }

  async getFullChartData(details: BirthDetails): Promise<AstroChartData> {
    // Ensure time has seconds
    const timeWithSeconds = details.time.length === 5 ? `${details.time}:00` : details.time;
    const timezoneString = formatTimezoneOffset(details.timezone);
    const datetime = `${details.date}T${timeWithSeconds}${timezoneString}`;
    
    const params = {
      ayanamsa: '1', // Lahiri ayanamsa
      coordinates: `${details.latitude},${details.longitude}`,
      datetime: datetime,
    };

    try {
      // Get Planetary Positions
      const planetResponse = await this.makeRequest('/planet-position', params);
      const planetPositions = planetResponse.data?.planet_position || [];
      
      // Transform planet data to match our interface
      const planets: Planet[] = planetPositions.map((planet: any) => ({
        id: planet.id,
        name: planet.name,
        longitude: planet.longitude,
        latitude: 0, // Not provided by Prokerala
        speed: 0, // Not provided by Prokerala
        is_retro: planet.is_retrograde,
        sign: planet.rasi?.name || '',
        sign_longitude: planet.degree || 0,
        house: planet.position || 0,
        nakshatra: '', // Will get from birth-star endpoint
        nakshatra_longitude: 0
      }));

      // Get House Positions (houses are included in planet-position as Ascendant)
      const houses: House[] = [];
      const ascendant = planetPositions.find((p: any) => p.name === 'Ascendant')?.rasi?.name || 'Unknown';

      // Get Birth Star / Nakshatra using birth-details endpoint
      const birthDetailsResponse = await this.makeRequest('/birth-details', params);
      const nakshatraData = birthDetailsResponse.data?.nakshatra || {};
      const nakshatra: Nakshatra = {
        id: nakshatraData.id || 0,
        name: nakshatraData.name || '',
        longitude: 0, // Not provided by Prokerala
        latitude: 0, // Not provided by Prokerala
        pada: nakshatraData.pada || 0,
        ruler: nakshatraData.lord?.name || ''
      };

      // Upagraha endpoints are not available in this API version
      // We'll skip upagrahas for now
      let upagrahas: Upagraha[] = [];

      return {
        planets,
        houses,
        ascendant,
        nakshatra,
        upagrahas,
        birthDetails: details,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to fetch astrology data:', error);
      throw new Error(`Could not fetch chart data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlanetaryPositions(details: BirthDetails): Promise<Planet[]> {
    const timeWithSeconds = details.time.length === 5 ? `${details.time}:00` : details.time;
    const timezoneString = formatTimezoneOffset(details.timezone);
    const datetime = `${details.date}T${timeWithSeconds}${timezoneString}`;
    
    const params = {
      ayanamsa: '1',
      coordinates: `${details.latitude},${details.longitude}`,
      datetime: datetime,
    };

    const response = await this.makeRequest('/planet-position', params);
    const planetPositions = response.data?.planet_position || [];
    
    // Transform planet data to match our interface
    return planetPositions.map((planet: any) => ({
      id: planet.id,
      name: planet.name,
      longitude: planet.longitude,
      latitude: 0, // Not provided by Prokerala
      speed: 0, // Not provided by Prokerala
      is_retro: planet.is_retrograde,
      sign: planet.rasi?.name || '',
      sign_longitude: planet.degree || 0,
      house: planet.position || 0,
      nakshatra: '', // Will get from birth-star endpoint
      nakshatra_longitude: 0
    }));
  }

  async getHousePositions(details: BirthDetails): Promise<{ houses: House[], ascendant: string }> {
    const timeWithSeconds = details.time.length === 5 ? `${details.time}:00` : details.time;
    const timezoneString = formatTimezoneOffset(details.timezone);
    const datetime = `${details.date}T${timeWithSeconds}${timezoneString}`;
    
    const params = {
      ayanamsa: '1',
      coordinates: `${details.latitude},${details.longitude}`,
      datetime: datetime,
    };

    const response = await this.makeRequest('/planet-position', params);
    const planetPositions = response.data?.planet_position || [];
    
    // Houses are not directly provided by Prokerala, but Ascendant is included in planet positions
    const houses: House[] = [];
    const ascendant = planetPositions.find((p: any) => p.name === 'Ascendant')?.rasi?.name || 'Unknown';
    
    return {
      houses,
      ascendant
    };
  }

  async getBirthStar(details: BirthDetails): Promise<Nakshatra> {
    const timeWithSeconds = details.time.length === 5 ? `${details.time}:00` : details.time;
    const timezoneString = formatTimezoneOffset(details.timezone);
    const datetime = `${details.date}T${timeWithSeconds}${timezoneString}`;
    
    const params = {
      ayanamsa: '1',
      coordinates: `${details.latitude},${details.longitude}`,
      datetime: datetime,
    };

    const response = await this.makeRequest('/birth-details', params);
    const nakshatraData = response.data?.nakshatra || {};
    
    return {
      id: nakshatraData.id || 0,
      name: nakshatraData.name || '',
      longitude: 0, // Not provided by Prokerala
      latitude: 0, // Not provided by Prokerala
      pada: nakshatraData.pada || 0,
      ruler: nakshatraData.lord?.name || ''
    };
  }

  async getCompatibility(kundli1: BirthDetails, kundli2: BirthDetails): Promise<any> {
    const timeWithSeconds1 = kundli1.time.length === 5 ? `${kundli1.time}:00` : kundli1.time;
    const timezoneString1 = formatTimezoneOffset(kundli1.timezone);
    const datetime1 = `${kundli1.date}T${timeWithSeconds1}${timezoneString1}`;
    const timeWithSeconds2 = kundli2.time.length === 5 ? `${kundli2.time}:00` : kundli2.time;
    const timezoneString2 = formatTimezoneOffset(kundli2.timezone);
    const datetime2 = `${kundli2.date}T${timeWithSeconds2}${timezoneString2}`;
    
    const params = {
      ayanamsa: '1',
      coordinates1: `${kundli1.latitude},${kundli1.longitude}`,
      datetime1: datetime1,
      coordinates2: `${kundli2.latitude},${kundli2.longitude}`,
      datetime2: datetime2,
    };

    const response = await this.makeRequest('/kundli-matching', params);
    return response.data || {};
  }

  async getDailyHoroscope(sign: string, date?: string | undefined): Promise<any> {
    const params: Record<string, string> = {
      sign: sign.toLowerCase()
    };

    if (date) {
      params.date = date;
    }

    const response = await this.makeRequest('/daily-horoscope', params);
    return response.data || {};
  }

  async getPanchang(date: string, latitude: number, longitude: number, timezone: number): Promise<any> {
    const timezoneString = formatTimezoneOffset(timezone);
    const datetime = `${date}T00:00:00${timezoneString}`;
    
    const params = {
      ayanamsa: '1',
      coordinates: `${latitude},${longitude}`,
      datetime: datetime,
    };

    const response = await this.makeRequest('/panchang', params);
    return response.data || {};
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Prokerala service cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.entries()).filter(([_, cached]) => 
      (now - cached.timestamp) < this.CACHE_TTL
    );
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      cacheKeys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    const expiredKeys = Array.from(this.cache.entries())
      .filter(([_, cached]) => (now - cached.timestamp) >= this.CACHE_TTL)
      .map(([key, _]) => key);
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }
}

// Export singleton instance
export const prokeralaService = new ProkeralaService(); 