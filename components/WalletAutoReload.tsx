import { useEffect, useRef } from 'react';

export const WalletAutoReload = () => {
    const lastKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const checkWallet = setInterval(() => {
            // Check for Solana providers
            // We check solana (Phantom/Standard) and solflare
            const provider = (window as any).solana || (window as any).solflare;

            if (provider && provider.publicKey) {
                const currentKey = provider.publicKey.toString();

                // Initialize ref if empty
                if (!lastKeyRef.current) {
                    lastKeyRef.current = currentKey;
                }
                // If key changed, RELOAD
                else if (lastKeyRef.current !== currentKey) {
                    console.log("Account change detected. Reloading...");
                    window.location.reload();
                }
            }
        }, 500); // Check every 500ms

        return () => clearInterval(checkWallet);
    }, []);

    return null; // This component renders nothing
};
