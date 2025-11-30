import React from 'react';
import { TOKEN_NAME, TOKEN_TICKER } from '../constants';
import { motion } from 'framer-motion';
import { BurnCounter } from './BurnCounter';

export const Hero: React.FC = () => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 lg:px-8 pt-20">

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 mt-8 sm:mt-4 md:mt-0"
      >
        <motion.img
          src="/berry-logo.png"
          alt="Berry Coin Logo"
          className="h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96 mb-4 md:mb-0 mx-auto"
          animate={{ y: [0, -15, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-pirate-gold font-bold tracking-[0.2em] uppercase text-sm sm:text-base mb-4 drop-shadow-md">
            The Era of Freedom Begins
          </h2>
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-pirate font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-8 tracking-wider">
            BERRY COIN
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-pirate-parchment max-w-2xl mx-auto font-body font-medium leading-relaxed drop-shadow-md opacity-90">
            Gather your crew. Hoist the colors. The world's first deflationary treasure currency on Solana.
          </p>
        </motion.div>

        {/* Call to Actions */}
        <motion.div
          className="mt-8 flex gap-6 justify-center flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgb(255, 215, 0)" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-b from-pirate-gold to-[#b8860b] text-pirate-dark font-black rounded-lg text-xl uppercase tracking-widest border border-[#fffacd] shadow-lg"
          >
            Buy $BERRY
          </motion.button>
          <motion.a
            href="#poster"
            whileHover={{ scale: 1.05, backgroundColor: "#5c3d2a", color: "#ffffff", boxShadow: "0px 0px 15px rgba(255, 215, 0, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-pirate-wood text-pirate-parchment font-bold rounded-lg text-xl uppercase tracking-widest border border-pirate-gold shadow-lg flex items-center justify-center"
          >
            Get Wanted Poster
          </motion.a>
        </motion.div>
      </div>

      {/* Stats */}
      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 w-full max-w-4xl border-t border-slate-700 pt-10">
        <div className="flex flex-col">
          <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-400 font-mono">Total Supply</dt>
          <dd className="order-1 text-4xl font-extrabold text-white font-pirate tracking-wider">3T</dd>
        </div>
        <div className="flex flex-col">
          <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-400 font-mono">Tax</dt>
          <dd className="order-1 text-4xl font-extrabold text-white font-pirate tracking-wider">0%</dd>
        </div>
        <div className="flex flex-col">
          <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-400 font-mono">Holders</dt>
          <dd className="order-1 text-4xl font-extrabold text-white font-pirate tracking-wider">Early</dd>
        </div>
      </div>

      {/* Burn Counter */}
      <div className="mt-12 w-full max-w-md mx-auto">
        <BurnCounter />
      </div>

    </div>
  );
};