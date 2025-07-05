import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, TrendingUp, Clock, Users, DollarSign } from "lucide-react"
import Link from "next/link"

const predictionMarkets = [
  {
    id: 1,
    title: "Will BTC cross $100K by 2025?",
    description: "Based on planetary alignments and market astrology",
    category: "Crypto",
    yesPercentage: 65,
    noPercentage: 35,
    yesPool: "1,250 ASTRO",
    noPool: "675 ASTRO",
    totalPool: "1,925 ASTRO",
    endDate: "Dec 31, 2024",
    participants: 89,
    astrologerPrediction: "YES",
    astrologerName: "Cosmic Chen",
    status: "Active",
  },
  {
    id: 2,
    title: "Mercury Retrograde Tech Stock Impact",
    description: "Will tech stocks drop >10% during next Mercury retrograde?",
    category: "Stocks",
    yesPercentage: 78,
    noPercentage: 22,
    yesPool: "890 ASTRO",
    noPool: "250 ASTRO",
    totalPool: "1,140 ASTRO",
    endDate: "Jan 15, 2025",
    participants: 67,
    astrologerPrediction: "YES",
    astrologerName: "Luna Starweaver",
    status: "Active",
  },
  {
    id: 3,
    title: "Jupiter Transit Impact on Gold",
    description: "Will gold prices rise during Jupiter's transit through Taurus?",
    category: "Commodities",
    yesPercentage: 42,
    noPercentage: 58,
    yesPool: "320 ASTRO",
    noPool: "445 ASTRO",
    totalPool: "765 ASTRO",
    endDate: "May 20, 2025",
    participants: 34,
    astrologerPrediction: "NO",
    astrologerName: "Mystic Maya",
    status: "Active",
  },
  {
    id: 4,
    title: "Solar Eclipse Election Outcome",
    description: "Will the solar eclipse influence the next major election?",
    category: "Politics",
    yesPercentage: 55,
    noPercentage: 45,
    yesPool: "2,100 ASTRO",
    noPool: "1,720 ASTRO",
    totalPool: "3,820 ASTRO",
    endDate: "Nov 5, 2024",
    participants: 156,
    astrologerPrediction: "YES",
    astrologerName: "Oracle Olivia",
    status: "Resolved",
    result: "YES",
  },
  {
    id: 5,
    title: "Mars Retrograde Sports Upset",
    description: "Will there be major sports upsets during Mars retrograde?",
    category: "Sports",
    yesPercentage: 71,
    noPercentage: 29,
    yesPool: "567 ASTRO",
    noPool: "231 ASTRO",
    totalPool: "798 ASTRO",
    endDate: "Mar 10, 2025",
    participants: 45,
    astrologerPrediction: "YES",
    astrologerName: "Stellar Sam",
    status: "Active",
  },
  {
    id: 6,
    title: "Venus Transit Love Surge",
    description: "Will dating app usage spike during Venus transit?",
    category: "Social",
    yesPercentage: 83,
    noPercentage: 17,
    yesPool: "1,456 ASTRO",
    noPool: "298 ASTRO",
    totalPool: "1,754 ASTRO",
    endDate: "Feb 14, 2025",
    participants: 203,
    astrologerPrediction: "YES",
    astrologerName: "Zodiac Zara",
    status: "Active",
  },
]

export default function PredictionsPage() {
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
          <Link href="/predictions/create">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Create Prediction
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Prediction Markets</h1>
          <p className="text-purple-200 text-lg">
            Stake on astrological predictions and earn rewards when forecasts prove accurate
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">12,450</p>
              <p className="text-purple-200 text-sm">Total ASTRO Staked</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">23</p>
              <p className="text-purple-200 text-sm">Active Markets</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">1,234</p>
              <p className="text-purple-200 text-sm">Total Participants</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">87%</p>
              <p className="text-purple-200 text-sm">Accuracy Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Markets Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {predictionMarkets.map((market) => (
            <Card
              key={market.id}
              className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={`${
                          market.status === "Active" ? "bg-green-600/20 text-green-400" : "bg-blue-600/20 text-blue-400"
                        }`}
                      >
                        {market.status}
                      </Badge>
                      <Badge variant="outline" className="border-purple-400/30 text-purple-200">
                        {market.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg mb-2">{market.title}</CardTitle>
                    <CardDescription className="text-purple-200">{market.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Astrologer Prediction */}
                <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-3 border border-purple-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Astrologer Prediction</p>
                      <p className="text-white font-semibold">{market.astrologerName}</p>
                    </div>
                    <Badge
                      className={`${
                        market.astrologerPrediction === "YES" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {market.astrologerPrediction}
                    </Badge>
                  </div>
                </div>

                {/* Betting Pools */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Market Odds</span>
                    <span className="text-purple-200 text-sm">{market.totalPool} total pool</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">YES</span>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{market.yesPercentage}%</p>
                        <p className="text-white/70 text-sm">{market.yesPool}</p>
                      </div>
                    </div>
                    <Progress value={market.yesPercentage} className="h-2 bg-white/10" />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-white">NO</span>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold">{market.noPercentage}%</p>
                        <p className="text-white/70 text-sm">{market.noPool}</p>
                      </div>
                    </div>
                    <Progress value={market.noPercentage} className="h-2 bg-white/10" />
                  </div>
                </div>

                {/* Market Info */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70">{market.participants}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70">{market.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {market.status === "Active" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                      Bet YES
                    </Button>
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                      Bet NO
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-lg border border-blue-400/20">
                    <p className="text-blue-400 font-semibold mb-2">Market Resolved</p>
                    <p className="text-white">
                      Result:{" "}
                      <span className={`font-bold ${market.result === "YES" ? "text-green-400" : "text-red-400"}`}>
                        {market.result}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Market CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Create Your Own Market</h3>
              <p className="text-purple-200 mb-6">
                Have an astrological prediction? Create a market and let the community stake on your forecast.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Create Market
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
