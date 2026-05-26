const { expect } = require("chai");
const hre = require("hardhat");
const { Encryptable } = require("@cofhe/sdk");

describe("PrivateVoting", function () {
    let voting, signer, voter2, cofheClient, cofheClient2;
    const ONE_HOUR = 60n * 60n;

    before(async () => {
        [signer, voter2] = await hre.ethers.getSigners();
        cofheClient = await hre.cofhe.createClientWithBatteries(signer);
        cofheClient2 = await hre.cofhe.createClientWithBatteries(voter2);
        const PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
        voting = await PrivateVoting.deploy(ONE_HOUR);
        await voting.waitForDeployment();
    });

    it("tallies encrypted votes and reveals results after finalize", async () => {
        const [yesVote] = await cofheClient.encryptInputs([Encryptable.bool(true)]).execute();
        const [noVote] = await cofheClient2.encryptInputs([Encryptable.bool(false)]).execute();

        await (await voting.connect(signer).vote(yesVote)).wait();
        await (await voting.connect(voter2).vote(noVote)).wait();

        // Plaintext assertion via mocks: yes=1, no=1.
        const yesHandle = await voting.getYesVotes();
        const noHandle = await voting.getNoVotes();
        await hre.cofhe.mocks.expectPlaintext(yesHandle, 1n);
        await hre.cofhe.mocks.expectPlaintext(noHandle, 1n);

        // Fast-forward past the deadline so finalize() succeeds.
        await hre.network.provider.send("evm_increaseTime", [Number(ONE_HOUR) + 1]);
        await hre.network.provider.send("evm_mine");

        await (await voting.finalize()).wait();

        const yesResult = await cofheClient.decryptForTx(yesHandle).withoutPermit().execute();
        const noResult = await cofheClient.decryptForTx(noHandle).withoutPermit().execute();

        expect(yesResult.decryptedValue).to.equal(1n);
        expect(noResult.decryptedValue).to.equal(1n);

        await (await voting.publishResults(
            Number(yesResult.decryptedValue), yesResult.signature,
            Number(noResult.decryptedValue), noResult.signature
        )).wait();

        const [yes, no, ready] = await voting.getResults();
        expect(ready).to.equal(true);
        expect(yes).to.equal(1n);
        expect(no).to.equal(1n);
    });

    it("rejects double-voting", async () => {
        // Fresh deployment so the previous test's evm_increaseTime doesn't close voting.
        const PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
        const fresh = await PrivateVoting.deploy(ONE_HOUR);
        await fresh.waitForDeployment();

        const [first] = await cofheClient.encryptInputs([Encryptable.bool(true)]).execute();
        await (await fresh.connect(signer).vote(first)).wait();

        const [dup] = await cofheClient.encryptInputs([Encryptable.bool(true)]).execute();
        await expect(fresh.connect(signer).vote(dup)).to.be.revertedWith("already voted");
    });
});
