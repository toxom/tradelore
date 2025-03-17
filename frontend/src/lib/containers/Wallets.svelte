<script lang="ts">
  import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase'; 
  import { get } from 'svelte/store';
  import { agentStore, fetchAgents, assignWalletToAgent, unassignWalletFromAgent } from 'stores/agentStore';
  import { t } from 'stores/translation.store';
  import { tokens } from 'clients/tokenClient';
  import { fetchWalletAgents } from 'clients/agentClient';
  import {
    addNewWallet,
    wallets,
    fetchWallets,
    updateWallet
  } from 'clients/balanceClient';
  import type { Token, Wallet } from 'types/walletTypes';
  import { spring, tweened } from 'svelte/motion';
  import { ArrowBigDown, ArrowDownUp, ArrowRightLeft, ArrowUpWideNarrow, BadgePlus, Bot, CirclePlus, OctagonX, SaveAllIcon, Trash2, WalletMinimal, WalletMinimalIcon } from 'lucide-svelte';

  let assignedAgentsCount = 0;
  let percent = 0;
  let expandedTokenIds: Record<string, boolean> = {};
  let expandedAgentStates: Record<string, boolean> = {}; // Toggle state for token's agents section
  let walletAgentsMap: Record<string, string[]> = {}; // Map to store which agents are assigned to which wallets
    let agentSpendLimitInputs = {};
    let filterMode = "all"; // Options: "all", "agents", "pairs"

  let selectedCurrency: string = '';
  let selectedNetwork: string = '';
  let selectedTokenId: string = '';
  let addressInput: string = '';

  let openCardTokenId = null;
  let openCardContentType = null; // 'token' or 'agent'

  export let loadingTokens = true;

  let loading = true;
  let error = '';
  const store = tweened(0, { duration: 1000 });
  $: store.set(percent);

  export let walletsForTokens = new Set<string>();

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function calculateUsagePercentage(current: number, limit: number): number {
    return Math.min(Math.round((current / limit) * 100), 100);
  }
  function openCardContent(tokenId: string, contentType) {
    // If a different card is already open, close it
    if (openCardTokenId !== null && openCardTokenId !== tokenId) {
      // Close any open content in other cards
      expandedTokenIds[openCardTokenId] = false;
      expandedAgentStates[openCardTokenId] = false;
    }
    
    // Set the current open card
    openCardTokenId = tokenId;
    openCardContentType = contentType;
    
    // Create new references to trigger reactivity
    expandedTokenIds = {...expandedTokenIds};
    expandedAgentStates = {...expandedAgentStates};
  }
  function toggleTokenExpansion(tokenId: string) {
  // Toggle the current state
  expandedTokenIds[tokenId] = !expandedTokenIds[tokenId];
  
  // If we're opening this content
  if (expandedTokenIds[tokenId]) {
    // Close agent content for this token
    expandedAgentStates[tokenId] = false;
    // Handle opening this card (will close others)
    openCardContent(tokenId, 'token');
  } else {
    // If we're closing this content, reset tracking if this was the open card
    if (openCardTokenId === tokenId && openCardContentType === 'token') {
      openCardTokenId = null;
      openCardContentType = null;
    }
  }
  
  // Update for reactivity
  expandedTokenIds = {...expandedTokenIds};
  expandedAgentStates = {...expandedAgentStates};
}
function toggleAgentExpansion(tokenId) {
  // Toggle the current state
  expandedAgentStates[tokenId] = !expandedAgentStates[tokenId];
  
  // If we're opening this content
  if (expandedAgentStates[tokenId]) {
    // Close token content for this token
    expandedTokenIds[tokenId] = false;
    // Handle opening this card (will close others)
    openCardContent(tokenId, 'agent');
  } else {
    // If we're closing this content, reset tracking if this was the open card
    if (openCardTokenId === tokenId && openCardContentType === 'agent') {
      openCardTokenId = null;
      openCardContentType = null;
    }
  }
  
  // Update for reactivity
  expandedTokenIds = {...expandedTokenIds};
  expandedAgentStates = {...expandedAgentStates};
}


  export function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/placeholder-coin.png';
  }

  export function getTokenIcon(tokenId: string): string {
    const token = tokens.find((t) => t.tokenId === tokenId);
    return token?.iconUrl || '/placeholder-coin.png';
  }

  function getUniqueTokenIds(tokens: Token[]): string[] {
    return Array.from(new Set(tokens.map((token) => token.tokenId)));
  }

  function getTokensByTokenId(tokenId: string): Token[] {
    return tokens.filter((token) => token.tokenId === tokenId);
  }

  function getTotalBalanceForToken(tokenId: string): number {
    const userWallets = get(wallets).filter(
      wallet => wallet.userId === get(currentUser).id && wallet.tokenId === tokenId
    );
    
    return userWallets.reduce((total, wallet) => {
      const walletBalance = typeof wallet.balance === 'string' 
        ? parseFloat(wallet.balance) || 0 
        : wallet.balance || 0;
      
      return total + walletBalance;
    }, 0);
  }

  // Function to get all wallets for a token
  function getWalletsForToken(tokenId: string): Wallet[] {
    return get(wallets).filter(
      wallet => wallet.userId === get(currentUser).id && wallet.tokenId === tokenId
    );
  }

  // Function to determine if an agent is associated with any wallet for this token
  function isAgentAssociatedWithToken(agent: any, tokenId: string): boolean {
  const tokenWallets = getWalletsForToken(tokenId);
  
  // Debug output
  console.log(`Checking agent ${agent.id} for token ${tokenId}`);
  console.log(`Token wallets:`, tokenWallets.map(w => w.id));
  
  for (const wallet of tokenWallets) {
    if (walletAgentsMap[wallet.id] && walletAgentsMap[wallet.id].includes(agent.id)) {
      console.log(`Agent ${agent.id} is associated with wallet ${wallet.id}`);
      return true;
    }
  }
  
  console.log(`Agent ${agent.id} is NOT associated with any wallet for token ${tokenId}`);
  return false;
}

  // Function to get the specific walletId an agent is associated with
  function getAssociatedWalletId(agent: any, tokenId: string): string | null {
    const tokenWallets = getWalletsForToken(tokenId);
    for (const wallet of tokenWallets) {
      if (walletAgentsMap[wallet.id]?.includes(agent.id)) {
        return wallet.id;
      }
    }
    return null;
  }

  async function handleAddWallet(token: Token) {
    try {
      const currency = token.ticker;
      const tokenId = token.tokenId;
      const network = token.network;
      const wallet = await addNewWallet(currency, tokenId, network);
      if (wallet) {
        walletsForTokens.add(tokenId);
        console.log('Wallet added successfully:', wallet);
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
    }
  }
// This function now gets agent-wallet associations directly from the agents
async function fetchAssociatedAgents() {
  try {
    // Reset the map
    walletAgentsMap = {};
    
    // Initialize empty arrays for all wallets
    get(wallets).forEach(wallet => {
      walletAgentsMap[wallet.id] = [];
    });
    
    // Get all agents
    const agents = get(agentStore).agents;
    
    // For each agent, check its walletsId relation
    for (const agent of agents) {
      if (agent.walletsId && Array.isArray(agent.walletsId)) {
        // For each wallet this agent is associated with
        for (const walletId of agent.walletsId) {
          // Add the agent to that wallet's array
          if (!walletAgentsMap[walletId]) {
            walletAgentsMap[walletId] = [];
          }
          walletAgentsMap[walletId].push(agent.id);
        }
      }
    }
    
    console.log('Wallet-Agent associations built from agents:', walletAgentsMap);
  } catch (error) {
    console.error('Error in fetchAssociatedAgents:', error);
  }
}
  async function handleAssignWalletToAgent(agentId: string, walletId: string) {
  try {
    await assignWalletToAgent(agentId, walletId);
    
    // Refresh the associations after assigning
    await fetchAssociatedAgents();
    
    console.log('Wallet assigned to agent successfully');
  } catch (error) {
    console.error('Error assigning wallet to agent:', error);
  }
}
async function handleUnassignWalletFromAgent(agentId: string, walletId: string) {
  try {
    await unassignWalletFromAgent(agentId, walletId);
    
    // Refresh the associations after unassigning
    await fetchAssociatedAgents();
    
    console.log('Wallet unassigned from agent successfully');
  } catch (error) {
    console.error('Error unassigning wallet from agent:', error);
  }
}


function getAgentCountForToken(tokenId: string): number {
  const tokenWallets = getWalletsForToken(tokenId);
  let count = 0;
  
  // Count agents assigned to each wallet for this token
  tokenWallets.forEach(wallet => {
    if (walletAgentsMap[wallet.id] && Array.isArray(walletAgentsMap[wallet.id])) {
      count += walletAgentsMap[wallet.id].length;
    }
  });
  
  return count;
}

async function handleUpdateSpendLimit(walletId: string, agentSpendLimit: number) {
  try {
    // Validate input
    const limitValue = Number(agentSpendLimit);
    if (isNaN(limitValue) || limitValue < 0) {
      alert("Please enter a valid spend limit");
      return;
    }
    
    // Use the updateWallet method from your store
    const updatedWallet = await updateWallet(walletId, { agentSpendLimit: limitValue });
    
    if (!updatedWallet) {
      throw new Error("Failed to update wallet");
    }
    
    console.log(`Spend limit updated for wallet ${walletId}: ${limitValue}`);
  } catch (error) {
    console.error('Error updating spend limit:', error);
    alert(`Error updating spend limit: ${error.message}`);
  }
}

function hasAgentsForToken(tokenId: string): boolean {
  return getAgentCountForToken(tokenId) > 0;
}

function hasPairsForToken(tokenId: string): boolean {
  const uniqueTokens = getTokensByTokenId(tokenId).filter((token, index, self) => 
    token.network.toLowerCase() !== 'unknown' || 
    index === self.findIndex(t => t.network.toLowerCase() === 'unknown')
  );
  return uniqueTokens.length > 1;
}

function shouldDisplayWallet(tokenId: string): boolean {
  if (filterMode === "all") {
    return true;
  } else if (filterMode === "agents") {
    return hasAgentsForToken(tokenId);
  } else if (filterMode === "token-options") {
    return hasPairsForToken(tokenId);
  }
  return true;
}
$: {
  if (filterMode === "agents") {
    getUniqueTokenIds(tokens).forEach(tokenId => {
      if (hasAgentsForToken(tokenId)) {
        expandedAgentStates[tokenId] = true;
        expandedTokenIds[tokenId] = false;
      } else {
        expandedAgentStates[tokenId] = false;
      }
    });
  } else if (filterMode === "token-options") {
    getUniqueTokenIds(tokens).forEach(tokenId => {
      if (hasPairsForToken(tokenId)) {
        expandedTokenIds[tokenId] = true;
        expandedAgentStates[tokenId] = false;
      } else {
        expandedTokenIds[tokenId] = false;
      }
    });
  } else if (filterMode === "all") {
    getUniqueTokenIds(tokens).forEach(tokenId => {
      expandedTokenIds[tokenId] = false;
      expandedAgentStates[tokenId] = false;
    });
    
    openCardTokenId = null;
    openCardContentType = null;
  }
  
  // Create new references to trigger reactivity
  expandedTokenIds = {...expandedTokenIds};
  expandedAgentStates = {...expandedAgentStates};
}

onMount(async () => {
  try {
    loadingTokens = true;
    
    // Make these awaits sequential to ensure proper loading order
    await fetchAgents();
    await fetchWallets();
    
    // After all data is loaded, then update UI state
    walletsForTokens = new Set<string>();
    get(wallets).forEach((wallet) => {
      walletsForTokens.add(wallet.tokenId);
    });
    
    // This should happen after wallets are loaded
    await fetchAssociatedAgents();
    
    // Initialize other state after data is available
    getUniqueTokenIds(tokens).forEach((tokenId) => {
      expandedAgentStates[tokenId] = false;
    });
    
    agentSpendLimitInputs = {};
    get(wallets).forEach(wallet => {
      agentSpendLimitInputs[wallet.id] = wallet.agentSpendLimit || 0;
    });
  } catch (e) {
    error = e;
    console.error('Error loading tokens or wallets:', e);
  } finally {
    // Only set this false when everything is truly loaded
    loadingTokens = false;
  }
});
</script>

<div class="sticker-container">
  <div class="sticker-header"></div>
  <div class="sticker-header">
    <div class="wallet-filter">
      <div class="filter-buttons">
        <button 
          class="filter-button {filterMode === 'all' ? 'active' : ''}" 
          on:click={() => filterMode = 'all'}
        >
          All
        </button>
        <button 
          class="filter-button {filterMode === 'agents' ? 'active' : ''}" 
          on:click={() => filterMode = 'agents'}
        >
          Agents
        </button>
        <button 
          class="filter-button {filterMode === 'token-options' ? 'active' : ''}" 
          on:click={() => filterMode = 'token-options'}
        >
          Pairs
        </button>
      </div>
    </div>
  </div>
  {#if loadingTokens}
    <div class="loading-container">
      <div class="spinner"></div>
    </div> 
  {:else}
  
    <div class="container">

      {#each getUniqueTokenIds(tokens).filter(tokenId => shouldDisplayWallet(tokenId)) as tokenId (tokenId)}
      <div class="card {walletsForTokens.has(tokenId) ? 'has-wallet' : ''}">
          <div class="token-header">
            <img 
              src={getTokenIcon(tokenId)} 
              class="token-icon"
              on:error={handleImageError}
            />
            <div class="token-info">
              <h3 class="token-ticker">
                
                {getTokensByTokenId(tokenId)[0]?.name || 'Unknown'}
              </h3>
              <p class="token-name">
                {#if walletsForTokens.has(tokenId)}
                  {getTotalBalanceForToken(tokenId).toFixed(6)}
                {/if}
                {getTokensByTokenId(tokenId)[0]?.ticker || 'N/A'}
              </p>

              {#if expandedTokenIds[tokenId]}
              {/if}
            </div>
          </div>

          <div class="btn-row">
            <button class="toggle-button" on:click={() => {
              // If agent view is expanded, close it
              if (expandedAgentStates[tokenId]) {
                expandedAgentStates[tokenId] = false;
              }
              // Toggle token expansion
              toggleTokenExpansion(tokenId);
            }}>
              <ArrowDownUp/>
              <p>{$t('wallet.deposit')}</p>
            </button>
          
            <!-- Single toggle button for all agents related to this token -->
            {#if getWalletsForToken(tokenId).length > 0}
              <button class="toggle-button" on:click={() => {
                // If token view is expanded, close it
                if (expandedTokenIds[tokenId]) {
                  toggleTokenExpansion(tokenId);
                }
                // Toggle agent expansion
                toggleAgentExpansion(tokenId);
              }}>
                <ArrowRightLeft/>
                <p>{$t('agent.agents')} ({getAgentCountForToken(tokenId)})</p>
              </button>
            {/if}
          </div>
          {#if expandedTokenIds[tokenId] || (filterMode === "token-options" && hasPairsForToken(tokenId))}
          {@const uniqueTokens = getTokensByTokenId(tokenId).filter((token, index, self) => 
            // Keep only the first occurrence of each network, or if network is unknown
            token.network.toLowerCase() !== 'unknown' || 
            index === self.findIndex(t => t.network.toLowerCase() === 'unknown')
          )}
           <p class="network-name">{$t('wallet.network')}</p>

          <div class="token-option-container">

            {#each uniqueTokens as token (token.id)}
              {@const hasWallet = walletsForTokens.has(tokenId)}
              {@const wallet = hasWallet ? get(wallets).find(wallet => 
                wallet.userId === get(currentUser).id && 
                wallet.tokenId === tokenId && 
                wallet.network === token.network
              ) : null}
              {@const hasBalance = hasWallet && wallet && wallet.balance && parseFloat(wallet.balance) > 0}
              
              <div
                class="token-options {hasBalance ? 'has-balance' : ''}"
                on:click|stopPropagation={() => handleAddWallet(token)}
              >
                {#if token.network && token.network.toLowerCase() !== 'unknown'}
                  <div class="network-name">{token.network}</div>
                {/if}
                
                {#if hasWallet && wallet}
                  <div class="wallet-balance">
                    Balance: 
                    <p>
                      {wallet.balance || '0'}
                    </p>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

          <!-- Display agents section - now grouped by token instead of wallet -->
          {#if expandedAgentStates[tokenId] && walletsForTokens.has(tokenId)}
          <div class="agents-container">
              {#if $agentStore.loading}
                <div class="loading">Loading agents...</div>
              {:else if $agentStore.error}
                <div class="error-display">Error: {$agentStore.error}</div>
              {:else if $agentStore.agents.length === 0}
                <div class="empty-state">No agents found. Create your first agent!</div>
              {:else}

              {#if $agentStore.agents.some(agent => isAgentAssociatedWithToken(agent, tokenId))}
                  <div class="agent-section">
                    <h3 class="section-title">Associated Agents</h3>
                    <div class="agents-grid">
                      {#each $agentStore.agents.filter(agent => isAgentAssociatedWithToken(agent, tokenId)) as agent (agent.id)}
                      <div class="agent-card associated">
                        <div class="agent-row2">
                          <div class="agent-row">

                          <div class="agent-header">
                            <div class="agent-row">

                            <h3>{agent.agentName}</h3>

                          {#if getAssociatedWalletId(agent, tokenId)}
                          {@const associatedWalletId = getAssociatedWalletId(agent, tokenId)}
                          {@const associatedWallet = get(wallets).find(w => w.id === associatedWalletId)}
                          {#if associatedWallet && associatedWallet.network && associatedWallet.network !== 'Unknown' && associatedWallet.network !== 'N/A'}
                            <p >{associatedWallet.network}</p>
                          {/if}
                        {/if}
                            </div>
                        <p class="description">{agent.description}</p>

                          </div>

                          </div>
                          <div class="wallet-assignment">
                            {#if getAssociatedWalletId(agent, tokenId)}
                              {@const associatedWalletId = getAssociatedWalletId(agent, tokenId)}
                              <button 
                                class="delete-button" 
                                on:click={() => handleUnassignWalletFromAgent(agent.id, associatedWalletId)}
                              >
                                <OctagonX/> 
                              </button>
                            {:else}
                              <!-- Handle case when there's no associated wallet -->
                            {/if}
                          </div>
                        </div>
                        <!-- Add spend limit controls for associated wallet -->
                        {#if getAssociatedWalletId(agent, tokenId)}
                          {@const associatedWalletId = getAssociatedWalletId(agent, tokenId)}
                          {@const associatedWallet = get(wallets).find(w => w.id === associatedWalletId)}
                          {#if associatedWallet}
                            <div class="spend-limit-container">
                              <div class="spend-limit-label">Limit:</div>
                              <div class="spend-limit-controls">
                                <input 
                                  type="number" 
                                  class="spend-limit-input" 
                                  min="0" 
                                  step="0.01"
                                  placeholder="Set limit"
                                  bind:value={associatedWallet.agentSpendLimit}
                                  />
                                <button 
                                  class="update-limit-button" 
                                  on:click={() => handleUpdateSpendLimit(associatedWalletId, associatedWallet.agentSpendLimit)}
                                  >
                                  <SaveAllIcon/>
                                </button>
                              </div>
                            </div>
                          {/if}
                        {/if}
                        
                        <div class="usage-container">
                          <div class="progress-bar">
                            <div 
                              class="progress-fill" 
                              style="width: {calculateUsagePercentage(agent.tokenUsageCurrent, agent.tokenUsageLimit)}%"
                            ></div>
                          </div>
                          <div class="usage-label">
                            Token Usage: {agent.tokenUsageCurrent} / {agent.tokenUsageLimit}
                          </div>
                        </div>
                      </div>
                    {/each}
                    </div>
                  </div>
                {/if}

                <!-- Then display unassociated agents -->
                <div class="agent-section">
                  <h3 class="section-title">Unassigned Agents</h3>
                  <div class="agents-grid">
                    {#each $agentStore.agents.filter(agent => !isAgentAssociatedWithToken(agent, tokenId)) as agent (agent.id)}
                      <div class="agent-card unassociated">
                        <div class="agent-row">
                          <div class="agent-header">
                            <h3>{agent.agentName}</h3>
                            <p class="description">{agent.description}</p>
                          </div>
                          <div class="wallet-assignment">
                            {#each getWalletsForToken(tokenId) as wallet (wallet.id)}
                              <button 
                                class="assign-button" 
                                on:click={() => handleAssignWalletToAgent(agent.id, wallet.id)}
                              >
                                
                                {#if wallet.network && wallet.network.toLowerCase() !== 'unknown'}
                                 + {wallet.network}

                                {:else}
                                Add
                                {/if}
                              </button>
                            {/each}
                          </div>
                        </div>
                        <div class="usage-container">
 
                          <div class="progress-bar">
                            <div 
                              class="progress-fill" 
                              style="width: {calculateUsagePercentage(agent.tokenUsageCurrent, agent.tokenUsageLimit)}%"
                            ></div>
                          </div>
                          <div class="usage-label">
                            Token Usage: {agent.tokenUsageCurrent} / {agent.tokenUsageLimit}
                          </div>
                        </div>
                      </div>

                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
    
    .wallet-container {
      gap: 0;

      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .sticker-container {
      display: flex;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      gap: 0;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 100vw;
      margin-top: 2rem;
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 0;
      padding: 0;
      height: 80vh;


    }

    
    .container {
      display: grid;

      grid-template-columns: repeat( auto-fill, minmax(300px, 1fr) );
      gap: 4rem;
      padding: 2rem;
      height: 100vw;
      margin-top: auto;
      width: 100%;
      transition: all 0.2s ease;
      h1 {
        color: var(--text-color);
        backdrop-filter: blur(6px);
      }
    }

    .btn-row {
      width: 100%;
      height: auto;
      display: flex;
      gap: 1rem;
      justify-content: flex-start;
      align-items: flex-end;
      transition: all 0.3 ease;
    }
    .toggle-button {
      transition: all 0.2s ease;
      width: auto;
      position: relative;
      width: auto;
      height: 3rem;
      // padding: 1rem;
      &:hover {
        transition: all 0.2s ease;
        width: auto;
        background: var(--text-color);
        color: var(--tertiary-color);

        p {
          display: flex;
          color: var(--tertiary-color);
        }
      }
      p {
        display: none;

      }
    }
    .card {
      background: var(--bg-gradient-fade);
      display: flex;
      opacity: 0.5;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      width: auto;
      gap: 1rem;
      height: 100%;
      border-radius: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      transition: all 0.2s ease;
      color: var(--text-color);

      p.token-name {
        font-size: 1.5rem;
      }
      &.token-info {
        gap: 2rem;
      }
    }
    
  .card:hover {
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0px 0px 20px 4px rgba(255, 255, 255, 0.2);
    // padding: 2rem;
    z-index: 1;
    img {
      // transform: scale(1.5);
    }
    p.token-name {
    }
    &.token-info {
      gap: 2rem;
    }
    .toggle-button {
      transition: all 0.2s ease;
      width: auto;
      position: relative;
      // background: var(--bg-gradient-fade);
      width: auto;
      height: 3rem;
      // padding: 1rem;
      &:hover {
        transition: all 0.2s ease;
        width: auto;
        background: var(--text-color);
        color: var(--tertiary-color);

        p {
          display: flex;
          color: var(--tertiary-color);
        }
      }
      p {
        display: none;

      }
    }

  }

  

  .agents-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;


  }



  .token-icon {
	width: auto;
	height: 3rem;
	margin-right: 0.5rem;
	border-radius: 50%;
  }
  
  .token-ticker {
	font-weight: bold;
  font-size: calc(1rem + 1vmin);
	margin: 0;
  }
  
  .token-name {
	font-size: 0.75rem;
	color: #6b7280;
	margin: 0;
  }
  
    .recent-activity h3 {
        font-size: 1.25rem;
        color: #333;
        margin-bottom: 1rem;
    }

    .activity-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .activity-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
    }

    ul {
      background-color: red;
    }

    .activity-item:last-child {
        border-bottom: none;
    }

    .activity-item .type {
        font-weight: 500;
        color: #333;
    }

    .activity-item .details {
        color: #666;
    }

    .grid {
      display: grid;
      gap: 3rem;
      grid-template-columns: repeat(1, 1fr);

    }
  
  @media (min-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);

    }
  }
  
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
    @media (max-width: 1600px) {

      .sticker-container {
        margin-top: 0;
      }
      .container {
        height: 100%;
        margin-top: 0;

      }

        .token-option-container {

          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, 1fr);
        }
        .metric {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom:4rem;
            text-align: left;
            & .value {
                font-size: 2.5rem;
            font-weight: 600;
            color: #28a745; /* Green for positive values */
            }
            & .label {
                font-size: 2rem;
                color: #666;
            }
            & .conversion {
                font-size: 2rem;
                color: #666;
                font-style: italic;
            }
        }
    }
    @media (max-width: 1000px) {
            .basic-container {
            display: flex;
            flex-direction: column;
            align-items: top;
            gap: 2rem;
            width: 100%;
            height: 100%;
            margin-bottom: rem;
        }



        .metric {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: auto;
            gap: 0;
            margin: 0;
            text-align: center;
            & .value {
                font-size: 2rem;
            font-weight: 600;
            color: #28a745; /* Green for positive values */
            }
            & .label {
                font-size: 1.5rem;
                color: #666;
            }
            & .conversion {
                font-size: 1.5rem;
                color: #666;
                font-style: italic;
            }
        }

        .container {
          grid-template-columns: repeat(1, 1fr);
          gap: 4rem;
          background: transparent;



        }
        h1 {
            text-align: center;
            margin: 0;
            margin-top: 0;
            padding: 0.5rem;
            position: absolute;
            background: transparent;
            backdrop-filter: blur(100px);
            top: 0;
            left: 0;
            right: 0;
          }
        .token-option-container {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        width: auto;
        padding: 0;
        margin: 0;
        }
        .token-options {
        }
      .card {
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
      }

      .card:hover {
        box-shadow: none;
                align-items: center;

        background: transparent;
      }
        .metric {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 0;
            margin: 0;
            text-align: center;
            & .value {
                font-size: 2rem;
            font-weight: 600;
            color: #28a745; /* Green for positive values */
            }
            & .label {
                font-size: 1.5rem;
                color: #666;
            }
            & .conversion {
                font-size: 1.5rem;
                color: #666;
                font-style: italic;
            }
        }
    }
    @media (max-width: 768px) {

      .container {
        width: calc(100% - 4rem);
        align-items: center;
        margin-left: 2rem;
      }

      .sticker-container {
        margin: 0;
        padding: 0;
        align-items: center;
      }
      .token-option-container {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat( auto-fill, minmax(240px, 1fr) );
        width: auto;
        padding: 0;
        margin: 0;
        }
        .token-options {
          
        }
    }

    @media (max-width: 1000px) {

    }


  
</style>
