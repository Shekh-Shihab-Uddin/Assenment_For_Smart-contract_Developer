
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//importing the open source contract those are made before
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GLDToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Gold", "GLD") {
        _mint(msg.sender, initialSupply);
    }
}
// This contract is a simple ERC-20 token with a constructor that initializes the token with a given name, 
// symbol, initial holder (who receives the initial supply), and the initial supply.
