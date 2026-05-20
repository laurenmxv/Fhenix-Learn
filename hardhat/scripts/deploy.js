const hre = require("hardhat");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function main() {
    const networkName = hre.network.name;
    console.log("Deploying to network:", networkName);
    console.log("Deploying contracts with the account:", (await hre.ethers.getSigners())[0].address);

    // Deploy FhenixLearnBadge
    const FhenixLearnBadge = await hre.ethers.getContractFactory("FhenixLearnBadge");
    const badge = await FhenixLearnBadge.deploy();
    await badge.waitForDeployment();
    const badgeAddress = await badge.getAddress();
    console.log("FhenixLearnBadge deployed to:", badgeAddress);

    // Save addresses to deployments.json
    const fs = require("fs");
    const deployments = {
        FhenixLearnBadge: badgeAddress,
        network: networkName,
        chainId: hre.network.config.chainId,
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
    console.log("Deployments saved to deployments.json");

    // Save to backend database
    try {
        const apiUrl = process.env.API_URL || "http://localhost:3101";
        console.log("Saving contract address to backend at:", apiUrl);

        const response = await fetch(`${apiUrl}/api/contract-config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                FhenixLearnBadge: badgeAddress,
                network: networkName,
                chainId: hre.network.config.chainId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Contract address saved to backend:", result);
    } catch (err) {
        console.warn("⚠️ Could not save to backend (ensure API is running):", err.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
