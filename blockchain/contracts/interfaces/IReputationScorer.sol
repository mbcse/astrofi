// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReputationScorer {
    function updateReputationFromWorldPrediction(
        address _astrologer,
        bool _wasCorrect
    ) external;

    function getReputationMultiplier(address _astrologer) external view returns (uint256);
    
    function getReputationScore(address _astrologer) external view returns (
        uint256 id,
        address astrologer,
        uint256 totalPredictions,
        uint256 accuratePredictions,
        uint256 accuracyPercentage,
        uint256 reputationMultiplier,
        uint256 marketPredictions,
        uint256 dailyPredictions,
        uint256 oneToOnePredictions,
        uint256 lastUpdated,
        bool isActive
    );
} 