// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title HiddenValue
/// @notice Stores an encrypted uint32 and demonstrates the canonical reveal flow:
///         allowPublic + decryptForTx (off-chain) + publishDecryptResult (on-chain).
/// @dev    Public mutator on purpose: any caller can overwrite `val` and grant themselves
///         decrypt access. Educational artifact, not an access-controlled vault.
contract HiddenValue {
    euint32 private val;

    function set(InEuint32 calldata encryptedInput) external {
        val = FHE.asEuint32(encryptedInput);
        FHE.allowThis(val);
        FHE.allowSender(val);
    }

    function get() external view returns (euint32) {
        return val;
    }

    /// @notice Marks `val` as publicly decryptable so the Threshold Network will
    ///         sign a decryption result for any caller. Pair with `publishDecryptResult`.
    function allowReveal() external {
        FHE.allowPublic(val);
    }

    /// @notice Submits a Threshold-Network-signed plaintext for `val`, making it
    ///         available via `getDecryptResultSafe`. The client SDK produces
    ///         `plaintext` and `sig` via `client.decryptForTx(val).withoutPermit().execute()`.
    function publishRevealedValue(uint32 plaintext, bytes calldata sig) external {
        FHE.publishDecryptResult(val, plaintext, sig);
    }

    /// @notice Returns the published plaintext, or reverts if not yet revealed.
    function revealedValue() external view returns (uint32) {
        (uint32 v, bool ok) = FHE.getDecryptResultSafe(val);
        require(ok, "not revealed");
        return v;
    }
}
