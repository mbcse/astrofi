"use client"

import { usePrivy } from '@privy-io/react-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnectButton } from "./wallet-connect-button"
import { Wallet, Shield } from "lucide-react"
import type { ReactNode } from "react"

interface WalletGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function WalletGuard({ children, fallback }: WalletGuardProps) {
  const { ready, authenticated } = usePrivy()

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent mx-auto mb-4" />
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authenticated) {
    return (
      fallback || (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-purple-200">
                Connect your wallet to access AstroFi's Web3 features and start your cosmic journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  "Mint your cosmic NFT charts",
                  "Trade astrologer tokens",
                  "Participate in prediction markets",
                  "Join zodiac DAOs",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-gold-400" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <WalletConnectButton />
              </div>

              <p className="text-center text-white/60 text-xs">
                Your wallet connection is secure and encrypted. We never store your private keys.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
