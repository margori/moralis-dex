const truffleAssertions = require('truffle-assertions');

const Link = artifacts.require('Link');
const EthWallet = artifacts.require('EthWallet');

contract('EthWallet', async (accounts) => {
    let link;
    let ethWallet;

    const owner = accounts[0];

    before(async () => {
        link = await Link.deployed();
        ethWallet = await EthWallet.deployed();
    });

    beforeEach(async () => {
        const balance = await ethWallet.ethBalances(owner);
        assert.equal(balance.toNumber(), 0);
    });
    afterEach(async () => {
        const balance = await ethWallet.ethBalances(owner);
        if (balance.toNumber() > 0) {
            await ethWallet.withdrawEth(balance.toNumber());
        }
    });

    it('should deposit 100 eth to wallet', async () => {
        await ethWallet.depositEth({ value: 100 });

        const balance = await ethWallet.ethBalances(owner);

        assert.equal(balance.toNumber(), 100);
    });

    it('should withdraw 60 eth from wallet', async () => {
        await ethWallet.depositEth({ value: 100 });
        await ethWallet.withdrawEth(60);

        const balance = await ethWallet.ethBalances(owner);

        assert.equal(balance.toNumber(), 40);
    });

    it('should fail withdrawing 200 eth from wallet', async () => {
        await ethWallet.depositEth({ value: 100 });
        truffleAssertions.fails(ethWallet.withdrawEth(200));
    });
});
