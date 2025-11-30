import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletContextState } from '../types';

const MockWalletContext = createContext<WalletContextState | null>(null);

export const useWallet = () => {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a MockWalletProvider');
  }
  return context;
};

export const MockWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);

  const connect = async () => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setConnected(true);
    setPublicKey("8xRt...Jk29"); // Mock public key
    setBalance(1500000); // Mock starting balance of BERRY
  };

  const disconnect = async () => {
    setConnected(false);
    setPublicKey(null);
    setBalance(0);
  };

  return (
    <MockWalletContext.Provider value={{ connected, publicKey, connect, disconnect, balance }}>
      {children}
    </MockWalletContext.Provider>
  );
};