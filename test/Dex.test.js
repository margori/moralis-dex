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

        await dex.depositToken(200, ticker);
        await dex.depositEth({ value: 20 });
    });

    it('should create a buy order if enough eths', async () => {
        await truffleAssert.passes(dex.createOrder(Dex.Side.BUY, ticker, 1, 1));
    });

    it('should create a sell order if enough token', async () => {
        await truffleAssert.passes(
            dex.createOrder(Dex.Side.SELL, ticker, 2, 2)
        );
    });

    it('should fail create but order a buy order if not enough eths', async () => {
        await truffleAssert.fails(
            dex.createOrder(Dex.Side.BUY, ticker, 1, 500)
        );
    });
    it('should create a buy order book if enough tokens', async () => {
        await truffleAssert.fails(
            dex.createOrder(Dex.Side.SELL, ticker, 500, 1)
        );
    });
    it('buy orders should be ordered on price from highest to lowest starting at index 0', async () => {
        await dex.createOrder(Dex.Side.BUY, ticker, 101, 4);
        await dex.createOrder(Dex.Side.BUY, ticker, 102, 3);
        await dex.createOrder(Dex.Side.BUY, ticker, 103, 5);
        await dex.createOrder(Dex.Side.BUY, ticker, 104, 7);
        await dex.createOrder(Dex.Side.BUY, ticker, 105, 6);

        const orderBook = await dex.getOrderBook(ticker, Dex.Side.BUY);
        assert.isAbove(orderBook.length, 2);
        for (let i = 0; i < orderBook.length - 1; i++) {
            assert.isAtLeast(
                parseInt(orderBook[i].price),
                parseInt(orderBook[i + 1].price)
            );
        }
    });
    it('sell orders should be ordered on price from lowest to highest starting at index 0', async () => {
        await dex.createOrder(Dex.Side.SELL, ticker, 110, 9);
        await dex.createOrder(Dex.Side.SELL, ticker, 111, 8);
        await dex.createOrder(Dex.Side.SELL, ticker, 112, 10);
        await dex.createOrder(Dex.Side.SELL, ticker, 113, 12);
        await dex.createOrder(Dex.Side.SELL, ticker, 114, 11);

        const orderBook = await dex.getOrderBook(ticker, Dex.Side.SELL);
        assert.isAbove(orderBook.length, 2);
        for (let i = 0; i < orderBook.length - 1; i++) {
            assert.isAtMost(
                parseInt(orderBook[i].price),
                parseInt(orderBook[i + 1].price)
            );
        }
    });
    it('should not be able to be created if not supported token', async () => {
        await truffleAssert.fails(
            dex.createOrder(Dex.Side.BUY, web3.utils.fromUtf8('TRON'), 1, 1)
        );
    });
});
