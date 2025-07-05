const { artifacts, ethers, upgrades } = require('hardhat')
const getNamedSigners = require('../utils/getNamedSigners')
const saveToConfig = require('../utils/saveToConfig')
const readFromConfig = require('../utils/readFromConfig')
const deploySettings = require('./deploySettings')
const deployContract = require('../utils/deployContract')
const { getChain } = require('../utils/chainsHelper')
const deployUpgradableContract = require('../utils/deployUpgradableContract')
const upgradeUpgradableContract = require('../utils/upgradeUpgradableContract')

const getDeployHelpers = async () => {
  const chainId = await hre.getChainId()
  const CHAIN_NAME = getChain(chainId).name
  const {payDeployer} =  await getNamedSigners();
  return {chainId, CHAIN_NAME, payDeployer}
}

async function main () {
  const deployHelpers = await getDeployHelpers();
  console.log(`Upgrading AstrologerManager contract on ${deployHelpers.CHAIN_NAME} (Chain ID: ${deployHelpers.chainId})`);

  // Upgrade AstrologerManager contract
  console.log("\nUpgrading AstrologerManager...");
  await upgradeUpgradableContract(
    hre, 
    deployHelpers.chainId, 
    "AstrologerManager", 
    deployHelpers.payDeployer
  );

  console.log("\n✅ AstrologerManager contract upgraded successfully!");
  console.log("🔧 New features:");
  console.log("  - Astrologers are now automatically verified upon registration");
  console.log("  - No manual verification required for creating predictions");
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 