'use client'

import Image from 'next/image'
import Link from 'next/link'
import ConnectButton from './ConnectButton'
import { Book, Upload, Search } from 'lucide-react'
import { useState } from 'react'
import { useMarketplace } from '@/context/MarketplaceContext'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { searchEbooks } = useMarketplace()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const results = searchEbooks(searchQuery)
      console.log('Search results:', results)
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-teal-900/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Ebook Marketplace"
              width={45}
              height={45}
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-teal-400">EBOOK</h1>
              <p className="text-xs text-amber-500 font-semibold -mt-1">MARKETPLACE</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search ebooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/browse"
              className="flex items-center gap-1 text-gray-300 hover:text-teal-400 transition-colors px-3 py-2"
            >
              <Book size={18} />
              <span className="hidden sm:inline">Browse</span>
            </Link>
            <Link
              href="/upload"
              className="flex items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors px-3 py-2"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Sell</span>
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
