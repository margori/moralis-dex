const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract('Dex', async (accounts) => {
    let link;
    let dex;
    let ticker;

    const owner = accounts[0];

    before(async () => {
        link = await Link.deployed();
        dex = await Dex.deployed();
        ticker = web3.utils.fromUtf8(link.symbol);
        await link.approve(dex.address, 10000);
        await dex.addToken(ticker, link.address);

        await dex.depositToken(200, ticker);
        await dex.depositEth({ value: 20000 });
    });

    describe('Limit Order creation', () => {
        it('should create a buy order if enough eths', async () => {
            await truffleAssert.passes(
                dex.createLimitOrder(Dex.Side.BUY, ticker, 1, 1)
            );
        });

        it('should create a sell order if enough token', async () => {
            await truffleAssert.passes(
                dex.createLimitOrder(Dex.Side.SELL, ticker, 2, 2)
            );
        });

        it('should fail create but order a buy order if not enough eths', async () => {
            await truffleAssert.fails(
                dex.createLimitOrder(Dex.Side.BUY, ticker, 3, 50000)
            );
        });
        it('should create a buy order book if enough tokens', async () => {
            await truffleAssert.fails(
                dex.createLimitOrder(Dex.Side.SELL, ticker, 50000, 3)
            );
        });

        it('should not be able to be created if not supported token', async () => {
            await truffleAssert.fails(
                dex.createLimitOrder(
                    Dex.Side.BUY,
                    web3.utils.fromUtf8('TRON'),
                    1,
                    1
                )
            );
        });
    });

    describe('Limit Order sorting', () => {
        it('buy orders should be ordered on price from highest to lowest starting at index 0', async () => {
            await dex.createLimitOrder(Dex.Side.BUY, ticker, 101, 4);
            await dex.createLimitOrder(Dex.Side.BUY, ticker, 102, 3);
            await dex.createLimitOrder(Dex.Side.BUY, ticker, 103, 5);
            await dex.createLimitOrder(Dex.Side.BUY, ticker, 104, 7);
            await dex.createLimitOrder(Dex.Side.BUY, ticker, 105, 6);

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
            await dex.createLimitOrder(Dex.Side.SELL, ticker, 110, 9);
            await dex.createLimitOrder(Dex.Side.SELL, ticker, 111, 8);
            await dex.createLimitOrder(Dex.Side.SELL, ticker, 112, 10);
            await dex.createLimitOrder(Dex.Side.SELL, ticker, 113, 12);
            await dex.createLimitOrder(Dex.Side.SELL, ticker, 114, 11);

            const orderBook = await dex.getOrderBook(ticker, Dex.Side.SELL);
            assert.isAbove(orderBook.length, 2);
            for (let i = 0; i < orderBook.length - 1; i++) {
                assert.isAtMost(
                    parseInt(orderBook[i].price),
                    parseInt(orderBook[i + 1].price)
                );
            }
        });
    });

    describe('Market order creation', () => {
        it('when buying should succeed if enough ETHs', async () => {
            await truffleAssert.passes(
                dex.createMarketOrder(Dex.Side.BUY, ticker, 1)
            );
        });
        it('when buying should fail if not enough ETHs', async () => {
            // ensure no eth in balance
            const balance = await dex.ethBalances(owner);
            if (balance.toNumber() > 0) {
                await dex.withdrawEth(balance.toNumber());
            }

            await truffleAssert.fails(
                dex.createMarketOrder(Dex.Side.BUY, ticker, 50000)
            );
        });
        it('when selling should succeed if enough Tokens', async () => {
            await truffleAssert.passes(
                dex.createMarketOrder(Dex.Side.SELL, ticker, 1)
            );
        });
        it('when selling should fail if not enough Tokens', async () => {
            await truffleAssert.fails(
                dex.createMarketOrder(Dex.Side.SELL, ticker, 50000)
            );
        });

        it('should not be able to be created if not supported token', async () => {
            await truffleAssert.fails(
                dex.createMarketOrder(
                    Dex.Side.BUY,
                    web3.utils.fromUtf8('TRON'),
                    1
                )
            );
        });
    });

});
