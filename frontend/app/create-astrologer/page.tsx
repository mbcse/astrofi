"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Star, User, Shield, Upload, CheckCircle, Award, Globe } from "lucide-react"
import Link from "next/link"
import { WalletGuard } from "@/components/wallet/wallet-guard"
import { WalletInfo } from "@/components/wallet/wallet-info"
import { SelfVerification } from "@/components/self-verification"
import { selfSDK, SelfVerificationResult } from "@/lib/self-sdk"
import { walrusAPI } from "@/lib/walrus-api"
import { toast } from "sonner"

export default function CreateAstrologerPage() {
  const [isVerified, setIsVerified] = useState(true) // Verification disabled
  const [verificationResult, setVerificationResult] = useState<SelfVerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    experience: "",
    certifications: "",
    bio: "",
    hourlyRate: "",
    timezone: "",
    languages: "",
    website: "",
    socialMedia: ""
  })

  const [profileCreated, setProfileCreated] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVerificationSuccess = (result: SelfVerificationResult) => {
    setVerificationResult(result)
    setIsVerified(true)
    selfSDK.setVerificationResult(result)
    toast.success("Identity verified successfully!")
  }

  const handleVerificationError = (error: string) => {
    setError(error)
    toast.error(`Verification failed: ${error}`)
  }

  const handleCreateProfile = async () => {
    // Verification check disabled
    // if (!isVerified) {
    //   toast.error("Please complete your identity verification first")
    //   return
    // }

    if (!formData.name || !formData.email || !formData.specialization || !formData.bio) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const profileData = {
        ...formData,
        verifiedIdentity: {
          userId: verificationResult?.userIdentifier,
          name: verificationResult?.discloseOutput?.name,
          nationality: verificationResult?.discloseOutput?.nationality,
          dateOfBirth: verificationResult?.discloseOutput?.date_of_birth,
          verificationStatus: {
            isValid: verificationResult?.isValid,
            isAgeValid: verificationResult?.isValidDetails?.isOlderThanValid,
            isOfacValid: verificationResult?.isValidDetails?.isOfacValid
          }
        },
        createdAt: new Date().toISOString(),
        status: "pending" // Will be reviewed by platform
      }

      // Store astrologer profile in Walrus via backend
      const uploadResult = await walrusAPI.uploadAstrologerProfile(
        profileData,
        verificationResult!.userIdentifier
      )

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload profile')
      }

      setProfileCreated(true)
      toast.success("Astrologer profile created successfully!")
      console.log("Profile stored:", uploadResult.file)
      
      // Here you would integrate with your smart contract to register the astrologer
      // For now, we'll just show a success message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create profile"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
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
      </header>

      <WalletGuard>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Become an Astrologer</h1>
            <p className="text-purple-200 text-lg">
              Join our decentralized platform and start offering astrological services
            </p>
          </div>

          {/* Identity Verification - Temporarily Hidden */}
          <div className="mb-8 hidden">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Identity Verification
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Verify your identity with Self to create your astrologer profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isVerified ? (
                  <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="text-green-400 font-semibold">Identity Verified</h4>
                      <p className="text-sm text-white/80">
                        User ID: {verificationResult?.userIdentifier?.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <SelfVerification
                    onSuccess={handleVerificationSuccess}
                    onError={handleVerificationError}
                    size={300}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Wallet Status */}
          <div className="mb-8">
            <WalletInfo />
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Astrologer Profile
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Create your professional astrologer profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
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
                  <Label htmlFor="email" className="text-white">
                    Email *
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
                  <Label htmlFor="specialization" className="text-white">
                    Specialization *
                  </Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange("specialization", value)}>
                    <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natal-charts">Natal Charts</SelectItem>
                      <SelectItem value="compatibility">Compatibility</SelectItem>
                      <SelectItem value="predictions">Predictions</SelectItem>
                      <SelectItem value="electional">Electional Astrology</SelectItem>
                      <SelectItem value="mundane">Mundane Astrology</SelectItem>
                      <SelectItem value="medical">Medical Astrology</SelectItem>
                      <SelectItem value="general">General Astrology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-white">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="Enter years of experience"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-white">
                    Certifications
                  </Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange("certifications", e.target.value)}
                    placeholder="Enter your certifications"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">
                    Bio *
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about your astrological practice..."
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-white">
                    Hourly Rate (USD)
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    placeholder="Enter your hourly rate"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">
                    Timezone
                  </Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                    <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">UTC-8 (PST)</SelectItem>
                      <SelectItem value="utc-5">UTC-5 (EST)</SelectItem>
                      <SelectItem value="utc+0">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="utc+5:30">UTC+5:30 (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages" className="text-white">
                    Languages
                  </Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => handleInputChange("languages", e.target.value)}
                    placeholder="English, Spanish, etc."
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://your-website.com"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialMedia" className="text-white">
                    Social Media
                  </Label>
                  <Input
                    id="socialMedia"
                    value={formData.socialMedia}
                    onChange={(e) => handleInputChange("socialMedia", e.target.value)}
                    placeholder="Twitter, Instagram, etc."
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <Button 
                  onClick={handleCreateProfile}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  {isLoading ? "Creating Profile..." : "Create Astrologer Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Profile Preview
                </CardTitle>
                <CardDescription className="text-purple-200">
                  {profileCreated ? "Your astrologer profile" : "Your profile will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileCreated ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-400/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Award className="w-16 h-16 text-white" />
                        </div>
                        <p className="text-white font-semibold mb-2">{formData.name}</p>
                        <p className="text-purple-200 text-sm mb-4">{formData.specialization}</p>
                        <p className="text-purple-200 text-sm">{formData.experience} years experience</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-400/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Upload className="w-4 h-4 text-green-400" />
                        <h4 className="text-green-400 font-semibold">Profile Created</h4>
                      </div>
                      <p className="text-sm text-white/80">
                        Your astrologer profile has been stored securely on Walrus storage.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-400/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Award className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-white/70 mb-4">Fill in your details to preview your profile</p>
                      <div className="space-y-2 text-sm text-purple-200">
                        <p>• Professional verification</p>
                        <p>• Secure profile storage</p>
                        <p>• Client booking system</p>
                        <p>• Token-based payments</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg border border-gold-400/20">
                  <h4 className="text-gold-400 font-semibold mb-2">Astrologer Benefits</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Verified identity badge</li>
                    <li>• Secure client payments</li>
                    <li>• Reputation system</li>
                    <li>• Token-based rewards</li>
                    <li>• Decentralized platform</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </WalletGuard>
    </div>
  )
} 