import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Star, TrendingUp, Clock, DollarSign, MessageCircle, Video } from "lucide-react"
import Link from "next/link"

// Mock data for astrologer profile
const astrologerData = {
  1: {
    name: "Luna Starweaver",
    specialty: "Love & Relationships",
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    accuracy: "89%",
    price: "50 ASTRO",
    tokenSymbol: "LUNA",
    tokenPrice: "$2.45",
    change: "+12.5%",
    bio: "Luna has been practicing astrology for over 15 years, specializing in love and relationship guidance. She combines traditional Western astrology with modern psychological insights to provide deep, meaningful readings that help clients understand their romantic patterns and potential.",
    achievements: [
      "Certified Professional Astrologer (ISAR)",
      "Featured in Cosmic Weekly Magazine",
      "1000+ successful relationship predictions",
      "Top-rated astrologer 3 years running",
    ],
    services: [
      {
        name: "Love Reading",
        duration: "30 min",
        price: "50 ASTRO",
        description: "Deep dive into your romantic potential",
      },
      {
        name: "Compatibility Analysis",
        duration: "45 min",
        price: "75 ASTRO",
        description: "Compare charts with your partner",
      },
      {
        name: "Relationship Forecast",
        duration: "60 min",
        price: "100 ASTRO",
        description: "Year-ahead relationship predictions",
      },
    ],
    recentPredictions: [
      {
        date: "2024-01-15",
        prediction: "Venus transit will bring new love opportunities",
        status: "Correct",
        accuracy: 94,
      },
      {
        date: "2024-01-10",
        prediction: "Mercury retrograde will cause communication issues",
        status: "Correct",
        accuracy: 87,
      },
      {
        date: "2024-01-05",
        prediction: "Full moon will trigger relationship decisions",
        status: "Correct",
        accuracy: 91,
      },
    ],
    reviews: [
      {
        user: "Sarah M.",
        rating: 5,
        comment:
          "Luna's reading was incredibly accurate! She predicted my breakup and new relationship timeline perfectly.",
        date: "2024-01-20",
      },
      {
        user: "Mike R.",
        rating: 5,
        comment: "Amazing insights into my relationship patterns. Her advice helped me understand my partner better.",
        date: "2024-01-18",
      },
      {
        user: "Emma L.",
        rating: 4,
        comment: "Very detailed reading, though some predictions are still pending. Overall great experience.",
        date: "2024-01-15",
      },
    ],
  },
}

export default function AstrologerProfilePage({ params }: { params: { id: string } }) {
  const astrologer = astrologerData[params.id as keyof typeof astrologerData]

  if (!astrologer) {
    return <div>Astrologer not found</div>
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-3xl font-bold">
                      {astrologer.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{astrologer.name}</h1>
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-200">
                        {astrologer.specialty}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-gold-400 fill-current" />
                        <span className="text-gold-400 font-semibold">{astrologer.rating}</span>
                        <span className="text-white/60">({astrologer.reviews} reviews)</span>
                      </div>
                    </div>
                    <p className="text-purple-200 mb-6">{astrologer.bio}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-white/60">Experience</p>
                        <p className="text-white font-semibold">{astrologer.experience}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60">Accuracy</p>
                        <p className="text-green-400 font-semibold">{astrologer.accuracy}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60">Base Price</p>
                        <p className="text-white font-semibold">{astrologer.price}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60">Token Price</p>
                        <p className="text-gold-400 font-semibold">{astrologer.tokenPrice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border-gold-400/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gold-400 font-semibold">${astrologer.tokenSymbol}</span>
                      <span
                        className={`text-sm ${astrologer.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                      >
                        {astrologer.change}
                      </span>
                    </div>
                    <p className="text-white text-xl font-bold">{astrologer.tokenPrice}</p>
                    <Button
                      asChild
                      className="w-full mt-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                    >
                      <Link href={`/buy-token/${astrologer.tokenSymbol}`}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Buy Token
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Link href={`/book-session/${params.id}`}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/book-session/${params.id}`}>
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border-purple-400/20">
            <TabsTrigger value="services" className="data-[state=active]:bg-purple-600">
              Services
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              Predictions
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {astrologer.services.map((service, index) => (
                <Card key={index} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">{service.name}</CardTitle>
                    <CardDescription className="text-purple-200">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-white/70">{service.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gold-400" />
                        <span className="text-gold-400 font-semibold">{service.price}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      <Link href={`/book-session/${params.id}`}>Book Session</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Predictions</CardTitle>
                <CardDescription className="text-purple-200">
                  Track record of recent astrological forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {astrologer.recentPredictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{prediction.prediction}</p>
                        <p className="text-purple-200 text-sm">{prediction.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${prediction.status === "Correct" ? "bg-green-600" : "bg-yellow-600"} text-white mb-2`}
                        >
                          {prediction.status}
                        </Badge>
                        <p className="text-white/70 text-sm">{prediction.accuracy}% accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="grid gap-6">
              {astrologer.reviews.map((review, index) => (
                <Card key={index} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white font-semibold">{review.user}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-gold-400 fill-current" : "text-gray-400"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-purple-200 text-sm">{review.date}</span>
                    </div>
                    <p className="text-purple-200">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Professional Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {astrologer.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <Star className="w-5 h-5 text-gold-400" />
                      <span className="text-white">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
