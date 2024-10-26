import Web3 from 'web3';
import BuyMyRoom from './abis/BuyMyRoom.json';
import MyERC20 from './abis/MyERC20.json';
import Addresses from './contract-address.json';

// @ts-ignore
let web3 = new Web3(window.web3.currentProvider);

const buyMyRoomAddress = Addresses.BuyMyRoom;
const myERC20Address = Addresses.myERC20;
const BuyMyRoomABI = BuyMyRoom.abi;
const myERC20ABI = MyERC20.abi;

const BuyMyRoomContract = new web3.eth.Contract(BuyMyRoomABI, buyMyRoomAddress);
const myERC20Contract = new web3.eth.Contract(myERC20ABI, myERC20Address);

export { web3, BuyMyRoomContract, myERC20Contract };
