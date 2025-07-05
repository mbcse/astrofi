import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { contractService } from '@/lib/contracts'

export function useContracts() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [isConnected, setIsConnected] = useState(false)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const wallet = wallets[0]
      const connectWallet = async () => {
        try {
          // Get the ethers provider from Privy wallet
          const provider = await wallet.getEthereumProvider()
          const ethersSigner = await wallet.getEthersSigner()
          
          if (ethersSigner) {
            contractService.setSigner(ethersSigner)
            setSigner(ethersSigner)
            setUserAddress(wallet.address)
            setIsConnected(true)
            
            console.log('Connected to contract service with address:', wallet.address)
          }
        } catch (error) {
          console.error('Failed to connect wallet to contract service:', error)
        }
      }
      
      connectWallet()
    } else {
      setSigner(null)
      setUserAddress(null)
      setIsConnected(false)
      contractService.setSigner(null)
    }
  }, [ready, authenticated, wallets])

  // Chart NFT Functions
  const mintChartNFT = async (
    name: string,
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    latitude: number,
    longitude: number,
    chartData: string,
    tokenURI: string
  ) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.mintChartNFT(
      name,
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      chartData,
      tokenURI
    )
  }

  const getUserCharts = async (address?: string) => {
    const targetAddress = address || userAddress
    if (!targetAddress) {
      throw new Error('No address provided')
    }
    
    return await contractService.getUserCharts(targetAddress)
  }

  // Astrologer Functions
  const registerAstrologer = async (
    name: string,
    description: string,
    specialization: string,
    experience: number
  ) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.registerAstrologer(
      name,
      description,
      specialization,
      experience
    )
  }

  const getAstrologerProfile = async (astrologerAddress: string) => {
    return await contractService.getAstrologerProfile(astrologerAddress)
  }

  const getAllAstrologers = async () => {
    return await contractService.getAllAstrologers()
  }

  // Prediction Functions
  const createPrediction = async (
    title: string,
    description: string,
    endDate: number,
    stakeAmount: string
  ) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.createPrediction(
      title,
      description,
      endDate,
      stakeAmount
    )
  }

  const stakeOnPrediction = async (
    predictionId: number,
    outcome: boolean,
    stakeAmount: string
  ) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.stakeOnPrediction(
      predictionId,
      outcome,
      stakeAmount
    )
  }

  const resolvePrediction = async (predictionId: number, outcome: boolean) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.resolvePrediction(predictionId, outcome)
  }

  const getPrediction = async (predictionId: number) => {
    return await contractService.getPrediction(predictionId)
  }

  const getAllPredictions = async () => {
    return await contractService.getAllPredictions()
  }

  // Reputation Functions
  const getReputationScore = async (address?: string) => {
    const targetAddress = address || userAddress
    if (!targetAddress) {
      throw new Error('No address provided')
    }
    
    return await contractService.getReputationScore(targetAddress)
  }

  const updateReputationScore = async (address: string, score: number) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.updateReputationScore(address, score)
  }

  // Token Functions
  const buyTokens = async (tokenSymbol: string, amount: string) => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }
    
    return await contractService.buyTokens(tokenSymbol, amount)
  }

  const getTokenPrice = async (tokenSymbol: string) => {
    return await contractService.getTokenPrice(tokenSymbol)
  }

  // Utility Functions
  const getBalance = async (address?: string) => {
    const targetAddress = address || userAddress
    if (!targetAddress) {
      throw new Error('No address provided')
    }
    
    return await contractService.getBalance(targetAddress)
  }

  const getTransactionReceipt = async (txHash: string) => {
    return await contractService.getTransactionReceipt(txHash)
  }

  return {
    // State
    isConnected,
    userAddress,
    signer,
    ready,
    authenticated,
    
    // Chart NFT Functions
    mintChartNFT,
    getUserCharts,
    
    // Astrologer Functions
    registerAstrologer,
    getAstrologerProfile,
    getAllAstrologers,
    
    // Prediction Functions
    createPrediction,
    stakeOnPrediction,
    resolvePrediction,
    getPrediction,
    getAllPredictions,
    
    // Reputation Functions
    getReputationScore,
    updateReputationScore,
    
    // Token Functions
    buyTokens,
    getTokenPrice,
    
    // Utility Functions
    getBalance,
    getTransactionReceipt,
    formatEther: contractService.formatEther,
    parseEther: contractService.parseEther
  }
} 