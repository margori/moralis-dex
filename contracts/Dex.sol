// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma abicoder v2;

import "./TokenWallet.sol";
import "./EthWallet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Dex is TokenWallet, EthWallet {
    using SafeMath for uint256;
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
        uint256 filledAmount;
    }

    mapping(bytes32 => mapping(Side => Order[])) public orderBook;
    uint256 currentId;

    function getOrderBook(bytes32 ticker_, Side side_)
        public
        view
        tokenExists(ticker_)
        returns (Order[] memory)
    {
        return orderBook[ticker_][side_];
    }

    function createLimitOrder(
        Side side_,
        bytes32 ticker_,
        uint256 tokenAmount_,
        uint256 ethAmount_
    ) external tokenExists(ticker_) {
        if (side_ == Side.BUY) {
            uint256 balance = ethBalances[msg.sender];
            require(balance >= tokenAmount_.mul(ethAmount_), "Not enough eths");
        } else {
            uint256 balance = tokenBalances[msg.sender][ticker_];
            require(balance >= tokenAmount_, "Not enough token");
        }

        Order memory newOrder = Order(
            currentId,
            msg.sender,
            side_,
            ticker_,
            tokenAmount_,
            ethAmount_,
            0
        );
        orderBook[ticker_][side_].push(newOrder);
        currentId = currentId.add(1);
        sortOrders(orderBook[ticker_][side_], side_);
    }

    function sortOrders(Order[] storage orders_, Side side_) private {
        Order memory auxOrder;
        bool sorted;
        do {
            sorted = true;
            for (uint256 i = 0; i < orders_.length - 1; i++) {
                if (
                    (side_ == Side.BUY &&
                        orders_[i].price < orders_[i + 1].price) ||
                    (side_ == Side.SELL &&
                        orders_[i].price > orders_[i + 1].price)
                ) {
                    // let's swap
                    auxOrder = orders_[i];
                    orders_[i] = orders_[i + 1];
                    orders_[i + 1] = auxOrder;
                    sorted = false;
                }
            }
        } while (!sorted);
    }

    function createMarketOrder(
        Side side_,
        bytes32 ticker_,
        uint256 tokenAmount_
    ) external tokenExists(ticker_) {
        uint256 ethBalance = ethBalances[msg.sender];
        uint256 tokenBalance = tokenBalances[msg.sender][ticker_];
        if (side_ == Side.BUY) {
            require(ethBalance > 0, "Not enough eths");
        } else {
            require(tokenBalance >= tokenAmount_, "Not enough token");
        }

        Order[] storage orders = orderBook[ticker_][side_];

        uint256 filledTokenAmount = 0;
        while (orders.length > 0 && filledTokenAmount < tokenAmount_) {
            uint256 pendingTokenAmount = tokenAmount_.sub(filledTokenAmount);
            uint256 toFillTokenAmount = pendingTokenAmount < orders[0].amount
                ? orders[0].amount
                : pendingTokenAmount;

            uint256 toFillEthAmount = orders[0].price.mul(toFillTokenAmount);

            if (side_ == Side.BUY) {
                require(ethBalance >= toFillEthAmount, "Not enough eths");

                ethBalances[msg.sender] = ethBalances[msg.sender].sub(
                    toFillEthAmount
                );
                tokenBalances[msg.sender][ticker_] = tokenBalances[msg.sender][
                    ticker_
                ].add(toFillTokenAmount);
                ethBalances[orders[0].trader] = ethBalances[orders[0].trader]
                    .add(toFillEthAmount);
                tokenBalances[orders[0].trader][ticker_] = tokenBalances[
                    orders[0].trader
                ][ticker_].sub(toFillTokenAmount);
            } else {
                ethBalances[msg.sender] = ethBalances[msg.sender].add(
                    toFillEthAmount
                );
                tokenBalances[msg.sender][ticker_] = tokenBalances[msg.sender][
                    ticker_
                ].sub(toFillTokenAmount);
                ethBalances[orders[0].trader] = ethBalances[orders[0].trader]
                    .add(toFillEthAmount);
                tokenBalances[orders[0].trader][ticker_] = tokenBalances[
                    orders[0].trader
                ][ticker_].sub(toFillTokenAmount);
            }

            orders[0].filledAmount = orders[0].filledAmount.add(
                toFillTokenAmount
            );

            if (orders[0].filledAmount == orders[0].amount) {
                for (uint256 i = 0; i < orders.length - 1; i++) {
                    orders[i] = orders[i + 1];
                }
                orders.pop();
            }
        }

        currentId = currentId.add(1);
    }
}
