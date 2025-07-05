import { walrusStorage, WalrusFile } from './walrus-storage'

export interface AstroFiUser {
  did: string
  walletAddress: string
  profile: SelfIdentityData
  birthChart?: WalrusFile
  astrologerProfile?: WalrusFile
}

export interface BirthChartData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  coordinates: {
    latitude: number
    longitude: number
  }
  planetaryPositions: {
    sun: number
    moon: number
    mercury: number
    venus: number
    mars: number
    jupiter: number
    saturn: number
    uranus: number
    neptune: number
    pluto: number
  }
  houses: number[]
  aspects: Array<{
    planet1: string
    planet2: string
    aspect: string
    orb: number
  }>
  metadata?: Record<string, any>
}

export interface AstrologerProfileData {
  name: string
  email: string
  avatar?: string
  description: string
  experience: string
  specialties: string[]
  certifications: string[]
  languages: string[]
  consultationFee: number
  availability: {
    timezone: string
    schedule: Array<{
      day: string
      startTime: string
      endTime: string
    }>
  }
  socialLinks?: {
    website?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  metadata?: Record<string, any>
}

export class AstroFiIdentityManager {
  private _isInitialized = false

  get isInitialized(): boolean {
    return this._isInitialized
  }

  /**
   * Initialize both Self SDK and Walrus storage
   */
  async initialize(ethereumProvider: any, address: string): Promise<void> {
    try {
      // Initialize Walrus storage
      await walrusStorage.initialize()
      
      this._isInitialized = true
      console.log('AstroFi Identity Manager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AstroFi Identity Manager:', error)
      throw error
    }
  }

  /**
   * Check if identity manager is initialized
   */
  isReady(): boolean {
    return this.isInitialized && walrusStorage.isInitialized()
  }

  /**
   * Get user's DID
   */
  getDID(): string | null {
    return null
  }

  /**
   * Create or update user profile
   */
  async updateProfile(profileData: Partial<SelfIdentityData>): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<SelfIdentityData | null> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    return null
  }

  /**
   * Create birth chart and store it
   */
  async createBirthChart(
    chartData: BirthChartData,
    userId: string
  ): Promise<WalrusFile> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    // Verify user identity before creating chart
    const isVerified = false
    if (!isVerified) {
      throw new Error('User identity not verified. Please complete your profile first.')
    }

    // Upload birth chart data to Walrus
    const birthChartFile = await walrusStorage.uploadBirthChartData(chartData, userId, {
      metadata: {
        type: 'birth-chart',
        userId,
        name: chartData.name,
        birthDate: chartData.birthDate,
        birthPlace: chartData.birthPlace
      },
      tags: ['birth-chart', 'astrology', userId, chartData.name]
    })

    console.log('Birth chart created and stored:', birthChartFile)
    return birthChartFile
  }

  /**
   * Get user's birth chart
   */
  async getBirthChart(userId: string): Promise<WalrusFile | null> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    const birthChartFiles = await walrusStorage.getBirthChartFiles(userId)
    return birthChartFiles.length > 0 ? birthChartFiles[0] : null
  }

  /**
   * Create astrologer profile
   */
  async createAstrologerProfile(
    profileData: AstrologerProfileData,
    astrologerId: string
  ): Promise<WalrusFile> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    // Upload astrologer profile to Walrus
    const astrologerFile = await walrusStorage.uploadAstrologerProfile(profileData, astrologerId, {
      metadata: {
        type: 'astrologer-profile',
        astrologerId,
        name: profileData.name,
        experience: profileData.experience,
        specialties: profileData.specialties
      },
      tags: ['astrologer', 'profile', astrologerId, profileData.name]
    })

    console.log('Astrologer profile created and stored:', astrologerFile)
    return astrologerFile
  }

  /**
   * Get astrologer profile
   */
  async getAstrologerProfile(astrologerId: string): Promise<WalrusFile | null> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    const astrologerFiles = await walrusStorage.getAstrologerProfileFiles(astrologerId)
    return astrologerFiles.length > 0 ? astrologerFiles[0] : null
  }

  /**
   * Verify astrologer credentials
   */
  async verifyAstrologerCredentials(): Promise<boolean> {
    if (!this.isReady()) {
      return false
    }

    return false
  }

  /**
   * Get complete user data
   */
  async getCompleteUserData(walletAddress: string): Promise<AstroFiUser | null> {
    if (!this.isReady()) {
      return null
    }

    try {
      const [profile, birthChart, astrologerProfile] = await Promise.all([
        this.getProfile(),
        this.getBirthChart(walletAddress),
        this.getAstrologerProfile(walletAddress)
      ])

      if (!profile) {
        return null
      }

      return {
        did: '',
        walletAddress,
        profile,
        birthChart: birthChart || undefined,
        astrologerProfile: astrologerProfile || undefined
      }
    } catch (error) {
      console.error('Failed to get complete user data:', error)
      return null
    }
  }

  /**
   * Upload prediction data
   */
  async uploadPrediction(
    predictionData: any,
    predictionId: string,
    metadata?: Record<string, any>
  ): Promise<WalrusFile> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    return walrusStorage.uploadPredictionData(predictionData, predictionId, {
      metadata: {
        type: 'prediction',
        predictionId,
        uploadedBy: '',
        ...metadata
      },
      tags: ['prediction', 'astrology', predictionId]
    })
  }

  /**
   * Upload NFT metadata
   */
  async uploadNFTMetadata(
    metadata: any,
    tokenId: string,
    additionalMetadata?: Record<string, any>
  ): Promise<WalrusFile> {
    if (!this.isReady()) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    return walrusStorage.uploadNFTMetadata(metadata, tokenId, {
      metadata: {
        type: 'nft-metadata',
        tokenId,
        uploadedBy: '',
        ...additionalMetadata
      },
      tags: ['nft', 'metadata', tokenId]
    })
  }

  /**
   * Sign in with wallet (for browser usage)
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Identity manager not initialized. Call initialize() first.')
    }

    await walrusStorage.signIn()
  }

  /**
   * Sign out and cleanup
   */
  async signOut(): Promise<void> {
    await walrusStorage.signOut()
    
    this._isInitialized = false
  }
}

// Export singleton instance
export const astroFiIdentity = new AstroFiIdentityManager() 