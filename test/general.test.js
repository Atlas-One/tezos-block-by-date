const assert = require('chai').assert;
const moment = require('moment');
const TezosDater = require('../lib/tezos-block-by-date');
require('dotenv').config();

const dater = new TezosDater('https://mainnet-tezos.giganode.io');

describe.only('Block By Date General Tests', function () {
    this.timeout(0);

    it('Should get right block for a given string', async function () {
        let block = await dater.getDate('2018-06-30T17:44:27Z');
        assert.equal(block.block, 3);
    });

    it('Should get right block for Date object', async function () {
        let block = await dater.getDate(new Date('2018-06-30T17:44:27Z'));
        assert.equal(block.block, 3);
    });

    it('Should get right block for Moment object', async function () {
        let block = await dater.getDate(moment(new Date('2018-06-30T17:44:27Z')).utc());
        assert.equal(block.block, 3);
    });

    it('Should get right block for miliseconds', async function () {
        let block = await dater.getDate(1632931829532);
        assert.equal(block.block, 3);
    });

    it('Should get previous block for a given string', async function () {
        let block = await dater.getDate('2018-06-30T17:44:27Z', false);
        assert.equal(block.block, 1919999);
    });

    it('Should get first blocks of the years', async function () {
        let blocks = await dater.getEvery('years', '2018-01-01T00:00:00Z', '2020-01-01T00:00:00Z');
        let numbers = blocks.map((block) => block.block);
        let expected = [1, 251156, 760512];
        assert.deepEqual(expected, numbers);
    });

    it('Should get last blocks of the years', async function () {
        let blocks = await dater.getEvery(
            'years',
            '2018-01-01T00:00:00Z',
            '2020-01-01T00:00:00Z',
            1,
            false
        );
        let numbers = blocks.map((block) => block.block);
        let expected = [1, 251155, 760511];
        assert.deepEqual(expected, numbers);
    });

    it('Should return 1 as block number if given time is before first block time', async function () {
        let block = await dater.getDate(new Date('1961-04-06:07:00Z'));
        assert.equal(block.block, 1);
    });

    // it('Should return last block number if given time is in the future', async function () {
    //     let last = await web3.eth.getBlockNumber();
    //     let block = await dater.getDate(moment().add(100, 'years'));
    //     assert.equal(block.block, last);
    // });

    // it('Should return last block number if given time is bigger than last block timestamp', async function () {
    //     let last = await web3.eth.getBlockNumber();
    //     let { timestamp } = await web3.eth.getBlock(last);
    //     let block = await dater.getDate((timestamp + 1) * 1000);
    //     assert.equal(block.block, last);
    // });

    it('Should return unique blocks for hourly request', async function () {
        let time = moment(),
            results = [];
        for (let i = 0; i < 10; i++) {
            let request = await dater.getDate(time);
            time.subtract(1, 'hours');
            results.push(request.block);
        }
        let unique = results.filter((v, i, a) => a.indexOf(v) === i);
        assert.deepEqual(results, unique);
    });

    it('Should return right timestamp for a given date', async function () {
        let block = await dater.getDate(new Date('2018-06-30T17:39:57Z'));
        assert.equal(block.timestamp, moment.unix('2018-06-30T17:39:57Z'));
    });

    it('Should return right timestamp if given time is before first block time', async function () {
        let block = await dater.getDate(new Date('1961-04-06:07:00Z'));
        assert.equal(block.timestamp, moment.unix('2018-06-30T17:39:57Z'));
    });

    // it('Should return right timestamp if given time is in the future', async function () {
    //     let last = await web3.eth.getBlockNumber();
    //     let { timestamp } = await web3.eth.getBlock(last);
    //     let block = await dater.getDate(moment().add(100, 'years'));
    //     assert.equal(block.timestamp, timestamp);
    // });
});
