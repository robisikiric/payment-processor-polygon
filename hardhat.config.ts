require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();


const signer = process.env.WALLET_PK;

module.exports = {
  solidity: "0.8.27",
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [signer]
    }
  }
};
