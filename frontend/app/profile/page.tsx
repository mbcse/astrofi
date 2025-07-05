"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletGuard } from "@/components/wallet/wallet-guard"
import { WalletInfo } from "@/components/wallet/wallet-info"
import { contractService } from "@/lib/contracts"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { Calendar, MapPin, Clock, Star, Sparkles, Loader2, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ChartNFT {
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
  owner?: string
  mintedAt?: string
}

export default function ProfilePage() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userCharts, setUserCharts] = useState<ChartNFT[]>([])
  const [balance, setBalance] = useState<string>("0")
  const [reputationScore, setReputationScore] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState(false)

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      setUserAddress(wallets[0].address)
    } else {
      setUserAddress(null)
    }
  }, [ready, authenticated, wallets])

  useEffect(() => {
    if (userAddress) {
      loadUserData()
    }
  }, [userAddress])

  const loadUserData = async () => {
    if (!userAddress) return

    setIsLoading(true)
    try {
      // Load user's charts
      const charts = await contractService.getUserCharts(userAddress)
      console.log('Loaded charts in profile:', charts)
      setUserCharts(charts)

      // Load user's balance
      const userBalance = await contractService.getBalance(userAddress)
      setBalance(contractService.formatEther(userBalance))

      // Load reputation score
      const score = await contractService.getReputationScore(userAddress)
      setReputationScore(Number(score))
    } catch (error) {
      console.error('Failed to load user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = async () => {
    if (userAddress) {
      await navigator.clipboard.writeText(userAddress)
      setCopiedAddress(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      console.warn('Failed to format date:', e)
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    try {
      // If timeString is just HH:MM, add seconds
      const fullTime = timeString.length === 5 ? `${timeString}:00` : timeString
      return new Date(`2000-01-01T${fullTime}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      console.warn('Failed to format time:', e)
      return timeString
    }
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
          <Link href="/mint-chart">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
              Mint New Chart
            </Button>
          </Link>
        </div>
      </header>

      <WalletGuard>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your AstroFi Profile</h1>
            <p className="text-purple-200 text-lg">
              Manage your birth chart NFTs and track your astrological journey
            </p>
          </div>

          {/* Wallet Status */}
          <div className="mb-8">
            <WalletInfo />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* User Info */}
              <div className="lg:col-span-1">
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-purple-200">Wallet Address</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-xs text-white bg-white/10 px-2 py-1 rounded">
                          {userAddress?.substring(0, 8)}...{userAddress?.substring(-6)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyAddress}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {copiedAddress ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-purple-200">Balance</label>
                      <p className="text-white font-semibold">
                        {balance && !isNaN(parseFloat(balance)) ? parseFloat(balance).toFixed(4) : '0.0000'} FLOW
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-purple-200">Reputation Score</label>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-gold-400" />
                        <span className="text-white font-semibold">{reputationScore}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-purple-200">Charts Minted</label>
                      <p className="text-white font-semibold">{userCharts.length}</p>
                    </div>

                    <div className="pt-4">
                      <Link href="/mint-chart">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                          Mint New Chart
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Your Birth Charts</h2>
                  <p className="text-purple-200">
                    {userCharts.length === 0 
                      ? "You haven't minted any birth charts yet." 
                      : `${userCharts.length} chart${userCharts.length === 1 ? '' : 's'} minted`
                    }
                  </p>
                </div>

                {userCharts.length === 0 ? (
                  <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Star className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Charts Yet</h3>
                        <p className="text-purple-200 mb-6">
                          Mint your first birth chart NFT to start your astrological journey
                        </p>
                        <Link href="/mint-chart">
                          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                            Mint Your First Chart
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {userCharts.map((chart) => (
                      <div key={chart.tokenId} className="group relative">
                        {/* NFT Card with hover effect */}
                        <div className="relative rounded-xl overflow-hidden transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl">
                          {/* Chart Image */}
                          <div className="relative aspect-square w-full">
                            {chart.chartImage ? (
                              <img 
                                src={chart.chartImage} 
                                alt={`Birth chart for ${chart.name}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  console.error('Failed to load image:', chart.chartImage)
                                  e.currentTarget.style.display = 'none'
                                }}
                                onLoad={() => console.log('Image loaded successfully:', chart.chartImage)}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center">
                                <Star className="w-16 h-16 text-white/50" />
                              </div>
                            )}
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          </div>

                          {/* NFT Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-xl font-bold mb-2">{chart.name}</h3>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span>{formatDate(chart.birthDate)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span>{formatTime(chart.birthTime)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <span>{chart.birthPlace}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 mt-4">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                onClick={() => {
                                  // Parse and display chart data
                                  try {
                                    const chartData = JSON.parse(chart.chartData)
                                    // Open chart in a modal or dialog
                                    toast.success("Opening chart viewer...")
                                    // You can implement a modal here to show the chart
                                    window.open(chartData.chartImage || chart.chartImage, '_blank')
                                  } catch (e) {
                                    console.error('Failed to parse chart data:', e)
                                    toast.error('Failed to open chart viewer')
                                  }
                                }}
                              >
                                View Chart
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                onClick={() => {
                                  const flowViewUrl = `https://testnet.flowview.app/account/${userAddress}/collection/${chart.tokenId}`
                                  window.open(flowViewUrl, '_blank')
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Token ID Badge */}
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white">
                            #{chart.tokenId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </WalletGuard>
    </div>
  )
} 