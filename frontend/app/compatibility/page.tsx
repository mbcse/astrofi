"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, Star, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

export default function CompatibilityPage() {
  const [person1, setPerson1] = useState({ name: "", date: "", time: "", location: "" })
  const [person2, setPerson2] = useState({ name: "", date: "", time: "", location: "" })
  const [compatibility, setCompatibility] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const calculateCompatibility = async () => {
    if (!person1.name || !person1.date || !person2.name || !person2.date) return

    setIsCalculating(true)
    // Simulate calculation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate random compatibility score for demo
    const score = Math.floor(Math.random() * 40) + 60 // 60-100%
    setCompatibility(score)
    setShowResults(true)
    setIsCalculating(false)
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-green-600"
    if (score >= 80) return "from-yellow-500 to-yellow-600"
    if (score >= 70) return "from-orange-500 to-orange-600"
    return "from-red-500 to-red-600"
  }

  const getCompatibilityText = (score: number) => {
    if (score >= 90) return "Cosmic Soulmates"
    if (score >= 80) return "Stellar Match"
    if (score >= 70) return "Good Harmony"
    return "Challenging Aspects"
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
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Compatibility Checker</h1>
          <p className="text-purple-200 text-lg">
            Discover your cosmic connection and stake on relationship predictions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div className="space-y-8">
            {/* Person 1 */}
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-400" />
                  Person 1
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="person1-name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="person1-name"
                    placeholder="Enter name"
                    value={person1.name}
                    onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="person1-date" className="text-white">
                      Birth Date
                    </Label>
                    <Input
                      id="person1-date"
                      type="date"
                      value={person1.date}
                      onChange={(e) => setPerson1({ ...person1, date: e.target.value })}
                      className="bg-white/10 border-purple-400/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="person1-time" className="text-white">
                      Birth Time (Optional)
                    </Label>
                    <Input
                      id="person1-time"
                      type="time"
                      value={person1.time}
                      onChange={(e) => setPerson1({ ...person1, time: e.target.value })}
                      className="bg-white/10 border-purple-400/30 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person1-location" className="text-white">
                    Birth Location (Optional)
                  </Label>
                  <Input
                    id="person1-location"
                    placeholder="City, Country"
                    value={person1.location}
                    onChange={(e) => setPerson1({ ...person1, location: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Person 2 */}
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-400" />
                  Person 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="person2-name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="person2-name"
                    placeholder="Enter name"
                    value={person2.name}
                    onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="person2-date" className="text-white">
                      Birth Date
                    </Label>
                    <Input
                      id="person2-date"
                      type="date"
                      value={person2.date}
                      onChange={(e) => setPerson2({ ...person2, date: e.target.value })}
                      className="bg-white/10 border-purple-400/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="person2-time" className="text-white">
                      Birth Time (Optional)
                    </Label>
                    <Input
                      id="person2-time"
                      type="time"
                      value={person2.time}
                      onChange={(e) => setPerson2({ ...person2, time: e.target.value })}
                      className="bg-white/10 border-purple-400/30 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person2-location" className="text-white">
                    Birth Location (Optional)
                  </Label>
                  <Input
                    id="person2-location"
                    placeholder="City, Country"
                    value={person2.location}
                    onChange={(e) => setPerson2({ ...person2, location: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={calculateCompatibility}
              disabled={isCalculating || !person1.name || !person1.date || !person2.name || !person2.date}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {isCalculating ? "Calculating Cosmic Connection..." : "Calculate Compatibility"}
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-8">
            {!showResults ? (
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Discover Your Cosmic Connection</h3>
                  <p className="text-purple-200 mb-6">
                    Enter both birth details to reveal your astrological compatibility and relationship insights.
                  </p>
                  <div className="space-y-2 text-sm text-purple-200">
                    <p>• Synastry analysis</p>
                    <p>• Composite chart insights</p>
                    <p>• Relationship predictions</p>
                    <p>• Compatibility percentage</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Compatibility Score */}
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Compatibility Score</CardTitle>
                    <CardDescription className="text-purple-200">
                      {person1.name} & {person2.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-40 h-40 mx-auto">
                        <div className="relative w-full h-full">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(compatibility! * 251.2) / 100} 251.2`}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white">{compatibility}%</div>
                              <div className="text-sm text-purple-200">Compatible</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Badge
                        className={`bg-gradient-to-r ${getCompatibilityColor(compatibility!)} text-white text-lg px-4 py-2`}
                      >
                        {getCompatibilityText(compatibility!)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-purple-200">Love Potential</p>
                        <Progress value={compatibility! - 10} className="mt-2" />
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-purple-200">Communication</p>
                        <Progress value={compatibility! + 5} className="mt-2" />
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-purple-200">Trust</p>
                        <Progress value={compatibility! - 5} className="mt-2" />
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-purple-200">Long-term</p>
                        <Progress value={compatibility!} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-gold-400 mt-0.5" />
                        <div>
                          <h4 className="text-white font-semibold">Strengths</h4>
                          <p className="text-purple-200 text-sm">
                            Your Venus-Mars connection creates passionate attraction. Jupiter aspects bring growth and
                            optimism to the relationship.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-white font-semibold">Growth Areas</h4>
                          <p className="text-purple-200 text-sm">
                            Mercury square may cause communication challenges. Focus on active listening and patience
                            during discussions.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <h4 className="text-white font-semibold">Best Times</h4>
                          <p className="text-purple-200 text-sm">
                            Venus transits in spring will enhance romance. Avoid major decisions during Mercury
                            retrograde periods.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prediction Staking */}
                <Card className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border-gold-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-gold-400">Stake on Future Predictions</CardTitle>
                    <CardDescription className="text-purple-200">
                      Bet on relationship milestones and earn rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">Will they get engaged within 2 years?</span>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            YES
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                          >
                            NO
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">Will they move in together within 1 year?</span>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            YES
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                          >
                            NO
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">Will they still be together in 5 years?</span>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            YES
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                          >
                            NO
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
