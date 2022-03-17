// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenWallet is Ownable {
    using SafeMath for uint256;
    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }
    mapping(bytes32 => Token) public tokenMapping;
    bytes32[] public tokenList;

    mapping(address => mapping(bytes32 => uint256)) public tokenBalances;

    modifier tokenExists(bytes32 _ticker) {
        require(
            tokenMapping[_ticker].tokenAddress != address(0),
            "Ticker not registered"
        );
        _;
    }

    function addToken(bytes32 _ticker, address _tokenAddress)
        external
        onlyOwner
    {
        tokenMapping[_ticker] = Token(_ticker, _tokenAddress);
        tokenList.push(_ticker);
    }

    function depositToken(uint256 _amount, bytes32 _ticker)
        external
        tokenExists(_ticker)
    {
        IERC20(tokenMapping[_ticker].tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _amount
        );

        tokenBalances[msg.sender][_ticker] = tokenBalances[msg.sender][_ticker]
            .add(_amount);
    }

    function withdrawToken(uint256 _amount, bytes32 _ticker)
        external
        tokenExists(_ticker)
    {
        require(
            tokenBalances[msg.sender][_ticker] >= _amount,
            "Insuficient balance"
        );

        tokenBalances[msg.sender][_ticker] = tokenBalances[msg.sender][_ticker]
            .sub(_amount);

        IERC20(tokenMapping[_ticker].tokenAddress).transfer(
            msg.sender,
            _amount
        );
    }
}
