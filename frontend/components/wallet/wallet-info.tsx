"use client"

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Coins, Network } from "lucide-react"
import { contractService } from "@/lib/contracts"
import { useState, useEffect } from "react"

export function WalletInfo() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [balance, setBalance] = useState<string>("0.0000")

  useEffect(() => {
    const loadBalance = async () => {
      if (wallets.length > 0) {
        try {
          const userBalance = await contractService.getBalance(wallets[0].address)
          setBalance(contractService.formatEther(userBalance))
        } catch (error) {
          console.error('Error loading balance:', error)
        }
      }
    }

    if (ready && authenticated && wallets.length > 0) {
      loadBalance()
    }
  }, [ready, authenticated, wallets])

  if (!ready || !authenticated || wallets.length === 0) {
    return null
  }

  const wallet = wallets[0]
  const address = wallet?.address || ""
  const chainId = wallet?.chainId?.split(':')[1] ? Number(wallet.chainId.split(':')[1]) : 1
  const chainName = chainId === 1 ? "Flow Mainnet" : chainId === 545 ? "Flow Testnet" : "Flow Testnet"

  return (
    <Card className="bg-white/5 border-purple-400/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold">
              {address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-white font-semibold">
                {user?.email?.address || `${address.slice(0, 6)}...${address.slice(-4)}`}
              </h3>
              <Badge className="bg-green-600/20 text-green-400 border-green-400/30">Connected</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-gold-400" />
                <span className="text-white/70">Balance:</span>
                <span className="text-white font-medium">
                  {balance && !isNaN(parseFloat(balance)) ? parseFloat(balance).toFixed(4) : '0.0000'} FLOW
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">Network:</span>
                <span className="text-white font-medium">{chainName}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
