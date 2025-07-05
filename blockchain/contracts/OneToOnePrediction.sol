// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract OneToOnePrediction is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _predictionIds;
    
    struct Prediction {
        uint256 id;
        address user;
        address astrologer;
        string question;
        string prediction;
        uint256 stakeAmount;
        uint256 deadline;
        bool isResolved;
        bool outcome;
        bool userClaimed;
        bool astrologerClaimed;
        uint256 createdAt;
    }

    struct Claim {
        address claimant;
        string evidence;
        bool isUserClaim;
        uint256 submittedAt;
    }

    struct UserStats {
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 totalStaked;
        uint256 totalEarnings;
    }

    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => Claim[]) public claims;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256[]) public userPredictions;
    mapping(address => uint256[]) public astrologerPredictions;
    
    address public predictionCredibilityManager;
    address public reputationScorer;
    address public astrologerManager;
    
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public claimWindow;
    uint256 public resolutionDelay;
    
    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed user,
        address indexed astrologer,
        string question,
        uint256 stakeAmount,
        uint256 deadline
    );

    event PredictionMade(
        uint256 indexed predictionId,
        address indexed astrologer,
        string prediction
    );

    event ClaimSubmitted(
        uint256 indexed predictionId,
        address indexed claimant,
        string evidence,
        bool isUserClaim
    );

    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome,
        address winner
    );

    event RewardClaimed(
        uint256 indexed predictionId,
        address indexed claimant,
        uint256 amount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _predictionCredibilityManager,
        address _reputationScorer,
        address _astrologerManager,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        predictionCredibilityManager = _predictionCredibilityManager;
        reputationScorer = _reputationScorer;
        astrologerManager = _astrologerManager;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        claimWindow = 7 days;
        resolutionDelay = 3 days;
    }

    function createPrediction(
        address _astrologer,
        string memory _question,
        uint256 _deadline
    ) external payable returns (uint256) {
        require(_astrologer != address(0), "Invalid astrologer address");
        require(_astrologer != msg.sender, "Cannot predict with yourself");
        require(msg.value >= minStakeAmount, "Stake amount too low");
        require(msg.value <= maxStakeAmount, "Stake amount too high");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_question).length > 0, "Question cannot be empty");

        _predictionIds.increment();
        uint256 predictionId = _predictionIds.current();

        predictions[predictionId] = Prediction({
            id: predictionId,
            user: msg.sender,
            astrologer: _astrologer,
            question: _question,
            prediction: "",
            stakeAmount: msg.value,
            deadline: _deadline,
            isResolved: false,
            outcome: false,
            userClaimed: false,
            astrologerClaimed: false,
            createdAt: block.timestamp
        });

        userPredictions[msg.sender].push(predictionId);
        astrologerPredictions[_astrologer].push(predictionId);
        userStats[msg.sender].totalPredictions++;
        userStats[msg.sender].totalStaked += msg.value;

        emit PredictionCreated(predictionId, msg.sender, _astrologer, _question, msg.value, _deadline);
        return predictionId;
    }

    function makePrediction(
        uint256 _predictionId,
        string memory _prediction
    ) external {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.astrologer == msg.sender, "Only astrologer can make prediction");
        require(bytes(prediction.prediction).length == 0, "Prediction already made");
        require(block.timestamp < prediction.deadline, "Deadline passed");
        require(bytes(_prediction).length > 0, "Prediction cannot be empty");

        prediction.prediction = _prediction;

        emit PredictionMade(_predictionId, msg.sender, _prediction);
    }

    function submitClaim(
        uint256 _predictionId,
        string memory _evidence,
        bool _isUserClaim
    ) external {
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp >= prediction.deadline, "Deadline not reached");
        require(block.timestamp <= prediction.deadline + claimWindow, "Claim window closed");
        
        if (_isUserClaim) {
            require(prediction.user == msg.sender, "Only user can submit user claim");
        } else {
            require(prediction.astrologer == msg.sender, "Only astrologer can submit astrologer claim");
        }
        require(bytes(_evidence).length > 0, "Evidence cannot be empty");

        claims[_predictionId].push(Claim({
            claimant: msg.sender,
            evidence: _evidence,
            isUserClaim: _isUserClaim,
            submittedAt: block.timestamp
        }));

        emit ClaimSubmitted(_predictionId, msg.sender, _evidence, _isUserClaim);
    }

    function resolvePrediction(uint256 _predictionId, bool _outcome) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp >= prediction.deadline + resolutionDelay, "Resolution delay not met");

        prediction.isResolved = true;
        prediction.outcome = _outcome;

        address winner = _outcome ? prediction.user : prediction.astrologer;
        
        // Update stats
        if (_outcome) {
            userStats[prediction.user].correctPredictions++;
        }

        emit PredictionResolved(_predictionId, _outcome, winner);
    }

    function claimReward(uint256 _predictionId) external {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.isResolved, "Prediction not resolved");
        
        bool isUser = prediction.user == msg.sender;
        bool isAstrologer = prediction.astrologer == msg.sender;
        require(isUser || isAstrologer, "Not authorized to claim");

        if (isUser) {
            require(!prediction.userClaimed, "User already claimed");
            prediction.userClaimed = true;
        } else {
            require(!prediction.astrologerClaimed, "Astrologer already claimed");
            prediction.astrologerClaimed = true;
        }

        uint256 rewardAmount = calculateReward(_predictionId, msg.sender);
        if (rewardAmount > 0) {
            payable(msg.sender).transfer(rewardAmount);
            userStats[msg.sender].totalEarnings += rewardAmount;
            emit RewardClaimed(_predictionId, msg.sender, rewardAmount);
        }
    }

    function calculateReward(uint256 _predictionId, address _claimant) public view returns (uint256) {
        Prediction storage prediction = predictions[_predictionId];
        
        if (!prediction.isResolved) {
            return 0;
        }

        bool isUser = prediction.user == _claimant;
        bool isAstrologer = prediction.astrologer == _claimant;
        
        if (!isUser && !isAstrologer) {
            return 0;
        }

        // Winner gets the stake amount
        if ((isUser && prediction.outcome) || (isAstrologer && !prediction.outcome)) {
            return prediction.stakeAmount;
        }
        
        return 0;
    }

    function getPrediction(uint256 _predictionId) external view returns (Prediction memory) {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        return predictions[_predictionId];
    }

    function getClaims(uint256 _predictionId) external view returns (Claim[] memory) {
        return claims[_predictionId];
    }

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getUserPredictions(address _user) external view returns (uint256[] memory) {
        return userPredictions[_user];
    }

    function getAstrologerPredictions(address _astrologer) external view returns (uint256[] memory) {
        return astrologerPredictions[_astrologer];
    }

    function getActivePredictions() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](_predictionIds.current());
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _predictionIds.current(); i++) {
            if (!predictions[i].isResolved) {
                activeIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIds[i];
        }
        
        return result;
    }

    function setPredictionCredibilityManager(address _predictionCredibilityManager) external onlyOwner {
        predictionCredibilityManager = _predictionCredibilityManager;
    }

    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }

    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }

    function setStakeLimits(uint256 _minStakeAmount, uint256 _maxStakeAmount) external onlyOwner {
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
    }

    function setClaimWindow(uint256 _claimWindow) external onlyOwner {
        claimWindow = _claimWindow;
    }

    function setResolutionDelay(uint256 _resolutionDelay) external onlyOwner {
        resolutionDelay = _resolutionDelay;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 