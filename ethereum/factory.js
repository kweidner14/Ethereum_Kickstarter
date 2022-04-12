import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0x7f51a57e5ddF5a7686E9FD5C5984CC3b15985399'
);

export default instance;