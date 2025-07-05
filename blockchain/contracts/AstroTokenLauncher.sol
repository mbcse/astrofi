// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./BuyTokenContract.sol";
import "./AstroToken.sol";
import "./AstroTokenFactory.sol";
import "./interfaces/IAstrologerManager.sol";

contract AstroTokenLauncher is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIds;
    
    struct TokenInfo {
        uint256 id;
        address astrologer;
        address tokenContract;
        address buyContract;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 initialPrice;
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => TokenInfo) public tokens;
    mapping(address => uint256) public astrologerToTokenId;
    mapping(address => uint256) public tokenContractToId;
    
    address public astrologerManager;
    address public tokenFactory;
    
    uint256 public launchFee;
    
    event TokenLaunched(
        uint256 indexed tokenId,
        address indexed astrologer,
        address tokenContract,
        address buyContract,
        string name,
        string symbol
    );

    event TokenDeactivated(
        uint256 indexed tokenId,
        address indexed astrologer
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _astrologerManager,
        address _tokenFactory,
        uint256 _launchFee
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        astrologerManager = _astrologerManager;
        tokenFactory = _tokenFactory;
        launchFee = _launchFee;
    }

    function launchToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _initialPrice,
        string memory _description
    ) external payable returns (uint256) {
        require(msg.value >= launchFee, "Insufficient launch fee");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(_initialPrice > 0, "Initial price must be greater than 0");
        require(astrologerToTokenId[msg.sender] == 0, "Astrologer already has a token");

        // Verify astrologer is registered and verified
        if (astrologerManager != address(0)) {
            require(IAstrologerManager(astrologerManager).isAstrologerVerified(msg.sender), "Astrologer not verified");
        }

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        // Deploy token and buy contract pair using factory
        (address tokenContract, address buyContract) = AstroTokenFactory(tokenFactory).deployTokenPair(
            _name,
            _symbol,
            _totalSupply,
            _initialPrice,
            msg.sender
        );

        tokens[tokenId] = TokenInfo({
            id: tokenId,
            astrologer: msg.sender,
            tokenContract: tokenContract,
            buyContract: buyContract,
            name: _name,
            symbol: _symbol,
            totalSupply: _totalSupply,
            initialPrice: _initialPrice,
            isActive: true,
            createdAt: block.timestamp
        });

        astrologerToTokenId[msg.sender] = tokenId;
        tokenContractToId[tokenContract] = tokenId;

        // Update astrologer manager with token contract
        if (astrologerManager != address(0)) {
            uint256 astrologerId = IAstrologerManager(astrologerManager).getAstrologerId(msg.sender);
            IAstrologerManager(astrologerManager).setTokenContract(astrologerId, tokenId);
        }

        emit TokenLaunched(tokenId, msg.sender, tokenContract, buyContract, _name, _symbol);
        return tokenId;
    }



    function deactivateToken(uint256 tokenId) external {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "Invalid token ID");
        require(tokens[tokenId].astrologer == msg.sender, "Not token owner");
        require(tokens[tokenId].isActive, "Token already deactivated");

        tokens[tokenId].isActive = false;
        emit TokenDeactivated(tokenId, msg.sender);
    }

    function getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "Invalid token ID");
        return tokens[tokenId];
    }

    function getTokenByAstrologer(address astrologer) external view returns (TokenInfo memory) {
        uint256 tokenId = astrologerToTokenId[astrologer];
        require(tokenId > 0, "Token not found");
        return tokens[tokenId];
    }

    function getTokenByContract(address tokenContract) external view returns (TokenInfo memory) {
        uint256 tokenId = tokenContractToId[tokenContract];
        require(tokenId > 0, "Token not found");
        return tokens[tokenId];
    }

    function getAllActiveTokens() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](_tokenIds.current());
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (tokens[i].isActive) {
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

    function setAstrologerManager(address _astrologerManager) external onlyOwner {
        astrologerManager = _astrologerManager;
    }

    function setTokenFactory(address _tokenFactory) external onlyOwner {
        tokenFactory = _tokenFactory;
    }

    function setLaunchFee(uint256 _launchFee) external onlyOwner {
        launchFee = _launchFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 