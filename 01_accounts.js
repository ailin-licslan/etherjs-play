import { ethers } from "ethers"

const INFURA_ID = '00fdc4fc92d945ea9e8b5a0157764xxx'
//https://eth.llamarpc.com
//onst provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)
const provider = new ethers.providers.JsonRpcProvider(`https://eth.llamarpc.com`)

const address = '0x73BCEb1Cd57C711feaC4224D062b0F6ff338501e'

const main = async () => {
    const balance = await provider.getBalance(address)
    console.log(`\nETH Balance of ${address} --> ${ethers.utils.formatEther(balance)} ETH\n`)
}

main()

