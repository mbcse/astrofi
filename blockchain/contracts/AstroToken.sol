// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract AstroToken is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    address public astrologer;
    address public buyContract;
    bool public isInitialized;
    
    event AstroTokenInitialized(
        address indexed astrologer,
        string name,
        string symbol,
        uint256 totalSupply
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _astrologer,
        address _buyContract
    ) public initializer {
        require(!isInitialized, "Already initialized");
        
        __ERC20_init(_name, _symbol);
        __ERC20Burnable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        astrologer = _astrologer;
        buyContract = _buyContract;
        
        // Mint total supply to astrologer
        _mint(_astrologer, _totalSupply);
        
        isInitialized = true;
        
        emit AstroTokenInitialized(_astrologer, _name, _symbol, _totalSupply);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner() || msg.sender == buyContract, "Not authorized to mint");
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        require(msg.sender == owner() || msg.sender == buyContract, "Not authorized to burn");
        _burn(account, amount);
    }

    function setBuyContract(address _buyContract) external onlyOwner {
        buyContract = _buyContract;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 