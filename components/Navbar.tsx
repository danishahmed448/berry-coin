import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { TOKEN_TICKER, COLORS } from '../constants';

export const Navbar: React.FC = () => {
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  if (publicKey) {
    console.log(publicKey.toBase58().slice(0, 4))
  }

  const handleConnect = () => {
    setVisible(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-pirate-dark/95 backdrop-blur-md border-b-4 border-pirate-wood shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-3">
            <span className="text-2xl font-pirate text-pirate-gold tracking-widest drop-shadow-md">BERRY COIN</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 lg:ml-10 flex items-baseline space-x-4 lg:space-x-8">
              <a href="#home" className="text-pirate-parchment hover:text-pirate-gold px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors font-body whitespace-nowrap">Ship's Deck</a>
              <a href="#poster" className="text-pirate-parchment hover:text-pirate-gold px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors font-body whitespace-nowrap">Bounty Board</a>
              <a href="#about" className="text-pirate-parchment hover:text-pirate-gold px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors font-body whitespace-nowrap">The Code</a>
            </div>
          </div>

          <div>
            <button
              onClick={connected ? disconnect : () => setVisible(true)}
              title={connected ? "Click to disconnect. If you switched accounts in your wallet, disconnect and reconnect to sync." : "Connect your Solana wallet"}
              className={`whitespace-nowrap px-4 lg:px-6 py-2 rounded-sm text-xs lg:text-sm font-bold uppercase tracking-wide lg:tracking-widest transition-all shadow-[0_0_10px_rgba(255,215,0,0.2)] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] ${connected
                ? 'bg-pirate-dark text-red-400 border-2 border-red-900/50 hover:border-red-500 hover:text-red-300'
                : 'bg-pirate-wood hover:bg-[#5c3d2a] text-pirate-gold border-2 border-pirate-gold'
                }`}
            >
              {connected && publicKey
                ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                : 'Connect Wallet'
              }
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};