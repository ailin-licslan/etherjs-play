import { JsonRpcProvider, Wallet, ethers } from 'ethers'


//1.创建 provider，wallet 变量。

// 利用Alchemy的rpc节点连接以太坊测试网络
const ALCHEMY_SEPOLIA_URL = 'https://eth-sepolia.g.alchemy.com/v2/....'
const provider = new JsonRpcProvider(ALCHEMY_SEPOLIA_URL)

// 利用私钥和provider创建wallet对象(建议用自己的钱包私钥)
const privateKey = '0f03a73988c990c2333bbbcd99d442377fedbe48083a8a9c4426ace223c33e5d'
const wallet = new Wallet(privateKey, provider)


// 2.创建可写 WETH 合约变量，我们在 ABI 中加入了 4 个我们要调用的函数：
// balanceOf(address)：查询地址的 WETH 余额。
// deposit()：将转入合约的 ETH 转为 WETH。
// transfer(address, uint256)：转账。
// withdraw(uint256)：取款。

// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
    "function transfer(address, uint) public returns (bool)",
    "function withdraw(uint) public",
]
// WETH合约地址（sepolia测试网）
const addressWETH = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
// WETH Contract

// 声明可写合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)
// 也可以声明一个只读合约，再用connect(wallet)函数转换成可写合约。
// const contractWETH = new ethers.Contract(addressWETH, abiWETH, provider)
// contractWETH.connect(wallet)


//3.读取账户 WETH 余额，可以看到余额为 0。
const address = await wallet.getAddress()
// 读取WETH合约的链上信息（WETH abi）
console.log("\n1. 读取WETH余额")
const balanceWETH = await contractWETH.balanceOf(address)
console.log(`存款前WETH持仓: ${ethers.utils.formatEther(balanceWETH)}\n`)


//4. 调用 WETH 合约的 deposit() 函数，将 0.001 ETH 转换为 0.001 WETH，打印交易详情和余额。deposit() 函数没有参数，可以看到余额变为 0.001。
console.log("\n2. 调用desposit()函数，存入0.001 ETH")
// 发起交易
const tx = await contractWETH.deposit({ value: ethers.parseEther("0.001") })
// 等待交易上链
await tx.wait()
console.log(`交易详情：`)
console.log(tx)
const balanceWETH_deposit = await contractWETH.balanceOf(address)
console.log(`存款后WETH持仓: ${ethers.formatEther(balanceWETH_deposit)}\n`)


//5.调用 WETH 合约的 transfer() 函数，给 Vitalik 转账 0.001 WETH，并打印余额。可以看到余额变为 0 。
console.log("\n3. 调用transfer()函数，给vitalik转账0.001 WETH")
// 发起交易
const tx2 = await contractWETH.transfer("vitalik.eth", ethers.parseEther("0.001"))
// 等待交易上链
await tx2.wait()
const balanceWETH_transfer = await contractWETH.balanceOf(address)
console.log(`转账后WETH持仓: ${ethers.formatEther(balanceWETH_transfer)}\n`)