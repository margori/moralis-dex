const EthWallet = artifacts.require('EthWallet');

module.exports = function (deployer) {
    deployer.deploy(EthWallet);
};
