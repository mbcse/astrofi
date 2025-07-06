# 🌟 AstroFi Blockchain Contracts

A comprehensive suite of upgradable smart contracts for the AstroFi decentralized astrology platform.

## 📋 Contract Overview

### Core Contracts

1. **AstroChartNFT** - ERC721 NFT for user birth charts
2. **ZodiacDAO** - NFT membership for zodiac sign-specific DAOs
3. **AstrologerManager** - Registry of verified astrologers with reputation tracking
4. **AstroToken** - ERC20 token contract for astrologers
5. **AstroTokenFactory** - Factory contract for deploying token pairs
6. **AstroTokenLauncher** - Launches personal ERC20 tokens for astrologers
7. **BuyTokenContract** - Bonding curve-based token trading with credibility pricing
8. **PredictionCredibilityManager** - Updates astrologer scores based on predictions
9. **PredictionMarket** - Commit-reveal voting system for world predictions
10. **DailyPredictionStaking** - Rashi-based daily prediction stakes
11. **OneToOnePrediction** - User + astrologer prediction module with claim resolution
12. **TimedStakePool** - Configurable staking periods for compatibility betting
13. **ReputationScorer** - Aggregates results across prediction modules

## 🚀 Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

3. Configure private keys in `config/privateKeys.json`:
```json
{
  "payDeployer": "your_private_key_here"
}
```

### Deployment Steps

1. **Deploy all contracts:**
```bash
npx hardhat run scripts/deployAstroFiContracts.js --network <network_name>
```

2. **Set up contract dependencies:**
```bash
npx hardhat run scripts/setupAstroFiDependencies.js --network <network_name>
```

3. **Initialize Zodiac DAOs:**
```bash
npx hardhat run scripts/initializeZodiacDAOs.js --network <network_name>
```

## 🔧 Contract Architecture

### Dependency Flow

```
ReputationScorer (Central Hub)
├── AstrologerManager (Astrologer Registry)
├── BuyTokenContract (Token Trading)
├── PredictionCredibilityManager (Score Updates)
├── PredictionMarket (World Predictions)
├── DailyPredictionStaking (Daily Horoscopes)
├── OneToOnePrediction (Private Predictions)
└── TimedStakePool (Utility Staking)
```

### Key Features

#### 🔮 Prediction System
- **Commit-Reveal Voting**: Prevents front-running in prediction markets
- **Multi-Modal Predictions**: World events, daily horoscopes, and private consultations
- **Credibility Scoring**: Weighted accuracy tracking across all prediction types

#### 💎 Token Economics
- **Bonding Curve Pricing**: Token prices adjust based on supply and demand
- **Credibility Multipliers**: Astrologer reputation affects token pricing
- **Personal Tokens**: Each astrologer can launch their own ERC20 token

#### 🌟 Zodiac DAOs
- **12 Zodiac DAOs**: Specialized communities for each zodiac sign (Aries, Taurus, Gemini, etc.)
- **NFT Membership**: Exclusive access to zodiac-specific features
- **Treasury Management**: Each DAO has its own treasury for community funds

#### 📊 Reputation System
- **Multi-Factor Scoring**: Combines accuracy, volume, and consistency
- **Tier System**: Novice to Master Astrologer rankings
- **Decay Mechanism**: Reputation decreases over time without activity

## 📖 Contract Details

### AstroChartNFT
- **Purpose**: Mint birth chart NFTs with planetary data
- **Features**: 
  - Birth date, time, location storage
  - Chart data as JSON string
  - User ownership tracking
  - Configurable mint price

### AstroToken
- **Purpose**: ERC20 token for individual astrologers
- **Features**:
  - Standard ERC20 functionality with burnable extension
  - Minting and burning controlled by buy contract
  - Astrologer ownership and buy contract linking
  - Configurable total supply

### AstroTokenFactory
- **Purpose**: Factory contract for deploying token pairs
- **Features**:
  - Clones pattern for gas-efficient deployment
  - Deploys both token and buy contract simultaneously
  - Automatic linking between token and buy contract
  - Configurable implementations

### ZodiacDAO
- **Purpose**: NFT membership for zodiac communities
- **Features**:
  - 12 zodiac DAOs (Aries through Pisces)
  - Configurable membership prices
  - Treasury management
  - Reputation tracking

### AstrologerManager
- **Purpose**: Central registry for verified astrologers
- **Features**:
  - Registration and verification system
  - Reputation and accuracy tracking
  - Token contract linking
  - Specialty categorization

### BuyTokenContract
- **Purpose**: Bonding curve trading for astrologer tokens
- **Features**:
  - Dynamic pricing based on supply
  - Credibility-based multipliers
  - Slippage protection
  - Platform fee collection

### PredictionMarket
- **Purpose**: Decentralized prediction markets
- **Features**:
  - Commit-reveal voting mechanism
  - Multiple prediction categories
  - Stake-based rewards
  - Outcome resolution

### DailyPredictionStaking
- **Purpose**: Daily horoscope predictions
- **Features**:
  - Rashi-based predictions
  - Positive/negative staking
  - Daily resolution
  - Reward distribution

### OneToOnePrediction
- **Purpose**: Private astrologer consultations
- **Features**:
  - User-astrologer matching
  - Evidence-based claims
  - Dispute resolution
  - Stake-based outcomes

### TimedStakePool
- **Purpose**: Configurable staking periods
- **Features**:
  - Flexible duration settings
  - Winner selection
  - Pool management
  - Reward distribution

### ReputationScorer
- **Purpose**: Central reputation aggregation
- **Features**:
  - Multi-module scoring
  - Weighted accuracy calculation
  - Tier-based rankings
  - Decay mechanisms

## 🔒 Security Features

- **Upgradable Contracts**: All contracts use OpenZeppelin's UUPS pattern
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Comprehensive parameter checking
- **Reentrancy Protection**: Safe external calls
- **Emergency Functions**: Withdrawal and pause capabilities

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run coverage
```

## 📝 Verification

Verify contracts on block explorer:
```bash
npx hardhat verify --network <network_name> <contract_address> <constructor_args>
```

## 🔄 Upgrade Process

1. Deploy new implementation:
```bash
npx hardhat run scripts/upgradeContractScript.js --network <network_name>
```

2. Verify upgrade:
```bash
npx hardhat run scripts/verifyUpgrade.js --network <network_name>
```

## 📊 Gas Optimization

- **Efficient Storage**: Packed structs and optimized mappings
- **Batch Operations**: Multi-call functions for bulk operations
- **Event Optimization**: Minimal event data for cost efficiency
- **Loop Optimization**: Bounded loops and efficient iteration

## 🌐 Network Support

- **Ethereum Mainnet**
- **Polygon**
- **Optimism**
- **Arbitrum**
- **Testnets**: Sepolia, Mumbai, Goerli

## 📞 Support

For technical support or questions about the contracts, please refer to the documentation or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 