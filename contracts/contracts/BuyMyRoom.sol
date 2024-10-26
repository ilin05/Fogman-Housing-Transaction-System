// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./MyERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BuyMyRoom is ERC721 {

    // 合约的所有者
    address public contractOwner;
    // 下一个发放的房屋
    uint256 public nextHouseId;
    // 在售的房屋数量
    uint256 public onSaleHouseCount;

    // ERC20 代币实例
    MyERC20 public myERC20;

    // 记录每个用户已经领取过的房子数量
    mapping(address => uint256) public myHouseCount;


    // use a event if you want
    // to represent time you can choose block.timestamp
    event HouseListed(uint256 houseId, uint256 price, address owner);

    // maybe you need a struct to store car information
    struct House {
        address owner;
        uint256 listedTimestamp;
        uint256 price;
        bool isOnSale;
    }

    mapping(uint256 => House) public houses; // A map from house-index to its information
    // ...
    // TODO add any variables and functions if you want
    // 房屋售出事件
    event HouseSold(uint256 houseId, uint256 price, address newOwner);
    // 房屋上架事件
    event HouseOnSale(uint256 houseId, uint256 price, address oldOwner);

    constructor() ERC721("HouseNFT", "HNFT") {
        // maybe you need a constructor
        contractOwner = msg.sender;
        nextHouseId = 1;
        onSaleHouseCount = 0;
        myERC20 = new MyERC20("MyERC20", "MyERC20Symbol");
    }

    // 用户可以领取5个房子
    function recieveHouse() external {
        require(myHouseCount[msg.sender] < 5, "No more house to recieve");
        _mint(msg.sender, nextHouseId);
        houses[nextHouseId] = House(msg.sender, block.timestamp, 0, false);
        nextHouseId++;
        myHouseCount[msg.sender]++;
    }

    // 查询用户拥有的房屋
    function getHouseByOwner(address owner) external view returns(uint256[] memory) {
        uint256[] memory result = new uint256[](balanceOf(owner));
        uint256 idx = 0;
        for (uint256 i = 1; i < nextHouseId; i++) {
            if(ownerOf(i) == owner) {
                result[idx++] = i;
            }
        }
        return result;
    }

    // 上架房屋
    function listHouse(uint256 houseId, uint256 price) external {
        require(houses[houseId].owner == msg.sender, "You are not the owner of this house");
        require(houses[houseId].isOnSale == false, "This house is already on sale");
        houses[houseId].price = price;
        houses[houseId].isOnSale = true;
        houses[houseId].listedTimestamp = block.timestamp;
        onSaleHouseCount++;
        emit HouseListed(houseId, price, msg.sender);
    }

    // 下架房屋
    function unListHouse(uint256 houseId) external {
        require(houses[houseId].owner == msg.sender, "You are not the owner of this house");
        require(houses[houseId].isOnSale == true, "This house is not on sale");
        houses[houseId].isOnSale = false;
        onSaleHouseCount--;
    }

    // 查询所有在售房屋
    function getHousesForSale() external view returns(uint256[] memory) {
        uint256[] memory result = new uint256[](onSaleHouseCount);
        uint256 idx = 0;
        for (uint256 i = 1; i < nextHouseId; i++) {
            if (houses[i].isOnSale == true) {
                result[idx] = i;
                idx++;
            }
        }
        return result;
    }

    // 查询房屋信息
    function getHouseInfo(uint256 houseId) external view returns(address, uint256, uint256) {
        return (houses[houseId].owner, houses[houseId].price, houses[houseId].listedTimestamp);
    }

    // 用户使用以太币兑换 ERC20 代币
    function buyTokens() external payable {
        require(msg.value > 0, "No ether sent");
        uint256 tokensToMint = msg.value;
        myERC20.mint(msg.sender, tokensToMint);
        payable(contractOwner).transfer(msg.value);
    }

    // 用户使用 ERC20 代币购买房屋
    function buyHouseWithTokens(uint256 houseId) external {
        require(houses[houseId].isOnSale, "House not for sale");
        require(houses[houseId].owner != msg.sender, "Can not buy owned house");
        require(myERC20.balanceOf(msg.sender) >= houses[houseId].price, "Not enough tokens");

        // 手续费
        uint256 premium = (block.timestamp - houses[houseId].listedTimestamp) / 1000000 * houses[houseId].price;

        myERC20.transferFrom(msg.sender, ownerOf(houseId), houses[houseId].price - premium);
        myERC20.transferFrom(msg.sender, contractOwner, premium);
        houses[houseId].isOnSale = false;
        _transfer(ownerOf(houseId), msg.sender, houseId);
        houses[houseId].owner = msg.sender;
        onSaleHouseCount--;

        emit HouseSold(houseId, houses[houseId].price, msg.sender);
    }

    // 查看拥有的 ERC20 代币
    function getMyERC20() external view returns(uint256) {
        return myERC20.balanceOf(msg.sender);
    }

    // ...
    // TODO add any logic if you want
}