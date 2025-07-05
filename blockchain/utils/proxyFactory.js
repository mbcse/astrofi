const { ethers, upgrades } = require('hardhat');

async function deployProxy(implementation, initData, deployer) {
    // Deploy proxy using OpenZeppelin's proxy factory
    const proxy = await upgrades.deployProxy(implementation, initData, {
        deployer: deployer,
        kind: 'uups'
    });
    
    await proxy.deployed();
    return proxy;
}

async function deployImplementation(contractName, deployer) {
    const Contract = await ethers.getContractFactory(contractName);
    const implementation = await Contract.deploy();
    await implementation.deployed();
    return implementation;
}

module.exports = {
    deployProxy,
    deployImplementation
}; 