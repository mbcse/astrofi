// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract DailyPredictionStaking is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _predictionIds;
    
    enum Rashi {
        ARIES,      // 0
        TAURUS,     // 1
        GEMINI,     // 2
        CANCER,     // 3
        LEO,        // 4
        VIRGO,      // 5
        LIBRA,      // 6
        SCORPIO,    // 7
        SAGITTARIUS, // 8
        CAPRICORN,  // 9
        AQUARIUS,   // 10
        PISCES      // 11
    }

    struct DailyPrediction {
        uint256 id;
        Rashi rashi;
        string prediction;
        uint256 date;
        uint256 totalStaked;
        uint256 positiveStaked;
        uint256 negativeStaked;
        bool isResolved;
        bool outcome;
        address astrologer;
        uint256 createdAt;
    }

    struct Stake {
        address user;
        bool isPositive;
        uint256 amount;
        bool claimed;
    }

    struct UserStats {
        uint256 totalStakes;
        uint256 correctPredictions;
        uint256 totalEarnings;
        uint256 lastStakeDate;
    }

    mapping(uint256 => DailyPrediction) public predictions;
    mapping(uint256 => mapping(address => Stake)) public stakes;
    mapping(address => UserStats) public userStats;
    mapping(Rashi => uint256[]) public rashiPredictions;
    mapping(address => uint256[]) public userPredictions;
    
    address public predictionCredibilityManager;
    address public reputationScorer;
    
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public dailyPredictionFee;
    
    event DailyPredictionCreated(
        uint256 indexed predictionId,
        Rashi rashi,
        string prediction,
        uint256 date,
        address astrologer
    );

    event StakePlaced(
        uint256 indexed predictionId,
        address indexed user,
        bool isPositive,
        uint256 amount
    );

    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome,
        uint256 totalStaked,
        uint256 positiveStaked,
        uint256 negativeStaked
    );

    event RewardClaimed(
        uint256 indexed predictionId,
        address indexed user,
        uint256 rewardAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _predictionCredibilityManager,
        address _reputationScorer,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        uint256 _dailyPredictionFee
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        predictionCredibilityManager = _predictionCredibilityManager;
        reputationScorer = _reputationScorer;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        dailyPredictionFee = _dailyPredictionFee;
    }

    function createDailyPrediction(
        Rashi _rashi,
        string memory _prediction,
        uint256 _date
    ) external payable returns (uint256) {
        require(msg.value >= dailyPredictionFee, "Insufficient fee");
        require(bytes(_prediction).length > 0, "Prediction cannot be empty");
        require(_date >= block.timestamp, "Date must be in the future");
        require(uint256(_rashi) <= 11, "Invalid rashi");

        _predictionIds.increment();
        uint256 predictionId = _predictionIds.current();

        predictions[predictionId] = DailyPrediction({
            id: predictionId,
            rashi: _rashi,
            prediction: _prediction,
            date: _date,
            totalStaked: 0,
            positiveStaked: 0,
            negativeStaked: 0,
            isResolved: false,
            outcome: false,
            astrologer: msg.sender,
            createdAt: block.timestamp
        });

        rashiPredictions[_rashi].push(predictionId);
        userPredictions[msg.sender].push(predictionId);

        emit DailyPredictionCreated(predictionId, _rashi, _prediction, _date, msg.sender);
        return predictionId;
    }

    function stakeOnPrediction(
        uint256 _predictionId,
        bool _isPositive
    ) external payable {
        DailyPrediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp < prediction.date, "Prediction date passed");
        require(msg.value >= minStakeAmount, "Stake amount too low");
        require(msg.value <= maxStakeAmount, "Stake amount too high");
        require(stakes[_predictionId][msg.sender].amount == 0, "Already staked");

        stakes[_predictionId][msg.sender] = Stake({
            user: msg.sender,
            isPositive: _isPositive,
            amount: msg.value,
            claimed: false
        });

        prediction.totalStaked += msg.value;
        if (_isPositive) {
            prediction.positiveStaked += msg.value;
        } else {
            prediction.negativeStaked += msg.value;
        }

        userStats[msg.sender].totalStakes++;
        userStats[msg.sender].lastStakeDate = block.timestamp;

        emit StakePlaced(_predictionId, msg.sender, _isPositive, msg.value);
    }

    function resolvePrediction(uint256 _predictionId, bool _outcome) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        
        DailyPrediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp >= prediction.date, "Prediction date not reached");

        prediction.isResolved = true;
        prediction.outcome = _outcome;

        emit PredictionResolved(_predictionId, _outcome, prediction.totalStaked, prediction.positiveStaked, prediction.negativeStaked);
    }

    function claimReward(uint256 _predictionId) external {
        DailyPrediction storage prediction = predictions[_predictionId];
        Stake storage stake = stakes[_predictionId][msg.sender];
        
        require(prediction.isResolved, "Prediction not resolved");
        require(stake.amount > 0, "No stake found");
        require(!stake.claimed, "Reward already claimed");

        stake.claimed = true;

        uint256 rewardAmount = calculateReward(_predictionId, msg.sender);
        if (rewardAmount > 0) {
            payable(msg.sender).transfer(rewardAmount);
            userStats[msg.sender].correctPredictions++;
            userStats[msg.sender].totalEarnings += rewardAmount;
            emit RewardClaimed(_predictionId, msg.sender, rewardAmount);
        }
    }

    function calculateReward(uint256 _predictionId, address _user) public view returns (uint256) {
        DailyPrediction storage prediction = predictions[_predictionId];
        Stake storage stake = stakes[_predictionId][_user];
        
        if (!prediction.isResolved || stake.amount == 0 || stake.claimed) {
            return 0;
        }

        // If user was correct, they get a share of the losing side's stakes
        if (stake.isPositive == prediction.outcome) {
            uint256 winningStake = prediction.outcome ? prediction.positiveStaked : prediction.negativeStaked;
            uint256 losingStake = prediction.outcome ? prediction.negativeStaked : prediction.positiveStaked;
            
            if (winningStake > 0 && losingStake > 0) {
                uint256 share = (stake.amount * losingStake) / winningStake;
                return stake.amount + share;
            }
        }
        
        return 0;
    }

    function getPrediction(uint256 _predictionId) external view returns (DailyPrediction memory) {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        return predictions[_predictionId];
    }

    function getStake(uint256 _predictionId, address _user) external view returns (Stake memory) {
        return stakes[_predictionId][_user];
    }

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getRashiPredictions(Rashi _rashi) external view returns (uint256[] memory) {
        return rashiPredictions[_rashi];
    }

    function getUserPredictions(address _user) external view returns (uint256[] memory) {
        return userPredictions[_user];
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

    function setStakeLimits(uint256 _minStakeAmount, uint256 _maxStakeAmount) external onlyOwner {
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
    }

    function setDailyPredictionFee(uint256 _dailyPredictionFee) external onlyOwner {
        dailyPredictionFee = _dailyPredictionFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 