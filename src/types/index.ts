export interface Ebook {
  id: string
  title: string
  author: string
  description: string
  genre: Genre
  price: string // Price in USDC/cUSD
  chain: 'base' | 'celo'
  coverImage: string
  pdfUrl: string
  uploadedAt: number
  seller: string // Uploader's wallet address
  paymentWallet: string // Wallet to receive payments (can be different from seller)
  isFree: boolean
  fileSize: number // in bytes
}

export type Genre =
  | 'fiction'
  | 'non-fiction'
  | 'finance'
  | 'crypto'
  | 'travel'
  | 'adventure'
  | 'romance'
  | 'mystery'
  | 'sci-fi'
  | 'biography'
  | 'self-help'
  | 'technology'
  | 'free'

export const GENRES: { value: Genre; label: string; icon: string }[] = [
  { value: 'fiction', label: 'Fiction', icon: '📚' },
  { value: 'non-fiction', label: 'Non-Fiction', icon: '📖' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'romance', label: 'Romance', icon: '💕' },
  { value: 'mystery', label: 'Mystery', icon: '🔍' },
  { value: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
  { value: 'biography', label: 'Biography', icon: '👤' },
  { value: 'self-help', label: 'Self-Help', icon: '🌟' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'free', label: 'Free Books', icon: '🎁' }
]

// Maximum file size: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024

// Token addresses
export const TOKENS = {
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    symbol: 'USDC'
  },
  celo: {
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    decimals: 18,
    symbol: 'cUSD'
  }
}

// Chain IDs
export const CHAIN_IDS = {
  base: 8453,
  celo: 42220
}
