import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("NFTMarketplace", function () {
  let nftMarketplace: Contract;
  let mockNFT: Contract;
  let owner: Signer;
  let buyer: Signer;
  let seller: Signer;
  let feeRecipient: Signer;
  const tokenId = 1;
  const price = ethers.utils.parseEther("0.01");

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    const MockNFTFactory = await ethers.getContractFactory("MockNFT");
    [owner, buyer, seller, feeRecipient] = await ethers.getSigners();

    // Deploy the NFTMarketplace contract with the fee recipient
    nftMarketplace = await NFTMarketplaceFactory.deploy(await feeRecipient.getAddress());
    await nftMarketplace.deployed();

    // Deploy the MockNFT contract
    mockNFT = await MockNFTFactory.deploy();
    await mockNFT.deployed();

    // Mint an NFT to the seller
    await mockNFT.connect(owner).mint(await seller.getAddress(), "https://test.com/nft");

    // Approve the marketplace to transfer the NFT on behalf of the seller
    await mockNFT.connect(seller).approve(nftMarketplace.address, tokenId);
  });

  it("should transfer the correct amount to the seller and fee recipient", async function () {
    const sellerInitialBalance = await ethers.provider.getBalance(await seller.getAddress());
    const feeRecipientInitialBalance = await ethers.provider.getBalance(await feeRecipient.getAddress());

    // Buyer purchases the NFT
    const tx = await nftMarketplace.connect(buyer).buyNFT(mockNFT.address, tokenId, await seller.getAddress(), price, { value: price });
    await tx.wait();

    const fee = price.mul(5).div(10000); // 0.05% fee

    // Check balances after the transaction
    const sellerFinalBalance = await ethers.provider.getBalance(await seller.getAddress());
    const feeRecipientFinalBalance = await ethers.provider.getBalance(await feeRecipient.getAddress());

    expect(sellerFinalBalance.sub(sellerInitialBalance)).to.equal(price.sub(fee));
    expect(feeRecipientFinalBalance.sub(feeRecipientInitialBalance)).to.equal(fee);
  });
});