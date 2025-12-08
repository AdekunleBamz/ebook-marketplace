'use client'

import { useState } from 'react'
import { useMarketplace } from '@/context/MarketplaceContext'
import { GENRES, Genre, MAX_FILE_SIZE } from '@/types'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import { CHAIN_IDS } from '@/types'

export default function UploadForm() {
  const { addEbook } = useMarketplace()
  const { isConnected, address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: 'fiction' as Genre,
    price: '',
    isFree: false
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')

  const currentChain = chainId === CHAIN_IDS.base ? 'base' : chainId === CHAIN_IDS.celo ? 'celo' : null

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 50MB')
        return
      }
      setPdfFile(file)
      setError('')
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file for the cover')
        return
      }
      setCoverFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!currentChain) {
      setError('Please switch to Base or Celo network')
      return
    }

    if (!pdfFile) {
      setError('Please upload a PDF file')
      return
    }

    if (!formData.isFree && (!formData.price || parseFloat(formData.price) <= 0)) {
      setError('Please set a valid price or mark as free')
      return
    }

    setIsUploading(true)

    try {
      // In production, you would upload to IPFS/Arweave here
      // For demo, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      addEbook({
        title: formData.title,
        author: formData.author,
        description: formData.description,
        genre: formData.isFree ? 'free' : formData.genre,
        price: formData.isFree ? '0' : formData.price,
        chain: currentChain,
        coverImage: coverFile ? URL.createObjectURL(coverFile) : '',
        pdfUrl: URL.createObjectURL(pdfFile), // In production: IPFS URL
        seller: address || '',
        isFree: formData.isFree,
        fileSize: pdfFile.size
      })

      setUploadSuccess(true)
      setFormData({
        title: '',
        author: '',
        description: '',
        genre: 'fiction',
        price: '',
        isFree: false
      })
      setPdfFile(null)
      setCoverFile(null)

      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      setError('Failed to upload ebook. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl border border-teal-900/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Upload className="text-teal-400" />
          List Your Ebook
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Share your knowledge with readers on {currentChain === 'base' ? 'Base (USDC)' : currentChain === 'celo' ? 'Celo (cUSD)' : 'Base or Celo'}
        </p>

        {!isConnected && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-amber-400 text-sm">
              ⚠️ Please connect your wallet to list an ebook
            </p>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-green-400">Ebook listed successfully!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Enter book title"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Enter author name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 min-h-[100px]"
              placeholder="Describe your ebook..."
              required
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Genre *
            </label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value as Genre })}
              className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              disabled={formData.isFree}
            >
              {GENRES.filter(g => g.value !== 'free').map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.icon} {genre.label}
                </option>
              ))}
            </select>
          </div>

          {/* Free Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFree"
              checked={formData.isFree}
              onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? '0' : formData.price })}
              className="w-4 h-4 rounded border-teal-900 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="isFree" className="text-gray-300 text-sm">
              🎁 Offer this ebook for FREE
            </label>
          </div>

          {/* Price */}
          {!formData.isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price ({currentChain === 'celo' ? 'cUSD' : 'USDC'}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#0f0f1a] border border-teal-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                placeholder="9.99"
                required={!formData.isFree}
              />
            </div>
          )}

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              PDF File * (Max 50MB)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex items-center justify-center gap-2 w-full bg-[#0f0f1a] border-2 border-dashed border-teal-900/50 rounded-lg px-4 py-8 text-gray-400 hover:border-teal-500 hover:text-teal-400 cursor-pointer transition-colors"
              >
                {pdfFile ? (
                  <div className="flex items-center gap-2 text-teal-400">
                    <FileText size={20} />
                    <span>{pdfFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setPdfFile(null); }}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Click to upload PDF</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cover Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="flex items-center justify-center gap-2 w-full bg-[#0f0f1a] border-2 border-dashed border-amber-900/50 rounded-lg px-4 py-6 text-gray-400 hover:border-amber-500 hover:text-amber-400 cursor-pointer transition-colors"
              >
                {coverFile ? (
                  <div className="flex items-center gap-2 text-amber-400">
                    <span>📷 {coverFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setCoverFile(null); }}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>📷</span>
                    <span>Click to upload cover image</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isConnected || isUploading}
            className="w-full bg-gradient-to-r from-teal-600 to-amber-500 hover:from-teal-500 hover:to-amber-400 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                List Ebook
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
