// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthWallet is Ownable {
    using SafeMath for uint256;

    mapping(address => uint256) public ethBalances;

    function depositEth() external payable {
        require(msg.value > 0, "No eth sent");
        ethBalances[msg.sender] = ethBalances[msg.sender].add(msg.value);
    }

    function withdrawEth(uint256 _amount) external {
        require(ethBalances[msg.sender] >= _amount, "Insuficient balancex");

        ethBalances[msg.sender] = ethBalances[msg.sender].sub(_amount);
        address payable to = payable(msg.sender);
        to.transfer(_amount);
    }
}
