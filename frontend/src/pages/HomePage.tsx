import React, { useState, useEffect } from 'react';
import { Button, message, Modal, Input, List, Row, Col, Card, Space } from 'antd';
import Web3 from 'web3';
import { BuyMyRoomContract, myERC20Contract } from '../utils/contract';
import Addresses from '../utils/contract-address.json';
import './HomePage.css';

const HomePage: React.FC = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [houses, setHouses] = useState<number[]>([]);
    const [housesForSale, setHousesForSale] = useState<number[]>([]);
    const [houseInfo, setHouseInfo] = useState<any>(null);
    const [price, setPrice] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
    const [erc20Balance, setErc20Balance] = useState<number>(0);
    // @ts-ignore
    const [ethAmount, setEthAmount] = useState<number>('');
    const [userHouses, setUserHouses] = useState<number[]>([]); // 用于存储用户房子信息


    useEffect(() => {
        const loadBlockchainData = async () => {
            const { ethereum } = window;
            if (!ethereum) {
                message.error('请安装MetaMask插件');
                return;
            }
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if(accounts.length > 0){
                setAccount(accounts[0]);
                await loadHouses(accounts[0]);
                await loadHousesForSale();
                await loadErc20Balance(accounts[0]);
            }
        };
        loadBlockchainData();
    }, []);

    const loadHouses = async (account: string) => {
        const houses = await BuyMyRoomContract.methods.getHouseByOwner(account).call();
        // console.log('我的房子数据：',houses);
        if(Array.isArray(houses)){
            const houseIds = houses.map((house: any) => Number(house));
            setHouses(houseIds);
        }else{
            message.error('获取房子数据失败');
        }
    };

    const loadHousesForSale = async () => {
        const houses = await BuyMyRoomContract.methods.getHousesForSale().call();
        if(Array.isArray(houses)){
            const houseIds = houses.map((house: any) => Number(house));
            setHousesForSale(houseIds);
        }else{
            message.error('获取房子数据失败');
        }
    };

    const loadErc20Balance = async (account: string) => {
        try{
            const balance = await BuyMyRoomContract.methods.getMyERC20().call({from: account});
            setErc20Balance(Number(balance)/1e18);
        } catch (error: any) {
            message.error(`获取ERC20代币余额失败: ${error.message}`);
        }
    };

    const listHouseForSale = async (houseId: number, price: number) => {
        try {
            // @ts-ignore
            await BuyMyRoomContract.methods.listHouse(houseId, Web3.utils.toWei(price, 'ether')).send({ from: account });
            message.success('房屋已成功上架');
            await loadHouses(account!);
            await loadHousesForSale();
        } catch (error: any) {
            message.error(`上架失败: ${error.message}`);
        }
    };

    const unListHouse = async (tokenId: number) => {
        try {
            // @ts-ignore
            await BuyMyRoomContract.methods.unListHouse(tokenId).send({ from: account });
            message.success('成功下架房屋');
            await loadHouses(account!);
            await loadHousesForSale();
        } catch (error: any) {
            message.error(`下架失败: ${error.message}`);
        }
    }

    const buyHouse = async (tokenId: number) => {
        try {
            const HouseInfo = await BuyMyRoomContract.methods.getHouseInfo(tokenId).call();
            setHouseInfo(HouseInfo);
            // @ts-ignore
            await myERC20Contract.methods.approve(Addresses.BuyMyRoom, Number(HouseInfo[1])).send({ from: account });
            // @ts-ignore
            await BuyMyRoomContract.methods.buyHouseWithTokens(tokenId).send({ from: account });
            message.success('房屋购买成功');
            await loadHouses(account!);
            await loadHousesForSale();
            await loadErc20Balance(account!);
        } catch (error: any) {
            message.error(`购买失败: ${error.message}`);
        }
    };

    const showHouseInfo = async (tokenId: number) => {
        const info = await BuyMyRoomContract.methods.getHouseInfo(tokenId).call();
        setHouseInfo(info);
        // houseInfo[1] = Number(houseInfo[1])/1e18;
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const receiveHouse = async () => {
        try {
            // @ts-ignore
            await BuyMyRoomContract.methods.recieveHouse().send({ from: account });
            message.success('成功领取房屋');
            await loadHouses(account!);
        } catch (error: any) {
            message.error(`领取失败: ${error.message}`);
        }
    };

    const buyTokens = async () => {
        try {
            // @ts-ignore
            await BuyMyRoomContract.methods.buyTokens().send({ from: account, value: Web3.utils.toWei(ethAmount, 'ether') });
            message.success('成功兑换ERC20代币');
            await loadErc20Balance(account!);
        } catch (error: any) {
            message.error(`兑换失败: ${error.message}`);
        }
    };

    return (
        <div>
            <div className="account-info">
                <div className="account-address">当前用户：{account}</div>
            </div>

            <h1>我的房产</h1>
            <Button onClick={receiveHouse}>领取房屋</Button>
            <List
                bordered
                dataSource={houses}
                renderItem={(house: number) => (
                    <List.Item>
                        房屋ID: {house}
                        <Button onClick={() => listHouseForSale(house, price)}>上架出售</Button>
                        <Input
                            type="number"
                            placeholder="输入价格"
                            onChange={e => setPrice(Number(e.target.value))}
                        />
                    </List.Item>
                )}
            />
            <h1>出售中的房产</h1>
            <List
                bordered
                dataSource={housesForSale}
                renderItem={(house: number) => (
                    <List.Item>
                        房屋ID: {house}
                        <Button onClick={() => buyHouse(house)}>购买</Button>
                        <Button onClick={() => showHouseInfo(house)}>查看信息</Button>
                        <Button onClick={() => unListHouse(house)}>下架房屋</Button>
                    </List.Item>
                )}
            />
            <h1>兑换ERC20代币</h1>
            <Input
                type="number"
                placeholder="输入ETH数量"
                onChange={e => setEthAmount(Number(e.target.value))}
            />
            <Button onClick={buyTokens}>兑换</Button>
            <p>我的ERC20代币余额: {erc20Balance}</p>
            <Modal title="房屋信息" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                {houseInfo && (
                    <div>
                        <p>房屋主人: {houseInfo[0]}</p>
                        <p>价格: {Number(houseInfo[1])/1e18} ERC20 代币</p>
                        <p>上架时间: {new Date(Number(houseInfo[2]) * 1000).toLocaleString()}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HomePage;