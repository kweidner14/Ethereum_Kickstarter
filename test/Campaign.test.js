const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts, factory, campaignAddress, campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({data: compiledFactory.bytecode})
        .send({from: accounts[0], gas: '1000000'});

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });

    // returns an array of addresses from deployedCampaigns
    // assigns first variable from array to 'campaignAddress' variable
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaigns', () => {
    // test if successfully deploys
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    })

    // test manager address is correct
    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    })

    it('lets people contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        })

        // approvers is a bool. True = contributor;
        const isContributor = await campaign.methods.approvers(accounts[1]).call()
        assert(isContributor);
    })

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '5',
                from: accounts[1]
            })
            // fallback in case try isn't called for some reason
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('allows a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Buy product materials', '100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy product materials', request.description);
    })

    it('processes requests', async () => {
        // send 10 ether from manager as contribution
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        })

        // attempt to send 5 ether to accounts[1]
        await campaign.methods
            .createRequest('asdf', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({
                from:accounts[0],
                gas: '1000000'
            })

        // approve the spending request
        await campaign.methods.approveRequest(0).send({
            from:accounts[0],
            gas: '1000000'
        })

        // finalize the spending request
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })

        // retrieve balance of account that received ether
        let balance = await web3.eth.getBalance(accounts[1]);
        // convert balance to a string
        balance = web3.utils.fromWei(balance, 'ether');
        // convert balance to a float
        balance = parseFloat(balance);

        assert(balance > 103);
    })
})