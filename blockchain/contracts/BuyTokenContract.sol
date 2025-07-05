// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./AstroToken.sol";

contract BuyTokenContract is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    struct TokenInfo {
        address tokenContract;
        address astrologer;
        uint256 totalSupply;
        uint256 circulatingSupply;
        uint256 basePrice;
        uint256 credibilityMultiplier;
        bool isActive;
    }

    struct BondingCurve {
        uint256 k; // Bonding curve constant (very low for minimal supply impact)
        uint256 reserveRatio; // Reserve ratio (0-1000, where 1000 = 100%)
        uint256 slippageTolerance; // Slippage tolerance in basis points
        uint256 maxReputationMultiplier; // Maximum reputation multiplier (e.g., 5000 = 5.0x)
    }

    mapping(address => TokenInfo) public tokenInfos;
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userContributions;
    
    address public astrologerManager;
    address public predictionCredibilityManager;
    
    BondingCurve public bondingCurve;
    uint256 public platformFee; // Platform fee in basis points (100 = 1%)
    uint256 public totalVolume;
    
    // New variables must be added at the end for upgradeable contracts
    address public reputationScorer;
    
    event TokenBought(
        address indexed tokenContract,
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 price
    );

    event TokenSold(
        address indexed tokenContract,
        address indexed seller,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 price
    );

    event CredibilityUpdated(
        address indexed tokenContract,
        uint256 oldMultiplier,
        uint256 newMultiplier
    );

    event BondingCurveUpdated(
        uint256 k,
        uint256 reserveRatio,
        uint256 slippageTolerance,
        uint256 maxReputationMultiplier
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _astrologerManager,
        address _predictionCredibilityManager,
        uint256 _platformFee
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        astrologerManager = _astrologerManager;
        predictionCredibilityManager = _predictionCredibilityManager;
        platformFee = _platformFee;
        
        // Initialize bonding curve parameters
        bondingCurve = BondingCurve({
            k: 1000, // Very low constant for minimal supply impact (was 1M)
            reserveRatio: 500, // 50% reserve ratio
            slippageTolerance: 100, // 1% slippage tolerance
            maxReputationMultiplier: 5000 // 5.0x maximum reputation multiplier
        });
    }

    function registerToken(
        address _tokenContract,
        address _astrologer,
        uint256 _totalSupply,
        uint256 _basePrice
    ) external {
        require(msg.sender == owner(), "Only owner can register tokens");
        require(_tokenContract != address(0), "Invalid token contract");
        require(_astrologer != address(0), "Invalid astrologer address");
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(_basePrice > 0, "Base price must be greater than 0");

        tokenInfos[_tokenContract] = TokenInfo({
            tokenContract: _tokenContract,
            astrologer: _astrologer,
            totalSupply: _totalSupply,
            circulatingSupply: 0,
            basePrice: _basePrice,
            credibilityMultiplier: 1000, // 1.0x multiplier
            isActive: true
        });
    }

    function buyTokens(address _tokenContract) external payable returns (uint256) {
        TokenInfo storage tokenInfo = tokenInfos[_tokenContract];
        require(tokenInfo.isActive, "Token not active");
        require(msg.value > 0, "Must send ETH to buy tokens");

        uint256 currentPrice = getCurrentPrice(_tokenContract);
        uint256 tokenAmount = calculateBuyAmount(_tokenContract, msg.value);
        
        require(tokenAmount > 0, "Insufficient ETH for minimum token amount");
        require(
            tokenInfo.circulatingSupply + tokenAmount <= tokenInfo.totalSupply,
            "Would exceed total supply"
        );

        // Calculate fees
        uint256 platformFeeAmount = (msg.value * platformFee) / 10000;
        uint256 astrologerAmount = msg.value - platformFeeAmount;

        // Update state
        tokenInfo.circulatingSupply += tokenAmount;
        userBalances[_tokenContract] += tokenAmount;
        userContributions[msg.sender] += msg.value;
        totalVolume += msg.value;

        // Mint tokens to buyer
        AstroToken(_tokenContract).mint(msg.sender, tokenAmount);

        // Transfer ETH to astrologer
        if (astrologerAmount > 0) {
            payable(tokenInfo.astrologer).transfer(astrologerAmount);
        }

        emit TokenBought(_tokenContract, msg.sender, msg.value, tokenAmount, currentPrice);
        return tokenAmount;
    }

    function sellTokens(address _tokenContract, uint256 _tokenAmount) external returns (uint256) {
        TokenInfo storage tokenInfo = tokenInfos[_tokenContract];
        require(tokenInfo.isActive, "Token not active");
        require(_tokenAmount > 0, "Must sell positive amount");
        require(userBalances[_tokenContract] >= _tokenAmount, "Insufficient token balance");

        uint256 currentPrice = getCurrentPrice(_tokenContract);
        uint256 ethAmount = calculateSellAmount(_tokenContract, _tokenAmount);
        
        require(ethAmount > 0, "Insufficient tokens for minimum ETH amount");

        // Calculate fees
        uint256 platformFeeAmount = (ethAmount * platformFee) / 10000;
        uint256 sellerAmount = ethAmount - platformFeeAmount;

        // Update state
        tokenInfo.circulatingSupply -= _tokenAmount;
        userBalances[_tokenContract] -= _tokenAmount;
        totalVolume += ethAmount;

        // Burn tokens from seller
        AstroToken(_tokenContract).burnFrom(msg.sender, _tokenAmount);

        // Transfer ETH to seller
        if (sellerAmount > 0) {
            payable(msg.sender).transfer(sellerAmount);
        }

        emit TokenSold(_tokenContract, msg.sender, _tokenAmount, ethAmount, currentPrice);
        return ethAmount;
    }

    function updateCredibility(address _tokenContract, uint256 _newMultiplier) external {
        require(_tokenContract != address(0), "Invalid token contract");

        TokenInfo storage tokenInfo = tokenInfos[_tokenContract];
        require(tokenInfo.isActive, "Token not active");

        uint256 oldMultiplier = tokenInfo.credibilityMultiplier;
        tokenInfo.credibilityMultiplier = _newMultiplier;

        emit CredibilityUpdated(_tokenContract, oldMultiplier, _newMultiplier);
    }

    function getCurrentPrice(address _tokenContract) public view returns (uint256) {
        TokenInfo storage tokenInfo = tokenInfos[_tokenContract];
        if (!tokenInfo.isActive) return 0;

        // Very minimal supply impact: price = basePrice * (1 + tiny_supply_effect) * reputationMultiplier
        uint256 supplyRatio = (tokenInfo.circulatingSupply * 1e18) / tokenInfo.totalSupply;
        
        // Very small supply multiplier (k reduced from 1M to 1K for minimal impact)
        uint256 supplyMultiplier = 1e18 + (supplyRatio * bondingCurve.k) / 1000000; // Much smaller impact
        
        // Reputation is the main driver: credibilityMultiplier is in basis points (1000 = 1.0x)
        uint256 reputationMultiplier = tokenInfo.credibilityMultiplier;
        
        return (tokenInfo.basePrice * supplyMultiplier * reputationMultiplier) / (1e18 * 1000);
    }

    function calculateBuyAmount(address _tokenContract, uint256 _ethAmount) public view returns (uint256) {
        TokenInfo storage tokenInfo = tokenInfos[_tokenContract];
        if (!tokenInfo.isActive) return 0;

        uint256 currentPrice = getCurrentPrice(_tokenContract);
        uint256 tokenAmount = (_ethAmount * 1e18) / currentPrice;
        
        // Apply slippage tolerance
        uint256 slippage = (tokenAmount * bondingCurve.slippageTolerance) / 10000;
        return tokenAmount - slippage;
    }

    function calculateSellAmount(address _tokenContract, uint256 _tokenAmount) public view returns (uint256) {
        TokenInfo storage tokenInfo = tokenInfos[_tokenContract];
        if (!tokenInfo.isActive) return 0;

        uint256 currentPrice = getCurrentPrice(_tokenContract);
        uint256 ethAmount = (_tokenAmount * currentPrice) / 1e18;
        
        // Apply slippage tolerance
        uint256 slippage = (ethAmount * bondingCurve.slippageTolerance) / 10000;
        return ethAmount - slippage;
    }

    function getTokenInfo(address _tokenContract) external view returns (TokenInfo memory) {
        return tokenInfos[_tokenContract];
    }

    function getUserBalance(address _tokenContract) external view returns (uint256) {
        return userBalances[_tokenContract];
    }

    function getUserContribution(address _user) external view returns (uint256) {
        return userContributions[_user];
    }

    function setBondingCurve(
        uint256 _k,
        uint256 _reserveRatio,
        uint256 _slippageTolerance,
        uint256 _maxReputationMultiplier
    ) external onlyOwner {
        bondingCurve = BondingCurve({
            k: _k,
            reserveRatio: _reserveRatio,
            slippageTolerance: _slippageTolerance,
            maxReputationMultiplier: _maxReputationMultiplier
        });

        emit BondingCurveUpdated(_k, _reserveRatio, _slippageTolerance, _maxReputationMultiplier);
    }

    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        platformFee = _platformFee;
    }

    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }

    function setPredictionCredibilityManager(address _predictionCredibilityManager) external onlyOwner {
        predictionCredibilityManager = _predictionCredibilityManager;
    }

    function setReputationScorer(address _reputationScorer) external onlyOwner {
        reputationScorer = _reputationScorer;
    }

    function toggleTokenActive(address _tokenContract) external onlyOwner {
        require(_tokenContract != address(0), "Invalid token contract");
        tokenInfos[_tokenContract].isActive = !tokenInfos[_tokenContract].isActive;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 