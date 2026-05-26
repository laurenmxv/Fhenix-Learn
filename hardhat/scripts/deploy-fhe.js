// Deploys only the FHE-critical contracts (HiddenValue, PrivateCounter, PrivateVoting).
// Merges new addresses into deployments.json without touching FhenixLearnBadge — re-use
// the existing badge deployment.

const hre = require("hardhat");
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function main() {
    const networkName = hre.network.name;
    const [signer] = await hre.ethers.getSigners();
    console.log("Network:", networkName);
    console.log("Deployer:", signer.address);

    let prev = {};
    if (fs.existsSync("deployments.json")) {
        prev = JSON.parse(fs.readFileSync("deployments.json"));
        if (prev.FhenixLearnBadge) console.log("Keeping FhenixLearnBadge:", prev.FhenixLearnBadge);
    }

    const HiddenValue = await hre.ethers.getContractFactory("HiddenValue");
    const hidden = await HiddenValue.deploy();
    await hidden.waitForDeployment();
    const hiddenAddress = await hidden.getAddress();
    console.log("HiddenValue:", hiddenAddress);

    const PrivateCounter = await hre.ethers.getContractFactory("PrivateCounter");
    const counter = await PrivateCounter.deploy();
    await counter.waitForDeployment();
    const counterAddress = await counter.getAddress();
    console.log("PrivateCounter:", counterAddress);

    // 1-day voting window for the demo contract.
    const PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
    const voting = await PrivateVoting.deploy(24n * 60n * 60n);
    await voting.waitForDeployment();
    const votingAddress = await voting.getAddress();
    console.log("PrivateVoting:", votingAddress);

    const deployments = {
        ...prev,
        HiddenValue: hiddenAddress,
        PrivateCounter: counterAddress,
        PrivateVoting: votingAddress,
        network: networkName,
        chainId: hre.network.config.chainId,
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
    console.log("Wrote deployments.json");

    try {
        const apiUrl = process.env.API_URL || "http://localhost:3101";
        console.log("Posting addresses to backend at:", apiUrl);
        const response = await fetch(`${apiUrl}/api/contract-config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deployments)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const result = await response.json();
        console.log("Backend acknowledged:", result);
    } catch (err) {
        console.warn("Could not save to backend (is the API running?):", err.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
