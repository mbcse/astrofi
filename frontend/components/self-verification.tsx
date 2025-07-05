'use client'

import React, { useState, useEffect } from 'react'
import { SelfQRcodeWrapper, SelfAppBuilder } from '@selfxyz/qrcode'
import { v4 as uuidv4 } from 'uuid'
import { selfSDK, SelfVerificationResult } from '@/lib/self-sdk'

interface SelfVerificationProps {
  onSuccess?: (result: SelfVerificationResult) => void
  onError?: (error: string) => void
  size?: number
  className?: string
}

export function SelfVerification({ 
  onSuccess, 
  onError, 
  size = 350, 
  className = '' 
}: SelfVerificationProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    // Generate a user ID when the component mounts
    const newUserId = uuidv4()
    setUserId(newUserId)
    selfSDK.generateUserId()
  }, [])

  const handleSuccess = () => {
    setIsVerifying(false)
    // The result will be available through the SDK
    const result = selfSDK.getVerificationResult()
    
    if (result && onSuccess) {
      onSuccess(result)
    }
  }

  const handleError = (error: any) => {
    setIsVerifying(false)
    console.error('Self verification error:', error)
    
    if (onError) {
      onError(error.message || 'Verification failed')
    }
  }

  if (!userId) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Create the SelfApp configuration
  const selfApp = new SelfAppBuilder({
    appName: "AstroFi",
    scope: "astrofi-app",
    endpoint: process.env.NEXT_PUBLIC_SELF_VERIFICATION_ENDPOINT || "https://astrofi.com/api/verify",
    userId,
    disclosures: {
      minimumAge: 18,
      excludedCountries: ['IRN', 'PRK'],
      ofac: true,
      nationality: true,
      name: true,
      date_of_birth: true
    }
  }).build()

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Verify Your Identity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Scan this QR code with the Self app to verify your identity
        </p>
      </div>
      
      <div className="relative">
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccess}
          onError={handleError}
          size={size}
        />
        
        {isVerifying && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifying...
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>User ID: {userId.substring(0, 8)}...</p>
        <p className="mt-1">
          This verification is required for minting birth chart NFTs
        </p>
      </div>
    </div>
  )
}

export default SelfVerification 