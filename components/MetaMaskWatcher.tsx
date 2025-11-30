import { useEffect } from 'react';

// Use network-aware storage key (devnet in this case)
const METAMASK_ACCOUNT_STORAGE_KEY = 'metamask-current-account-devnet';

export const MetaMaskWatcher = () => {
    useEffect(() => {
        const handleMetaMaskChange = async (accounts: string[]) => {
            console.log("[MetaMaskWatcher] MetaMask account changed:", accounts);
            
            if (!accounts || accounts.length === 0) {
                // Account disconnected
                console.log("[MetaMaskWatcher] MetaMask account disconnected");
                return;
            }
            
            const newAccount = accounts[0];
            const oldAccount = localStorage.getItem(METAMASK_ACCOUNT_STORAGE_KEY);
            
            // Store the new account address
            localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, newAccount);
            console.log("[MetaMaskWatcher] Stored new MetaMask account:", newAccount);
            
            // If account actually changed (not just initial connection)
            if (oldAccount && oldAccount !== newAccount) {
                console.log("[MetaMaskWatcher] Account switch detected:", oldAccount, "->", newAccount);
                
                // Clear ALL wallet-related cache to force fresh derivation
                try {
                    const keysToRemove = [
                        'walletName',
                        'solana-wallet-adapter',
                        'solflare-wallet-adapter',
                        'wallet-adapter-solflare',
                        'phantom-wallet-adapter'
                    ];
                    
                    // Also clear any Solana key mappings
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('solana-key-for-') || key.startsWith('last-solana-key-for-metamask')) {
                            keysToRemove.push(key);
                        }
                    });
                    
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    console.log("[MetaMaskWatcher] Cleared all wallet adapter cache");
                } catch (e) {
                    console.error("[MetaMaskWatcher] Error clearing cache:", e);
                }
                
                // Small delay to ensure MetaMask has processed the account change
                setTimeout(() => {
                    console.log("[MetaMaskWatcher] Reloading to re-derive Solana keys from new MetaMask account...");
                    window.location.reload();
                }, 150);
            } else if (!oldAccount) {
                // First time connecting, just store it
                console.log("[MetaMaskWatcher] First MetaMask account detected:", newAccount);
            }
        };

        const handleFocus = () => {
            // Optional: Check if wallet state matches current provider state
            // For now, a simple log or soft refresh check is good.
            console.log("Window focused - checking wallet state...");
        };

        // 1. Listen to MetaMask specifically
        if ((window as any).ethereum) {
            (window as any).ethereum.on('accountsChanged', handleMetaMaskChange);
        }

        // 2. Listen to Window Focus (User coming back to tab)
        window.addEventListener('focus', handleFocus);

        return () => {
            if ((window as any).ethereum && (window as any).ethereum.removeListener) {
                (window as any).ethereum.removeListener('accountsChanged', handleMetaMaskChange);
            }
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return null;
};
