import { ethers } from 'ethers'
import contractAddresses from '@/config/contractAddresses.json'
import contractABIData from '@/config/contractABIData.json'
const ASTRO_CHART_NFT_ABI = contractABIData['545']?.ASTROCHARTNFT || []
const ASTROLOGER_MANAGER_ABI = contractABIData['545']?.ASTROLOGERMANAGER || []
const PREDICTION_MARKET_ABI = contractABIData['545']?.PREDICTIONMARKET || []
const WORLD_PREDICTION_MARKET_ABI = contractABIData['545']?.WORLDPREDICTIONMARKET || []
const REPUTATION_SCORER_ABI = contractABIData['545']?.REPUTATIONSCORER || []
const BUY_TOKEN_CONTRACT_ABI = contractABIData['545']?.BUYTOKENCONTRACT || []
const ASTRO_TOKEN_LAUNCHER_ABI = contractABIData['545']?.ASTROTOKENLAUNCHER || []
const ZODIAC_DAO_ABI = contractABIData['545']?.ZODIACDAO || []

const FLOW_TESTNET_CHAIN_ID = 545
const FLOW_TESTNET_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://access-testnet.onflow.org'

export interface ContractConfig {
  chainId: number
  rpcUrl: string
  explorerUrl: string
}

export class ContractService {
  private provider: ethers.JsonRpcProvider | null = null
  private signer: ethers.Signer | null = null
  private chainId: number = FLOW_TESTNET_CHAIN_ID

  constructor() {
    this.initializeProvider()
  }

  private initializeProvider() {
    this.provider = new ethers.JsonRpcProvider(FLOW_TESTNET_RPC_URL)
  }

  setSigner(signer: ethers.Signer | null) {
    this.signer = signer
  }

  setChainId(chainId: number) {
    if (chainId !== FLOW_TESTNET_CHAIN_ID) {
      throw new Error(`Only Flow testnet (${FLOW_TESTNET_CHAIN_ID}) is supported`)
    }
    this.chainId = chainId
  }

  private async verifyNetwork() {
    if (!this.signer) {
      throw new Error('Signer not available. Please connect your wallet.')
    }

    const provider = await this.signer.provider
    if (!provider) {
      throw new Error('Provider not available')
    }

    const network = await provider.getNetwork()
    const chainId = Number(network.chainId)
    if (chainId !== FLOW_TESTNET_CHAIN_ID) {
      throw new Error(`Please switch to Flow testnet (${FLOW_TESTNET_CHAIN_ID})`)
    }
  }

  getContractAddress(contractName: string): string {
    const addresses = contractAddresses[this.chainId.toString() as keyof typeof contractAddresses]
    if (!addresses) {
      throw new Error(`No contract addresses found for chain ID ${this.chainId}`)
    }
    
    const address = addresses[contractName as keyof typeof addresses]
    if (!address) {
      throw new Error(`Contract ${contractName} not found for chain ID ${this.chainId}`)
    }
    
    return address
  }

  private getContract(contractName: string, abi: any[]): ethers.Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    const address = this.getContractAddress(contractName)
    return new ethers.Contract(address, abi, this.signer || this.provider)
  }

  getAstroChartNFT() {
    return this.getContract('ASTROCHARTNFT', ASTRO_CHART_NFT_ABI)
  }

  async mintChartNFT(
    name: string,
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    latitude: number,
    longitude: number,
    chartData: any,
    tokenURI: string
  ) {
    await this.verifyNetwork()
    const contract = this.getAstroChartNFT()

    const birthDateTime = new Date(`${birthDate}T${birthTime}`)
    const birthTimestamp = Math.floor(birthDateTime.getTime() / 1000)
    
    try {
      const mintPrice = await contract.mintPrice()
      if (!mintPrice) {
        throw new Error('Failed to get mint price from contract')
      }
      
      const mintPriceEth = ethers.formatEther(mintPrice)
      console.log(`Mint price: ${mintPriceEth} ETH`)
      
      const balance = await this.signer?.provider?.getBalance(await this.signer.getAddress())
      if (!balance || balance < mintPrice) {
        throw new Error(`Insufficient funds. You need at least ${mintPriceEth} ETH plus gas fees.`)
      }

      const chartDataWithImage = typeof chartData === 'string' ? JSON.parse(chartData) : chartData
      if (chartDataWithImage.metadata?.chartImageUrl) {
        chartDataWithImage.chartImage = chartDataWithImage.metadata.chartImageUrl
      }
      
      const chartDataString = typeof chartDataWithImage === 'string' 
        ? chartDataWithImage 
        : JSON.stringify(chartDataWithImage)

      const gasEstimate = await contract.mintBirthChart.estimateGas(
        name,
        birthTimestamp,
        birthTimestamp,
        birthPlace,
        "UTC",
        chartDataString,
        tokenURI,
        { value: mintPrice }
      )

      const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2))
      
      const tx = await contract.mintBirthChart(
        name,
        birthTimestamp,
        birthTimestamp,
        birthPlace,
        "UTC",
        chartDataString,
        tokenURI,
        { 
          value: mintPrice,
          gasLimit
        }
      )

      const receipt = await tx.wait()
      
      if (receipt.status === 0) {
        throw new Error('Transaction failed')
      }

      return receipt
    } catch (error: any) {
      console.error('Error minting chart NFT:', error)
      if (error.message.includes('insufficient funds')) {
        throw new Error(`Insufficient funds. Please make sure you have enough ETH to cover the mint price (0.05 ETH) plus gas fees.`)
      }
      throw new Error(error.message || 'Failed to mint chart NFT')
    }
  }

  async getUserCharts(userAddress: string) {
    const contract = this.getAstroChartNFT()
    
    // Get all token IDs owned by the user
    const tokenIds = await contract.getUserCharts(userAddress)
    console.log('Found token IDs:', tokenIds)
    
    const charts = []
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i]
      const chartData = await contract.getBirthChart(tokenId)
      console.log(`Raw chart data for token ${tokenId}:`, chartData)
      
      let latitude = 0, longitude = 0, chartImage = ''
      try {
        console.log('Attempting to parse chartData:', chartData.chartData)
        const parsedChartData = JSON.parse(chartData.chartData)
        console.log('Parsed chart data:', parsedChartData)
        
        latitude = parsedChartData.latitude || 0
        longitude = parsedChartData.longitude || 0
        
        chartImage = parsedChartData.chartImageUrl ||
                    parsedChartData.chartImage ||
                    parsedChartData.chart?.imageUrl ||
                    parsedChartData.chart?.image ||
                    parsedChartData.chart?.url ||
                    parsedChartData.image ||
                    parsedChartData.url ||
                    ''
        
        console.log('Found chart image URL:', chartImage)
                    
        if (!chartImage && chartData.tokenURI && chartData.tokenURI.startsWith('http')) {
          console.log('Attempting to fetch from tokenURI:', chartData.tokenURI)
          try {
            const response = await fetch(chartData.tokenURI)
            const tokenMetadata = await response.json()
            console.log('Token metadata:', tokenMetadata)
            chartImage = tokenMetadata.image || tokenMetadata.chartImage || tokenMetadata.chartImageUrl || ''
            console.log('Found image in token metadata:', chartImage)
          } catch (e) {
            console.warn('Failed to fetch token metadata:', e)
          }
        }

        if (!chartImage && parsedChartData.chartId) {
          chartImage = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/charts/images/chart-${parsedChartData.chartId}.png`
          console.log('Constructed chart image URL from chartId:', chartImage)
        }
      } catch (e) {
        console.warn('Failed to parse chart data:', e)
      }

      const birthDate = new Date(Number(chartData.birthDate) * 1000).toISOString().split('T')[0]
      const birthTime = new Date(Number(chartData.birthTime) * 1000).toISOString().split('T')[1].substring(0, 5)

      const chartObj = {
        tokenId: tokenId.toString(),
        name: chartData.name,
        birthDate,
        birthTime,
        birthPlace: chartData.birthLocation,
        latitude,
        longitude,
        chartData: chartData.chartData,
        chartImage,
        tokenURI: chartData.tokenURI || '',
        mintedAt: new Date(Number(chartData.mintedAt) * 1000).toISOString(),
        owner: chartData.owner
      }
      console.log('Final chart object:', chartObj)
      charts.push(chartObj)
    }
    
    return charts
  }

  async hasAstroChartNFT(userAddress: string) {
    const contract = this.getAstroChartNFT()
    const charts = await contract.getUserCharts(userAddress)
    return charts.length > 0
  }

  getAstrologerManager() {
    return this.getContract('ASTROLOGERMANAGER', ASTROLOGER_MANAGER_ABI)
  }

  async registerAstrologer(
    name: string,
    description: string,
    specialization: string,
    experience: number
  ) {
    await this.verifyNetwork()
    const contract = this.getAstrologerManager()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const registrationFee = ethers.parseEther('0.01') // 0.01 FLOW
    
    const tx = await contract.registerAstrologer(
      name,
      description,
      specialization,
      experience,
      { value: registrationFee }
    )

    return await tx.wait()
  }

  async getAstrologerProfile(astrologerAddress: string) {
    const contract = this.getAstrologerManager()
    return await contract.getAstrologerProfile(astrologerAddress)
  }

  async getAllAstrologers() {
    const contract = this.getAstrologerManager()
    
    try {
      const totalAstrologers = await contract.totalAstrologers()
      const astrologers = []
      
      for (let i = 1; i <= totalAstrologers; i++) {
        try {
          const astrologer = await contract.getAstrologer(i)
          if (astrologer.isActive) {
            astrologers.push({
              address: astrologer.wallet,
              name: astrologer.name,
              email: "",
              specialization: astrologer.specialty,
              experience: Number(astrologer.experience),
              bio: astrologer.description,
              profileURI: "",
              isActive: astrologer.isActive,
              isVerified: astrologer.isVerified
            })
          }
        } catch (error) {
          console.error(`Error fetching astrologer ${i}:`, error)
        }
      }
      
      return astrologers
    } catch (error) {
      console.error('Error fetching astrologers:', error)
      throw error
    }
  }

  async isAstrologerVerified(astrologerAddress: string) {
    const contract = this.getAstrologerManager()
    return await contract.isAstrologerVerified(astrologerAddress)
  }

  async getAstrologerId(astrologerAddress: string) {
    const contract = this.getAstrologerManager()
    return await contract.getAstrologerId(astrologerAddress)
  }

  async getAstrologerByWallet(walletAddress: string) {
    const contract = this.getAstrologerManager()
    try {
      return await contract.getAstrologerByWallet(walletAddress)
    } catch (error) {
      return null
    }
  }

  async verifyAstrologer(astrologerId: number) {
    await this.verifyNetwork()
    const contract = this.getAstrologerManager()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const tx = await contract.verifyAstrologer(astrologerId)
    return await tx.wait()
  }

  getPredictionMarket() {
    return this.getContract('PREDICTIONMARKET', PREDICTION_MARKET_ABI)
  }

  async createPrediction(
    title: string,
    description: string,
    endDate: number,
    stakeAmount: string
  ) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const stakeValue = ethers.parseEther(stakeAmount)
    
    const tx = await contract.createPrediction(
      title,
      description,
      endDate,
      { value: stakeValue }
    )

    return await tx.wait()
  }

  async stakeOnPrediction(predictionId: number, outcome: boolean, stakeAmount: string) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const stakeValue = ethers.parseEther(stakeAmount)
    
    const tx = await contract.voteOnPrediction(
      predictionId,
      outcome,
      { value: stakeValue }
    )

    return await tx.wait()
  }

  async resolvePrediction(predictionId: number) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const tx = await contract.resolvePrediction(predictionId)
    return await tx.wait()
  }

  async getPrediction(predictionId: number) {
    const contract = this.getWorldPredictionMarket()
    return await contract.getPrediction(predictionId)
  }

  async getAllPredictions() {
    const contract = this.getWorldPredictionMarket()
    return await contract.getActivePredictions()
  }

  // ReputationScorer Contract
  getReputationScorer() {
    return this.getContract('REPUTATIONSCORER', REPUTATION_SCORER_ABI)
  }

  async getReputationScore(address: string) {
    const contract = this.getReputationScorer()
    return await contract.getReputationScore(address)
  }

  async updateReputationScore(address: string, score: number) {
    const contract = this.getReputationScorer()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const tx = await contract.updateReputationScore(address, score)
    return await tx.wait()
  }

  getBuyTokenContract() {
    return this.getContract('BUYTOKENCONTRACT', BUY_TOKEN_CONTRACT_ABI)
  }

  async buyTokens(tokenContractAddress: string, amount: string) {
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const tokenData = await this.getTokenByContract(tokenContractAddress)
    const buyContract = new ethers.Contract(
      tokenData.buyContract,
      BUY_TOKEN_CONTRACT_ABI,
      this.signer
    )

    const amountValue = ethers.parseEther(amount)
    
    const tx = await buyContract.buyTokens(tokenContractAddress, { value: amountValue })
    return await tx.wait()
  }

  async getTokenPrice(tokenContractAddress: string) {
    // Get the correct BuyTokenContract for this specific token
    const tokenData = await this.getTokenByContract(tokenContractAddress)
    const buyContract = new ethers.Contract(
      tokenData.buyContract,
      BUY_TOKEN_CONTRACT_ABI,
      this.provider
    )
    return await buyContract.getCurrentPrice(tokenContractAddress)
  }

  async getTokenInfo(tokenContractAddress: string) {
    // Get the correct BuyTokenContract for this specific token
    const tokenData = await this.getTokenByContract(tokenContractAddress)
    const buyContract = new ethers.Contract(
      tokenData.buyContract,
      BUY_TOKEN_CONTRACT_ABI,
      this.provider
    )
    return await buyContract.getTokenInfo(tokenContractAddress)
  }

  async getTokenByContract(tokenContractAddress: string) {
    const contract = this.getAstroTokenLauncher()
    return await contract.getTokenByContract(tokenContractAddress)
  }

  // AstroTokenLauncher Contract
  getAstroTokenLauncher() {
    return this.getContract('ASTROTOKENLAUNCHER', ASTRO_TOKEN_LAUNCHER_ABI)
  }

  async launchToken(
    name: string,
    symbol: string,
    totalSupply: string,
    initialPrice: string,
    description: string
  ) {
    await this.verifyNetwork()
    const contract = this.getAstroTokenLauncher()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    // Get launch fee from contract
    const launchFee = await contract.launchFee()
    
    const tx = await contract.launchToken(
      name,
      symbol,
      ethers.parseEther(totalSupply),
      ethers.parseEther(initialPrice),
      description,
      { value: launchFee }
    )

    return await tx.wait()
  }

  async getTokenByAstrologer(astrologerAddress: string) {
    const contract = this.getAstroTokenLauncher()
    return await contract.getTokenByAstrologer(astrologerAddress)
  }

  async getAllActiveTokens() {
    const contract = this.getAstroTokenLauncher()
    return await contract.getAllActiveTokens()
  }

  async getLauncherTokenInfo(tokenId: number) {
    const contract = this.getAstroTokenLauncher()
    return await contract.getTokenInfo(tokenId)
  }

  async getUserToken(userAddress: string) {
    try {
      const contract = this.getAstroTokenLauncher()
      return await contract.getTokenByAstrologer(userAddress)
    } catch (err) {
      // Token not found for this astrologer
      return null
    }
  }

  // WorldPredictionMarket Contract
  getWorldPredictionMarket() {
    return this.getContract('WORLDPREDICTIONMARKET', WORLD_PREDICTION_MARKET_ABI)
  }

  async createWorldPrediction(
    title: string,
    description: string,
    deadline: number,
    stakeAmount: string
  ) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const stakeValue = ethers.parseEther(stakeAmount)
    
    const tx = await contract.createPrediction(
      title,
      description,
      deadline,
      { value: stakeValue }
    )

    return await tx.wait()
  }

  async voteOnWorldPrediction(predictionId: number, vote: boolean, stakeAmount: string) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const stakeValue = ethers.parseEther(stakeAmount)
    
    const tx = await contract.voteOnPrediction(predictionId, vote, { value: stakeValue })
    return await tx.wait()
  }

  async startDAOVoting(predictionId: number) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    const tx = await contract.startDAOVoting(predictionId)
    return await tx.wait()
  }

  async castDAOVote(predictionId: number, outcome: boolean, tokenId: number) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    const tx = await contract.castDAOVote(predictionId, outcome, tokenId)
    return await tx.wait()
  }

  async resolveWorldPrediction(predictionId: number) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    const tx = await contract.resolvePrediction(predictionId)
    return await tx.wait()
  }

  async claimWorldPredictionReward(predictionId: number) {
    await this.verifyNetwork()
    const contract = this.getWorldPredictionMarket()
    
    const tx = await contract.claimReward(predictionId)
    return await tx.wait()
  }

  async getWorldPrediction(predictionId: number) {
    const contract = this.getWorldPredictionMarket()
    return await contract.getPrediction(predictionId)
  }

  async getActivePredictions() {
    const contract = this.getWorldPredictionMarket()
    return await contract.getActivePredictions()
  }

  async getAstrologerPredictions(astrologerAddress: string) {
    const contract = this.getWorldPredictionMarket()
    return await contract.getAstrologerPredictions(astrologerAddress)
  }

  async getUserVotes(userAddress: string) {
    const contract = this.getWorldPredictionMarket()
    return await contract.getUserVotes(userAddress)
  }

  async getVote(predictionId: number, userAddress: string) {
    const contract = this.getWorldPredictionMarket()
    try {
      const voteData = await contract.getVote(predictionId, userAddress)
      return {
        hasVoted: voteData[0],
        vote: voteData[1],
        stakeAmount: voteData[2],
        rewardClaimed: voteData[3]
      }
    } catch (error) {
      console.log("Error getting vote:", error)
      return {
        hasVoted: false,
        vote: false,
        stakeAmount: 0,
        rewardClaimed: false
      }
    }
  }

  async getDAOVoteCounts(predictionId: number) {
    const contract = this.getWorldPredictionMarket()
    return await contract.getDAOVoteCounts(predictionId)
  }

  async getDAOVote(predictionId: number, userAddress: string) {
    const contract = this.getWorldPredictionMarket()
    try {
      const daoVoteData = await contract.getDAOVote(predictionId, userAddress)
      return {
        hasVoted: daoVoteData[0],
        vote: daoVoteData[1],
        tokenId: daoVoteData[2]
      }
    } catch (error) {
      console.log("Error getting DAO vote:", error)
      return {
        hasVoted: false,
        vote: false,
        tokenId: 0
      }
    }
  }

  async calculateVoterReward(predictionId: number, voterAddress: string) {
    const contract = this.getWorldPredictionMarket()
    return await contract.calculateVoterReward(predictionId, voterAddress)
  }

  // ZodiacDAO Contract
  getZodiacDAO() {
    return this.getContract('ZODIACDAO', ZODIAC_DAO_ABI)
  }

  async getUserDAOMemberships(userAddress: string) {
    const contract = this.getZodiacDAO()
    return await contract.getUserMemberships(userAddress)
  }

  async getDAOMembership(tokenId: number) {
    const contract = this.getZodiacDAO()
    return await contract.getMembership(tokenId)
  }

  async getZodiacDAOInfo(daoId: number) {
    const contract = this.getZodiacDAO()
    return await contract.getZodiacDAO(daoId)
  }

  async getDAOByZodiac(zodiacSign: number) {
    const contract = this.getZodiacDAO()
    return await contract.getDAOByZodiac(zodiacSign)
  }

  async joinZodiacDAO(zodiacSign: number, tokenURI: string, membershipPrice: string) {
    await this.verifyNetwork()
    const contract = this.getZodiacDAO()
    
    if (!this.signer) {
      throw new Error('Signer not available')
    }

    const priceValue = ethers.parseEther(membershipPrice)
    
    const tx = await contract.joinZodiacDAO(zodiacSign, tokenURI, { value: priceValue })
    return await tx.wait()
  }

  async leaveZodiacDAO(tokenId: number) {
    await this.verifyNetwork()
    const contract = this.getZodiacDAO()
    
    const tx = await contract.leaveZodiacDAO(tokenId)
    return await tx.wait()
  }

  // Utility functions
  async getBalance(address: string) {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }
    return await this.provider.getBalance(address)
  }

  async getTransactionReceipt(txHash: string) {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }
    return await this.provider.getTransactionReceipt(txHash)
  }

  formatEther(wei: ethers.BigNumberish) {
    return ethers.formatEther(wei)
  }

  parseEther(ether: string) {
    return ethers.parseEther(ether)
  }
}

// Export singleton instance
export const contractService = new ContractService()

// Testing utility functions - can be called from browser console
if (typeof window !== 'undefined') {
  // Example: window.verifyAstrologer(1)
  (window as any).verifyAstrologer = async (astrologerId: number) => {
    try {
      const result = await contractService.verifyAstrologer(astrologerId)
      console.log('Astrologer verified:', result)
      return result
    } catch (error) {
      console.error('Error verifying astrologer:', error)
      throw error
    }
  }
  
  // Example: window.getAstrologerId("0x123...")
  (window as any).getAstrologerId = async (walletAddress: string) => {
    try {
      const id = await contractService.getAstrologerId(walletAddress)
      console.log('Astrologer ID:', id.toString())
      return id
    } catch (error) {
      console.error('Error getting astrologer ID:', error)
      throw error
    }
  }
  
  // Example: window.verifyMyAstrologer("0x123...")
  (window as any).verifyMyAstrologer = async (walletAddress: string) => {
    try {
      const id = await contractService.getAstrologerId(walletAddress)
      const result = await contractService.verifyAstrologer(Number(id))
      console.log('Astrologer verified:', result)
      return result
    } catch (error) {
      console.error('Error verifying astrologer:', error)
      throw error
    }
  }
  
  // Debug function for token issues
  (window as any).debugTokenIssues = async (userAddress: string) => {
    try {
      console.log('🔍 Debugging token issues for:', userAddress)
      
      // Get user's token from launcher
      const tokenData = await contractService.getUserToken(userAddress)
      
      if (!tokenData) {
        console.log('❌ No token found for this user')
        console.log('💡 User needs to launch a token first on /astrologer-dashboard')
        return
      }
      
      console.log('✅ Token found in launcher:', {
        name: tokenData.name,
        symbol: tokenData.symbol,
        tokenContract: tokenData.tokenContract,
        buyContract: tokenData.buyContract,
        isActive: tokenData.isActive
      })
      
      // Check if token is registered in its specific BuyTokenContract
      try {
        const tokenInfo = await contractService.getTokenInfo(tokenData.tokenContract)
        console.log('✅ Token info from BuyTokenContract:', tokenInfo)
        
        if (tokenInfo.isActive) {
          const price = await contractService.getTokenPrice(tokenData.tokenContract)
          console.log('✅ Current token price:', ethers.formatEther(price), 'FLOW')
        } else {
          console.log('⚠️  Token exists but is marked as inactive')
        }
      } catch (error) {
        console.log('❌ Error getting token info from BuyTokenContract:', error)
        console.log('💡 Token might not be properly registered in its BuyTokenContract')
      }
      
    } catch (error) {
      console.error('❌ Error debugging token:', error)
    }
  }

  // Debug function for prediction creation issues
  (window as any).debugPredictionCreation = async (title: string, description: string, deadline: number, stakeAmount: string) => {
    try {
      console.log('🔍 Debugging prediction creation...')
      
      // Check if user is registered as astrologer
      const provider = new (window as any).ethereum ? new (window as any).ethers.BrowserProvider((window as any).ethereum) : null
      if (!provider) {
        console.error('❌ No ethereum provider found')
        return
      }
      
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      console.log('👤 User address:', userAddress)
      
      // Check if user is registered as astrologer
      try {
        const astrologer = await contractService.getAstrologerByWallet(userAddress)
        console.log('✅ User is registered as astrologer:', astrologer)
        console.log('🔒 Astrologer verified:', astrologer.isVerified)
        
        if (!astrologer.isVerified) {
          console.log('⚠️  ISSUE: Astrologer is not verified yet. This might be why prediction creation fails.')
          console.log('💡 To fix: Call window.verifyAstrologer(' + astrologer.id + ') or use the reputation DAO system')
        }
      } catch (error) {
        console.log('❌ ISSUE: User is not registered as astrologer')
        console.log('💡 To fix: Register as astrologer first on /astrologer-dashboard')
        return
      }
      
      // Check deadline
      const now = Math.floor(Date.now() / 1000)
      console.log('⏰ Current timestamp:', now)
      console.log('⏰ Deadline timestamp:', deadline)
      console.log('⏰ Deadline is in future:', deadline > now)
      
      if (deadline <= now) {
        console.log('⚠️  ISSUE: Deadline is in the past!')
      }
      
      // Check stake amount
      console.log('💰 Stake amount:', stakeAmount, 'FLOW')
      
      console.log('🎯 All checks completed!')
      
    } catch (error) {
      console.error('❌ Error debugging prediction creation:', error)
    }
  }
} 