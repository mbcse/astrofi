"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Star, Calendar, MapPin, Clock, User, Shield, Upload, CheckCircle, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { WalletGuard } from "@/components/wallet/wallet-guard"
import { WalletInfo } from "@/components/wallet/wallet-info"
import { SelfVerification } from "@/components/self-verification"
import { SelfVerificationResult } from "@/lib/self-sdk"
import { ChartVisualization } from "@/components/chart-visualization"
import { selfSDK } from "@/lib/self-sdk"
import { walrusAPI } from "@/lib/walrus-api"
import { geocodingAPI, GeocodingResult } from "@/lib/geocoding-api"
import { toast } from "sonner"
import { contractService } from "@/lib/contracts"
import { usePrivyWallet } from "@/hooks/use-privy-wallet"
import { useRouter } from "next/navigation"

export default function MintChartPage() {
  const router = useRouter()
  const { ready, authenticated, userAddress } = usePrivyWallet()
  const [isVerified, setIsVerified] = useState(true) // Verification disabled
  const [verificationResult, setVerificationResult] = useState<SelfVerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileCreated, setProfileCreated] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    birthTime: "",
    timezone: "UTC",
    birthPlace: "",
    latitude: "",
    longitude: ""
  })

  const [chartGenerated, setChartGenerated] = useState(false)
  const [chartData, setChartData] = useState<any | null>(null)
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-geocode when birth place changes (with debouncing)
    if (field === "birthPlace") {
      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      // Set new timer for debounced geocoding
      const timer = setTimeout(() => {
        if (value.trim().length > 3) { // Only geocode if place name is long enough
          handleGeocodePlace(value)
        }
      }, 1000) // 1 second debounce
      
      setDebounceTimer(timer)
    }
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

  const handleGeocodePlace = async (placeName?: string) => {
    const placeToGeocode = placeName || formData.birthPlace
    
    if (!placeToGeocode.trim()) {
      toast.error("Please enter a place name")
      return
    }

    setIsGeocoding(true)
    setError(null)

    try {
      const result = await geocodingAPI.geocodePlace(placeToGeocode)
      
      if (result.success && result.data) {
        setGeocodingResult(result.data)
        setFormData(prev => ({
          ...prev,
          latitude: result.data!.latitude.toString(),
          longitude: result.data!.longitude.toString()
        }))
        toast.success(`Found: ${result.data.formattedAddress}`)
      } else {
        toast.error(result.error || "Could not find coordinates for this place")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Geocoding failed"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsGeocoding(false)
    }
  }

  const checkAndGenerateChart = async () => {
    // Check if all required fields are filled
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.birthTime || !formData.birthPlace) {
      return
    }

    // If we don't have coordinates, try to geocode first
    if (!formData.latitude || !formData.longitude) {
      await handleGeocodePlace()
      return
    }

    // Generate chart
    await generateChart()
  }

  const generateChart = async () => {
    // Remove the verification check - allow chart generation without verification
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.birthTime || !formData.birthPlace || !formData.latitude || !formData.longitude) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/charts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          timezone: formData.timezone,
          verifiedIdentity: verificationResult // This can be null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate chart')
      }

      const result = await response.json()
      console.log('Chart generation response:', result)
      console.log('Chart data structure:', result.data)
      setChartData(result.data)
      setChartGenerated(true)
      toast.success("Natal chart generated successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate chart"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const mintChart = async () => {
    if (!chartData || !userAddress) return;

    console.log('=== MINT CHART DEBUG ===');
    console.log('Full chartData:', chartData);
    console.log('chartData.chartImageUrl:', chartData.chartImageUrl);
    console.log('chartData.metadata:', chartData.metadata);
    console.log('chartData.metadata?.chartImageUrl:', chartData.metadata?.chartImageUrl);

    setIsLoading(true);
    setError(null);

    try {
      // Get the chart image URL from the response - try multiple possible locations
      const chartImageUrl = chartData.chartImageUrl || 
                           chartData.metadata?.chartImageUrl || 
                           '';
      
      if (!chartImageUrl) {
        throw new Error('Chart image URL not found. Please regenerate the chart.');
      }

      console.log('Using chart image URL:', chartImageUrl);

      // Create NFT metadata following OpenSea standards
      const metadata = {
        name: `${formData.firstName} ${formData.lastName}'s Birth Chart`,
        description: `Birth chart generated for ${formData.firstName} ${formData.lastName}, born on ${formData.birthDate} at ${formData.birthTime} in ${formData.birthPlace}.`,
        image: chartImageUrl, // Use the chart image URL from Walrus
        external_url: `${window.location.origin}/profile`,
        attributes: [
          {
            trait_type: "Birth Date",
            value: formData.birthDate
          },
          {
            trait_type: "Birth Time",
            value: formData.birthTime
          },
          {
            trait_type: "Birth Place",
            value: formData.birthPlace
          },
          {
            trait_type: "Ascendant",
            value: chartData.ascendant || 'Unknown'
          }
        ]
      };

      console.log('NFT metadata:', metadata);

      // Upload metadata to Walrus
      const metadataResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/charts/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata)
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata');
      }

      const metadataResult = await metadataResponse.json();
      const metadataUrl = metadataResult.data?.metadataUrl;

      if (!metadataUrl) {
        throw new Error('Failed to get metadata URL');
      }

      console.log('Metadata URL:', metadataUrl);

      // Mint NFT with the metadata URL
      const receipt = await contractService.mintChartNFT(
        `${formData.firstName} ${formData.lastName}`,
        formData.birthDate,
        formData.birthTime,
        formData.birthPlace,
        parseFloat(formData.latitude),
        parseFloat(formData.longitude),
        {
          ...chartData,
          chartImage: chartImageUrl
        },
        metadataUrl // Use the Walrus URL for the metadata as tokenURI
      );

      // Transaction is already mined, no need to wait
      console.log('NFT minted successfully, receipt:', receipt);
      toast.success("Birth chart NFT minted successfully!");
      router.push('/profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mint chart NFT";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Minting error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

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
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Mint Your Natal Chart NFT</h1>
            <p className="text-purple-200 text-lg">
              Generate your natal chart instantly, then verify your identity to mint as an NFT
            </p>
          </div>

          {/* Identity Verification - Temporarily Hidden */}
          <div id="identity-verification" className="mb-8 hidden">
            <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Identity Verification
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Verify your identity with Self to mint your birth chart NFT (optional for chart preview)
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
                  <Calendar className="w-5 h-5 mr-2" />
                  Birth Information
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Enter your birth details to generate your natal chart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    />
                  </div>
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
                    placeholder="Enter email"
                    className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-white">
                    Birth Date *
                  </Label>
                  <Input 
                    id="birthDate" 
                    type="date" 
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="bg-white/10 border-purple-400/30 text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthTime" className="text-white flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Birth Time *
                    </Label>
                    <Input 
                      id="birthTime" 
                      type="time" 
                      value={formData.birthTime}
                      onChange={(e) => handleInputChange("birthTime", e.target.value)}
                      className="bg-white/10 border-purple-400/30 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-white">
                      Timezone
                    </Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                      <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                        <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                        <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                        <SelectItem value="UTC+5:30">UTC+5:30 (IST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace" className="text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Birth Place *
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                      placeholder="City, Country"
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50 flex-1"
                    />
                    <Button
                      onClick={() => handleGeocodePlace()}
                      disabled={isGeocoding || !formData.birthPlace.trim()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGeocoding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {geocodingResult && (
                    <div className="p-2 bg-green-500/10 border border-green-400/20 rounded text-sm text-green-200">
                      Found: {geocodingResult.formattedAddress}
                    </div>
                  )}
                  {isGeocoding && (
                    <div className="p-2 bg-blue-500/10 border border-blue-400/20 rounded text-sm text-blue-200 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Finding coordinates...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-white">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange("latitude", e.target.value)}
                      placeholder="Auto-filled from place"
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-white">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange("longitude", e.target.value)}
                      placeholder="Auto-filled from place"
                      className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateChart}
                  disabled={isLoading || !formData.firstName || !formData.lastName || !formData.birthDate || !formData.birthTime || !formData.birthPlace || !formData.latitude || !formData.longitude}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Chart...
                    </>
                  ) : (
                    "Generate Natal Chart"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Chart Display */}
            <div className="space-y-6">
              {chartGenerated && chartData ? (
                <>
                  <ChartVisualization
                    chartData={chartData}
                    name={`${formData.firstName} ${formData.lastName}`}
                    birthPlace={formData.birthPlace}
                  />
                  
                  <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      {isVerified ? (
                        <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-400/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Upload className="w-4 h-4 text-green-400" />
                            <h4 className="text-green-400 font-semibold">Ready for Storage</h4>
                          </div>
                          <p className="text-sm text-white/80 mb-4">
                            Your birth chart data will be stored securely on Walrus storage with your verified identity.
                          </p>
                          <Button
                            onClick={mintChart}
                            disabled={isLoading || !userAddress}
                            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Store & Mint NFT (0.05 FLOW)"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-400/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Shield className="w-4 h-4 text-yellow-400" />
                            <h4 className="text-yellow-400 font-semibold">Identity Verification Required</h4>
                          </div>
                          <p className="text-sm text-white/80 mb-4">
                            To mint your birth chart NFT, you need to verify your identity with Self first.
                          </p>
                          <Button
                            onClick={() => document.getElementById('identity-verification')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                          >
                            Complete Identity Verification
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Chart Preview
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Your chart will appear here automatically when you fill in all required fields
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-400/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Star className="w-16 h-16 text-white" />
                        </div>
                        <p className="text-white/70 mb-4">Fill in your birth details to generate your chart</p>
                        <div className="space-y-2 text-sm text-purple-200">
                          <p>• Planetary positions</p>
                          <p>• House placements</p>
                          <p>• Aspect patterns</p>
                          <p>• Personalized insights</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg border border-gold-400/20">
                      <h4 className="text-gold-400 font-semibold mb-2">NFT Features</h4>
                      <ul className="text-sm text-white/80 space-y-1">
                        <li>• Unique astrological artwork</li>
                        <li>• Tradeable on OpenSea</li>
                        <li>• Access to premium features</li>
                        <li>• Proof of astrological identity</li>
                        <li>• Stored on decentralized storage</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
