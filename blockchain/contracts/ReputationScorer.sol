// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IAstrologerManager.sol";
import "./interfaces/IBuyTokenContract.sol";
import "./interfaces/IAstroTokenLauncher.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract ReputationScorer is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _scoreIds;
    
    struct ReputationScore {
        uint256 id;
        address astrologer;
        uint256 totalPredictions;
        uint256 accuratePredictions;
        uint256 accuracyPercentage;
        uint256 reputationMultiplier;
        uint256 marketPredictions;
        uint256 dailyPredictions;
        uint256 oneToOnePredictions;
        uint256 lastUpdated;
        bool isActive;
    }

    struct ScoreBreakdown {
        uint256 marketAccuracy;
        uint256 dailyAccuracy;
        uint256 oneToOneAccuracy;
        uint256 weightedScore;
        uint256 reputationTier;
    }

    struct PredictionModule {
        address contractAddress;
        bool isActive;
        uint256 weight;
        uint256 lastUpdate;
    }

    mapping(address => ReputationScore) public reputationScores;
    mapping(address => ScoreBreakdown) public scoreBreakdowns;
    mapping(uint256 => PredictionModule) public predictionModules;
    
    address public astrologerManager;
    address public buyTokenContract;
    address public zodiacDAO;
    address public astroTokenLauncher;
    address public worldPredictionMarket;
    
    uint256 public totalModules;
    uint256 public minPredictionsForScore;
    uint256 public scoreUpdateDelay;
    uint256 public reputationDecayRate;
    uint256 public maxReputationMultiplier; // Maximum reputation multiplier (e.g., 5000 = 5.0x)
    uint256 public minReputationMultiplier; // Minimum reputation multiplier (e.g., 200 = 0.2x)
    
    event ReputationScoreUpdated(
        address indexed astrologer,
        uint256 oldAccuracy,
        uint256 newAccuracy,
        uint256 newMultiplier
    );

    event PredictionModuleAdded(
        uint256 indexed moduleId,
        address contractAddress,
        uint256 weight
    );

    event ScoreBreakdownUpdated(
        address indexed astrologer,
        uint256 marketAccuracy,
        uint256 dailyAccuracy,
        uint256 oneToOneAccuracy,
        uint256 weightedScore
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _astrologerManager,
        address _buyTokenContract,
        address _zodiacDAO,
        uint256 _minPredictionsForScore,
        uint256 _scoreUpdateDelay
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        astrologerManager = _astrologerManager;
        buyTokenContract = _buyTokenContract;
        zodiacDAO = _zodiacDAO;
        astroTokenLauncher = address(0); // Will be set separately
        worldPredictionMarket = address(0); // Will be set separately
        minPredictionsForScore = _minPredictionsForScore;
        scoreUpdateDelay = _scoreUpdateDelay;
        reputationDecayRate = 5; // 5% decay per month
        maxReputationMultiplier = 5000; // 5.0x maximum multiplier
        minReputationMultiplier = 200; // 0.2x minimum multiplier
    }

    function addPredictionModule(
        address _contractAddress,
        uint256 _weight
    ) external onlyOwner returns (uint256) {
        require(_contractAddress != address(0), "Invalid contract address");
        require(_weight > 0, "Weight must be greater than 0");

        totalModules++;
        uint256 moduleId = totalModules;

        predictionModules[moduleId] = PredictionModule({
            contractAddress: _contractAddress,
            isActive: true,
            weight: _weight,
            lastUpdate: block.timestamp
        });

        emit PredictionModuleAdded(moduleId, _contractAddress, _weight);
        return moduleId;
    }

    function updateReputationFromWorldPrediction(
        address _astrologer,
        bool _wasCorrect
    ) external {
        require(msg.sender == worldPredictionMarket || msg.sender == owner(), "Unauthorized");
        require(_astrologer != address(0), "Invalid astrologer address");

        ReputationScore storage score = reputationScores[_astrologer];
        
        // Update world prediction counts
        score.marketPredictions++; // World predictions count as market predictions
        score.totalPredictions++;
        
        if (_wasCorrect) {
            score.accuratePredictions++;
        }
        
        // Recalculate accuracy percentage
        score.accuracyPercentage = (score.accuratePredictions * 100) / score.totalPredictions;
        
        // Update reputation multiplier
        score.reputationMultiplier = calculateReputationMultiplier(score.accuracyPercentage);
        score.lastUpdated = block.timestamp;
        score.isActive = true;

        // Update astrologer manager
        if (astrologerManager != address(0)) {
            uint256 astrologerId = IAstrologerManager(astrologerManager).getAstrologerId(_astrologer);
            if (astrologerId > 0) {
                IAstrologerManager(astrologerManager).updateReputation(astrologerId, score.reputationMultiplier);
            }
        }

        // Update buy token contract
        if (astroTokenLauncher != address(0)) {
            try IAstroTokenLauncher(astroTokenLauncher).getTokenByAstrologer(_astrologer) returns (IAstroTokenLauncher.TokenInfo memory tokenInfo) {
                if (tokenInfo.tokenContract != address(0) && tokenInfo.buyContract != address(0) && tokenInfo.isActive) {
                    // Use the token's specific BuyTokenContract instance, not the main one
                    IBuyTokenContract(tokenInfo.buyContract).updateCredibility(tokenInfo.tokenContract, score.reputationMultiplier);
                }
            } catch {
                // Token not found or error occurred, skip update
            }
        }

        emit ReputationScoreUpdated(_astrologer, score.accuracyPercentage, score.accuracyPercentage, score.reputationMultiplier);
    }

    function updateReputationScore(
        address _astrologer,
        uint256 _marketPredictions,
        uint256 _marketAccurate,
        uint256 _dailyPredictions,
        uint256 _dailyAccurate,
        uint256 _oneToOnePredictions,
        uint256 _oneToOneAccurate
    ) external {
        require(msg.sender == owner() || isPredictionModule(msg.sender), "Unauthorized");
        require(_astrologer != address(0), "Invalid astrologer address");

        ReputationScore storage score = reputationScores[_astrologer];
        ScoreBreakdown storage breakdown = scoreBreakdowns[_astrologer];

        // Update prediction counts
        score.marketPredictions = _marketPredictions;
        score.dailyPredictions = _dailyPredictions;
        score.oneToOnePredictions = _oneToOnePredictions;
        score.totalPredictions = _marketPredictions + _dailyPredictions + _oneToOnePredictions;

        // Calculate accuracies
        breakdown.marketAccuracy = _marketPredictions > 0 ? (_marketAccurate * 100) / _marketPredictions : 0;
        breakdown.dailyAccuracy = _dailyPredictions > 0 ? (_dailyAccurate * 100) / _dailyPredictions : 0;
        breakdown.oneToOneAccuracy = _oneToOnePredictions > 0 ? (_oneToOneAccurate * 100) / _oneToOnePredictions : 0;

        // Calculate weighted score
        uint256 totalWeight = 0;
        uint256 weightedSum = 0;

        if (_marketPredictions > 0) {
            weightedSum += breakdown.marketAccuracy * 3; // Market predictions weight: 3
            totalWeight += 3;
        }
        if (_dailyPredictions > 0) {
            weightedSum += breakdown.dailyAccuracy * 2; // Daily predictions weight: 2
            totalWeight += 2;
        }
        if (_oneToOnePredictions > 0) {
            weightedSum += breakdown.oneToOneAccuracy * 4; // One-to-one predictions weight: 4
            totalWeight += 4;
        }

        breakdown.weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        score.accuracyPercentage = breakdown.weightedScore;

        // Calculate reputation multiplier based on accuracy
        score.reputationMultiplier = calculateReputationMultiplier(breakdown.weightedScore);

        // Determine reputation tier
        breakdown.reputationTier = calculateReputationTier(breakdown.weightedScore);

        score.lastUpdated = block.timestamp;
        score.isActive = true;

        // Update astrologer manager
        if (astrologerManager != address(0)) {
            uint256 astrologerId = IAstrologerManager(astrologerManager).getAstrologerId(_astrologer);
            if (astrologerId > 0) {
                IAstrologerManager(astrologerManager).updateReputation(astrologerId, score.reputationMultiplier);
            }
        }

        // Update buy token contract
        if (astroTokenLauncher != address(0)) {
            try IAstroTokenLauncher(astroTokenLauncher).getTokenByAstrologer(_astrologer) returns (IAstroTokenLauncher.TokenInfo memory tokenInfo) {
                if (tokenInfo.tokenContract != address(0) && tokenInfo.buyContract != address(0) && tokenInfo.isActive) {
                    // Update the credibility multiplier in the token's specific BuyTokenContract instance
                    IBuyTokenContract(tokenInfo.buyContract).updateCredibility(tokenInfo.tokenContract, score.reputationMultiplier);
                }
            } catch {
                // Token not found or error occurred, skip update
            }
        }

        emit ReputationScoreUpdated(_astrologer, score.accuracyPercentage, score.accuracyPercentage, score.reputationMultiplier);
        emit ScoreBreakdownUpdated(_astrologer, breakdown.marketAccuracy, breakdown.dailyAccuracy, breakdown.oneToOneAccuracy, breakdown.weightedScore);
    }

    function calculateReputationMultiplier(uint256 _accuracy) internal view returns (uint256) {
        // Dynamic multiplier based on accuracy percentage
        // Formula: minMultiplier + (accuracy * (maxMultiplier - minMultiplier)) / 100
        
        if (_accuracy >= 100) {
            return maxReputationMultiplier; // Cap at maximum
        }
        
        if (_accuracy <= 0) {
            return minReputationMultiplier; // Floor at minimum
        }
        
        // Linear interpolation between min and max based on accuracy
        uint256 multiplierRange = maxReputationMultiplier - minReputationMultiplier;
        uint256 accuracyContribution = (_accuracy * multiplierRange) / 100;
        
        return minReputationMultiplier + accuracyContribution;
    }

    function calculateReputationTier(uint256 _accuracy) internal pure returns (uint256) {
        if (_accuracy >= 95) return 5; // Master Astrologer
        if (_accuracy >= 90) return 4; // Expert Astrologer
        if (_accuracy >= 85) return 3; // Advanced Astrologer
        if (_accuracy >= 80) return 2; // Intermediate Astrologer
        if (_accuracy >= 75) return 1; // Beginner Astrologer
        return 0; // Novice
    }

    function getReputationScore(address _astrologer) external view returns (ReputationScore memory) {
        return reputationScores[_astrologer];
    }

    function getScoreBreakdown(address _astrologer) external view returns (ScoreBreakdown memory) {
        return scoreBreakdowns[_astrologer];
    }

    function getReputationMultiplier(address _astrologer) external view returns (uint256) {
        return reputationScores[_astrologer].reputationMultiplier;
    }

    function getReputationTier(address _astrologer) external view returns (uint256) {
        return scoreBreakdowns[_astrologer].reputationTier;
    }

    function getTopAstrologers(uint256 _limit) external view returns (address[] memory) {
        address[] memory topAstrologers = new address[](_limit);
        uint256 count = 0;
        
        // This is a simplified implementation
        
        return topAstrologers;
    }

    function isPredictionModule(address _module) internal view returns (bool) {
        for (uint256 i = 1; i <= totalModules; i++) {
            if (predictionModules[i].contractAddress == _module && predictionModules[i].isActive) {
                return true;
            }
        }
        return false;
    }

    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }

    function setBuyTokenContract(address _buyTokenContract) external onlyOwner {
        buyTokenContract = _buyTokenContract;
    }

    function setAstroTokenLauncher(address _astroTokenLauncher) external onlyOwner {
        astroTokenLauncher = _astroTokenLauncher;
    }

    function setZodiacDAO(address _zodiacDAO) external onlyOwner {
        zodiacDAO = _zodiacDAO;
    }

    function setWorldPredictionMarket(address _worldPredictionMarket) external onlyOwner {
        worldPredictionMarket = _worldPredictionMarket;
    }

    function setMinPredictionsForScore(uint256 _minPredictions) external onlyOwner {
        minPredictionsForScore = _minPredictions;
    }

    function setScoreUpdateDelay(uint256 _delay) external onlyOwner {
        scoreUpdateDelay = _delay;
    }

    function setReputationDecayRate(uint256 _decayRate) external onlyOwner {
        reputationDecayRate = _decayRate;
    }

    function togglePredictionModule(uint256 _moduleId) external onlyOwner {
        require(_moduleId > 0 && _moduleId <= totalModules, "Invalid module ID");
        predictionModules[_moduleId].isActive = !predictionModules[_moduleId].isActive;
    }

    function updateModuleWeight(uint256 _moduleId, uint256 _newWeight) external onlyOwner {
        require(_moduleId > 0 && _moduleId <= totalModules, "Invalid module ID");
        require(_newWeight > 0, "Weight must be greater than 0");
        predictionModules[_moduleId].weight = _newWeight;
    }

    function setReputationMultipliers(uint256 _maxMultiplier, uint256 _minMultiplier) external onlyOwner {
        require(_maxMultiplier > _minMultiplier, "Max must be greater than min");
        require(_minMultiplier >= 100, "Min multiplier must be at least 0.1x");
        require(_maxMultiplier <= 10000, "Max multiplier must be at most 10.0x");
        
        maxReputationMultiplier = _maxMultiplier;
        minReputationMultiplier = _minMultiplier;
    }

    function getReputationMultiplierRange() external view returns (uint256 max, uint256 min) {
        return (maxReputationMultiplier, minReputationMultiplier);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 