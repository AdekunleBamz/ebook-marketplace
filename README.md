# Ebook Marketplace - Farcaster MiniApp

A decentralized marketplace for ebooks on Base and Celo chains. Authors can upload their PDF ebooks and list them for sale in USDC (Base) or cUSD (Celo).

![Ebook Marketplace Logo](public/logo.png)

## Features

- 📚 **Browse by Genre**: Fiction, Non-Fiction, Finance, Crypto, Travel, Adventure, Romance, Mystery, Sci-Fi, Biography, Self-Help, Technology
- 🎁 **Free Books Section**: Authors can offer books for free
- 💰 **Multi-Chain Support**: Pay with USDC on Base or cUSD on Celo
- 📤 **Easy Upload**: Authors can easily list their ebooks
- 🔗 **Wallet Integration**: Powered by Reown AppKit (formerly WalletConnect)
- 🖼️ **Farcaster Frame**: Works as a Farcaster miniApp

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Wallet**: Reown AppKit + Wagmi
- **Chains**: Base & Celo
- **Payments**: USDC (Base) / cUSD (Celo)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Reown Project ID (get one at [cloud.reown.com](https://cloud.reown.com))

### Installation

1. Clone the repository:
```bash
cd ebook-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Reown Project ID to `.env.local`:
```
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_URL=http://localhost:3000
```

5. Add your logo:
   - Place your logo file as `public/logo.png`
   - Create an OG image as `public/og-image.png` (1200x630px recommended)

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Homepage with ebook grid
│   ├── browse/page.tsx   # Browse page
│   ├── upload/page.tsx   # Upload/sell page
│   ├── layout.tsx        # Root layout with providers
│   └── globals.css       # Global styles
├── components/
│   ├── Header.tsx        # Navigation header
│   ├── GenreSidebar.tsx  # Genre filter sidebar
│   ├── EbookCard.tsx     # Individual book card
│   ├── EbookGrid.tsx     # Books grid display
│   ├── UploadForm.tsx    # Ebook upload form
│   └── ConnectButton.tsx # Wallet connect button
├── context/
│   ├── Web3Provider.tsx      # Reown AppKit setup
│   └── MarketplaceContext.tsx # App state management
├── config/
│   └── wagmi.ts          # Wagmi configuration
└── types/
    └── index.ts          # TypeScript types & constants
```

## Supported Tokens

| Chain | Token | Address |
|-------|-------|---------|
| Base | USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Celo | cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |

## File Size Limit

- Maximum ebook size: **50MB**
- Supported format: **PDF only**

## Farcaster Integration

This app is designed to work as a Farcaster miniApp/Frame. The manifest is located at:
```
public/.well-known/farcaster.json
```

Update the URLs in the manifest before deploying to production.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```
NEXT_PUBLIC_REOWN_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_URL=https://your-domain.com
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.
