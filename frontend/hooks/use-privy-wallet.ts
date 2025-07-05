import { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { contractService } from '@/lib/contracts'
import { toast } from 'sonner'

const FLOW_TESTNET_CHAIN_ID = '0x221' // 545 in hex
const FLOW_TESTNET_RPC_URL = 'https://rpc.testnet.flow.com'

export function usePrivyWallet() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const wallet = wallets[0]
      
      // Set up the signer for contract interactions
      const setupSigner = async () => {
        try {
          // Get the provider from the wallet
          const provider = await wallet.getEthereumProvider()
          const ethersProvider = new ethers.BrowserProvider(provider)
          const signer = await ethersProvider.getSigner()
          
          // Get the chain ID from the provider
          const network = await ethersProvider.getNetwork()
          const chainId = Number(network.chainId)
          
          // Check if we're on the correct network
          if (chainId !== 545) {
            // Switch to Flow testnet
            try {
              await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: FLOW_TESTNET_CHAIN_ID }]
              })
              toast.success('Switched to Flow Testnet')
            } catch (error: any) {
              // If the chain is not added, add it
              if (error.code === 4902) {
                try {
                  await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: FLOW_TESTNET_CHAIN_ID,
                      chainName: 'Flow Testnet',
                      nativeCurrency: {
                        name: 'Flow',
                        symbol: 'FLOW',
                        decimals: 18
                      },
                      rpcUrls: [FLOW_TESTNET_RPC_URL],
                      blockExplorerUrls: ['https://testnet.flowscan.org']
                    }]
                  })
                  await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: FLOW_TESTNET_CHAIN_ID }]
                  })
                  toast.success('Added and switched to Flow Testnet')
                } catch (addError) {
                  console.error('Failed to add Flow Testnet:', addError)
                  toast.error('Failed to switch to Flow Testnet. Please add it manually.')
                  return
                }
              } else {
                console.error('Failed to switch to Flow Testnet:', error)
                toast.error('Failed to switch network. Please try again.')
                return
              }
            }
            
            // Get new signer after network switch
            const updatedProvider = await wallet.getEthereumProvider()
            const updatedEthersProvider = new ethers.BrowserProvider(updatedProvider)
            const updatedSigner = await updatedEthersProvider.getSigner()
            contractService.setSigner(updatedSigner)
          } else {
            contractService.setSigner(signer)
          }
          
          contractService.setChainId(545) // Flow testnet
        } catch (error) {
          console.error('Failed to setup signer:', error)
          toast.error('Failed to connect wallet. Please try again.')
        }
      }
      
      setupSigner()
    } else {
      contractService.setSigner(null)
    }
  }, [ready, authenticated, wallets])

  return {
    ready,
    authenticated,
    wallets,
    userAddress: wallets.length > 0 ? wallets[0].address : null
  }
} 