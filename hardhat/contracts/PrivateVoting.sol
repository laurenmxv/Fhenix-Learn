// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title PrivateVoting
/// @notice Encrypted yes/no voting using CoFHE.
/// @dev    Confidentiality vs anonymity: votes (yes/no) are confidential; the
///         participant set is NOT — `hasVoted` is a plaintext mapping by design
///         (required to prevent double voting). Observers can see WHO voted but
///         not HOW. Reveal flow uses allowPublic + publishDecryptResult after
///         the deadline.
contract PrivateVoting {

    euint32 private yesVotes;
    euint32 private noVotes;

    mapping(address => bool) public hasVoted;
    uint64 public immutable endTime;
    bool public finalized;

    event VoteCast(address indexed voter);
    event Finalized();
    event ResultsPublished(uint32 yes, uint32 no);

    constructor(uint64 votingDurationSeconds) {
        yesVotes = FHE.asEuint32(0);
        noVotes = FHE.asEuint32(0);
        FHE.allowThis(yesVotes);
        FHE.allowThis(noVotes);
        endTime = uint64(block.timestamp) + votingDurationSeconds;
    }

    function vote(InEbool calldata encryptedVote) external {
        require(block.timestamp < endTime, "voting closed");
        require(!hasVoted[msg.sender], "already voted");
        hasVoted[msg.sender] = true;

        ebool voteYes = FHE.asEbool(encryptedVote);

        // Branchless tally update via FHE.select. Both arms are evaluated;
        // no observer learns which counter incremented.
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        euint32 yesIncrement = FHE.select(voteYes, one, zero);
        euint32 noIncrement = FHE.select(voteYes, zero, one);

        yesVotes = FHE.add(yesVotes, yesIncrement);
        noVotes = FHE.add(noVotes, noIncrement);

        FHE.allowThis(yesVotes);
        FHE.allowThis(noVotes);

        emit VoteCast(msg.sender);
    }

    /// @notice Mark tallies as publicly decryptable. Callable by anyone once voting closes.
    function finalize() external {
        require(block.timestamp >= endTime, "voting open");
        require(!finalized, "already finalized");
        finalized = true;

        FHE.allowPublic(yesVotes);
        FHE.allowPublic(noVotes);

        emit Finalized();
    }

    /// @notice Publish Threshold-Network-signed plaintext tallies. Client produces each
    ///         (plaintext, sig) pair via `client.decryptForTx(<handle>).withoutPermit().execute()`.
    function publishResults(
        uint32 yesPlain, bytes calldata yesSig,
        uint32 noPlain, bytes calldata noSig
    ) external {
        require(finalized, "not finalized");
        FHE.publishDecryptResult(yesVotes, yesPlain, yesSig);
        FHE.publishDecryptResult(noVotes, noPlain, noSig);
        emit ResultsPublished(yesPlain, noPlain);
    }

    /// @notice Read the published tallies. `ready` is true only when both have been published.
    function getResults() external view returns (uint32 yes, uint32 no, bool ready) {
        (uint32 yv, bool yr) = FHE.getDecryptResultSafe(yesVotes);
        (uint32 nv, bool nr) = FHE.getDecryptResultSafe(noVotes);
        return (yv, nv, yr && nr);
    }

    function getYesVotes() external view returns (euint32) { return yesVotes; }
    function getNoVotes() external view returns (euint32) { return noVotes; }
}
