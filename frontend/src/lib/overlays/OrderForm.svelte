<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowDownFromLine, ArrowDownToLine, ArrowUpFromDot, ArrowUpFromLine, ArrowUpFromLineIcon } from 'lucide-svelte';
  import { writable, get } from 'svelte/store';
  import type { Orderbook } from 'types/orderTypes';
  import { pb } from '$lib/pocketbase';

  import { selectedPair, pairs, availableBalances } from 'stores/orderStore';
  
  export let availableBalance: number = 0;
  export let symbol: string = 'BTC/USDT';
  export let baseCurrency: string = 'BTC';
  export let quoteCurrency: string = 'USDT';

  let isSelected = false;

  const orderType = writable<'limit' | 'market'>('limit');
  const type = writable<'buy' | 'sell'>('buy');
  const price = writable<number | null>(null);
  const amount = writable<number>(0);
  const sliderPercentage = writable<number>(0);
    const unsubscribePair = selectedPair.subscribe(pair => {
        if (pair) {
            console.log('OrderForm: selectedPair changed to', pair);
            baseCurrency = pair.base_token;
            quoteCurrency = pair.quote_token;
            symbol = `${baseCurrency}/${quoteCurrency}`;
            
            // Reset form values when pair changes
            price.set(null);
            amount.set(0);
            sliderPercentage.set(0);
        } else {
            console.log('OrderForm: selectedPair is null');
        }
    });
  // Function to get pairs for a token (similar to PairSelector)
  function getPairsForToken(ticker: string) {
      return get(pairs).filter(pair => 
          pair.base_token === ticker || pair.quote_token === ticker
      );
  }
  
  selectedPair.subscribe(pair => {
      if (pair) {
          baseCurrency = pair.base_token;
          quoteCurrency = pair.quote_token;
          symbol = `${baseCurrency}/${quoteCurrency}`;
          
          // Reset form values when pair changes
          price.set(null);
          amount.set(0);
          sliderPercentage.set(0);
      }
  });
  

  function handleTabChange(type: 'limit' | 'market') {
    orderType.set(type);
    if (type === 'market') {
      price.set(null);
    }
  }

function updateAmountFromSlider() {
    const newAmount = (maxAmount * $sliderPercentage) / 100;
    
    amount.set(parseFloat(newAmount.toFixed(4)));
}

function updateSliderFromAmount() {
    if (maxAmount === 0) {
        sliderPercentage.set(0);
        return;
    }
    const newPercentage = ($amount / maxAmount) * 100;
    sliderPercentage.set(Math.min(100, Math.max(0, parseFloat(newPercentage.toFixed(0)))));
}

function setPercentage(percent: number) {
    sliderPercentage.set(percent);
    
    const newAmount = (maxAmount * percent) / 100;
    amount.set(parseFloat(newAmount.toFixed(4)));
}


  function handleTypeChange(newType: 'buy' | 'sell') {
    type.set(newType);
    amount.set(0);
    sliderPercentage.set(0);
  }
  
  function handleSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const percentage = parseInt(target.value);
    sliderPercentage.set(percentage);
    amount.set((maxAmount * percentage) / 100);
  }
  
  function createOrderObject(): Partial<Orderbook> {
    const currentPair = get(selectedPair);
    const now = new Date().toISOString();
    
    // Create an expiration date 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    return {
      userId: pb.authStore.model?.id || '',
      type: $type,
      pairId: currentPair?.id || '',
      price: $price || 0,
      amount: $amount,
      active_amount: $amount,
      status: 'pending',
      expires: expiryDate.toISOString(),
      created: now,
      updated: now
    };
  }
  
  async function handleSubmit() {
        const currentPair = get(selectedPair);
        
        if (!pb.authStore.isValid) {
            alert('You must be logged in to place orders');
            return;
        }
        
        if (!currentPair) {
            alert('Please select a trading pair first');
            return;
        }
        
        if ($amount <= 0) {
            alert('Please enter an amount greater than 0');
            return;
        }
        
        if ($orderType === 'limit' && !$price) {
            alert('Please enter a price for limit orders');
            return;
        }
        
        try {
            const orderData = {
                ...createOrderObject(),
                type: $type,
                user: pb.authStore.model?.id,
                symbol: symbol,
                total: orderValue
            };
            
            console.log('Submitting order:', orderData);
            
            // Create order in Pocketbase
            const createdOrder = await pb.collection('orders').create(orderData);
            console.log('Order created successfully:', createdOrder);
            
            // Reset form after submission
            amount.set(0);
            sliderPercentage.set(0);
            if ($orderType === 'limit') {
                price.set(null);
            }
            
            alert('Order placed successfully!');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to place order. Please try again.');
        }
    }

    function handleAmountChange() {
    // Ensure amount doesn't exceed maxAmount
    if ($amount > maxAmount) {
        amount.set(maxAmount);
    }
    
    // Calculate and update the slider percentage for display purposes
    const percentValue = (maxAmount > 0) ? ($amount / maxAmount) * 100 : 0;
    sliderPercentage.set(Math.round(percentValue));
}
function setAmount(value: number) {
    // Update the amount store
    amount.set(parseFloat(value.toFixed(4)));
    
    // Calculate and update the slider percentage for display purposes
    const percentValue = (maxAmount > 0) ? (value / maxAmount) * 100 : 0;
    sliderPercentage.set(Math.round(percentValue));
}

$: sliderStep = maxAmount > 0 ? maxAmount / 20 : 0.0001;

$: if (maxAmount !== undefined && maxAmount > 0) {
    if ($amount > maxAmount) {
        amount.set(maxAmount);
    }
    handleAmountChange();
}
  onMount(() => {
        return () => {
            unsubscribePair();
        };
    });
    
    $: availableBalance = $type === 'buy' 
        ? $availableBalances.buy 
        : $availableBalances.sell;
    
    $: maxAmount = $type === 'buy' 
        ? $price ? availableBalance / $price : 0 
        : availableBalance;
    
    $: orderValue = $price ? $amount * $price : 0;
    $: if (maxAmount !== undefined && $sliderPercentage > 0) {
      updateAmountFromSlider();
  }
</script>

<div class="order-form">
  <!-- Display debugging info for development -->
  <!-- {#if import.meta.env.DEV}
      <div class="debug-info">
          <small>Selected Pair: {$selectedPair ? `${$selectedPair.base_token}/${$selectedPair.quote_token}` : 'None'}</small>
      </div>
  {/if} -->

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
  
  <!-- Selected pair display -->

  <!-- Buy/Sell toggle -->
  <div class="type-toggle" class:active={isSelected} on:click={() => {
          isSelected = !isSelected;
      }}>
      <button 
          class="type-btn {$type === 'buy' ? 'active' : ''}" 
          on:click={() => handleTypeChange('buy')} 
      >
          <ArrowDownToLine/>
          Buy
      </button>
      <button 
          class="type-btn {$type === 'sell' ? 'active' : ''}" 
          on:click={() => handleTypeChange('sell')}
      >
          <ArrowUpFromLine/>
          Sell
      </button>
  </div>
  
  <div class="order-form-container">
      <!-- Left column -->
      <div class="form-column">
          <!-- Available balance -->
          <div class="balance-info">
              <span>Available Balance: </span>
              <div class="selected-pair">
                {#if $selectedPair}
                    <span class="available">
                      <div class='number'>
                        {availableBalance} {$type === 'buy' ? quoteCurrency : baseCurrency}                      
                      </div>
                        <!-- {$selectedPair.base_token}/{$selectedPair.quote_token} -->
                    </span>
                {:else}
                    <span class="warning">No pair selected! Select a pair from the pair selector.</span>
                {/if}
            </div>
            
              <!-- <span class="available">{availableBalance} {$type === 'buy' ? quoteCurrency : baseCurrency}</span> -->
          </div>
          
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
                  on:input={handleAmountChange}
                  placeholder="0.00"
              />
              <span class="currency">{baseCurrency}</span>
          </div>
      </div>
      
      <!-- Percentage slider with finer 5% steps -->
      <div class="slider-container">
          <input 
              type="range" 
              min="0" 
              max={maxAmount} 
              step={maxAmount / 20} 
              bind:value={$amount}
          />
          <div class="percentage-buttons">
              <button on:click={() => setAmount(0)}>0%</button>
              <button on:click={() => setAmount(maxAmount * 0.25)}>25%</button>
              <button on:click={() => setAmount(maxAmount * 0.5)}>50%</button>
              <button on:click={() => setAmount(maxAmount * 0.75)}>75%</button>
              <button on:click={() => setAmount(maxAmount)}>100%</button>
          </div>
      </div>
      </div>
      
      <!-- Right column -->
      <div class="form-column">
          <!-- Total order value -->
          <div class="total-value">
              <span>Total</span>
              <span class="price">                        
                {orderValue.toFixed(2)} {$type === 'buy' ? quoteCurrency : baseCurrency}                      
              </span>
          </div>
      </div>
      
      <!-- Submit button -->
      <button 
          class="submit-button {$type === 'buy' ? 'buy' : 'sell'}" 
          on:click={handleSubmit}
          disabled={!$selectedPair || $amount <= 0 || ($orderType === 'limit' && !$price)}
      >
          {$type === 'buy' ? 'Buy' : 'Sell'} {baseCurrency}
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
    
    .type-toggle {
      display: flex;
      padding: 10px;
      gap: 8px;
    }
    
    .type-btn {
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
    .type-btn.active {
        box-shadow: -100px -1px 100px 4px rgba(255, 255, 255, 0.2);
        background: var(--text-color);
        color: var(--primary-color);
        border: 1px solid var(--secondary-color);

    }
    .type-btn.active.buy {
      background: rgba(0, 180, 100, 0.1);
      border-color: #00b464;
      color: #00b464;
      font-weight: 700;
    }
    
    .type-btn.active.sell {
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
        gap: 2rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        & span.available {
          font-size: 1.25rem;
          font-weight: 500;
            gap: 0.5rem;
            display: flex;
            align-items: center;
            & .number {
              font-weight: 600;
              font-size: 1.25rem;
            }
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