import { writable } from 'svelte/store';
import type { Agent } from 'types/agentTypes';
import {
  fetchAllAgents,
  createNewAgent,
  deleteAgentById,
  getAgentById,
  updateAgentTokenUsage,
  assignWalletToAgent as assignWalletToAgentApi,
  unassignWalletFromAgentApi
} from 'clients/agentClient';

// Define the store state interface
interface AgentStore {
  agents: Agent[];
  loading: boolean;
  error: string | null;
}

// Create the initial store state
const initialState: AgentStore = {
  agents: [],
  loading: false,
  error: null
};

// Create the writable store
const createAgentStore = () => {
  const { subscribe, set, update } = writable<AgentStore>(initialState);

  return {
    subscribe,
    
    // Fetch all agents for the current user
    fetchAgents: async () => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const agents = await fetchAllAgents();
        set({ agents, loading: false, error: null });
      } catch (error) {
        console.error('Store error fetching agents:', error);
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch agents'
        }));
      }
    },
    
    // Create a new agent
    createAgent: async (agentData: Partial<Agent>) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const newAgent = await createNewAgent(agentData);
        
        update(state => ({
          ...state,
          agents: [newAgent, ...state.agents],
          loading: false,
          error: null
        }));
        
        return newAgent;
      } catch (error) {
        console.error('Store error creating agent:', error);
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to create agent'
        }));
        throw error;
      }
    },
    
    // Update an existing agent
    updateAgent: async (id: string, agentData: Partial<Agent>) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedAgent = await updateAgent(id, agentData);
        
        update(state => ({
          ...state,
          agents: state.agents.map(agent => 
            agent.id === id ? updatedAgent : agent
          ),
          loading: false,
          error: null
        }));
        
        return updatedAgent;
      } catch (error) {
        console.error(`Store error updating agent ${id}:`, error);
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to update agent ${id}`
        }));
        throw error;
      }
    },
    // Add this to your agentStore
    unassignWalletFromAgent: async (agentId: string, walletId: string) => {
        update(state => ({ ...state, loading: true, error: null }));
        
        try {
        const updatedAgent = await unassignWalletFromAgentApi(agentId, walletId);
        
        update(state => ({
            ...state,
            agents: state.agents.map(agent => 
            agent.id === agentId ? updatedAgent : agent
            ),
            loading: false,
            error: null
        }));
        
        return updatedAgent;
        } catch (error) {
        console.error(`Store error unassigning wallet from agent ${agentId}:`, error);
        update(state => ({
            ...state,
            loading: false,
            error: error instanceof Error ? error.message : `Failed to unassign wallet from agent ${agentId}`
        }));
        throw error;
        }
    },
    // Delete an agent
    deleteAgent: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await deleteAgentById(id);
        
        update(state => ({
          ...state,
          agents: state.agents.filter(agent => agent.id !== id),
          loading: false,
          error: null
        }));
        
        return true;
      } catch (error) {
        console.error(`Store error deleting agent ${id}:`, error);
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to delete agent ${id}`
        }));
        throw error;
      }
    },
    
    // Get a single agent by ID
    getAgent: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const agent = await getAgentById(id);
        
        // Don't update the agents array, just return the single agent
        update(state => ({
          ...state,
          loading: false,
          error: null
        }));
        
        return agent;
      } catch (error) {
        console.error(`Store error fetching agent ${id}:`, error);
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to fetch agent ${id}`
        }));
        throw error;
      }
    },
    
    // Update token usage for an agent
    updateTokenUsage: async (id: string, additionalUsage: number) => {
      try {
        const updatedAgent = await updateAgentTokenUsage(id, additionalUsage);
        
        update(state => ({
          ...state,
          agents: state.agents.map(agent => 
            agent.id === id ? updatedAgent : agent
          )
        }));
        
        return updatedAgent;
      } catch (error) {
        console.error(`Store error updating token usage for agent ${id}:`, error);
        throw error;
      }
    },
    
    // Assign a wallet to an agent
    assignWalletToAgent: async (agentId: string, walletId: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedAgent = await assignWalletToAgentApi(agentId, walletId);
        
        update(state => ({
          ...state,
          agents: state.agents.map(agent => 
            agent.id === agentId ? updatedAgent : agent
          ),
          loading: false,
          error: null
        }));
        
        return updatedAgent;
      } catch (error) {
        console.error(`Store error assigning wallet to agent ${agentId}:`, error);
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : `Failed to assign wallet to agent ${agentId}`
        }));
        throw error;
      }
    },
    
    // Reset the store
    reset: () => {
      set(initialState);
    }
  };
};



// Export the store instance
export const agentStore = createAgentStore();

// Export individual actions for convenience
export const {
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgent,
  updateTokenUsage,
  assignWalletToAgent,
  unassignWalletFromAgent,
  
} = agentStore;