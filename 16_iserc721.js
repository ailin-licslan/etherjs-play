const ethers = require('ethers')

//准备 alchemy API
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/'
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)

// 合约abi
const abiERC721 = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function supportsInterface(bytes4) public view returns(bool)",
]
// ERC721的合约地址，这里用的BAYC
const addressBAYC = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
// 创建ERC721合约实例
const contractERC721 = new ethers.Contract(addressBAYC, abiERC721, provider)

// ERC721接口的ERC165 identifier
const selectorERC721 = "0x80ac58cd"

const main = async () => {
  try {
    // 1. 读取ERC721合约的链上信息
    const nameERC721 = await contractERC721.name()
    const symbolERC721 = await contractERC721.symbol()
    console.log("\n1. 读取ERC721合约信息")
    console.log(`合约地址: ${addressBAYC}`)
    console.log(`名称: ${nameERC721}`)
    console.log(`代号: ${symbolERC721}`)

    // 2. 利用ERC165的supportsInterface，确定合约是否为ERC721标准
    const isERC721 = await contractERC721.supportsInterface(selectorERC721)
    console.log("\n2. 利用ERC165的supportsInterface，确定合约是否为ERC721标准")
    console.log(`合约是否为ERC721标准: ${isERC721}`)
  } catch (e) {
    // 如果不是ERC721，则会报错
    console.log(e)
  }
}

main()

//总结： 介绍如何 ethers.js 来识别一个合约是否为 ERC721。由于利用了 ERC165 标准，
// 因此只有支持 ERC165 标准的合约才能用这个方法识别，包括 ERC721，ERC1155 等。
// 但是像 ERC20 这种不支持 ERC165 的标准，就要用别的方法识别了。你知道怎么检查一个合约是否为 ERC20 吗？