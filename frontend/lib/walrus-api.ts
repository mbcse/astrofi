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
  data?: ArrayBuffer
  error?: string
}

export interface MetadataResponse {
  success: boolean
  metadata?: any
  error?: string
}

export class WalrusAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  }

  /**
   * Upload a file to Walrus storage via backend
   */
  async uploadFile(
    file: File | Buffer,
    fileName: string,
    fileType: string,
    metadata?: Record<string, any>
  ): Promise<UploadResponse> {
    try {
      let fileData: string

      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        fileData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      } else {
        fileData = btoa(String.fromCharCode(...new Uint8Array(file)))
      }

      const response = await fetch(`${this.baseUrl}/api/walrus/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          fileName,
          fileType,
          metadata
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Download a file from Walrus storage via backend
   */
  async downloadFile(fileId: string): Promise<DownloadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/download/${fileId}`)
      
      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.error || 'Download failed'
        }
      }

      const arrayBuffer = await response.arrayBuffer()
      return {
        success: true,
        data: arrayBuffer
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      }
    }
  }

  /**
   * Get file metadata from Walrus storage via backend
   */
  async getFileMetadata(fileId: string): Promise<MetadataResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/metadata/${fileId}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error getting file metadata:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Metadata retrieval failed'
      }
    }
  }

  /**
   * Delete a file from Walrus storage via backend
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/delete/${fileId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
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
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/birth-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartData,
          userId,
          fileName
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading birth chart:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Birth chart upload failed'
      }
    }
  }

  /**
   * Upload astrologer profile
   */
  async uploadAstrologerProfile(
    profileData: any,
    userId: string,
    fileName?: string
  ): Promise<UploadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/astrologer-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData,
          userId,
          fileName
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading astrologer profile:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile upload failed'
      }
    }
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
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          predictionData,
          userId,
          predictionId,
          fileName
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading prediction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Prediction upload failed'
      }
    }
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
    try {
      const response = await fetch(`${this.baseUrl}/api/walrus/nft-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          tokenId,
          userId,
          fileName
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading NFT metadata:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'NFT metadata upload failed'
      }
    }
  }
}

// Export singleton instance
export const walrusAPI = new WalrusAPI() 