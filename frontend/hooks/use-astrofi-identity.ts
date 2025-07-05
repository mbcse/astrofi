import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { astroFiIdentity, AstroFiUser, BirthChartData, AstrologerProfileData } from '@/lib/astrofi-identity'

export interface UseAstroFiIdentityReturn {
  // State
  isInitialized: boolean
  isReady: boolean
  user: AstroFiUser | null
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  updateProfile: (profileData: any) => Promise<void>
  createBirthChart: (chartData: BirthChartData) => Promise<any>
  createAstrologerProfile: (profileData: AstrologerProfileData) => Promise<any>
  uploadPrediction: (predictionData: any, predictionId: string) => Promise<any>
  uploadNFTMetadata: (metadata: any, tokenId: string) => Promise<any>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAstroFiIdentity(): UseAstroFiIdentityReturn {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<AstroFiUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize identity manager
  const initialize = useCallback(async () => {
    if (!address || !walletClient || !isConnected) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await astroFiIdentity.initialize(walletClient, address)
      setIsInitialized(true)
      setIsReady(astroFiIdentity.isReady())
      
      // Load user data
      await refreshUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize identity manager')
      console.error('Failed to initialize AstroFi identity:', err)
    } finally {
      setIsLoading(false)
    }
  }, [address, walletClient, isConnected])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!address || !astroFiIdentity.isReady()) {
      return
    }

    try {
      const userData = await astroFiIdentity.getCompleteUserData(address)
      setUser(userData)
    } catch (err) {
      console.error('Failed to refresh user data:', err)
    }
  }, [address])

  // Update profile
  const updateProfile = useCallback(async (profileData: any) => {
    if (!astroFiIdentity.isReady()) {
      throw new Error('Identity manager not ready')
    }

    setIsLoading(true)
    setError(null)

    try {
      await astroFiIdentity.updateProfile(profileData)
      await refreshUser()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [refreshUser])

  // Create birth chart
  const createBirthChart = useCallback(async (chartData: BirthChartData) => {
    if (!address || !astroFiIdentity.isReady()) {
      throw new Error('Identity manager not ready')
    }

    setIsLoading(true)
    setError(null)

    try {
      const birthChart = await astroFiIdentity.createBirthChart(chartData, address)
      await refreshUser()
      return birthChart
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create birth chart'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [address, refreshUser])

  // Create astrologer profile
  const createAstrologerProfile = useCallback(async (profileData: AstrologerProfileData) => {
    if (!address || !astroFiIdentity.isReady()) {
      throw new Error('Identity manager not ready')
    }

    setIsLoading(true)
    setError(null)

    try {
      const astrologerProfile = await astroFiIdentity.createAstrologerProfile(profileData, address)
      await refreshUser()
      return astrologerProfile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create astrologer profile'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [address, refreshUser])

  // Upload prediction
  const uploadPrediction = useCallback(async (predictionData: any, predictionId: string) => {
    if (!astroFiIdentity.isReady()) {
      throw new Error('Identity manager not ready')
    }

    setIsLoading(true)
    setError(null)

    try {
      const prediction = await astroFiIdentity.uploadPrediction(predictionData, predictionId)
      return prediction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload prediction'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Upload NFT metadata
  const uploadNFTMetadata = useCallback(async (metadata: any, tokenId: string) => {
    if (!astroFiIdentity.isReady()) {
      throw new Error('Identity manager not ready')
    }

    setIsLoading(true)
    setError(null)

    try {
      const nftMetadata = await astroFiIdentity.uploadNFTMetadata(metadata, tokenId)
      return nftMetadata
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload NFT metadata'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sign in
  const signIn = useCallback(async () => {
    if (!astroFiIdentity.isInitialized) {
      throw new Error('Identity manager not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      await astroFiIdentity.signIn()
      setIsReady(astroFiIdentity.isReady())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await astroFiIdentity.signOut()
      setIsInitialized(false)
      setIsReady(false)
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (address && walletClient && isConnected && !isInitialized) {
      initialize()
    }
  }, [address, walletClient, isConnected, isInitialized, initialize])

  // Update ready state when identity manager state changes
  useEffect(() => {
    if (isInitialized) {
      setIsReady(astroFiIdentity.isReady())
    }
  }, [isInitialized])

  return {
    // State
    isInitialized,
    isReady,
    user,
    isLoading,
    error,

    // Actions
    initialize,
    updateProfile,
    createBirthChart,
    createAstrologerProfile,
    uploadPrediction,
    uploadNFTMetadata,
    signIn,
    signOut,
    refreshUser
  }
} 