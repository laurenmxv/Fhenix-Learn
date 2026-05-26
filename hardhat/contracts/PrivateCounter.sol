// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title PrivateCounter
/// @notice Encrypted counter using CoFHE. Demonstrates the canonical reveal flow:
///         allowPublic → off-chain decryptForTx → publishDecryptResult → getDecryptResultSafe.
/// @dev    The mock `Permissioned` base was removed; ACL is enforced by FHE.allow*.
contract PrivateCounter {

    euint32 private counter;

    event CounterIncremented(address indexed user);
    event CounterRevealed(uint32 plaintext);

    constructor() {
        counter = FHE.asEuint32(0);
        FHE.allowThis(counter);
    }

    /// @notice Increment the counter by an encrypted amount.
    function increment(InEuint32 calldata encryptedAmount) external {
        euint32 amount = FHE.asEuint32(encryptedAmount);
        counter = FHE.add(counter, amount);

        // Persist contract access; mark publicly decryptable so anyone can read.
        FHE.allowThis(counter);
        FHE.allowPublic(counter);

        emit CounterIncremented(msg.sender);
    }

    /// @notice Returns the encrypted counter handle.
    function getCounter() external view returns (euint32) {
        return counter;
    }

    /// @notice Publish a Threshold-Network-signed plaintext for the current counter
    ///         value. The client SDK produces `plaintext` and `sig` via
    ///         `client.decryptForTx(counter).withoutPermit().execute()`.
    function publishCounterValue(uint32 plaintext, bytes calldata sig) external {
        FHE.publishDecryptResult(counter, plaintext, sig);
        emit CounterRevealed(plaintext);
    }

    /// @notice Read the most recently published plaintext, reverting if none is ready.
    function getCounterValue() external view returns (uint32 value, bool ready) {
        (value, ready) = FHE.getDecryptResultSafe(counter);
    }
}
