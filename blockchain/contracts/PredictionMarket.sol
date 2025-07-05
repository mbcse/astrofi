// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract PredictionMarket is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _marketIds;
    
    struct Market {
        uint256 id;
        string question;
        string description;
        uint256 category;
        uint256 commitPhaseEnd;
        uint256 revealPhaseEnd;
        uint256 resolutionPhaseEnd;
        bool isResolved;
        bool outcome;
        uint256 totalStaked;
        uint256 yesStaked;
        uint256 noStaked;
        uint256 totalParticipants;
        address creator;
        uint256 createdAt;
    }

    struct Vote {
        bytes32 commitHash;
        bool revealed;
        bool vote;
        uint256 stakeAmount;
        bool claimed;
    }

    struct MarketStats {
        uint256 totalMarkets;
        uint256 activeMarkets;
        uint256 resolvedMarkets;
        uint256 totalVolume;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256[]) public userMarkets;
    mapping(address => uint256[]) public userVotes;
    
    address public predictionCredibilityManager;
    address public reputationScorer;
    
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public commitPhaseDuration;
    uint256 public revealPhaseDuration;
    uint256 public resolutionPhaseDuration;
    
    MarketStats public marketStats;
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        uint256 category,
        uint256 commitPhaseEnd
    );

    event VoteCommitted(
        uint256 indexed marketId,
        address indexed voter,
        bytes32 commitHash,
        uint256 stakeAmount
    );

    event VoteRevealed(
        uint256 indexed marketId,
        address indexed voter,
        bool vote,
        uint256 stakeAmount
    );

    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 totalStaked,
        uint256 yesStaked,
        uint256 noStaked
    );

    event RewardClaimed(
        uint256 indexed marketId,
        address indexed voter,
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
        uint256 _maxStakeAmount
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        predictionCredibilityManager = _predictionCredibilityManager;
        reputationScorer = _reputationScorer;
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        commitPhaseDuration = 3 days;
        revealPhaseDuration = 2 days;
        resolutionPhaseDuration = 1 days;
    }

    function createMarket(
        string memory _question,
        string memory _description,
        uint256 _category
    ) external returns (uint256) {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_category <= 10, "Invalid category");

        _marketIds.increment();
        uint256 marketId = _marketIds.current();

        uint256 commitPhaseEnd = block.timestamp + commitPhaseDuration;
        uint256 revealPhaseEnd = commitPhaseEnd + revealPhaseDuration;
        uint256 resolutionPhaseEnd = revealPhaseEnd + resolutionPhaseDuration;

        markets[marketId] = Market({
            id: marketId,
            question: _question,
            description: _description,
            category: _category,
            commitPhaseEnd: commitPhaseEnd,
            revealPhaseEnd: revealPhaseEnd,
            resolutionPhaseEnd: resolutionPhaseEnd,
            isResolved: false,
            outcome: false,
            totalStaked: 0,
            yesStaked: 0,
            noStaked: 0,
            totalParticipants: 0,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        userMarkets[msg.sender].push(marketId);
        marketStats.totalMarkets++;
        marketStats.activeMarkets++;

        emit MarketCreated(marketId, msg.sender, _question, _category, commitPhaseEnd);
        return marketId;
    }

    function commitVote(uint256 _marketId, bytes32 _commitHash) external payable {
        Market storage market = markets[_marketId];
        require(!market.isResolved, "Market already resolved");
        require(block.timestamp < market.commitPhaseEnd, "Commit phase ended");
        require(msg.value >= minStakeAmount, "Stake amount too low");
        require(msg.value <= maxStakeAmount, "Stake amount too high");
        require(votes[_marketId][msg.sender].commitHash == bytes32(0), "Already voted");

        votes[_marketId][msg.sender] = Vote({
            commitHash: _commitHash,
            revealed: false,
            vote: false,
            stakeAmount: msg.value,
            claimed: false
        });

        market.totalStaked += msg.value;
        market.totalParticipants++;
        userVotes[msg.sender].push(_marketId);
        marketStats.totalVolume += msg.value;

        emit VoteCommitted(_marketId, msg.sender, _commitHash, msg.value);
    }

    function revealVote(
        uint256 _marketId,
        bool _vote,
        bytes32 _salt
    ) external {
        Market storage market = markets[_marketId];
        Vote storage vote = votes[_marketId][msg.sender];
        
        require(!market.isResolved, "Market already resolved");
        require(block.timestamp >= market.commitPhaseEnd, "Commit phase not ended");
        require(block.timestamp < market.revealPhaseEnd, "Reveal phase ended");
        require(vote.commitHash != bytes32(0), "No vote to reveal");
        require(!vote.revealed, "Vote already revealed");

        // Verify commit hash
        bytes32 expectedHash = keccak256(abi.encodePacked(_vote, _salt, msg.sender));
        require(vote.commitHash == expectedHash, "Invalid reveal");

        vote.revealed = true;
        vote.vote = _vote;

        if (_vote) {
            market.yesStaked += vote.stakeAmount;
        } else {
            market.noStaked += vote.stakeAmount;
        }

        emit VoteRevealed(_marketId, msg.sender, _vote, vote.stakeAmount);
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        
        Market storage market = markets[_marketId];
        require(!market.isResolved, "Market already resolved");
        require(block.timestamp >= market.resolutionPhaseEnd, "Resolution phase not ended");

        market.isResolved = true;
        market.outcome = _outcome;
        marketStats.activeMarkets--;
        marketStats.resolvedMarkets++;

        emit MarketResolved(_marketId, _outcome, market.totalStaked, market.yesStaked, market.noStaked);
    }

    function claimReward(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        Vote storage vote = votes[_marketId][msg.sender];
        
        require(market.isResolved, "Market not resolved");
        require(vote.commitHash != bytes32(0), "No vote found");
        require(vote.revealed, "Vote not revealed");
        require(!vote.claimed, "Reward already claimed");

        vote.claimed = true;

        uint256 rewardAmount = calculateReward(_marketId, msg.sender);
        if (rewardAmount > 0) {
            payable(msg.sender).transfer(rewardAmount);
            emit RewardClaimed(_marketId, msg.sender, rewardAmount);
        }
    }

    function calculateReward(uint256 _marketId, address _voter) public view returns (uint256) {
        Market storage market = markets[_marketId];
        Vote storage vote = votes[_marketId][_voter];
        
        if (!market.isResolved || !vote.revealed || vote.claimed) {
            return 0;
        }

        // If voter was correct, they get a share of the losing side's stakes
        if (vote.vote == market.outcome) {
            uint256 winningStake = vote.vote ? market.yesStaked : market.noStaked;
            uint256 losingStake = vote.vote ? market.noStaked : market.yesStaked;
            
            if (winningStake > 0 && losingStake > 0) {
                uint256 share = (vote.stakeAmount * losingStake) / winningStake;
                return vote.stakeAmount + share;
            }
        }
        
        return 0;
    }

    function getMarket(uint256 _marketId) external view returns (Market memory) {
        require(_marketId > 0 && _marketId <= _marketIds.current(), "Invalid market ID");
        return markets[_marketId];
    }

    function getVote(uint256 _marketId, address _voter) external view returns (Vote memory) {
        return votes[_marketId][_voter];
    }

    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }

    function getUserVotes(address _user) external view returns (uint256[] memory) {
        return userVotes[_user];
    }

    function getActiveMarkets() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](marketStats.activeMarkets);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _marketIds.current(); i++) {
            if (!markets[i].isResolved) {
                activeIds[count] = i;
                count++;
            }
        }
        
        return activeIds;
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

    function setPhaseDurations(
        uint256 _commitPhaseDuration,
        uint256 _revealPhaseDuration,
        uint256 _resolutionPhaseDuration
    ) external onlyOwner {
        commitPhaseDuration = _commitPhaseDuration;
        revealPhaseDuration = _revealPhaseDuration;
        resolutionPhaseDuration = _resolutionPhaseDuration;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 