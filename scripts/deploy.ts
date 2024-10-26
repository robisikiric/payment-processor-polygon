const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const NFTMarketplace = await hre.ethers.getContractFactory("MerchantPayment");
    const marketplace = await NFTMarketplace.deploy(); 
  
    console.log("NFTMarketplace deployed to:", marketplace.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });