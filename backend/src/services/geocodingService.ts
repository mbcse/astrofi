export interface GeocodingResult {
  latitude: number
  longitude: number
  formattedAddress: string
  country: string
  state?: string
  city?: string
}

export class GeocodingService {
  private apiKey: string | null = null
  private cache = new Map<string, GeocodingResult>()
  private lastRequestTime = 0
  private readonly RATE_LIMIT_DELAY = 1000 // 1 second between requests
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY || null
  }

  /**
   * Geocode a place name to get coordinates
   * Uses OpenStreetMap Nominatim API (free, no API key required)
   * Includes caching and rate limiting
   */
  async geocodePlace(placeName: string): Promise<GeocodingResult | null> {
    try {
      // Check cache first
      const cacheKey = placeName.toLowerCase().trim()
      const cachedResult = this.cache.get(cacheKey)
      if (cachedResult) {
        console.log('Geocoding cache hit for:', placeName)
        return cachedResult
      }

      // Rate limiting
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest))
      }
      this.lastRequestTime = Date.now()

      // Use OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`,
        {
          headers: {
            'User-Agent': 'AstroFi/1.0 (https://astrofi.app)'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json() as any[]

      if (!data || data.length === 0) {
        return null
      }

      const result = data[0]
      const geocodingResult: GeocodingResult = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
        country: result.address?.country || '',
        state: result.address?.state || '',
        city: result.address?.city || result.address?.town || ''
      }

      // Cache the result
      this.cache.set(cacheKey, geocodingResult)
      
      // Clean up old cache entries
      this.cleanupCache()

      return geocodingResult
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  /**
   * Alternative geocoding using Google Maps API (if API key is provided)
   */
  async geocodeWithGoogle(placeName: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      return this.geocodePlace(placeName) // Fallback to free service
    }

    try {
      // Check cache first
      const cacheKey = `google:${placeName.toLowerCase().trim()}`
      const cachedResult = this.cache.get(cacheKey)
      if (cachedResult) {
        console.log('Google geocoding cache hit for:', placeName)
        return cachedResult
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error('Google Geocoding request failed')
      }

      const data = await response.json() as any

      if (!data.results || data.results.length === 0) {
        return null
      }

      const result = data.results[0]
      const location = result.geometry.location
      const addressComponents = result.address_components

      const geocodingResult: GeocodingResult = {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        country: this.getAddressComponent(addressComponents, 'country') || '',
        state: this.getAddressComponent(addressComponents, 'administrative_area_level_1') || '',
        city: this.getAddressComponent(addressComponents, 'locality') || ''
      }

      // Cache the result
      this.cache.set(cacheKey, geocodingResult)
      
      // Clean up old cache entries
      this.cleanupCache()

      return geocodingResult
    } catch (error) {
      console.error('Google Geocoding error:', error)
      return this.geocodePlace(placeName) // Fallback to free service
    }
  }

  private getAddressComponent(components: any[], type: string): string | null {
    const component = components.find(comp => comp.types.includes(type))
    return component ? component.long_name : null
  }

  private cleanupCache() {
    // Simple cache cleanup - in production, you might want a more sophisticated approach
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries())
      const toDelete = entries.slice(0, 100) // Remove oldest 100 entries
      toDelete.forEach(([key]) => this.cache.delete(key))
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService() 