// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAstrologerManager {
    struct Astrologer {
        uint256 id;
        address wallet;
        string name;
        string description;
        string specialty;
        uint256 experience;
        uint256 reputation;
        uint256 totalPredictions;
        uint256 accuratePredictions;
        uint256 tokenContract;
        bool isVerified;
        bool isActive;
        uint256 registeredAt;
        uint256 lastActive;
    }

    function getAstrologerByWallet(address wallet) external view returns (Astrologer memory);
    function getAstrologer(uint256 astrologerId) external view returns (Astrologer memory);
    function updateReputation(uint256 astrologerId, uint256 newReputation) external;
    function recordPredictionResult(uint256 astrologerId, bool wasAccurate) external;
    function setTokenContract(uint256 astrologerId, uint256 tokenContract) external;
    function isAstrologerVerified(address wallet) external view returns (bool);
    function getAstrologerId(address wallet) external view returns (uint256);
} 