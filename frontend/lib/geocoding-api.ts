export interface GeocodingResult {
  latitude: number
  longitude: number
  formattedAddress: string
  country: string
  state?: string
  city?: string
}

export interface GeocodingResponse {
  success: boolean
  data?: GeocodingResult
  error?: string
}

export class GeocodingAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  }

  /**
   * Geocode a place name to get coordinates
   */
  async geocodePlace(placeName: string): Promise<GeocodingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/geocoding/geocode?place=${encodeURIComponent(placeName)}`)
      
      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.error || 'Geocoding failed'
        }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error geocoding place:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geocoding failed'
      }
    }
  }
}

// Export singleton instance
export const geocodingAPI = new GeocodingAPI() 