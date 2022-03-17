const truffleAssertions = require('truffle-assertions');

const Link = artifacts.require('Link');
const Wallet = artifacts.require('Wallet');

contract('Wallet', async (accounts) => {
    let link;
    let wallet;
    let ticker;

    before(async () => {
        link = await Link.deployed();
        wallet = await Wallet.deployed();
        ticker = web3.utils.fromUtf8(link.symbol);
        await link.approve(wallet.address, 10000);

        await wallet.addToken(ticker, link.address);
    });

    beforeEach(async () => {
        const myBalanceOfLink = await wallet.balances(accounts[0], ticker);
        assert.equal(myBalanceOfLink.toNumber(), 0);
    });
    afterEach(async () => {
        const myBalanceOfLink = await wallet.balances(accounts[0], ticker);
        await wallet.withDraw(myBalanceOfLink.toNumber(), ticker);
    });

    it('should deposit 100 Link to wallet', async () => {
        await wallet.deposit(100, ticker);

        const myBalanceOfLink = await wallet.balances(accounts[0], ticker);

        assert.equal(myBalanceOfLink.toNumber(), 100);
    });

    it('should withdraw 60 Link from wallet', async () => {
        await wallet.deposit(100, ticker);
        await wallet.withDraw(60, ticker);

        const myBalanceOfLink = await wallet.balances(accounts[0], ticker);

        assert.equal(myBalanceOfLink.toNumber(), 40);
    });

    it('should fail withdrawing 200 Link from wallet', async () => {
        await wallet.deposit(100, ticker);
        truffleAssertions.fails(wallet.withDraw(200, ticker));
    });
});
