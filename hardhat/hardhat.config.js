require("@cofhe/hardhat-plugin");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: require('path').join(__dirname, '../.env') });

console.log("Loading config...");
console.log("PRIVATE_KEY present:", !!process.env.PRIVATE_KEY);
console.log("ARBITRUM_SEPOLIA_RPC_URL present:", !!process.env.ARBITRUM_SEPOLIA_RPC_URL);
console.log("Network config ready for arb-sepolia");

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
    solidity: {
        version: "0.8.25",
        settings: {
            evmVersion: "cancun",
            optimizer: { enabled: true, runs: 200 }
        }
    },
    paths: {
        sources: "./contracts",
        artifacts: "./artifacts",
        cache: "./cache"
    },
    networks: {
        "arb-sepolia": {
            url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 421614
        }
    },
    cofhe: {
        logMocks: false
    }
};
