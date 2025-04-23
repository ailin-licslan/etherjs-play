const ethers = require('ethers');
// 利用Alchemy的rpc节点连接以太坊测试网络
// const ALCHEMY_SEPOLIA_URL = 'https://eth-sepolia.g.alchemy.com/v2/....';
// const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL);

// // WETH ABI，只包含我们关心的Transfer事件
// const abiWETH = [
//     "event Transfer(address indexed from, address indexed to, uint amount)"
// ];

// // 测试网WETH地址
// const addressWETH = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
// // 声明合约实例
// const contract = new ethers.Contract(addressWETH, abiWETH, provider)


//ethers.js 中的合约类提供了 contract.filters 来简化过滤器的创建：
//const filter = contract.filters.EVENT_NAME( ...args )


//过滤来自 myAddress 地址的 Transfer 事件
//contract.filters.Transfer(myAddress)

//过滤所有发给 myAddress 地址的 Transfer 事件
//contract.filters.Transfer(null, myAddress)

//过滤所有从 myAddress 发给 otherAddress 的 Transfer 事件
//contract.filters.Transfer(myAddress, otherAddress)

//过滤所有发给 myAddress 或 otherAddress 的 Transfer 事件
//contract.filters.Transfer(null, [ myAddress, otherAddress ])




// 监听交易所的 USDT 转账
// 从币安交易所转出 USDT 的交易
// 监听 USDT 合约之前，我们需要先看懂交易日志 Logs，包括事件的 topics 和 data。我们先找到一笔从币安交易所转出 USDT 的交易，然后通过 hash 在 etherscan 查它的详情：

// 交易哈希：0xab1f7b575600c4517a2e479e46e3af98a95ee84dd3f46824e02ff4618523fff5

// 该交易做了一件事：从 binance14 （币安热钱包）向地址 0x354de44bedba213d612e92d3248b899de17b0c58 转账 2983.98 USDT。

// 查看该事件日志 Logs 信息：
// address：USDT 合约地址
// topics[0]：事件哈希，keccak256("Transfer(address,address,uint256)")
// topics[1]：转出地址（币安交易所热钱包）。
// topics[2] 转入地址。
// data：转账数量。


//创建 provider，abi，和 USDT 合约变量：
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL);
// 合约地址
const addressUSDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
// 交易所地址
const accountBinance = '0x28C6c06298d514Db089934071355E5743bf21d60'
// 构建ABI
const abi = [
  "event Transfer(address indexed from, address indexed to, uint value)",
  "function balanceOf(address) public view returns(uint)",
];
// 构建合约对象
const contractUSDT = new ethers.Contract(addressUSDT, abi, provider);

//读取币安热钱包 USDT 余额。可以看到，当前币安热钱包有 1 亿多枚 USDT
const balanceUSDT = await contractUSDT.balanceOf(accountBinance)
console.log(`USDT余额: ${ethers.formatUnits(balanceUSDT,6)}\n`)


//创建过滤器，监听 USDT 转入币安的事件。
// 2. 创建过滤器，监听转移USDT进交易所
console.log("\n2. 创建过滤器，监听USDT转进交易所")
let filterBinanceIn = contractUSDT.filters.Transfer(null, accountBinance);
console.log("过滤器详情：")
console.log(filterBinanceIn);
contractUSDT.on(filterBinanceIn, (res) => {
  console.log('---------监听USDT进入交易所--------');
  console.log(
    `${res.args[0]} -> ${res.args[1]} ${ethers.formatUnits(res.args[2],6)}`
  )
})

//创建过滤器，监听 USDT 转出币安的交易。

// 3. 创建过滤器，监听交易所转出USDT
let filterToBinanceOut = contractUSDT.filters.Transfer(accountBinance);
console.log("\n3. 创建过滤器，监听USDT转出交易所")
console.log("过滤器详情：")
console.log(filterToBinanceOut);
contractUSDT.on(filterToBinanceOut, (res) => {
  console.log('---------监听USDT转出交易所--------');
  console.log(
    `${res.args[0]} -> ${res.args[1]} ${ethers.formatUnits(res.args[2],6)}`
  )
}
);


//总结： 我们介绍了事件过滤器，并用它监听了与币安交易所热钱包相关的 USDT 交易。
// 你可以用它监听任何你感兴趣的交易，发现 smart money 做了哪些新交易，NFT 大佬冲了哪些新项目，等等。