// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
//import openzeppelin contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";



contract Vault is AccessControl, Pausable {
    address public _owner;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor() {
        _owner = msg.sender;
    }

    mapping(address => bool) public isWhitelisted;
    mapping(address => mapping(address => uint)) public tokenBalances;

    function whiteListToken(address _token) external onlyAdmin {
        isWhitelisted[_token] = true;
    }

    function unWhiteListToken(address _token) external onlyAdmin {
        isWhitelisted[_token] = false;
    }

    function pause() public onlyAdmin {
       _pause();
    }

    function unpause() public onlyAdmin {
        _unpause();
    }

    function addAdmin(address _admin) external onlyAdmin(){
        grantRole(ADMIN_ROLE, _admin);
    }

    function deposit(uint _amount, address _token) external whenNotPaused(){
        //require(!paused(), "contract is paused");
        require(isWhitelisted[_token], "token not whitelisted");
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        tokenBalances[_token][msg.sender] += _amount;
    }

    function withdraw(uint _amount, address _token) external whenNotPaused {
        //require(!paused(), "contract is paused");
        require(tokenBalances[_token][msg.sender] >= _amount, "not enough balance");
        tokenBalances[_token][msg.sender] -= _amount;
        IERC20(_token).transfer(msg.sender, _amount);

    }

    modifier onlyAdmin() {
        require(address(msg.sender) == _owner || hasRole(ADMIN_ROLE, msg.sender), "Caller is not the owner or Admin");
        _;
    }

    modifier onlyWhitelisted(address _token) {
        require(isWhitelisted[_token], "token not whitelisted");
        _;
    }
}
