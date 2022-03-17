const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract('Dex', async (accounts) => {
    let link;
    let dex;
    let ticker;

    const owner = accounts[0];
    const external = accounts[1];

    before(async () => {
        link = await Link.deployed();
        dex = await Dex.deployed();
        ticker = web3.utils.fromUtf8(link.symbol);
        await link.approve(dex.address, 10000);
        await dex.addToken(ticker, link.address);
    });

    describe.skip('order book', () => {
        it('should create a buy order book if enough eths', () => {});
        it('should create a buy order book if enough tokens', () => {});
        it('should be ordered on price from highest to lowest starting at index 0', () => {});
        it('should be ordered on price from lowest to highest starting at index 0', () => {});
        it('should not be able to be created if not supported token', () => {});
    });
});
