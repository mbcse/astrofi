const { artifacts, ethers, upgrades } = require('hardhat')
const getNamedSigners = require('../utils/getNamedSigners')
const saveToConfig = require('../utils/saveToConfig')
const readFromConfig = require('../utils/readFromConfig')
const { getChain } = require('../utils/chainsHelper')

const getDeployHelpers = async () => {
  const chainId = await hre.getChainId()
  const CHAIN_NAME = getChain(chainId).name
  const {payDeployer} =  await getNamedSigners();
  return {chainId, CHAIN_NAME, payDeployer}
}

async function main () {
  const deployHelpers = await getDeployHelpers();
  console.log(`Setting up AstroFi contract dependencies on ${deployHelpers.CHAIN_NAME} (Chain ID: ${deployHelpers.chainId})`);

  // Get deployed contract addresses
  const reputationScorerAddress = readFromConfig('ReputationScorer', 'ADDRESS', deployHelpers.chainId);
  const astrologerManagerAddress = readFromConfig('AstrologerManager', 'ADDRESS', deployHelpers.chainId);
  const buyTokenContractAddress = readFromConfig('BuyTokenContract', 'ADDRESS', deployHelpers.chainId);
  const predictionCredibilityManagerAddress = readFromConfig('PredictionCredibilityManager', 'ADDRESS', deployHelpers.chainId);
  const astroTokenLauncherAddress = readFromConfig('AstroTokenLauncher', 'ADDRESS', deployHelpers.chainId);
  const astroTokenFactoryAddress = readFromConfig('AstroTokenFactory', 'ADDRESS', deployHelpers.chainId);
  const predictionMarketAddress = readFromConfig('PredictionMarket', 'ADDRESS', deployHelpers.chainId);
  const worldPredictionMarketAddress = readFromConfig('WorldPredictionMarket', 'ADDRESS', deployHelpers.chainId);
  const dailyPredictionStakingAddress = readFromConfig('DailyPredictionStaking', 'ADDRESS', deployHelpers.chainId);
  const oneToOnePredictionAddress = readFromConfig('OneToOnePrediction', 'ADDRESS', deployHelpers.chainId);
  const timedStakePoolAddress = readFromConfig('TimedStakePool', 'ADDRESS', deployHelpers.chainId);
  const zodiacDAOAddress = readFromConfig('ZodiacDAO', 'ADDRESS', deployHelpers.chainId);
  const astroChartNFTAddress = readFromConfig('AstroChartNFT', 'ADDRESS', deployHelpers.chainId);

  console.log("\n📋 Setting up contract dependencies...");

  // 1. Set up ReputationScorer dependencies
  console.log("\n1. Setting up ReputationScorer dependencies...");
  const reputationScorer = await ethers.getContractAt('ReputationScorer', reputationScorerAddress);
  
  await reputationScorer.setAstrologerManager(astrologerManagerAddress);
  await reputationScorer.setBuyTokenContract(buyTokenContractAddress);
  await reputationScorer.setZodiacDAO(zodiacDAOAddress);
  await reputationScorer.setAstroTokenLauncher(astroTokenLauncherAddress);
  await reputationScorer.setWorldPredictionMarket(worldPredictionMarketAddress);
  
  // Add prediction modules
  await reputationScorer.addPredictionModule(predictionMarketAddress, 3); // Market predictions weight: 3
  await reputationScorer.addPredictionModule(worldPredictionMarketAddress, 5); // World predictions weight: 5 (highest)
  await reputationScorer.addPredictionModule(dailyPredictionStakingAddress, 2); // Daily predictions weight: 2
  await reputationScorer.addPredictionModule(oneToOnePredictionAddress, 4); // One-to-one predictions weight: 4

  // 2. Set up AstrologerManager dependencies
  console.log("\n2. Setting up AstrologerManager dependencies...");
  const astrologerManager = await ethers.getContractAt('AstrologerManager', astrologerManagerAddress);
  
  await astrologerManager.setReputationScorer(reputationScorerAddress);
  await astrologerManager.setPredictionCredibilityManager(predictionCredibilityManagerAddress);
  await astrologerManager.setAstroTokenLauncher(astroTokenLauncherAddress);

  // 3. Set up BuyTokenContract dependencies
  console.log("\n3. Setting up BuyTokenContract dependencies...");
  const buyTokenContract = await ethers.getContractAt('BuyTokenContract', buyTokenContractAddress);
  
  await buyTokenContract.setAstrologerManager(astrologerManagerAddress);
  await buyTokenContract.setPredictionCredibilityManager(predictionCredibilityManagerAddress);
  await buyTokenContract.setReputationScorer(reputationScorerAddress);

  // 4. Set up PredictionCredibilityManager dependencies
  console.log("\n4. Setting up PredictionCredibilityManager dependencies...");
  const predictionCredibilityManager = await ethers.getContractAt('PredictionCredibilityManager', predictionCredibilityManagerAddress);
  
  await predictionCredibilityManager.setAstrologerManager(astrologerManagerAddress);
  await predictionCredibilityManager.setBuyTokenContract(buyTokenContractAddress);
  await predictionCredibilityManager.setReputationScorer(reputationScorerAddress);
  await predictionCredibilityManager.setAstroTokenLauncher(astroTokenLauncherAddress);

  // 5. Set up AstroTokenFactory dependencies
  console.log("\n5. Setting up AstroTokenFactory dependencies...");
  const astroTokenFactory = await ethers.getContractAt('AstroTokenFactory', astroTokenFactoryAddress);
  
  await astroTokenFactory.setAstrologerManager(astrologerManagerAddress);
  await astroTokenFactory.setReputationScorer(reputationScorerAddress);

  // 6. Set up AstroTokenLauncher dependencies
  console.log("\n6. Setting up AstroTokenLauncher dependencies...");
  const astroTokenLauncher = await ethers.getContractAt('AstroTokenLauncher', astroTokenLauncherAddress);
  
  await astroTokenLauncher.setAstrologerManager(astrologerManagerAddress);
  await astroTokenLauncher.setTokenFactory(astroTokenFactoryAddress);

  // 7. Set up PredictionMarket dependencies
  console.log("\n7. Setting up PredictionMarket dependencies...");
  const predictionMarket = await ethers.getContractAt('PredictionMarket', predictionMarketAddress);
  
  await predictionMarket.setPredictionCredibilityManager(predictionCredibilityManagerAddress);
  await predictionMarket.setReputationScorer(reputationScorerAddress);

  // 8. Set up WorldPredictionMarket dependencies
  console.log("\n8. Setting up WorldPredictionMarket dependencies...");
  const worldPredictionMarket = await ethers.getContractAt('WorldPredictionMarket', worldPredictionMarketAddress);
  
  await worldPredictionMarket.setAstrologerManager(astrologerManagerAddress);
  await worldPredictionMarket.setAstroChartNFT(astroChartNFTAddress);
  await worldPredictionMarket.setZodiacDAO(zodiacDAOAddress);
  await worldPredictionMarket.setReputationScorer(reputationScorerAddress);

  // 9. Set up DailyPredictionStaking dependencies
  console.log("\n9. Setting up DailyPredictionStaking dependencies...");
  const dailyPredictionStaking = await ethers.getContractAt('DailyPredictionStaking', dailyPredictionStakingAddress);
  
  await dailyPredictionStaking.setPredictionCredibilityManager(predictionCredibilityManagerAddress);
  await dailyPredictionStaking.setReputationScorer(reputationScorerAddress);

  // 10. Set up OneToOnePrediction dependencies
  console.log("\n10. Setting up OneToOnePrediction dependencies...");
  const oneToOnePrediction = await ethers.getContractAt('OneToOnePrediction', oneToOnePredictionAddress);
  
  await oneToOnePrediction.setPredictionCredibilityManager(predictionCredibilityManagerAddress);
  await oneToOnePrediction.setReputationScorer(reputationScorerAddress);
  await oneToOnePrediction.setAstrologerManager(astrologerManagerAddress);

  // 11. Set up TimedStakePool dependencies
  console.log("\n11. Setting up TimedStakePool dependencies...");
  const timedStakePool = await ethers.getContractAt('TimedStakePool', timedStakePoolAddress);
  
  await timedStakePool.setReputationScorer(reputationScorerAddress);

  // 12. Set up AstroChartNFT dependencies
  console.log("\n12. Setting up AstroChartNFT dependencies...");
  const astroChartNFT = await ethers.getContractAt('AstroChartNFT', astroChartNFTAddress);
  
  await astroChartNFT.setAstrologerManager(astrologerManagerAddress);

  console.log("\n✅ All contract dependencies set up successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log(`ReputationScorer: ${reputationScorerAddress}`);
  console.log(`AstrologerManager: ${astrologerManagerAddress}`);
  console.log(`BuyTokenContract: ${buyTokenContractAddress}`);
  console.log(`PredictionCredibilityManager: ${predictionCredibilityManagerAddress}`);
  console.log(`AstroTokenFactory: ${astroTokenFactoryAddress}`);
  console.log(`AstroTokenLauncher: ${astroTokenLauncherAddress}`);
  console.log(`PredictionMarket: ${predictionMarketAddress}`);
  console.log(`WorldPredictionMarket: ${worldPredictionMarketAddress}`);
  console.log(`DailyPredictionStaking: ${dailyPredictionStakingAddress}`);
  console.log(`OneToOnePrediction: ${oneToOnePredictionAddress}`);
  console.log(`TimedStakePool: ${timedStakePoolAddress}`);
  console.log(`ZodiacDAO: ${zodiacDAOAddress}`);
  console.log(`AstroChartNFT: ${astroChartNFTAddress}`);
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 