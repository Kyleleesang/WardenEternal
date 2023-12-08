// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract MockERC20 is ERC20 {
    constructor (address initialAccount, uint256 initialBalance) ERC20("MockToken", "MKT") {
        _mint(initialAccount, initialBalance);
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}