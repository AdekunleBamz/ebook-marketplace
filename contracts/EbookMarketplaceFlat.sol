// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EbookMarketplace (Flattened for Remix)
 * @dev Deploy this file directly in Remix - all dependencies included
 * 
 * DEPLOYMENT STEPS:
 * 1. Copy this entire file to Remix
 * 2. Compile with Solidity 0.8.19+
 * 3. Deploy with constructor params:
 *    - _feeRecipient: Your wallet for platform fees
 *    - _platformFeeBps: Fee in basis points (250 = 2.5%)
 * 4. After deploy, call addAcceptedToken():
 *    - Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (USDC)
 *    - Celo: 0x765DE816845861e75A25fCA122bb6898B8B1282a (cUSD)
 */

// ============ OpenZeppelin Interfaces ============

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
    function nonces(address owner) external view returns (uint256);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

// ============ OpenZeppelin Libraries ============

library Address {
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value");
    }

    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
    }

    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
        if (returndata.length > 0) {
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}

library SafeERC20 {
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

// ============ OpenZeppelin Contracts ============

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        _status = _NOT_ENTERED;
    }

    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// ============ MAIN CONTRACT ============

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

    function addAcceptedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!acceptedTokens[token], "Token already accepted");
        
        acceptedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeAcceptedToken(address token) external onlyOwner {
        require(acceptedTokens[token], "Token not accepted");
        
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    // ============ Seller Functions ============

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

    function delistEbook(string calldata ebookId) external {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        Ebook storage ebook = ebooks[ebookIdHash];
        
        require(ebook.isActive, "Ebook not listed");
        require(ebook.seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        ebook.isActive = false;
        
        emit EbookDelisted(ebookIdHash, ebookId);
    }

    // ============ Buyer Functions ============

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

    function checkPurchase(
        address buyer,
        string calldata ebookId
    ) external view returns (bool) {
        bytes32 ebookIdHash = keccak256(abi.encodePacked(ebookId));
        return hasPurchased[buyer][ebookIdHash];
    }

    function getBuyerPurchaseCount(address buyer) external view returns (uint256) {
        return buyerPurchases[buyer].length;
    }

    function getTotalEbooks() external view returns (uint256) {
        return allEbookIds.length;
    }

    function calculateFee(uint256 price) external view returns (uint256) {
        return (price * platformFeeBps) / 10000;
    }
}
