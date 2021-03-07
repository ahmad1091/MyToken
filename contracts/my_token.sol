// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MyToken {
    string public name;
    string public symbol;
    string public standard = "ERC20";
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(
        uint256 _initialSupply,
        string memory _name,
        string memory _symbol
    ) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        name = _name;
        symbol = _symbol;
    }
}
