// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title RewardToken - simple ERC-20 token for educational rewards
contract RewardToken {
    string public name;
    string public symbol;
    uint8 public immutable decimals = 18;

    uint256 public totalSupply;

    address public owner;
    address public minter;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MinterUpdated(address indexed newMinter);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "NOT_MINTER");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "MINTER_ZERO");
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "ALLOWANCE_LOW");
        allowance[from][msg.sender] = allowed - value;
        _transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) external onlyMinter returns (bool) {
        require(to != address(0), "MINT_ZERO");
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "TO_ZERO");
        uint256 bal = balanceOf[from];
        require(bal >= value, "BALANCE_LOW");
        balanceOf[from] = bal - value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}
