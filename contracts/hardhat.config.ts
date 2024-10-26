import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xf1632f8c9b30d3bb1dcfcdef820b47e731ab2ba02dd10950f5a71f1d5c2fc650',
        '0x8850482a638d162c168ff71e748ec8056ba40786ecee6c04caa509a9d67cd027',
        '0x81576b5868bd4b714697b79ed8e4d6123cf69f39a1c08b53e1140108d5cc4177',
        '0x71d798c16908c485f47afa7f3511c7433bd978c72cca4d319b41524f18dbdf81',
        '0xc317cd477cf2391ba1699b35f33d6926e11c2e97ccd78639cb81c359d86eafbc'
      ]
    },
  },
};

export default config;
