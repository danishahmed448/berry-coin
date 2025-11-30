import React from 'react';
import { SOCIAL_LINKS, SOLSCAN_URL } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-pirate-dark/90 backdrop-blur-sm py-12 border-t-4 border-pirate-wood relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0">
        <div className="text-center lg:text-left">
          <span className="font-pirate text-3xl text-pirate-gold tracking-widest drop-shadow-md">BERRY COIN</span>
          <p className="text-pirate-parchment/80 text-sm mt-2 font-bold font-body">© 2025 The Currency of Freedom.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 font-body font-bold">
          <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="text-pirate-parchment hover:text-pirate-gold transition-all transform hover:scale-110 uppercase tracking-wider text-sm lg:text-base">
            Twitter (X)
          </a>
          <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="text-pirate-parchment hover:text-pirate-gold transition-all transform hover:scale-110 uppercase tracking-wider text-sm lg:text-base">
            Telegram
          </a>
          <a href={SOLSCAN_URL} target="_blank" rel="noreferrer" className="text-pirate-parchment hover:text-pirate-gold transition-all transform hover:scale-110 uppercase tracking-wider text-sm lg:text-base">
            View Contract
          </a>
          <a href={SOCIAL_LINKS.dexscreener} target="_blank" rel="noreferrer" className="text-pirate-parchment hover:text-pirate-gold transition-all transform hover:scale-110 uppercase tracking-wider text-sm lg:text-base">
            DexScreener
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 text-center border-t border-pirate-wood/30 pt-8">
        <p className="text-pirate-parchment/90 text-sm font-mono">
          DISCLAIMER: $BERRY is a meme coin with no intrinsic value or expectation of financial return.
          The coin is for entertainment purposes only.
        </p>
      </div>
    </footer>
  );
};