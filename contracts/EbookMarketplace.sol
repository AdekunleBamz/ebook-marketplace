// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EbookMarketplace
 * @dev A marketplace contract for buying and selling ebooks with ERC20 tokens
 * @notice Supports USDC on Base and cUSD on Celo
 */
contract EbookMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Platform fee in basis points (100 = 1%, 250 = 2.5%)
    uint256 public platformFeeBps;
    
    // Maximum fee is 10%
    uint256 public constant MAX_FEE_BPS = 1000;
    
    // Accepted payment tokens (USDC on Base, cUSD on Celo)
    mapping(address => bool) public acceptedTokens;
    
    // Ebook listing structure
    struct Ebook {
        string ebookId;          // Off-chain ebook ID (from Supabase)
        address seller;          // Seller's wallet (receives payment)
        address paymentToken;    // Token address for payment
        uint256 price;           // Price in token's smallest unit
        bool isActive;           // Whether listing is active
        uint256 totalSales;      // Number of copies sold
    }
    
    // Purchase record
    struct Purchase {
        address buyer;
        string ebookId;
        uint256 price;
        uint256 timestamp;
        bytes32 txHash;
    }
    
    // Mapping from ebookId hash to Ebook
    mapping(bytes32 => Ebook) public ebooks;
    
    // Mapping from buyer address to their purchased ebook IDs
    mapping(address => bytes32[]) public buyerPurchases;
    
    // Mapping to check if buyer has purchased specific ebook
    mapping(address => mapping(bytes32 => bool)) public hasPurchased;
    
    // All ebook IDs for enumeration
    bytes32[] public allEbookIds;
    
    // Platform fee recipient
    address public feeRecipient;
    
    // Events
    event EbookListed(
        bytes32 indexed ebookIdHash,
        string ebookId,
        address indexed seller,
        address paymentToken,
        uint256 price
    );
    
    event EbookPurchased(
        bytes32 indexed ebookIdHash,
        string ebookId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee
    );
    
    event EbookDelisted(bytes32 indexed ebookIdHash, string ebookId);
    
    event EbookPriceUpdated(
        bytes32 indexed ebookIdHash,
        string ebookId,
        uint256 oldPrice,
        uint256 newPrice
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    constructor(
        address _feeRecipient,
        uint256 _platformFeeBps
    ) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_platformFeeBps <= MAX_FEE_BPS, "Fee too high");
        
        feeRecipient = _feeRecipient;
        platformFeeBps = _platformFeeBps;
    }

    // ============ Admin Functions ============

    /**
     * @dev Add an accepted payment token
     * @param token Address of the ERC20 token
     */
    function addAcceptedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!acceptedTokens[token], "Token already accepted");
        
        acceptedTokens[token] = true;
        emit TokenAdded(token);
    }

    /**
     * @dev Remove an accepted payment token
     * @param token Address of the ERC20 token
     */
    function removeAcceptedToken(address token) external onlyOwner {
        require(acceptedTokens[token], "Token not accepted");
        
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }

    /**
     * @dev Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    // ============ Seller Functions ============

    /**
     * @dev List an ebook for sale
     * @param ebookId Off-chain ebook ID (from your database)
     * @param paymentToken Token address for payment
     * @param price Price in token's smallest unit (e.g., 6 decimals for USDC)
     */
    function listEbook(
        string calldata ebookId,
        address paymentToken,
        uint256 price
    ) external {
        require(bytes(ebookId).length > 0, "Invalid ebook ID");
        require(acceptedTokens[paymentToken], "Token not accepted");
        require(price > 0, "Price must be greater than 0");
        
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        require(!ebooks[ebookIdHash].isActive, "Ebook already listed");
        
        ebooks[ebookIdHash] = Ebook({
            ebookId: ebookId,
            seller: msg.sender,
            paymentToken: paymentToken,
            price: price,
            isActive: true,
            totalSales: 0
        });
        
        allEbookIds.push(ebookIdHash);
        
        emit EbookListed(ebookIdHash, ebookId, msg.sender, paymentToken, price);
    }

    /**
     * @dev Update ebook price
     * @param ebookId Off-chain ebook ID
     * @param newPrice New price in token's smallest unit
     */
    function updateEbookPrice(
        string calldata ebookId,
        uint256 newPrice
    ) external {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        Ebook storage ebook = ebooks[ebookIdHash];
        
        require(ebook.isActive, "Ebook not listed");
        require(ebook.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be greater than 0");
        
        uint256 oldPrice = ebook.price;
        ebook.price = newPrice;
        
        emit EbookPriceUpdated(ebookIdHash, ebookId, oldPrice, newPrice);
    }

    /**
     * @dev Delist an ebook
     * @param ebookId Off-chain ebook ID
     */
    function delistEbook(string calldata ebookId) external {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        Ebook storage ebook = ebooks[ebookIdHash];
        
        require(ebook.isActive, "Ebook not listed");
        require(ebook.seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        ebook.isActive = false;
        
        emit EbookDelisted(ebookIdHash, ebookId);
    }

    // ============ Buyer Functions ============

    /**
     * @dev Purchase an ebook
     * @param ebookId Off-chain ebook ID
     * @notice Buyer must approve this contract to spend the required tokens first
     */
    function purchaseEbook(string calldata ebookId) external nonReentrant {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        Ebook storage ebook = ebooks[ebookIdHash];
        
        require(ebook.isActive, "Ebook not listed");
        require(!hasPurchased[msg.sender][ebookIdHash], "Already purchased");
        require(msg.sender != ebook.seller, "Cannot buy your own ebook");
        
        IERC20 token = IERC20(ebook.paymentToken);
        uint256 price = ebook.price;
        
        // Calculate platform fee
        uint256 platformFee = (price * platformFeeBps) / 10000;
        uint256 sellerAmount = price - platformFee;
        
        // Transfer payment from buyer
        // Buyer must have approved this contract first
        token.safeTransferFrom(msg.sender, ebook.seller, sellerAmount);
        
        if (platformFee > 0) {
            token.safeTransferFrom(msg.sender, feeRecipient, platformFee);
        }
        
        // Record purchase
        hasPurchased[msg.sender][ebookIdHash] = true;
        buyerPurchases[msg.sender].push(ebookIdHash);
        ebook.totalSales++;
        
        emit EbookPurchased(
            ebookIdHash,
            ebookId,
            msg.sender,
            ebook.seller,
            price,
            platformFee
        );
    }

    // ============ View Functions ============

    /**
     * @dev Get ebook details by ID
     * @param ebookId Off-chain ebook ID
     */
    function getEbook(string calldata ebookId) external view returns (
        address seller,
        address paymentToken,
        uint256 price,
        bool isActive,
        uint256 totalSales
    ) {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        Ebook storage ebook = ebooks[ebookIdHash];
        
        return (
            ebook.seller,
            ebook.paymentToken,
            ebook.price,
            ebook.isActive,
            ebook.totalSales
        );
    }

    /**
     * @dev Check if a buyer has purchased an ebook
     * @param buyer Buyer's address
     * @param ebookId Off-chain ebook ID
     */
    function checkPurchase(
        address buyer,
        string calldata ebookId
    ) external view returns (bool) {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        return hasPurchased[buyer][ebookIdHash];
    }

    /**
     * @dev Get buyer's purchase count
     * @param buyer Buyer's address
     */
    function getBuyerPurchaseCount(address buyer) external view returns (uint256) {
        return buyerPurchases[buyer].length;
    }

    /**
     * @dev Get total number of listed ebooks
     */
    function getTotalEbooks() external view returns (uint256) {
        return allEbookIds.length;
    }

    /**
     * @dev Calculate platform fee for a given price
     * @param price Price in token's smallest unit
     */
    function calculateFee(uint256 price) external view returns (uint256) {
        return (price * platformFeeBps) / 10000;
    }
}
