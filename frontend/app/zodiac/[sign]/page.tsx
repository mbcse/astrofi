"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, MessageSquare, ThumbsUp, ThumbsDown, Plus } from "lucide-react"
import Link from "next/link"

const zodiacData = {
  aries: {
    name: "Aries",
    symbol: "♈",
    element: "Fire",
    dates: "Mar 21 - Apr 19",
    color: "from-red-500 to-red-600",
    description: "The Ram - Bold, ambitious, and energetic",
    members: 1234,
    predictions: 45,
    accuracy: 87,
  },
  // Add other signs...
}

const dailyPredictions = [
  {
    id: 1,
    astrologer: "Luna Starweaver",
    avatar: "L",
    prediction:
      "Mars energizes your career sector today. A bold move in professional matters could lead to unexpected opportunities. Trust your instincts and take calculated risks.",
    confidence: 85,
    votes: { up: 23, down: 3 },
    timestamp: "2 hours ago",
    category: "Career",
  },
  {
    id: 2,
    astrologer: "Cosmic Chen",
    avatar: "C",
    prediction:
      "Venus brings harmony to relationships today. Single Aries may encounter someone special through work connections. Couples should plan something romantic.",
    confidence: 78,
    votes: { up: 18, down: 5 },
    timestamp: "4 hours ago",
    category: "Love",
  },
  {
    id: 3,
    astrologer: "Mystic Maya",
    avatar: "M",
    prediction:
      "Financial opportunities arise through networking. Your natural leadership will attract investors or business partners. Avoid impulsive spending on luxury items.",
    confidence: 92,
    votes: { up: 31, down: 2 },
    timestamp: "6 hours ago",
    category: "Finance",
  },
]

const forumPosts = [
  {
    id: 1,
    author: "AriesWarrior",
    title: "Mars in Aries - Anyone else feeling super energetic?",
    content:
      "I've been feeling incredibly motivated and ready to take on new challenges. Is this the Mars influence everyone talks about?",
    replies: 12,
    likes: 8,
    timestamp: "1 hour ago",
    category: "General Discussion",
  },
  {
    id: 2,
    author: "RamSpirit",
    title: "Career breakthrough prediction came true!",
    content:
      "Luna predicted I'd get a promotion this week and it happened! Her accuracy is incredible. Anyone else had similar experiences?",
    replies: 7,
    likes: 15,
    timestamp: "3 hours ago",
    category: "Success Stories",
  },
  {
    id: 3,
    author: "FireSign2024",
    title: "Best crystals for Aries energy?",
    content:
      "Looking for recommendations on crystals that complement Aries energy. Currently using carnelian and red jasper.",
    replies: 9,
    likes: 6,
    timestamp: "5 hours ago",
    category: "Crystals & Healing",
  },
]

export default function ZodiacDAOPage({ params }: { params: { sign: string } }) {
  const [newPrediction, setNewPrediction] = useState("")
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General Discussion" })
  const [showPredictionForm, setShowPredictionForm] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)

  const sign = zodiacData[params.sign as keyof typeof zodiacData]

  if (!sign) {
    return <div>Zodiac sign not found</div>
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
        {/* Zodiac Header */}
        <div className="text-center mb-12">
          <div
            className={`w-24 h-24 bg-gradient-to-r ${sign.color} rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg`}
          >
            <span className="text-white text-4xl">{sign.symbol}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{sign.name} DAO</h1>
          <p className="text-xl text-purple-200 mb-6">{sign.description}</p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{sign.members}</div>
              <div className="text-purple-300">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{sign.predictions}</div>
              <div className="text-purple-300">Daily Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{sign.accuracy}%</div>
              <div className="text-purple-300">Accuracy Rate</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="predictions" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border-purple-400/20">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              Daily Predictions
            </TabsTrigger>
            <TabsTrigger value="forum" className="data-[state=active]:bg-purple-600">
              Community Forum
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-purple-600">
              DAO Governance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            {/* Add Prediction Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Today's Predictions</h2>
              <Button
                onClick={() => setShowPredictionForm(!showPredictionForm)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prediction
              </Button>
            </div>

            {/* Prediction Form */}
            {showPredictionForm && (
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Submit Daily Prediction</CardTitle>
                  <CardDescription className="text-purple-200">
                    Share your astrological insights for {sign.name} today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your prediction for Aries today..."
                    value={newPrediction}
                    onChange={(e) => setNewPrediction(e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    rows={4}
                  />
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => {
                        // Submit prediction logic
                        setNewPrediction("")
                        setShowPredictionForm(false)
                      }}
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                    >
                      Submit Prediction
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPredictionForm(false)}
                      className="border-purple-400 text-purple-200 hover:bg-purple-400/10 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Predictions List */}
            <div className="space-y-6">
              {dailyPredictions.map((prediction) => (
                <Card key={prediction.id} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold">
                          {prediction.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-white font-semibold">{prediction.astrologer}</h4>
                            <Badge variant="secondary" className="bg-purple-600/20 text-purple-200">
                              {prediction.category}
                            </Badge>
                            <Badge className="bg-green-600/20 text-green-400">
                              {prediction.confidence}% confidence
                            </Badge>
                          </div>
                          <span className="text-purple-300 text-sm">{prediction.timestamp}</span>
                        </div>
                        <p className="text-purple-200 mb-4 leading-relaxed">{prediction.prediction}</p>
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{prediction.votes.up}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                            <span>{prediction.votes.down}</span>
                          </button>
                          <div className="text-purple-300 text-sm">
                            Accuracy:{" "}
                            {Math.round((prediction.votes.up / (prediction.votes.up + prediction.votes.down)) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forum" className="space-y-6">
            {/* Add Post Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Community Discussions</h2>
              <Button
                onClick={() => setShowPostForm(!showPostForm)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>

            {/* Post Form */}
            {showPostForm && (
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Create New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder:text-white/50"
                  />
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    rows={4}
                  />
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => {
                        // Submit post logic
                        setNewPost({ title: "", content: "", category: "General Discussion" })
                        setShowPostForm(false)
                      }}
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                    >
                      Create Post
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPostForm(false)}
                      className="border-purple-400 text-purple-200 hover:bg-purple-400/10 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Forum Posts */}
            <div className="space-y-6">
              {forumPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-white/5 border-purple-400/20 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{post.author[0]}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{post.author}</h4>
                          <span className="text-purple-300 text-sm">{post.timestamp}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-200">
                        {post.category}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-purple-200 mb-4">{post.content}</p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-purple-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies} replies</span>
                      </div>
                      <div className="flex items-center space-x-2 text-purple-300">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">DAO Governance</CardTitle>
                <CardDescription className="text-purple-200">
                  Participate in {sign.name} DAO decisions and proposals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Your Voting Power</h4>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">ARIES Tokens:</span>
                        <span className="text-white font-semibold">1,250</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Voting Power:</span>
                        <span className="text-gold-400 font-semibold">0.12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Proposals Voted:</span>
                        <span className="text-white font-semibold">8</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">DAO Stats</h4>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Active Proposals:</span>
                        <span className="text-white font-semibold">3</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Total Members:</span>
                        <span className="text-white font-semibold">{sign.members}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Treasury:</span>
                        <span className="text-gold-400 font-semibold">45,000 ASTRO</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Active Proposals</h4>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Increase daily prediction rewards",
                        description: "Proposal to increase rewards for accurate daily predictions from 10 to 15 ASTRO",
                        votes: { for: 234, against: 45 },
                        timeLeft: "2 days",
                      },
                      {
                        title: "Add new astrologer verification criteria",
                        description: "Implement stricter verification process for new astrologers joining the DAO",
                        votes: { for: 189, against: 67 },
                        timeLeft: "5 days",
                      },
                    ].map((proposal, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2">{proposal.title}</h5>
                        <p className="text-purple-200 text-sm mb-3">{proposal.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4 text-sm">
                            <span className="text-green-400">For: {proposal.votes.for}</span>
                            <span className="text-red-400">Against: {proposal.votes.against}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Vote For
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                            >
                              Vote Against
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
