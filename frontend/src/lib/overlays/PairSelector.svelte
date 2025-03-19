<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store'; 
    import { pb } from '$lib/pocketbase';
    import { Search, Star, ArrowLeft } from 'lucide-svelte';
    import type { Token } from 'types/walletTypes';
    import type { Pair } from 'types/orderTypes';
    import { tokens as tokensStore } from 'clients/tokenClient';
    import { 
        pairs, 
        tokens as localTokens,
        selectedPair, 
        getPairsForToken, 
        selectPair, 
        favoriteTokenIds,
        favoritePairIds,
        initOrderData
    } from 'stores/orderStore';

    let filteredTokens: Token[] = [];
    let errorMessage = '';
    let searchQuery = '';
    let tokenPairs: Pair[] = [];
    
    let tabs = ['All', 'Favorites', 'Custom'];
    let activeTab = 'All';
    

    function handleTabClick(tab: string) {
        activeTab = tab;
        filterTokens();
    }

    function filterTokens() {
    if ($localTokens.length === 0) return;
    
    // First filter by search query and exclude USDT and USDC
    let filtered = $localTokens.filter((token: Token) => { // Explicit type for token
        // Exclude USDT and USDC by ticker
        if (token.ticker.toUpperCase() === 'USDT' || token.ticker.toUpperCase() === 'USDC') {
            return false;
        }
        
        return token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
               token.network.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    // Then filter by active tab
    if (activeTab === 'Favorites') {
        filtered = filtered.filter((token: Token) => { // Explicit type for token
            const favoriteIds = get(favoriteTokenIds); // Get current value of the store
            return favoriteIds.has(token.tokenId);
        });
    } else if (activeTab === 'Custom') {
        // Add custom tab filtering logic here
    }
    
    filteredTokens = filtered;
}

    function handleSearch(event: Event) {
        searchQuery = (event.target as HTMLInputElement).value;
        filterTokens();
    }

    function toggleFavorite(tokenId: string) {
        favoriteTokenIds.update(ids => {
            const newIds = new Set(ids); 
            if (newIds.has(tokenId)) {
                newIds.delete(tokenId);
            } else {
                newIds.add(tokenId);
            }
            return newIds;
        });
        
        if (activeTab === 'Favorites') {
            filterTokens();
        }
    }

    function togglePairFavorite(pairId: string) {
        favoritePairIds.update(ids => {
            const newIds = new Set(ids); 
            if (newIds.has(pairId)) {
                newIds.delete(pairId);
            } else {
                newIds.add(pairId);
            }
            return newIds;
        });
    }


    function backToTokenList() {
        selectedPair.set(null); // Use set method
    }

    function handleSelectPair(pair: Pair) {
        if (pair.is_active) {
            selectedPair.set(pair);
            // selectPair(pair);
        } else {
            console.warn('Cannot select inactive pair:', pair);
        }
    }

    export async function fetchTokenParents() {
        try {
            const allTokens = await pb.collection('tokens').getFullList<Token>({
                headers: {
                    Authorization: pb.authStore.token,
                },
            });
            
            const tokenMap = new Map<string, Token>();
            
            allTokens.forEach(token => {
                if (!tokenMap.has(token.tokenId)) {
                    tokenMap.set(token.tokenId, token);
                }
            });
            
            localTokens.set(Array.from(tokenMap.values())); 
            filteredTokens = get(localTokens); 
            
            console.log('Fetched unique tokens:', get(localTokens));
        } catch (error) {
            console.error('Failed to fetch unique tokens:', error);
            errorMessage = 'Failed to fetch unique tokens. Check your permissions.';
        }
    }

    export async function fetchPairs() {
        try {
            const pairsData = await pb.collection('pairs').getFullList<Pair>({
                headers: {
                    Authorization: pb.authStore.token,
                }
            });
            pairs.set(pairsData);
            console.log('Fetched pairs:', get(pairs));
        } catch (error) {
            console.error('Failed to fetch pairs:', error);
            errorMessage = 'Failed to fetch trading pairs. Check your permissions.';
        }
    }

    function getTokenPairs(tokenId: string) {
        
        tokenPairs = $pairs.filter((pair: Pair) => 
            pair.base_token_id === tokenId || pair.quote_token_id === tokenId
        );
    }

    function handleImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = '/placeholder-coin.png';
    }

    onMount(async () => {
        console.log('PairSelector mounted, initializing data');
        await initOrderData();
    });
    
    // Log when pair selection changes for debugging
    selectedPair.subscribe(pair => {
        console.log('PairSelector: selectedPair changed to', pair);
    });
    
$: filteredTokens = $localTokens.filter((token: Token) => {
    // Exclude USDT and USDC
    if (token.ticker.toUpperCase() === 'USDT' || token.ticker.toUpperCase() === 'USDC') {
        return false;
    }
    
    const matchesSearch = !searchQuery || 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.ticker.toLowerCase().includes(searchQuery.toLowerCase());
        
    if (activeTab === 'Favorites') {
        return matchesSearch && $favoriteTokenIds.has(token.tokenId);
    }
    
    return matchesSearch;
});
</script>

<div class="token-container">
    {#if $selectedPair}
        <!-- Trading Pair View -->
        <div class="pair-detail-view">
            <div class="pair-header">
                <button class="toggle-button" on:click={backToTokenList}>
                    <ArrowLeft />
                    Back to Tokens
                </button>
                <div class="pair-title">
                    <div class="pair-icons">
                        {#if true}
                            {@const baseToken = $localTokens.find(t => t.ticker === $selectedPair.base_token)}
                            {@const quoteToken = $localTokens.find(t => t.ticker === $selectedPair.quote_token)}
                            <img 
                                src={baseToken?.iconUrl || '/placeholder-coin.png'} 
                                alt={$selectedPair.base_token}
                                class="token-icon"
                                on:error={handleImageError}
                            />
                            <!-- <img 
                                src={quoteToken?.iconUrl || '/placeholder-coin.png'} 
                                alt={$selectedPair.quote_token}
                                class="token-icon"
                                on:error={handleImageError}
                            /> -->
                        {/if}
                    </div>
                    <span>
                        <h2 class="base">{$selectedPair.base_token}</h2>
                        <h2 class="seperator">/</h2>
                        <h2 class="quote">{$selectedPair.quote_token}</h2>
                    </span>
                    <button 
                        class="favorite-button {$favoritePairIds.has($selectedPair.id) ? 'favorited' : ''}"
                        on:click={() => togglePairFavorite($selectedPair.id)}
                    >
                        <Star />
                    </button>
                </div>
            </div>
            
            <div class="pair-details">
                <div class="pair-info-card">
                    <div class="info-row">
                        <span class="label">Status:</span>
                        <span class="value {$selectedPair.is_active ? 'active' : 'inactive'}">
                            {$selectedPair.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="label">Last Price:</span>
                        <span class="value">{$selectedPair.lastPrice || 'No data'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">24h Volume:</span>
                        <span class="value">{$selectedPair.volume_24h || '0'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Created:</span>
                        <span class="value">{new Date($selectedPair.created).toLocaleString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Last Updated:</span>
                        <span class="value">{new Date($selectedPair.updated).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <!-- Token List View -->
        {#if filteredTokens.length === 0}
            <div class="empty-state">
                {#if searchQuery}
                    No tokens found matching "{searchQuery}".
                {:else if activeTab === 'Favorites'}
                    No favorite tokens. Click the star icon to add tokens to your favorites.
                {:else}
                    No tokens available. Please check your connection.
                {/if}
            </div>
        {:else}
            <div class="table-container">
                <div class="controls">
                    <div class="search-box">
                        <Search />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            bind:value={searchQuery}
                            on:input={handleSearch}
                        />
                        
                    </div>
                    <div class="tabs">
                        {#each tabs as tab}
                            <button
                                class="tab {activeTab === tab ? 'active' : ''}"
                                on:click={() => handleTabClick(tab)}
                            >
                                {#if tab === 'Favorites'}
                                    <Star size="26" />
                                {/if}
                                {tab}
                            </button>
                        {/each}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>
                                <div class="controls">
                                    Token


                                </div>
                            </th>
                            <th>
                                <div class="controls">
                                    Trading pairs
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredTokens as token (token.id)}
                            <tr>
                                <td>
                                    <div class="td-ticker">
                                        <button 
                                            class="favorite-button {$favoriteTokenIds.has(token.tokenId) ? 'favorited' : ''}"
                                            on:click={() => toggleFavorite(token.tokenId)}
                                            title={$favoriteTokenIds.has(token.tokenId) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <Star />
                                        </button>
                                        <img 
                                            src={token.iconUrl} 
                                            alt={token.name} 
                                            width="32" 
                                            on:error={handleImageError} 
                                        />
                                        <span>
                                            <p class="ticker">{token.ticker}</p>
                                            <p class="name">{token.name}</p>
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="trading-pairs-container">
                                        {#if true}
                                            {@const tokenPairs = getPairsForToken(token.ticker)}
                                            {#if tokenPairs.length === 0}
                                                <span class="no-pairs">No trading pairs</span>
                                            {:else}
                                                <div class="trading-pairs">
                                                    {#each tokenPairs as pair}
                                                        {@const pairName = `${pair.base_token}/${pair.quote_token}`}
                                                        <button 
                                                            class="pair-button {pair.is_active ? 'active' : 'inactive'}"
                                                            on:click={() => handleSelectPair(pair)}
                                                            title={pair.is_active ? 'Active' : 'Inactive'}
                                                        >
                                                            {pairName}
                                                        </button>
                                                    {/each}
                                                </div>
                                            {/if}
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
    
    <!-- Debug info for development -->
    {#if import.meta.env.DEV}
        <div class="debug-info">
            <p>Selected Pair: {$selectedPair ? `${$selectedPair.base_token}/${$selectedPair.quote_token} (${$selectedPair.id})` : 'None'}</p>
            <p>Loaded Tokens: {$localTokens.length}</p>
            <p>Loaded Pairs: {$pairs.length}</p>
        </div>
    {/if}
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
    }   

    .panel-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        height: auto;
        top: 0;
        left: 0;
        right: 0;

        h3 {
            font-size: 2rem;
        }
        
    }

    form {
        background:transparent;
        width:900px;
    }

    .table-container {
        width: auto;
        display: flex;
        position: relative;
        justify-content: space-between;
        left: 0;
        right: 0;
        top: 0;
        flex-direction: column;
        margin: 0;
        border-collapse: collapse;
        overflow-x: hidden;
        padding: 1rem;
    }

    .controls {
        display: flex;
        flex-direction: row;
        justify-content: top;
        margin-top:0;
        position: relative;
        top: 0;
        left: 0;
        backdrop-filter: blur(100px);
        height: auto;
        gap: 1rem;
        font-size: 1rem;
        width: auto;
        z-index: 3;
        overflow: auto;
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 0;
        padding: 0 0.5rem;

        border-radius: 1rem;
        background: var(--tertiary-color);
        height: auto;

        margin-right: 0.5rem;
        color: var(--secondary-color);

        input {
            border: none;
            width: auto;
            outline: none;
            font-size: 1rem;
            border-radius: 1rem;
            margin-left: 1rem;
            padding: 0.5rem 1rem;
            background: var(--tertiary-color);

        }

    }

    

    .tabs {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        gap: 0;
        margin-left: 0;
        margin-bottom: 0;
        width: auto;
        padding: 0;
    }

    .tab {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: transparent;
        gap: 0.5rem;
        width: auto;
        border: none;
        color: var(--tertiary-color);
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: background-color 0.2s;

        &:hover {
            background-color: var(--secondary-color);
            color: var(--text-color);
            border-radius: 1rem;
        }

        &.active {
            background-color: var(--tertiary-color);
            color: var(--text-color);
            font-weight: 800;
            border-radius: 1rem;
        }
    }

    .row-input-stack {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
    
    .toolbar {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: auto;
    }
    .row-input {
        background: var(--primary-color);
        color: var(--text-color);
        display: flex;
        flex-direction: row;
        left: 0;
        
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 1rem;
        border-radius: 2rem;
        gap: 1rem;
        margin-bottom: 1rem;

        & label {
            font-size: 1.5rem;
        }

        & input {
            width: auto;
            border-radius: 2rem;
            font-size: 1.5rem;

        }


        & button {
            background: var(--secondary-color);
            border: 1px solid var(--primary-color);
            font-size: 2rem;
            width: 4rem;
            height: 4rem;
            border-radius: 50%;
            transition: all 0.3s ease;

            &:hover {
                background: var(--primary-color);
                border: 1px solid var(--secondary-color);
                color: green;
            }
        }

    }

        
        .favorite-button {
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--placeholder-color);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            
            &:hover {
                color: var(--text-color);
            }
            
            &.favorited {
                color: gold;
            }
        
    }

    .trading-pairs-container {
        width: 100%;
    }

    .trading-pairs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .no-pairs {
        color: var(--placeholder-color);
        font-style: italic;
    }

    .pair-button {
        padding: 6px 10px;
        border-radius: 4px;
        border: none;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &.active {
            background: rgba(40, 167, 69, 0.2);
            color: var(--success-color, #28a745);
            border: 1px solid var(--success-color, #28a745);
            
            &:hover {
                background: rgba(40, 167, 69, 0.3);
            }
        }
        
        &.inactive {
            background: rgba(220, 53, 69, 0.2);
            color: var(--danger-color, #dc3545);
            border: 1px solid var(--danger-color, #dc3545);
            
            &:hover {
                background: rgba(220, 53, 69, 0.3);
            }
        }
    }

    .pair-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        span {
            display: flex;
            flex-direction: row;
            align-items: center;


            h2.base {
                font-size: 2.5rem;
            }
            h2.quote {
                font-weight: 200;
                font-size: 2.5rem;
                margin-left: 0.5rem;
            }
            h2.seperator {
                font-size: 2rem;
                font-weight: 200;
            }
        }
    }

    table {
            margin-left: 1rem;
            border-collapse: collapse;
            position: sticky;
            overflow: none;

            & thead {
                position: sticky;
            }

            & tbody {
                overflow-y: auto;
            }


            & tbody tr {
                transition: 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
                &:hover {
                background:var(--bg-gradient-fade);
                color: var(--text-color);
                cursor: pointer;
                transform: translateX(1rem);
                td.ticker {
                    color: var(--text-color);
                }

            }
        


        }
        



            th, td {
                padding: 0.75rem 0.5rem;
                text-align: left;
                // border-bottom: 1px solid var(--primary-color);
                border-left: none;
                height: auto;
            }

            .td-ticker {
                display: flex;
                flex-direction: row;
                gap: 0.5rem;
                height: 3rem;
                justify-content: center;
                align-items: center;
                color: var(--text-color);
                transition: all 0.3s ease;

                &:hover {
                    color: var(--text-color);

                }

                span {
                    display: flex;
                    flex-direction: row;
                    gap: 0.5rem;
                    justify-content: flex-start;
                    width: auto;
                    height: auto;
                }
                p.ticker {
                    font-weight: 800;
                }
                p.name {
                }
            }

            td {
            }

            td.coin {
                font-weight: 800;
                letter-spacing: 0.25rem;
                width: 100px;
                text-align: left;
                // border-right: 1px solid var(--tertiary-color);

            }
            td.price {
                letter-spacing: 0.25rem;
                
                width: 300px;
                text-align: left;
                // border-right: 1px solid var(--tertiary-color);

            }
            td.value {
                letter-spacing: 0.25rem;
                width: auto;
                text-align: left;
                border-right: 1px solid transparent;
            }

            th {
                position: sticky;
                // backdrop-filter: blur(100px);
                top: 0;
                color: var(--text-color);
                font-weight: 200;
                height: 3rem;
                padding: 0.5rem;
                // border-bottom: 1px solid var(--secondary-color);
            }
        }

        @media (max-width: 768px) {
            .pair-title {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 0.5rem;
            span {
                display: flex;
                flex-direction: row;
                align-items: center;


                h2.base {
                    font-size: 1.5rem;
                }
                h2.quote {
                    font-weight: 200;
                    font-size: 1.5rem;
                    margin-left: 0.5rem;
                }
                h2.seperator {
                    font-size: 1rem;
                    font-weight: 200;
                }
            }
        }
        }




  
</style>
    