const truffleAssertions = require('truffle-assertions');

const Link = artifacts.require('Link');
const TokenWallet = artifacts.require('TokenWallet');

contract('TokenWallet', async (accounts) => {
    let link;
    let tokenWallet;
    let ticker;

    const owner = accounts[0];

    before(async () => {
        link = await Link.deployed();
        tokenWallet = await TokenWallet.deployed();
        ticker = web3.utils.fromUtf8(link.symbol);
        await link.approve(tokenWallet.address, 10000);

        await tokenWallet.addToken(ticker, link.address);
    });

    beforeEach(async () => {
        const balance = await tokenWallet.tokenBalances(owner, ticker);
        assert.equal(balance.toNumber(), 0);
    });
    afterEach(async () => {
        const balance = await tokenWallet.tokenBalances(owner, ticker);
        if (balance.toNumber() > 0) {
            await tokenWallet.withdrawToken(balance.toNumber(), ticker);
        }
    });

    it('should deposit 100 Link to tokenWallet', async () => {
        await tokenWallet.depositToken(100, ticker);

        const balance = await tokenWallet.tokenBalances(owner, ticker);

        assert.equal(balance.toNumber(), 100);
    });

    it('should withdraw 60 Link from tokenWallet', async () => {
        await tokenWallet.depositToken(100, ticker);
        await tokenWallet.withdrawToken(60, ticker);

        const balance = await tokenWallet.tokenBalances(owner, ticker);

        assert.equal(balance.toNumber(), 40);
    });

    it('should fail withdrawing 200 Link from tokenWallet', async () => {
        await tokenWallet.depositToken(100, ticker);
        truffleAssertions.fails(tokenWallet.withdrawToken(200, ticker));
    });
});
