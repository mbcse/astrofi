// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IAstrologerManager.sol";
import "./interfaces/IBuyTokenContract.sol";
import "./interfaces/IAstroTokenLauncher.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract PredictionCredibilityManager is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _predictionIds;
    
    struct Prediction {
        uint256 id;
        address astrologer;
        uint256 astrologerId;
        string description;
        uint256 predictionType; // 0: Market, 1: Daily, 2: OneToOne
        uint256 deadline;
        bool outcome;
        bool isResolved;
        bool wasAccurate;
        uint256 stakeAmount;
        uint256 totalStaked;
        uint256 createdAt;
    }

    struct CredibilityScore {
        uint256 totalPredictions;
        uint256 accuratePredictions;
        uint256 accuracyPercentage;
        uint256 reputationMultiplier;
        uint256 lastUpdated;
    }

    mapping(uint256 => Prediction) public predictions;
    mapping(address => CredibilityScore) public credibilityScores;
    mapping(address => uint256[]) public astrologerPredictions;
    
    address public astrologerManager;
    address public buyTokenContract;
    address public reputationScorer;
    address public astroTokenLauncher;
    
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public credibilityUpdateDelay;
    
    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed astrologer,
        string description,
        uint256 predictionType,
        uint256 deadline
    );

    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome,
        bool wasAccurate
    );

    event CredibilityUpdated(
        address indexed astrologer,
        uint256 oldAccuracy,
        uint256 newAccuracy,
        uint256 newMultiplier
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _astrologerManager,
        address _buyTokenContract,
        address _reputationScorer,
        address _astroTokenLauncher,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        astrologerManager = _astrologerManager;
        buyTokenContract = _buyTokenContract;
        reputationScorer = _reputationScorer;
        astroTokenLauncher = _astroTokenLauncher;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        credibilityUpdateDelay = 1 days;
    }

    function createPrediction(
        string memory _description,
        uint256 _predictionType,
        uint256 _deadline,
        uint256 _stakeAmount
    ) external payable returns (uint256) {
        require(msg.value >= minStakeAmount, "Stake amount too low");
        require(msg.value <= maxStakeAmount, "Stake amount too high");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_predictionType <= 2, "Invalid prediction type");

        _predictionIds.increment();
        uint256 predictionId = _predictionIds.current();

        predictions[predictionId] = Prediction({
            id: predictionId,
            astrologer: msg.sender,
            astrologerId: 0, // Will be set by astrologer manager
            description: _description,
            predictionType: _predictionType,
            deadline: _deadline,
            outcome: false,
            isResolved: false,
            wasAccurate: false,
            stakeAmount: msg.value,
            totalStaked: msg.value,
            createdAt: block.timestamp
        });

        astrologerPredictions[msg.sender].push(predictionId);

        emit PredictionCreated(predictionId, msg.sender, _description, _predictionType, _deadline);
        return predictionId;
    }

    function resolvePrediction(uint256 _predictionId, bool _outcome) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp >= prediction.deadline, "Deadline not reached");

        prediction.outcome = _outcome;
        prediction.isResolved = true;

        // Determine if prediction was accurate
        // This logic would depend on the specific prediction type and outcome
        prediction.wasAccurate = _outcome; // Simplified logic

        // Update credibility score
        updateAstrologerCredibility(prediction.astrologer, prediction.wasAccurate);

        // Record result in astrologer manager
        if (astrologerManager != address(0)) {
            uint256 astrologerId = IAstrologerManager(astrologerManager).getAstrologerId(prediction.astrologer);
            if (astrologerId > 0) {
                IAstrologerManager(astrologerManager).recordPredictionResult(astrologerId, prediction.wasAccurate);
            }
        }

        emit PredictionResolved(_predictionId, _outcome, prediction.wasAccurate);
    }

    function updateAstrologerCredibility(address _astrologer, bool _wasAccurate) internal {
        CredibilityScore storage score = credibilityScores[_astrologer];
        
        score.totalPredictions++;
        if (_wasAccurate) {
            score.accuratePredictions++;
        }
        
        score.accuracyPercentage = (score.accuratePredictions * 100) / score.totalPredictions;
        
        // Calculate reputation multiplier based on accuracy
        if (score.accuracyPercentage >= 90) {
            score.reputationMultiplier = 1500; // 1.5x
        } else if (score.accuracyPercentage >= 80) {
            score.reputationMultiplier = 1200; // 1.2x
        } else if (score.accuracyPercentage >= 70) {
            score.reputationMultiplier = 1000; // 1.0x
        } else if (score.accuracyPercentage >= 60) {
            score.reputationMultiplier = 800; // 0.8x
        } else {
            score.reputationMultiplier = 500; // 0.5x
        }
        
        score.lastUpdated = block.timestamp;

        // Update buy token contract credibility multiplier
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

        emit CredibilityUpdated(_astrologer, score.accuracyPercentage, score.accuracyPercentage, score.reputationMultiplier);
    }

    function getPrediction(uint256 _predictionId) external view returns (Prediction memory) {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        return predictions[_predictionId];
    }

    function getAstrologerPredictions(address _astrologer) external view returns (uint256[] memory) {
        return astrologerPredictions[_astrologer];
    }

    function getCredibilityScore(address _astrologer) external view returns (CredibilityScore memory) {
        return credibilityScores[_astrologer];
    }

    function getAstrologerAccuracy(address _astrologer) external view returns (uint256) {
        return credibilityScores[_astrologer].accuracyPercentage;
    }

    function getReputationMultiplier(address _astrologer) external view returns (uint256) {
        return credibilityScores[_astrologer].reputationMultiplier;
    }

    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }

    function setBuyTokenContract(address _buyTokenContract) external onlyOwner {
        buyTokenContract = _buyTokenContract;
    }

    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }

    function setAstroTokenLauncher(address _astroTokenLauncher) external onlyOwner {
        astroTokenLauncher = _astroTokenLauncher;
    }

    function setStakeLimits(uint256 _minStakeAmount, uint256 _maxStakeAmount) external onlyOwner {
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
    }

    function setCredibilityUpdateDelay(uint256 _delay) external onlyOwner {
        credibilityUpdateDelay = _delay;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 