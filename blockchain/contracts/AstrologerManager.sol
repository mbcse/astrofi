// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract AstrologerManager is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _astrologerIds;
    
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

    struct AstrologerStats {
        uint256 totalSessions;
        uint256 totalEarnings;
        uint256 averageRating;
        uint256 totalReviews;
    }

    mapping(uint256 => Astrologer) public astrologers;
    mapping(address => uint256) public walletToAstrologerId;
    mapping(uint256 => AstrologerStats) public astrologerStats;
    mapping(string => uint256[]) public specialtyToAstrologers;
    
    address public reputationScorer;
    address public predictionCredibilityManager;
    address public astroTokenLauncher;
    
    uint256 public verificationFee;
    uint256 public totalAstrologers;
    
    event AstrologerRegistered(
        uint256 indexed astrologerId,
        address indexed wallet,
        string name,
        string specialty
    );

    event AstrologerVerified(
        uint256 indexed astrologerId,
        address indexed wallet
    );

    event ReputationUpdated(
        uint256 indexed astrologerId,
        uint256 oldReputation,
        uint256 newReputation
    );

    event PredictionResult(
        uint256 indexed astrologerId,
        bool wasAccurate,
        uint256 newAccuracy
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _reputationScorer,
        address _predictionCredibilityManager,
        address _astroTokenLauncher,
        uint256 _verificationFee
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        reputationScorer = _reputationScorer;
        predictionCredibilityManager = _predictionCredibilityManager;
        astroTokenLauncher = _astroTokenLauncher;
        verificationFee = _verificationFee;
    }

    function registerAstrologer(
        string memory _name,
        string memory _description,
        string memory _specialty,
        uint256 _experience
    ) external payable returns (uint256) {
        require(msg.value >= verificationFee, "Insufficient verification fee");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_specialty).length > 0, "Specialty cannot be empty");
        require(walletToAstrologerId[msg.sender] == 0, "Already registered");

        _astrologerIds.increment();
        uint256 astrologerId = _astrologerIds.current();

        astrologers[astrologerId] = Astrologer({
            id: astrologerId,
            wallet: msg.sender,
            name: _name,
            description: _description,
            specialty: _specialty,
            experience: _experience,
            reputation: 0,
            totalPredictions: 0,
            accuratePredictions: 0,
            tokenContract: 0,
            isVerified: true,  // Auto-verify new astrologers for now
            isActive: true,
            registeredAt: block.timestamp,
            lastActive: block.timestamp
        });

        walletToAstrologerId[msg.sender] = astrologerId;
        specialtyToAstrologers[_specialty].push(astrologerId);
        totalAstrologers++;

        emit AstrologerRegistered(astrologerId, msg.sender, _name, _specialty);
        return astrologerId;
    }

    function verifyAstrologer(uint256 astrologerId) external onlyOwner {
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        require(!astrologers[astrologerId].isVerified, "Already verified");

        astrologers[astrologerId].isVerified = true;
        emit AstrologerVerified(astrologerId, astrologers[astrologerId].wallet);
    }

    function setTokenContract(uint256 astrologerId, uint256 tokenContract) external {
        require(msg.sender == astroTokenLauncher, "Only token launcher can set token contract");
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        
        astrologers[astrologerId].tokenContract = tokenContract;
    }

    function updateReputation(uint256 astrologerId, uint256 newReputation) external {
        require(msg.sender == reputationScorer, "Only reputation scorer can update reputation");
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        
        uint256 oldReputation = astrologers[astrologerId].reputation;
        astrologers[astrologerId].reputation = newReputation;
        
        emit ReputationUpdated(astrologerId, oldReputation, newReputation);
    }

    function recordPredictionResult(uint256 astrologerId, bool wasAccurate) external {
        // require(msg.sender == predictionCredibilityManager, "Only credibility manager can record results");
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        
        Astrologer storage astrologer = astrologers[astrologerId];
        astrologer.totalPredictions++;
        
        if (wasAccurate) {
            astrologer.accuratePredictions++;
        }
        
        uint256 newAccuracy = (astrologer.accuratePredictions * 100) / astrologer.totalPredictions;
        
        emit PredictionResult(astrologerId, wasAccurate, newAccuracy);
    }

    function updateAstrologerStats(
        uint256 astrologerId,
        uint256 sessions,
        uint256 earnings,
        uint256 rating,
        uint256 reviews
    ) external {
        require(msg.sender == owner() || msg.sender == reputationScorer, "Unauthorized");
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        
        AstrologerStats storage stats = astrologerStats[astrologerId];
        stats.totalSessions = sessions;
        stats.totalEarnings = earnings;
        stats.averageRating = rating;
        stats.totalReviews = reviews;
        
        astrologers[astrologerId].lastActive = block.timestamp;
    }

    function getAstrologer(uint256 astrologerId) external view returns (Astrologer memory) {
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        return astrologers[astrologerId];
    }

    function getAstrologerByWallet(address wallet) external view returns (Astrologer memory) {
        uint256 astrologerId = walletToAstrologerId[wallet];
        require(astrologerId > 0, "Astrologer not found");
        return astrologers[astrologerId];
    }

    function isAstrologerVerified(address wallet) external view returns (bool) {
        uint256 astrologerId = walletToAstrologerId[wallet];
        if (astrologerId == 0) return false;
        return astrologers[astrologerId].isVerified;
    }

    function getAstrologerId(address wallet) external view returns (uint256) {
        return walletToAstrologerId[wallet];
    }

    function getAstrologerStats(uint256 astrologerId) external view returns (AstrologerStats memory) {
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        return astrologerStats[astrologerId];
    }

    function getAstrologersBySpecialty(string memory specialty) external view returns (uint256[] memory) {
        return specialtyToAstrologers[specialty];
    }

    function getAllVerifiedAstrologers() external view returns (uint256[] memory) {
        uint256[] memory verifiedIds = new uint256[](totalAstrologers);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _astrologerIds.current(); i++) {
            if (astrologers[i].isVerified && astrologers[i].isActive) {
                verifiedIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = verifiedIds[i];
        }
        
        return result;
    }

    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }

    function setPredictionCredibilityManager(address _predictionCredibilityManager) external onlyOwner {
        predictionCredibilityManager = _predictionCredibilityManager;
    }

    function setAstroTokenLauncher(address _astroTokenLauncher) external onlyOwner {
        astroTokenLauncher = _astroTokenLauncher;
    }

    function setVerificationFee(uint256 _verificationFee) external onlyOwner {
        verificationFee = _verificationFee;
    }

    function toggleAstrologerActive(uint256 astrologerId) external onlyOwner {
        require(astrologerId > 0 && astrologerId <= _astrologerIds.current(), "Invalid astrologer ID");
        astrologers[astrologerId].isActive = !astrologers[astrologerId].isActive;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 