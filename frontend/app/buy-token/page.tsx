"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Coins, Users, Star, AlertCircle, Loader2 } from "lucide-react"
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

interface TokenWithDetails {
  token: TokenData
  tokenInfo: TokenInfo | null
  astrologer: AstrologerData | null
  currentPrice: string
  priceChange24h: number
}

export default function BuyTokenPage() {
  const { authenticated, user } = usePrivy()
  const [tokens, setTokens] = useState<TokenWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [buyingToken, setBuyingToken] = useState<string>("")
  const [buyAmounts, setBuyAmounts] = useState<{[key: string]: string}>({})

  useEffect(() => {
    loadAllTokens()
  }, [])

  const loadAllTokens = async () => {
    try {
      setLoading(true)
      setError("")

      // Get all active tokens
      const tokenIds = await contractService.getAllActiveTokens()
      const tokensWithDetails: TokenWithDetails[] = []

      for (let i = 0; i < tokenIds.length; i++) {
        try {
          const tokenId = Number(tokenIds[i])
          // Get token info from launcher
          const token = await contractService.getLauncherTokenInfo(tokenId)
          
          // Skip if token not active
          if (!token || !token.isActive) continue

          // Get detailed token info from buy contract
          const tokenInfo = await contractService.getTokenInfo(token.tokenContract)
          
          // Get current price
          const price = await contractService.getTokenPrice(token.tokenContract)
          const currentPrice = ethers.formatEther(price)

          // Get astrologer data
          let astrologer = null
          try {
            astrologer = await contractService.getAstrologerByWallet(token.astrologer)
          } catch (err) {
            console.log("Astrologer not found for token:", token.symbol)
          }

          // Generate mock price change for demo
          const priceChange24h = (Math.random() - 0.5) * 20

          tokensWithDetails.push({
            token,
            tokenInfo,
            astrologer,
            currentPrice,
            priceChange24h
          })
        } catch (err) {
          console.log("Error loading token:", err)
        }
      }

      setTokens(tokensWithDetails)
    } catch (err: any) {
      console.error("Error loading tokens:", err)
      setError(err.message || "Failed to load tokens")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyTokens = async (tokenContract: string, amount: string) => {
    if (!user?.wallet?.address || !amount) return

    try {
      setBuyingToken(tokenContract)
      setError("")

      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      await contractService.buyTokens(tokenContract, amount)
      
      // Reload tokens after purchase
      await loadAllTokens()
      setBuyAmounts({...buyAmounts, [tokenContract]: ""})
    } catch (err: any) {
      console.error("Buy tokens error:", err)
      setError(err.message || "Failed to buy tokens")
    } finally {
      setBuyingToken("")
    }
  }

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (num < 0.01) return num.toFixed(6)
    if (num < 1) return num.toFixed(4)
    return num.toFixed(2)
  }

  const updateBuyAmount = (tokenContract: string, amount: string) => {
    setBuyAmounts({...buyAmounts, [tokenContract]: amount})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading tokens...</p>
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
          <Link href="/astrologers">
            <Button variant="outline" className="border-purple-400/30 text-purple-200 hover:bg-purple-400/10">
              Browse Astrologers
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Buy Astrologer Tokens</h1>
          <p className="text-purple-200 text-lg">
            Invest in your favorite astrologers and earn from their prediction accuracy
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
              <p className="text-blue-200">Please connect your wallet to buy astrologer tokens</p>
            </CardContent>
          </Card>
        )}

        {/* Tokens Grid */}
        {tokens.length === 0 ? (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Coins className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-semibold mb-2">No Tokens Available</h3>
              <p className="text-purple-200 mb-6">
                There are currently no astrologer tokens available for purchase.
              </p>
              <Link href="/astrologer-dashboard">
                <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white">
                  Become an Astrologer
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {tokens.map((tokenWithDetails) => {
              const { token, tokenInfo, astrologer, currentPrice, priceChange24h } = tokenWithDetails
              const buyAmount = buyAmounts[token.tokenContract] || ""
              const totalCost = parseFloat(buyAmount) * parseFloat(currentPrice) || 0

              return (
                <Card key={token.tokenContract} className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-gold-600/20 text-gold-200">
                            {token.symbol}
                          </Badge>
                          {astrologer?.isVerified && (
                            <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-white text-lg mb-2">{token.name}</CardTitle>
                        <CardDescription className="text-purple-200">
                          by {astrologer?.name || "Unknown Astrologer"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price Info */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        {formatPrice(currentPrice)} FLOW
                      </div>
                      <div className={`flex items-center justify-center space-x-1 ${
                        priceChange24h > 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {priceChange24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>
                          {priceChange24h > 0 ? "+" : ""}{formatPrice(priceChange24h)}% (24h)
                        </span>
                      </div>
                    </div>

                    {/* Token Stats */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Circulating Supply:</span>
                        <span className="text-white">{tokenInfo?.circulatingSupply ? Number(tokenInfo.circulatingSupply).toLocaleString() : "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Total Supply:</span>
                        <span className="text-white">{Number(token.totalSupply).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Reputation Multiplier:</span>
                        <span className="text-white">{tokenInfo ? (Number(tokenInfo.credibilityMultiplier) / 1000).toFixed(2) : "0.00"}x</span>
                      </div>
                      {astrologer && (
                        <div className="flex justify-between">
                          <span className="text-purple-200">Specialty:</span>
                          <span className="text-white">{astrologer.specialty}</span>
                        </div>
                      )}
                    </div>

                    {/* Buy Interface */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${token.tokenContract}`} className="text-white">
                          Amount ({token.symbol})
                        </Label>
                        <Input
                          id={`amount-${token.tokenContract}`}
                          type="number"
                          placeholder="0.00"
                          value={buyAmount}
                          onChange={(e) => updateBuyAmount(token.tokenContract, e.target.value)}
                          className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                          disabled={!authenticated}
                        />
                        <div className="flex space-x-2">
                          {["10", "50", "100", "500"].map((amt) => (
                            <button
                              key={amt}
                              className="px-3 py-1 bg-white/5 rounded text-purple-200 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
                              onClick={() => updateBuyAmount(token.tokenContract, amt)}
                              disabled={!authenticated}
                            >
                              {amt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {buyAmount && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-200">Total Cost:</span>
                            <span className="text-gold-400 font-semibold">
                              {formatPrice(totalCost)} FLOW
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleBuyTokens(token.tokenContract, buyAmount)}
                        className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                        disabled={!authenticated || !buyAmount || parseFloat(buyAmount) <= 0 || buyingToken === token.tokenContract}
                      >
                        {buyingToken === token.tokenContract ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Buying...
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            Buy {token.symbol}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Want to Launch Your Own Token?</h3>
              <p className="text-purple-200 mb-6">
                Become a verified astrologer and launch your personal token to monetize your predictions.
              </p>
              <Link href="/astrologer-dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Become an Astrologer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 