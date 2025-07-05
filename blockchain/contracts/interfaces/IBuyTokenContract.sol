// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBuyTokenContract {
    function registerToken(
        address _tokenContract,
        address _astrologer,
        uint256 _totalSupply,
        uint256 _basePrice
    ) external;
    
    function updateCredibility(address _tokenContract, uint256 _credibilityMultiplier) external;
    function getCurrentPrice(address _tokenContract) external view returns (uint256);
    function buyTokens(address _tokenContract) external payable;
    function sellTokens(address _tokenContract, uint256 _tokenAmount) external;
} 