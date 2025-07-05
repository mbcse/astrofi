"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WalletGuard } from "@/components/wallet/wallet-guard"
import { WalletInfo } from "@/components/wallet/wallet-info"
import { contractService } from "@/lib/contracts"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Sparkles, Loader2, TrendingUp, Calendar, DollarSign, Target } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CreatePredictionPage() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [isLoading, setIsLoading] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    endDate: "",
    stakeAmount: "0.01"
  })

  // Set user address when wallet is connected
  useState(() => {
    if (ready && authenticated && wallets.length > 0) {
      setUserAddress(wallets[0].address)
    } else {
      setUserAddress(null)
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreatePrediction = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first")
      return
    }

    // Validate form
    if (!formData.title || !formData.description || !formData.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const endDateTimestamp = new Date(formData.endDate).getTime() / 1000
    if (endDateTimestamp <= Date.now() / 1000) {
      toast.error("End date must be in the future")
      return
    }

    setIsLoading(true)

    try {
      const tx = await contractService.createPrediction(
        formData.title,
        formData.description,
        Math.floor(endDateTimestamp),
        formData.stakeAmount
      )

      toast.success("Prediction created successfully!")
      console.log("Prediction transaction:", tx)
      
      // Redirect to predictions page
      window.location.href = "/predictions"
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create prediction"
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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
        <div className="flex space-x-4">
          <Link href="/predictions">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
              View Predictions
            </Button>
          </Link>
        </div>
      </header>

      <WalletGuard>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Create Prediction</h1>
            <p className="text-purple-200 text-lg">
              Make a prediction and stake your reputation on its outcome
            </p>
          </div>

          {/* Wallet Status */}
          <div className="mb-8">
            <WalletInfo />
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Prediction Form */}
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Prediction Details
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Create a new prediction that others can stake on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Prediction Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Bitcoin will reach $100k by end of year"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide detailed reasoning and context for your prediction..."
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Resolution Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stakeAmount" className="text-white flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Stake Amount (FLOW) *
                  </Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.stakeAmount}
                    onChange={(e) => handleInputChange("stakeAmount", e.target.value)}
                    placeholder="0.01"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-purple-200">
                    This is the amount you're staking on your prediction being correct
                  </p>
                </div>

                <Button 
                  onClick={handleCreatePrediction}
                  disabled={isLoading || !userAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Prediction...
                    </>
                  ) : (
                    `Create Prediction (${formData.stakeAmount} FLOW)`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Prediction Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="text-white font-semibold">Be Specific</h4>
                        <p className="text-purple-200 text-sm">Make clear, measurable predictions with definite outcomes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="text-white font-semibold">Set Realistic Deadlines</h4>
                        <p className="text-purple-200 text-sm">Choose resolution dates that allow enough time for the prediction to play out</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="text-white font-semibold">Stake Responsibly</h4>
                        <p className="text-purple-200 text-sm">Only stake amounts you can afford to lose</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <h4 className="text-white font-semibold">Provide Reasoning</h4>
                        <p className="text-purple-200 text-sm">Explain your astrological analysis and reasoning</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                      <div>
                        <h4 className="text-white font-semibold">Create Prediction</h4>
                        <p className="text-purple-200 text-sm">Submit your prediction with a stake amount</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                      <div>
                        <h4 className="text-white font-semibold">Others Stake</h4>
                        <p className="text-purple-200 text-sm">Community members can stake on your prediction</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                      <div>
                        <h4 className="text-white font-semibold">Resolution</h4>
                        <p className="text-purple-200 text-sm">Prediction is resolved and rewards distributed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg border border-gold-400/20">
                <h4 className="text-gold-400 font-semibold mb-2">Earn Rewards</h4>
                <p className="text-sm text-white/80 mb-4">
                  Successful predictions earn reputation points and potential rewards. Build your credibility as an astrologer!
                </p>
                <Link href="/predictions">
                  <Button variant="outline" className="w-full border-gold-400 text-gold-400 hover:bg-gold-400/10">
                    View All Predictions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </WalletGuard>
    </div>
  )
} 