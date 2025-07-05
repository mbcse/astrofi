import { SelfAppBuilder } from '@selfxyz/qrcode'
import { v4 as uuidv4 } from 'uuid'

export interface SelfVerificationResult {
  isValid: boolean
  userIdentifier: string
  discloseOutput?: {
    nationality?: string
    olderThan?: string
    name?: string[]
    date_of_birth?: string
  }
  isValidDetails?: {
    isValid: boolean
    isOlderThanValid: boolean
    isOfacValid: boolean
  }
}

export interface SelfVerificationConfig {
  appName: string
  scope: string
  endpoint: string
  logoBase64?: string
  disclosures: {
    minimumAge: number
    excludedCountries: ('IRN' | 'PRK' | 'CUB' | 'SYR' | 'VEN' | 'ZWE')[]
    ofac: boolean
    nationality?: boolean
    name?: boolean
    date_of_birth?: boolean
  }
}

export class SelfSDKHelper {
  private config: SelfVerificationConfig
  private userId: string | null = null
  private verificationResult: SelfVerificationResult | null = null

  constructor(config: SelfVerificationConfig) {
    this.config = config
  }

  /**
   * Generate a new user ID for verification
   */
  generateUserId(): string {
    this.userId = uuidv4()
    return this.userId
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId
  }

  /**
   * Create SelfApp instance for QR code generation
   */
  createSelfApp(): any {
    if (!this.userId) {
      throw new Error('User ID not generated. Call generateUserId() first.')
    }

    return new SelfAppBuilder({
      appName: this.config.appName,
      scope: this.config.scope,
      endpoint: this.config.endpoint,
      logoBase64: this.config.logoBase64,
      userId: this.userId,
      disclosures: this.config.disclosures
    }).build()
  }

  /**
   * Set verification result from QR code success callback
   */
  setVerificationResult(result: SelfVerificationResult): void {
    this.verificationResult = result
  }

  /**
   * Get verification result
   */
  getVerificationResult(): SelfVerificationResult | null {
    return this.verificationResult
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    return this.verificationResult?.isValidDetails?.isValid || false
  }

  /**
   * Get user's nationality from verification
   */
  getNationality(): string | null {
    return this.verificationResult?.discloseOutput?.nationality || null
  }

  /**
   * Get user's name from verification
   */
  getName(): string[] | null {
    return this.verificationResult?.discloseOutput?.name || null
  }

  /**
   * Get user's date of birth from verification
   */
  getDateOfBirth(): string | null {
    return this.verificationResult?.discloseOutput?.date_of_birth || null
  }

  /**
   * Get user's age verification status
   */
  isAgeValid(): boolean {
    return this.verificationResult?.isValidDetails?.isOlderThanValid || false
  }

  /**
   * Get OFAC verification status
   */
  isOfacValid(): boolean {
    return this.verificationResult?.isValidDetails?.isOfacValid || false
  }

  /**
   * Reset verification state
   */
  reset(): void {
    this.userId = null
    this.verificationResult = null
  }

  /**
   * Verify identity for minting chart NFT
   */
  verifyIdentityForMinting(): boolean {
    return this.isVerified() && this.isAgeValid() && this.isOfacValid()
  }

  /**
   * Verify astrologer credentials (basic verification for now)
   */
  verifyAstrologerCredentials(): boolean {
    return this.isVerified() && this.isAgeValid() && this.isOfacValid()
  }
}

// Default configuration for AstroFi
const defaultConfig: SelfVerificationConfig = {
  appName: "AstroFi",
  scope: "astrofi-app",
  endpoint: process.env.NEXT_PUBLIC_SELF_VERIFICATION_ENDPOINT || "https://astrofi.com/api/verify",
  disclosures: {
    minimumAge: 18,
    excludedCountries: ['IRN', 'PRK'],
    ofac: true,
    nationality: true,
    name: true,
    date_of_birth: true
  }
}

// Export singleton instance
export const selfSDK = new SelfSDKHelper(defaultConfig) 