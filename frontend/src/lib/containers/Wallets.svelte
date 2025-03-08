<script lang="ts">
    import { onMount } from 'svelte';
    import {
        getAvailableTokens,
        getWalletForTokenAndNetwork,
        addNewWallet,
        wallets,
        selectedWallet,
    } from 'clients/balanceClient';
    import type { Token } from 'types/walletTypes';
    import TokenPanel from '../admin/TokenPanel.svelte'
    import PieChart from '$lib/containers/PieChart.svelte'
    import {spring, tweened} from 'svelte/motion';
    let percent = 0;

    let totalBalance = 12500.75; 
    let portfolioGrowth = 8.5;
    let recentActivity = [
        { type: 'Buy', coin: 'BTC', amount: 0.25, date: '2023-10-01' },
        { type: 'Sell', coin: 'ETH', amount: 1.5, date: '2023-10-02' },
        { type: 'Buy', coin: 'LTC', amount: 10, date: '2023-10-03' },
    ];

    let tokens: Token[] = [];
    let expandedTokenIds: Record<string, boolean> = {};
    let selectedCurrency: string = '';
    let selectedNetwork: string = '';
    let addressInput: string = '';

    const store = tweened(0, {duration: 1000});
	//const store = spring(0, {stiffness: 0.3, damping: 0.3});
    $: store.set(percent);

  function toggleTokenExpansion(tokenId: string) {
    expandedTokenIds = {
      ...expandedTokenIds,
      [tokenId]: !expandedTokenIds[tokenId],
    };
  }

  function getUniqueTokenIds(tokens: Token[]): string[] {
    return Array.from(new Set(tokens.map((token) => token.tokenId)));
  }

  function getTokensByTokenId(tokenId: string): Token[] {
    return tokens.filter((token) => token.tokenId === tokenId);
  }

  async function handleCurrencySelect(currency: string) {
    selectedCurrency = currency;
    // Potentially load available networks based on the token here
  }

  async function handleNetworkSelect(network: string) {
    selectedNetwork = network;
  }

  async function handleCreateWallet() {
    if (selectedCurrency && addressInput) {
      const wallet = await addNewWallet(selectedCurrency, addressInput);
      if (wallet) {
        console.log('Wallet created or loaded:', wallet);
      }
    }
  }
  onMount(async () => {
    tokens = await getAvailableTokens();
  });

</script>


<div class="basic-container">
    <div class="metric">
        <div class="label">Total Balance</div>
        <div class="value">${totalBalance.toFixed(2)}</div>
        <div class="conversion">≈${totalBalance.toFixed(2)}</div>
    </div>
    <div class="metric">
        <div class="label">Portfolio Growth</div>
        <div class="value">{portfolioGrowth.toFixed(1)}%</div>
        <div class="conversion">≈${portfolioGrowth.toFixed(2)}</div>
    </div>

</div>
<button class="basic-button">
    Add Funds
</button>

  <PieChart     
    size={700} 
    percent={75} 
    bgColor="white" 
    fgColor="green" 
/>
<div class="recent-activity">
    <h3>Recent Activity</h3>
    <ul class="activity-list">
        {#each recentActivity as activity}
            <li class="activity-item">
                <span class="type">{activity.type} {activity.coin}</span>
                <span class="details">{activity.amount} {activity.coin} on {activity.date}</span>
            </li>
        {/each}
    </ul>
</div>
<div>
    <h2>Wallets</h2>
    <ul>
      {#each getUniqueTokenIds(tokens) as tokenId (tokenId)}
        <li>
          <button on:click={() => toggleTokenExpansion(tokenId)}>
            {getTokensByTokenId(tokenId)[0].name} ({getTokensByTokenId(tokenId)[0].ticker})
            {#if expandedTokenIds[tokenId]}
              (Collapse)
            {:else}
              (Expand)
            {/if}
          </button>
          {#if expandedTokenIds[tokenId]}
            <ul>
              {#each getTokensByTokenId(tokenId) as token (token.id)}
                <li>
                  {token.name} - {token.network} - {token.contract_address}
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  
<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
    .basic-container {
        display: flex;
        align-items: top;
        justify-content: left;
        gap: 4rem;
        width: auto;
        height: auto;
        margin-bottom: 1rem;
        padding: 2rem;

    }

    .metric {
        display: flex;
        flex-direction: column;
        width: 50%;
        height: 100%;
        gap: 1rem;
        margin-bottom: 2rem;
        text-align: left;
        & .value {
            font-size: 4rem;
        font-weight: 600;
        color: var(--text-color);
        }
        & .label {
            font-size: 2rem;
            color: var(--text-color);
          }
        & .conversion {
            font-size: 2rem;
            color: var(--text-color);
            font-style: italic;
        }
    }



    .recent-activity {
        margin-top: 5rem;
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

    @media (max-width: 1600px) {
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
    @media (max-width: 1000px) {
        .basic-container {
            display: flex;
            flex-direction: column;
            align-items: top;
            gap: 1rem;
            width: 100%;
            height: auto;
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
    }
</style>
