"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Coins, TrendingUp, Users, Star, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CreateTokenPage() {
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    totalSupply: "",
    description: "",
    specialty: "",
    sessionPrice: "",
    stakingReward: "",
    website: "",
    twitter: "",
  })

  const [step, setStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateToken = async () => {
    setIsCreating(true)
    // Simulate token creation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsCreating(false)
    setStep(4)
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Create Your AstroToken</h1>
          <p className="text-purple-200 text-lg">
            Launch your personal ERC-20 token and monetize your astrological expertise
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNum
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNum ? "bg-gradient-to-r from-purple-500 to-purple-600" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                Token Details
              </CardTitle>
              <CardDescription className="text-purple-200">
                Define your token's basic properties and characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tokenName" className="text-white">
                    Token Name
                  </Label>
                  <Input
                    id="tokenName"
                    placeholder="e.g., Luna Starweaver Token"
                    value={tokenData.name}
                    onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol" className="text-white">
                    Token Symbol
                  </Label>
                  <Input
                    id="tokenSymbol"
                    placeholder="e.g., LUNA"
                    value={tokenData.symbol}
                    onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalSupply" className="text-white">
                  Total Supply
                </Label>
                <Input
                  id="totalSupply"
                  placeholder="e.g., 1000000"
                  type="number"
                  value={tokenData.totalSupply}
                  onChange={(e) => setTokenData({ ...tokenData, totalSupply: e.target.value })}
                  className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Token Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your token's purpose and utility..."
                  value={tokenData.description}
                  onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
                  className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!tokenData.name || !tokenData.symbol || !tokenData.totalSupply}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Continue to Utility Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Token Utility
              </CardTitle>
              <CardDescription className="text-purple-200">
                Configure how your token will be used in the AstroFi ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-white">
                  Astrology Specialty
                </Label>
                <Select onValueChange={(value) => setTokenData({ ...tokenData, specialty: value })}>
                  <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="love">Love & Relationships</SelectItem>
                    <SelectItem value="career">Career & Finance</SelectItem>
                    <SelectItem value="spiritual">Spiritual Growth</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="predictions">Future Predictions</SelectItem>
                    <SelectItem value="daily">Daily Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionPrice" className="text-white">
                    Session Price (in your tokens)
                  </Label>
                  <Input
                    id="sessionPrice"
                    placeholder="e.g., 50"
                    type="number"
                    value={tokenData.sessionPrice}
                    onChange={(e) => setTokenData({ ...tokenData, sessionPrice: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stakingReward" className="text-white">
                    Staking Reward (%)
                  </Label>
                  <Input
                    id="stakingReward"
                    placeholder="e.g., 5"
                    type="number"
                    value={tokenData.stakingReward}
                    onChange={(e) => setTokenData({ ...tokenData, stakingReward: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg p-4 border border-gold-400/20">
                <h4 className="text-gold-400 font-semibold mb-2">Token Utility Features</h4>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>• Session booking payments</li>
                  <li>• Prediction market staking</li>
                  <li>• Reputation system integration</li>
                  <li>• Holder rewards and benefits</li>
                  <li>• DAO governance participation</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-purple-400 text-purple-200 hover:bg-purple-400/10 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!tokenData.specialty || !tokenData.sessionPrice}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  Continue to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Astrologer Profile
              </CardTitle>
              <CardDescription className="text-purple-200">
                Complete your profile to build trust with potential token holders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">
                    Website (Optional)
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://your-website.com"
                    value={tokenData.website}
                    onChange={(e) => setTokenData({ ...tokenData, website: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-white">
                    Twitter Handle (Optional)
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="@yourusername"
                    value={tokenData.twitter}
                    onChange={(e) => setTokenData({ ...tokenData, twitter: e.target.value })}
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-2">Verification Requirements</h4>
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>• Minimum 6 months of prediction history</li>
                      <li>• 70%+ accuracy rate verification</li>
                      <li>• Community reputation score above 60</li>
                      <li>• Complete KYC verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-4">Token Preview</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-200">Name:</p>
                    <p className="text-white font-semibold">{tokenData.name || "Your Token Name"}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Symbol:</p>
                    <p className="text-white font-semibold">{tokenData.symbol || "SYMBOL"}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Total Supply:</p>
                    <p className="text-white font-semibold">{tokenData.totalSupply || "0"}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Session Price:</p>
                    <p className="text-white font-semibold">
                      {tokenData.sessionPrice || "0"} {tokenData.symbol || "TOKENS"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-purple-400 text-purple-200 hover:bg-purple-400/10 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateToken}
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                >
                  {isCreating ? "Creating Token..." : "Create Token (0.1 FLOW)"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Coins className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Token Created Successfully!</h3>
              <p className="text-purple-200 mb-8">
                Your AstroToken has been deployed to the blockchain. You can now start accepting payments and building
                your community.
              </p>

              <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg p-6 border border-gold-400/20 mb-8">
                <h4 className="text-gold-400 font-semibold mb-4">Token Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-purple-200">Contract Address:</p>
                    <p className="text-white font-mono text-sm">0x1234...5678</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Token Symbol:</p>
                    <p className="text-white font-semibold">{tokenData.symbol}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Total Supply:</p>
                    <p className="text-white font-semibold">{tokenData.totalSupply}</p>
                  </div>
                  <div>
                    <p className="text-purple-200">Your Balance:</p>
                    <p className="text-white font-semibold">
                      {tokenData.totalSupply} {tokenData.symbol}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Next Steps</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-4">
                    <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h5 className="text-white font-semibold mb-2">Set Up Services</h5>
                    <p className="text-purple-200">Configure your astrology services and pricing</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h5 className="text-white font-semibold mb-2">Build Community</h5>
                    <p className="text-purple-200">Promote your token and attract holders</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Star className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                    <h5 className="text-white font-semibold mb-2">Start Predictions</h5>
                    <p className="text-purple-200">Make accurate predictions to build reputation</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  <Link href="/astrologers">View Your Profile</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gold-400 text-gold-400 hover:bg-gold-400/10 bg-transparent"
                >
                  <Link href="/predictions">Create Prediction</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        {step < 4 && (
          <Card className="bg-gradient-to-r from-purple-600/10 to-gold-600/10 border-purple-400/20 backdrop-blur-sm mt-12">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Create an AstroToken?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Monetize Expertise</h4>
                  <p className="text-purple-200 text-sm">Turn your astrological knowledge into a tradeable asset</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Build Value</h4>
                  <p className="text-purple-200 text-sm">Accurate predictions increase your token's market value</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Loyal Community</h4>
                  <p className="text-purple-200 text-sm">Token holders become invested in your success</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Reputation Staking</h4>
                  <p className="text-purple-200 text-sm">Stake your reputation on predictions for higher rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
