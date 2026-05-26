const { expect } = require("chai");
const hre = require("hardhat");
const { Encryptable } = require("@cofhe/sdk");

describe("HiddenValue", function () {
    let hidden, signer, cofheClient;

    before(async () => {
        [signer] = await hre.ethers.getSigners();
        cofheClient = await hre.cofhe.createClientWithBatteries(signer);
        const HiddenValue = await hre.ethers.getContractFactory("HiddenValue");
        hidden = await HiddenValue.deploy();
        await hidden.waitForDeployment();
    });

    it("stores an encrypted value and reveals it via the publishDecryptResult flow", async () => {
        const plaintext = 1234n;
        const [enc] = await cofheClient.encryptInputs([Encryptable.uint32(plaintext)]).execute();

        await (await hidden.set(enc)).wait();

        // Mock plaintext assertion — mocks expose the underlying plaintext directly.
        const handle = await hidden.get();
        await hre.cofhe.mocks.expectPlaintext(handle, plaintext);

        // Full reveal round-trip via decryptForTx + publishDecryptResult.
        await (await hidden.allowReveal()).wait();
        const { decryptedValue, signature } = await cofheClient
            .decryptForTx(handle)
            .withoutPermit()
            .execute();
        expect(decryptedValue).to.equal(plaintext);

        await (await hidden.publishRevealedValue(Number(decryptedValue), signature)).wait();
        const revealed = await hidden.revealedValue();
        expect(revealed).to.equal(plaintext);
    });
});
