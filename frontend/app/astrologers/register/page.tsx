"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WalletGuard } from "@/components/wallet/wallet-guard"
import { WalletInfo } from "@/components/wallet/wallet-info"
import { contractService } from "@/lib/contracts"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Sparkles, Loader2, Star, User, Mail, BookOpen, Award, FileText, Upload } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function AstrologerRegistrationPage() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [isLoading, setIsLoading] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    experience: 0,
    bio: "",
    profileURI: ""
  })

  // Set user address when wallet is connected
  useState(() => {
    if (ready && authenticated && wallets.length > 0) {
      setUserAddress(wallets[0].address)
    } else {
      setUserAddress(null)
    }
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first")
      return
    }

    // Validate form
    if (!formData.name || !formData.specialization || !formData.bio) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const tx = await contractService.registerAstrologer(
        formData.name,
        formData.bio,
        formData.specialization,
        formData.experience
      )

      toast.success("Astrologer registration successful!")
      console.log("Registration transaction:", tx)
      
      // Redirect to astrologers page
      window.location.href = "/astrologers"
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
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
          <Link href="/astrologers">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
              View Astrologers
            </Button>
          </Link>
        </div>
      </header>

      <WalletGuard>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Register as Astrologer</h1>
            <p className="text-purple-200 text-lg">
              Join our community of professional astrologers and start making predictions
            </p>
          </div>

          {/* Wallet Status */}
          <div className="mb-8">
            <WalletInfo />
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Registration Form */}
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Astrologer Information
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Fill in your details to register as a professional astrologer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-white flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Specialization *
                  </Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange("specialization", value)}>
                    <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natal Astrology">Natal Astrology</SelectItem>
                      <SelectItem value="Predictive Astrology">Predictive Astrology</SelectItem>
                      <SelectItem value="Horary Astrology">Horary Astrology</SelectItem>
                      <SelectItem value="Electional Astrology">Electional Astrology</SelectItem>
                      <SelectItem value="Mundane Astrology">Mundane Astrology</SelectItem>
                      <SelectItem value="Medical Astrology">Medical Astrology</SelectItem>
                      <SelectItem value="Financial Astrology">Financial Astrology</SelectItem>
                      <SelectItem value="Relationship Astrology">Relationship Astrology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-white flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Years of Experience
                  </Label>
                  <Select value={formData.experience.toString()} onValueChange={(value) => handleInputChange("experience", parseInt(value))}>
                    <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Less than 1 year</SelectItem>
                      <SelectItem value="1">1-2 years</SelectItem>
                      <SelectItem value="3">3-5 years</SelectItem>
                      <SelectItem value="6">6-10 years</SelectItem>
                      <SelectItem value="11">11-15 years</SelectItem>
                      <SelectItem value="16">16-20 years</SelectItem>
                      <SelectItem value="21">More than 20 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Bio/Description *
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about your background, expertise, and approach to astrology..."
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileURI" className="text-white flex items-center">
                    <Upload className="w-4 h-4 mr-1" />
                    Profile URI (Optional)
                  </Label>
                  <Input
                    id="profileURI"
                    value={formData.profileURI}
                    onChange={(e) => handleInputChange("profileURI", e.target.value)}
                    placeholder="https://your-website.com/profile"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <Button 
                  onClick={handleRegister}
                  disabled={isLoading || !userAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register as Astrologer (0.01 FLOW)"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Astrologer Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-gold-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Earn from Predictions</h4>
                      <p className="text-purple-200 text-sm">Make predictions and earn rewards based on accuracy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-gold-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Build Reputation</h4>
                      <p className="text-purple-200 text-sm">Gain reputation points and become a trusted astrologer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-gold-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Access Premium Features</h4>
                      <p className="text-purple-200 text-sm">Unlock advanced tools and analytics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-gold-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Community Recognition</h4>
                      <p className="text-purple-200 text-sm">Get featured in the astrologer directory</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Registration Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">Connected wallet</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">0.01 FLOW registration fee</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white">Professional bio</span>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg border border-gold-400/20">
                <h4 className="text-gold-400 font-semibold mb-2">Ready to Start?</h4>
                <p className="text-sm text-white/80 mb-4">
                  After registration, you'll be able to create predictions, earn rewards, and build your reputation in the AstroFi community.
                </p>
                <Link href="/astrologers">
                  <Button variant="outline" className="w-full border-gold-400 text-gold-400 hover:bg-gold-400/10">
                    View Existing Astrologers
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