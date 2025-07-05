"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"

export function ModernNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/mint-chart", label: "Mint Chart" },
    { href: "/astrologers", label: "Astrologers" },
    { href: "/world-predictions", label: "World Predictions" },
    { href: "/vote-predictions", label: "Vote Predictions" },
    { href: "/dao-predictions", label: "DAO Voting" },
    { href: "/astrologer-dashboard", label: "Dashboard" },
    { href: "/create-token", label: "Create Token" },
    { href: "/buy-token", label: "Buy Tokens" },
    { href: "/reputation", label: "Reputation" },
    { href: "/daily-rashi", label: "Daily" },
    { href: "/zodiac-dao", label: "Zodiac DAOs" },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-1">
        <div className="flex items-center space-x-3">
          <Link href="/mint-chart" className="text-white hover:text-purple-300 transition-colors">
            Mint Chart
          </Link>
          <Link href="/astrologers" className="text-white hover:text-purple-300 transition-colors">
            Astrologers
          </Link>
          <Link href="/world-predictions" className="text-white hover:text-purple-300 transition-colors">
            Predictions
          </Link>
          <Link href="/buy-token" className="text-white hover:text-purple-300 transition-colors">
            Buy Tokens
          </Link>
          <Link href="/dao-predictions" className="text-white hover:text-purple-300 transition-colors">
            DAO Voting
          </Link>
          <Link href="/zodiac-dao" className="text-white hover:text-purple-300 transition-colors">
            Zodiac DAOs
          </Link>
          <Link href="/astrologer-dashboard" className="text-white hover:text-purple-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/profile" className="text-white hover:text-purple-300 transition-colors">
            Profile
          </Link>
          <WalletConnectButton />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-white/10 rounded-xl"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />

            {/* Mobile Menu */}
            <div className="fixed top-20 right-6 left-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl z-50 overflow-hidden">
              <div className="p-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-white hover:text-purple-200 transition-all duration-300 font-medium rounded-2xl hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-white/10 pt-4 mt-6">
                  <Link
                    href="/compatibility"
                    className="block px-4 py-3 text-white/70 hover:text-white transition-colors font-medium rounded-2xl hover:bg-white/5"
                    onClick={() => setIsOpen(false)}
                  >
                    Compatibility
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-white/70 hover:text-white transition-colors font-medium rounded-2xl hover:bg-white/5"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
