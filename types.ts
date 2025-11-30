export interface WalletContextState {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  balance: number;
}

export interface PosterConfig {
  name: string;
  bounty: number;
  image: string | null; // Data URL
  nickname: string;
}

export enum Section {
  HOME = 'home',
  POSTER = 'poster',
  ABOUT = 'about'
}