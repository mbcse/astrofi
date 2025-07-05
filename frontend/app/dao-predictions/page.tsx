"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Vote, AlertCircle, Loader2, Globe, Calendar, Target, Shield, Gavel, Gift, CheckCircle } from "lucide-react"
import Link from "next/link"
import { contractService } from "@/lib/contracts"
import { usePrivy } from "@privy-io/react-auth"
import { ethers } from "ethers"

interface WorldPrediction {
  id: number
  astrologer: string
  astrologerId: number
  title: string
  description: string
  deadline: number
  astrologerStake: number
  totalVoterStake: number
  yesVoterStake: number
  noVoterStake: number
  totalVoters: number
  isResolved: boolean
  outcome: boolean
  daoVotingActive: boolean
  createdAt: number
  resolvedAt: number
}

interface AstrologerData {
  id: number
  wallet: string
  name: string
  description: string
  specialty: string
  experience: number
  reputation: number
  totalPredictions: number
  accuratePredictions: number
  tokenContract: number
  isVerified: boolean
  isActive: boolean
  registeredAt: number
  lastActive: number
}

interface NFTChart {
  tokenId: string
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
  chartData: string
  chartImage: string
  tokenURI: string
  mintedAt: string
  owner: string
}

interface DAOVoteCounts {
  yesVotes: number
  noVotes: number
  totalVotes: number
}

interface PredictionWithDetails {
  prediction: WorldPrediction
  astrologer: AstrologerData | null
  daoVoteCounts: DAOVoteCounts | null
  userHasDAOVoted: boolean
  userRewardAmount: string
  canClaimReward: boolean
}

export default function DAOPredictionsPage() {
  const { authenticated, user } = usePrivy()
  const [predictions, setPredictions] = useState<PredictionWithDetails[]>([])
  const [userCharts, setUserCharts] = useState<NFTChart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [votingOnPrediction, setVotingOnPrediction] = useState<number | null>(null)
  const [claimingReward, setClaimingReward] = useState<number | null>(null)
  const [startingDAOVoting, setStartingDAOVoting] = useState<number | null>(null)
  const [resolvingPrediction, setResolvingPrediction] = useState<number | null>(null)

  useEffect(() => {
    loadDAOPredictions()
    if (authenticated && user?.wallet?.address) {
      loadUserCharts()
    }
  }, [authenticated, user])

  const loadDAOPredictions = async () => {
    try {
      setLoading(true)
      setError("")

      // Get all predictions that need DAO resolution or have rewards to claim
      const activePredictionIds = await contractService.getActivePredictions()
      const predictionsWithDetails: PredictionWithDetails[] = []

      console.log("🔍 Total predictions found:", activePredictionIds.length)

      for (let i = 0; i < activePredictionIds.length; i++) {
        try {
          const predictionId = activePredictionIds[i]
          
          // Get prediction details
          const prediction = await contractService.getWorldPrediction(predictionId)
          
          const isExpired = Date.now() > Number(prediction.deadline) * 1000
          const now = new Date().toLocaleString()
          const deadline = new Date(Number(prediction.deadline) * 1000).toLocaleString()
          
          console.log(`📊 Prediction ${predictionId}:`, {
            title: prediction.title,
            isExpired,
            isResolved: prediction.isResolved,
            daoVotingActive: prediction.daoVotingActive,
            now,
            deadline
          })

          // TEMPORARILY SHOW ALL PREDICTIONS FOR DEBUGGING
          // TODO: Restore original filter after debugging
          // Original filter: if (!isExpired && !prediction.isResolved) continue

          // Get astrologer data
          let astrologer = null
          try {
            astrologer = await contractService.getAstrologerByWallet(prediction.astrologer)
          } catch (err) {
            console.log("Astrologer not found for prediction:", predictionId)
          }

          // Get DAO vote counts
          let daoVoteCounts = null
          try {
            daoVoteCounts = await contractService.getDAOVoteCounts(predictionId)
          } catch (err) {
            console.log("Error getting DAO vote counts:", err)
          }

          // Check user's status
          let userHasDAOVoted = false
          let userRewardAmount = "0"
          let canClaimReward = false

          if (authenticated && user?.wallet?.address) {
            try {
              // Check if user has cast DAO vote
              if (prediction.daoVotingActive || prediction.isResolved) {
                try {
                  const daoVote = await contractService.getDAOVote(predictionId, user.wallet.address)
                  userHasDAOVoted = daoVote.hasVoted
                } catch (err) {
                  console.log("Error checking DAO vote:", err)
                }
              }
              
              // Check if user can claim reward
              if (prediction.isResolved) {
                userRewardAmount = await contractService.calculateVoterReward(predictionId, user.wallet.address)
                canClaimReward = parseFloat(ethers.formatEther(userRewardAmount.toString())) > 0
              }
            } catch (err) {
              console.log("Error checking user status:", err)
            }
          }

          predictionsWithDetails.push({
            prediction,
            astrologer,
            daoVoteCounts,
            userHasDAOVoted,
            userRewardAmount,
            canClaimReward
          })
        } catch (err: any) {
          console.log("Error loading prediction:", err)
        }
      }

      setPredictions(predictionsWithDetails)
    } catch (err: any) {
      console.error("Error loading DAO predictions:", err)
      setError(err.message || "Failed to load DAO predictions")
    } finally {
      setLoading(false)
    }
  }

  const loadUserCharts = async () => {
    if (!user?.wallet?.address) return

    try {
      const charts = await contractService.getUserCharts(user.wallet.address)
      setUserCharts(charts)
    } catch (err) {
      console.log("Error loading user charts:", err)
    }
  }

  const handleDAOVote = async (predictionId: number, outcome: boolean) => {
    if (!user?.wallet?.address || userCharts.length === 0) return

    try {
      setVotingOnPrediction(predictionId)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      // Use first NFT for DAO voting
      const tokenId = parseInt(userCharts[0].tokenId)
      
      await contractService.castDAOVote(predictionId, outcome, tokenId)

      // Reload predictions
      await loadDAOPredictions()
    } catch (err: any) {
      console.error("DAO voting error:", err)
      setError(err.message || "Failed to cast DAO vote")
    } finally {
      setVotingOnPrediction(null)
    }
  }

  const handleStartDAOVoting = async (predictionId: number) => {
    try {
      setStartingDAOVoting(predictionId)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      await contractService.startDAOVoting(predictionId)

      // Reload predictions
      await loadDAOPredictions()
    } catch (err: any) {
      console.error("Start DAO voting error:", err)
      setError(err.message || "Failed to start DAO voting")
    } finally {
      setStartingDAOVoting(null)
    }
  }

  const handleResolvePrediction = async (predictionId: number) => {
    try {
      setResolvingPrediction(predictionId)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      await contractService.resolveWorldPrediction(predictionId)

      // Reload predictions
      await loadDAOPredictions()
    } catch (err: any) {
      console.error("Resolve prediction error:", err)
      setError(err.message || "Failed to resolve prediction")
    } finally {
      setResolvingPrediction(null)
    }
  }

  const handleClaimReward = async (predictionId: number) => {
    if (!user?.wallet?.address) return

    try {
      setClaimingReward(predictionId)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      await contractService.claimWorldPredictionReward(predictionId)

      // Reload predictions
      await loadDAOPredictions()
    } catch (err: any) {
      console.error("Claim reward error:", err)
      setError(err.message || "Failed to claim reward")
    } finally {
      setClaimingReward(null)
    }
  }

  const formatStake = (stake: string | number | bigint) => {
    if (typeof stake === 'bigint') {
      return ethers.formatEther(stake)
    }
    if (stake === null || stake === undefined) {
      return "0.0000"
    }
    const stakeNum = typeof stake === 'string' ? parseFloat(stake) : stake
    if (isNaN(stakeNum)) {
      return "0.0000"
    }
    return ethers.formatEther(stakeNum.toString())
  }

  const getVotingPercentages = (prediction: WorldPrediction) => {
    const yesStake = Number(prediction.yesVoterStake) || 0
    const noStake = Number(prediction.noVoterStake) || 0
    const total = yesStake + noStake
    
    if (total === 0 || isNaN(total)) return { yesPercentage: 50, noPercentage: 50 }
    
    const yesPercentage = (yesStake / total) * 100
    const noPercentage = (noStake / total) * 100
    
    if (isNaN(yesPercentage) || isNaN(noPercentage)) {
      return { yesPercentage: 50, noPercentage: 50 }
    }
    
    return { yesPercentage: Math.round(yesPercentage), noPercentage: Math.round(noPercentage) }
  }

  const getDAOVotingPercentages = (daoVoteCounts: DAOVoteCounts | null) => {
    if (!daoVoteCounts) return { yesPercentage: 50, noPercentage: 50 }
    
    const totalVotes = Number(daoVoteCounts.totalVotes) || 0
    if (totalVotes === 0 || isNaN(totalVotes)) return { yesPercentage: 50, noPercentage: 50 }
    
    const yesVotes = Number(daoVoteCounts.yesVotes) || 0
    const noVotes = Number(daoVoteCounts.noVotes) || 0
    
    const yesPercentage = (yesVotes / totalVotes) * 100
    const noPercentage = (noVotes / totalVotes) * 100
    
    if (isNaN(yesPercentage) || isNaN(noPercentage)) {
      return { yesPercentage: 50, noPercentage: 50 }
    }
    
    return { yesPercentage: Math.round(yesPercentage), noPercentage: Math.round(noPercentage) }
  }

  const hasNFT = userCharts.length > 0
  const canParticipateInDAO = authenticated && hasNFT

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading DAO predictions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 lg:p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-gold-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">AstroFi</span>
        </Link>
        <div className="flex space-x-4">
          <Link href="/world-predictions">
            <Button variant="outline" className="border-purple-400/30 text-purple-200 hover:bg-purple-400/10">
              World Predictions
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AstroFi DAO</h1>
          <p className="text-purple-200 text-lg">
            DAO members resolve predictions and distribute rewards fairly
          </p>
        </div>

        {error && (
          <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-sm mb-8">
            <CardContent className="p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-sm mb-8">
          <CardContent className="p-4">
            <h4 className="text-blue-200 font-semibold mb-2">🔍 Debug Info</h4>
            <div className="text-blue-200 text-sm space-y-1">
              <p>• Total predictions loaded: {predictions.length}</p>
              <p>• User authenticated: {authenticated ? "Yes" : "No"}</p>
              <p>• User has NFT: {hasNFT ? "Yes" : "No"}</p>
              <p>• Loading state: {loading ? "Loading..." : "Complete"}</p>
              {predictions.length > 0 && (
                <div className="mt-2">
                  <p>• Prediction statuses:</p>
                                     {predictions.map((p, i) => {
                     const isExpired = Date.now() > Number(p.prediction.deadline) * 1000
                     return (
                       <p key={i} className="ml-4 text-xs">
                         #{p.prediction.id}: {p.prediction.title.substring(0, 30)}... - 
                         {isExpired ? " EXPIRED" : " ACTIVE"} - 
                         {p.prediction.isResolved ? " RESOLVED" : " UNRESOLVED"} - 
                         {p.prediction.daoVotingActive ? " DAO VOTING" : " NO DAO VOTING"}
                       </p>
                     )
                   })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!authenticated && (
          <Card className="bg-blue-500/10 border-blue-400/20 backdrop-blur-sm mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-blue-200">Please connect your wallet to participate in DAO governance</p>
            </CardContent>
          </Card>
        )}

        {authenticated && !hasNFT && (
          <Card className="bg-orange-500/10 border-orange-500/20 backdrop-blur-sm mb-8">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">AstroChart NFT Required</h3>
              <p className="text-orange-200 mb-4">
                You need an AstroChart NFT to participate in DAO voting and claim rewards.
              </p>
              <Link href="/mint-chart">
                <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white">
                  Mint AstroChart NFT
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Gavel className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.filter(p => p.prediction.daoVotingActive).length}
              </p>
              <p className="text-purple-200 text-sm">Pending DAO Votes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.filter(p => p.prediction.isResolved).length}
              </p>
              <p className="text-purple-200 text-sm">Resolved Predictions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.filter(p => p.canClaimReward).length}
              </p>
              <p className="text-purple-200 text-sm">Rewards Available</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.reduce((acc, p) => {
                  const reward = parseFloat(formatStake(p.userRewardAmount))
                  return acc + (isNaN(reward) ? 0 : reward)
                }, 0).toFixed(4)}
              </p>
              <p className="text-purple-200 text-sm">Your Total Rewards (FLOW)</p>
            </CardContent>
          </Card>
        </div>

        {/* Predictions Grid */}
        {predictions.length === 0 ? (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Gavel className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-semibold mb-2">No DAO Actions Available</h3>
              <p className="text-purple-200 mb-6">
                There are currently no predictions requiring DAO resolution or rewards to claim.
              </p>
              <Link href="/world-predictions">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  View All Predictions
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-1 gap-8">
            {predictions.map((predictionWithDetails) => {
              const { prediction, astrologer, daoVoteCounts, userHasDAOVoted, userRewardAmount, canClaimReward } = predictionWithDetails
              const { yesPercentage, noPercentage } = getVotingPercentages(prediction)
              const isExpired = Date.now() > Number(prediction.deadline) * 1000
              const needsDAOResolution = isExpired && !prediction.isResolved && !prediction.daoVotingActive
              
              // Calculate when DAO voting period ends: deadline + 60 seconds
              const daoVotingEndTime = (Number(prediction.deadline) + 60) * 1000
              const currentTime = Date.now()
              const canResolve = prediction.daoVotingActive && !prediction.isResolved && (currentTime > daoVotingEndTime)
              
              // Enhanced debug logging
              console.log(`Prediction ${prediction.id}: {title: '${prediction.title}', deadline: ${new Date(Number(prediction.deadline) * 1000).toLocaleString()}, daoVotingEndTime: ${new Date(daoVotingEndTime).toLocaleString()}, currentTime: ${new Date(currentTime).toLocaleString()}, canResolve: ${canResolve}, daoVotingActive: ${prediction.daoVotingActive}, isResolved: ${prediction.isResolved}}`);

              return (
                <Card
                  key={prediction.id}
                  className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            variant="secondary"
                            className={`${
                              prediction.isResolved ? "bg-blue-600/20 text-blue-400" :
                              prediction.daoVotingActive ? "bg-purple-600/20 text-purple-400" :
                              needsDAOResolution ? "bg-orange-600/20 text-orange-400" :
                              "bg-gray-600/20 text-gray-400"
                            }`}
                          >
                            {prediction.isResolved ? "Resolved" :
                             prediction.daoVotingActive ? "DAO Voting Active" :
                             needsDAOResolution ? "Needs DAO Resolution" : "Voting Ended"}
                          </Badge>
                          {canClaimReward && (
                            <Badge className="bg-gold-600/20 text-gold-400">
                              Reward Available
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-white text-lg mb-2">{prediction.title}</CardTitle>
                        <CardDescription className="text-purple-200">{prediction.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Astrologer Info */}
                    <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-3 border border-purple-400/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-sm">Astrologer</p>
                          <p className="text-white font-semibold">{astrologer?.name || "Unknown"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/70 text-sm">Stake</p>
                          <p className="text-gold-400 font-bold">{formatStake(prediction.astrologerStake)} FLOW</p>
                        </div>
                      </div>
                    </div>

                    {/* Community Voting Results */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">Community Voting Results</span>
                        <span className="text-purple-200 text-sm">
                          {formatStake(prediction.totalVoterStake)} FLOW • {prediction.totalVoters} voters
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-white">YES</span>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold">{yesPercentage}%</p>
                            <p className="text-white/70 text-sm">{formatStake(prediction.yesVoterStake)} FLOW</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${yesPercentage}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-white">NO</span>
                          </div>
                          <div className="text-right">
                            <p className="text-red-400 font-bold">{noPercentage}%</p>
                            <p className="text-white/70 text-sm">{formatStake(prediction.noVoterStake)} FLOW</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${noPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* DAO Voting Section */}
                    {(prediction.daoVotingActive || prediction.isResolved) && daoVoteCounts && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-semibold">DAO Resolution</span>
                          <span className="text-purple-200 text-sm">
                            {Number(daoVoteCounts?.totalVotes || 0)} DAO votes
                          </span>
                        </div>

                        {(() => {
                          const { yesPercentage: daoYesPercentage, noPercentage: daoNoPercentage } = getDAOVotingPercentages(daoVoteCounts)
                          return (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-white">Prediction Correct (YES)</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-green-400 font-bold">{daoYesPercentage}%</p>
                                  <p className="text-white/70 text-sm">{Number(daoVoteCounts?.yesVotes || 0)} votes</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${daoYesPercentage}%` }}
                                ></div>
                              </div>

                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-white">Prediction Incorrect (NO)</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-red-400 font-bold">{daoNoPercentage}%</p>
                                  <p className="text-white/70 text-sm">{Number(daoVoteCounts?.noVotes || 0)} votes</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-red-500 h-2 rounded-full" 
                                  style={{ width: `${daoNoPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })()}

                        {prediction.isResolved && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                            <p className="text-blue-200">
                              <strong>Final Outcome:</strong> Prediction was {prediction.outcome ? "CORRECT" : "INCORRECT"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Start DAO Voting */}
                      {needsDAOResolution && authenticated && (
                        <Button
                          onClick={() => handleStartDAOVoting(prediction.id)}
                          disabled={startingDAOVoting === prediction.id}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                        >
                          {startingDAOVoting === prediction.id ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Starting DAO Voting...
                            </>
                          ) : (
                            <>
                              <Gavel className="w-5 h-5 mr-2" />
                              Start DAO Voting
                            </>
                          )}
                        </Button>
                      )}

                      {/* Resolve Prediction */}
                      {canResolve && authenticated && (
                        <Button
                          onClick={() => handleResolvePrediction(prediction.id)}
                          disabled={resolvingPrediction === prediction.id}
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                        >
                          {resolvingPrediction === prediction.id ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Resolve Prediction
                            </>
                          )}
                        </Button>
                      )}

                      {/* DAO Voting */}
                      {prediction.daoVotingActive && canParticipateInDAO && !userHasDAOVoted && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleDAOVote(prediction.id, true)}
                            disabled={votingOnPrediction === prediction.id}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                          >
                            {votingOnPrediction === prediction.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <TrendingUp className="w-4 h-4 mr-2" />
                            )}
                            Vote Correct
                          </Button>
                          <Button
                            onClick={() => handleDAOVote(prediction.id, false)}
                            disabled={votingOnPrediction === prediction.id}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                          >
                            {votingOnPrediction === prediction.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-2" />
                            )}
                            Vote Incorrect
                          </Button>
                        </div>
                      )}

                      {/* Reward Claiming */}
                      {canClaimReward && (
                        <Button
                          onClick={() => handleClaimReward(prediction.id)}
                          disabled={claimingReward === prediction.id}
                          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                        >
                          {claimingReward === prediction.id ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <Gift className="w-5 h-5 mr-2" />
                              Claim Reward ({formatStake(userRewardAmount)} FLOW)
                            </>
                          )}
                        </Button>
                      )}

                      {/* Status Messages */}
                      {userHasDAOVoted && prediction.daoVotingActive && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                          <p className="text-blue-200">You have already voted on this prediction</p>
                        </div>
                      )}

                      {needsDAOResolution && !authenticated && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                          <p className="text-orange-200">This prediction needs DAO voting to be started. Connect your wallet to start the process.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Information Card */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">How DAO Governance Works</h3>
              <div className="text-left space-y-3 text-purple-200">
                <p>• <strong>Prediction Resolution:</strong> When voting ends, DAO members determine if predictions came true</p>
                <p>• <strong>Fair Voting:</strong> Only AstroChart NFT holders can participate in DAO decisions</p>
                <p>• <strong>Reward Distribution:</strong> Winners receive pro-rata shares of the losing side's stakes</p>
                <p>• <strong>Astrologer Incentives:</strong> Correct predictions earn 5% of the total pot plus reputation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 