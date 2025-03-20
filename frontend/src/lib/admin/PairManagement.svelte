<script lang="ts">
    import { onMount } from 'svelte';
    import { pb, currentUser } from '$lib/pocketbase';
    import { writable, get } from 'svelte/store';
    import type { Token } from 'types/walletTypes';
    import type { Pair } from 'types/orderTypes';
    import { Loader2, Check, X, Plus, AlertTriangle } from 'lucide-svelte';
    import { fly, fade, slide, scale } from 'svelte/transition';

    const allTokens = writable<Token[]>([]);
    const baseTokens = writable<Token[]>([]);
    
    const QUOTE_TOKENS = ['USDT', 'BTC', 'ETH'];
    
    const pairs = writable<Pair[]>([]);
    
    let selectedBaseToken: string | null = null;
    let selectedQuoteToken: string = QUOTE_TOKENS[0]; 
    
    let loading = true;
    let error = '';
    let confirmingCreate = false;
    let confirmingToggle = false;
    let successMessage = '';
    let processingAction = false;

    async function fetchTokens() {
        try {
            const fetchedTokens = await pb.collection('tokens').getFullList<Token>({
                headers: {
                    Authorization: pb.authStore.token,
                },
            });
            
            allTokens.set(fetchedTokens);
            
            // Create a unique list of tokens by ticker
            const uniqueTokenMap = new Map<string, Token>();
            
            fetchedTokens.forEach(token => {
                if (!uniqueTokenMap.has(token.ticker)) {
                    uniqueTokenMap.set(token.ticker, token);
                }
            });
            
            // Include all tokens as potential base tokens
            baseTokens.set(Array.from(uniqueTokenMap.values()));
            console.log('All tokens:', get(allTokens));
            console.log('Base tokens:', get(baseTokens));
        } catch (error) {
            console.error('Failed to fetch tokens:', error);
            error = 'Failed to fetch tokens. Please try again.';
        }
    }

    // Fetch existing pairs
    async function fetchPairs() {
        try {
            const fetchedPairs = await pb.collection('pairs').getFullList<Pair>({
                headers: {
                    Authorization: pb.authStore.token,
                },
            });
            
            pairs.set(fetchedPairs);
            console.log('Fetched pairs:', fetchedPairs);
        } catch (error) {
            console.error('Failed to fetch pairs:', error);
            error = 'Failed to fetch trading pairs. Please try again.';
        } finally {
            loading = false;
        }
    }

    // Check if a pair exists
    function getPair(baseToken: string, quoteToken: string): Pair | undefined {
        return get(pairs).find(
            pair => pair.base_token === baseToken && pair.quote_token === quoteToken
        );
    }

    // Select base token
    function selectBaseToken(ticker: string) {
        selectedBaseToken = ticker;
        
        // If the selected base token is the same as the currently selected quote token,
        // reset the quote token selection or choose a different one
        if (selectedQuoteToken === ticker) {
            // Find the first available quote token that's not the same as the base token
            const availableQuoteTokens = QUOTE_TOKENS.filter(qt => qt !== ticker);
            selectedQuoteToken = availableQuoteTokens.length > 0 ? availableQuoteTokens[0] : '';
        }
        
        confirmingCreate = false;
        successMessage = '';
    }

    // Select quote token
    function selectQuoteToken(ticker: string) {
        // Prevent selecting the same token as both base and quote
        if (ticker === selectedBaseToken) {
            error = 'Cannot select the same token for both base and quote';
            return;
        }
        
        if (ticker !== selectedQuoteToken) {
            selectedQuoteToken = ticker;
            confirmingCreate = false;
            successMessage = '';
        }
    }

    // Get available quote tokens for the selected base token
    function getAvailableQuoteTokens(): string[] {
        if (!selectedBaseToken) return QUOTE_TOKENS;
        
        // Filter out the selected base token from quote options
        return QUOTE_TOKENS.filter(token => token !== selectedBaseToken);
    }

    // Get available base tokens based on selected quote token
    function getAvailableBaseTokens(): Token[] {
        const tokens = get(baseTokens);
        
        // If quote token is selected, filter it out from base options
        if (selectedQuoteToken) {
            return tokens.filter(token => token.ticker !== selectedQuoteToken);
        }
        
        return tokens;
    }

    // Create new pair
    async function createPair() {
        if (!selectedBaseToken || !selectedQuoteToken) return;
        
        // Double-check that base and quote are not the same
        if (selectedBaseToken === selectedQuoteToken) {
            error = 'Cannot create a pair with the same token for base and quote';
            return;
        }
        
        processingAction = true;
        try {
            const newPair = await pb.collection('pairs').create({
                base_token: selectedBaseToken,
                quote_token: selectedQuoteToken,
                lastPrice: 0,
                volume_24h: 0,
                is_active: true,
                decimal_place: 18,
            });
            
            // Update local data
            pairs.update(currentPairs => [...currentPairs, newPair as Pair]);
            
            successMessage = `Created new pair ${selectedBaseToken}/${selectedQuoteToken}`;
            confirmingCreate = false;
        } catch (error) {
            console.error('Failed to create pair:', error);
            error = 'Failed to create pair. Please try again.';
        } finally {
            processingAction = false;
        }
    }

    // Toggle pair active status
    async function togglePairActive(pairId: string, currentStatus: boolean) {
        processingAction = true;
        try {
            const updatedPair = await pb.collection('pairs').update(pairId, {
                is_active: !currentStatus
            });
            
            // Update local data
            pairs.update(currentPairs => 
                currentPairs.map(pair => 
                    pair.id === pairId ? {...pair, is_active: !currentStatus} : pair
                )
            );
            
            successMessage = `${updatedPair.base_token}/${updatedPair.quote_token} is now ${!currentStatus ? 'active' : 'inactive'}`;
            confirmingToggle = false;
        } catch (error) {
            console.error('Failed to update pair:', error);
            error = 'Failed to update pair status. Please try again.';
        } finally {
            processingAction = false;
        }
    }

    // Clear messages after delay
    function clearMessages() {
        setTimeout(() => {
            successMessage = '';
            error = '';
        }, 3000);
    }

    onMount(async () => {
        try {
            // Replace fetchBaseTokens with fetchTokens
            await Promise.all([fetchTokens(), fetchPairs()]);
        } catch (e) {
            console.error('Error in onMount:', e);
            error = 'Failed to initialize. Please refresh the page.';
        } finally {
            loading = false;
        }
    });

    // Watch for success messages and clear them after delay
    $: if (successMessage) clearMessages();
    $: if (error) clearMessages();
</script>

<div class="pair-management-container">
    <h2>Trading Pair Management</h2>
    
    {#if loading}
        <div class="loading-state">
            <Loader2 class="spin" size={24} />
            <span>Loading trading pairs...</span>
        </div>
    {:else}
        {#if error}
            <div class="error-message" transition:slide={{ duration: 300 }}>
                {error}
            </div>
        {/if}
        
        {#if successMessage}
            <div class="success-message" transition:slide={{ duration: 300 }}>
                {successMessage}
            </div>
        {/if}
        
        <div class="quote-token-selector">
            <h3>Quote Token</h3>
            <div class="button-row">
                {#each QUOTE_TOKENS as quoteToken}
                {@const activePairs = $pairs.filter(pair => pair.quote_token === quoteToken && pair.is_active).length}
                {@const inactivePairs = $pairs.filter(pair => pair.quote_token === quoteToken && !pair.is_active).length}
                <button 
                    class="quote-button {selectedQuoteToken === quoteToken ? 'active' : ''}"
                    on:click={() => selectQuoteToken(quoteToken)}
                >
                    <span>{quoteToken}</span>
                    <div class="count-container">
                        {#if activePairs > 0}
                            <span class="pair-count active">{activePairs}</span>
                        {/if}
                        {#if inactivePairs > 0}
                            <span class="pair-count inactive">{inactivePairs}</span>
                        {/if}
                    </div>
                </button>
            {/each}
            </div>
        </div>
        
        <div class="base-token-container">
            <h3>Base Tokens</h3>
            
            {#if $baseTokens.length === 0}
                <div class="empty-state">
                    No base tokens available. Please add tokens first.
                </div>
            {:else}
                <div class="base-tokens-grid">
                    {#each $baseTokens as token}
                        {@const pair = getPair(token.ticker, selectedQuoteToken)}
                        {@const isSelected = selectedBaseToken === token.ticker}
                        <button 
                            class="base-token-button {isSelected ? 'selected' : ''} {pair ? (pair.is_active ? 'exists-active' : 'exists-inactive') : ''}"
                            on:click={() => selectBaseToken(token.ticker)}
                        >
                            <div class="token-info">
                                <img 
                                    src={token.iconUrl} 
                                    alt={token.name} 
                                    on:error={(e) => e.target.src = '/placeholder-coin.png'} 
                                />
                                <span>{token.ticker}</span>
                            </div>
                            
                            {#if pair}
                                <div class="pair-status">
                                    {#if pair.is_active}
                                        <Check size={16} class="icon-active" />
                                    {:else}
                                        <X size={16} class="icon-inactive" />
                                    {/if}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
        
        <div class="action-panel">
            {#if selectedBaseToken && selectedQuoteToken}
                {@const pair = getPair(selectedBaseToken, selectedQuoteToken)}
                <div class="selected-pair">
                    Selected: <strong>{selectedBaseToken}/{selectedQuoteToken}</strong>
                </div>
                
                {#if pair}
                    <div class="pair-details">
                        <div class="pair-info">
                            <div>Status: <span class={pair.is_active ? 'status-active' : 'status-inactive'}>
                                {pair.is_active ? 'Active' : 'Inactive'}
                            </span></div>
                            <div>Decimals: <span class="data">{pair.decimal_place || '0'}</span></div>

                        </div>
                                                    
                            <!-- <div>Last Price: {pair.lastPrice || 'N/A'}</div> -->
                        {#if confirmingToggle}
                            <div class="confirmation-dialog">
                                <p>Are you sure you want to {pair.is_active ? 'deactivate' : 'activate'} 
                                   {selectedBaseToken}/{selectedQuoteToken}?</p>
                                <div class="dialog-actions">
                                    <button 
                                        class="confirm-btn {pair.is_active ? 'inactive' : 'active'}" 
                                        on:click={() => togglePairActive(pair.id, pair.is_active)}
                                        disabled={processingAction}
                                    >
                                        {processingAction ? 'Processing...' : 'Confirm'}
                                    </button>
                                    <button class="cancel-btn" on:click={() => confirmingToggle = false}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <button 
                                class="toggle-btn {pair.is_active ? 'active' : 'inactive'}" 
                                on:click={() => confirmingToggle = true}
                            >
                                {pair.is_active ? 'Deactivate' : 'Activate'} Pair
                            </button>
                        {/if}
                    </div>
                {:else}
                    {#if confirmingCreate}
                        <div class="confirmation-dialog">
                            <p>Create new trading pair {selectedBaseToken}/{selectedQuoteToken}?</p>
                            <div class="dialog-actions">
                                <button 
                                    class="confirm-btn" 
                                    on:click={createPair}
                                    disabled={processingAction}
                                >
                                    {processingAction ? 'Creating...' : 'Create Pair'}
                                </button>
                                <button class="cancel-btn" on:click={() => confirmingCreate = false}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    {:else}
                        <button 
                            class="create-btn" 
                            on:click={() => confirmingCreate = true}
                        >
                            <Plus size={16} />
                            Create {selectedBaseToken}/{selectedQuoteToken} Pair
                        </button>
                    {/if}
                {/if}
            {:else}
                <div class="instruction-message">
                    <AlertTriangle size={16} />
                    Select a base token and quote token to manage pairs
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }  

    .pair-management-container {
        display: flex;
        flex-direction: column;
        width: calc(100% - 2rem);
        background: var(--bg-color);
        border-radius: 8px;
        padding: 1rem;
        gap: 20px;
        
        h2 {
            color: var(--text-color);
            margin-top: 0;
            margin-bottom: 16px;
        }
        
        h3 {
            color: var(--text-color);
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 1rem;
        }
    }
    
    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 40px;
        color: var(--text-color-secondary);
        
        .spin {
            animation: spin 1s linear infinite;
        }
    }

    span.data {
        color: var(--text-color);
        font-weight: 800;
        font-size: 1.5rem;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .quote-token-selector {
        width: 100%;
        display: flex;
        flex-direction: column;
        .button-row {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .quote-button {
            padding: 8px 16px;
            border-radius: 1rem;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            background: var(--secondary-color);
            border: 1px solid transparent;
            color: var(--text-color);
            opacity: 0.5;
            cursor: pointer;
            font-size: 1.25rem;
            transition: all 0.2s ease;
            letter-spacing: 0.2rem;

            .count-container {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 4px;
                margin-left: 6px;
            }
            .pair-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 20px;
                height: auto;
                padding: 0 0.5rem;
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: bold;
                
                &.active {
                    background: rgba(40, 167, 69, 0.2);
                    color: var(--success-color, #28a745);
                    border: 1px solid var(--success-color, #28a745);
                }
                
                &.inactive {
                    background: rgba(220, 53, 69, 0.2);
                    color: var(--danger-color, #dc3545);
                    border: 1px solid var(--danger-color, #dc3545);
                }
    }
            &:hover {
                background: var(--primary-color);
                box-shadow: 1px 1px 5px 0px var(--text-color);
                opacity: 1;

            }
            
            &.active {
                background: var(--bg-gradient-fade);
                color: var(--text-color-bright);
                box-shadow: 1px 1px 5px 0px var(--text-color);
                transform: scale(1.2);
                font-weight: 800;
                opacity: 1;

            }
        }
    }
    
    .base-token-container {
        width: 100%;
        
        .empty-state {
            padding: 20px;
            text-align: center;
            color: var(--text-color-secondary);
            border: 1px dashed var(--border-color);
            border-radius: 4px;
        }
        
        .base-tokens-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
        }
        
        .base-token-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            border-radius: 2rem;

            background: var(--secondary-color);
            border: 1px solid transparent;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: 0.5;
            height: 100px;
            width: 100px;

            .token-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                font-size: 1rem;

                img {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                }
            }
            
            .pair-status {
                margin-top: auto;
                
                .icon-active {
                    color: var(--success-color, #28a745);
                }
                
                .icon-inactive {
                    color: var(--danger-color, #dc3545);
                }
            }
            
            &:hover {
                opacity: 1;
                transform: scale(1.1);
                box-shadow: 1px 1px 50px 1px var(--text-color);
                .token-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.25rem;
                    font-weight: 800;
                    
                    img {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        object-fit: cover;
                    }
                }
            }
            

            
            &.exists-active {
                opacity: 0.7;
                box-shadow: 1px 0px 25px 2px rgba(0, 128, 0, 1);
                &.selected {
                    opacity: 1;
                    box-shadow: 1px 1px 50px 1px green;
                    font-weight: 800;
                }
                &:hover {
                    opacity: 1;
                    transform: scale(1.1);
                    box-shadow: 1px 1px 50px 1px green;
                }
            }
            
            &.exists-inactive {
                opacity: 0.7;
                box-shadow: 1px 1px 25px 1px rgba(255, 0, 0, 0.5);
                &.selected {
                    opacity: 1;
                    box-shadow: 1px 1px 50px 1px red;
                    font-weight: 800;
                }
                &:hover {
                    opacity: 1;
                    transform: scale(1.1);
                    box-shadow: 1px 1px 50px 1px red;
                }
            }
        }
    }
    
    .action-panel {
        margin-top: 16px;
        padding: 16px;
        background: var(--secondary-color);
        border-radius: 8px;
        
        .selected-pair {
            margin-bottom: 12px;
            color: var(--text-color);
            font-size: 2.25rem;

        }
        
        .pair-details {
            display: flex;
            flex-direction: column;
            gap: 12px;
            font-size: 1.25rem;

            .pair-info {
                display: flex;
                flex-direction: column;
                
                gap: 1rem;
                
                .status-active {
                    color: var(--success-color, #28a745);
                    font-weight: 800;
                }
                
                .status-inactive {
                    color: var(--danger-color, #dc3545);
                }
            }
        }
        
        .confirmation-dialog {
            background: var(--bg-color);
            border-radius: 4px;
            padding: 16px;
            margin-top: 12px;
            
            p {
                margin-top: 0;
                margin-bottom: 12px;
            }
            
            .dialog-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }
        }
        
        .toggle-btn, .create-btn, .confirm-btn, .cancel-btn {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            
            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
        
        .toggle-btn, .create-btn {
            width: 100%;
            font-weight: 800;
            font-size: 1.5rem;
            border-radius: 2rem;
        }
        
        .toggle-btn.active {
            background: var(--danger-color, #dc3545);
            color: white;
            
            &:hover {
                background: darken(#dc3545, 10%);
            }
        }
        
        .toggle-btn.inactive, .create-btn, .confirm-btn {
            background: var(--success-color, #28a745);
            color: white;
            
            &:hover {
                background: darken(#28a745, 10%);
            }
        }
        
        .confirm-btn.inactive {
            background: var(--danger-color, #dc3545);
            
            &:hover {
                background: darken(#dc3545, 10%);
            }
        }
        
        .cancel-btn {
            background: var(--text-color-secondary);
            color: white;
            
            &:hover {
                background: darken(#6c757d, 10%);
            }
        }
        
        .instruction-message {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            color: var(--text-color-secondary);
            border: 1px dashed var(--border-color);
            border-radius: 4px;
        }
    }
    
    .error-message, .success-message {
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 12px;
    }
    
    .error-message {
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--danger-color, #dc3545);
    }
    
    .success-message {
        background-color: rgba(40, 167, 69, 0.1);
        color: var(--success-color, #28a745);
    }
</style>