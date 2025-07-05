// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAstroTokenLauncher {
    struct TokenInfo {
        uint256 id;
        address astrologer;
        address tokenContract;
        address buyContract;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 initialPrice;
        bool isActive;
        uint256 createdAt;
    }

    function getTokenByAstrologer(address astrologer) external view returns (TokenInfo memory);
    function getTokenByContract(address tokenContract) external view returns (TokenInfo memory);
    function getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory);
    function astrologerToTokenId(address astrologer) external view returns (uint256);
    function tokenContractToId(address tokenContract) external view returns (uint256);
} 