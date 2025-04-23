//如何读取 mempool（交易内存池）中的交易
// MEV
// MEV（Maximal Extractable Value，最大可提取价值）是个令人着迷的话题。大部分人对它很陌生，因为在支持智能合约的区块链被发明之前它并不存在。它是科学家的盛宴，矿场的友人，散户的噩梦。

// 在区块链中，矿工可以通过打包、排除或重新排序他们产生的区块中的交易来获得一定的利润，而 MEV 是衡量这种利润的指标。

// Mempool
// 在用户的交易被矿工打包进以太坊区块链之前，所有交易会汇集到 Mempool（交易内存池）中。矿工也是在这里寻找费用高的交易优先打包，实现利益最大化。通常来说，gas price 越高的交易，越容易被打包。

// 同时，一些 MEV 机器人也会搜索 mempool 中有利可图的交易。比如，一笔滑点设置过高的 swap 交易可能会被三明治攻击：通过调整 gas，机器人会在这笔交易之前插一个买单，之后发送一个卖单，等效于把把代币以高价卖给用户（抢跑）。



// provider.on("pending", listener)
const ethers = require('ethers')
// 1. 创建provider和wallet，监听事件时候推荐用wss连接而不是http
console.log("\n1. 连接 wss RPC")

const ALCHEMY_MAINNET_WSSURL = 'wss://eth-sepolia.g.alchemy.com/v2/...'
const provider = new ethers.WebSocketProvider(ALCHEMY_MAINNET_WSSURL)
let network = provider.getNetwork()
// network.then(res => console.log(`[${(new Date).toLocaleTimeString()}] 连接到 chain ID ${res.chainId}`));

console.log("\n2. 限制调用rpc接口速率")
// 2. 限制访问rpc速率，不然调用频率会超出限制，报错。
function throttle (fn, delay) {
    let timer
    return function () {
        if (!timer) {
            fn.apply(this, arguments)
            timer = setTimeout(() => {
                clearTimeout(timer)
                timer = null
            }, delay)
        }
    }
}

const main = async () => {
    let i = 0
    // 3. 监听pending交易，获取txHash
    console.log("\n3. 监听pending交易，打印txHash。")
    provider.on("pending", async (txHash) => {
        if (txHash && i < 100) {
            // 打印txHash
            console.log(`[${(new Date).toLocaleTimeString()}] 监听Pending交易 ${i}: ${txHash} \r`)
            i++
        }
    })

    // 4. 监听pending交易，并获取交易详情
    console.log("\n4. 监听pending交易，获取txHash，并输出交易详情。")
    let j = 0
    provider.on("pending", throttle(async (txHash) => {
        if (txHash && j <= 100) {
            // 获取tx详情
            let tx = await provider.getTransaction(txHash)
            console.log(`\n[${(new Date).toLocaleTimeString()}] 监听Pending交易 ${j}: ${txHash} \r`)
            console.log(tx)
            j++
        }
    }, 1000))
}

main()

//总结： 简单介绍了 MEV 和 mempool，并写了个脚本监听 mempool 的未决交易