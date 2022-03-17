// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma abicoder v2;

import "./TokenWallet.sol";
import "./EthWallet.sol";

contract Dex is TokenWallet, EthWallet {
    enum Side {
        BUY,
        SELL
    }
    struct Order {
        uint256 id;
        address trader;
        Side side;
        bytes32 ticker;
        uint256 amount;
        uint256 price;
    }

    mapping(bytes32 => mapping(Side => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker_, Side side_)
        public
        view
        returns (Order[] memory)
    {
        return orderBook[ticker_][side_];
    }
}
