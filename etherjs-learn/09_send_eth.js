import { JsonRpcProvider, Wallet, formatEther, parseEther } from 'ethers'

// 利用Alchemy的rpc节点连接以太坊测试网络
const ALCHEMY_SEPOLIA_URL = 'https://eth-sepolia.g.alchemy.com/v2/...'
const provider = new JsonRpcProvider(ALCHEMY_SEPOLIA_URL)

// 创建随机的wallet对象
const wallet1 = Wallet.createRandom()
const wallet1WithProvider = wallet1.connect(provider)
const mnemonic = wallet1.mnemonic // 获取助记词

// 利用私钥和provider创建wallet对象
const privateKey = '0f03a73988c990c2333bbbcd99d442377fedbe48083a8a9c4426ace223c33e5d'
const wallet2 = new Wallet(privateKey, provider)

// 从助记词创建wallet对象
const wallet3 = Wallet.fromPhrase(mnemonic.phrase)

async function getWalletAddresses () {
    const address1 = await wallet1WithProvider.getAddress()
    const address2 = await wallet2.getAddress()
    const address3 = await wallet3.getAddress()

    console.log(`1. 获取钱包地址`)
    console.log(`钱包1地址: ${address1}`)
    console.log(`钱包2地址: ${address2}`)
    console.log(`钱包3地址: ${address3}`)
    console.log(`钱包1和钱包3的地址是否相同: ${address1 === address3}`)
    console.log(`钱包1助记词: ${wallet1.mnemonic.phrase}`)
    console.log(`钱包2私钥: ${wallet2.privateKey}`)
    const txCount1 = await provider.getTransactionCount(wallet1WithProvider)
    const txCount2 = await provider.getTransactionCount(wallet2)
    console.log(`钱包1发送交易次数: ${txCount1}`)
    console.log(`钱包2发送交易次数: ${txCount2}`)
    // 5. 发送ETH
    // 如果这个钱包没sepolia测试网ETH了，去水龙头领一些，钱包地址: 0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2
    // 1. https://faucets.chain.link/
    console.log(`\n5. 发送ETH（测试网）`)
    // i. 打印交易前余额
    console.log(`i. 发送前余额`)
    console.log(`钱包1: ${formatEther(await provider.getBalance(wallet1WithProvider))} ETH`)
    console.log(`钱包2: ${formatEther(await provider.getBalance(wallet2))} ETH`)
    // ii. 构造交易请求，参数：to为接收地址，value为ETH数额
    const tx = {
        to: address1,
        value: parseEther("0.001")
    }
    // iii. 发送交易，获得收据
    console.log(`\nii. 等待交易在区块链确认（需要几分钟）`)
    const receipt = await wallet2.sendTransaction(tx)
    await receipt.wait() // 等待链上确认交易
    console.log(receipt) // 打印交易详情
    // iv. 打印交易后余额
    console.log(`\niii. 发送后余额`)
    console.log(`钱包1: ${formatEther(await provider.getBalance(wallet1WithProvider))} ETH`)
    console.log(`钱包2: ${formatEther(await provider.getBalance(wallet2))} ETH`)
}

getWalletAddresses()