import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0x45FA61b7c20C9CB78bF2Ec0886c6DDa4297b0438'
);

export default instance;