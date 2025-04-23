// 靓号地址
// 现实生活中，有人追求车牌号“888888”，而在区块链中，大家也追求“靓号地址”。靓号地址（Vanity Address）是个性化的地址，易于识别，并且具有与其它地址一样的安全性。比如以7个0开头的地址：

// 0x0000000fe6a514a32abdcdfcc076c85243de899b
// 是的，这也是知名做市商Wintermute被盗$1.6亿的靓号地址（报道）。刚才我们说了，靓号和普通地址具有一样的安全性，那么这里为什么被攻击了呢？

// 问题出在生成靓号工具存在漏洞。Wintermute使用了一个叫Profinity的靓号生成器来生成地址，但这个生成器的随机种子有问题。本来随机种子应该有2的256次方可能性，但是Profinity使用的种子只有2的32次方的长度，可以被暴力破解。

const ethers = require('ethers')
const fs = require('fs').promises  // 正确导入fs模块的promises接口

// 生成钱包，传入regexList数组并进行匹配，如匹配到则从数组中删除对应regex
async function createWallet (regexList) {
    let wallet
    let isValid = false

    while (!isValid && regexList.length > 0) {
        wallet = ethers.Wallet.createRandom()
        const index = regexList.findIndex(regex => regex.test(wallet.address))
        // 移除匹配的正则表达式
        if (index !== -1) {
            isValid = true
            regexList.splice(index, 1)
        }
    }
    const data = `${wallet.address}:${wallet.privateKey}`
    console.log(data)
    return data
}

// 生成正则匹配表达式，并返回数组
function createRegex (total) {
    const regexList = []
    for (let i = 0; i < total; i++) {
        // 填充3位数字，比如001，002，003，...，999
        const paddedIndex = (i + 1).toString().padStart(3, '0')
        const regex = new RegExp(`^0x${paddedIndex}.*$`)
        regexList.push(regex)
    }
    return regexList
}

// 需要生成的钱包数量
const total = 20

async function main () {
    // 生成正则表达式
    const regexList = createRegex(total)
    // 数组存储生成地址
    const privateKeys = []

    for (let index = 0; index < total; index++) {
        const walletData = await createWallet(regexList)
        privateKeys.push(walletData)
    }

    // 异步写入seeds.txt，因顺序生成钱包地址前三位，使用自带sort()函数即可排序，并在每个地址后添加换行符保存
    await fs.appendFile('seeds.txt', privateKeys.sort().join('\n'))
}

main().catch(console.error) // 运行主程序并捕获可能的错误