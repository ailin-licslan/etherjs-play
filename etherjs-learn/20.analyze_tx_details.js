// 如何解码交易详情。

// 未决交易
// 未决交易是用户发出但没被矿工打包上链的交易，在 mempool（交易内存池）中出现。

// 下面是一个转账 ERC20 代币的未决交易，你可以在etherscan上查看交易详情

//红框中是这个交易的 input data，看似杂乱无章的十六进制数据，实际上编码了这笔交易的内容：
// 包括调用的函数，以及输入的参数。我们在 etherscan 点击 Decode Input Data 按钮，就可以解码这段数据：


const ethers = require('ethers')
//创建 provider 和 wallet，监听交易时候推荐用 wss 连接而不是 http。
// 准备 alchemy API 可以参考https://github.com/AmazingAng/WTF-Solidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
const ALCHEMY_MAINNET_WSSURL = 'wss://eth-mainnet.g.alchemy.com/v2/...';
const provider = new ethers.WebSocketProvider(ALCHEMY_MAINNET_WSSURL);
let network = provider.getNetwork()
network.then(res => console.log(`[${(new Date).toLocaleTimeString()}] 连接到 chain ID ${res.chainId}`));

//创建 Interface 对象，用于解码交易详情。
const iface = ethers.Interface([
    "function balanceOf(address) public view returns(uint)",
    "function transfer(address, uint) public returns (bool)",
    "function approve(address, uint256) public returns (bool)"
]);

//获取函数选择器。
const selector = iface.getFunction("transfer").selector
console.log(`函数选择器是${selector}`)

//监听 pending 的 ERC20 转账交易，获取交易详情并解码：

// 处理bigInt
function handleBigInt(key, value) {
    if (typeof value === "bigint") {
        return value.toString() + "n"; // or simply return value.toString();
    }
return value;
}

provider.on('pending', async (txHash) => {
if (txHash) {
    const tx = await provider.getTransaction(txHash)
    j++
    if (tx !== null && tx.data.indexOf(selector) !== -1) {
        console.log(`[${(new Date).toLocaleTimeString()}]监听到第${j + 1}个pending交易:${txHash}`)
        console.log(`打印解码交易详情:${JSON.stringify(iface.parseTransaction(tx), handleBigInt, 2)}`)
        console.log(`转账目标地址:${iface.parseTransaction(tx).args[0]}`)
        console.log(`转账金额:${ethers.formatEther(iface.parseTransaction(tx).args[1])}`)
        provider.removeListener('pending', this)
    }
}})