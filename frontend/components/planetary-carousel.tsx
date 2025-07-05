"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Users, Shield, Coins, Star } from "lucide-react"

const planets = [
  {
    name: "Mercury",
    title: "NFT Natal Charts",
    description: "Transform your cosmic blueprint into unique digital assets with AI-powered personalized artwork",
    features: ["Personalized artwork", "Blockchain verified", "Tradeable on OpenSea", "Exclusive benefits"],
    color: "from-slate-400 to-slate-600",
    icon: Sparkles,
    gradient: "from-purple-500/20 to-blue-500/20",
    borderGradient: "from-purple-400/30 to-blue-400/30",
  },
  {
    name: "Venus",
    title: "Love Compatibility",
    description: "Discover cosmic connections through advanced synastry analysis and relationship insights",
    features: ["Synastry analysis", "Compatibility scoring", "Relationship predictions", "Couple NFTs"],
    color: "from-pink-400 to-rose-500",
    icon: Star,
    gradient: "from-pink-500/20 to-purple-500/20",
    borderGradient: "from-pink-400/30 to-purple-400/30",
  },
  {
    name: "Mars",
    title: "Prediction Markets",
    description: "Stake on astrological forecasts and earn rewards through community-driven prediction markets",
    features: ["Market predictions", "Staking rewards", "Community voting", "Profit sharing"],
    color: "from-red-400 to-red-600",
    icon: TrendingUp,
    gradient: "from-red-500/20 to-orange-500/20",
    borderGradient: "from-red-400/30 to-orange-400/30",
  },
  {
    name: "Jupiter",
    title: "Verified Astrologers",
    description: "Connect with DAO-verified cosmic experts who stake their reputation on every prediction",
    features: ["Expert consultations", "Reputation staking", "Quality assurance", "24/7 availability"],
    color: "from-orange-400 to-yellow-500",
    icon: Shield,
    gradient: "from-yellow-500/20 to-orange-500/20",
    borderGradient: "from-yellow-400/30 to-orange-400/30",
  },
  {
    name: "Saturn",
    title: "AstroTokens",
    description: "Create and trade astrologer-backed cryptocurrencies with built-in governance and utility",
    features: ["Personal tokens", "Monetize expertise", "Community building", "Governance rights"],
    color: "from-purple-400 to-indigo-500",
    icon: Coins,
    gradient: "from-purple-500/20 to-indigo-500/20",
    borderGradient: "from-purple-400/30 to-indigo-400/30",
  },
  {
    name: "Neptune",
    title: "DAO Governance",
    description: "Shape the future of decentralized astrology through community-driven governance",
    features: ["Community voting", "Proposal creation", "Reputation system", "Reward distribution"],
    color: "from-blue-400 to-cyan-500",
    icon: Users,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderGradient: "from-blue-400/30 to-cyan-400/30",
  },
]

export function PlanetaryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % planets.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % planets.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + planets.length) % planets.length)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {planets.map((planet, index) => {
            const Icon = planet.icon
            return (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <Card
                  className={`relative bg-gradient-to-br ${planet.gradient} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 rounded-3xl overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative z-10 p-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-8">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <div
                              className={`w-20 h-20 bg-gradient-to-r ${planet.color} rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110`}
                            >
                              <Icon className="w-10 h-10 text-white" />
                            </div>
                            <div
                              className={`absolute -inset-2 bg-gradient-to-r ${planet.color} rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity`}
                            />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-2">{planet.title}</h3>
                            <p className="text-purple-200 font-medium">{planet.name}</p>
                          </div>
                        </div>

                        <p className="text-xl text-white/80 leading-relaxed">{planet.description}</p>

                        <div className="grid grid-cols-2 gap-4">
                          {planet.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
                            >
                              <div className="w-3 h-3 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"></div>
                              <span className="text-white font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <div className="relative w-80 h-80 mx-auto">
                          {/* Planet */}
                          <div
                            className={`w-40 h-40 bg-gradient-to-r ${planet.color} rounded-full mx-auto shadow-2xl animate-float relative z-10`}
                          >
                            <div className="absolute inset-4 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                            <div className="absolute inset-8 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                          </div>

                          {/* Orbital Rings */}
                          <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-spin-slow"></div>
                          <div className="absolute inset-8 border border-white/10 rounded-full animate-reverse-spin"></div>

                          {/* Moons */}
                          {[0, 120, 240].map((rotation, moonIndex) => (
                            <div
                              key={moonIndex}
                              className="absolute w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full shadow-lg"
                              style={{
                                top: "50%",
                                left: "50%",
                                transform: `rotate(${rotation}deg) translateX(140px) translateY(-50%)`,
                                animation: `spin ${20 + moonIndex * 5}s linear infinite`,
                              }}
                            />
                          ))}

                          {/* Glow Effect */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${planet.color} rounded-full blur-3xl opacity-20 animate-pulse`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center mt-12 space-x-6">
        <Button
          onClick={prevSlide}
          variant="outline"
          size="sm"
          className="w-12 h-12 rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-xl hover:border-white/30 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex space-x-3">
          {planets.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-gold-400 to-gold-500 scale-125 shadow-lg shadow-gold-400/50"
                  : "bg-white/30 hover:bg-white/50 hover:scale-110"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          variant="outline"
          size="sm"
          className="w-12 h-12 rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-xl hover:border-white/30 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
