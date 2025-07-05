"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Vote, AlertCircle, Loader2, Globe, Calendar, Target, Shield, Clock } from "lucide-react"
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

export default function VotePredictionPage({ params }: { params: { id: string } }) {
  const { authenticated, user } = usePrivy()
  const [prediction, setPrediction] = useState<WorldPrediction | null>(null)
  const [astrologer, setAstrologer] = useState<AstrologerData | null>(null)
  const [userCharts, setUserCharts] = useState<NFTChart[]>([])
  const [selectedChart, setSelectedChart] = useState<NFTChart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [voting, setVoting] = useState(false)
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null)
  const [stakeAmount, setStakeAmount] = useState("")

  const predictionId = parseInt(params.id)

  useEffect(() => {
    loadPredictionData()
  }, [predictionId])

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadUserCharts()
    }
  }, [authenticated, user])

  const loadPredictionData = async () => {
    try {
      setLoading(true)
      setError("")

      // Get prediction details
      const predictionData = await contractService.getWorldPrediction(predictionId)
      setPrediction(predictionData)

      // Get astrologer data
      try {
        const astrologerData = await contractService.getAstrologerByWallet(predictionData.astrologer)
        setAstrologer(astrologerData)
      } catch (err) {
        console.log("Astrologer not found")
      }

    } catch (err: any) {
      console.error("Error loading prediction:", err)
      setError(err.message || "Failed to load prediction")
    } finally {
      setLoading(false)
    }
  }

  const loadUserCharts = async () => {
    if (!user?.wallet?.address) return

    try {
      const charts = await contractService.getUserCharts(user.wallet.address)
      setUserCharts(charts)
      
      // Auto-select first chart if available
      if (charts.length > 0) {
        setSelectedChart(charts[0])
      }
    } catch (err) {
      console.log("Error loading user charts:", err)
    }
  }

  const handleVote = async () => {
    if (!user?.wallet?.address || !prediction || selectedVote === null || !stakeAmount) return

    try {
      setVoting(true)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      // Check minimum stake requirement
      const astrologerStakeEth = ethers.formatEther(prediction.astrologerStake)
      if (parseFloat(stakeAmount) < parseFloat(astrologerStakeEth)) {
        setError(`Minimum stake amount is ${astrologerStakeEth} FLOW (astrologer's stake amount)`)
        return
      }

      await contractService.voteOnWorldPrediction(predictionId, selectedVote, stakeAmount)

      // Redirect back to world predictions
      window.location.href = "/world-predictions"
    } catch (err: any) {
      console.error("Voting error:", err)
      setError(err.message || "Failed to submit vote")
    } finally {
      setVoting(false)
    }
  }

  const formatStake = (stake: string | number | bigint) => {
    // If it's already a BigInt, use it directly
    if (typeof stake === 'bigint') {
      return ethers.formatEther(stake)
    }
    
    // If it's a string, parse it as BigInt if it looks like a wei value
    if (typeof stake === 'string') {
      try {
        return ethers.formatEther(stake)
      } catch {
        return parseFloat(stake).toString()
      }
    }
    
    // If it's a number, convert to string
    return ethers.formatEther(stake.toString())
  }

  const formatTimeRemaining = (deadline: number | bigint) => {
    const now = Date.now()
    const deadlineNum = typeof deadline === 'bigint' ? Number(deadline) : deadline
    const deadlineMs = deadlineNum * 1000
    const remaining = deadlineMs - now

    if (remaining <= 0) return "Ended"

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getVotingPercentages = (prediction: WorldPrediction) => {
    const total = Number(prediction.yesVoterStake) + Number(prediction.noVoterStake)
    if (total === 0) return { yesPercentage: 50, noPercentage: 50 }
    
    const yesPercentage = (Number(prediction.yesVoterStake) / total) * 100
    const noPercentage = (Number(prediction.noVoterStake) / total) * 100
    
    return { yesPercentage: Math.round(yesPercentage), noPercentage: Math.round(noPercentage) }
  }

  const isExpired = prediction ? Date.now() > Number(prediction.deadline) * 1000 : false
  const canVote = userCharts.length > 0 && !isExpired && prediction && !prediction.isResolved

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading prediction...</p>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-red-400/20 backdrop-blur-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Prediction Not Found</h2>
            <p className="text-red-200 mb-6">The requested prediction could not be found.</p>
            <Link href="/world-predictions">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                Back to Predictions
              </Button>
            </Link>
          </CardContent>
        </Card>
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
        <Link href="/world-predictions">
          <Button variant="outline" className="border-purple-400/30 text-purple-200 hover:bg-purple-400/10">
            ← Back to Predictions
          </Button>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Vote on Prediction</h1>
          <p className="text-purple-200">
            Stake FLOW and vote on this astrological prediction to earn rewards
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

        {!authenticated && (
          <Card className="bg-blue-500/10 border-blue-400/20 backdrop-blur-sm mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-blue-200">Please connect your wallet to vote on this prediction</p>
            </CardContent>
          </Card>
        )}

        {/* Prediction Details */}
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge
                    variant="secondary"
                    className={`${
                      prediction.isResolved ? "bg-blue-600/20 text-blue-400" :
                      isExpired ? "bg-red-600/20 text-red-400" :
                      "bg-green-600/20 text-green-400"
                    }`}
                  >
                    {prediction.isResolved ? "Resolved" : isExpired ? "Voting Ended" : "Active"}
                  </Badge>
                  {prediction.daoVotingActive && (
                    <Badge className="bg-purple-600/20 text-purple-400">
                      DAO Voting
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-white text-xl mb-2">{prediction.title}</CardTitle>
                <CardDescription className="text-purple-200">{prediction.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Astrologer Info */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Astrologer</p>
                  <p className="text-white font-semibold text-lg">{astrologer?.name || "Unknown"}</p>
                  <p className="text-purple-300 text-sm">{astrologer?.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Stake</p>
                  <p className="text-gold-400 font-bold text-lg">{formatStake(prediction.astrologerStake)} FLOW</p>
                </div>
              </div>
            </div>

            {/* Voting Status - Commit/Reveal Style */}
            <div className="space-y-4">
              {!isExpired && !prediction.isResolved ? (
                /* Active Voting - Hide Results */
                <div className="bg-purple-600/10 border border-purple-400/20 rounded-lg p-6">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-white font-semibold text-lg mb-2">Voting in Progress</h4>
                    <p className="text-purple-200 text-sm mb-4">
                      Current voting results are hidden to prevent bias. Results will be revealed when voting ends.
                    </p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-purple-300 text-sm">
                        Total Stake: {formatStake(prediction.totalVoterStake)} FLOW • {Number(prediction.totalVoters)} voters participating
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Voting Ended or Resolved - Show Results */
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Final Community Sentiment</h4>
                  
                  {(() => {
                    const { yesPercentage, noPercentage } = getVotingPercentages(prediction)
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-white">YES (Will Happen)</span>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold">{yesPercentage}%</p>
                            <p className="text-white/70 text-sm">{formatStake(prediction.yesVoterStake)} FLOW</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${yesPercentage}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-white">NO (Won't Happen)</span>
                          </div>
                          <div className="text-right">
                            <p className="text-red-400 font-bold">{noPercentage}%</p>
                            <p className="text-white/70 text-sm">{formatStake(prediction.noVoterStake)} FLOW</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${noPercentage}%` }}
                          ></div>
                        </div>

                        <div className="text-center text-sm text-purple-200">
                          Total: {formatStake(prediction.totalVoterStake)} FLOW • {Number(prediction.totalVoters)} voters
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Timing */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">
                  Voting deadline: {new Date(Number(prediction.deadline) * 1000).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">
                  Time remaining: {formatTimeRemaining(prediction.deadline)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Validation */}
        {authenticated && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-6 h-6 mr-2 text-gold-400" />
                AstroChart NFT Validation
              </CardTitle>
              <CardDescription className="text-purple-200">
                Only users with minted AstroChart NFTs can vote on predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userCharts.length === 0 ? (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="text-orange-200 font-semibold">No AstroChart NFT Found</p>
                      <p className="text-orange-300 text-sm">
                        You need to mint an AstroChart NFT to vote on predictions.{" "}
                        <Link href="/mint-chart" className="text-orange-400 hover:underline">
                          Mint yours here
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-green-200 font-semibold">
                        AstroChart NFT Verified ({userCharts.length} chart{userCharts.length > 1 ? 's' : ''})
                      </p>
                      <p className="text-green-300 text-sm">
                        Using chart: {selectedChart?.name} (Token #{selectedChart?.tokenId})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Voting Interface */}
        {authenticated && canVote && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Vote className="w-6 h-6 mr-2 text-gold-400" />
                Cast Your Vote
              </CardTitle>
              <CardDescription className="text-purple-200">
                Stake FLOW on your prediction to earn rewards if you're correct
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vote Selection */}
              <div className="space-y-4">
                <Label className="text-white text-lg font-semibold">Your Prediction</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedVote(true)}
                    className={`p-6 rounded-lg border cursor-pointer transition-all ${
                      selectedVote === true
                        ? "border-green-400 bg-green-400/10"
                        : "border-purple-400/20 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <h4 className="text-white font-semibold text-lg mb-2">YES</h4>
                      <p className="text-green-400 text-sm">This will happen</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedVote(false)}
                    className={`p-6 rounded-lg border cursor-pointer transition-all ${
                      selectedVote === false
                        ? "border-red-400 bg-red-400/10"
                        : "border-purple-400/20 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-center">
                      <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
                      <h4 className="text-white font-semibold text-lg mb-2">NO</h4>
                      <p className="text-red-400 text-sm">This won't happen</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stake Amount */}
              <div className="space-y-2">
                <Label htmlFor="stakeAmount" className="text-white">
                  Stake Amount (FLOW)
                </Label>
                <Input
                  id="stakeAmount"
                  type="number"
                  placeholder={`Minimum: ${formatStake(prediction.astrologerStake)}`}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                />
                <div className="flex space-x-2">
                  {[
                    formatStake(prediction.astrologerStake),
                    (parseFloat(formatStake(prediction.astrologerStake)) * 2).toString(),
                    (parseFloat(formatStake(prediction.astrologerStake)) * 5).toString(),
                    (parseFloat(formatStake(prediction.astrologerStake)) * 10).toString()
                  ].map((amount, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-white/5 rounded text-purple-200 text-sm hover:bg-white/10 transition-colors"
                      onClick={() => setStakeAmount(amount)}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <p className="text-purple-300 text-sm">
                  Minimum stake: {formatStake(prediction.astrologerStake)} FLOW (astrologer's stake amount)
                </p>
              </div>

              {/* Vote Summary */}
              {selectedVote !== null && stakeAmount && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Vote Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Your prediction:</span>
                      <span className={`font-semibold ${selectedVote ? "text-green-400" : "text-red-400"}`}>
                        {selectedVote ? "YES (Will Happen)" : "NO (Won't Happen)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Stake amount:</span>
                      <span className="text-white">{stakeAmount} FLOW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Potential reward:</span>
                      <span className="text-gold-400">
                        Pro-rata share of losing side's stakes
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                <p className="text-blue-200 text-sm">
                  <strong>How voting works:</strong> Your stake will be locked until the prediction is resolved by the DAO. 
                  If you vote correctly, you'll receive a pro-rata share of the losing side's stakes plus your original stake back.
                </p>
              </div>

              <Button
                onClick={handleVote}
                disabled={voting || selectedVote === null || !stakeAmount || parseFloat(stakeAmount) < parseFloat(formatStake(prediction.astrologerStake))}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                size="lg"
              >
                {voting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Vote...
                  </>
                ) : (
                  <>
                    <Vote className="w-5 h-5 mr-2" />
                    Submit Vote & Stake
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status Messages */}
        {authenticated && !canVote && (
          <Card className="bg-orange-500/10 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Voting Not Available</h3>
              <p className="text-orange-200">
                {userCharts.length === 0 
                  ? "You need an AstroChart NFT to vote on predictions."
                  : isExpired 
                    ? "Voting has ended for this prediction."
                    : prediction?.isResolved
                      ? "This prediction has already been resolved."
                      : "You cannot vote on this prediction at this time."
                }
              </p>
              {userCharts.length === 0 && (
                <Link href="/mint-chart" className="mt-4 inline-block">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    Mint AstroChart NFT
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 