const { artifacts, ethers, upgrades } = require('hardhat')
const getNamedSigners = require('../utils/getNamedSigners')
const saveToConfig = require('../utils/saveToConfig')
const readFromConfig = require('../utils/readFromConfig')
const deploySettings = require('./deploySettings')
const { getChain } = require('../utils/chainsHelper')
const deployUpgradableContract = require('../utils/deployUpgradableContract')
const deployContract = require('../utils/deployContract')

const getDeployHelpers = async () => {
  const chainId = await hre.getChainId()
  const CHAIN_NAME = getChain(chainId).name
  const {payDeployer} =  await getNamedSigners();
  return {chainId, CHAIN_NAME, payDeployer}
}

async function main () {
  const deployHelpers = await getDeployHelpers();
  console.log(`Deploying AstroFi contracts to ${deployHelpers.CHAIN_NAME} (Chain ID: ${deployHelpers.chainId})`);

  // Deploy contracts in dependency order
  console.log("\n1. Deploying ReputationScorer...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "ReputationScorer", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // astrologerManager (will be set later)
      ethers.constants.AddressZero, // buyTokenContract (will be set later)
      ethers.constants.AddressZero, // planetDAO (will be set later)
      5, // minPredictionsForScore
      86400 // scoreUpdateDelay (1 day in seconds)
    ]
  );

  console.log("\n2. Deploying AstrologerManager...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "AstrologerManager", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.constants.AddressZero, // predictionCredibilityManager (will be set later)
      ethers.constants.AddressZero, // astroTokenLauncher (will be set later)
      ethers.utils.parseEther("0.01") // verificationFee
    ]
  );

  console.log("\n3. Deploying BuyTokenContract...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "BuyTokenContract", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // astrologerManager (will be set later)
      ethers.constants.AddressZero, // predictionCredibilityManager (will be set later)
      100 // platformFee (1%)
    ]
  );

  console.log("\n4. Deploying PredictionCredibilityManager...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "PredictionCredibilityManager", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // astrologerManager (will be set later)
      ethers.constants.AddressZero, // buyTokenContract (will be set later)
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.constants.AddressZero, // astroTokenLauncher (will be set later)
      ethers.utils.parseEther("0.001"), // minStakeAmount
      ethers.utils.parseEther("1") // maxStakeAmount
    ]
  );

  console.log("\n5. Deploying AstroToken template...");
  const astroTokenTemplateAddress = await deployContract(
    hre,
    deployHelpers.chainId,
    "AstroToken",
    deployHelpers.payDeployer,
    [] // No constructor parameters for template
  );

  console.log("\n6. Deploying BuyTokenContract template...");
  // Deploy template manually to avoid overriding main contract's address
  const BuyTokenContractFactory = await ethers.getContractFactory("BuyTokenContract");
  const buyTokenContractTemplate = await BuyTokenContractFactory.deploy();
  await buyTokenContractTemplate.deployed();
  const buyTokenContractTemplateAddress = buyTokenContractTemplate.address;
  
  // Save template address with a different key
  await saveToConfig("BuyTokenContractTemplate", 'ADDRESS', buyTokenContractTemplateAddress, deployHelpers.chainId);
  console.log("BuyTokenContract template deployed to:", buyTokenContractTemplateAddress);

  console.log("\n7. Deploying AstroTokenFactory...");
  const astroTokenFactoryAddress = await deployContract(
    hre,
    deployHelpers.chainId,
    "AstroTokenFactory",
    deployHelpers.payDeployer,
    [
      astroTokenTemplateAddress,
      buyTokenContractTemplateAddress,
      ethers.constants.AddressZero // astrologerManager (will be set later)
    ]
  );

  console.log("\n8. Deploying AstroTokenLauncher...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "AstroTokenLauncher", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // astrologerManager (will be set later)
      astroTokenFactoryAddress, // tokenFactory
      ethers.utils.parseEther("0.1") // launchFee
    ]
  );

  console.log("\n9. Deploying PredictionMarket...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "PredictionMarket", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // predictionCredibilityManager (will be set later)
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.utils.parseEther("0.01"), // minStakeAmount
      ethers.utils.parseEther("1") // maxStakeAmount
    ]
  );

  console.log("\n10. Deploying WorldPredictionMarket...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "WorldPredictionMarket", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // astrologerManager (will be set later)
      ethers.constants.AddressZero, // astroChartNFT (will be set later)
      ethers.constants.AddressZero, // zodiacDAO (will be set later)
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.utils.parseEther("1"), // minAstrologerStake (1 FLOW)
      ethers.utils.parseEther("1"), // minVoterStake (1 FLOW)
      ethers.utils.parseEther("10") // maxVoterStake (10 FLOW)
    ]
  );

  console.log("\n11. Deploying DailyPredictionStaking...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "DailyPredictionStaking", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // predictionCredibilityManager (will be set later)
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.utils.parseEther("0.001"), // minStakeAmount
      ethers.utils.parseEther("0.1"), // maxStakeAmount
      ethers.utils.parseEther("0.01") // dailyPredictionFee
    ]
  );

  console.log("\n12. Deploying OneToOnePrediction...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "OneToOnePrediction", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // predictionCredibilityManager (will be set later)
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.constants.AddressZero, // astrologerManager (will be set later)
      ethers.utils.parseEther("0.01"), // minStakeAmount
      ethers.utils.parseEther("1") // maxStakeAmount
    ]
  );

  console.log("\n13. Deploying TimedStakePool...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "TimedStakePool", 
    deployHelpers.payDeployer, 
    [
      ethers.constants.AddressZero, // reputationScorer (will be set later)
      ethers.utils.parseEther("0.01"), // minStakeAmount
      ethers.utils.parseEther("1"), // maxStakeAmount
      86400, // minDuration (1 day in seconds)
      31536000, // maxDuration (365 days in seconds)
      ethers.utils.parseEther("0.01") // poolCreationFee
    ]
  );

  console.log("\n14. Deploying ZodiacDAO...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "ZodiacDAO", 
    deployHelpers.payDeployer, 
    [
      "Zodiac DAO Membership", // name
      "ZODIAC" // symbol
    ]
  );

  console.log("\n15. Deploying AstroChartNFT...");
  await deployUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "AstroChartNFT", 
    deployHelpers.payDeployer, 
    [
      "AstroFi Birth Chart NFT", // name
      "ASTROCHART", // symbol
      ethers.utils.parseEther("0.05"), // mintPrice
      ethers.constants.AddressZero // astrologerManager (will be set later)
    ]
  );

  console.log("\n✅ All AstroFi contracts deployed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Set up contract dependencies using the setter functions");
  console.log("2. Verify contracts on block explorer");
  console.log("3. Initialize prediction modules in ReputationScorer");
  console.log("4. Create initial Planet DAOs");
  console.log("5. Test contract interactions");
};

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 