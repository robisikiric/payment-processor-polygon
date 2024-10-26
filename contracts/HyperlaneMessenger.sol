// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@hyperlane-xyz/core/interfaces/IMailbox.sol";

contract HyperlaneMessenger {
    IHyperlane public hyperlane;

    constructor(address _hyperlaneAddress) {
        hyperlane = IHyperlane(_hyperlaneAddress);
    }

    function sendMessage(string memory message, address destination) public {
        // Encode the message
        bytes memory encodedMessage = abi.encode(message);

        // Send the message using Hyperlane
        hyperlane.sendMessage(destination, encodedMessage);
    }
}