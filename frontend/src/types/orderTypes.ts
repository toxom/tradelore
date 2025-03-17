import type { RecordModel } from 'pocketbase'; 

export interface Orderbook {
  userId: string;
  id: string;
  type: string;
  pairId: string;
  price: number;
  amount: number;
  active_amount: number;
  status: string;
  expires: string;
  created: string;
  updated: string;
}

export interface Pair {
  id: string;
  base_token: string;
  quote_token: string;
  lastPrice: number;
  volume_24h: number;
  is_active: Boolean;
  created: string;
  updated: string;
}

