'use client'

import { Ebook, TOKENS } from '@/types'
import { ShoppingCart, Download, Eye } from 'lucide-react'
import Image from 'next/image'

interface EbookCardProps {
  ebook: Ebook
  onPurchase: (ebook: Ebook) => void
}

export default function EbookCard({ ebook, onPurchase }: EbookCardProps) {
  const chainInfo = ebook.chain === 'base' 
    ? { name: 'Base', symbol: TOKENS.base.symbol, color: 'text-blue-400' }
    : { name: 'Celo', symbol: TOKENS.celo.symbol, color: 'text-green-400' }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl border border-teal-900/30 overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/20 group">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-teal-900/30 to-amber-900/30 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-50">📕</div>
        </div>
        {ebook.coverImage && ebook.coverImage.length > 10 && (
          <img
            src={ebook.coverImage}
            alt={ebook.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          {ebook.isFree ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              FREE
            </span>
          ) : (
            <span className="bg-gradient-to-r from-teal-600 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {ebook.price} {chainInfo.symbol}
            </span>
          )}
        </div>

        {/* Chain Badge */}
        <div className="absolute top-3 left-3">
          <span className={`bg-black/50 backdrop-blur-sm ${chainInfo.color} px-2 py-1 rounded text-xs font-medium`}>
            {chainInfo.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-teal-400 transition-colors">
          {ebook.title}
        </h3>
        <p className="text-sm text-amber-400 mb-2">by {ebook.author}</p>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {ebook.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{formatFileSize(ebook.fileSize)}</span>
          <span>{formatDate(ebook.uploadedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPurchase(ebook)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all duration-200 ${
              ebook.isFree
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white'
            }`}
          >
            {ebook.isFree ? (
              <>
                <Download size={16} />
                Download
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Buy Now
              </>
            )}
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors">
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
