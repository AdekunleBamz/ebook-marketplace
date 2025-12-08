# EbookMarketplace Smart Contract

## Overview
This smart contract enables a decentralized ebook marketplace where sellers can list ebooks and buyers can purchase them using ERC20 tokens (USDC on Base, cUSD on Celo).

## Features
- ✅ List ebooks for sale with custom pricing
- ✅ Purchase ebooks with ERC20 tokens
- ✅ Platform fee support (configurable, max 10%)
- ✅ On-chain purchase records
- ✅ Multi-token support (USDC, cUSD, etc.)
- ✅ Seller payment directly to their wallet
- ✅ Reentrancy protection

## Deployment Instructions (Remix)

### Step 1: Open Remix
Go to https://remix.ethereum.org

### Step 2: Create the Contract File
1. In the File Explorer, create a new file: `EbookMarketplace.sol`
2. Copy the entire contract code from `contracts/EbookMarketplace.sol`

### Step 3: Install OpenZeppelin
In Remix, the imports will auto-resolve from npm. If not, create these files:

Or simply use the flattened version in `contracts/EbookMarketplaceFlat.sol`

### Step 4: Compile
1. Go to "Solidity Compiler" tab
2. Select compiler version `0.8.19` or higher
3. Enable optimization (200 runs recommended)
4. Click "Compile"

### Step 5: Deploy

#### For Base Mainnet:
1. Connect MetaMask to Base network
2. Go to "Deploy & Run" tab
3. Select "Injected Provider - MetaMask"
4. Select `EbookMarketplace` contract
5. Enter constructor parameters:
   - `_feeRecipient`: Your wallet address to receive platform fees
   - `_platformFeeBps`: Fee in basis points (e.g., 250 = 2.5%)
6. Click "Deploy" and confirm in MetaMask

#### For Celo Mainnet:
Same steps but connect MetaMask to Celo network

### Step 6: Configure Accepted Tokens

After deployment, call `addAcceptedToken` with:

**Base Mainnet:**
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

**Celo Mainnet:**
- cUSD: `0x765DE816845861e75A25fCA122bb6898B8B1282a`

## Contract Functions

### Admin Functions (Only Owner)
| Function | Description |
|----------|-------------|
| `addAcceptedToken(address)` | Add a payment token |
| `removeAcceptedToken(address)` | Remove a payment token |
| `updatePlatformFee(uint256)` | Update fee (max 1000 = 10%) |
| `updateFeeRecipient(address)` | Change fee recipient |

### Seller Functions
| Function | Description |
|----------|-------------|
| `listEbook(ebookId, token, price)` | List an ebook for sale |
| `updateEbookPrice(ebookId, newPrice)` | Update listing price |
| `delistEbook(ebookId)` | Remove listing |

### Buyer Functions
| Function | Description |
|----------|-------------|
| `purchaseEbook(ebookId)` | Buy an ebook (requires token approval first) |

### View Functions
| Function | Description |
|----------|-------------|
| `getEbook(ebookId)` | Get ebook details |
| `checkPurchase(buyer, ebookId)` | Check if buyer owns ebook |
| `calculateFee(price)` | Calculate platform fee |

## Integration with Frontend

After deploying, update your frontend with:

1. Contract addresses for each chain
2. Update `EbookGrid.tsx` to use contract's `purchaseEbook` instead of direct transfer
3. Add token approval step before purchase

## Price Format

Prices are in the token's smallest unit:
- USDC (6 decimals): $9.99 = `9990000`
- cUSD (18 decimals): $9.99 = `9990000000000000000`

## Security Features
- ReentrancyGuard prevents reentrancy attacks
- SafeERC20 for safe token transfers
- Ownable for admin access control
- Maximum fee cap (10%)

## Events
Monitor these events for your backend:
- `EbookListed` - New listing
- `EbookPurchased` - Successful purchase
- `EbookDelisted` - Listing removed
- `EbookPriceUpdated` - Price changed
