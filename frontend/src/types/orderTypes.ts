import type { RecordModel } from 'pocketbase'; 

export interface Orderbook {
  userId: string;
  id: string;
  type: string;
  currency: string;
  price: number;
  amount: number;
  status: string;
  expires: string;
  created: string;
  updated: string;
}