import PocketBase from 'pocketbase';
import { pb, currentUser } from '$lib/pocketbase';
import type { Agent, Wallet } from 'types/agentTypes';

// Agent collection name in PocketBase
const COLLECTION = 'agents';

/**
 * Fetch all agents for the current user
 */
export const fetchAllAgents = async (): Promise<Agent[]> => {
  try {
    if (!pb.authStore.isValid) {
      console.error('User not authenticated');
      return [];
    }
    
    return await pb.collection(COLLECTION).getFullList<Agent>({
      sort: '-created',
      headers: {
        'Authorization': pb.authStore.token
      }
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    // Handle specific error types
    if (error instanceof Error && error.message.includes('403')) {
      console.error('Permission denied. Only superusers can access this resource.');
    }
    return [];
  }
};

/**
 * Create a new agent
 */
export const createNewAgent = async (agentData: Partial<Agent>): Promise<Agent> => {
  try {
    if (!pb.authStore.isValid) {
      throw new Error('User not authenticated');
    }
    
    const userId = (pb.authStore.model as any)?.id;
    
    const data = {
      ...agentData,
      userId,
      tokenUsageCurrent: 0 // Initialize with 0 usage
    };
    
    const record = await pb.collection(COLLECTION).create<Agent>(data, {
      headers: {
        'Authorization': pb.authStore.token
      }
    });
    
    return record;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

/**
 * Update an existing agent
 */
export const updateAgent = async (id: string, agentData: Partial<Agent>): Promise<Agent> => {
  try {
    if (!pb.authStore.isValid) {
      throw new Error('User not authenticated');
    }
    
    const record = await pb.collection(COLLECTION).update<Agent>(id, agentData, {
      headers: {
        'Authorization': pb.authStore.token
      }
    });
    
    return record;
  } catch (error) {
    console.error(`Error updating agent ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an agent
 */
export const deleteAgentById = async (id: string): Promise<boolean> => {
  try {
    if (!pb.authStore.isValid) {
      throw new Error('User not authenticated');
    }
    
    await pb.collection(COLLECTION).delete(id, {
      headers: {
        'Authorization': pb.authStore.token
      }
    });
    return true;
  } catch (error) {
    console.error(`Error deleting agent ${id}:`, error);
    throw error;
  }
};

/**
 * Get a single agent by ID
 */
export const getAgentById = async (id: string): Promise<Agent> => {
  try {
    if (!pb.authStore.isValid) {
      throw new Error('User not authenticated');
    }
    
    const record = await pb.collection(COLLECTION).getOne<Agent>(id, {
      headers: {
        'Authorization': pb.authStore.token
      }
    });
    
    return record;
  } catch (error) {
    console.error(`Error fetching agent ${id}:`, error);
    throw error;
  }
};

/**
 * Update agent token usage
 */
export const updateAgentTokenUsage = async (id: string, newUsage: number): Promise<Agent> => {
  try {
    const currentAgent = await getAgentById(id);
    const updatedUsage = currentAgent.tokenUsageCurrent + newUsage;
    
    return await updateAgent(id, {
      tokenUsageCurrent: updatedUsage
    });
  } catch (error) {
    console.error(`Error updating token usage for agent ${id}:`, error);
    throw error;
  }
};

export async function unassignWalletFromAgentApi(agentId: string, walletId: string) {
    try {
      // Assuming you're using PocketBase based on your imports
      const response = await pb.collection('agents').update(agentId, {
        "walletsId-": walletId  // This syntax removes an item from an array in PocketBase
      });
      
      return response;
    } catch (error) {
      console.error(`API error unassigning wallet ${walletId} from agent ${agentId}:`, error);
      throw error;
    }
  };
export async function assignWalletToAgent(agentId: string, walletId: string): Promise<Agent> {
    try {
        if (!pb.authStore.isValid) {
        throw new Error('User not authenticated');
        }
        const currentAgent = await pb.collection(COLLECTION).getOne<Agent>(agentId, {
            headers: {
            'Authorization': pb.authStore.token
            }
        });
        const walletsId = Array.isArray(currentAgent.walletsId) ? currentAgent.walletsId : [];

        if (!walletsId.includes(walletId)) {
            walletsId.push(walletId);
        }
  
      const updatedAgent = await pb.collection(COLLECTION).update<Agent>(
        agentId,
        { walletsId },
        {
          headers: {
            'Authorization': pb.authStore.token
          }
        }
      );
      const currentWallet = await pb.collection('wallets').getOne(walletId, {
        headers: {
          'Authorization': pb.authStore.token
        }
      });
      const agentIds = Array.isArray(currentWallet.agentId) ? currentWallet.agentId : [];
      if (!agentIds.includes(agentId)) {
        agentIds.push(agentId);
      }
  
      await pb.collection('wallets').update(
        walletId,
        { agentId: agentId },
        {
          headers: {
            'Authorization': pb.authStore.token
          }
        }
      );
  
      return updatedAgent;
    } catch (error) {
      console.error('Error assigning wallet to agent:', error);
      throw error;
    }
  }

  export const fetchWalletAgents = async (tokenId: string): Promise<number> => {
    try {
      if (!pb.authStore.isValid) {
        console.error('User not authenticated');
        return 0;
      }
  
      // Fetch all agents
      const agents = await pb.collection(COLLECTION).getFullList<Agent>({
        headers: {
          'Authorization': pb.authStore.token
        }
      });
  
      // Fetch all wallets with the same tokenId
      const wallets = await pb.collection('wallets').getFullList({
        filter: `tokenId = "${tokenId}"`,
        headers: {
          'Authorization': pb.authStore.token
        }
      });
  
      // Extract wallet IDs
      const walletIds = wallets.map(wallet => wallet.id);
  
      // Count agents assigned to these wallets
      const assignedAgentsCount = agents.filter(agent => 
        agent.walletsId && agent.walletsId.some(walletId => walletIds.includes(walletId))
      ).length;
  
      return assignedAgentsCount;
    } catch (error) {
      console.error('Error fetching wallet agents:', error);
      return 0;
    }
  };