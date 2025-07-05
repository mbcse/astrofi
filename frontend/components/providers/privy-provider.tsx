"use client"

import { ReactNode } from "react"
import { PrivyProvider } from '@privy-io/react-auth'

interface PrivyProvidersProps {
  children: ReactNode
}

export function PrivyProviders({ children }: PrivyProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clp9o6lw300ycl80f4fhvgynd"}
      config={{
        // Customize Privy's appearance and behavior
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
          logo: 'https://astrofi.app/logo.png',
        },
        // Configure supported login methods
        loginMethods: ['email', 'wallet', 'google', 'discord', 'twitter'],
        // Configure supported wallets
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
        },
        // Configure external wallets
        externalWallets: {
          metamask: true,
          coinbaseWallet: true,
          walletConnect: true,
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
} 