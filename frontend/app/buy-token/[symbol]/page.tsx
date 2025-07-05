"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Coins, ArrowUpDown, Info, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { contractService } from "@/lib/contracts"
import { usePrivy } from "@privy-io/react-auth"
import { ethers } from "ethers"

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

export default function BuyTokenPage({ params }: { params: { symbol: string } }) {
  const { authenticated, user } = usePrivy()
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [astrologerData, setAstrologerData] = useState<AstrologerData | null>(null)
  const [reputationScore, setReputationScore] = useState<ReputationScore | null>(null)
  const [currentPrice, setCurrentPrice] = useState<string>("0")
  const [priceChange24h, setPriceChange24h] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [buying, setBuying] = useState(false)
  
  const [amount, setAmount] = useState("")
  const [orderType, setOrderType] = useState("market")
  const [limitPrice, setLimitPrice] = useState("")

  useEffect(() => {
    loadTokenData()
  }, [params.symbol])

  const loadTokenData = async () => {
    try {
      setLoading(true)
      setError("")

      // Get all active tokens
      const allTokenIds = await contractService.getAllActiveTokens()
      
      // Find token by symbol
      let targetToken = null
      for (let i = 0; i < allTokenIds.length; i++) {
        try {
          const tokenId = Number(allTokenIds[i])
          const token = await contractService.getLauncherTokenInfo(tokenId)
          
          // Check if symbol matches and token is active
          if (token && token.symbol.toUpperCase() === params.symbol.toUpperCase() && token.isActive) {
            targetToken = token
            break
          }
        } catch (err) {
          console.log("Error checking token:", err)
        }
      }

      if (!targetToken) {
        setError(`Token with symbol "${params.symbol}" not found`)
        return
      }

      setTokenData(targetToken)

      // Get token info from BuyTokenContract
      const tokenInfo = await contractService.getTokenInfo(targetToken.tokenContract)
      setTokenInfo(tokenInfo)

      // Get current price
      const price = await contractService.getTokenPrice(targetToken.tokenContract)
      const priceEth = ethers.formatEther(price)
      setCurrentPrice(priceEth)

      // Get astrologer data
      const astrologer = await contractService.getAstrologerByWallet(targetToken.astrologer)
      if (astrologer) {
        setAstrologerData(astrologer)
      }

      // Get reputation score
      try {
        const reputation = await contractService.getReputationScore(targetToken.astrologer)
        setReputationScore(reputation)
      } catch (err) {
        console.log("No reputation score found")
      }

      // Generate mock price change for demo
      setPriceChange24h((Math.random() - 0.5) * 20)

    } catch (err: any) {
      console.error("Error loading token data:", err)
      setError(err.message || "Failed to load token data")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyTokens = async () => {
    if (!user?.wallet?.address || !tokenData) return

    try {
      setBuying(true)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      // Calculate FLOW amount needed
      const tokenAmount = parseFloat(amount)
      const pricePerToken = parseFloat(currentPrice)
      const flowAmount = (tokenAmount * pricePerToken).toString()

      await contractService.buyTokens(tokenData.tokenContract, flowAmount)
      
      // Reload token data after purchase
      await loadTokenData()
      setAmount("")
    } catch (err: any) {
      console.error("Buy tokens error:", err)
      setError(err.message || "Failed to buy tokens")
    } finally {
      setBuying(false)
    }
  }

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (num < 0.01) return num.toFixed(6)
    if (num < 1) return num.toFixed(4)
    return num.toFixed(2)
  }

  const totalCost = parseFloat(amount) * parseFloat(currentPrice) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading token data...</p>
        </div>
      </div>
    )
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-red-400/20 backdrop-blur-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Token Not Found</h2>
            <p className="text-red-200 mb-6">{error || "The requested token could not be found."}</p>
            <Link href="/astrologers">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                Browse Astrologers
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
        <Link href="/astrologers" className="text-purple-200 hover:text-white transition-colors">
          ← Back to Astrologers
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Token Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Coins className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{tokenData.name}</h2>
                  <Badge variant="secondary" className="bg-gold-600/20 text-gold-200 mb-4">
                    ${tokenData.symbol}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{formatPrice(currentPrice)} FLOW</div>
                    <div
                      className={`flex items-center justify-center space-x-1 ${
                        priceChange24h > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {priceChange24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>
                        {priceChange24h > 0 ? "+" : ""}
                        {formatPrice(priceChange24h)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Market Cap:</span>
                      <span className="text-white">{tokenInfo ? (parseFloat(currentPrice) * Number(tokenInfo.circulatingSupply)).toFixed(2) : "0"} FLOW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Circulating Supply:</span>
                      <span className="text-white">{tokenInfo?.circulatingSupply ? Number(tokenInfo.circulatingSupply).toLocaleString() : "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Supply:</span>
                      <span className="text-white">{Number(tokenData.totalSupply).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Reputation Multiplier:</span>
                      <span className="text-white">{tokenInfo ? (Number(tokenInfo.credibilityMultiplier) / 1000).toFixed(2) : "0.00"}x</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-400/20">
                    <h4 className="text-white font-semibold mb-2">Astrologer Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Name:</span>
                        <span className="text-white">{astrologerData?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Specialty:</span>
                        <span className="text-white">{astrologerData?.specialty || "General"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Accuracy:</span>
                        <span className="text-green-400">{reputationScore ? `${reputationScore.accuracyPercentage}%` : "New"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Buy {tokenData.symbol}</CardTitle>
                <CardDescription className="text-purple-200">
                  Purchase {astrologerData?.name || "this astrologer"}'s tokens to access exclusive benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                {!authenticated && (
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                    <p className="text-blue-200">Please connect your wallet to buy tokens</p>
                  </div>
                )}

                {/* Amount Input */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">
                      Amount ({tokenData.symbol})
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                      disabled={!authenticated}
                    />
                    <div className="flex space-x-2">
                      {["10", "50", "100", "500"].map((amt) => (
                        <button
                          key={amt}
                          className="px-3 py-1 bg-white/5 rounded text-purple-200 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
                          onClick={() => setAmount(amt)}
                          disabled={!authenticated}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Amount:</span>
                      <span className="text-white">
                        {amount || "0"} {tokenData.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Price per token:</span>
                      <span className="text-white">
                        {formatPrice(currentPrice)} FLOW
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Platform fee (0.5%):</span>
                      <span className="text-white">{formatPrice(totalCost * 0.005)} FLOW</span>
                    </div>
                    <div className="border-t border-purple-400/20 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Total Cost:</span>
                        <span className="text-gold-400">{formatPrice(totalCost + totalCost * 0.005)} FLOW</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBuyTokens}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                  size="lg"
                  disabled={!authenticated || !amount || parseFloat(amount) <= 0 || buying}
                >
                  {buying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Buying...
                    </>
                  ) : (
                    <>
                      <Coins className="w-5 h-5 mr-2" />
                      Buy {tokenData.symbol}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Token Benefits */}
            <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Token Benefits
                </CardTitle>
                <CardDescription className="text-purple-200">
                  What you get by holding {tokenData.symbol} tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Exclusive Access</h4>
                    <ul className="space-y-2 text-purple-200">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span>Priority booking for sessions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span>Exclusive daily predictions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span>Private community access</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Financial Benefits</h4>
                    <ul className="space-y-2 text-purple-200">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span>20% discount on all sessions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span>Staking rewards (5% APY)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span>Revenue sharing from predictions</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                  <p className="text-blue-200 text-sm">
                    <strong>Note:</strong> {astrologerData?.description || "Hold tokens to access exclusive benefits from this astrologer"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
