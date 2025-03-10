import type { RecordModel } from 'pocketbase'; 

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  address: string;
  created: string;
  updated: string;
}

export interface Token {
  id: string;
  ticker: string;
  tokenId: string;
  name: string;
  network: string;
  contract_address?: string;
  decimal_place: string;
  iconUrl: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}
