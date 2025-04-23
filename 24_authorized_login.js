// 介绍如何通过 ethers.js 在网页上连接小狐狸钱包，实现 MetaMask 签名授权后完成登录功能

// Metamask
// Metamask（小狐狸）钱包是以太坊最受欢迎的开源钱包，它可以作为 PC 端的浏览器插件或移动端（安卓和苹果）的 APP 使用。

// 在使用 Metamask 开发前，你需要先下载它。记住：

// 一定要在官网上下载: https://metamask.io/download/

// 重要的事情说三遍。很多多用户钱包被盗，就是下载了盗版的小狐狸钱包之后输入了助记词/私钥。

// 连接 metamask
// 在安装好 metamask 钱包后，浏览器会给每个页面注入一个 window.ethereum 对象，用于和钱包交互。ethers.js 提供的 BrowserProvider 封装了一个标准的 Web3 Provider，直接在程序中生成一个 provider 对象，方便使用：




//引入 ethers.js 包，获取页面中的按钮和文本变量，给按钮加一个监听器，被点击时会触发 onClickHandler() 函数。
import {ethers} from "https://cdn-cors.ethers.io/lib/ethers-5.6.9.esm.min.js";
const signButton = document.querySelector('.sign');
const showAccount = document.querySelector('.showAccount');
const showNonce = document.querySelector('.showNonce');
const showSignature = document.querySelector('.showSignature');
const showSignStatus = document.querySelector('.showSignStatus');

signButton.addEventListener(`click`, onClickHandler)


//接下来我们创建一个变量模拟后台数据库，保存着用户的信息
//假设这是后台的数据库，users表里保存了user对象，user对象包含用户的地址和关联的nonce
 //{"address": 用户地址, "nonce": 返回给前端的随机数nonce}
 export const users = {}


 
 // 写模拟后台接口的方法：通过地址获取后端生成的随机数 nonce，用于签名
/**
 * 通过地址获取后端生成的随机数 nonce，用于签名
 * @param address  用户地址
 * @returns {number} 返回随机数 nonce
 *
 * 这个方法充当后台服务，从后台中获取需要签名的数据
 */
function auth(address) {
    let user = users[address]
    if (!user) {
        user = {
            address,
            nonce: Math.floor(Math.random() * 10000000)
        }
        users[address] = user
    } else {
        const nonce = Math.floor(Math.random() * 10000000)
        user.nonce = nonce
        users[address] = user
    }
    return user.nonce
}







//写模拟后台接口的方法：验证用户签名是否正确
/**
 * 验证用户签名是否正确
 * @param address   用户地址
 * @param signature 签名数据
 * @returns {boolean} 返回签名是否正确
 *
 * 这个方法充当后台服务，后台验证签名正确后，就返回相关登录态数据，完成登录流程
 */
function verify(address, signature) {
    let signValid = false
    console.log(`address: ${address}`)
    //从数据库中取出nonce
    let nonce = users[address].nonce
    console.log(`nonce: ${nonce}`)
    //验证对nonce进行签名的地址
    const decodedAddress = ethers.verifyMessage(nonce.toString(), signature.toString())
    console.log(`decodedAddress: ${decodedAddress}`)
    //比较地址和签名的地址是否一致
    if (address.toLowerCase() === decodedAddress.toLowerCase()) {
        signValid = true
        //出于安全原因，更改nonce，防止下次直接使用相同的nonce进行登录
        users[address].nonce = Math.floor(Math.random() * 10000000)
    }
    return signValid
}









//我们写 onClickHandler() 函数的内容，首先连接 metamask，创建 provider 变量，获取后端需要签名的接口数据，拿到数据后进行签名，再次请求后端验证签名是否正确
// 前端签名流程
async function onClickHandler() {
    console.log("连接钱包")
    // 获得provider
    const provider = new ethers.Web3Provider(window.ethereum)
    // 读取钱包地址
    const accounts = await provider.send("eth_requestAccounts", []);
    const account = accounts[0]
    console.log(`钱包地址: ${account}`)
    showAccount.innerHTML = account;

    //从后台获取需要进行签名的数据
    const nonce = auth(account);
    showNonce.innerHTML = nonce;
    console.log(`获取后台需要签名的数据: ${nonce}`)
    //签名
    const signer = await provider.getSigner()
    const signature = await signer.signMessage(nonce.toString())
    showSignature.innerHTML = signature;
    //去后台验证签名，完成登录
    const signStatus = verify(account, signature);
    showSignStatus.innerHTML = signStatus;
}












// 在项目中的运用
// 最大的用处就是通过这种登录方式让 以太坊地址(EVM)用户 登录到 中心化平台

// 如何使用 Metamask 进行一键式登录流程

// 一键式登录流程的基本思想是，通过使用私钥对一段数据进行签名，可以很容易地通过加密方式证明帐户的所有权。如果您设法签署由我们的后端生成的精确数据，那么后端将认为您是该钱包地址的所有者。因此，我们可以构建基于消息签名的身份验证机制，并将用户的钱包地址作为其标识符。

// 在项目设计中，整个登录流程如何工作

// 第 1 步：后台用户数据表（后端）：后端保存 address 和 address 对应的 nonce
// 第 2 步：生成随机数（后端）：对于数据库中的每个 address，在 nonce 字段中生成随机字符串
// 第 3 步：用户获取他们的随机数（前端）：通过后端接口拿到 address 的 nonce
// 第 4 步：用户签署 Nonce（前端）：对 nonce 进行签名
// 第 5 步：签名验证（后端）：根据请求消息体中 address 获取数据库中的对应用户，特别是它相关的随机数 nonce ，然后对签名进行校验，检验成功证明了拥有钱包地址的所有权，然后可以将 JWT 或会话标识符返回到前端，完成登录
// 第 6 步：更改 Nonce（后端）：修改 nonce，防止用户相同的 nonce 和签名再次进行登录（防止泄露）
// PS：这里的 nonce 可以是一个需要签名的字符串，不是说一定是随机数也可以是类似这样的；很多项目 sign 都不是单独的一个 nonce，通常会带上一些其他内容

// 类似这样

// Sign up with Ethereum to the app.
// URI: https://app.xxxx.com
// Version: 1
// Chain ID: 1
// Nonce: 6971359
// Issued At: 2023-02-16T06:03:49.534Z