// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AstroToken.sol";
import "./BuyTokenContract.sol";

contract AstroTokenFactory is Ownable {
    address public astroTokenImplementation;
    address public buyTokenContractImplementation;
    address public astrologerManager;
    address public reputationScorer;
    
    event TokenDeployed(address indexed tokenContract, address indexed buyContract, address indexed astrologer);
    
    constructor(
        address _astroTokenImplementation,
        address _buyTokenContractImplementation,
        address _astrologerManager
    ) {
        astroTokenImplementation = _astroTokenImplementation;
        buyTokenContractImplementation = _buyTokenContractImplementation;
        astrologerManager = _astrologerManager;
        reputationScorer = address(0); // Will be set later via setter
    }
    
    function deployTokenPair(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _initialPrice,
        address _astrologer
    ) external returns (address tokenContract, address buyContract) {
        // Deploy token contract
        tokenContract = Clones.clone(astroTokenImplementation);
        AstroToken(tokenContract).initialize(_name, _symbol, _totalSupply, _astrologer, address(0));
        
        // Deploy buy contract
        buyContract = Clones.clone(buyTokenContractImplementation);
        BuyTokenContract(buyContract).initialize(astrologerManager, address(0), 100);
        
        // Set ReputationScorer if available
        if (reputationScorer != address(0)) {
            BuyTokenContract(buyContract).setReputationScorer(reputationScorer);
        }
        
        // Register token in buy contract
        BuyTokenContract(buyContract).registerToken(tokenContract, _astrologer, _totalSupply, _initialPrice);
        
        // Set buy contract in token
        AstroToken(tokenContract).setBuyContract(buyContract);
        
        emit TokenDeployed(tokenContract, buyContract, _astrologer);
    }
    
    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }
    
    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }
    
    function setImplementations(
        address _astroTokenImplementation,
        address _buyTokenContractImplementation
    ) external onlyOwner {
        astroTokenImplementation = _astroTokenImplementation;
        buyTokenContractImplementation = _buyTokenContractImplementation;
    }
} 