const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EbookMarketplace", function () {
  let marketplace;
  let token;
  let owner, seller, buyer1, buyer2, buyer3;
  let platformFee = 250; // 2.5%

  beforeEach(async function () {
    [owner, seller, buyer1, buyer2, buyer3] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    token = await MockToken.deploy("Mock USDC", "USDC", 6);
    await token.waitForDeployment();

    // Deploy marketplace
    const Marketplace = await ethers.getContractFactory("EbookMarketplace");
    marketplace = await Marketplace.deploy(owner.address, platformFee);
    await marketplace.waitForDeployment();

    // Add token as accepted
    await marketplace.addAcceptedToken(await token.getAddress());

    // Mint tokens to buyers
    const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDC
    await token.mint(buyer1.address, mintAmount);
    await token.mint(buyer2.address, mintAmount);
    await token.mint(buyer3.address, mintAmount);
  });

  describe("Bulk Purchase Operations", function () {
    beforeEach(async function () {
      // List some ebooks
      await marketplace.connect(seller).listEbook("ebook1", await token.getAddress(), ethers.parseUnits("10", 6));
      await marketplace.connect(seller).listEbook("ebook2", await token.getAddress(), ethers.parseUnits("15", 6));
      await marketplace.connect(seller).listEbook("ebook3", await token.getAddress(), ethers.parseUnits("20", 6));
      await marketplace.connect(owner).listEbook("ebook4", await token.getAddress(), ethers.parseUnits("25", 6));
    });

    it("should allow bulk purchase of multiple ebooks", async function () {
      const ebookIds = ["ebook1", "ebook2"];
      const totalCost = ethers.parseUnits("25", 6); // 10 + 15

      // Approve marketplace to spend tokens
      await token.connect(buyer1).approve(await marketplace.getAddress(), totalCost);

      // Bulk purchase
      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds))
        .to.emit(marketplace, "EbookPurchased")
        .withArgs(
          ethers.keccak256(ethers.toUtf8Bytes("ebook1")),
          "ebook1",
          buyer1.address,
          seller.address,
          ethers.parseUnits("10", 6),
          ethers.parseUnits("0.25", 6) // 2.5% of 10
        )
        .to.emit(marketplace, "EbookPurchased")
        .withArgs(
          ethers.keccak256(ethers.toUtf8Bytes("ebook2")),
          "ebook2",
          buyer1.address,
          seller.address,
          ethers.parseUnits("15", 6),
          ethers.parseUnits("0.375", 6) // 2.5% of 15
        );

      // Check purchases
      expect(await marketplace.checkPurchase(buyer1.address, "ebook1")).to.be.true;
      expect(await marketplace.checkPurchase(buyer1.address, "ebook2")).to.be.true;
      expect(await marketplace.checkPurchase(buyer1.address, "ebook3")).to.be.false;
    });

    it("should reject bulk purchase with empty list", async function () {
      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks([]))
        .to.be.revertedWith("Empty purchase list");
    });

    it("should reject bulk purchase exceeding maximum limit", async function () {
      const ebookIds = Array.from({length: 11}, (_, i) => `ebook${i + 1}`);
      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds))
        .to.be.revertedWith("Too many ebooks (max 10)");
    });

    it("should reject bulk purchase with mixed payment tokens", async function () {
      // Deploy second token
      const token2 = await (await ethers.getContractFactory("MockERC20")).deploy("Mock cUSD", "cUSD", 6);
      await token2.waitForDeployment();

      // Add second token and list ebook
      await marketplace.addAcceptedToken(await token2.getAddress());
      await marketplace.connect(seller).listEbook("ebook-mixed", await token2.getAddress(), ethers.parseUnits("10", 6));

      const ebookIds = ["ebook1", "ebook-mixed"];

      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds))
        .to.be.revertedWith("Mixed payment tokens not allowed");
    });

    it("should reject bulk purchase of already purchased ebooks", async function () {
      // First purchase ebook1 individually
      await token.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("10", 6));
      await marketplace.connect(buyer1).purchaseEbook("ebook1");

      // Try to bulk purchase including already purchased ebook
      const ebookIds = ["ebook1", "ebook2"];
      await token.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("15", 6));

      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds))
        .to.be.revertedWith("Already purchased");
    });

    it("should reject bulk purchase of own ebooks", async function () {
      const ebookIds = ["ebook4"]; // Owned by owner/deployer

      await expect(marketplace.connect(owner).bulkPurchaseEbooks(ebookIds))
        .to.be.revertedWith("Cannot buy your own ebook");
    });

    it("should reject bulk purchase of inactive ebooks", async function () {
      // Delist ebook1
      await marketplace.connect(seller).delistEbook("ebook1");

      const ebookIds = ["ebook1"];

      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds))
        .to.be.revertedWith("Ebook not listed");
    });

    it("should handle bulk purchase with insufficient approval", async function () {
      const ebookIds = ["ebook1", "ebook2"];
      const insufficientApproval = ethers.parseUnits("20", 6); // Need 25

      // Approve insufficient amount
      await token.connect(buyer1).approve(await marketplace.getAddress(), insufficientApproval);

      await expect(marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds))
        .to.be.reverted; // ERC20 transfer will fail
    }).timeout(5000);

    it("should process bulk purchase with correct fee distribution", async function () {
      const ebookIds = ["ebook1"];
      const price = ethers.parseUnits("10", 6);
      const fee = ethers.parseUnits("0.25", 6); // 2.5% of 10
      const sellerAmount = price - fee;

      // Get initial balances
      const initialSellerBalance = await token.balanceOf(seller.address);
      const initialFeeRecipientBalance = await token.balanceOf(owner.address); // owner is fee recipient
      const initialBuyerBalance = await token.balanceOf(buyer1.address);

      // Approve and purchase
      await token.connect(buyer1).approve(await marketplace.getAddress(), price);
      await marketplace.connect(buyer1).bulkPurchaseEbooks(ebookIds);

      // Check balances
      expect(await token.balanceOf(seller.address)).to.equal(initialSellerBalance + sellerAmount);
      expect(await token.balanceOf(owner.address)).to.equal(initialFeeRecipientBalance + fee);
      expect(await token.balanceOf(buyer1.address)).to.equal(initialBuyerBalance - price);
    });
  });

  describe("Bulk Listing Operations", function () {
    it("should allow owner to bulk list ebooks", async function () {
      const ebookData = [
        {
          ebookId: "bulk1",
          seller: seller.address,
          paymentToken: await token.getAddress(),
          price: ethers.parseUnits("12", 6)
        },
        {
          ebookId: "bulk2",
          seller: seller.address,
          paymentToken: await token.getAddress(),
          price: ethers.parseUnits("18", 6)
        }
      ];

      await expect(marketplace.connect(owner).bulkListEbooks(ebookData))
        .to.emit(marketplace, "EbookListed")
        .to.emit(marketplace, "EbookListed");

      // Verify ebooks are listed
      const ebook1 = await marketplace.getEbook("bulk1");
      expect(ebook1.isActive).to.be.true;
      expect(ebook1.price).to.equal(ethers.parseUnits("12", 6));

      const ebook2 = await marketplace.getEbook("bulk2");
      expect(ebook2.isActive).to.be.true;
      expect(ebook2.price).to.equal(ethers.parseUnits("18", 6));
    });

    it("should reject bulk listing by non-owner", async function () {
      const ebookData = [{
        ebookId: "bulk1",
        seller: seller.address,
        paymentToken: await token.getAddress(),
        price: ethers.parseUnits("12", 6)
      }];

      await expect(marketplace.connect(seller).bulkListEbooks(ebookData))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should reject bulk listing with empty data", async function () {
      await expect(marketplace.connect(owner).bulkListEbooks([]))
        .to.be.revertedWith("Empty listing data");
    });

    it("should reject bulk listing exceeding maximum limit", async function () {
      const ebookData = Array.from({length: 21}, (_, i) => ({
        ebookId: `bulk${i + 1}`,
        seller: seller.address,
        paymentToken: await token.getAddress(),
        price: ethers.parseUnits("10", 6)
      }));

      await expect(marketplace.connect(owner).bulkListEbooks(ebookData))
        .to.be.revertedWith("Too many ebooks (max 20)");
    });

    it("should reject bulk listing with invalid token", async function () {
      const ebookData = [{
        ebookId: "bulk1",
        seller: seller.address,
        paymentToken: ethers.ZeroAddress, // Invalid token
        price: ethers.parseUnits("12", 6)
      }];

      await expect(marketplace.connect(owner).bulkListEbooks(ebookData))
        .to.be.revertedWith("Token not accepted");
    });

    it("should reject bulk listing of already listed ebooks", async function () {
      // First list ebook normally
      await marketplace.connect(seller).listEbook("duplicate", await token.getAddress(), ethers.parseUnits("10", 6));

      // Try to bulk list the same ebook
      const ebookData = [{
        ebookId: "duplicate",
        seller: seller.address,
        paymentToken: await token.getAddress(),
        price: ethers.parseUnits("12", 6)
      }];

      await expect(marketplace.connect(owner).bulkListEbooks(ebookData))
        .to.be.revertedWith("Ebook already listed");
    });
  });

  describe("Bulk Delisting Operations", function () {
    beforeEach(async function () {
      // List ebooks for delisting tests
      await marketplace.connect(seller).listEbook("delist1", await token.getAddress(), ethers.parseUnits("10", 6));
      await marketplace.connect(seller).listEbook("delist2", await token.getAddress(), ethers.parseUnits("15", 6));
      await marketplace.connect(owner).listEbook("delist3", await token.getAddress(), ethers.parseUnits("20", 6));
    });

    it("should allow seller to bulk delist their ebooks", async function () {
      const ebookIds = ["delist1", "delist2"];

      await expect(marketplace.connect(seller).bulkDelistEbooks(ebookIds))
        .to.emit(marketplace, "EbookDelisted")
        .to.emit(marketplace, "EbookDelisted");

      // Verify ebooks are delisted
      const ebook1 = await marketplace.getEbook("delist1");
      expect(ebook1.isActive).to.be.false;

      const ebook2 = await marketplace.getEbook("delist2");
      expect(ebook2.isActive).to.be.false;
    });

    it("should allow owner to bulk delist any ebooks", async function () {
      const ebookIds = ["delist1", "delist2", "delist3"];

      await marketplace.connect(owner).bulkDelistEbooks(ebookIds);

      // Verify all ebooks are delisted
      const ebook1 = await marketplace.getEbook("delist1");
      const ebook2 = await marketplace.getEbook("delist2");
      const ebook3 = await marketplace.getEbook("delist3");

      expect(ebook1.isActive).to.be.false;
      expect(ebook2.isActive).to.be.false;
      expect(ebook3.isActive).to.be.false;
    });

    it("should reject bulk delisting by unauthorized user", async function () {
      const ebookIds = ["delist1"];

      await expect(marketplace.connect(buyer1).bulkDelistEbooks(ebookIds))
        .to.be.revertedWith("Not authorized");
    });

    it("should reject bulk delisting of non-existent ebooks", async function () {
      const ebookIds = ["nonexistent"];

      await expect(marketplace.connect(seller).bulkDelistEbooks(ebookIds))
        .to.be.revertedWith("Ebook not listed");
    });

    it("should reject bulk delisting with empty list", async function () {
      await expect(marketplace.connect(seller).bulkDelistEbooks([]))
        .to.be.revertedWith("Empty delist list");
    });

    it("should reject bulk delisting exceeding maximum limit", async function () {
      const ebookIds = Array.from({length: 21}, (_, i) => `ebook${i + 1}`);

      await expect(marketplace.connect(seller).bulkDelistEbooks(ebookIds))
        .to.be.revertedWith("Too many ebooks (max 20)");
    });
  });

  describe("Bulk Query Operations", function () {
    beforeEach(async function () {
      // List ebooks for query tests
      await marketplace.connect(seller).listEbook("query1", await token.getAddress(), ethers.parseUnits("10", 6));
      await marketplace.connect(seller).listEbook("query2", await token.getAddress(), ethers.parseUnits("15", 6));
      await marketplace.connect(owner).listEbook("query3", await token.getAddress(), ethers.parseUnits("20", 6));
    });

    it("should bulk query ebook details", async function () {
      const ebookIds = ["query1", "query2", "query3"];
      const result = await marketplace.getBulkEbooks(ebookIds);

      expect(result.sellers[0]).to.equal(seller.address);
      expect(result.sellers[1]).to.equal(seller.address);
      expect(result.sellers[2]).to.equal(owner.address);

      expect(result.prices[0]).to.equal(ethers.parseUnits("10", 6));
      expect(result.prices[1]).to.equal(ethers.parseUnits("15", 6));
      expect(result.prices[2]).to.equal(ethers.parseUnits("20", 6));

      expect(result.isActive).to.deep.equal([true, true, true]);
      expect(result.totalSales).to.deep.equal([0, 0, 0]);
    });

    it("should bulk check purchases", async function () {
      // Make some purchases
      await token.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("25", 6));
      await marketplace.connect(buyer1).bulkPurchaseEbooks(["query1", "query2"]);

      const ebookIds = ["query1", "query2", "query3"];
      const purchases = await marketplace.checkBulkPurchases(buyer1.address, ebookIds);

      expect(purchases).to.deep.equal([true, true, false]);
    });
  });

  describe("Integration Tests", function () {
    it("should handle complex bulk operations workflow", async function () {
      // 1. Bulk list ebooks
      const ebookData = [
        {
          ebookId: "workflow1",
          seller: seller.address,
          paymentToken: await token.getAddress(),
          price: ethers.parseUnits("10", 6)
        },
        {
          ebookId: "workflow2",
          seller: seller.address,
          paymentToken: await token.getAddress(),
          price: ethers.parseUnits("15", 6)
        },
        {
          ebookId: "workflow3",
          seller: owner.address,
          paymentToken: await token.getAddress(),
          price: ethers.parseUnits("20", 6)
        }
      ];

      await marketplace.connect(owner).bulkListEbooks(ebookData);

      // 2. Bulk purchase by buyer1
      await token.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("25", 6));
      await marketplace.connect(buyer1).bulkPurchaseEbooks(["workflow1", "workflow2"]);

      // 3. Bulk purchase by buyer2
      await token.connect(buyer2).approve(await marketplace.getAddress(), ethers.parseUnits("20", 6));
      await marketplace.connect(buyer2).bulkPurchaseEbooks(["workflow3"]);

      // 4. Bulk query to verify state
      const ebookDetails = await marketplace.getBulkEbooks(["workflow1", "workflow2", "workflow3"]);
      expect(ebookDetails.totalSales).to.deep.equal([1, 1, 1]);

      // 5. Bulk check purchases
      const buyer1Purchases = await marketplace.checkBulkPurchases(buyer1.address, ["workflow1", "workflow2", "workflow3"]);
      expect(buyer1Purchases).to.deep.equal([true, true, false]);

      const buyer2Purchases = await marketplace.checkBulkPurchases(buyer2.address, ["workflow1", "workflow2", "workflow3"]);
      expect(buyer2Purchases).to.deep.equal([false, false, true]);

      // 6. Bulk delist by owner
      await marketplace.connect(owner).bulkDelistEbooks(["workflow1", "workflow2", "workflow3"]);

      // Verify all ebooks are inactive
      const updatedDetails = await marketplace.getBulkEbooks(["workflow1", "workflow2", "workflow3"]);
      expect(updatedDetails.isActive).to.deep.equal([false, false, false]);
    });

    it("should maintain data consistency across bulk operations", async function () {
      // Initial single operations
      await marketplace.connect(seller).listEbook("consistency1", await token.getAddress(), ethers.parseUnits("10", 6));
      await token.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("10", 6));
      await marketplace.connect(buyer1).purchaseEbook("consistency1");

      // Bulk operations
      const bulkListData = [{
        ebookId: "consistency2",
        seller: seller.address,
        paymentToken: await token.getAddress(),
        price: ethers.parseUnits("15", 6)
      }];
      await marketplace.connect(owner).bulkListEbooks(bulkListData);

      await token.connect(buyer2).approve(await marketplace.getAddress(), ethers.parseUnits("15", 6));
      await marketplace.connect(buyer2).bulkPurchaseEbooks(["consistency2"]);

      // Verify final state
      const totalEbooks = await marketplace.getTotalEbooks();
      expect(totalEbooks).to.equal(2);

      const buyer1Count = await marketplace.getBuyerPurchaseCount(buyer1.address);
      expect(buyer1Count).to.equal(1);

      const buyer2Count = await marketplace.getBuyerPurchaseCount(buyer2.address);
      expect(buyer2Count).to.equal(1);
    });
  });
});
