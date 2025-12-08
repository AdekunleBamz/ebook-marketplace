'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Wallet, LogOut } from 'lucide-react'

export default function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => open({ view: 'Account' })}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-lg text-sm sm:text-base"
        >
          <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="font-medium">{formatAddress(address)}</span>
        </button>
        <button
          onClick={() => open({ view: 'Networks' })}
          className="bg-amber-600 hover:bg-amber-500 text-white px-2 sm:px-3 py-2 rounded-lg transition-all duration-200"
          title="Switch Network"
        >
          <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-amber-500 hover:from-teal-500 hover:to-amber-400 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base w-full md:w-auto justify-center"
    >
      <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
      <span>Connect Wallet</span>
    </button>
  )
}
