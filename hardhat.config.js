require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    sepolia: {
      url: RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
