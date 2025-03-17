import type { RecordModel } from 'pocketbase'; 

export interface Agent {
  id: string;
  agentName: string;
  walletsId: string[];
  description: string;
  userId: string;
  tokenUsageLimit: number;
  tokenUsageCurrent: number;
  walletAllocations: string[];
  created: string;
  updated: string;
}

// Extended type for creating a new agent
export interface CreateAgentInput extends Omit<Agent, 'id' | 'created' | 'updated' | 'tokenUsageCurrent'> {
  tokenUsageCurrent?: number;
}

// Extended type for updating an agent
export interface UpdateAgentInput extends Partial<Omit<Agent, 'id' | 'created' | 'updated'>> {}

// Type for agent with additional wallet information
export interface AgentWithWallets extends Agent {
  wallets?: Wallet[];
}

// Basic wallet interface to use with agents
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

// Response from PocketBase
export type AgentRecord = RecordModel & Agent;