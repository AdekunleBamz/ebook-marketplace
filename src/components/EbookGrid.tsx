'use client'

import { useMarketplace } from '@/context/MarketplaceContext'
import EbookCard from './EbookCard'
import { Ebook, GENRES } from '@/types'
import { useAppKitAccount, useAppKitNetwork, useAppKit } from '@reown/appkit/react'
import { TOKENS, CHAIN_IDS } from '@/types'
import { useWriteContract, useWaitForTransactionReceipt, useSignMessage } from 'wagmi'
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
  const { ebooks, selectedGenre, isLoading } = useMarketplace()
  const { isConnected, address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { open } = useAppKit()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { signMessageAsync } = useSignMessage()

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

  if (isLoading) {
    return (
      <div className="flex-1 p-3 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading ebooks...</p>
        </div>
      </div>
    )
  }

  const handleDownload = (ebook: Ebook) => {
    // Check if it's a valid data URL or regular URL
    if (ebook.pdfUrl.startsWith('data:') || ebook.pdfUrl.startsWith('http')) {
      // Create a download link
      const link = document.createElement('a')
      link.href = ebook.pdfUrl
      link.download = `${ebook.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (ebook.pdfUrl.startsWith('blob:')) {
      alert('This file is no longer available. The seller needs to re-upload the ebook.')
    } else {
      window.open(ebook.pdfUrl, '_blank')
    }
  }

  const handlePurchase = async (ebook: Ebook) => {
    // Require wallet connection for all downloads
    if (!isConnected) {
      open()
      return
    }

    if (ebook.isFree) {
      // Free ebook - require signature before download
      setDownloadingId(ebook.id)
      try {
        const timestamp = Date.now()
        const message = `I am downloading "${ebook.title}" by ${ebook.author} from Ebook Marketplace.

Type: Free Download
Timestamp: ${timestamp}
Downloader: ${address}

By signing, I confirm this download.`

        await signMessageAsync({ message })
        handleDownload(ebook)
      } catch (error) {
        console.error('Signature error:', error)
        alert('Download cancelled - signature required')
      } finally {
        setDownloadingId(null)
      }
      return
    }

    // Paid ebook - require payment to seller's payment wallet
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
      
      // Use paymentWallet if set, otherwise fall back to seller address
      const recipientWallet = ebook.paymentWallet || ebook.seller

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipientWallet as `0x${string}`, amount]
      })

      // After successful transaction, allow download
      // Note: In production, you'd verify the transaction on backend before allowing download
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to initiate purchase. Please try again.')
    } finally {
      setPurchasingId(null)
    }
  }

  return (
    <div className="flex-1 p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>{genreIcon}</span>
          {genreTitle}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
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
              isLoading={purchasingId === ebook.id || downloadingId === ebook.id}
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
