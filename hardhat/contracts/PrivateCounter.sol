// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "@fhenixprotocol/cofhe-mock-contracts/Permissioned.sol";

/**
 * @title PrivateCounter
 * @notice Simple encrypted counter using Fhenix FHE
 */
contract PrivateCounter is MockPermissioned {

    // Encrypted counter
    euint32 private counter;

    event CounterIncremented(address indexed user);

    /**
     * @notice Initialize encrypted counter
     */
    constructor() {
        counter = FHE.asEuint32(0);

        // Allow contract to use encrypted state
        FHE.allowThis(counter);
    }

    /**
     * @notice Increment counter using encrypted amount
     */
    function increment(
        InEuint32 calldata encryptedAmount
    ) external {

        // Convert encrypted input
        euint32 amount = FHE.asEuint32(encryptedAmount);

        // Add encrypted values
        counter = FHE.add(counter, amount);

        // Allow future contract operations
        FHE.allowThis(counter);

        // Allow sender access
        FHE.allow(counter, msg.sender);

        emit CounterIncremented(msg.sender);
    }

    /**
     * @notice Return encrypted counter handle
     * @dev Frontend must unseal client-side
     */
    function getCounter()
        external
        view
        returns (euint32)
    {
        return counter;
    }
}