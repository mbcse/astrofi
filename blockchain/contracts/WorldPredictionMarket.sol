// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./interfaces/IAstrologerManager.sol";
import "./interfaces/IReputationScorer.sol";

contract WorldPredictionMarket is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _predictionIds;
    
    struct WorldPrediction {
        uint256 id;
        address astrologer;
        uint256 astrologerId;
        string title;
        string description;
        uint256 deadline;
        uint256 astrologerStake;
        uint256 totalVoterStake;
        uint256 yesVoterStake;
        uint256 noVoterStake;
        uint256 totalVoters;
        bool isResolved;
        bool outcome;
        bool daoVotingActive;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    struct Vote {
        bool hasVoted;
        bool vote; // true = YES, false = NO
        uint256 stakeAmount;
        bool rewardClaimed;
    }

    struct DAOVote {
        bool hasVoted;
        bool vote; // true = YES (correct), false = NO (incorrect)
        uint256 tokenId;
    }

    struct PredictionStats {
        uint256 totalPredictions;
        uint256 activePredictions;
        uint256 resolvedPredictions;
        uint256 totalVolume;
    }

    mapping(uint256 => WorldPrediction) public predictions;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => mapping(address => DAOVote)) public daoVotes;
    mapping(uint256 => uint256) public daoYesVotes;
    mapping(uint256 => uint256) public daoNoVotes;
    mapping(address => uint256[]) public astrologerPredictions;
    mapping(address => uint256[]) public userVotes;
    
    address public astrologerManager;
    address public astroChartNFT;
    address public zodiacDAO;
    address public reputationScorer;
    
    uint256 public minAstrologerStake;
    uint256 public minVoterStake;
    uint256 public maxVoterStake;
    uint256 public daoVotingDuration;
    uint256 public astrologerRewardPercentage; // 500 = 5%
    uint256 public platformFeePercentage; // 200 = 2%
    
    PredictionStats public predictionStats;
    
    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed astrologer,
        string title,
        uint256 deadline,
        uint256 astrologerStake
    );

    event VoteCast(
        uint256 indexed predictionId,
        address indexed voter,
        bool vote,
        uint256 stakeAmount
    );

    event DAOVoteCast(
        uint256 indexed predictionId,
        address indexed daoMember,
        bool vote,
        uint256 tokenId
    );

    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome,
        uint256 totalStake,
        uint256 astrologerReward
    );

    event RewardClaimed(
        uint256 indexed predictionId,
        address indexed claimer,
        uint256 rewardAmount
    );

    event DAOVotingStarted(
        uint256 indexed predictionId,
        uint256 endTime
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _astrologerManager,
        address _astroChartNFT,
        address _zodiacDAO,
        address _reputationScorer,
        uint256 _minAstrologerStake,
        uint256 _minVoterStake,
        uint256 _maxVoterStake
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        astrologerManager = _astrologerManager;
        astroChartNFT = _astroChartNFT;
        zodiacDAO = _zodiacDAO;
        reputationScorer = _reputationScorer;
        minAstrologerStake = _minAstrologerStake;
        minVoterStake = _minVoterStake;
        maxVoterStake = _maxVoterStake;
        daoVotingDuration = 2 minutes; // Reduced for testing
        astrologerRewardPercentage = 500; // 5%
        platformFeePercentage = 200; // 2%
    }

    /**
     * @notice Create a world prediction by staking FLOW
     * @param _title The title of the prediction
     * @param _description The detailed description
     * @param _deadline The deadline for the prediction
     */
    function createPrediction(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external payable returns (uint256) {
        require(msg.value >= minAstrologerStake, "Insufficient astrologer stake");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        // Verify astrologer is registered
        if (astrologerManager != address(0)) {
            require(IAstrologerManager(astrologerManager).isAstrologerVerified(msg.sender), "Astrologer not verified");
        }

        _predictionIds.increment();
        uint256 predictionId = _predictionIds.current();

        predictions[predictionId] = WorldPrediction({
            id: predictionId,
            astrologer: msg.sender,
            astrologerId: IAstrologerManager(astrologerManager).getAstrologerId(msg.sender),
            title: _title,
            description: _description,
            deadline: _deadline,
            astrologerStake: msg.value,
            totalVoterStake: 0,
            yesVoterStake: 0,
            noVoterStake: 0,
            totalVoters: 0,
            isResolved: false,
            outcome: false,
            daoVotingActive: false,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        astrologerPredictions[msg.sender].push(predictionId);
        predictionStats.totalPredictions++;
        predictionStats.activePredictions++;

        emit PredictionCreated(predictionId, msg.sender, _title, _deadline, msg.value);
        return predictionId;
    }

    /**
     * @notice Vote on a prediction (requires AstroChart NFT)
     * @param _predictionId The prediction ID
     * @param _vote True for YES, false for NO
     */
    function voteOnPrediction(uint256 _predictionId, bool _vote) external payable {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        require(msg.value >= minVoterStake, "Insufficient voter stake");
        require(msg.value <= maxVoterStake, "Stake amount too high");
        
        WorldPrediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp < prediction.deadline, "Voting period ended");
        require(!votes[_predictionId][msg.sender].hasVoted, "Already voted");
        
        // Verify voter has minted AstroChart NFT
        require(hasAstroChartNFT(msg.sender), "Must own AstroChart NFT to vote");
        
        // Verify voter stake is >= astrologer stake
        require(msg.value >= prediction.astrologerStake, "Voter stake must be >= astrologer stake");

        votes[_predictionId][msg.sender] = Vote({
            hasVoted: true,
            vote: _vote,
            stakeAmount: msg.value,
            rewardClaimed: false
        });

        prediction.totalVoterStake += msg.value;
        prediction.totalVoters++;
        
        if (_vote) {
            prediction.yesVoterStake += msg.value;
        } else {
            prediction.noVoterStake += msg.value;
        }
        
        userVotes[msg.sender].push(_predictionId);
        predictionStats.totalVolume += msg.value;

        emit VoteCast(_predictionId, msg.sender, _vote, msg.value);
    }

    /**
     * @notice Start DAO voting after prediction deadline
     * @param _predictionId The prediction ID
     */
    function startDAOVoting(uint256 _predictionId) external {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        
        WorldPrediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(block.timestamp >= prediction.deadline, "Prediction deadline not reached");
        require(!prediction.daoVotingActive, "DAO voting already active");

        prediction.daoVotingActive = true;
        
        emit DAOVotingStarted(_predictionId, block.timestamp + daoVotingDuration);
    }

    /**
     * @notice DAO members vote on prediction outcome
     * @param _predictionId The prediction ID
     * @param _outcome True if prediction was correct, false if incorrect
     * @param _tokenId The DAO token ID for voting
     */
    function castDAOVote(uint256 _predictionId, bool _outcome, uint256 _tokenId) external {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        
        WorldPrediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(prediction.daoVotingActive, "DAO voting not active");
        require(!daoVotes[_predictionId][msg.sender].hasVoted, "Already voted");
        
        // Verify DAO membership by checking AstroChart NFT ownership
        require(hasAstroChartNFT(msg.sender), "Not a DAO member");

        daoVotes[_predictionId][msg.sender] = DAOVote({
            hasVoted: true,
            vote: _outcome,
            tokenId: _tokenId
        });

        if (_outcome) {
            daoYesVotes[_predictionId]++;
        } else {
            daoNoVotes[_predictionId]++;
        }

        emit DAOVoteCast(_predictionId, msg.sender, _outcome, _tokenId);
    }

    /**
     * @notice Resolve prediction based on DAO votes
     * @param _predictionId The prediction ID
     */
    function resolvePrediction(uint256 _predictionId) external {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        
        WorldPrediction storage prediction = predictions[_predictionId];
        require(!prediction.isResolved, "Prediction already resolved");
        require(prediction.daoVotingActive, "DAO voting not started");
        require(block.timestamp >= prediction.deadline + daoVotingDuration, "DAO voting period not ended");

        // Determine outcome based on DAO votes
        uint256 totalDAOVotes = daoYesVotes[_predictionId] + daoNoVotes[_predictionId];
        require(totalDAOVotes > 0, "No DAO votes cast");
        
        bool outcome = daoYesVotes[_predictionId] > daoNoVotes[_predictionId];
        
        prediction.isResolved = true;
        prediction.outcome = outcome;
        prediction.resolvedAt = block.timestamp;
        
        predictionStats.activePredictions--;
        predictionStats.resolvedPredictions++;

        // Calculate and distribute rewards
        uint256 astrologerReward = distributeRewards(_predictionId, outcome);
        
        // Update reputation
        updateAstrologerReputation(prediction.astrologer, prediction.astrologerId, outcome);

        emit PredictionResolved(_predictionId, outcome, prediction.totalVoterStake + prediction.astrologerStake, astrologerReward);
    }

    /**
     * @notice Claim rewards for correct predictions
     * @param _predictionId The prediction ID
     */
    function claimReward(uint256 _predictionId) external {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        
        WorldPrediction storage prediction = predictions[_predictionId];
        require(prediction.isResolved, "Prediction not resolved");
        
        Vote storage vote = votes[_predictionId][msg.sender];
        require(vote.hasVoted, "No vote found");
        require(!vote.rewardClaimed, "Reward already claimed");

        uint256 rewardAmount = calculateVoterReward(_predictionId, msg.sender);
        if (rewardAmount > 0) {
            vote.rewardClaimed = true;
            payable(msg.sender).transfer(rewardAmount);
            emit RewardClaimed(_predictionId, msg.sender, rewardAmount);
        }
    }

    /**
     * @notice Distribute rewards after prediction resolution
     */
    function distributeRewards(uint256 _predictionId, bool outcome) internal returns (uint256) {
        WorldPrediction storage prediction = predictions[_predictionId];
        
        uint256 totalPot = prediction.totalVoterStake + prediction.astrologerStake;
        uint256 platformFee = (totalPot * platformFeePercentage) / 10000;
        uint256 distributablePot = totalPot - platformFee;
        
        uint256 astrologerReward = 0;
        
        if (outcome) {
            // Astrologer was correct - gets 5% of total pot
            astrologerReward = (distributablePot * astrologerRewardPercentage) / 10000;
            payable(prediction.astrologer).transfer(astrologerReward);
        } else {
            // Astrologer was wrong - stake is redistributed to winning voters
            // Reputation will be penalized by updateAstrologerReputation
        }
        
        return astrologerReward;
    }

    /**
     * @notice Calculate voter reward amount
     */
    function calculateVoterReward(uint256 _predictionId, address _voter) public view returns (uint256) {
        WorldPrediction storage prediction = predictions[_predictionId];
        Vote storage vote = votes[_predictionId][_voter];
        
        if (!prediction.isResolved || !vote.hasVoted || vote.rewardClaimed) {
            return 0;
        }

        // Only winning voters get rewards
        if (vote.vote != prediction.outcome) {
            return 0;
        }

        uint256 totalPot = prediction.totalVoterStake + prediction.astrologerStake;
        uint256 platformFee = (totalPot * platformFeePercentage) / 10000;
        uint256 distributablePot = totalPot - platformFee;
        
        uint256 astrologerReward = 0;
        if (prediction.outcome) {
            astrologerReward = (distributablePot * astrologerRewardPercentage) / 10000;
        }
        
        uint256 voterRewardPool = distributablePot - astrologerReward;
        uint256 winningStake = prediction.outcome ? prediction.yesVoterStake : prediction.noVoterStake;
        
        if (winningStake > 0) {
            return (vote.stakeAmount * voterRewardPool) / winningStake;
        }
        
        return 0;
    }

    /**
     * @notice Update astrologer reputation based on prediction outcome
     */
    function updateAstrologerReputation(address _astrologer, uint256 _astrologerId, bool _wasCorrect) internal {
        if (reputationScorer != address(0)) {
            IReputationScorer(reputationScorer).updateReputationFromWorldPrediction(_astrologer, _wasCorrect);
        }
        
        if (astrologerManager != address(0) && _astrologerId > 0) {
            IAstrologerManager(astrologerManager).recordPredictionResult(_astrologerId, _wasCorrect);
        }
    }

    /**
     * @notice Check if user has AstroChart NFT
     */
    function hasAstroChartNFT(address _user) internal view returns (bool) {
        if (astroChartNFT == address(0)) return true; // For testing
        
        // Check if user has at least one AstroChart NFT
        try IERC721(astroChartNFT).balanceOf(_user) returns (uint256 balance) {
            return balance > 0;
        } catch {
            return false;
        }
    }

    /**
     * @notice Check if user is DAO member
     */
    function isDAOMember(address _user, uint256 _tokenId) internal view returns (bool) {
        if (zodiacDAO == address(0)) return msg.sender == owner(); // For testing, only owner can vote
        
        // Check if user owns the DAO token
        try IERC721(zodiacDAO).ownerOf(_tokenId) returns (address owner) {
            return owner == _user;
        } catch {
            return false;
        }
    }

    // View functions
    function getPrediction(uint256 _predictionId) external view returns (WorldPrediction memory) {
        require(_predictionId > 0 && _predictionId <= _predictionIds.current(), "Invalid prediction ID");
        return predictions[_predictionId];
    }

    function getVote(uint256 _predictionId, address _voter) external view returns (Vote memory) {
        return votes[_predictionId][_voter];
    }

    function getDAOVote(uint256 _predictionId, address _voter) external view returns (DAOVote memory) {
        return daoVotes[_predictionId][_voter];
    }

    function getAstrologerPredictions(address _astrologer) external view returns (uint256[] memory) {
        return astrologerPredictions[_astrologer];
    }

    function getUserVotes(address _user) external view returns (uint256[] memory) {
        return userVotes[_user];
    }

    function getActivePredictions() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](predictionStats.activePredictions);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _predictionIds.current(); i++) {
            if (!predictions[i].isResolved) {
                activeIds[count] = i;
                count++;
            }
        }
        
        return activeIds;
    }

    function getDAOVoteCounts(uint256 _predictionId) external view returns (uint256 yesVotes, uint256 noVotes) {
        return (daoYesVotes[_predictionId], daoNoVotes[_predictionId]);
    }

    // Admin functions
    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }

    function setAstroChartNFT(address _astroChartNFT) external onlyOwner {
        astroChartNFT = _astroChartNFT;
    }

    function setZodiacDAO(address _zodiacDAO) external onlyOwner {
        zodiacDAO = _zodiacDAO;
    }

    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }

    function setStakeLimits(uint256 _minAstrologerStake, uint256 _minVoterStake, uint256 _maxVoterStake) external onlyOwner {
        minAstrologerStake = _minAstrologerStake;
        minVoterStake = _minVoterStake;
        maxVoterStake = _maxVoterStake;
    }

    function setDAOVotingDuration(uint256 _duration) external onlyOwner {
        daoVotingDuration = _duration;
    }

    function setRewardPercentages(uint256 _astrologerRewardPercentage, uint256 _platformFeePercentage) external onlyOwner {
        require(_astrologerRewardPercentage + _platformFeePercentage <= 1000, "Total percentages cannot exceed 10%");
        astrologerRewardPercentage = _astrologerRewardPercentage;
        platformFeePercentage = _platformFeePercentage;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

// Interface for ERC721 (for NFT checks)
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
} 