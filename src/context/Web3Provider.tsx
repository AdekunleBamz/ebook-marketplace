'use client'

import { wagmiAdapter, projectId } from '@/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { base, celo } from '@reown/appkit/networks'
import React, { type ReactNode, useEffect, useState } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

// Set up metadata
const metadata = {
  name: 'Ebook Marketplace',
  description: 'A decentralized marketplace for ebooks on Base and Celo',
  url: 'https://ebook-marketplace.vercel.app',
  icons: ['/logo.png']
}

// Create modal instance
let modalCreated = false

function Web3Provider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [ready, setReady] = useState(false)
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  useEffect(() => {
    if (!modalCreated && projectId) {
      try {
        createAppKit({
          adapters: [wagmiAdapter],
          projectId,
          networks: [base, celo],
          defaultNetwork: base,
          metadata: metadata,
          features: {
            analytics: false
          },
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': '#14b8a6',
            '--w3m-color-mix': '#1a1a2e',
            '--w3m-color-mix-strength': 40
          }
        })
        modalCreated = true
      } catch (e) {
        console.error('AppKit init error:', e)
      }
    }
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="text-teal-400 text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
