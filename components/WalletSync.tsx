import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

// Use network-aware storage key (devnet in this case)
const METAMASK_ACCOUNT_STORAGE_KEY = 'metamask-current-account-devnet';

export const WalletSync = () => {
    const { wallet, disconnect } = useWallet();

    useEffect(() => {
        // If no wallet is selected, do nothing
        if (!wallet || !wallet.adapter) return;

        // Define the handler - this is called when the wallet adapter detects an account change
        const handleAccountChange = async () => {
            console.log("[WalletSync] Wallet adapter detected account change!");
            
            // Get current MetaMask account if available
            const ethereum = (window as any).ethereum;
            if (ethereum) {
                try {
                    const currentAccount = ethereum.selectedAddress;
                    if (currentAccount) {
                        // Store the new MetaMask account
                        localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentAccount);
                        console.log("[WalletSync] Stored new MetaMask account:", currentAccount);
                    }
                } catch (e) {
                    console.error("[WalletSync] Error getting MetaMask account:", e);
                }
            }

            // Disconnect first to ensure clean state
            try {
                await disconnect();
                console.log("[WalletSync] Disconnected wallet");
            } catch (e) {
                console.error("[WalletSync] Error disconnecting:", e);
            }

            // Clear all wallet adapter cache
            try {
                const keysToRemove = [
                    'walletName',
                    'solana-wallet-adapter',
                    'solflare-wallet-adapter',
                    'wallet-adapter-solflare',
                    'phantom-wallet-adapter'
                ];
                keysToRemove.forEach(key => localStorage.removeItem(key));
                console.log("[WalletSync] Cleared wallet adapter cache");
            } catch (e) {
                console.error("[WalletSync] Error clearing cache:", e);
            }

            // Force reload after a brief delay to ensure everything is cleaned up
            setTimeout(() => {
                console.log("[WalletSync] Reloading page to sync with new account...");
                window.location.reload();
            }, 100);
        };

        // Listen to the RAW adapter events (this works for MetaMask/Snaps too)
        // We cast to 'any' because standard WalletAdapter types might not expose 'on' directly 
        // depending on the version, but the underlying EventEmitter does.
        const adapter = wallet.adapter as any;

        if (adapter.on) {
            // Listen to accountChanged - this is the critical event for account switching
            // The adapter will emit this when the Solana public key changes
            adapter.on('accountChanged', handleAccountChange);
            console.log("[WalletSync] Listening for accountChanged events on", wallet.adapter.name);
        }

        return () => {
            // Cleanup listeners
            if (adapter.off) {
                adapter.off('accountChanged', handleAccountChange);
            }
        };
    }, [wallet, wallet?.adapter, disconnect]);

    return null;
};
