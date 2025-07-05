import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// import { WagmiProviders } from "@/components/providers/wagmi-provider" // Commented out for Privy migration
import { PrivyProviders } from "@/components/providers/privy-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AstroFi - Web3 Astrology Platform",
  description:
    "The first blockchain-powered astrology ecosystem. Mint cosmic NFTs, trade astrologer tokens, and join decentralized communities.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <WagmiProviders> Commented out for Privy migration */}
        <PrivyProviders>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                  color: "white",
                },
              }}
            />
          </ThemeProvider>
        </PrivyProviders>
        {/* </WagmiProviders> Commented out for Privy migration */}
      </body>
    </html>
  )
}
