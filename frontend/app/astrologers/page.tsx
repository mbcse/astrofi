"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WalletGuard } from "@/components/wallet/wallet-guard"
import { WalletInfo } from "@/components/wallet/wallet-info"
import { contractService } from "@/lib/contracts"
import { usePrivyWallet } from "@/hooks/use-privy-wallet"
import { Sparkles, Star, Search, Filter, TrendingUp, Users, Loader2, UserPlus, Coins } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Astrologer {
  address: string
  name: string
  email: string
  specialization: string
  experience: number
  bio: string
  profileURI: string
  isActive: boolean
  isVerified?: boolean
  tokenData?: {
    name: string
    symbol: string
    isActive: boolean
    tokenContract: string
  }
}

export default function AstrologersPage() {
  const { ready, authenticated, userAddress } = usePrivyWallet()
  const [astrologers, setAstrologers] = useState<Astrologer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")

  useEffect(() => {
    loadAstrologers()
  }, [])

  const loadAstrologers = async () => {
    setIsLoading(true)
    try {
      const allAstrologers = await contractService.getAllAstrologers()
      
      // Fetch token data for each astrologer
      const astrologersWithTokens = await Promise.all(
        allAstrologers.map(async (astrologer) => {
          try {
            const tokenData = await contractService.getUserToken(astrologer.address)
            return {
              ...astrologer,
              tokenData: tokenData ? {
                name: tokenData.name,
                symbol: tokenData.symbol,
                isActive: tokenData.isActive,
                tokenContract: tokenData.tokenContract
              } : undefined
            }
          } catch (error) {
            console.log(`No token found for astrologer ${astrologer.name}`)
            return {
              ...astrologer,
              tokenData: undefined
            }
          }
        })
      )
      
      setAstrologers(astrologersWithTokens)
    } catch (error) {
      console.error('Failed to load astrologers:', error)
      toast.error('Failed to load astrologers')
      // Fallback to mock data
      setAstrologers([
        {
          address: "0x123...",
          name: "Luna Starweaver",
          email: "luna@astrofi.com",
          specialization: "Love & Relationships",
          experience: 15,
          bio: "Expert in relationship astrology with 15 years of experience",
          profileURI: "https://example.com/luna",
          isActive: true
        },
        {
          address: "0x456...",
          name: "Cosmic Chen",
          email: "cosmic@astrofi.com",
          specialization: "Career & Finance",
          experience: 12,
          bio: "Specialized in career and financial astrology",
          profileURI: "https://example.com/cosmic",
          isActive: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAstrologers = astrologers.filter(astrologer => {
    const matchesSearch = astrologer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         astrologer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || 
                             selectedSpecialty === "all-specialties" || 
                             astrologer.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

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
          <Link href="/astrologers/register">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Register as Astrologer
            </Button>
          </Link>
        </div>
      </header>

      <WalletGuard>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Verified Astrologers</h1>
            <p className="text-purple-200 text-lg">
              Connect with DAO-verified astrologers who stake their reputation on every prediction
            </p>
          </div>

          {/* Wallet Status */}
          <div className="mb-8">
            <WalletInfo />
          </div>

          {/* Filters */}
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search astrologers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                                            <SelectItem value="all-specialties">All Specialties</SelectItem>
                    <SelectItem value="Natal Astrology">Natal Astrology</SelectItem>
                    <SelectItem value="Predictive Astrology">Predictive Astrology</SelectItem>
                    <SelectItem value="Horary Astrology">Horary Astrology</SelectItem>
                    <SelectItem value="Electional Astrology">Electional Astrology</SelectItem>
                    <SelectItem value="Mundane Astrology">Mundane Astrology</SelectItem>
                    <SelectItem value="Medical Astrology">Medical Astrology</SelectItem>
                    <SelectItem value="Financial Astrology">Financial Astrology</SelectItem>
                    <SelectItem value="Relationship Astrology">Relationship Astrology</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-center">
                  <span className="text-white/70 text-sm">
                    {filteredAstrologers.length} astrologer{filteredAstrologers.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                <Link href="/astrologers/register">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* Astrologers Grid */}
              {filteredAstrologers.length === 0 ? (
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No Astrologers Found</h3>
                      <p className="text-purple-200 mb-6">
                        {searchTerm || selectedSpecialty 
                          ? "No astrologers match your search criteria." 
                          : "Be the first to register as an astrologer!"
                        }
                      </p>
                      <Link href="/astrologers/register">
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                          Register as Astrologer
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAstrologers.map((astrologer) => (
                    <Card
                      key={astrologer.address}
                      className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      <CardHeader className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">{astrologer.name[0]}</span>
                        </div>
                        <CardTitle className="text-white">{astrologer.name}</CardTitle>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-gold-400 fill-current" />
                            <span className="text-gold-400 font-semibold">4.8</span>
                          </div>
                          <span className={`text-sm ${astrologer.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                            ({astrologer.isVerified ? 'Verified' : 'Pending'})
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 mb-2">
                            {astrologer.specialization}
                          </Badge>
                          <p className="text-white/70 text-sm">{astrologer.experience} years experience</p>
                        </div>

                        <div className="text-center">
                          <p className="text-white/80 text-sm line-clamp-3">{astrologer.bio}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-white/60">Token</p>
                            {astrologer.tokenData && astrologer.tokenData.isActive ? (
                              <Badge className="bg-gold-600/20 text-gold-300 text-xs">
                                ${astrologer.tokenData.symbol}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-600/20 text-gray-400 text-xs">
                                No Token
                              </Badge>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-white/60">Status</p>
                            <Badge 
                              variant={astrologer.isVerified ? "default" : "secondary"} 
                              className={`text-xs ${astrologer.isVerified ? 'bg-green-600' : 'bg-yellow-600'}`}
                            >
                              {astrologer.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                              onClick={() => {
                                // Book session with astrologer
                                toast.info('Booking feature coming soon!')
                              }}
                            >
                              Book Session
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gold-400 text-gold-400 hover:bg-gold-400/10"
                              onClick={() => {
                                // View astrologer's predictions
                                toast.info('Predictions view coming soon!')
                              }}
                            >
                              Predictions
                            </Button>
                          </div>
                          {astrologer.tokenData && astrologer.tokenData.isActive ? (
                            <Link href={`/buy-token/${astrologer.tokenData.symbol}`} className="block">
                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                              >
                                <Coins className="w-4 h-4 mr-2" />
                                Buy ${astrologer.tokenData.symbol} Tokens
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              disabled
                              className="w-full bg-gray-500 text-gray-300 cursor-not-allowed"
                            >
                              <Coins className="w-4 h-4 mr-2" />
                              No Token Available
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </WalletGuard>
    </div>
  )
}
