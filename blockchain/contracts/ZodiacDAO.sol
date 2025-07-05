// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract ZodiacDAO is 
    Initializable, 
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIds;
    
    enum ZodiacSign {
        ARIES,        // 0
        TAURUS,       // 1
        GEMINI,       // 2
        CANCER,       // 3
        LEO,          // 4
        VIRGO,        // 5
        LIBRA,        // 6
        SCORPIO,      // 7
        SAGITTARIUS,  // 8
        CAPRICORN,    // 9
        AQUARIUS,     // 10
        PISCES        // 11
    }

    struct ZodiacDAOInfo {
        ZodiacSign zodiacSign;
        string name;
        string description;
        uint256 membershipPrice;
        uint256 maxMembers;
        uint256 currentMembers;
        bool isActive;
        address treasury;
    }

    struct Membership {
        uint256 tokenId;
        ZodiacSign zodiacSign;
        uint256 joinedAt;
        uint256 reputation;
        bool isActive;
    }

    mapping(uint256 => ZodiacDAOInfo) public zodiacDAOs;
    mapping(uint256 => Membership) public memberships;
    mapping(address => uint256[]) public userMemberships;
    mapping(ZodiacSign => uint256) public zodiacToDAOId;
    
    uint256 public totalDAOs;
    
    event ZodiacDAOCreated(
        uint256 indexed daoId,
        ZodiacSign zodiacSign,
        string name,
        uint256 membershipPrice
    );

    event MemberJoined(
        uint256 indexed daoId,
        uint256 indexed tokenId,
        address indexed member,
        ZodiacSign zodiacSign
    );

    event MemberLeft(
        uint256 indexed daoId,
        uint256 indexed tokenId,
        address indexed member
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721URIStorage_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function createZodiacDAO(
        ZodiacSign _zodiacSign,
        string memory _name,
        string memory _description,
        uint256 _membershipPrice,
        uint256 _maxMembers,
        address _treasury
    ) external onlyOwner returns (uint256) {
        require(_maxMembers > 0, "Max members must be greater than 0");
        require(zodiacToDAOId[_zodiacSign] == 0, "DAO already exists for this zodiac sign");
        require(bytes(_name).length > 0, "Name cannot be empty");

        totalDAOs++;
        uint256 daoId = totalDAOs;

        zodiacDAOs[daoId] = ZodiacDAOInfo({
            zodiacSign: _zodiacSign,
            name: _name,
            description: _description,
            membershipPrice: _membershipPrice,
            maxMembers: _maxMembers,
            currentMembers: 0,
            isActive: true,
            treasury: _treasury
        });

        zodiacToDAOId[_zodiacSign] = daoId;

        emit ZodiacDAOCreated(daoId, _zodiacSign, _name, _membershipPrice);
        return daoId;
    }

    function joinZodiacDAO(ZodiacSign _zodiacSign, string memory _tokenURI) external payable returns (uint256) {
        uint256 daoId = zodiacToDAOId[_zodiacSign];
        require(daoId > 0, "DAO does not exist for this zodiac sign");
        
        ZodiacDAOInfo storage dao = zodiacDAOs[daoId];
        require(dao.isActive, "DAO is not active");
        require(dao.currentMembers < dao.maxMembers, "DAO is full");
        require(msg.value >= dao.membershipPrice, "Insufficient payment");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        dao.currentMembers++;

        memberships[newTokenId] = Membership({
            tokenId: newTokenId,
            zodiacSign: _zodiacSign,
            joinedAt: block.timestamp,
            reputation: 0,
            isActive: true
        });

        userMemberships[msg.sender].push(newTokenId);

        // Transfer payment to treasury
        if (dao.treasury != address(0)) {
            payable(dao.treasury).transfer(msg.value);
        }

        emit MemberJoined(daoId, newTokenId, msg.sender, _zodiacSign);
        return newTokenId;
    }

    function leaveZodiacDAO(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        Membership storage membership = memberships[tokenId];
        require(membership.isActive, "Membership not active");

        uint256 daoId = zodiacToDAOId[membership.zodiacSign];
        ZodiacDAOInfo storage dao = zodiacDAOs[daoId];

        membership.isActive = false;
        dao.currentMembers--;

        _burn(tokenId);

        emit MemberLeft(daoId, tokenId, msg.sender);
    }

    function updateReputation(uint256 tokenId, uint256 newReputation) external {
        // Only reputation manager can call this
        require(msg.sender == owner(), "Only owner can update reputation");
        require(_exists(tokenId), "Token does not exist");

        memberships[tokenId].reputation = newReputation;
    }

    function getUserMemberships(address user) external view returns (uint256[] memory) {
        return userMemberships[user];
    }

    function getMembership(uint256 tokenId) external view returns (Membership memory) {
        require(_exists(tokenId), "Token does not exist");
        return memberships[tokenId];
    }

    function getZodiacDAO(uint256 daoId) external view returns (ZodiacDAOInfo memory) {
        require(daoId > 0 && daoId <= totalDAOs, "Invalid DAO ID");
        return zodiacDAOs[daoId];
    }

    function getDAOByZodiac(ZodiacSign _zodiacSign) external view returns (ZodiacDAOInfo memory) {
        uint256 daoId = zodiacToDAOId[_zodiacSign];
        require(daoId > 0, "DAO does not exist for this zodiac sign");
        return zodiacDAOs[daoId];
    }

    function setDAOTreasury(uint256 daoId, address _treasury) external onlyOwner {
        require(daoId > 0 && daoId <= totalDAOs, "Invalid DAO ID");
        zodiacDAOs[daoId].treasury = _treasury;
    }

    function setDAOMembershipPrice(uint256 daoId, uint256 _newPrice) external onlyOwner {
        require(daoId > 0 && daoId <= totalDAOs, "Invalid DAO ID");
        zodiacDAOs[daoId].membershipPrice = _newPrice;
    }

    function toggleDAOActive(uint256 daoId) external onlyOwner {
        require(daoId > 0 && daoId <= totalDAOs, "Invalid DAO ID");
        zodiacDAOs[daoId].isActive = !zodiacDAOs[daoId].isActive;
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