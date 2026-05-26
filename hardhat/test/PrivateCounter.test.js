const { expect } = require("chai");
const hre = require("hardhat");
const { Encryptable } = require("@cofhe/sdk");

describe("PrivateCounter", function () {
    let counter, signer, cofheClient;

    before(async () => {
        [signer] = await hre.ethers.getSigners();
        cofheClient = await hre.cofhe.createClientWithBatteries(signer);
        const PrivateCounter = await hre.ethers.getContractFactory("PrivateCounter");
        counter = await PrivateCounter.deploy();
        await counter.waitForDeployment();
    });

    it("increments and reveals via publishDecryptResult", async () => {
        const [a] = await cofheClient.encryptInputs([Encryptable.uint32(3n)]).execute();
        const [b] = await cofheClient.encryptInputs([Encryptable.uint32(5n)]).execute();

        await (await counter.increment(a)).wait();
        await (await counter.increment(b)).wait();

        const handle = await counter.getCounter();
        await hre.cofhe.mocks.expectPlaintext(handle, 8n);

        const { decryptedValue, signature } = await cofheClient
            .decryptForTx(handle)
            .withoutPermit()
            .execute();
        expect(decryptedValue).to.equal(8n);

        await (await counter.publishCounterValue(Number(decryptedValue), signature)).wait();
        const [value, ready] = await counter.getCounterValue();
        expect(ready).to.equal(true);
        expect(value).to.equal(8n);
    });
});
