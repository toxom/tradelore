<script lang="ts">
    import { ArrowDownFromLine, ArrowDownToLine } from 'lucide-svelte';
import { writable } from 'svelte/store';
  
    // Component props
    export let availableBalance: number = 0;
    export let symbol: string = 'BTC/USDT';
    export let baseCurrency: string = 'BTC';
    export let quoteCurrency: string = 'USDT';

    let isSelected = false;

    // State management
    const orderType = writable<'limit' | 'market'>('limit');
    const side = writable<'buy' | 'sell'>('buy');
    const price = writable<number | null>(null);
    const amount = writable<number>(0);
    const sliderPercentage = writable<number>(0);
    
    $: maxAmount = $side === 'buy' 
      ? $price ? availableBalance / $price : 0 
      : availableBalance;
      
    $: orderValue = $price ? $amount * $price : 0;
    
    function handleTabChange(type: 'limit' | 'market') {
      orderType.set(type);
      if (type === 'market') {
        price.set(null);
      }
    }
    
    function handleSideChange(newSide: 'buy' | 'sell') {
      side.set(newSide);
      amount.set(0);
      sliderPercentage.set(0);
    }
    
    function handleSliderChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const percentage = parseInt(target.value);
      sliderPercentage.set(percentage);
      amount.set((maxAmount * percentage) / 100);
    }
    
    function handleSubmit() {
      const orderDetails = {
        type: $orderType,
        side: $side,
        price: $price,
        amount: $amount,
        symbol,
        total: orderValue
      };
      
      console.log('Submitting order:', orderDetails);
      // Here you would typically dispatch an event or call a function to place the order
    }
  </script>
  
  <div class="order-form">
    <!-- Order type tabs -->
    <div class="order-tabs">
      <button 
        class="tab {$orderType === 'limit' ? 'active' : ''}" 
        on:click={() => handleTabChange('limit')}
      >
        Limit
      </button>
      <button 
        class="tab {$orderType === 'market' ? 'active' : ''}" 
        on:click={() => handleTabChange('market')}
      >
        Market
      </button>
    </div>
    
    <!-- Buy/Sell toggle -->
    <div class="side-toggle" class:active={isSelected} on:click={() => {
        isSelected = !isSelected;
      }}>
      <button 
        class="side-btn {$side === 'buy' ? 'active' : ''}" 
        on:click={() => handleSideChange('buy')} 
      >
        <ArrowDownToLine/>
        Buy
      </button>
      <button 
        class="side-btn {$side === 'sell' ? 'active' : ''}" 
        on:click={() => handleSideChange('sell')}
      >
        <ArrowDownFromLine/>
        Sell
      </button>
    </div>
    
    <div class="order-form-container">
      <!-- Left column -->
      <div class="form-column">
        <!-- Available balance -->
        <div class="balance-info">
          <span>Available </span>
          <span class="available">{availableBalance} {$side === 'buy' ? quoteCurrency : baseCurrency}</span>
        </div>
        
        <!-- Price input (only for limit orders) -->
        {#if $orderType === 'limit'}
          <div class="input-group">
            <label for="price-input">Price</label>
            <div class="input-wrapper">
              <input 
                id="price-input"
                type="number" 
                min="0" 
                step="0.0001"
                bind:value={$price}
                placeholder="0.00"
              />
              <span class="currency">{quoteCurrency}</span>
            </div>
          </div>
        {/if}
        
        <!-- Amount input -->
        <div class="input-group">
          <label for="amount-input">Amount</label>
          <div class="input-wrapper">
            <input 
              id="amount-input"
              type="number" 
              min="0" 
              step="0.0001"
              bind:value={$amount}
              placeholder="0.00"
            />
            <span class="currency">{baseCurrency}</span>
          </div>
        </div>
        
        <!-- Percentage slider -->
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="25" 
            bind:value={$sliderPercentage}
            on:input={handleSliderChange}
          />
          <div class="percentage-buttons">
            <button on:click={() => { sliderPercentage.set(0); amount.set(0); }}>0%</button>
            <button on:click={() => { sliderPercentage.set(25); amount.set(maxAmount * 0.25); }}>25%</button>
            <button on:click={() => { sliderPercentage.set(50); amount.set(maxAmount * 0.5); }}>50%</button>
            <button on:click={() => { sliderPercentage.set(75); amount.set(maxAmount * 0.75); }}>75%</button>
            <button on:click={() => { sliderPercentage.set(100); amount.set(maxAmount); }}>100%</button>
          </div>
        </div>
      </div>
      
      <!-- Right column -->
      <div class="form-column">
        <!-- Total order value -->
        <div class="total-value">
          <span>Total</span>
          <span class="price">{orderValue.toFixed(2)} {quoteCurrency}</span>
        </div>
        
        <!-- Submit button -->

      </div>
      <button 
      class="submit-button {$side === 'buy' ? 'buy' : 'sell'}" 
      on:click={handleSubmit}
      disabled={$amount <= 0 || ($orderType === 'limit' && !$price)}
    >
      {$side === 'buy' ? 'Buy' : 'Sell'} {baseCurrency}
    </button>
    </div>
  </div>
  
  <style lang="scss">

    @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);
        }
    .order-form {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      width: 100%;
      max-width: auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .order-tabs {
      display: flex;
      width: auto;
    }
    
    .tab {
      flex: 1;
      padding: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: all 0.2s ease;
      color: var(--tertiary-color);
    }
    
    .tab.active {
      border-bottom: 2px solid var(--tertiary-color);
      color: var(--text-color);
      background: var(--secondary-color);
      border-radius: 2rem;
    }
    
    .side-toggle {
      display: flex;
      padding: 10px;
      gap: 8px;
    }
    
    .side-btn {
      flex: 1;
      padding: 0.5rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      border-radius: 1rem;
      background: var(--primary-color);
      color: var(--text-color);
      cursor: pointer;
      font-weight: 500;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid transparent;
      &:hover {
        transform: translateY(10px);
      }



    }
    .side-btn.active {
        box-shadow: -100px -1px 100px 4px rgba(255, 255, 255, 0.2);
        background: var(--text-color);
        color: var(--primary-color);
        border: 1px solid var(--secondary-color);

    }
    .side-btn.active.buy {
      background: rgba(0, 180, 100, 0.1);
      border-color: #00b464;
      color: #00b464;
      font-weight: 700;
    }
    
    .side-btn.active.sell {
      background: rgba(255, 90, 90, 0.1);
      border-color: #ff5a5a;
      color: #ff5a5a;
    }
    
    .order-form-container {
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 16px;
    }
    
    .form-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
      font-size: 1.2rem;
    }

    label {
        width: 120px;
        height: auto;
        font-weight: 300;
        
    }
    
    input {
        height: 3rem;
        font-size: 1.5rem;
    }
    
    .balance-info, .input-group, .total-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .balance-info {

        align-items: left;
        text-align: left;
        width: auto;
        left: 0;
        gap: 4rem;


        & span.available {
            font-size: 2rem;
            font-weight: 600;
        }
    }

    .input-group {
        display: flex;

    }



    .total-value {
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
        height: 100%;

        gap: 0.5rem;
        font-size: 2rem;
        font-weight: 400;

        & span.price {

            font-size: 3rem;
            font-weight: 700;
        }
    }
    
    .input-wrapper {
      position: relative;

      width: 100%;
      font-weight: 600;
    }
    
    input[type="number"] {
      position: relative;
      width: auto;

      border: 1px solid var(--primary-color);
      border-radius: 1rem;
      padding: 0.5rem;
      background: var(--tertiary-color);
    }
    
    .currency {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }
    
    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-bottom: 1px solid var(--tertiary-color);
    }
    
    input[type="range"] {
      width: 100%;
    }
    
    .percentage-buttons {
      display: flex;
      justify-content: space-between;
    }
    
    .percentage-buttons button {
      border: none;
      background: none;
      cursor: pointer;
      color: var(--text-color);
      font-size: 1.5rem;
    }
    
    .submit-button {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      margin-top: auto;
    }
    
    .submit-button.buy {
      background-color: #00b464;
      height: 5rem;
      font-size: 2rem;
    }
    
    .submit-button.sell {
      background-color: #ff5a5a;
      height: 5rem;
      font-size: 2rem;
    }
    
    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 1600px) {
        
    }
  </style>