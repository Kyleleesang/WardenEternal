// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
//import openzeppelin contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Vault {
    IERC20 public immutable token;

    //make a mapping of whitelisted tokens
    mapping(address => bool) public isWhitelisted;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function _mint(address _to, uint _shares) private {
        totalSupply += _shares;
        balanceOf[_to] += _shares;
    }

    function _burn(address _from, uint _shares) private {
        totalSupply -= _shares;
        balanceOf[_from] -= _shares;
    }

    function whiteListToken(address _token) external {
        require(msg.sender == owner(), "only owner can whitelist token");
        IERC20(_token).approve(address(this), type(uint).max);
    }

    function pause() public {
        require(msg.sender == owner(), "only owner can pause");
        _pause();
    }

    function unpause() public {
        require(msg.sender == owner(), "only owner can unpause");
        _unpause();
    }

    function addAdmin(address _admin) external {
        require(msg.sender == owner(), "only owner can add admin");
        grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "only admin can call");
        _;
    }
    function deposit(uint _amount) external {
        //require not paused
        require(!paused(), "contract is paused");
        //require token is whitelisted
        require(token.allowance(msg.sender, address(this)) >= _amount, "token not whitelisted");

        /*
        a = amount
        B = balance of token before deposit
        T = total supply
        s = shares to mint

        (T + s) / T = (a + B) / B 

        s = aT / B
        */
        uint shares;
        if (totalSupply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _mint(msg.sender, shares);
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _shares) external {
        /*
        a = amount
        B = balance of token before withdraw
        T = total supply
        s = shares to burn

        (T - s) / T = (B - a) / B 

        a = sB / T
        */
        uint amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        _burn(msg.sender, _shares);
        token.transfer(msg.sender, amount);
    }
}
