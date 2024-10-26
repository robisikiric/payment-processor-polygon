const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MerchantPayment", function () {
  let MerchantPayment;
  let merchantPayment;
  let owner;
  let merchant;
  let otherAccount;

  beforeEach(async function () {
    [owner, merchant, otherAccount] = await ethers.getSigners();
    MerchantPayment = await ethers.getContractFactory("MerchantPayment");
    merchantPayment = await MerchantPayment.deploy();
    await merchantPayment.deployed();
  });

  it("should set merchant details correctly", async function () {
    await merchantPayment.setMerchantDetails(
      merchant.address,
      Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      70,
      30
    );

    const merchantDetails = await merchantPayment.merchants(merchant.address);
    expect(merchantDetails.settlementTime).to.be.a("number");
    expect(merchantDetails.merchantPercentage).to.equal(70);
    expect(merchantDetails.companyPercentage).to.equal(30);
  });

  it("should distribute payments correctly", async function () {
    const settlementTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    await merchantPayment.setMerchantDetails(merchant.address, settlementTime, 70, 30);

    const initialMerchantBalance = await ethers.provider.getBalance(merchant.address);
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

    const paymentAmount = ethers.utils.parseEther("1.0"); // 1 ETH
    await merchantPayment.connect(otherAccount).distributePayment(merchant.address, { value: paymentAmount });

    const finalMerchantBalance = await ethers.provider.getBalance(merchant.address);
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

    expect(finalMerchantBalance.sub(initialMerchantBalance)).to.equal(paymentAmount.mul(70).div(100));
    expect(finalOwnerBalance.sub(initialOwnerBalance)).to.equal(paymentAmount.mul(30).div(100));
  });

  it("should update settlement time", async function () {
    const newSettlementTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
    await merchantPayment.setMerchantDetails(merchant.address, newSettlementTime, 70, 30);
    await merchantPayment.updateSettlementTime(merchant.address, newSettlementTime);

    const merchantDetails = await merchantPayment.merchants(merchant.address);
    expect(merchantDetails.settlementTime).to.equal(newSettlementTime);
  });

  it("should only allow owner to set merchant details", async function () {
    await expect(
      merchantPayment.connect(otherAccount).setMerchantDetails(merchant.address, 0, 70, 30)
    ).to.be.revertedWith("Not authorized");
  });
});