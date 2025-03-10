<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { fetchTokens, fetchTokenPrices, type TokenPrice } from '../../clients/tokenClient';
    
    export let refreshInterval = 60000; // Default refresh every minute
    
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
    
    onMount(async () => {
      await loadData();
      
      // Set up interval for refreshing prices
      intervalId = setInterval(loadData, refreshInterval);
    });
    
    onDestroy(() => {
      if (intervalId) clearInterval(intervalId);
    });
    
    function getChangeColor(change?: number): string {
      if (!change) return 'neutral';
      return change >= 0 ? 'positive' : 'negative';
    }
    
    function formatPrice(price: number): string {
      if (price >= 1000) {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      } else if (price >= 1) {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 });
      }
    }
    
    function handleImageError(event: Event) {
      const img = event.target as HTMLImageElement;
      img.src = '/placeholder-coin.png';
    }
    
    function getTokenIcon(tokenId: string): string {
      const token = tokens.find(t => t.tokenId === tokenId);
      return token?.iconUrl || '/placeholder-coin.png';
    }
  </script>
  
  <div class="price-sticker-container">
    <h2 class="title">Token Prices</h2>
    
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
      <div class="price-grid">
        {#each prices as price (price.id)}
          <div class="price-card">
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
            
            <div class="price-info">
              <div class="price-value">{formatPrice(price.price)}</div>
              <div class={`price-change ${getChangeColor(price.priceChangePercentage24h)}`}>
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
  
  <style>
    .price-sticker-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }
    
    .title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 1rem;
      margin-top: 0;
      display: flex;
      justify-content: center;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    
    .spinner {
      height: 1.5rem;
      width: 1.5rem;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
    h2 {
        color: var(--text-color);
    }
    .button-spinner {
      display: inline-block;
      height: 1rem;
      width: 1rem;
      border: 2px solid white;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
      margin-right: 0.25rem;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .error-alert {
      background-color: #fee2e2;
      border: 1px solid #f87171;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
    }
    
    .price-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(1, 1fr);
    }
    
    @media (min-width: 640px) {
      .price-grid {
        grid-template-columns: repeat(2, 1fr);

      }
    }
    
    @media (min-width: 768px) {
      .price-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (min-width: 1024px) {
      .price-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    .price-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      transition: transform 0.2s;
    }
    
    .price-card:hover {
      transform: scale(1.05);
    }
    
    .token-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .token-icon {
      width: 2rem;
      height: 2rem;
      margin-right: 0.5rem;
      border-radius: 50%;
    }
    
    .token-ticker {
      font-weight: bold;
      margin: 0;
    }
    
    .token-name {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0;
    }
    
    .price-info {
      margin-top: 0.5rem;
    }
    
    .price-value {
      font-size: 1.125rem;
      font-weight: 600;
    }
    
    .price-change {
      font-size: 0.875rem;
    }
    
    .price-change.positive {
      color: #10b981;
    }
    
    .price-change.negative {
      color: #ef4444;
    }
    
    .price-change.neutral {
      color: #6b7280;
    }
    
    .time-period {
      font-size: 0.75rem;
    }
    
    .no-prices {
      text-align: center;
      padding: 1rem 0;
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
    
    .refresh-button {
      background-color: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    
    .refresh-button:hover {
      background-color: #2563eb;
    }
    
    .refresh-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .last-updated {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
      text-align: right;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .price-card {
        background-color: #1f2937;
        color: white;
      }
      
      .token-name {
        color: #9ca3af;
      }
      
      .price-change.neutral {
        color: #9ca3af;
      }
      
      .last-updated {
        color: #9ca3af;
      }
    }
  </style>