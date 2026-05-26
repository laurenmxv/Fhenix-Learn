const hre = require("hardhat");
const fs = require("fs");
const { Encryptable } = require("@cofhe/sdk");
const { createCofheConfig, createCofheClient } = require("@cofhe/sdk/node");
const { HardhatSignerAdapter } = require("@cofhe/sdk/adapters");
const { arbSepolia } = require("@cofhe/sdk/chains");

// End-to-end smoke test against a live network.
// Runs: encrypt → write → allowPublic → decryptForTx → publishDecryptResult → getDecryptResultSafe.
// NOTE: hre.cofhe.createClientWithBatteries forces environment:"hardhat" and impersonates, so it
// only works against the local mock chain. For live arb-sepolia we go through @cofhe/sdk/node directly.

async function main() {
    if (!fs.existsSync("deployments.json")) {
        console.error("deployments.json not found. Run deploy script first.");
        process.exit(1);
    }
    const deployments = JSON.parse(fs.readFileSync("deployments.json"));
    console.log("Smoke test on:", hre.network.name);
    console.log("Deployments:", deployments);

    if (hre.network.name !== deployments.network) {
        console.warn("WARN: network mismatch between hardhat config and deployments file.");
    }

    const [signer] = await hre.ethers.getSigners();
    console.log("Signer:", signer.address);

    const { publicClient, walletClient } = await HardhatSignerAdapter(signer);
    const cofheClient = createCofheClient(createCofheConfig({ supportedChains: [arbSepolia] }));
    await cofheClient.connect(publicClient, walletClient);
    console.log("CoFHE client connected");

    await smokeHiddenValue(deployments, signer, cofheClient);
    await smokePrivateCounter(deployments, signer, cofheClient);
    console.log("All smoke tests passed.");
}

async function smokeHiddenValue(deployments, signer, cofheClient) {
    console.log("\n=== HiddenValue ===");
    const hidden = await hre.ethers.getContractAt("HiddenValue", deployments.HiddenValue, signer);

    const plaintext = 42;
    const [enc] = await cofheClient.encryptInputs([Encryptable.uint32(BigInt(plaintext))]).execute();
    console.log("Encrypted 42 → ctHash:", enc.ctHash);

    await (await hidden.set(enc)).wait();
    console.log("set() ok");

    await (await hidden.allowReveal()).wait();
    console.log("allowReveal() ok");

    const handle = await hidden.get();
    const { decryptedValue, signature } = await cofheClient
        .decryptForTx(handle)
        .withoutPermit()
        .execute();
    console.log("decryptForTx →", decryptedValue.toString());

    if (decryptedValue !== BigInt(plaintext)) {
        throw new Error(`HiddenValue mismatch: expected ${plaintext}, got ${decryptedValue}`);
    }

    await (await hidden.publishRevealedValue(Number(decryptedValue), signature)).wait();
    console.log("publishRevealedValue() ok");

    const revealed = await hidden.revealedValue();
    if (Number(revealed) !== plaintext) {
        throw new Error(`HiddenValue.revealedValue mismatch: expected ${plaintext}, got ${revealed}`);
    }
    console.log("revealedValue:", revealed.toString());
}

async function smokePrivateCounter(deployments, signer, cofheClient) {
    console.log("\n=== PrivateCounter ===");
    const counter = await hre.ethers.getContractAt("PrivateCounter", deployments.PrivateCounter, signer);

    const inc = 7;
    const [enc] = await cofheClient.encryptInputs([Encryptable.uint32(BigInt(inc))]).execute();
    await (await counter.increment(enc)).wait();
    console.log("increment(7) ok");

    const handle = await counter.getCounter();
    const { decryptedValue, signature } = await cofheClient
        .decryptForTx(handle)
        .withoutPermit()
        .execute();
    console.log("decryptForTx →", decryptedValue.toString());

    await (await counter.publishCounterValue(Number(decryptedValue), signature)).wait();
    console.log("publishCounterValue() ok");

    const [value, ready] = await counter.getCounterValue();
    if (!ready) throw new Error("Counter not ready after publish");
    console.log("getCounterValue:", value.toString(), "ready:", ready);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
