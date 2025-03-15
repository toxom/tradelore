<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { fetchTokens, fetchTokenPrices, type TokenPrice } from '../../clients/tokenClient';
    
    export let refreshInterval = 6000000; 
    
    let prices: TokenPrice[] = [];
    let tokens = [];
    let loading = true;
    let error = '';
    let intervalId: ReturnType<typeof setInterval>;
    
    async function loadData() {
      try {
        loading = true;
        error = '';
        
        // Fetch the latest tokens
        await fetchTokens();
        // After fetchTokens is called, tokens should be populated from the tokenclient module
        // We'll import tokens directly in the component
        const { tokens: currentTokens } = await import('../../clients/tokenClient');
        tokens = currentTokens;
        
        // Fetch current prices
        prices = await fetchTokenPrices(tokens);
        
        loading = false;
      } catch (e) {
        loading = false;
        error = 'Failed to load token prices';
        console.error('Error loading token prices:', e);
      }
    }
    
 
    
    export function getChangeColor(change?: number): string {
      if (!change) return 'neutral';
      return change >= 0 ? 'positive' : 'negative';
    }
    
    export function formatPrice(price: number): string {
      if (price >= 1000) {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      } else if (price >= 1) {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 });
      }
    }
    
    export function handleImageError(event: Event) {
      const img = event.target as HTMLImageElement;
      img.src = '/placeholder-coin.png';
    }
    
    export function getTokenIcon(tokenId: string): string {
      const token = tokens.find(t => t.tokenId === tokenId);
      return token?.iconUrl || '/placeholder-coin.png';
    }

    onMount(async () => {
      await loadData();
      
      // Set up interval for refreshing prices
      intervalId = setInterval(loadData, refreshInterval);
    });
    
    onDestroy(() => {
      if (intervalId) clearInterval(intervalId);
    });
  </script>
  
  <div class="sticker-container">
    
    {#if loading && prices.length === 0}
      <div class="loading-container">
        <div class="spinner"></div>
      </div>
    {/if}
    
    {#if error}
      <div class="error-alert">
        <span>{error}</span>
      </div>
    {/if}
    
    {#if prices.length > 0}
      <div class="grid">
        {#each prices as price (price.id)}
          <div class="card">
            <div class="token-header">
              <img 
                src={getTokenIcon(price.id)} 
                alt={price.name} 
                class="token-icon"
                on:error={handleImageError}
              />
              <div class="token-info">
                <h3 class="token-ticker">{price.ticker}</h3>
                <p class="token-name">{price.name}</p>
              </div>
            </div>
            
            <div class="info">
              <div class="value">{formatPrice(price.price)}</div>
              <div class={`change ${getChangeColor(price.priceChangePercentage24h)}`}>
                {price.priceChangePercentage24h ? `${price.priceChangePercentage24h.toFixed(2)}%` : 'N/A'} 
                <span class="time-period">(24h)</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if !loading}
      <p class="no-prices">No token prices available</p>
    {/if}
    
    <div class="actions">
      <button 
        on:click={loadData}
        class="refresh-button"
        disabled={loading}
      >
        {#if loading}
          <span class="button-spinner"></span>
        {/if}
        Refresh
      </button>
    </div>
    
    <p class="last-updated">
      Last updated: {prices.length > 0 ? new Date().toLocaleString() : 'Never'}
    </p>
  </div>
  
  <style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
  </style>