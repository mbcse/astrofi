import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Shield, ArrowRight, Play, Globe, Users2, Blocks, Coins, Rocket } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button" // Using commented out version for Privy migration
import { PlanetaryCarousel } from "@/components/planetary-carousel"
import { SolarSystem } from "@/components/solar-system"
import { FloatingPlanets } from "@/components/floating-planets"
import { ModernNavigation } from "@/components/modern-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 overflow-hidden relative">
      <AnimatedBackground />
      <FloatingPlanets />

      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Modern Header */}
      <header className="relative z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 via-pink-400 to-gold-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-gold-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-gold-200 bg-clip-text text-transparent">
                  AstroFi
                </span>
                <span className="text-xs text-purple-300 font-medium">Web3 Astrology</span>
              </div>
            </Link>

            <ModernNavigation />

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* <WalletConnectButton /> */}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {/* Background Solar System */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <SolarSystem />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto text-center space-y-12">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-full px-6 py-3 mb-8 group hover:scale-105 transition-all duration-300">
            <Blocks className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-white">Powered by Blockchain Technology</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Main Heading */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-white via-purple-200 to-gold-200 bg-clip-text text-transparent leading-none tracking-tight">
              AstroFi
            </h1>
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white/90 leading-tight">
                Where Ancient Wisdom Meets
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-gold-400 bg-clip-text text-transparent">
                  Web3 Innovation
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed font-medium">
                The first blockchain-powered astrology ecosystem. Mint your cosmic identity as NFTs, participate in
                prediction DAOs, trade astrologer tokens, and join decentralized communities—all secured by the
                immutable power of Web3.
              </p>
            </div>
          </div>

          {/* Enhanced Web3 Features Pills */}
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              { icon: Sparkles, text: "NFT Charts", color: "from-purple-500 to-purple-600" },
              { icon: Coins, text: "Token Economy", color: "from-gold-500 to-gold-600" },
              { icon: Shield, text: "DAO Governance", color: "from-blue-500 to-blue-600" },
              { icon: TrendingUp, text: "DeFi Markets", color: "from-green-500 to-green-600" },
              { icon: Users2, text: "Community", color: "from-pink-500 to-pink-600" },
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-6 h-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center`}
                >
                  <feature.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white border-0 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 rounded-2xl font-semibold"
            >
              <Link href="/mint-chart">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative flex items-center">
                  <Rocket className="w-6 h-6 mr-3" />
                  Launch Into Web3
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="group relative border-2 border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6 rounded-2xl font-semibold hover:border-white/30"
            >
              <Link href="/astrologers">
                <Play className="w-6 h-6 mr-3" />
                Explore Platform
              </Link>
            </Button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            {[
              { value: "50K+", label: "NFTs Minted", icon: Sparkles, desc: "Unique cosmic identities" },
              { value: "1.2K+", label: "DAO Members", icon: Users2, desc: "Active community" },
              { value: "$12M+", label: "Volume Traded", icon: TrendingUp, desc: "Cross-platform value" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-purple-300 font-medium mb-1">{stat.label}</div>
                  <div className="text-white/60 text-sm">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web3 Features Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-full px-6 py-3 mb-8">
              <Blocks className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-medium text-white">Built on Blockchain</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Web3 Astrology{" "}
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Ecosystem
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience the convergence of ancient cosmic wisdom and cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "NFT Cosmic Identity",
                description:
                  "Transform your birth chart into unique, tradeable NFTs with provable ownership and authenticity on the blockchain",
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-500/10 to-purple-600/5",
                features: ["Unique artwork", "Blockchain verified", "Tradeable assets", "Provable rarity"],
              },
              {
                icon: Shield,
                title: "Decentralized Governance",
                description:
                  "Community-driven DAOs for each zodiac sign with transparent voting and reputation systems",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-500/10 to-blue-600/5",
                features: ["DAO voting", "Reputation staking", "Community treasury", "Transparent governance"],
              },
              {
                icon: Coins,
                title: "Token Economy",
                description: "Create and trade astrologer-backed tokens with built-in utility and governance rights",
                gradient: "from-gold-500 to-gold-600",
                bgGradient: "from-gold-500/10 to-gold-600/5",
                features: ["Personal tokens", "Utility rewards", "Staking mechanisms", "Cross-platform value"],
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group relative bg-gradient-to-br ${feature.bgGradient} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 text-center pb-4">
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div
                      className={`absolute -inset-2 bg-gradient-to-r ${feature.gradient} rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity`}
                    />
                  </div>
                  <CardTitle className="text-white text-2xl font-bold mb-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <CardDescription className="text-white/70 leading-relaxed text-lg text-center">
                    {feature.description}
                  </CardDescription>
                  <div className="grid grid-cols-2 gap-3">
                    {feature.features.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-2 p-2 bg-white/5 rounded-xl backdrop-blur-sm"
                      >
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span className="text-white/80 text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blockchain Benefits Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why{" "}
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Blockchain?
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover how blockchain technology revolutionizes the astrology experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: Shield,
                  title: "Immutable Records",
                  description:
                    "Your predictions and readings are permanently stored on-chain, creating an unalterable history of accuracy.",
                },
                {
                  icon: Users2,
                  title: "Community Ownership",
                  description:
                    "Participate in governance decisions and shape the future of the platform through DAO voting.",
                },
                {
                  icon: Coins,
                  title: "True Digital Ownership",
                  description:
                    "Own your cosmic identity as NFTs that you can trade, stake, or use across the Web3 ecosystem.",
                },
                {
                  icon: Globe,
                  title: "Global Accessibility",
                  description:
                    "Access astrology services from anywhere in the world without traditional banking limitations.",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-white/70 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Blocks className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Blockchain Secured</h3>
                    <p className="text-white/70">
                      Every transaction, prediction, and interaction is secured by Flow's robust blockchain network.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-green-400">99.9%</div>
                      <div className="text-white/70 text-sm">Uptime</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-blue-400">24/7</div>
                      <div className="text-white/70 text-sm">Available</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-purple-400">∞</div>
                      <div className="text-white/70 text-sm">Immutable</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-gold-400">0</div>
                      <div className="text-white/70 text-sm">Censorship</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planetary Carousel */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Platform{" "}
              <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Journey through our comprehensive Web3 astrology ecosystem
            </p>
          </div>

          <PlanetaryCarousel />
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-gold-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 hover:border-white/20 transition-all duration-300">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-full px-6 py-3">
                <Rocket className="w-4 h-4 text-gold-400" />
                <span className="text-sm font-medium text-white">Join the Web3 Revolution</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Ready to Enter the
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                  Cosmic Web3?
                </span>
              </h2>

              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Join thousands of users exploring the intersection of ancient wisdom and blockchain innovation
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 rounded-2xl font-semibold"
                >
                  <Link href="/mint-chart">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Mint Your Cosmic NFT
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="group relative bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-2xl shadow-gold-500/25 hover:shadow-gold-500/40 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 rounded-2xl font-semibold"
                >
                  <Link href="/zodiac-dao">
                    <Users2 className="w-6 h-6 mr-3" />
                    Join DAO Community
                  </Link>
                </Button>
              </div>

              {/* Web3 Badges */}
              <div className="flex flex-wrap justify-center gap-4 pt-8">
                {["🔗 Flow Powered", "🛡️ Decentralized", "🌐 Global Access", "💎 True Ownership"].map(
                  (badge, index) => (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/80"
                    >
                      {badge}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-white/10 py-20 px-6 mt-20 bg-gradient-to-br from-slate-950/80 to-purple-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 via-pink-400 to-gold-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-gold-400 rounded-2xl blur opacity-30" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-gold-200 bg-clip-text text-transparent">
                    AstroFi
                  </span>
                  <span className="text-xs text-purple-300 font-medium">Web3 Astrology</span>
                </div>
              </Link>
              <p className="text-white/70 leading-relaxed">
                The world's first blockchain-powered astrology platform, bridging ancient cosmic wisdom with
                cutting-edge Web3 technology.
              </p>
              <div className="flex space-x-4">
                {["🌟", "🌙", "⭐", "🔮"].map((emoji, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-110"
                  >
                    <span className="text-lg">{emoji}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: "Web3 Platform",
                links: [
                  { href: "/mint-chart", label: "Mint NFT Chart" },
                  { href: "/astrologers", label: "DAO Astrologers" },
                  { href: "/predictions", label: "Prediction Markets" },
                  { href: "/daily-rashi", label: "Daily Predictions" },
                ],
              },
              {
                title: "Community",
                links: [
                  { href: "/zodiac-dao", label: "Zodiac DAOs" },
                  { href: "/reputation", label: "Reputation System" },
                  { href: "/compatibility", label: "Compatibility" },
                  { href: "/create-token", label: "Create Token" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { href: "#", label: "Whitepaper" },
                  { href: "#", label: "Smart Contracts" },
                  { href: "#", label: "Discord" },
                  { href: "#", label: "Twitter" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors hover:translate-x-1 inline-block font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-16 pt-8 text-center">
            <p className="text-white/70">© 2024 AstroFi. All rights reserved. Built on Flow blockchain ⛓️✨</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
