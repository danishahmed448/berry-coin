import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero';
import { WantedPosterGenerator } from './components/WantedPosterGenerator';
import { Tokenomics } from './components/Tokenomics';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { GoldDust } from './components/GoldDust';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { UniversalWalletWatcher } from './components/UniversalWalletWatcher';
import { WalletSync } from './components/WalletSync';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { NETWORK } from './constants';

// Default styles
import '@solana/wallet-adapter-react-ui/styles.css';

// --- HELPER COMPONENTS (Defined OUTSIDE App) ---

const WalletRedirector = () => {
  const { wallet, select } = useWallet();
  const hasRedirected = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Effect 1: Clear invalid selection
  useEffect(() => {
    if (mounted.current && wallet && wallet.adapter.readyState === 'NotDetected') {
      console.log('Clearing invalid wallet selection');
      select(null);
    }
  }, [wallet, select]);

  // Effect 2: Handle Redirects
  useEffect(() => {
    if (!mounted.current) return;

    if (wallet) {
      const { adapter } = wallet;
      if (adapter.readyState === 'NotDetected' && !hasRedirected.current) {
        if (adapter.name === 'Phantom') {
          console.log('Phantom selected but not detected. Redirecting...');
          hasRedirected.current = true;
          window.open('https://phantom.app/', '_blank');
        } else if (adapter.name === 'Solflare') {
          console.log('Solflare selected but not detected. Redirecting...');
          hasRedirected.current = true;
          window.open('https://solflare.com/', '_blank');
        }
      }
    } else {
      hasRedirected.current = false;
    }
  }, [wallet]);

  return null;
};

const WalletDebugger = () => {
  const { wallets } = useWallet();
  useEffect(() => {
    console.log('Available Wallets:', wallets.map(w => ({
      name: w.adapter.name,
      readyState: w.readyState,
      url: w.adapter.url
    })));
  }, [wallets]);
  return null;
};

// --- MAIN APP COMPONENT ---

// Network-aware storage keys to prevent cross-network conflicts
// Using 'devnet' suffix to match your Solana network configuration
const METAMASK_ACCOUNT_STORAGE_KEY = 'metamask-current-account-devnet';
const SOLANA_KEY_FOR_METAMASK_KEY = 'last-solana-key-for-metamask-devnet';

const App: React.FC = () => {
  // Network setup
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure wallets - include WalletConnect for mobile support
  // Get your WalletConnect Project ID from https://cloud.walletconnect.com/
  // Add it to .env.local as: VITE_WALLETCONNECT_PROJECT_ID=your_project_id
  // IMPORTANT: In WalletConnect Cloud, whitelist ALL origins:
  //   - http://localhost:3000
  //   - http://127.0.0.1:3000
  //   - http://YOUR_IP:3000 (e.g., http://10.210.19.40:3000)
  const wallets = useMemo(
    () => {
      const walletList = [];

      // Add WalletConnect adapter for mobile wallet support
      try {
        const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c07c0171c6a3564981b06a3e1b583d4c';

        // Log current origin for debugging
        const currentOrigin = window.location.origin;
        console.log('[WalletConnect] Current origin:', currentOrigin);
        console.log('[WalletConnect] Make sure this origin is whitelisted in WalletConnect Cloud dashboard');

        if (!projectId || projectId === 'c07c0171c6a3564981b06a3e1b583d4c') {
          console.warn('[WalletConnect] Using default test project ID. For production, set VITE_WALLETCONNECT_PROJECT_ID in .env.local');
        } else {
          console.log('[WalletConnect] Using project ID from environment');
        }

        walletList.push(
          new WalletConnectWalletAdapter({
            network: network,
            options: {
              projectId: projectId,
              metadata: {
                name: 'Berry Coin',
                description: 'The world\'s first deflationary treasure currency on Solana',
                url: currentOrigin,
                icons: [`${currentOrigin}/favicon.ico`],
              },
            },
          })
        );
      } catch (error) {
        console.error('Failed to initialize WalletConnect adapter:', error);
      }

      return walletList;
    },
    [network]
  );

  // Check if we should disable auto-connect due to MetaMask account mismatch
  const [shouldAutoConnect, setShouldAutoConnect] = useState(true);

  const onError = (error: any, adapter?: any) => {
    console.error('Wallet Error:', error);
    if (adapter) console.log('Adapter:', adapter.name);

    // Handle WalletConnect specific errors
    if (adapter?.name === 'WalletConnect') {
      // Check for origin/authorization errors
      if (error?.message?.includes('Unauthorized') ||
        error?.message?.includes('origin not allowed') ||
        error?.message?.includes('code: 3000')) {
        const currentOrigin = window.location.origin;
        console.error('[WalletConnect] ⚠️ Origin not whitelisted error!');
        console.error('[WalletConnect] Current origin:', currentOrigin);
        console.error('[WalletConnect] Please add this origin to your WalletConnect Cloud project:');
        console.error('[WalletConnect] 1. Go to https://cloud.walletconnect.com/');
        console.error('[WalletConnect] 2. Select your project');
        console.error('[WalletConnect] 3. Go to Settings > App Settings');
        console.error('[WalletConnect] 4. Add this origin to the whitelist:', currentOrigin);
        console.error('[WalletConnect] Also add:', window.location.hostname === 'localhost' ? 'http://127.0.0.1:3000' : `http://${window.location.hostname}:3000`);
        return; // Don't show as critical, but log the instructions
      }

      // Filter out WebSocket connection errors that are common and usually non-critical
      if (error?.message?.includes('Connection interrupted') ||
        error?.message?.includes('Fatal socket error') ||
        error?.message?.includes('WebSocket')) {
        console.warn('[WalletConnect] WebSocket connection issue (usually non-critical):', error.message);
        return; // Don't show these as critical errors
      }
    } else {
      // Filter out WebSocket connection errors for other wallets
      if (error?.message?.includes('Connection interrupted') ||
        error?.message?.includes('Fatal socket error') ||
        error?.message?.includes('WebSocket')) {
        console.warn('[Wallet] WebSocket connection issue (usually non-critical):', error.message);
        return; // Don't show these as critical errors
      }
    }

    if (error.name === 'WalletNotReadyError' || error.name === 'WalletLoadError') {
      if (adapter?.name === 'Phantom') {
        window.open('https://phantom.app/', '_blank');
      } else if (adapter?.name === 'Solflare') {
        window.open('https://solflare.com/', '_blank');
      }
    }
  };

  // Check MetaMask account on mount BEFORE WalletProvider auto-connects
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    const solflare = (window as any).solflare;

    if (ethereum) {
      try {
        // Check MetaMask network for debugging
        ethereum.request({ method: 'eth_chainId' }).then((chainId: string) => {
          const networkMap: { [key: string]: string } = {
            '0x1': 'Ethereum Mainnet',
            '0x5': 'Goerli Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Mumbai Testnet'
          };
          const networkName = networkMap[chainId] || `Unknown (${chainId})`;
          console.log(`[App] MetaMask is on: ${networkName} (Chain ID: ${chainId})`);
          console.log(`[App] Solana is on: Devnet`);
          console.log(`[App] Note: MetaMask network doesn't affect Solana key derivation, but account switching should still work`);
        }).catch(() => {
          console.log(`[App] Could not detect MetaMask network`);
        });

        const currentAccount = ethereum.selectedAddress;
        const storedAccount = localStorage.getItem(METAMASK_ACCOUNT_STORAGE_KEY);

        // Check if MetaMask account changed
        if (currentAccount && storedAccount && currentAccount !== storedAccount) {
          console.log(`[App] MetaMask account mismatch detected! Stored: ${storedAccount}, Current: ${currentAccount}`);
          console.log("[App] Clearing wallet adapter cache and disabling auto-connect...");

          // Clear all wallet adapter storage BEFORE auto-connect runs
          const keysToRemove = [
            'walletName',
            'solana-wallet-adapter',
            'solflare-wallet-adapter',
            'wallet-adapter-solflare',
            'phantom-wallet-adapter',
            SOLANA_KEY_FOR_METAMASK_KEY
          ];

          // Clear all Solana key mappings
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('solana-key-for-')) {
              keysToRemove.push(key);
            }
          });

          keysToRemove.forEach(key => localStorage.removeItem(key));

          // Update stored account to current
          localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentAccount);

          // If Solflare provider exists, check if it has a cached public key
          if (solflare && solflare.publicKey) {
            const cachedSolanaKey = solflare.publicKey.toString();
            console.log(`[App] Solflare has cached Solana key: ${cachedSolanaKey.slice(0, 8)}...`);
            console.log(`[App] This key is from the OLD MetaMask account - will need to reconnect`);

            // Store a flag to force reconnection
            localStorage.setItem('force-wallet-reconnect', 'true');
          }

          // Disable auto-connect to force manual reconnection with new account
          setShouldAutoConnect(false);
        } else if (currentAccount && !storedAccount) {
          // First time detecting account, store it
          localStorage.setItem(METAMASK_ACCOUNT_STORAGE_KEY, currentAccount);
          console.log("[App] Stored initial MetaMask account:", currentAccount);

          // Check if we need to force reconnect
          const forceReconnect = localStorage.getItem('force-wallet-reconnect');
          if (forceReconnect === 'true') {
            localStorage.removeItem('force-wallet-reconnect');
            setShouldAutoConnect(false);
          } else {
            setShouldAutoConnect(true);
          }
        } else {
          // Check if we need to force reconnect
          const forceReconnect = localStorage.getItem('force-wallet-reconnect');
          if (forceReconnect === 'true') {
            localStorage.removeItem('force-wallet-reconnect');
            setShouldAutoConnect(false);
          } else {
            setShouldAutoConnect(true);
          }
        }
      } catch (e) {
        console.error("[App] Error checking MetaMask account:", e);
        setShouldAutoConnect(true);
      }
    }
  }, []); // Run only once on mount

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect={shouldAutoConnect} onError={onError}>
        <WalletModalProvider>
          <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020617] to-black">
              <GoldDust />
            </div>

            {/* Wallet Helpers (now properly children of WalletProvider) */}
            <WalletDebugger />
            <WalletSync />
            <UniversalWalletWatcher />
            <WalletRedirector />

            <Navbar />


            <main className="flex-grow z-10 space-y-12 pb-12">
              <section id="home">
                <Hero />
              </section>

              <section id="poster">
                <WantedPosterGenerator />
              </section>

              <section id="about">
                <Tokenomics />
              </section>
            </main>

            <Footer />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
