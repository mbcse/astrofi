"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, Users, TrendingUp, MessageSquare, Star, Heart, 
  ArrowUp, ArrowDown, Send, Crown, Coins, Clock, CheckCircle,
  Loader2, AlertCircle, Calendar, Eye, MessageCircle
} from "lucide-react"
import Link from "next/link"
import { contractService } from "@/lib/contracts"
import { usePrivy } from "@privy-io/react-auth"
import { ethers } from "ethers"
import { toast } from "sonner"

// Zodiac sign mappings
const zodiacSignMap = {
  0: "Aries", 1: "Taurus", 2: "Gemini", 3: "Cancer", 
  4: "Leo", 5: "Virgo", 6: "Libra", 7: "Scorpio",
  8: "Sagittarius", 9: "Capricorn", 10: "Aquarius", 11: "Pisces"
}

const zodiacSigns = [
  {
    id: 0, name: "Aries", symbol: "♈", element: "Fire", dates: "Mar 21 - Apr 19",
    color: "from-red-500 to-red-600", members: 1234, accuracy: 87
  },
  {
    id: 1, name: "Taurus", symbol: "♉", element: "Earth", dates: "Apr 20 - May 20",
    color: "from-green-500 to-green-600", members: 1089, accuracy: 91
  },
  {
    id: 2, name: "Gemini", symbol: "♊", element: "Air", dates: "May 21 - Jun 20",
    color: "from-yellow-500 to-yellow-600", members: 1456, accuracy: 84
  },
  {
    id: 3, name: "Cancer", symbol: "♋", element: "Water", dates: "Jun 21 - Jul 22",
    color: "from-blue-500 to-blue-600", members: 987, accuracy: 89
  },
  {
    id: 4, name: "Leo", symbol: "♌", element: "Fire", dates: "Jul 23 - Aug 22",
    color: "from-orange-500 to-orange-600", members: 1567, accuracy: 86
  },
  {
    id: 5, name: "Virgo", symbol: "♍", element: "Earth", dates: "Aug 23 - Sep 22",
    color: "from-green-600 to-green-700", members: 1123, accuracy: 92
  },
  {
    id: 6, name: "Libra", symbol: "♎", element: "Air", dates: "Sep 23 - Oct 22",
    color: "from-pink-500 to-pink-600", members: 1345, accuracy: 88
  },
  {
    id: 7, name: "Scorpio", symbol: "♏", element: "Water", dates: "Oct 23 - Nov 21",
    color: "from-purple-600 to-purple-700", members: 1678, accuracy: 94
  },
  {
    id: 8, name: "Sagittarius", symbol: "♐", element: "Fire", dates: "Nov 22 - Dec 21",
    color: "from-indigo-500 to-indigo-600", members: 1234, accuracy: 85
  },
  {
    id: 9, name: "Capricorn", symbol: "♑", element: "Earth", dates: "Dec 22 - Jan 19",
    color: "from-gray-600 to-gray-700", members: 1098, accuracy: 90
  },
  {
    id: 10, name: "Aquarius", symbol: "♒", element: "Air", dates: "Jan 20 - Feb 18",
    color: "from-cyan-500 to-cyan-600", members: 1456, accuracy: 87
  },
  {
    id: 11, name: "Pisces", symbol: "♓", element: "Water", dates: "Feb 19 - Mar 20",
    color: "from-teal-500 to-teal-600", members: 1289, accuracy: 91
  }
]

// Mock forum discussions with realistic names and meaningful predictions
const forumDiscussions = [
  {
    id: 1,
    zodiacId: 7, // Scorpio
    title: "Mercury Retrograde Impact on Career Moves",
    author: "SarahMysticScorpio",
    authorReputation: 4.8,
    timeAgo: "2 hours ago",
    content: "Fellow Scorpios! With Mercury retrograde hitting our career sector this week, I predicted major workplace changes. My prediction: 3 of us will get unexpected job offers by Friday. Vote if you think this resonates with your current situation!",
    upvotes: 24,
    downvotes: 3,
    replies: 12,
    prediction: "3 Scorpios in this group will receive job offers by Friday",
    predictionDeadline: "2024-01-19",
    votes: { yes: 18, no: 7 },
    userVote: null,
    tags: ["Career", "Mercury Retrograde", "Prediction"],
    replies: [
      {
        id: 101,
        author: "DeepWaterScorp",
        authorReputation: 4.2,
        timeAgo: "1 hour ago",
        content: "This is so accurate! I literally got a call from a recruiter this morning. The timing is uncanny. Voting YES on this prediction!",
        upvotes: 8,
        downvotes: 0
      },
      {
        id: 102,
        author: "ScorpionStinger88",
        authorReputation: 3.9,
        timeAgo: "45 minutes ago",
        content: "I'm feeling the energy shift too. My boss has been acting strange lately. Could be leading to something big. 🦂",
        upvotes: 5,
        downvotes: 1
      }
    ]
  },
  {
    id: 2,
    zodiacId: 4, // Leo
    title: "Full Moon Leo Energy - Relationship Predictions",
    author: "LionHeartLuna",
    authorReputation: 4.6,
    timeAgo: "4 hours ago",
    content: "The full moon in our sign is bringing intense relationship energy! I'm seeing a pattern: Leos who have been single will have a romantic encounter this weekend. This feels strong - anyone else sensing this?",
    upvotes: 31,
    downvotes: 5,
    replies: 18,
    prediction: "Single Leos will have romantic encounters this weekend",
    predictionDeadline: "2024-01-21",
    votes: { yes: 28, no: 8 },
    userVote: null,
    tags: ["Love", "Full Moon", "Weekend"],
    replies: [
      {
        id: 201,
        author: "SunshineKing",
        authorReputation: 4.1,
        timeAgo: "3 hours ago",
        content: "I can feel it too! Already got invited to two parties this weekend. The universe is aligning ✨",
        upvotes: 12,
        downvotes: 0
      }
    ]
  },
  {
    id: 3,
    zodiacId: 11, // Pisces
    title: "Dream Synchronicities Coming True",
    author: "NeptunianEmpath",
    authorReputation: 4.9,
    timeAgo: "6 hours ago",
    content: "My fellow fish! I've been having incredibly vivid dreams lately, and they're starting to manifest in real life. I predict that 5 Pisces in our community will experience a meaningful coincidence related to their recent dreams within 48 hours.",
    upvotes: 42,
    downvotes: 2,
    replies: 23,
    prediction: "5 Pisces will experience dream-related synchronicities in 48 hours",
    predictionDeadline: "2024-01-18",
    votes: { yes: 38, no: 6 },
    userVote: null,
    tags: ["Dreams", "Synchronicity", "Intuition"],
    replies: [
      {
        id: 301,
        author: "OceanDreamer",
        authorReputation: 4.3,
        timeAgo: "5 hours ago",
        content: "This is happening to me right now! I dreamed about finding a lost ring and today my grandmother gave me her vintage emerald ring 'out of nowhere'. Pisces intuition is REAL!",
        upvotes: 15,
        downvotes: 0
      },
      {
        id: 302,
        author: "FlowingWaters",
        authorReputation: 4.0,
        timeAgo: "4 hours ago",
        content: "The veil is definitely thin right now. I keep seeing repeating numbers everywhere since my prophetic dream on Monday.",
        upvotes: 8,
        downvotes: 1
      }
    ]
  },
  {
    id: 4,
    zodiacId: 2, // Gemini
    title: "Communication Breakthrough Week",
    author: "TwinFlameMessenger",
    authorReputation: 4.4,
    timeAgo: "8 hours ago",
    content: "Geminis! This week's planetary alignment is perfect for communication breakthroughs. I predict that someone you've been wanting to hear from will reach out unexpectedly before Thursday. The energy is building!",
    upvotes: 28,
    downvotes: 4,
    replies: 15,
    prediction: "You'll hear from someone important before Thursday",
    predictionDeadline: "2024-01-18",
    votes: { yes: 22, no: 9 },
    userVote: null,
    tags: ["Communication", "Relationships", "Weekly"],
    replies: [
      {
        id: 401,
        author: "MercuryInMotion",
        authorReputation: 3.8,
        timeAgo: "7 hours ago",
        content: "Already happened! My ex texted me yesterday asking to talk. Haven't heard from them in 6 months. Your timing is incredible!",
        upvotes: 11,
        downvotes: 0
      }
    ]
  },
  {
    id: 5,
    zodiacId: 10, // Aquarius  
    title: "Technology & Innovation Breakthroughs",
    author: "QuantumWaterBearer",
    authorReputation: 4.7,
    timeAgo: "12 hours ago",
    content: "Fellow Aquarians! I'm getting strong visions about technological breakthroughs this month. My prediction: At least 2 people in our DAO will have a eureka moment about a tech project or innovation by month's end. The collective consciousness is buzzing with new ideas!",
    upvotes: 35,
    downvotes: 3,
    replies: 20,
    prediction: "2 Aquarians will have tech innovation breakthroughs this month",
    predictionDeadline: "2024-01-31",
    votes: { yes: 31, no: 7 },
    userVote: null,
    tags: ["Technology", "Innovation", "Monthly"],
    replies: [
      {
        id: 501,
        author: "ElectricMind",
        authorReputation: 4.2,
        timeAgo: "10 hours ago",
        content: "I've been working on an AI project and suddenly everything clicked today! This prediction might be spot on 🤖⚡",
        upvotes: 14,
        downvotes: 0
      }
    ]
  }
]

export default function ZodiacDAOPage() {
  const { authenticated, user } = usePrivy()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [userMemberships, setUserMemberships] = useState<any[]>([])
  const [joiningDAO, setJoiningDAO] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [discussions, setDiscussions] = useState(forumDiscussions)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTitle, setNewPostTitle] = useState("")
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null)

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadUserMemberships()
    }
  }, [authenticated, user])

  const loadUserMemberships = async () => {
    if (!user?.wallet?.address) return
    
    try {
      setLoading(true)
      const memberships = await contractService.getUserDAOMemberships(user.wallet.address)
      console.log("User memberships:", memberships)
      setUserMemberships(memberships)
    } catch (error) {
      console.error("Error loading memberships:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinDAO = async (zodiacId: number, membershipPrice: string = "0.01") => {
    if (!user?.wallet?.address) return
    
    try {
      setJoiningDAO(zodiacId)
      
      // Setup signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      contractService.setSigner(signer)

      // Create simple token URI
      const tokenURI = `https://astrofi.app/zodiac/${zodiacId}/membership.json`
      
      await contractService.joinZodiacDAO(zodiacId, tokenURI, membershipPrice)
      
      toast.success(`Successfully joined ${zodiacSigns[zodiacId].name} DAO!`)
      await loadUserMemberships()
    } catch (error: any) {
      console.error("Error joining DAO:", error)
      toast.error(error.message || "Failed to join DAO")
    } finally {
      setJoiningDAO(null)
    }
  }

  const handleVote = (discussionId: number, vote: boolean) => {
    setDiscussions(prevDiscussions =>
      prevDiscussions.map(discussion => {
        if (discussion.id === discussionId) {
          const newVotes = { ...discussion.votes }
          if (vote) {
            newVotes.yes += 1
          } else {
            newVotes.no += 1
          }
          return { ...discussion, votes: newVotes, userVote: vote }
        }
        return discussion
      })
    )
    toast.success(`Vote recorded: ${vote ? 'Yes' : 'No'}`)
  }

  const handleUpvote = (discussionId: number) => {
    setDiscussions(prevDiscussions =>
      prevDiscussions.map(discussion => {
        if (discussion.id === discussionId) {
          return { ...discussion, upvotes: discussion.upvotes + 1 }
        }
        return discussion
      })
    )
  }

  const isUserMember = (zodiacId: number) => {
    return userMemberships.some(membership => Number(membership) === zodiacId)
  }

  const getTimeUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return "Ended"
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Zodiac DAOs</h1>
          <p className="text-purple-200 text-lg">
            Join your zodiac sign's community for predictions, discussions, and governance
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border-purple-400/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Community Overview
            </TabsTrigger>
            <TabsTrigger value="discussions" className="data-[state=active]:bg-purple-600">
              Live Discussions
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              Active Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">15,566</p>
                  <p className="text-purple-200 text-sm">Total Members</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">1,247</p>
                  <p className="text-purple-200 text-sm">Active Predictions</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">89%</p>
                  <p className="text-purple-200 text-sm">Avg Accuracy</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">3,891</p>
                  <p className="text-purple-200 text-sm">Daily Messages</p>
                </CardContent>
              </Card>
            </div>

            {/* Zodiac DAOs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zodiacSigns.map((zodiac) => (
                <Card key={zodiac.id} className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${zodiac.color} flex items-center justify-center text-white text-2xl font-bold`}>
                          {zodiac.symbol}
                        </div>
                        <div>
                          <CardTitle className="text-white">{zodiac.name}</CardTitle>
                          <p className="text-purple-200 text-sm">{zodiac.dates}</p>
                        </div>
                      </div>
                      {isUserMember(zodiac.id) && (
                        <Badge className="bg-green-600/20 text-green-400 border-green-400/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Member
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-purple-200">Members</p>
                        <p className="text-white font-semibold">{zodiac.members.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-200">Accuracy</p>
                        <p className="text-white font-semibold">{zodiac.accuracy}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-200">
                        {zodiac.element} Element
                      </Badge>
                    </div>

                    {!isUserMember(zodiac.id) ? (
                      <Button
                        onClick={() => handleJoinDAO(zodiac.id)}
                        disabled={joiningDAO === zodiac.id || !authenticated}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        {joiningDAO === zodiac.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            Join DAO (0.01 FLOW)
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setSelectedTab("discussions")}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enter Forum
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar - Zodiac Filter */}
              <div className="lg:col-span-1">
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Filter by Sign</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={selectedZodiac === null ? "default" : "ghost"}
                      onClick={() => setSelectedZodiac(null)}
                      className="w-full justify-start"
                    >
                      All Signs
                    </Button>
                    {zodiacSigns.map((zodiac) => (
                      <Button
                        key={zodiac.id}
                        variant={selectedZodiac === zodiac.id ? "default" : "ghost"}
                        onClick={() => setSelectedZodiac(zodiac.id)}
                        className="w-full justify-start"
                      >
                        <span className="mr-2">{zodiac.symbol}</span>
                        {zodiac.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Main Discussion Feed */}
              <div className="lg:col-span-3 space-y-6">
                {discussions
                  .filter(discussion => selectedZodiac === null || discussion.zodiacId === selectedZodiac)
                  .map((discussion) => (
                    <Card key={discussion.id} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${zodiacSigns[discussion.zodiacId].color} flex items-center justify-center text-white font-bold`}>
                              {zodiacSigns[discussion.zodiacId].symbol}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-white font-semibold">{discussion.title}</h3>
                                <Badge className="bg-purple-600/20 text-purple-200">
                                  {zodiacSigns[discussion.zodiacId].name}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-3 text-sm text-purple-200">
                                <span>{discussion.author}</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-gold-400" />
                                  <span>{discussion.authorReputation}</span>
                                </div>
                                <span>{discussion.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-white leading-relaxed">{discussion.content}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {discussion.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-600/10 text-purple-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Prediction Voting */}
                        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-400/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-gold-400" />
                            <span className="text-white font-semibold">Prediction</span>
                            <Badge className="bg-blue-600/20 text-blue-300">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeUntilDeadline(discussion.predictionDeadline)}
                            </Badge>
                          </div>
                          <p className="text-purple-200 mb-3">{discussion.prediction}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={discussion.userVote === true ? "default" : "outline"}
                                onClick={() => handleVote(discussion.id, true)}
                                className="bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Yes ({discussion.votes.yes})
                              </Button>
                              <Button
                                size="sm"
                                variant={discussion.userVote === false ? "default" : "outline"}
                                onClick={() => handleVote(discussion.id, false)}
                                className="bg-red-600/20 border-red-400/30 text-red-300 hover:bg-red-600/30"
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No ({discussion.votes.no})
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Engagement Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(discussion.id)}
                              className="text-purple-200 hover:text-white"
                            >
                              <ArrowUp className="w-4 h-4 mr-1" />
                              {discussion.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {discussion.replies.length}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white">
                              <Eye className="w-4 h-4 mr-1" />
                              {Math.floor(Math.random() * 200) + 50}
                            </Button>
                          </div>
                        </div>

                        {/* Recent Replies Preview */}
                        {discussion.replies.length > 0 && (
                          <div className="space-y-3 pl-4 border-l-2 border-purple-400/30">
                            {discussion.replies.slice(0, 2).map((reply) => (
                              <div key={reply.id} className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-purple-200 font-medium">{reply.author}</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-gold-400" />
                                    <span className="text-gold-300 text-sm">{reply.authorReputation}</span>
                                  </div>
                                  <span className="text-purple-300 text-sm">{reply.timeAgo}</span>
                                </div>
                                <p className="text-white text-sm">{reply.content}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white h-6 px-2">
                                    <ArrowUp className="w-3 h-3 mr-1" />
                                    {reply.upvotes}
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {discussion.replies.length > 2 && (
                              <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                                View all {discussion.replies.length} replies
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {discussions
                .filter(discussion => new Date(discussion.predictionDeadline) > new Date())
                .map((discussion) => (
                  <Card key={discussion.id} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${zodiacSigns[discussion.zodiacId].color} flex items-center justify-center text-white font-bold`}>
                            {zodiacSigns[discussion.zodiacId].symbol}
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{discussion.title}</CardTitle>
                            <p className="text-purple-200 text-sm">by {discussion.author}</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-600/20 text-blue-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeUntilDeadline(discussion.predictionDeadline)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-white">{discussion.prediction}</p>
                      
                      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">Current Votes</span>
                          <span className="text-white font-semibold">
                            {discussion.votes.yes + discussion.votes.no} total
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-green-300">Yes</span>
                            <span className="text-green-300">{discussion.votes.yes}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{
                                width: `${(discussion.votes.yes / (discussion.votes.yes + discussion.votes.no)) * 100}%`
                              }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-red-300">No</span>
                            <span className="text-red-300">{discussion.votes.no}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{
                                width: `${(discussion.votes.no / (discussion.votes.yes + discussion.votes.no)) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleVote(discussion.id, true)}
                          className="flex-1 bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30"
                          disabled={discussion.userVote !== null}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Vote Yes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVote(discussion.id, false)}
                          className="flex-1 bg-red-600/20 border-red-400/30 text-red-300 hover:bg-red-600/30"
                          disabled={discussion.userVote !== null}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Vote No
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
