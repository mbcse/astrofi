import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Shield, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

const astrologers = [
  {
    id: 1,
    name: "Luna Starweaver",
    reputation: 94,
    totalVotes: 1234,
    positiveVotes: 1160,
    negativeVotes: 74,
    accuracy: "89%",
    totalPredictions: 456,
    correctPredictions: 406,
    status: "Verified",
    trend: "up",
    recentCases: [
      { type: "success", description: "Correctly predicted BTC price movement", votes: 45 },
      { type: "success", description: "Accurate relationship timeline prediction", votes: 32 },
    ],
  },
  {
    id: 2,
    name: "Cosmic Chen",
    reputation: 87,
    totalVotes: 987,
    positiveVotes: 859,
    negativeVotes: 128,
    accuracy: "92%",
    totalPredictions: 234,
    correctPredictions: 215,
    status: "Verified",
    trend: "up",
    recentCases: [
      { type: "success", description: "Predicted market crash timing", votes: 67 },
      { type: "dispute", description: "Career prediction disputed by client", votes: 23 },
    ],
  },
  {
    id: 3,
    name: "Mystic Maya",
    reputation: 76,
    totalVotes: 654,
    positiveVotes: 497,
    negativeVotes: 157,
    accuracy: "87%",
    totalPredictions: 189,
    correctPredictions: 164,
    status: "Under Review",
    trend: "down",
    recentCases: [
      { type: "dispute", description: "Failed prediction about election outcome", votes: 89 },
      { type: "success", description: "Accurate health prediction", votes: 34 },
    ],
  },
  {
    id: 4,
    name: "Stellar Sam",
    reputation: 82,
    totalVotes: 432,
    positiveVotes: 354,
    negativeVotes: 78,
    accuracy: "85%",
    totalPredictions: 123,
    correctPredictions: 104,
    status: "Verified",
    trend: "stable",
    recentCases: [
      { type: "success", description: "Sports prediction came true", votes: 28 },
      { type: "success", description: "Weather pattern prediction accurate", votes: 19 },
    ],
  },
]

const recentCases = [
  {
    id: 1,
    astrologer: "Luna Starweaver",
    type: "Failed Prediction",
    description:
      "Predicted that Mercury retrograde would cause major tech stock crash in Q4 2024, but stocks actually rose 15%",
    evidence: "Market data shows NASDAQ gained 15% during the predicted period",
    submittedBy: "0x1234...5678",
    votes: { support: 67, oppose: 23 },
    status: "Active",
    reward: "50 ASTRO",
    timeLeft: "5 days",
  },
  {
    id: 2,
    astrologer: "Cosmic Chen",
    type: "Accuracy Verification",
    description: "Successfully predicted Bitcoin price movement based on planetary alignments",
    evidence: "BTC moved from $45K to $52K as predicted within the specified timeframe",
    submittedBy: "0x9876...4321",
    votes: { support: 89, oppose: 12 },
    status: "Resolved",
    reward: "25 ASTRO",
    result: "Verified",
  },
  {
    id: 3,
    astrologer: "Mystic Maya",
    type: "Misleading Claims",
    description: "Claimed 95% accuracy rate but actual verified rate is only 78%",
    evidence: "Analysis of 200+ predictions shows discrepancy in claimed vs actual accuracy",
    submittedBy: "0x5555...7777",
    votes: { support: 134, oppose: 45 },
    status: "Under Investigation",
    reward: "75 ASTRO",
    timeLeft: "12 days",
  },
]

export default function ReputationDAOPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Reputation DAO</h1>
          <p className="text-purple-200 text-lg">
            Community governance for astrologer credibility and accuracy verification
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">23</p>
              <p className="text-purple-200 text-sm">Verified Astrologers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">1,456</p>
              <p className="text-purple-200 text-sm">DAO Members</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-purple-200 text-sm">Active Cases</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">2,340</p>
              <p className="text-purple-200 text-sm">ASTRO Rewards Paid</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="astrologers" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border-purple-400/20">
            <TabsTrigger value="astrologers" className="data-[state=active]:bg-purple-600">
              Astrologer Rankings
            </TabsTrigger>
            <TabsTrigger value="cases" className="data-[state=active]:bg-purple-600">
              Active Cases
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-purple-600">
              Governance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="astrologers" className="space-y-6">
            <div className="space-y-6">
              {astrologers.map((astrologer, index) => (
                <Card key={astrologer.id} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-4 gap-6 items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-gold-500"
                                : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-orange-600"
                                    : "bg-purple-600"
                            }`}
                          >
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold">
                              {astrologer.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{astrologer.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`${
                                astrologer.status === "Verified"
                                  ? "bg-green-600"
                                  : astrologer.status === "Under Review"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                              } text-white`}
                            >
                              {astrologer.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {astrologer.trend === "up" ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              ) : astrologer.trend === "down" ? (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">{astrologer.reputation}</div>
                        <div className="text-purple-200 text-sm">Reputation Score</div>
                        <Progress value={astrologer.reputation} className="mt-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-green-400 font-semibold">{astrologer.positiveVotes}</p>
                          <p className="text-purple-200">Positive Votes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-400 font-semibold">{astrologer.negativeVotes}</p>
                          <p className="text-purple-200">Negative Votes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold">{astrologer.accuracy}</p>
                          <p className="text-purple-200">Accuracy Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold">{astrologer.totalPredictions}</p>
                          <p className="text-purple-200">Total Predictions</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Vote Positive
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </div>

                    {astrologer.recentCases.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-purple-400/20">
                        <h4 className="text-white font-semibold mb-3">Recent Cases</h4>
                        <div className="space-y-2">
                          {astrologer.recentCases.map((case_, caseIndex) => (
                            <div key={caseIndex} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <div className="flex items-center space-x-2">
                                {case_.type === "success" ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                )}
                                <span className="text-white text-sm">{case_.description}</span>
                              </div>
                              <span className="text-purple-200 text-sm">{case_.votes} votes</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <div className="space-y-6">
              {recentCases.map((case_) => (
                <Card key={case_.id} className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          <span>{case_.type}</span>
                        </CardTitle>
                        <CardDescription className="text-purple-200">
                          Against: {case_.astrologer} • Submitted by: {case_.submittedBy}
                        </CardDescription>
                      </div>
                      <Badge
                        className={`${
                          case_.status === "Active"
                            ? "bg-yellow-600"
                            : case_.status === "Resolved"
                              ? "bg-green-600"
                              : "bg-blue-600"
                        } text-white`}
                      >
                        {case_.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Description</h4>
                      <p className="text-purple-200">{case_.description}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Evidence</h4>
                      <p className="text-purple-200">{case_.evidence}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400">Support</span>
                          <span className="text-white font-semibold">{case_.votes.support}</span>
                        </div>
                        <Progress
                          value={(case_.votes.support / (case_.votes.support + case_.votes.oppose)) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-red-400">Oppose</span>
                          <span className="text-white font-semibold">{case_.votes.oppose}</span>
                        </div>
                        <Progress
                          value={(case_.votes.oppose / (case_.votes.support + case_.votes.oppose)) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-center">
                          <p className="text-gold-400 font-semibold">{case_.reward}</p>
                          <p className="text-purple-200 text-sm">Reward Pool</p>
                        </div>
                      </div>
                    </div>

                    {case_.status === "Active" && (
                      <div className="flex items-center justify-between pt-4 border-t border-purple-400/20">
                        <div className="flex space-x-3">
                          <Button className="bg-green-600 hover:bg-green-700 text-white">Vote Support</Button>
                          <Button
                            variant="outline"
                            className="border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                          >
                            Vote Oppose
                          </Button>
                        </div>
                        <div className="text-purple-200 text-sm">{case_.timeLeft} remaining</div>
                      </div>
                    )}

                    {case_.status === "Resolved" && (
                      <div className="pt-4 border-t border-purple-400/20">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-semibold">Case Resolved: {case_.result}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Submit a New Case</h3>
                <p className="text-purple-200 mb-6">
                  Have evidence of inaccurate predictions or misleading claims? Submit a case for community review.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Submit Case
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">DAO Governance</CardTitle>
                <CardDescription className="text-purple-200">
                  Participate in community decisions and protocol upgrades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Voting Power</h4>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Your ASTRO Balance</span>
                        <span className="text-white font-semibold">1,250 ASTRO</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Staked for Voting</span>
                        <span className="text-gold-400 font-semibold">800 ASTRO</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Voting Power</span>
                        <span className="text-white font-semibold">0.08%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Participation Stats</h4>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Cases Voted On</span>
                        <span className="text-white font-semibold">23</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200">Accuracy Rate</span>
                        <span className="text-green-400 font-semibold">87%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Rewards Earned</span>
                        <span className="text-gold-400 font-semibold">145 ASTRO</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-semibold">How It Works</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <h5 className="text-white font-semibold mb-2">Stake ASTRO</h5>
                      <p className="text-purple-200 text-sm">Lock your tokens to gain voting power in the DAO</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h5 className="text-white font-semibold mb-2">Vote on Cases</h5>
                      <p className="text-purple-200 text-sm">Review evidence and vote on astrologer accuracy</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <h5 className="text-white font-semibold mb-2">Earn Rewards</h5>
                      <p className="text-purple-200 text-sm">Get rewarded for accurate voting and participation</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    Stake ASTRO
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-400 text-purple-200 hover:bg-purple-400/10 bg-transparent"
                  >
                    View Proposals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
