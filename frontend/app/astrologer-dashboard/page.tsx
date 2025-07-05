"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Coins, Users, Star, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { contractService } from "@/lib/contracts"
import { usePrivy } from "@privy-io/react-auth"
import { ethers } from "ethers"

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

interface TokenData {
  id: number
  astrologer: string
  tokenContract: string
  buyContract: string
  name: string
  symbol: string
  totalSupply: number
  initialPrice: number
  isActive: boolean
  createdAt: number
}

interface TokenInfo {
  tokenContract: string
  astrologer: string
  totalSupply: number
  circulatingSupply: number
  basePrice: number
  credibilityMultiplier: number
  isActive: boolean
}

interface ReputationScore {
  id: number
  astrologer: string
  totalPredictions: number
  accuratePredictions: number
  accuracyPercentage: number
  reputationMultiplier: number
  marketPredictions: number
  dailyPredictions: number
  oneToOnePredictions: number
  lastUpdated: number
  isActive: boolean
}

export default function AstrologerDashboard() {
  const { authenticated, user } = usePrivy()
  const [astrologerData, setAstrologerData] = useState<AstrologerData | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [reputationScore, setReputationScore] = useState<ReputationScore | null>(null)
  const [currentPrice, setCurrentPrice] = useState<string>("0")
  const [priceChange24h, setPriceChange24h] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLaunchingToken, setIsLaunchingToken] = useState(false)

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    description: "",
    specialty: "",
    experience: 0
  })

  // Token launch form state
  const [tokenForm, setTokenForm] = useState({
    name: "",
    symbol: "",
    totalSupply: "100000",
    initialPrice: "1.0",
    description: ""
  })

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadAstrologerData()
    }
  }, [authenticated, user])

  const loadAstrologerData = async () => {
    if (!user?.wallet?.address) return

    try {
      setLoading(true)
      setError("")

      // Check if user is registered as astrologer
      const isVerified = await contractService.isAstrologerVerified(user.wallet.address)
      
      if (isVerified) {
        // Get astrologer data
        const astrologer = await contractService.getAstrologerByWallet(user.wallet.address)
        setAstrologerData(astrologer)

        // Get reputation score
        try {
          const reputation = await contractService.getReputationScore(user.wallet.address)
          console.log("Reputation score data:", reputation)
          
          // Format the reputation data (convert BigInt to numbers)
          const formattedReputation = {
            id: Number(reputation.id),
            astrologer: reputation.astrologer,
            totalPredictions: Number(reputation.totalPredictions),
            accuratePredictions: Number(reputation.accuratePredictions),
            accuracyPercentage: Number(reputation.accuracyPercentage),
            reputationMultiplier: Number(reputation.reputationMultiplier),
            marketPredictions: Number(reputation.marketPredictions),
            dailyPredictions: Number(reputation.dailyPredictions),
            oneToOnePredictions: Number(reputation.oneToOnePredictions),
            lastUpdated: Number(reputation.lastUpdated),
            isActive: reputation.isActive
          }
          
          console.log("Formatted reputation data:", formattedReputation)
          setReputationScore(formattedReputation)
        } catch (err) {
          console.log("No reputation score found:", err)
          // Set default reputation score for new astrologers
          setReputationScore({
            id: 0,
            astrologer: user.wallet.address,
            totalPredictions: 0,
            accuratePredictions: 0,
            accuracyPercentage: 0,
            reputationMultiplier: 1000, // Default 1.0x multiplier
            marketPredictions: 0,
            dailyPredictions: 0,
            oneToOnePredictions: 0,
            lastUpdated: 0,
            isActive: false
          })
        }

        // Check if astrologer has launched a token
        try {
          const token = await contractService.getTokenByAstrologer(user.wallet.address)
          setTokenData(token)

          if (token && token.tokenContract) {
            // Get detailed token info
            const tokenInfo = await contractService.getTokenInfo(token.tokenContract)
            setTokenInfo(tokenInfo)

            // Get current token price
            const price = await contractService.getTokenPrice(token.tokenContract)
            const priceEth = ethers.formatEther(price)
            setCurrentPrice(priceEth)

            // For demo purposes, generate a random price change
            // In production, you'd fetch this from price history
            setPriceChange24h((Math.random() - 0.5) * 20)
          }
        } catch (err) {
          console.log("No token found for astrologer")
        }
      }
    } catch (err: any) {
      console.error("Error loading astrologer data:", err)
      setError(err.message || "Failed to load astrologer data")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!user?.wallet?.address) return

    try {
      setIsRegistering(true)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      await contractService.registerAstrologer(
        registrationForm.name,
        registrationForm.description,
        registrationForm.specialty,
        registrationForm.experience
      )

      // Reload data after registration
      await loadAstrologerData()
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to register astrologer")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleLaunchToken = async () => {
    if (!user?.wallet?.address) return

    try {
      setIsLaunchingToken(true)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      await contractService.launchToken(
        tokenForm.name,
        tokenForm.symbol,
        tokenForm.totalSupply,
        tokenForm.initialPrice,
        tokenForm.description
      )

      // Reload data after token launch
      await loadAstrologerData()
    } catch (err: any) {
      console.error("Token launch error:", err)
      setError(err.message || "Failed to launch token")
    } finally {
      setIsLaunchingToken(false)
    }
  }

  const getReputationBadge = (accuracyPercentage: number) => {
    if (accuracyPercentage >= 90) return { color: "bg-gold-500", text: "Master", level: "text-gold-200" }
    if (accuracyPercentage >= 80) return { color: "bg-purple-500", text: "Expert", level: "text-purple-200" }
    if (accuracyPercentage >= 70) return { color: "bg-blue-500", text: "Advanced", level: "text-blue-200" }
    if (accuracyPercentage >= 60) return { color: "bg-green-500", text: "Intermediate", level: "text-green-200" }
    if (accuracyPercentage > 0) return { color: "bg-yellow-500", text: "Beginner", level: "text-yellow-200" }
    return { color: "bg-gray-500", text: "Novice", level: "text-gray-200" }
  }

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (num < 0.01) return num.toFixed(6)
    if (num < 1) return num.toFixed(4)
    return num.toFixed(2)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-purple-200 mb-6">Please connect your wallet to access the Astrologer Dashboard</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
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
        {error && (
          <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-sm mb-8">
            <CardContent className="p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Registration Section */}
        {!astrologerData && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-6 h-6 mr-2 text-gold-400" />
                Register as Astrologer
              </CardTitle>
              <CardDescription className="text-purple-200">
                Complete your registration to start earning with predictions and tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                    placeholder="Enter your email address"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-white">Specialty</Label>
                  <Select value={registrationForm.specialty} onValueChange={(value) => setRegistrationForm({...registrationForm, specialty: value})}>
                    <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="love-relationships">Love & Relationships</SelectItem>
                      <SelectItem value="career-finance">Career & Finance</SelectItem>
                      <SelectItem value="health-wellness">Health & Wellness</SelectItem>
                      <SelectItem value="spiritual-growth">Spiritual Growth</SelectItem>
                      <SelectItem value="general-astrology">General Astrology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-white">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={registrationForm.experience}
                    onChange={(e) => setRegistrationForm({...registrationForm, experience: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Bio & Description</Label>
                <Textarea
                  id="description"
                  value={registrationForm.description}
                  onChange={(e) => setRegistrationForm({...registrationForm, description: e.target.value})}
                  placeholder="Tell people about your astrological background and approach..."
                  className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  rows={4}
                />
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                <p className="text-blue-200 text-sm">
                  <strong>Registration Fee:</strong> 0.01 FLOW + gas fees
                </p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={isRegistering || !registrationForm.name || !registrationForm.specialty || !registrationForm.description}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Register as Astrologer
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {astrologerData && (
          <div className="space-y-8">
            {/* Status Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-white font-semibold">Verified Astrologer</p>
                  <p className="text-green-400 text-sm">Active since {new Date(Number(astrologerData.registeredAt) * 1000).toLocaleDateString()}</p>
                </CardContent>
              </Card>

              {reputationScore && (
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                                                                      <Badge className={`${getReputationBadge(Number(reputationScore.accuracyPercentage || 0)).color} text-white`}>
                          {getReputationBadge(Number(reputationScore.accuracyPercentage || 0)).text}
                        </Badge>
                    </div>
                    <p className="text-white font-semibold">Reputation Score</p>
                    <p className="text-purple-200 text-sm">{reputationScore.accuracyPercentage || 0}% Accuracy</p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {tokenData ? formatPrice(currentPrice) : "0.00"}
                  </p>
                  <p className="text-purple-200 text-sm">Token Price (FLOW)</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {tokenInfo ? Number(tokenInfo.circulatingSupply).toLocaleString() : "0"}
                  </p>
                  <p className="text-purple-200 text-sm">Token Holders</p>
                </CardContent>
              </Card>
            </div>

            {/* Token Section */}
            {!tokenData ? (
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Coins className="w-6 h-6 mr-2 text-gold-400" />
                    Launch Your Token
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Create your personal astrologer token to monetize your predictions and build a community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tokenName" className="text-white">Token Name</Label>
                      <Input
                        id="tokenName"
                        value={tokenForm.name}
                        onChange={(e) => setTokenForm({...tokenForm, name: e.target.value})}
                        placeholder="e.g., Luna Starweaver Token"
                        className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tokenSymbol" className="text-white">Token Symbol</Label>
                      <Input
                        id="tokenSymbol"
                        value={tokenForm.symbol}
                        onChange={(e) => setTokenForm({...tokenForm, symbol: e.target.value.toUpperCase()})}
                        placeholder="e.g., LUNA"
                        className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="totalSupply" className="text-white">Total Supply</Label>
                      <Input
                        id="totalSupply"
                        value={tokenForm.totalSupply}
                        onChange={(e) => setTokenForm({...tokenForm, totalSupply: e.target.value})}
                        placeholder="100000"
                        className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="initialPrice" className="text-white">Initial Price (Fixed at 1 FLOW)</Label>
                      <Input
                        id="initialPrice"
                        value={tokenForm.initialPrice}
                        readOnly
                        placeholder="1.0"
                        className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50 opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenDescription" className="text-white">Token Description</Label>
                    <Textarea
                      id="tokenDescription"
                      value={tokenForm.description}
                      onChange={(e) => setTokenForm({...tokenForm, description: e.target.value})}
                      placeholder="Describe the benefits and utility of your token..."
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                    <p className="text-blue-200 text-sm mb-2">
                      <strong>Launch Fee:</strong> 0.1 FLOW + gas fees
                    </p>
                    <p className="text-blue-200 text-sm">
                      <strong>Bonding Curve:</strong> Token price automatically adjusts based on your reputation and prediction accuracy (0.2x to 5.0x multiplier)
                    </p>
                  </div>

                  <Button
                    onClick={handleLaunchToken}
                    disabled={isLaunchingToken || !tokenForm.name || !tokenForm.symbol}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                  >
                    {isLaunchingToken ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Launching Token...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Launch Token
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Token Price Chart */}
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Token Price Tracker</span>
                      <Badge variant="secondary" className="bg-gold-600/20 text-gold-200">
                        {tokenData.symbol}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Live price for {tokenData.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {formatPrice(currentPrice)} FLOW
                      </div>
                      <div className={`flex items-center justify-center space-x-1 ${
                        priceChange24h > 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {priceChange24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>
                          {priceChange24h > 0 ? "+" : ""}{priceChange24h.toFixed(2)}% (24h)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Total Supply:</span>
                        <span className="text-white">{Number(tokenData.totalSupply).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Circulating Supply:</span>
                        <span className="text-white">{tokenInfo?.circulatingSupply ? Number(tokenInfo.circulatingSupply).toLocaleString() : "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Base Price:</span>
                        <span className="text-white">{tokenInfo ? formatPrice(ethers.formatEther(tokenInfo.basePrice)) : "0"} FLOW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Reputation Multiplier:</span>
                        <span className="text-white">{tokenInfo ? (Number(tokenInfo.credibilityMultiplier) / 1000).toFixed(2) : "0.00"}x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reputation Breakdown */}
                {reputationScore && (
                  <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Star className="w-6 h-6 mr-2 text-gold-400" />
                        Reputation Score
                      </CardTitle>
                      <CardDescription className="text-purple-200">
                        Your prediction accuracy and reputation metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <Badge className={`${getReputationBadge(Number(reputationScore.accuracyPercentage || 0)).color} text-white text-lg px-4 py-2 mb-2`}>
                          {getReputationBadge(Number(reputationScore.accuracyPercentage || 0)).text}
                        </Badge>
                        <div className="text-3xl font-bold text-white mb-2">
                          {reputationScore.accuracyPercentage || 0}%
                        </div>
                        <p className="text-purple-200">Overall Accuracy</p>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-200">Total Predictions:</span>
                          <span className="text-white">{reputationScore.totalPredictions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Accurate Predictions:</span>
                          <span className="text-green-400">{reputationScore.accuratePredictions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Market Predictions:</span>
                          <span className="text-white">{reputationScore.marketPredictions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Daily Predictions:</span>
                          <span className="text-white">{reputationScore.dailyPredictions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">One-to-One Predictions:</span>
                          <span className="text-white">{reputationScore.oneToOnePredictions || 0}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 rounded-lg p-4 border border-purple-400/20">
                        <p className="text-purple-200 text-sm">
                          <strong>Impact on Token:</strong> Your reputation directly affects your token price through the bonding curve multiplier ({(Number(reputationScore.reputationMultiplier || 1000) / 1000).toFixed(2)}x)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 