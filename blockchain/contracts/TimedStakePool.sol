// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract TimedStakePool is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _poolIds;
    
    struct Pool {
        uint256 id;
        string name;
        string description;
        uint256 stakeAmount;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        uint256 totalStaked;
        uint256 maxParticipants;
        uint256 currentParticipants;
        bool isActive;
        bool isResolved;
        address creator;
        uint256 createdAt;
    }

    struct Stake {
        address user;
        uint256 amount;
        uint256 stakedAt;
        bool claimed;
        bool won;
    }

    struct PoolStats {
        uint256 totalPools;
        uint256 activePools;
        uint256 resolvedPools;
        uint256 totalVolume;
    }

    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => Stake)) public stakes;
    mapping(address => uint256[]) public userPools;
    mapping(address => uint256[]) public userStakes;
    
    address public reputationScorer;
    
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public minDuration;
    uint256 public maxDuration;
    uint256 public poolCreationFee;
    
    PoolStats public poolStats;
    
    event PoolCreated(
        uint256 indexed poolId,
        address indexed creator,
        string name,
        uint256 stakeAmount,
        uint256 duration,
        uint256 maxParticipants
    );

    event StakePlaced(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 stakedAt
    );

    event PoolResolved(
        uint256 indexed poolId,
        uint256 totalStaked,
        uint256 participants
    );

    event RewardClaimed(
        uint256 indexed poolId,
        address indexed user,
        uint256 rewardAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _reputationScorer,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        uint256 _minDuration,
        uint256 _maxDuration,
        uint256 _poolCreationFee
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        reputationScorer = _reputationScorer;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        minDuration = _minDuration;
        maxDuration = _maxDuration;
        poolCreationFee = _poolCreationFee;
    }

    function createPool(
        string memory _name,
        string memory _description,
        uint256 _stakeAmount,
        uint256 _duration,
        uint256 _maxParticipants
    ) external payable returns (uint256) {
        require(msg.value >= poolCreationFee, "Insufficient creation fee");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_stakeAmount >= minStakeAmount, "Stake amount too low");
        require(_stakeAmount <= maxStakeAmount, "Stake amount too high");
        require(_duration >= minDuration, "Duration too short");
        require(_duration <= maxDuration, "Duration too long");
        require(_maxParticipants > 0, "Max participants must be greater than 0");

        _poolIds.increment();
        uint256 poolId = _poolIds.current();

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;

        pools[poolId] = Pool({
            id: poolId,
            name: _name,
            description: _description,
            stakeAmount: _stakeAmount,
            duration: _duration,
            startTime: startTime,
            endTime: endTime,
            totalStaked: 0,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            isActive: true,
            isResolved: false,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        userPools[msg.sender].push(poolId);
        poolStats.totalPools++;
        poolStats.activePools++;

        emit PoolCreated(poolId, msg.sender, _name, _stakeAmount, _duration, _maxParticipants);
        return poolId;
    }

    function stakeInPool(uint256 _poolId) external payable {
        Pool storage pool = pools[_poolId];
        require(pool.isActive, "Pool not active");
        require(block.timestamp < pool.endTime, "Pool ended");
        require(pool.currentParticipants < pool.maxParticipants, "Pool full");
        require(msg.value == pool.stakeAmount, "Incorrect stake amount");
        require(stakes[_poolId][msg.sender].amount == 0, "Already staked");

        stakes[_poolId][msg.sender] = Stake({
            user: msg.sender,
            amount: msg.value,
            stakedAt: block.timestamp,
            claimed: false,
            won: false
        });

        pool.totalStaked += msg.value;
        pool.currentParticipants++;
        userStakes[msg.sender].push(_poolId);
        poolStats.totalVolume += msg.value;

        emit StakePlaced(_poolId, msg.sender, msg.value, block.timestamp);
    }

    function resolvePool(uint256 _poolId) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        
        Pool storage pool = pools[_poolId];
        require(pool.isActive, "Pool not active");
        require(block.timestamp >= pool.endTime, "Pool not ended");
        require(!pool.isResolved, "Pool already resolved");

        pool.isResolved = true;
        pool.isActive = false;
        poolStats.activePools--;
        poolStats.resolvedPools++;

        emit PoolResolved(_poolId, pool.totalStaked, pool.currentParticipants);
    }

    function setWinner(uint256 _poolId, address _winner) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        
        Pool storage pool = pools[_poolId];
        require(pool.isResolved, "Pool not resolved");
        require(stakes[_poolId][_winner].amount > 0, "Winner not found");

        stakes[_poolId][_winner].won = true;
    }

    function claimReward(uint256 _poolId) external {
        Pool storage pool = pools[_poolId];
        Stake storage stake = stakes[_poolId][msg.sender];
        
        require(pool.isResolved, "Pool not resolved");
        require(stake.amount > 0, "No stake found");
        require(!stake.claimed, "Reward already claimed");

        stake.claimed = true;

        uint256 rewardAmount = calculateReward(_poolId, msg.sender);
        if (rewardAmount > 0) {
            payable(msg.sender).transfer(rewardAmount);
            emit RewardClaimed(_poolId, msg.sender, rewardAmount);
        }
    }

    function calculateReward(uint256 _poolId, address _user) public view returns (uint256) {
        Pool storage pool = pools[_poolId];
        Stake storage stake = stakes[_poolId][_user];
        
        if (!pool.isResolved || stake.amount == 0 || stake.claimed) {
            return 0;
        }

        if (stake.won) {
            // Winner gets the entire pool
            return pool.totalStaked;
        }
        
        return 0;
    }

    function getPool(uint256 _poolId) external view returns (Pool memory) {
        require(_poolId > 0 && _poolId <= _poolIds.current(), "Invalid pool ID");
        return pools[_poolId];
    }

    function getStake(uint256 _poolId, address _user) external view returns (Stake memory) {
        return stakes[_poolId][_user];
    }

    function getUserPools(address _user) external view returns (uint256[] memory) {
        return userPools[_user];
    }

    function getUserStakes(address _user) external view returns (uint256[] memory) {
        return userStakes[_user];
    }

    function getActivePools() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](poolStats.activePools);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _poolIds.current(); i++) {
            if (pools[i].isActive) {
                activeIds[count] = i;
                count++;
            }
        }
        
        return activeIds;
    }

    function getPoolParticipants(uint256 _poolId) external view returns (address[] memory) {
        Pool storage pool = pools[_poolId];
        address[] memory participants = new address[](pool.currentParticipants);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _poolIds.current(); i++) {
            if (stakes[_poolId][address(uint160(i))].amount > 0) {
                participants[count] = address(uint160(i));
                count++;
                if (count >= pool.currentParticipants) break;
            }
        }
        
        return participants;
    }

    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }

    function setStakeLimits(uint256 _minStakeAmount, uint256 _maxStakeAmount) external onlyOwner {
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
    }

    function setDurationLimits(uint256 _minDuration, uint256 _maxDuration) external onlyOwner {
        minDuration = _minDuration;
        maxDuration = _maxDuration;
    }

    function setPoolCreationFee(uint256 _poolCreationFee) external onlyOwner {
        poolCreationFee = _poolCreationFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 