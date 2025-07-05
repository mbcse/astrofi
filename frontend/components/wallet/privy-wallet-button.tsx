"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// TODO: Uncomment when Privy is installed
// import { usePrivy, useWallets } from '@privy-io/react-auth'

export function PrivyWalletButton() {
  const [isOpen, setIsOpen] = useState(false)

  // TODO: Uncomment when Privy is installed and configured
  // const { ready, authenticated, user, login, logout } = usePrivy()
  // const { wallets } = useWallets()
  
  // Temporary mock values during migration
  const ready = true
  const authenticated = false
  const user: { email?: { address: string } } | null = null
  const wallets: any[] = []
  const login = () => {
    toast.info("Privy login will be available after integration")
  }
  const logout = () => {}

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard!")
  }

  const openFlowExplorer = (address: string, chainId: number) => {
    const baseUrl = chainId === 545 ? "https://testnet.flowscan.org" : "https://flowscan.org"
    window.open(`${baseUrl}/account/${address}`, "_blank")
  }

  if (!ready) {
    return (
      <Button disabled className="min-w-[160px]">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (authenticated && user && wallets.length > 0) {
    const wallet = wallets[0] // Use first wallet
    const address = wallet.address

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="group relative bg-gradient-to-r from-purple-600/10 to-purple-700/10 border-purple-400/30 text-white hover:bg-purple-600/20 hover:border-purple-400/50 transition-all duration-300 rounded-2xl font-semibold min-w-[160px]"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs">
                    {address?.slice(2, 4).toUpperCase() || "PR"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
              </div>
              <span className="text-sm">{address ? formatAddress(address) : "Connected"}</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-slate-900/95 backdrop-blur-xl border-purple-400/20 rounded-2xl p-2"
        >
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                  {address?.slice(2, 4).toUpperCase() || "PR"}
                </AvatarFallback>
              </Avatar>
              <div>
                                 <p className="text-white font-medium text-sm">{address ? formatAddress(address) : "Connected"}</p>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <p className="text-green-400 text-xs">Connected via Privy</p>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-purple-400/20" />

          {address && (
            <>
              <DropdownMenuItem 
                onClick={() => copyAddress(address)} 
                className="text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy Address
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => openFlowExplorer(address, wallet.chainId || 1)} 
                className="text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-3" />
                View on Explorer
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-purple-400/20" />
            </>
          )}

          <DropdownMenuItem
            onClick={logout}
            className="text-red-400 hover:bg-red-400/10 rounded-xl cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      onClick={login}
      className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 rounded-2xl font-semibold min-w-[160px]"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
      <div className="relative flex items-center">
        <Wallet className="w-4 h-4 mr-2" />
        Connect with Privy
      </div>
    </Button>
  )
} 