<script lang="ts">
  import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase'; 
  import { get } from 'svelte/store';
  import {
    fetchTokens,
    populateOrUpdateTokens,
    handleAddToken,
    handleEditToken,
    handleUpdateToken,
    errorMessage,
    isEditing,
    newToken,
    editingToken,
    tokens,
  } from 'clients/tokenClient';
  import {
    getAvailableTokens,
    getWalletForTokenAndNetwork,
    addNewWallet,
    wallets,
    selectedWallet,
    fetchWallets,
  } from 'clients/balanceClient';
  import type { Token, Wallet } from 'types/walletTypes';
  import { spring, tweened } from 'svelte/motion';
  import { ArrowBigDown, ArrowUpWideNarrow, WalletMinimal } from 'lucide-svelte';

  let percent = 0;
  let expandedTokenIds: Record<string, boolean> = {};
  let selectedCurrency: string = '';
  let selectedNetwork: string = '';
  let selectedTokenId: string = '';
  let addressInput: string = '';
  let loadingTokens = true;
  let loading = true;
  let error = '';
  const store = tweened(0, { duration: 1000 });
  $: store.set(percent);

  let walletsForTokens = new Set<string>();

  function toggleTokenExpansion(tokenId: string) {
    expandedTokenIds = {
      ...expandedTokenIds,
      [tokenId]: !expandedTokenIds[tokenId],
    };
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

  onMount(async () => {
  try {
    loadingTokens = true;
    await fetchWallets(); // Fetch wallets for the current user
    get(wallets).forEach((wallet) => {
      walletsForTokens.add(wallet.tokenId); // Add tokenId to the Set
    });
    console.log('Wallets loaded:', get(wallets));
    console.log('walletsForTokens:', walletsForTokens);
  } catch (e) {
    error = e;
    console.error('Error loading tokens or wallets:', e);
  } finally {
    loadingTokens = false;
  }
});
</script>
<div class="sticker-container">
  {#if loadingTokens}
    <div class="loading-container">
      <div class="spinner"></div>
    </div> 
  {:else if tokens.length === 0}
    <p>No tokens found. Check your API connection.</p>
  {:else}
    <div class="container">
      {#each getUniqueTokenIds(tokens) as tokenId (tokenId)}
        <div
          class="card {walletsForTokens.has(tokenId) ? 'has-wallet' : ''}"
          on:click={() => toggleTokenExpansion(tokenId)}
        >
          <div class="token-header">
            <img 
              src={getTokenIcon(tokenId)} 
              class="token-icon"
              on:error={handleImageError}
            />
            <div class="token-info">
              <h3 class="token-ticker">
                {getTokensByTokenId(tokenId)[0]?.ticker || 'N/A'}
              </h3>
              <p class="token-name">
                {getTokensByTokenId(tokenId)[0]?.name || 'Unknown'}
              </p>
            </div>
            {#if expandedTokenIds[tokenId]}
            {:else}
              ...
            {/if}
          </div>
          {#if expandedTokenIds[tokenId]}
            <div class="token-option-container">
              {#each getTokensByTokenId(tokenId) as token (token.id)}
                <div
                  class="token-options {walletsForTokens.has(tokenId) ? 'has-wallet' : ''}"
                  on:click={() => handleAddWallet(token)}
                >
                  {token.network}
                  {#if wallets.length > 0}
                    {#each wallets.filter(wallet => wallet.userId === currentUser.id && wallet.tokenId === tokenId) as wallet (wallet.id)}
                      <div class="wallet-balance">
                        Balance: {wallet.balance}
                      </div>
                    {/each}
                  {/if}
                </div>
              {/each}
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
    }
    .sticker-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: left;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }
    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-left: 0;
      margin: 0;
      padding: 0;
      left: 0;
      right: 0;
      gap: 0.5rem;
      width: auto;
      transition: all 0.2s ease;

      padding: 2rem;

    }
    .card {
      background: var(--bg-gradient-fade);
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: flex-start;
      width: 100%;
      gap: 1rem;
      height: 100%;
      border-radius: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      transition: all 0.2s ease;
      color: var(--text-color);
    }
    
  .card:hover {
	  transform: translateX(1rem);
    align-items: center;
    justify-content: flex-start;

    font-size: 1rem;
    cursor: pointer;
    box-shadow: -50px -1px 50px 4px rgba(255, 255, 255, 0.9);
    padding: 2rem;
    gap: 2rem;
    img {
      transform: scale(1.5);
      margin-right: 1rem;
    }
    p.token-name {
      font-size: 2rem;
    }
    &.token-info {
      gap: 2rem;
    }

  }

  .token-header {
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;
  }

  .token-option-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: flex-start;
    margin: 0;
  }
  .token-options {
    background: var(--secondary-color);
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem !important;
    width: 22rem;
    border-radius: 2rem;
    padding: 1rem;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-gradient-left);
      transform: translateX(1rem);
    }


  }

  .overlay-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    font-size: 1.5rem;
    margin: 0 auto;
    line-height: 0.5;

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


  

    table {
      margin-left: 0;
      background-color: red;
      width: auto;
      color: var(--text-color);
      border-collapse: collapse;

    }
  tbody tr {
        transition: 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
        &:hover {
        background:var(--bg-gradient-right);
        color: var(--text-color);
        font-size: 1rem;
        cursor: pointer;

      }
    }
  tr td {
    justify-content: center;
    align-items: center;
    text-align: left;
    
  }
  th, td {
    padding: 10px;
    text-align: left;
    // border-bottom: 1px solid var(--secondary-color);


  }

</style>
