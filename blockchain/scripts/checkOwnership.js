const { artifacts, ethers, upgrades } = require('hardhat')
const getNamedSigners = require('../utils/getNamedSigners')
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
  console.log(`Checking ownership of contracts on ${deployHelpers.CHAIN_NAME} (Chain ID: ${deployHelpers.chainId})`);
  console.log(`Deployer address: ${deployHelpers.payDeployer.address}`);

  // List of upgradeable contracts to check
  const upgradeableContracts = [
    'ReputationScorer',
    'AstrologerManager', 
    'BuyTokenContract',
    'PredictionCredibilityManager',
    'AstroTokenLauncher',
    'PredictionMarket',
    'WorldPredictionMarket',
    'DailyPredictionStaking',
    'OneToOnePrediction',
    'TimedStakePool',
    'ZodiacDAO',
    'AstroChartNFT'
  ];

  // Non-upgradeable contracts to check
  const nonUpgradeableContracts = [
    'AstroTokenFactory'
  ];

  console.log("\n📋 Checking upgradeable contracts ownership...");
  
  for (const contractName of upgradeableContracts) {
    try {
      const contractAddress = readFromConfig(contractName, 'ADDRESS', deployHelpers.chainId);
      console.log(`\n${contractName}: ${contractAddress}`);
      
      const contract = await ethers.getContractAt(contractName, contractAddress);
      const owner = await contract.owner();
      
      console.log(`  Owner: ${owner}`);
      console.log(`  Deployer: ${deployHelpers.payDeployer.address}`);
      console.log(`  Is deployer owner?: ${owner.toLowerCase() === deployHelpers.payDeployer.address.toLowerCase()}`);
      
      // If deployer is not the owner, try to transfer ownership
      if (owner.toLowerCase() !== deployHelpers.payDeployer.address.toLowerCase()) {
        console.log(`  ⚠️  Deployer is not the owner!`);
        
        // Check if current owner is the deployer (maybe different case)
        const currentSigner = await ethers.getSigner();
        if (currentSigner.address.toLowerCase() === owner.toLowerCase()) {
          console.log(`  🔄 Current signer is the owner, transferring to deployer...`);
          await contract.transferOwnership(deployHelpers.payDeployer.address);
          console.log(`  ✅ Ownership transferred!`);
        } else {
          console.log(`  ❌ Cannot transfer ownership - current signer is not the owner`);
        }
      } else {
        console.log(`  ✅ Deployer is the owner`);
      }
    } catch (error) {
      console.log(`  ❌ Error checking ${contractName}: ${error.message}`);
    }
  }

  console.log("\n📋 Checking non-upgradeable contracts ownership...");
  
  for (const contractName of nonUpgradeableContracts) {
    try {
      const contractAddress = readFromConfig(contractName, 'ADDRESS', deployHelpers.chainId);
      console.log(`\n${contractName}: ${contractAddress}`);
      
      const contract = await ethers.getContractAt(contractName, contractAddress);
      const owner = await contract.owner();
      
      console.log(`  Owner: ${owner}`);
      console.log(`  Deployer: ${deployHelpers.payDeployer.address}`);
      console.log(`  Is deployer owner?: ${owner.toLowerCase() === deployHelpers.payDeployer.address.toLowerCase()}`);
      
      // If deployer is not the owner, try to transfer ownership
      if (owner.toLowerCase() !== deployHelpers.payDeployer.address.toLowerCase()) {
        console.log(`  ⚠️  Deployer is not the owner!`);
        
        // Check if current owner is the deployer (maybe different case)
        const currentSigner = await ethers.getSigner();
        if (currentSigner.address.toLowerCase() === owner.toLowerCase()) {
          console.log(`  🔄 Current signer is the owner, transferring to deployer...`);
          await contract.transferOwnership(deployHelpers.payDeployer.address);
          console.log(`  ✅ Ownership transferred!`);
        } else {
          console.log(`  ❌ Cannot transfer ownership - current signer is not the owner`);
        }
      } else {
        console.log(`  ✅ Deployer is the owner`);
      }
    } catch (error) {
      console.log(`  ❌ Error checking ${contractName}: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 