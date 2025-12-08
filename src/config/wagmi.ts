import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, celo } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_REOWN_PROJECT_ID is not set')
}

export const networks = [base, celo]

// Set up the Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }) as any,
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
