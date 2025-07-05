// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract AstroChartNFT is 
    Initializable, 
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIds;
    
    struct BirthChart {
        string name;
        uint256 birthDate;
        uint256 birthTime;
        string birthLocation;
        string timezone;
        string chartData; // JSON string with planetary positions
        uint256 mintedAt;
        address owner;
    }

    mapping(uint256 => BirthChart) public birthCharts;
    mapping(address => uint256[]) public userCharts;
    
    uint256 public mintPrice;
    address public astrologerManager;
    
    event BirthChartMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        uint256 birthDate
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        uint256 _mintPrice,
        address _astrologerManager
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721URIStorage_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        mintPrice = _mintPrice;
        astrologerManager = _astrologerManager;
    }

    function mintBirthChart(
        string memory _name,
        uint256 _birthDate,
        uint256 _birthTime,
        string memory _birthLocation,
        string memory _timezone,
        string memory _chartData,
        string memory _tokenURI
    ) external payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_birthDate > 0, "Invalid birth date");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        birthCharts[newTokenId] = BirthChart({
            name: _name,
            birthDate: _birthDate,
            birthTime: _birthTime,
            birthLocation: _birthLocation,
            timezone: _timezone,
            chartData: _chartData,
            mintedAt: block.timestamp,
            owner: msg.sender
        });

        userCharts[msg.sender].push(newTokenId);

        emit BirthChartMinted(newTokenId, msg.sender, _name, _birthDate);
        return newTokenId;
    }

    function getUserCharts(address user) external view returns (uint256[] memory) {
        return userCharts[user];
    }

    function getBirthChart(uint256 tokenId) external view returns (BirthChart memory) {
        require(_exists(tokenId), "Token does not exist");
        return birthCharts[tokenId];
    }

    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
    }

    function setAstrologerManager(address _newManager) external onlyOwner {
        astrologerManager = _newManager;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 