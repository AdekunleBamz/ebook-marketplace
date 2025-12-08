'use client'

import Image from 'next/image'
import Link from 'next/link'
import ConnectButton from './ConnectButton'
import { Book, Upload, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useMarketplace } from '@/context/MarketplaceContext'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Ebook Marketplace"
              width={40}
              height={40}
              className="rounded-lg w-9 h-9 sm:w-[45px] sm:h-[45px]"
            />
            <div className="hidden xs:block sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-teal-400">EBOOK</h1>
              <p className="text-[10px] sm:text-xs text-amber-500 font-semibold -mt-1">MARKETPLACE</p>
            </div>
          </Link>

          {/* Search Bar - Hidden on small mobile */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search ebooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors text-sm"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 sm:gap-4">
            <Link
              href="/browse"
              className="flex items-center gap-1 text-gray-300 hover:text-teal-400 transition-colors px-3 py-2"
            >
              <Book size={18} />
              <span>Browse</span>
            </Link>
            <Link
              href="/upload"
              className="flex items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors px-3 py-2"
            >
              <Upload size={18} />
              <span>Sell</span>
            </Link>
            <ConnectButton />
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-teal-400 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search - Visible on small screens */}
        <form onSubmit={handleSearch} className="sm:hidden mt-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search ebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors text-sm"
            />
          </div>
        </form>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pb-2 border-t border-teal-900/30 pt-3 space-y-2">
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors px-3 py-2 rounded-lg hover:bg-teal-900/20"
            >
              <Book size={18} />
              <span>Browse</span>
            </Link>
            <Link
              href="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-amber-900/20"
            >
              <Upload size={18} />
              <span>Sell Ebook</span>
            </Link>
            <div className="px-3 py-2">
              <ConnectButton />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
