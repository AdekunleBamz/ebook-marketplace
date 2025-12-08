'use client'

import { useMarketplace } from '@/context/MarketplaceContext'
import EbookCard from './EbookCard'
import { Ebook, GENRES } from '@/types'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { TOKENS, CHAIN_IDS } from '@/types'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { useState } from 'react'

// ERC20 ABI for transfer
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  }
] as const

export default function EbookGrid() {
  const { ebooks, selectedGenre } = useMarketplace()
  const { isConnected, address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const filteredEbooks = selectedGenre === 'all' 
    ? ebooks 
    : selectedGenre === 'free'
    ? ebooks.filter(book => book.isFree)
    : ebooks.filter(book => book.genre === selectedGenre)

  const currentGenre = GENRES.find(g => g.value === selectedGenre)
  const genreTitle = selectedGenre === 'all' ? 'All Books' : currentGenre?.label || 'Books'
  const genreIcon = selectedGenre === 'all' ? '📚' : currentGenre?.icon || '📖'

  const handlePurchase = async (ebook: Ebook) => {
    if (ebook.isFree) {
      // Handle free download
      alert(`Downloading "${ebook.title}"... (Demo - would download PDF)`)
      return
    }

    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    // Check if user is on the correct chain
    const requiredChainId = ebook.chain === 'base' ? CHAIN_IDS.base : CHAIN_IDS.celo
    if (chainId !== requiredChainId) {
      alert(`Please switch to ${ebook.chain === 'base' ? 'Base' : 'Celo'} network to purchase this ebook`)
      return
    }

    setPurchasingId(ebook.id)

    try {
      const tokenAddress = ebook.chain === 'base' ? TOKENS.base.USDC : TOKENS.celo.cUSD
      const decimals = ebook.chain === 'base' ? TOKENS.base.decimals : TOKENS.celo.decimals
      const amount = parseUnits(ebook.price, decimals)

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [ebook.seller as `0x${string}`, amount]
      })

      alert(`Purchase initiated for "${ebook.title}"! Check your wallet to confirm.`)
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to initiate purchase. Please try again.')
    } finally {
      setPurchasingId(null)
    }
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>{genreIcon}</span>
          {genreTitle}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {filteredEbooks.length} {filteredEbooks.length === 1 ? 'book' : 'books'} available
        </p>
      </div>

      {/* Grid */}
      {filteredEbooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEbooks.map((ebook) => (
            <EbookCard
              key={ebook.id}
              ebook={ebook}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No books found</h3>
          <p className="text-gray-500">
            {selectedGenre === 'all' 
              ? 'Be the first to upload an ebook!'
              : `No books in ${genreTitle} yet. Check back later!`}
          </p>
        </div>
      )}
    </div>
  )
}
