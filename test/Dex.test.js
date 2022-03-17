const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract('Dex', async (accounts) => {
    let link;
    let dex;
    let ticker;

    before(async () => {
        link = await Link.deployed();
        dex = await Dex.deployed();
        ticker = web3.utils.fromUtf8(link.symbol);
        await link.approve(dex.address, 10000);

        await dex.addToken(ticker, link.address);
    });

    beforeEach(async () => {
        const myBalanceOfLink = await dex.balances(accounts[0], ticker);
        assert.equal(myBalanceOfLink.toNumber(), 0);
    });
    afterEach(async () => {
        const myBalanceOfLink = await dex.balances(accounts[0], ticker);
        await dex.withDraw(myBalanceOfLink.toNumber(), ticker);
    });

    it('should success for owner to add tokens', async () => {
        await truffleAssert.passes(
            dex.addToken(ticker, link.address, { from: accounts[0] })
        );
    });

    it('should fail for external to add tokens', async () => {
        await truffleAssert.fails(
            dex.addToken(ticker, link.address, { from: accounts[1] })
        );
    });

    it('should fail when adding same token', async () => {
        const newTicker = web3.utils.fromUtf8('twice');

        dex.addToken(ticker, link.address, { from: accounts[0] });
        await truffleAssert.fails(
            dex.addToken(ticker, newTicker, { from: accounts[0] })
        );
    });

    it('should deposit 100 Link to dex', async () => {
        await link.approve(dex.address, 10000);

        await dex.addToken(ticker, link.address);
        await dex.deposit(100, ticker);

        const myBalanceOfLink = await dex.balances(accounts[0], ticker);

        assert.equal(myBalanceOfLink.toNumber(), 100);
    });
});
