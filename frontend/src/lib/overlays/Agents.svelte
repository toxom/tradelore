<script lang="ts">
    import { onMount } from 'svelte';
    import { agentStore, fetchAgents, createAgent, deleteAgent } from 'stores/agentStore';
    import type { Agent } from 'types/agentTypes';
    import { get } from 'svelte/store';
    import { t } from 'stores/translation.store';

    let showForm = false;
    let newAgent: Partial<Agent> = {
      agentName: '',
      description: '',
      walletsId: [],
      tokenUsageLimit: 1000,
      walletAllocations: []
    };
  
    // Form validation state
    export let errors = {
      agentName: '',
      description: ''
    };
  
    onMount(() => {
      fetchAgents();
    });
  
    function toggleForm() {
      showForm = !showForm;
      if (!showForm) {
        // Reset the form when hiding
        newAgent = {
          agentName: '',
          description: '',
          walletsId: [],
          tokenUsageLimit: 1000,
          walletAllocations: []
        };
        errors = {
          agentName: '',
          description: ''
        };
      }
    }
  
    function validateForm(): boolean {
      let isValid = true;
      errors = {
        agentName: '',
        description: ''
      };
  
      if (!newAgent.agentName || newAgent.agentName.trim() === '') {
        errors.agentName = 'Agent name is required';
        isValid = false;
      }
  
      if (!newAgent.description || newAgent.description.trim() === '') {
        errors.description = 'Description is required';
        isValid = false;
      }
  
      return isValid;
    }
  
    async function handleSubmit() {
      if (!validateForm()) return;
  
      try {
        await createAgent(newAgent);
        toggleForm();
      } catch (error) {
        console.error('Failed to create agent:', error);
      }
    }
  
    async function handleDelete(id: string) {
      if (confirm('Are you sure you want to delete this agent?')) {
        try {
          await deleteAgent(id);
        } catch (error) {
          console.error('Failed to delete agent:', error);
        }
      }
    }
  
    export function formatDate(dateString: string): string {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  
    export function calculateUsagePercentage(current: number, limit: number): number {
      return Math.min(Math.round((current / limit) * 100), 100);
    }
  </script>
  
  <div class="agents-container">
    <h1>Agents</h1>
    
    <section>
      <button class="toggle-button" on:click={toggleForm}>
        {showForm ? 'Cancel' : 'Create New Agent'}
      </button>
      
      {#if showForm}
        <div class="form-container">
          <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
              <label for="agentName">Agent Name</label>
              <input 
                type="text" 
                id="agentName" 
                bind:value={newAgent.agentName} 
                class:error={errors.agentName}
              />
              {#if errors.agentName}
                <span class="error-message">{errors.agentName}</span>
              {/if}
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                bind:value={newAgent.description} 
                rows="3"
                class:error={errors.description}
              ></textarea>
              {#if errors.description}
                <span class="error-message">{errors.description}</span>
              {/if}
            </div>
            
            <div class="form-group">
              <label for="tokenUsageLimit">Token Usage Limit</label>
              <input 
                type="number" 
                id="tokenUsageLimit" 
                bind:value={newAgent.tokenUsageLimit} 
                min="1"
              />
            </div>
            
            <button type="submit" class="submit-button">Create Agent</button>
          </form>
        </div>
      {/if}
      
      <div class="agents-grid">
        {#if $agentStore.loading}
          <div class="loading">Loading agents...</div>
        {:else if $agentStore.error}
          <div class="error-display">Error: {$agentStore.error}</div>
        {:else if $agentStore.agents.length === 0}
          <div class="empty-state">No agents found. Create your first agent!</div>
        {:else}
          {#each $agentStore.agents as agent}
            <div class="agent-card">
              <div class="agent-header">
                <h3>{agent.agentName}</h3>
                <button class="delete-button" on:click={() => handleDelete(agent.id)}>
                  ×
                </button>
              </div>
              <p class="description">{agent.description}</p>
              
              <div class="usage-container">
                <div class="usage-label">
                  Token Usage: {agent.tokenUsageCurrent} / {agent.tokenUsageLimit}
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    style="width: {calculateUsagePercentage(agent.tokenUsageCurrent, agent.tokenUsageLimit)}%"
                  ></div>
                </div>
              </div>
              
              <div class="metadata">
                <span>Created: {formatDate(agent.created)}</span>
                <span>Updated: {formatDate(agent.updated)}</span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </section>
  </div>
  
  <style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
    }   

    .agents-container {
      display: flex;
      flex-direction: column;
      justify-content: top ;
      width: 100%;
      height: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  
    h1 {
        display: flex;
        justify-content: flex-start;
        margin-right: 2rem;
        width: auto;
      font-size: 3rem;
      margin-bottom: 1.5rem;
      color: var(--text-color);
    }
  
    section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  
    .toggle-button {
      align-self: flex-start;
      padding: 0.75rem 1.5rem;
      background: var(--tertiary-color);
      color: var(--text-color);
      border: none;
      border-radius: 1rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .toggle-button:hover {
      background-color: #3b55e6;
    }
  
    .form-container {
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }
  
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
        padding: 1rem;
    }
  
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    label {
      font-weight: 400;
      font-size: 1.5rem;
      color: #555;
    }
  
    input, textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 2rem;
      font-size: 1rem;
    }
  
    input.error, textarea.error {
      border-color: #e74c3c;
    }
    

  
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
    }
  
    .submit-button {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background-color: #27ae60;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .submit-button:hover {
      background-color: #219653;
    }
  

  </style>