const TokenWallet = artifacts.require('TokenWallet');

module.exports = function (deployer) {
    deployer.deploy(TokenWallet);
};
