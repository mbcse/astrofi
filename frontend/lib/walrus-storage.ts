import { Tusky } from '@tusky-io/ts-sdk'

export interface WalrusFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  metadata?: Record<string, any>
  tags?: string[]
  blobId?: string
  blobObjectId?: string
}

export interface WalrusUploadOptions {
  metadata?: Record<string, any>
  tags?: string[]
  encrypted?: boolean
}

export interface WalrusConfig {
  apiKey?: string
  wallet?: {
    signPersonalMessage?: any
    account?: any
    keypair?: any
  }
}

export class WalrusStorageHelper {
  private client: Tusky | null = null
  private vaultId: string | null = null
  private config: WalrusConfig

  constructor(config?: Partial<WalrusConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.NEXT_PUBLIC_WALRUS_API_KEY,
      wallet: config?.wallet,
      ...config
    }
  }

  /**
   * Initialize Tusky client
   */
  async initialize(): Promise<void> {
    try {
      this.client = new Tusky(this.config)
      
      // Create a public vault for storing files
      const vault = await this.client.vault.create("AstroFi Public Vault", { encrypted: false })
      this.vaultId = vault.id
      
      console.log('Tusky client initialized successfully with vault:', this.vaultId)
    } catch (error) {
      console.error('Failed to initialize Tusky client:', error)
      throw error
    }
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null && this.vaultId !== null
  }

  /**
   * Upload a file to Walrus storage
   */
  async uploadFile(
    file: File | Buffer,
    fileName: string,
    options: WalrusUploadOptions = {}
  ): Promise<WalrusFile> {
    if (!this.client || !this.vaultId) {
      throw new Error('Tusky client not initialized. Call initialize() first.')
    }

    try {
      // Convert file to path or buffer
      let filePath: string
      if (file instanceof File) {
        // For browser File objects, we need to create a temporary path
        filePath = `/tmp/${fileName}`
        // Note: In a real implementation, you might need to handle File objects differently
      } else {
        filePath = fileName
      }

      // Upload file to vault
      const uploadId = await this.client.file.upload(this.vaultId, filePath)

      // Get file metadata
      const fileMetadata = await this.client.file.get(uploadId)

      const walrusFile: WalrusFile = {
        id: uploadId,
        name: fileName,
        size: fileMetadata.size || 0,
        type: fileMetadata.type || 'application/octet-stream',
        url: fileMetadata.url || '',
        uploadedAt: new Date(),
        metadata: options.metadata,
        blobId: fileMetadata.blobId,
        blobObjectId: fileMetadata.blobObjectId
      }

      console.log('File uploaded successfully:', walrusFile)
      return walrusFile
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    }
  }

  /**
   * Upload birth chart data as JSON
   */
  async uploadBirthChartData(
    chartData: any,
    userId: string,
    options: WalrusUploadOptions = {}
  ): Promise<WalrusFile> {
    const fileName = `birth-chart-${userId}-${Date.now()}.json`
    const jsonString = JSON.stringify(chartData, null, 2)
    const buffer = Buffer.from(jsonString, 'utf-8')

    return this.uploadFile(buffer, fileName, {
      metadata: {
        type: 'birth-chart',
        userId,
        ...options.metadata
      },
      tags: ['birth-chart', 'astrology', userId, ...(options.tags || [])],
      ...options
    })
  }

  /**
   * Upload astrologer profile data
   */
  async uploadAstrologerProfile(
    profileData: any,
    astrologerId: string,
    options: WalrusUploadOptions = {}
  ): Promise<WalrusFile> {
    const fileName = `astrologer-profile-${astrologerId}-${Date.now()}.json`
    const jsonString = JSON.stringify(profileData, null, 2)
    const buffer = Buffer.from(jsonString, 'utf-8')

    return this.uploadFile(buffer, fileName, {
      metadata: {
        type: 'astrologer-profile',
        astrologerId,
        ...options.metadata
      },
      tags: ['astrologer', 'profile', astrologerId, ...(options.tags || [])],
      ...options
    })
  }

  /**
   * Upload prediction data
   */
  async uploadPredictionData(
    predictionData: any,
    predictionId: string,
    options: WalrusUploadOptions = {}
  ): Promise<WalrusFile> {
    const fileName = `prediction-${predictionId}-${Date.now()}.json`
    const jsonString = JSON.stringify(predictionData, null, 2)
    const buffer = Buffer.from(jsonString, 'utf-8')

    return this.uploadFile(buffer, fileName, {
      metadata: {
        type: 'prediction',
        predictionId,
        ...options.metadata
      },
      tags: ['prediction', 'astrology', predictionId, ...(options.tags || [])],
      ...options
    })
  }

  /**
   * Upload NFT metadata
   */
  async uploadNFTMetadata(
    metadata: any,
    tokenId: string,
    options: WalrusUploadOptions = {}
  ): Promise<WalrusFile> {
    const fileName = `nft-metadata-${tokenId}.json`
    const jsonString = JSON.stringify(metadata, null, 2)
    const buffer = Buffer.from(jsonString, 'utf-8')

    return this.uploadFile(buffer, fileName, {
      metadata: {
        type: 'nft-metadata',
        tokenId,
        ...options.metadata
      },
      tags: ['nft', 'metadata', tokenId, ...(options.tags || [])],
      ...options
    })
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<WalrusFile | null> {
    if (!this.client) {
      throw new Error('Tusky client not initialized. Call initialize() first.')
    }

    try {
      const fileMetadata = await this.client.file.get(fileId)
      
      if (!fileMetadata) {
        return null
      }

      return {
        id: fileId,
        name: fileMetadata.name || '',
        size: fileMetadata.size || 0,
        type: fileMetadata.type || 'application/octet-stream',
        url: fileMetadata.url || '',
        uploadedAt: new Date(),
        metadata: fileMetadata.metadata,
        blobId: fileMetadata.blobId,
        blobObjectId: fileMetadata.blobObjectId
      }
    } catch (error) {
      console.error('Failed to get file:', error)
      return null
    }
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string): Promise<ArrayBuffer | null> {
    if (!this.client) {
      throw new Error('Tusky client not initialized. Call initialize() first.')
    }

    try {
      const fileBuffer = await this.client.file.arrayBuffer(fileId)
      return fileBuffer
    } catch (error) {
      console.error('Failed to download file:', error)
      return null
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Tusky client not initialized. Call initialize() first.')
    }

    try {
      await this.client.file.delete(fileId)
      console.log('File deleted successfully:', fileId)
      return true
    } catch (error) {
      console.error('Failed to delete file:', error)
      return false
    }
  }

  /**
   * List all files
   */
  async listFiles(): Promise<WalrusFile[]> {
    if (!this.client) {
      throw new Error('Tusky client not initialized. Call initialize() first.')
    }

    try {
      const files = await this.client.file.listAll()
      
      return files.map((file: any) => ({
        id: file.id,
        name: file.name || '',
        size: file.size || 0,
        type: file.type || 'application/octet-stream',
        url: file.url || '',
        uploadedAt: new Date(),
        metadata: file.metadata,
        blobId: file.blobId,
        blobObjectId: file.blobObjectId
      }))
    } catch (error) {
      console.error('Failed to list files:', error)
      return []
    }
  }

  /**
   * Get files by user ID (filtered by metadata)
   */
  async getFilesByUserId(userId: string): Promise<WalrusFile[]> {
    const allFiles = await this.listFiles()
    return allFiles.filter(file => 
      file.metadata?.userId === userId || 
      file.tags?.includes(userId)
    )
  }

  /**
   * Get birth chart files for a user
   */
  async getBirthChartFiles(userId: string): Promise<WalrusFile[]> {
    const allFiles = await this.listFiles()
    return allFiles.filter(file => 
      file.metadata?.type === 'birth-chart' && 
      file.metadata?.userId === userId
    )
  }

  /**
   * Get astrologer profile files
   */
  async getAstrologerProfileFiles(astrologerId: string): Promise<WalrusFile[]> {
    const allFiles = await this.listFiles()
    return allFiles.filter(file => 
      file.metadata?.type === 'astrologer-profile' && 
      file.metadata?.astrologerId === astrologerId
    )
  }

  /**
   * Get prediction files
   */
  async getPredictionFiles(predictionId?: string): Promise<WalrusFile[]> {
    const allFiles = await this.listFiles()
    return allFiles.filter(file => {
      if (file.metadata?.type !== 'prediction') return false
      if (predictionId) {
        return file.metadata?.predictionId === predictionId
      }
      return true
    })
  }

  /**
   * Sign in with wallet (for browser usage)
   */
  async signIn(): Promise<void> {
    if (!this.client) {
      throw new Error('Tusky client not initialized. Call initialize() first.')
    }

    try {
      await this.client.auth.signIn()
      console.log('Signed in successfully')
    } catch (error) {
      console.error('Failed to sign in:', error)
      throw error
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (this.client) {
      await this.client.auth.signOut()
      this.client = null
      this.vaultId = null
    }
  }
}

// Export singleton instance
export const walrusStorage = new WalrusStorageHelper() 