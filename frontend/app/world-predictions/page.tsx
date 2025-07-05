"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, TrendingUp, Clock, Users, DollarSign, Plus, AlertCircle, Loader2, Globe, Calendar, Target } from "lucide-react"
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

interface PredictionWithDetails {
  prediction: WorldPrediction
  astrologer: AstrologerData | null
  userVote: {
    hasVoted: boolean
    vote: boolean
    stakeAmount: number
    rewardClaimed: boolean
  } | null
  canVote: boolean
  hasNFT: boolean
}

export default function WorldPredictionsPage() {
  const { authenticated, user } = usePrivy()
  const [predictions, setPredictions] = useState<PredictionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isAstrologer, setIsAstrologer] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Create prediction form state
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    deadline: "",
    stakeAmount: "1"
  })

  useEffect(() => {
    loadPredictions()
    if (authenticated && user?.wallet?.address) {
      checkAstrologerStatus()
    }
  }, [authenticated, user])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      setError("")

      // Get all active predictions
      const activePredictionIds = await contractService.getActivePredictions()
      const predictionsWithDetails: PredictionWithDetails[] = []

      for (let i = 0; i < activePredictionIds.length; i++) {
        try {
          const predictionId = activePredictionIds[i]
          
          // Get prediction details
          const prediction = await contractService.getWorldPrediction(predictionId)
          
          // Get astrologer data
          let astrologer = null
          try {
            astrologer = await contractService.getAstrologerByWallet(prediction.astrologer)
          } catch (err) {
            console.log("Astrologer not found for prediction:", predictionId)
          }

          // Check if user has voted
          let userVote = null
          let canVote = false
          let hasNFT = false

          if (authenticated && user?.wallet?.address) {
            try {
              // Check if user has AstroChart NFT
              hasNFT = await contractService.hasAstroChartNFT(user.wallet.address)
              
              // Get user's vote
              userVote = await contractService.getVote(predictionId, user.wallet.address)
              
              // User can vote if they have NFT, haven't voted, and prediction is not resolved
              canVote = hasNFT && !userVote.hasVoted && !prediction.isResolved && Date.now() < Number(prediction.deadline) * 1000
            } catch (err) {
              console.log("Error checking user vote status:", err)
            }
          }

          predictionsWithDetails.push({
            prediction,
            astrologer,
            userVote,
            canVote,
            hasNFT
          })
        } catch (err) {
          console.log("Error loading prediction:", err)
        }
      }

      setPredictions(predictionsWithDetails)
    } catch (err: any) {
      console.error("Error loading predictions:", err)
      setError(err.message || "Failed to load predictions")
    } finally {
      setLoading(false)
    }
  }

  const checkAstrologerStatus = async () => {
    if (!user?.wallet?.address) return

    try {
      const verified = await contractService.isAstrologerVerified(user.wallet.address)
      setIsAstrologer(verified)
    } catch (err) {
      console.log("Error checking astrologer status:", err)
    }
  }

  const handleCreatePrediction = async () => {
    if (!user?.wallet?.address) return

    try {
      setCreating(true)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      // Convert deadline to timestamp
      const deadlineTimestamp = Math.floor(new Date(createForm.deadline).getTime() / 1000)

      await contractService.createWorldPrediction(
        createForm.title,
        createForm.description,
        deadlineTimestamp,
        createForm.stakeAmount
      )

      // Reset form and reload predictions
      setCreateForm({
        title: "",
        description: "",
        deadline: "",
        stakeAmount: "1"
      })
      setShowCreateForm(false)
      await loadPredictions()
    } catch (err: any) {
      console.error("Create prediction error:", err)
      setError(err.message || "Failed to create prediction")
    } finally {
      setCreating(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading world predictions...</p>
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
          {isAstrologer && (
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Prediction
            </Button>
          )}
          <Link href="/vote-predictions">
            <Button variant="outline" className="border-purple-400/30 text-purple-200 hover:bg-purple-400/10">
              Vote on Predictions
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">World Predictions</h1>
          <p className="text-purple-200 text-lg">
            Astrologers stake FLOW on their global predictions. Vote and earn rewards when they're correct.
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

        {/* Create Prediction Form */}
        {showCreateForm && isAstrologer && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-6 h-6 mr-2 text-gold-400" />
                Create World Prediction
              </CardTitle>
              <CardDescription className="text-purple-200">
                Stake FLOW on your astrological prediction about global events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Prediction Title</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  placeholder="e.g., Bitcoin will reach $100K during next Mercury retrograde"
                  className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Provide your astrological analysis and reasoning..."
                  className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-white">Prediction Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({...createForm, deadline: e.target.value})}
                    className="bg-white/10 border-purple-400/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stakeAmount" className="text-white">Stake Amount (FLOW)</Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    value={createForm.stakeAmount}
                    onChange={(e) => setCreateForm({...createForm, stakeAmount: e.target.value})}
                    placeholder="1.0"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                <p className="text-blue-200 text-sm">
                  <strong>Note:</strong> Your stake will be locked until the prediction is resolved. 
                  If correct, you'll earn 5% of the total voting pot. If incorrect, your reputation will be affected.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleCreatePrediction}
                  disabled={creating || !createForm.title || !createForm.description || !createForm.deadline}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Create Prediction
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="border-purple-400/30 text-purple-200 hover:bg-purple-400/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{predictions.length}</p>
              <p className="text-purple-200 text-sm">Active Predictions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.reduce((acc, p) => {
                  const totalStakeForPrediction = BigInt(p.prediction.totalVoterStake) + BigInt(p.prediction.astrologerStake)
                  return acc + parseFloat(formatStake(totalStakeForPrediction))
                }, 0).toFixed(2)}
              </p>
              <p className="text-purple-200 text-sm">Total FLOW Staked</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.reduce((acc, p) => acc + Number(p.prediction.totalVoters), 0)}
              </p>
              <p className="text-purple-200 text-sm">Total Voters</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {predictions.filter(p => !p.prediction.isResolved).length}
              </p>
              <p className="text-purple-200 text-sm">Awaiting Resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Predictions Grid */}
        {predictions.length === 0 ? (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-semibold mb-2">No World Predictions</h3>
              <p className="text-purple-200 mb-6">
                There are currently no active world predictions. 
                {isAstrologer ? " Create the first one!" : " Check back later or become an astrologer to create predictions."}
              </p>
              {!isAstrologer && (
                <Link href="/astrologer-dashboard">
                  <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white">
                    Become an Astrologer
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {predictions.map((predictionWithDetails) => {
              const { prediction, astrologer, userVote, canVote, hasNFT } = predictionWithDetails
              const { yesPercentage, noPercentage } = getVotingPercentages(prediction)
              const timeRemaining = formatTimeRemaining(prediction.deadline)
              const isExpired = Date.now() > Number(prediction.deadline) * 1000

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

                    {/* Voting Status - Commit/Reveal Style */}
                    <div className="space-y-4">
                      {!isExpired && !prediction.isResolved ? (
                        /* Active Voting - Hide Results */
                        <div className="bg-purple-600/10 border border-purple-400/20 rounded-lg p-4">
                          <div className="text-center">
                            <h4 className="text-white font-semibold mb-2">Voting in Progress</h4>
                            <p className="text-purple-200 text-sm mb-3">
                              Results hidden until voting ends to prevent bias
                            </p>
                            <p className="text-purple-300 text-sm">
                              {formatStake(prediction.totalVoterStake)} FLOW staked • {Number(prediction.totalVoters)} voters
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Voting Ended or Resolved - Show Results */
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">Final Community Sentiment</span>
                            <span className="text-purple-200 text-sm">
                              {formatStake(prediction.totalVoterStake)} FLOW • {Number(prediction.totalVoters)} voters
                            </span>
                          </div>

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
                                className="bg-green-500 h-2 rounded-full" 
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
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${noPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timing and Status */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-white/70">
                          {isExpired ? "Ended" : "Time remaining:"} {timeRemaining}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-white/70">
                          Created {new Date(Number(prediction.createdAt) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* User Status and Actions */}
                    {authenticated && (
                      <div className="space-y-3">
                        {!hasNFT && (
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                            <p className="text-orange-200 text-sm">
                              You need to mint an AstroChart NFT to vote on predictions.{" "}
                              <Link href="/mint-chart" className="text-orange-400 hover:underline">
                                Mint yours here
                              </Link>
                            </p>
                          </div>
                        )}

                        {userVote?.hasVoted && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-blue-200 text-sm">
                              You voted <strong>{userVote.vote ? "YES" : "NO"}</strong> with {formatStake(userVote.stakeAmount)} FLOW
                              {prediction.isResolved && !userVote.rewardClaimed && (
                                <span className="text-blue-400"> • Reward available!</span>
                              )}
                            </p>
                          </div>
                        )}

                        {canVote && (
                          <Link href={`/vote-predictions/${prediction.id}`}>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                              Vote on This Prediction
                            </Button>
                          </Link>
                        )}

                        {prediction.isResolved && userVote?.hasVoted && !userVote.rewardClaimed && (
                          <Button 
                            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                            onClick={() => {
                              // This would trigger claim reward function
                              console.log("Claim reward for prediction:", prediction.id)
                            }}
                          >
                            Claim Reward
                          </Button>
                        )}
                      </div>
                    )}

                    {!authenticated && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-200 text-sm text-center">
                          Connect your wallet to vote on this prediction
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Call to Action */}
        {!isAstrologer && authenticated && (
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Become an Astrologer</h3>
                <p className="text-purple-200 mb-6">
                  Share your astrological insights with the world and earn from your prediction accuracy.
                </p>
                <Link href="/astrologer-dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Start Your Journey
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 