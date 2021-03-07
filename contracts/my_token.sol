// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MyToken {
    string public name;
    string public symbol;
    string public standard = "ERC20";
    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

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

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
    