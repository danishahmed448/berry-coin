import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CONTRACT_ADDRESS, TOKEN_DECIMALS } from '../constants';

export const useBerryBalance = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!publicKey) {
            setBalance(0);
            return;
        }

        const fetchBalance = async () => {
            setLoading(true);
            try {
                const mintAddress = new PublicKey(CONTRACT_ADDRESS);
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    mint: mintAddress,
                });

                if (tokenAccounts.value.length > 0) {
                    // Assuming the user has one account for this token, or we sum them up
                    const totalBalance = tokenAccounts.value.reduce((acc, account) => {
                        const rawAmount = account.account.data.parsed.info.tokenAmount.amount;
                        return acc + (Number(rawAmount) / Math.pow(10, TOKEN_DECIMALS));
                    }, 0);
                    setBalance(totalBalance);
                } else {
                    setBalance(0);
                }
            } catch (error) {
                console.error("Error fetching Berry balance:", error);
                setBalance(0);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();

        // Optional: Set up a subscription or interval to refresh balance
        const intervalId = setInterval(fetchBalance, 10000); // Refresh every 10s

        return () => clearInterval(intervalId);

    }, [connection, publicKey]);

    return { balance, loading };
};
