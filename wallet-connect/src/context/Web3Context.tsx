import  { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ChainConfig, WalletProvider } from '../types/web3';

// 定义 Web3 状态接口
interface Web3State {
  account?: string;
  chainId?: number;
  selectedWallet?: string;
}


// 创建 Web3 上下文
const Web3Context = createContext<{
  state: Web3State;
  connectWallet: (provider: WalletProvider) => Promise<void>;
  switchChain: (chainConfig: ChainConfig) => Promise<void>;
}>({
  state: {},
  connectWallet: async () => {},
  switchChain: async () => {}
});

// Web3 提供器组件
export function Web3Provider({ children, chains }: { children: React.ReactNode; chains: ChainConfig[] }) {
  const [state, setState] = useState<Web3State>({});

  // 监听账户变化
  useEffect(() => {

    const checkAccount = async () => {
      if (typeof window.ethereum!== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setState({
            ...state,
            account: accounts[0],
            chainId: (await provider.getNetwork()).chainId
          });
        }
      }
    };

    checkAccount();

    if (typeof window.ethereum!== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setState({
          ...state,
          account: accounts[0]
        });
      });
      window.ethereum.on('chainChanged', (chainId: number) => {
        setState({
          ...state,
          chainId: Number(chainId)
        });
      });
    }

    return () => {
      if (typeof window.ethereum!== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // 连接钱包方法
  const connectWallet = async (provider: WalletProvider) => {
    if (provider.id ==='metamask' &&!window.ethereum?.isMetaMask) {
      window.open(provider.installUrl, '_blank');
      return;
    }
    if (typeof window.ethereum!== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        const accounts = await web3Provider.send('eth_requestAccounts', []);
        setState({
          ...state,
          account: accounts[0],
          chainId: (await web3Provider.getNetwork()).chainId,
          selectedWallet: provider.id
        });
      } catch (error) {
        console.error('连接失败:', error);
      }
    }
  };

  // 切换链方法
  const switchChain = async (chainConfig: ChainConfig) => {
    if (typeof window.ethereum!== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: `0x${chainConfig.id.toString(16)}`,
            chainName: chainConfig.name,
            rpcUrls: [chainConfig.rpcUrl],
            nativeCurrency: {
              symbol: chainConfig.currencySymbol
            }
          }
        ]);
        setState({
          ...state,
          chainId: chainConfig.id
        });
      } catch (error) {
        console.error('切换链失败:', error);
      }
    }
  };

  return (
      <Web3Context.Provider value={{ state, connectWallet, switchChain }}>
        {children}
      </Web3Context.Provider>
  );
}

// 自定义钩子用于获取 Web3 上下文
export const useWeb3 = () => useContext(Web3Context);