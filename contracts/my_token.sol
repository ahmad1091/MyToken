// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MyToken {
    string public name;
    string public symbol;
    string public standard = "ERC20";
    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _amount
    );
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

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

    function approve(address _spender, uint256 _amount)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(
        address _form,
        address _to,
        uint256 _value
    ) public returns (bool success) {}
}
