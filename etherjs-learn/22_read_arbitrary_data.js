// 以太坊所有数据都是公开的，因此 private 变量并不私密。这一讲，我们将介绍如何读取智能合约的任意数据。

// 以太坊智能合约的存储是一个 uint256 -> uint256 的映射。uint256 大小为 32 bytes，这个固定大小的存储空间被称为 slot （插槽）。
// 智能合约的数据就被存在一个个的 slot 中，从 slot 0 开始依次存储。每个基本数据类型占一个 slot，例如 uint，address，等等；
// 而数组和映射这类复杂结构则会更复杂
// 因此，即使是没有 getter 函数的 private 变量，你依然可以通过 slot 索引来读取它的值。
const ethers = require('ethers')
//准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN'
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)

// 目标合约地址: Arbitrum ERC20 bridge（主网）
const addressBridge = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a' // DAI Contract
// 合约所有者 slot
const slot = `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`

const main = async () => {
    console.log("开始读取特定slot的数据")
    const privateData = await provider.getStorage(addressBridge, slot)
    console.log("读出的数据（owner地址）: ", ethers.getAddress(ethers.dataSlice(privateData, 12)))
}

main()

//总结：  介绍了如何读取智能合约中的任意数据，包括私密数据。由于以太坊是公开透明的，大家不要将秘密存在智能合约中！