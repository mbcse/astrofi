import { http, createConfig } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "4418053dc712762f159f1e78c43b4963"

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "AstroFi",
      appLogoUrl: "https://astrofi.app/logo.png",
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "AstroFi",
        description: "Web3 Astrology Platform",
        url: "https://astrofi.app",
        icons: ["https://astrofi.app/logo.png"],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
