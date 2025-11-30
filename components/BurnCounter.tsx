import React, { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CONTRACT_ADDRESS, BURN_ADDRESS } from '../constants';
import { motion } from 'framer-motion';

export const BurnCounter: React.FC = () => {
    const { connection } = useConnection();
    const [burnedAmount, setBurnedAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBurnedAmount = async () => {
            try {
                const burnAddress = new PublicKey(BURN_ADDRESS);
                const mintAddress = new PublicKey(CONTRACT_ADDRESS);

                const accounts = await connection.getParsedTokenAccountsByOwner(burnAddress, {
                    mint: mintAddress
                });

                let total = 0;
                accounts.value.forEach((account) => {
                    const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
                    if (amount) total += amount;
                });

                setBurnedAmount(total);
            } catch (error) {
                console.error("Error fetching burned amount:", error);
                setBurnedAmount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchBurnedAmount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchBurnedAmount, 30000);
        return () => clearInterval(interval);
    }, [connection]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative group"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            <div className="relative bg-black/60 backdrop-blur-xl border border-orange-500/30 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-2 overflow-hidden">

                {/* Animated Background Flame Tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent opacity-50 pointer-events-none"></div>

                <div className="flex items-center gap-2 z-10">
                    <span className="text-2xl animate-bounce">🔥</span>
                    <h3 className="text-orange-400 font-pirate text-xl tracking-widest uppercase drop-shadow-sm">Total Burned</h3>
                    <span className="text-2xl animate-bounce">🔥</span>
                </div>

                <div className="z-10 mt-2">
                    {loading ? (
                        <div className="h-8 w-32 bg-orange-900/30 animate-pulse rounded"></div>
                    ) : (
                        <span className="text-4xl sm:text-5xl font-pirate font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 drop-shadow-[0_2px_4px_rgba(255,69,0,0.5)] tracking-wider">
                            {new Intl.NumberFormat('en-US').format(burnedAmount)}
                        </span>
                    )}
                </div>

                <p className="text-orange-200/60 text-xs font-mono mt-2 z-10 uppercase tracking-wider">
                    Gone to Davy Jones' Locker
                </p>
            </div>
        </motion.div>
    );
};
