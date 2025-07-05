import { Tusky } from '@tusky-io/ts-sdk'

export interface WalrusFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface UploadResponse {
  success: boolean
  file?: WalrusFile
  error?: string
}

export interface DownloadResponse {
  success: boolean
  data?: Buffer
  error?: string
}

export class WalrusStorageService {
  private client: Tusky | null = null
  private isInitialized = false
  private vaultId: string | null = null
  private vaultName = 'AstroFi Vault'

  constructor() {
    const apiKey = process.env.WALRUS_API_KEY || 'b96c45fe-8df8-46d4-8e42-f89be076a675'
    if (!apiKey) {
      console.warn('WALRUS_API_KEY not found in environment variables')
      return
    }
    this.client = new Tusky({ apiKey })
    this.isInitialized = true
  }

  /**
   * Check if the service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null
  }

  // Ensure the vault exists and return its ID
  private async getVaultId(): Promise<string> {
    if (!this.isReady()) throw new Error('Walrus storage service not initialized')
    if (this.vaultId) return this.vaultId
    // Try to find existing vault
    const vaults = await this.client!.vault.listAll()
    let vault = vaults.find((v: any) => v.name === this.vaultName && v.encrypted === false)
    if (!vault) {
      // Create if not found
      vault = await this.client!.vault.create(this.vaultName, { encrypted: false })
    }
    this.vaultId = vault.id
    return this.vaultId
  }

  /**
   * Upload a file to Walrus storage
   * Note: This is a simplified implementation using available Tusky SDK methods
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
    metadata?: Record<string, any>
  ): Promise<UploadResponse> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Walrus storage service not initialized'
      }
    }
    try {
      const vaultId = await this.getVaultId()
      // Upload file to vault
      const uploadId = await this.client!.file.upload(vaultId, fileBuffer, {
        name: fileName,
        mimeType: fileType
      })
      console.log('Upload ID:', uploadId);
      // Get file metadata (to get blobId/url)
      const fileMeta = await this.client!.file.get(uploadId)
      
      console.log('Raw file metadata:', JSON.stringify(fileMeta, null, 2));
      
      // Tusky doesn't provide direct URLs - files must be accessed through SDK methods
      // We'll create a URL that points to our Next.js API route that proxies the file
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const fileUrl = `${frontendUrl}/api/image/${uploadId}`;
      
      console.log('Upload ID:', uploadId);
      console.log('Blob ID:', fileMeta.blobId || 'not available');
      console.log('Generated frontend proxy URL:', fileUrl);
      
      const walrusFile: WalrusFile = {
        id: uploadId,
        name: fileName,
        size: fileBuffer.length,
        type: fileType,
        url: fileUrl, // URL to our Next.js API route
        uploadedAt: new Date(),
        uploadedBy: metadata?.uploadedBy || 'unknown'
      }
      return { success: true, file: walrusFile }
    } catch (error) {
      console.error('Error uploading file to Walrus:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  /**
   * Download a file from Walrus storage
   */
  async downloadFile(fileId: string): Promise<DownloadResponse> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Walrus storage service not initialized'
      }
    }
    try {
      const fileBuffer = await this.client!.file.arrayBuffer(fileId)
      return { success: true, data: Buffer.from(fileBuffer) }
    } catch (error) {
      console.error('Error downloading file from Walrus:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown download error'
      }
    }
  }

  /**
   * Get file metadata from Walrus storage
   */
  async getFileMetadata(fileId: string): Promise<{ success: boolean; metadata?: any; error?: string }> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Walrus storage service not initialized'
      }
    }
    try {
      const metadata = await this.client!.file.get(fileId)
      if (!metadata) {
        return { success: false, error: 'Metadata not found in Walrus' }
      }
      return { success: true, metadata }
    } catch (error) {
      console.error('Error getting file metadata from Walrus:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown metadata error'
      }
    }
  }

  /**
   * Delete a file from Walrus storage
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Walrus storage service not initialized'
      }
    }
    try {
      await this.client!.file.delete(fileId)
      return { success: true }
    } catch (error) {
      console.error('Error deleting file from Walrus:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown delete error'
      }
    }
  }

  /**
   * Upload birth chart data
   */
  async uploadBirthChart(
    chartData: any,
    userId: string,
    fileName?: string
  ): Promise<UploadResponse> {
    const data = JSON.stringify(chartData)
    const buffer = Buffer.from(data, 'utf-8')
    const name = fileName || `birth-chart-${userId}-${Date.now()}.json`
    return this.uploadFile(buffer, name, 'application/json', {
      type: 'birth-chart',
      userId,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    })
  }

  /**
   * Upload astrologer profile
   */
  async uploadAstrologerProfile(
    profileData: any,
    userId: string,
    fileName?: string
  ): Promise<UploadResponse> {
    const data = JSON.stringify(profileData)
    const buffer = Buffer.from(data, 'utf-8')
    const name = fileName || `astrologer-profile-${userId}-${Date.now()}.json`
    return this.uploadFile(buffer, name, 'application/json', {
      type: 'astrologer-profile',
      userId,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    })
  }

  /**
   * Upload prediction data
   */
  async uploadPrediction(
    predictionData: any,
    userId: string,
    predictionId: string,
    fileName?: string
  ): Promise<UploadResponse> {
    const data = JSON.stringify(predictionData)
    const buffer = Buffer.from(data, 'utf-8')
    const name = fileName || `prediction-${predictionId}-${Date.now()}.json`
    return this.uploadFile(buffer, name, 'application/json', {
      type: 'prediction',
      predictionId,
      userId,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    })
  }

  /**
   * Upload NFT metadata
   */
  async uploadNFTMetadata(
    metadata: any,
    tokenId: string,
    userId: string,
    fileName?: string
  ): Promise<UploadResponse> {
    const data = JSON.stringify(metadata)
    const buffer = Buffer.from(data, 'utf-8')
    const name = fileName || `nft-metadata-${tokenId}-${Date.now()}.json`
    return this.uploadFile(buffer, name, 'application/json', {
      type: 'nft-metadata',
      tokenId,
      userId,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    })
  }
}

// Export singleton instance
export const walrusStorage = new WalrusStorageService() 