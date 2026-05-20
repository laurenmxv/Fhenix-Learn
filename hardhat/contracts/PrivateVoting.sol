// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "@fhenixprotocol/cofhe-mock-contracts/Permissioned.sol";

/**
 * @title PrivateVoting
 * @notice Private voting using encrypted votes
 */
contract PrivateVoting is MockPermissioned {

    // Encrypted vote counters
    euint32 private yesVotes;
    euint32 private noVotes;

    // Prevent double voting
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter);

    /**
     * @notice Initialize encrypted counters
     */
    constructor() {
        yesVotes = FHE.asEuint32(0);
        noVotes = FHE.asEuint32(0);

        // Allow contract access
        FHE.allowThis(yesVotes);
        FHE.allowThis(noVotes);
    }

    /**
     * @notice Cast encrypted vote
     * @param encryptedVote true = YES, false = NO
     */
    function vote(
        InEbool calldata encryptedVote
    ) external {

        require(
            !hasVoted[msg.sender],
            "Already voted"
        );

        hasVoted[msg.sender] = true;

        // Convert encrypted input
        ebool voteYes = FHE.asEbool(encryptedVote);

        // Encrypted constants
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        /**
         * Encrypted branching
         * select(condition, ifTrue, ifFalse)
         */

        euint32 yesIncrement = FHE.select(
            voteYes,
            one,
            zero
        );

        euint32 noIncrement = FHE.select(
            voteYes,
            zero,
            one
        );

        // Update encrypted counters
        yesVotes = FHE.add(
            yesVotes,
            yesIncrement
        );

        noVotes = FHE.add(
            noVotes,
            noIncrement
        );

        // Allow future contract usage
        FHE.allowThis(yesVotes);
        FHE.allowThis(noVotes);

        emit VoteCast(msg.sender);
    }

    /**
     * @notice Return encrypted YES votes
     */
    function getYesVotes()
        external
        view
        returns (euint32)
    {
        return yesVotes;
    }

    /**
     * @notice Return encrypted NO votes
     */
    function getNoVotes()
        external
        view
        returns (euint32)
    {
        return noVotes;
    }
}