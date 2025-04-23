// contract.函数名.staticCall(参数, {override})
const ethers = require('ethers')
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/...'
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)

// 利用私钥和provider创建wallet对象
const privateKey = '0f03a73988c990c2333bbbcd99d442377fedbe48083a8a9c4426ace223c33e5d'
const wallet = new ethers.Wallet(privateKey, provider)

// DAI的ABI
const abiDAI = [
  "function balanceOf(address) public view returns(uint)",
  "function transfer(address, uint) public returns (bool)",
]
// DAI合约地址（主网）
const addressDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI Contract

// 创建DAI合约实例
const contractDAI = new ethers.Contract(addressDAI, abiDAI, provider)

const main = async () => {
  try {
    const address = await wallet.getAddress()
    // 1. 读取DAI合约的链上信息
    console.log("\n1. 读取测试钱包的DAI余额")
    const balanceDAI = await contractDAI.balanceOf(address)
    const balanceDAIVitalik = await contractDAI.balanceOf("vitalik.eth")

    console.log(`测试钱包 DAI持仓: ${ethers.formatEther(balanceDAI)}\n`)
    console.log(`vitalik DAI持仓: ${ethers.formatEther(balanceDAIVitalik)}\n`)

    // 2. 用staticCall尝试调用transfer转账1 DAI，msg.sender为Vitalik，交易将成功
    console.log("\n2.  用staticCall尝试调用transfer转账1 DAI，msg.sender为Vitalik地址")
    // 发起交易
    const tx = await contractDAI.transfer.staticCall("vitalik.eth", ethers.parseEther("1"), { from: await provider.resolveName("vitalik.eth") })
    console.log(`交易会成功吗？：`, tx)

    // 3. 用staticCall尝试调用transfer转账10000 DAI，msg.sender为测试钱包地址，交易将失败
    console.log("\n3.  用staticCall尝试调用transfer转账1 DAI，msg.sender为测试钱包地址")
    const tx2 = await contractDAI.transfer.staticCall("vitalik.eth", ethers.parseEther("10000"), { from: address })
    console.log(`交易会成功吗？：`, tx2)

  } catch (e) {
    console.log(e)
  }
}


//总结： ethers.js 将 eth_call 封装在 staticCall 方法中，方便开发者模拟交易的结果，并避免发送可能失败的交易。
// 我们利用 staticCall 模拟了 Vitalik 和测试钱包的转账。当然，这个方法还有更多用处，
// 比如计算土狗币的交易滑点。开动你的想象力，你会将 staticCall 用在什么地方呢？