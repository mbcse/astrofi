"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/mint-chart", label: "Mint Chart" },
    { href: "/astrologers", label: "Astrologers" },
    { href: "/predictions", label: "Markets" },
    { href: "/daily-rashi", label: "Daily Rashi" },
    { href: "/zodiac-dao", label: "Zodiac DAOs" },
    { href: "/compatibility", label: "Compatibility" },
    { href: "/reputation", label: "Reputation" },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8 text-white/80">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:text-white transition-all duration-300 hover:scale-105 font-medium"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-white/10">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-purple-400/20 z-50">
            <div className="flex flex-col space-y-4 p-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-purple-200 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
