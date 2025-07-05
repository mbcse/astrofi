import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

const zodiacSigns = [
  {
    name: "Aries",
    symbol: "♈",
    date: "Mar 21 - Apr 19",
    horoscope:
      "Mars energizes your career sector today. A bold move in professional matters could lead to unexpected opportunities. Trust your instincts.",
    prediction: "Career breakthrough likely",
    confidence: 85,
    stakePool: "234 ASTRO",
    participants: 45,
    color: "from-red-500 to-red-600",
  },
  {
    name: "Taurus",
    symbol: "♉",
    date: "Apr 20 - May 20",
    horoscope:
      "Venus brings harmony to relationships. Financial matters stabilize. A practical approach to love yields positive results today.",
    prediction: "Financial stability increases",
    confidence: 78,
    stakePool: "189 ASTRO",
    participants: 32,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Gemini",
    symbol: "♊",
    date: "May 21 - Jun 20",
    horoscope:
      "Mercury enhances communication skills. Multiple opportunities present themselves. Stay flexible and adapt to changing circumstances.",
    prediction: "Communication leads to success",
    confidence: 92,
    stakePool: "312 ASTRO",
    participants: 67,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    name: "Cancer",
    symbol: "♋",
    date: "Jun 21 - Jul 22",
    horoscope:
      "Moon phases affect emotions deeply. Home and family take priority. Intuitive decisions prove more valuable than logical ones.",
    prediction: "Family matters resolve positively",
    confidence: 71,
    stakePool: "156 ASTRO",
    participants: 28,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Leo",
    symbol: "♌",
    date: "Jul 23 - Aug 22",
    horoscope:
      "Sun illuminates creative projects. Leadership opportunities arise. Your natural charisma attracts beneficial partnerships.",
    prediction: "Creative project gains recognition",
    confidence: 88,
    stakePool: "278 ASTRO",
    participants: 54,
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "Virgo",
    symbol: "♍",
    date: "Aug 23 - Sep 22",
    horoscope:
      "Mercury brings attention to detail. Health and routine improvements yield long-term benefits. Perfectionism pays off today.",
    prediction: "Health routine shows results",
    confidence: 76,
    stakePool: "198 ASTRO",
    participants: 41,
    color: "from-green-600 to-green-700",
  },
  {
    name: "Libra",
    symbol: "♎",
    date: "Sep 23 - Oct 22",
    horoscope:
      "Venus emphasizes balance and beauty. Partnership decisions require careful consideration. Diplomatic approach wins the day.",
    prediction: "Partnership decision favors you",
    confidence: 83,
    stakePool: "245 ASTRO",
    participants: 52,
    color: "from-pink-500 to-pink-600",
  },
  {
    name: "Scorpio",
    symbol: "♏",
    date: "Oct 23 - Nov 21",
    horoscope:
      "Pluto reveals hidden truths. Transformation begins from within. Deep research uncovers valuable information for future use.",
    prediction: "Hidden opportunity surfaces",
    confidence: 94,
    stakePool: "367 ASTRO",
    participants: 78,
    color: "from-purple-600 to-purple-700",
  },
  {
    name: "Sagittarius",
    symbol: "♐",
    date: "Nov 22 - Dec 21",
    horoscope:
      "Jupiter expands horizons through learning. Travel or education brings unexpected insights. Adventure calls your name today.",
    prediction: "Learning opportunity emerges",
    confidence: 79,
    stakePool: "223 ASTRO",
    participants: 43,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    name: "Capricorn",
    symbol: "♑",
    date: "Dec 22 - Jan 19",
    horoscope:
      "Saturn rewards disciplined efforts. Long-term goals show progress. Authority figures recognize your dedication and hard work.",
    prediction: "Authority recognizes efforts",
    confidence: 87,
    stakePool: "289 ASTRO",
    participants: 61,
    color: "from-gray-600 to-gray-700",
  },
  {
    name: "Aquarius",
    symbol: "♒",
    date: "Jan 20 - Feb 18",
    horoscope:
      "Uranus brings innovative solutions. Technology plays a key role in progress. Unconventional approaches yield surprising results.",
    prediction: "Innovation leads to breakthrough",
    confidence: 91,
    stakePool: "334 ASTRO",
    participants: 72,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    name: "Pisces",
    symbol: "♓",
    date: "Feb 19 - Mar 20",
    horoscope:
      "Neptune enhances intuition and creativity. Dreams provide valuable guidance. Spiritual practices bring inner peace and clarity.",
    prediction: "Intuitive decision proves right",
    confidence: 82,
    stakePool: "267 ASTRO",
    participants: 56,
    color: "from-teal-500 to-teal-600",
  },
]

export default function DailyRashiPage() {
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Daily Rashi</h1>
          <p className="text-purple-200 text-lg mb-6">
            Vote on daily predictions based on your current life experiences. The majority wins the reward pool!
            <Link href="/zodiac-dao" className="text-gold-400 hover:text-gold-300 ml-2 underline">
              Join your Zodiac DAO →
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-purple-200">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-gold-400" />
              <span>
                Today:{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span>1,234 Active Stakers</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-12">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">How Daily Rashi Prediction Markets Work</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Read Your Prediction</h4>
                <p className="text-purple-200 text-sm">
                  Get personalized daily predictions for your zodiac sign from verified astrologers
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Vote Based on Your Life</h4>
                <p className="text-purple-200 text-sm">
                  Say YES or NO based on how this prediction relates to what's currently happening in your life
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Majority Wins Rewards</h4>
                <p className="text-purple-200 text-sm">
                  If you're with the majority (most YES or most NO votes), you earn ASTRO rewards
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">How to Vote</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    <strong>Vote YES</strong> if the prediction resonates with your current life situation or recent
                    experiences.
                    <strong> Vote NO</strong> if it doesn't match what you're experiencing. This isn't about whether the
                    prediction will come true - it's about whether it reflects your current reality. The side with more
                    votes wins the reward pool!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zodiac Signs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {zodiacSigns.map((sign) => (
            <Card
              key={sign.name}
              className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${sign.color} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-2xl">{sign.symbol}</span>
                    </div>
                    <div>
                      <CardTitle className="text-white">{sign.name}</CardTitle>
                      <CardDescription className="text-purple-200 text-sm">{sign.date}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-600/20 text-purple-200">{sign.confidence}% confidence</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Today's Reading</h4>
                  <p className="text-purple-200 text-sm leading-relaxed">{sign.horoscope}</p>
                </div>

                <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg p-3 border border-gold-400/20">
                  <h5 className="text-gold-400 font-semibold text-sm mb-1">Key Prediction</h5>
                  <p className="text-white text-sm">{sign.prediction}</p>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-white">{sign.stakePool}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70">{sign.participants}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm">
                    Vote YES
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-400 text-red-400 hover:bg-red-400/10 text-sm bg-transparent"
                  >
                    Vote NO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Leaderboard */}
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mt-16">
          <CardHeader>
            <CardTitle className="text-white text-center">Today's Leaderboard</CardTitle>
            <CardDescription className="text-purple-200 text-center">
              Top stakers who made the most accurate predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { rank: 1, user: "0x1234...5678", correct: 8, total: 10, earnings: "45.6 ASTRO" },
                { rank: 2, user: "0x9876...4321", correct: 7, total: 9, earnings: "32.1 ASTRO" },
                { rank: 3, user: "0x5555...7777", correct: 6, total: 8, earnings: "28.9 ASTRO" },
                { rank: 4, user: "0x3333...9999", correct: 5, total: 7, earnings: "21.4 ASTRO" },
                { rank: 5, user: "0x7777...1111", correct: 4, total: 6, earnings: "18.2 ASTRO" },
              ].map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        player.rank === 1
                          ? "bg-gold-500"
                          : player.rank === 2
                            ? "bg-gray-400"
                            : player.rank === 3
                              ? "bg-orange-600"
                              : "bg-purple-600"
                      }`}
                    >
                      <span className="text-white font-bold text-sm">{player.rank}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.user}</p>
                      <p className="text-purple-200 text-sm">
                        {player.correct}/{player.total} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">+{player.earnings}</p>
                    <p className="text-purple-200 text-sm">earned today</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
