<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { OrdersClient } from 'clients/ordersClient';
    import { selectedPair } from 'stores/orderStore';
    
    let bids = [];
    let asks = [];
    let loading = true;
    let error = null;
    let interval;
    
    const getRelativeWidth = (amount: number, maxAmount: number) => {
        return maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
    };
    
    async function loadOrderbook() {
        try {
            if (!$selectedPair || !$selectedPair.id) {
                console.log('[OrderBook] No pair selected, skipping load');
                loading = false;
                return;
            }
            
            loading = true;
            console.log(`[OrderBook] Loading orderbook for pair: ${$selectedPair.id}`);
            
            const result = await OrdersClient.getOrderbook($selectedPair.id);
            console.log('[OrderBook] Received result:', result);
            
            bids = result.bids;
            asks = result.asks;
            
            console.log(`[OrderBook] Updated with ${bids.length} bids and ${asks.length} asks`);
            loading = false;
        } catch (err) {
            console.error('[OrderBook] Error loading orderbook:', err);
            error = "Failed to load orderbook data";
            loading = false;
        }
    }
    
    $: maxBidAmount = bids.length ? Math.max(...bids.map((bid) => bid.amount)) : 0;
    $: maxAskAmount = asks.length ? Math.max(...asks.map((ask) => ask.amount)) : 0;
    $: maxAmount = Math.max(maxBidAmount, maxAskAmount);
    
    // React to changes in the selected pair
    $: if ($selectedPair) {
        console.log(`[OrderBook] Selected pair changed to: ${$selectedPair.base_token}/${$selectedPair.quote_token}`);
        loadOrderbook();
    }
    
    onMount(() => {
        console.log('[OrderBook] Component mounted');
        if ($selectedPair) {
            loadOrderbook();
        }
        
        // Set up refresh interval
        interval = setInterval(() => {
            if ($selectedPair) {
                console.log('[OrderBook] Refreshing orderbook data...');
                loadOrderbook();
            }
        }, 30000);
    });
    
    onDestroy(() => {
        console.log('[OrderBook] Component unmounting, clearing interval');
        clearInterval(interval);
    });
</script>

<div class="order-book">
    <div class="order-book-header">
        <span>Price ({$selectedPair ? $selectedPair.quote_token : 'BCH'})</span>
        <span>Amount ({$selectedPair ? $selectedPair.base_token : 'CET'})</span>
        <span>Total ({$selectedPair ? $selectedPair.base_token : 'CET'})</span>
    </div>

    {#if !$selectedPair}
        <div class="empty">No trading pair selected</div>
    {:else if loading && !bids.length && !asks.length}
        <div class="loading">Loading orderbook data...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if bids.length === 0 && asks.length === 0}
        <div class="empty">
            <p>No orderbook data available for {$selectedPair.base_token}/{$selectedPair.quote_token}</p>
        </div>
    {:else}
        <!-- Bids Section -->
        <div class="order-book-section bids">
            {#if bids.length === 0}
                <div class="empty-section">No buy orders available</div>
            {:else}
                {#each bids as bid}
                    <div class="order-book-row bid">
                        <div
                            class="background"
                            style="width: {getRelativeWidth(bid.amount, maxAmount)}%; background: linear-gradient(to right, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0.2) 100%);"
                        ></div>
                        <span class="price">{bid.price.toFixed(8)}</span>
                        <span class="amount">{bid.amount.toFixed(4)}</span>
                        <span class="total">{bid.total.toFixed(3)}</span>
                    </div>
                {/each}
            {/if}
        </div>

        <!-- Asks Section -->
        <div class="order-book-section asks">
            {#if asks.length === 0}
                <div class="empty-section">No sell orders available</div>
            {:else}
                {#each asks as ask}
                    <div class="order-book-row ask">
                        <div
                            class="background"
                            style="width: {getRelativeWidth(ask.amount, maxAmount)}%; background: linear-gradient(to right, rgba(220, 53, 69, 0.2) 0%, rgba(220, 53, 69, 0.2) 100%);"
                        ></div>
                        <span class="price">{ask.price.toFixed(8)}</span>
                        <span class="amount">{ask.amount.toFixed(4)}</span>
                        <span class="total">{ask.total.toFixed(3)}</span>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>


<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
    .order-book {
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        width: 100%;
        margin: 0 auto;
    }

    .order-book-header {
        display: flex;
        justify-content: space-between;
        padding: 12px;

        color: var(--tertiary-color);
    }

    .order-book-section {
        display: flex;
        flex-direction: column;
        font-size: 0.9rem;
        
    }

    .order-book-section.bids {
        margin-bottom: 1rem;
        
    }

    .order-book-section.asks {
    }

    .order-book-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid var(--secondary-color);

        position: relative;
        overflow: hidden;
    }

    .order-book-row:last-child {
        border-bottom: none;
    }

    .order-book-row .price {
        color: var(--text-color);
        z-index: 1; 
    }

    .order-book-row.ask .price {
        color: var(--text-color); 
        z-index: 1; 
    }

    .order-book-row .amount,
    .order-book-row .total {
        color: #666;
        z-index: 1; 
    }

    .order-book-row {
        background: var(--primary-color);
    }

    .order-book-row .background {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        z-index: 0; 
    }
</style>