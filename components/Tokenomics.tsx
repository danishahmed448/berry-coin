import React from 'react';
import { TOTAL_SUPPLY, SOLSCAN_URL } from '../constants';

export const Tokenomics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-pirate text-pirate-gold tracking-wider mb-4 drop-shadow-md">The Pirate Code</h2>
        <p className="text-xl text-pirate-parchment font-body max-w-2xl mx-auto">
          Our laws are simple. The treasure grows, the weak are left behind.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="order-2 lg:order-1 space-y-8">
          <div className="bg-black/30 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-300 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-pirate-gold rounded-full flex items-center justify-center border-4 border-pirate-dark z-10 shadow-lg">
              <span className="text-2xl">☠️</span>
            </div>
            <h3 className="text-2xl font-pirate text-pirate-gold mb-4 border-b border-pirate-gold/20 pb-2 drop-shadow-sm">0% Tax</h3>
            <p className="text-pirate-parchment font-body font-medium leading-relaxed opacity-90">
              No tribute to the captain. Every doubloon you trade stays in your chest. We believe in true freedom of the seas.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 transform -rotate-1 hover:rotate-0 transition-transform duration-300 relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-pirate-gold rounded-full flex items-center justify-center border-4 border-pirate-dark z-10 shadow-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-2xl font-pirate text-pirate-gold mb-4 border-b border-pirate-gold/20 pb-2 drop-shadow-sm">Deflationary Burn</h3>
            <p className="text-pirate-parchment font-body font-medium leading-relaxed opacity-90">
              The supply shrinks like a ship sailing into the horizon. Scarcity creates value for the true holders.
            </p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <img
            src="https://i.ibb.co/TBdYtzCY/Gemini-Generated-Image-a1klkaa1klkaa1kl.png"
            alt="Pirate Treasure Map"
            className="rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.2)] border border-pirate-gold/50 transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src="https://i.ibb.co/Pv1cgqq1/Gemini-Generated-Image-aoxgqlaoxgqlaoxg.png"
            alt="Pirate Crew"
            className="rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.2)] border border-pirate-gold/50 transform hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="space-y-8">
          <div className="bg-black/30 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-300 relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-pirate-gold rounded-full flex items-center justify-center border-4 border-pirate-dark z-10 shadow-lg">
              <span className="text-2xl">⚓</span>
            </div>
            <h3 className="text-2xl font-pirate text-pirate-gold mb-4 border-b border-pirate-gold/20 pb-2 drop-shadow-sm">Community Driven</h3>
            <p className="text-pirate-parchment font-body font-medium leading-relaxed opacity-90">
              No central authority. The crew decides the course. Join the fleet and have your say in the governance of the seven seas.
            </p>
          </div>

          <div className="text-center pt-4">
            <a href={SOLSCAN_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-pirate-dark text-pirate-gold font-bold rounded-lg uppercase tracking-widest border border-pirate-gold hover:bg-pirate-gold hover:text-pirate-dark transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]">
              View Contract
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
