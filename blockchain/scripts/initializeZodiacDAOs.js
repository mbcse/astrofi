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
  console.log(`Initializing Zodiac DAOs on ${deployHelpers.CHAIN_NAME} (Chain ID: ${deployHelpers.chainId})`);

  const zodiacDAOAddress = readFromConfig('ZodiacDAO', 'ADDRESS', deployHelpers.chainId);
  const zodiacDAO = await ethers.getContractAt('ZodiacDAO', zodiacDAOAddress);

  console.log("\n🌟 Creating Zodiac DAOs for all 12 zodiac signs...");

  const zodiacDAOs = [
    {
      zodiacSign: 0, // ARIES
      name: "Aries DAO",
      description: "The Ram - Bold, energetic, and pioneering. Aries DAO members are natural leaders who embrace challenges and new beginnings.",
      membershipPrice: ethers.utils.parseEther("0.1"),
      maxMembers: 1000,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 1, // TAURUS
      name: "Taurus DAO",
      description: "The Bull - Patient, reliable, and determined. Taurus DAO focuses on stability, material security, and sensual pleasures.",
      membershipPrice: ethers.utils.parseEther("0.08"),
      maxMembers: 1200,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 2, // GEMINI
      name: "Gemini DAO",
      description: "The Twins - Versatile, expressive, and quick-witted. Gemini DAO celebrates communication, learning, and adaptability.",
      membershipPrice: ethers.utils.parseEther("0.06"),
      maxMembers: 1500,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 3, // CANCER
      name: "Cancer DAO",
      description: "The Crab - Nurturing, protective, and intuitive. Cancer DAO emphasizes emotional security, family, and home.",
      membershipPrice: ethers.utils.parseEther("0.09"),
      maxMembers: 1100,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 4, // LEO
      name: "Leo DAO",
      description: "The Lion - Dramatic, creative, and generous. Leo DAO celebrates self-expression, leadership, and artistic pursuits.",
      membershipPrice: ethers.utils.parseEther("0.12"),
      maxMembers: 800,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 5, // VIRGO
      name: "Virgo DAO",
      description: "The Virgin - Analytical, kind, and hardworking. Virgo DAO focuses on service, health, and practical wisdom.",
      membershipPrice: ethers.utils.parseEther("0.07"),
      maxMembers: 1300,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 6, // LIBRA
      name: "Libra DAO",
      description: "The Scales - Diplomatic, gracious, and fair-minded. Libra DAO promotes harmony, justice, and balanced relationships.",
      membershipPrice: ethers.utils.parseEther("0.09"),
      maxMembers: 1100,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 7, // SCORPIO
      name: "Scorpio DAO",
      description: "The Scorpion - Passionate, determined, and magnetic. Scorpio DAO explores transformation, power, and deep mysteries.",
      membershipPrice: ethers.utils.parseEther("0.11"),
      maxMembers: 900,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 8, // SAGITTARIUS
      name: "Sagittarius DAO",
      description: "The Archer - Optimistic, adventurous, and philosophical. Sagittarius DAO embraces exploration, wisdom, and freedom.",
      membershipPrice: ethers.utils.parseEther("0.10"),
      maxMembers: 1000,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 9, // CAPRICORN
      name: "Capricorn DAO",
      description: "The Goat - Responsible, disciplined, and ambitious. Capricorn DAO builds success through patience and strategic planning.",
      membershipPrice: ethers.utils.parseEther("0.08"),
      maxMembers: 1200,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 10, // AQUARIUS
      name: "Aquarius DAO",
      description: "The Water Bearer - Original, independent, and humanitarian. Aquarius DAO champions innovation, social justice, and progress.",
      membershipPrice: ethers.utils.parseEther("0.13"),
      maxMembers: 700,
      treasury: deployHelpers.payDeployer.address
    },
    {
      zodiacSign: 11, // PISCES
      name: "Pisces DAO",
      description: "The Fish - Compassionate, artistic, and intuitive. Pisces DAO explores spirituality, creativity, and universal love.",
      membershipPrice: ethers.utils.parseEther("0.15"),
      maxMembers: 600,
      treasury: deployHelpers.payDeployer.address
    }
  ];

  for (let i = 0; i < zodiacDAOs.length; i++) {
    const dao = zodiacDAOs[i];
    console.log(`\n${i + 1}. Creating ${dao.name}...`);
    
    try {
      const tx = await zodiacDAO.createZodiacDAO(
        dao.zodiacSign,
        dao.name,
        dao.description,
        dao.membershipPrice,
        dao.maxMembers,
        dao.treasury
      );
      
      await tx.wait();
      console.log(`✅ ${dao.name} created successfully!`);
    } catch (error) {
      console.log(`❌ Failed to create ${dao.name}: ${error.message}`);
    }
  }

  console.log("\n🎉 Zodiac DAO initialization complete!");
  console.log("\n📋 Available Zodiac DAOs:");
  
  for (let i = 1; i <= 12; i++) {
    try {
      const daoInfo = await zodiacDAO.getZodiacDAO(i);
      console.log(`${i}. ${daoInfo.name} - ${ethers.utils.formatEther(daoInfo.membershipPrice)} ETH`);
    } catch (error) {
      console.log(`${i}. DAO not found or error reading`);
    }
  }

  console.log("\n🌟 Users can now join Zodiac DAOs to participate in specialized communities!");
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}) 