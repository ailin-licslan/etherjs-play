import { useWeb3 } from "../context/Web3Context";
import { ChainConfig, WalletProvider } from '../types/web3';
import {useState} from "react";


const WALLETS: WalletProvider[] = [
    {
        id: 'metamask',
        name: 'MetaMask',
        icon: '/wallets/metamask.svg',
        installUrl: 'https://metamask.io/download/'
    },
    {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '/wallets/walletconnect.svg'
    }
];

export default function WalletConnector({ chains }: { chains: ChainConfig[] }) {
    const { state, connectWallet } = useWeb3();
    const [selectedChain, setSelectedChain] = useState(chains[0]);

    return (
        <div className="flex gap-4 items-center">
        {/*    选择下拉框  */}
        <select
            value={selectedChain.id}
    onChange={(e) => setSelectedChain(chains.find(c => c.id === Number(e.target.value))!)}
    className="p-2 border rounded"
        >
        {chains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
))}
    </select>

    {WALLETS.map(wallet => (
        <button
            key={wallet.id}
        onClick={() => connectWallet(wallet)}
        className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
        >
        <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
        {wallet.name}
        </button>
    ))}

    {state.account && (
        <div className="ml-4">
            <span>{state.account.slice(0, 6)}...{state.account.slice(-4)}</span>
    </div>
    )}
    </div>
);
}
