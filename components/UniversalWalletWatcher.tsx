import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Global state to persist across component remounts
let globalLastSolanaKey: string | null = null;
let globalLastMetaMaskAccount: string | null = null;

// Use network-aware storage key (devnet in this case)
const METAMASK_ACCOUNT_STORAGE_KEY = 'metamask-current-account-devnet';

export const UniversalWalletWatcher = () => {
    const { wallet, disconnect } = useWallet();

    useEffect(() => {
        console.log("UniversalWalletWatcher mounted");
        return () => console.log("UniversalWalletWatcher unmounted");
    }, []);

    // Check MetaMask account on mount - if it changed, clear wallet cache
    useEffect(() => {
        const ethereum = (window as any).ethereum;
        if (!ethereum) return;

        try {
            const currentAccount = ethereum.selectedAddress;
            const storedAccount = localStorage.getItem(METAMASK_ACCOUNT_STORAGE_KEY);

            if (currentAccount && storedAccount && currentAccount !== storedAccount) {
                console.log(`MetaMask account mismatch detected! Stored: ${storedAccount}, Current: ${currentAccount}`);
                console.log("Clearing wallet adapter cache to prevent auto-connect with old account...");
                
                // Clear all wallet adapter storage
                const keysToRemove = [
                    'walletName',
                    'solana-wallet-adapter',
                    'solflare-wallet-adapter',
                    'wallet-adapter-solflare',
                    'phantom-wallet-adapter'
                ];
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Update stored account to current
                localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentAccount);
                
                // Disconnect if connected
                if (wallet && wallet.adapter && wallet.adapter.connected) {
                    disconnect().catch(console.error);
                }
            } else if (currentAccount && !storedAccount) {
                // First time detecting account, store it
                localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentAccount);
                console.log("Stored initial MetaMask account:", currentAccount);
            }
        } catch (e) {
            console.error("Error checking MetaMask account on mount:", e);
        }
    }, []); // Run only on mount

    const aggressiveReload = async (newMetaMaskAccount?: string) => {
        console.log("Watcher: Performing aggressive cleanup...");

        // 1. Store the new MetaMask account if provided
        if (newMetaMaskAccount) {
            localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, newMetaMaskAccount);
            console.log("Watcher: Stored new MetaMask account:", newMetaMaskAccount);
        }

        // 2. Attempt to disconnect (await it this time)
        try {
            await disconnect();
            console.log("Watcher: Disconnected successfully.");
        } catch (e) {
            console.error("Disconnect error:", e);
        }

        // 3. Clear all wallet-adapter related storage to prevent sticky sessions
        try {
            const keysToRemove = [
                'walletName',
                'solana-wallet-adapter',
                'solflare-wallet-adapter',
                'wallet-adapter-solflare',
                'phantom-wallet-adapter'
            ];

            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log("Watcher: Cleared storage keys.");
        } catch (e) {
            // Ignore
        }

        // 4. Force Reload after a brief pause to ensure extension processes the disconnect
        console.log("Watcher: Reloading in 100ms...");
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    // 1. Standard Solana Wallet Polling
    useEffect(() => {
        const checkWallet = setInterval(() => {
            const solana = (window as any).solana;
            const solflare = (window as any).solflare;
            const phantom = (window as any).phantom?.solana;

            let detectedKey: string | null = null;

            if (wallet?.adapter?.name === 'Phantom' && phantom?.publicKey) {
                detectedKey = phantom.publicKey.toString();
            } else if (wallet?.adapter?.name === 'Solflare' && solflare?.publicKey) {
                detectedKey = solflare.publicKey.toString();
            } else if (solana?.publicKey) {
                detectedKey = solana.publicKey.toString();
            }

            if (detectedKey) {
                if (!globalLastSolanaKey) {
                    globalLastSolanaKey = detectedKey;
                    console.log(`Watcher: Initialized Solana key: ${detectedKey}`);
                } else if (globalLastSolanaKey !== detectedKey) {
                    console.log(`Watcher: Solana account change! (${globalLastSolanaKey} -> ${detectedKey})`);
                    globalLastSolanaKey = detectedKey;
                    aggressiveReload();
                }
            }
        }, 500);

        return () => clearInterval(checkWallet);
    }, [wallet, disconnect]);

    // 2. MetaMask Specific Polling - Check for account changes
    useEffect(() => {
        const ethereum = (window as any).ethereum;
        const solflare = (window as any).solflare;
        if (!ethereum) return;

        const checkMetaMask = setInterval(() => {
            try {
                const selectedAddress = ethereum.selectedAddress;
                const storedAccount = localStorage.getItem(METAMASK_ACCOUNT_STORAGE_KEY);

                if (selectedAddress) {
                    if (!globalLastMetaMaskAccount) {
                        globalLastMetaMaskAccount = selectedAddress;
                        // Store initial account
                        localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, selectedAddress);
                        console.log(`[Watcher] Initialized MetaMask account: ${selectedAddress}`);
                    } else if (globalLastMetaMaskAccount !== selectedAddress) {
                        console.log(`[Watcher] ⚠️ MetaMask account change detected! (${globalLastMetaMaskAccount.slice(0, 10)}... -> ${selectedAddress.slice(0, 10)}...)`);
                        
                        // Check if wallet is connected - if so, this is a problem!
                        if (wallet && wallet.adapter && wallet.adapter.connected) {
                            console.error(`[Watcher] ⚠️ CRITICAL: MetaMask account changed while wallet is still connected!`);
                            console.error(`[Watcher] This means the Solana key is from the OLD account!`);
                            console.error(`[Watcher] Forcing immediate disconnect...`);
                            
                            // Disconnect immediately
                            disconnect().catch(console.error);
                        }
                        
                        // Check if Solflare provider has a cached key that might be from the old account
                        if (solflare && solflare.publicKey) {
                            const cachedKey = solflare.publicKey.toString();
                            console.log(`[Watcher] Solflare has cached Solana key: ${cachedKey.slice(0, 8)}...`);
                            console.log(`[Watcher] This key needs to be re-derived from the new MetaMask account`);
                        }
                        
                        globalLastMetaMaskAccount = selectedAddress;
                        // Pass the new account to aggressiveReload so it can be stored
                        aggressiveReload(selectedAddress);
                    } else if (storedAccount && storedAccount !== selectedAddress) {
                        // Stored account doesn't match current - this shouldn't happen but handle it
                        console.warn(`[Watcher] Stored account (${storedAccount.slice(0, 10)}...) doesn't match current (${selectedAddress.slice(0, 10)}...)`);
                        console.warn(`[Watcher] Updating stored account...`);
                        localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, selectedAddress);
                        
                        // If wallet is connected, disconnect it
                        if (wallet && wallet.adapter && wallet.adapter.connected) {
                            console.warn(`[Watcher] Disconnecting wallet due to account mismatch...`);
                            disconnect().catch(console.error);
                        }
                    }
                }
            } catch (e) {
                // Ignore
            }
        }, 500);

        return () => clearInterval(checkMetaMask);
    }, [wallet, disconnect]);

    // 3. Immediate check on connection - verify MetaMask account matches
    useEffect(() => {
        if (!wallet || !wallet.adapter || !wallet.adapter.connected || !wallet.publicKey) {
            return;
        }

        const ethereum = (window as any).ethereum;
        if (!ethereum) return;

        // Only check if using MetaMask-based wallet (Solflare with MetaMask)
        const walletName = wallet.adapter.name?.toLowerCase() || '';
        if (!walletName.includes('solflare') && !walletName.includes('metamask')) {
            return;
        }

        // Immediate check when wallet connects
        const currentMetaMaskAccount = ethereum.selectedAddress;
        const storedMetaMaskAccount = localStorage.getItem(METAMASK_ACCOUNT_STORAGE_KEY);

        if (currentMetaMaskAccount && storedMetaMaskAccount && currentMetaMaskAccount !== storedMetaMaskAccount) {
            console.error(`[Immediate Check] ⚠️ Wallet connected but MetaMask account mismatch!`);
            console.error(`[Immediate Check] Stored: ${storedMetaMaskAccount.slice(0, 10)}...`);
            console.error(`[Immediate Check] Current: ${currentMetaMaskAccount.slice(0, 10)}...`);
            console.error(`[Immediate Check] Forcing immediate disconnect...`);
            
            // Disconnect immediately
            disconnect().then(() => {
                // Clear cache
                const keysToRemove = ['walletName', 'solana-wallet-adapter', 'solflare-wallet-adapter', 'wallet-adapter-solflare', 'phantom-wallet-adapter'];
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('solana-key-for-')) {
                        keysToRemove.push(key);
                    }
                });
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Update stored account and set reconnect flag
                localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentMetaMaskAccount);
                localStorage.setItem('force-wallet-reconnect', 'true');
                
                setTimeout(() => window.location.reload(), 100);
            }).catch(console.error);
            
            return;
        }
    }, [wallet?.adapter?.connected, wallet?.publicKey, disconnect]);

    // 4. Periodic verification - Verify Solana key matches MetaMask account after connection
    // This ensures the Solana key is derived from the current MetaMask account
    useEffect(() => {
        if (!wallet || !wallet.adapter || !wallet.adapter.connected || !wallet.publicKey) {
            return;
        }

        const ethereum = (window as any).ethereum;
        const solflare = (window as any).solflare;
        if (!ethereum) return;

        // Only check if using MetaMask-based wallet (Solflare with MetaMask)
        const walletName = wallet.adapter.name?.toLowerCase() || '';
        if (!walletName.includes('solflare') && !walletName.includes('metamask')) {
            return;
        }
        
        // Also verify Solflare provider's public key matches adapter's public key
        if (solflare && solflare.publicKey) {
            const solflareKey = solflare.publicKey.toString();
            const adapterKey = wallet.publicKey.toString();
            
            if (solflareKey !== adapterKey) {
                console.warn(`[Key Verification] Solflare provider key (${solflareKey.slice(0, 8)}...) doesn't match adapter key (${adapterKey.slice(0, 8)}...)`);
            }
        }

        const checkKeyMatch = async () => {
            try {
                const currentMetaMaskAccount = ethereum.selectedAddress;
                const storedMetaMaskAccount = localStorage.getItem(METAMASK_ACCOUNT_STORAGE_KEY);
                const connectedSolanaKey = wallet.publicKey?.toString();

                if (!currentMetaMaskAccount || !connectedSolanaKey) {
                    return;
                }

                // CRITICAL CHECK: Verify stored MetaMask account matches current
                if (storedMetaMaskAccount && storedMetaMaskAccount !== currentMetaMaskAccount) {
                    // CRITICAL: MetaMask account changed but wallet is still connected with old account's Solana key!
                    console.error(`[Key Verification] ⚠️ CRITICAL: MetaMask account mismatch detected!`);
                    console.error(`[Key Verification] Stored MetaMask: ${storedMetaMaskAccount.slice(0, 10)}...`);
                    console.error(`[Key Verification] Current MetaMask: ${currentMetaMaskAccount.slice(0, 10)}...`);
                    console.error(`[Key Verification] Connected Solana key: ${connectedSolanaKey.slice(0, 8)}...`);
                    console.error(`[Key Verification] This means the Solana key is from the OLD MetaMask account!`);
                    console.error(`[Key Verification] Forcing disconnect and cache clear...`);
                    
                    // Clear all caches
                    const keysToRemove = [
                        'walletName',
                        'solana-wallet-adapter',
                        'solflare-wallet-adapter',
                        'wallet-adapter-solflare',
                        'phantom-wallet-adapter',
                        'force-wallet-reconnect'
                    ];
                    
                    // Clear all Solana key mappings
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('solana-key-for-')) {
                            keysToRemove.push(key);
                        }
                    });
                    
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                    // Update stored account
                    localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentMetaMaskAccount);
                    
                    // Set flag to prevent auto-connect on next load
                    localStorage.setItem('force-wallet-reconnect', 'true');
                    
                    await disconnect();
                    setTimeout(() => window.location.reload(), 200);
                    return;
                }
                
                // Additional check: Compare Solflare provider's key with adapter's key
                if (solflare && solflare.publicKey) {
                    const solflareProviderKey = solflare.publicKey.toString();
                    const adapterKey = connectedSolanaKey;
                    
                    if (solflareProviderKey !== adapterKey) {
                        console.warn(`[Key Verification] Solflare provider key doesn't match adapter key!`);
                        console.warn(`[Key Verification] Provider: ${solflareProviderKey.slice(0, 8)}...`);
                        console.warn(`[Key Verification] Adapter: ${adapterKey.slice(0, 8)}...`);
                        // This might indicate a sync issue, but don't force disconnect unless account mismatch
                    }
                }

                // Store mapping: MetaMask account -> Solana key (for future verification)
                const keyMappingKey = `solana-key-for-${currentMetaMaskAccount.toLowerCase()}`;
                const expectedSolanaKey = localStorage.getItem(keyMappingKey);

                if (expectedSolanaKey && expectedSolanaKey !== connectedSolanaKey) {
                    // The Solana key changed for the same MetaMask account (shouldn't happen, but handle it)
                    console.warn(`[Key Verification] Solana key changed for same MetaMask account!`);
                    console.warn(`[Key Verification] Old key: ${expectedSolanaKey}`);
                    console.warn(`[Key Verification] New key: ${connectedSolanaKey}`);
                    // Update the mapping
                    localStorage.setItem(keyMappingKey, connectedSolanaKey);
                } else if (!expectedSolanaKey) {
                    // First time seeing this MetaMask account with this Solana key, store the mapping
                    localStorage.setItem(keyMappingKey, connectedSolanaKey);
                    console.log(`[Key Verification] Stored mapping: MetaMask ${currentMetaMaskAccount.slice(0, 8)}... -> Solana ${connectedSolanaKey.slice(0, 8)}...`);
                }
            } catch (e) {
                console.error("Error verifying Solana key match:", e);
            }
        };

        // Check after a short delay to allow wallet to fully initialize
        const timeout = setTimeout(checkKeyMatch, 500);
        // Also check periodically
        const interval = setInterval(checkKeyMatch, 2000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [wallet, wallet?.adapter, wallet?.publicKey, disconnect]);

    return null;
};
