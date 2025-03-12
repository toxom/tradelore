<script lang="ts">
  import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase'; 
  import { get } from 'svelte/store';
  import { t } from 'stores/translation.store';
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
  import { ArrowBigDown, ArrowUpWideNarrow, BadgePlus, WalletMinimal, WalletMinimalIcon } from 'lucide-svelte';

  let percent = 0;
  let expandedTokenIds: Record<string, boolean> = {};
  let selectedCurrency: string = '';
  let selectedNetwork: string = '';
  let selectedTokenId: string = '';
  let addressInput: string = '';
export let loadingTokens = true;
  let loading = true;
  let error = '';
  const store = tweened(0, { duration: 1000 });
  $: store.set(percent);

  export let walletsForTokens = new Set<string>();

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
    await fetchWallets();
    get(wallets).forEach((wallet) => {
      walletsForTokens.add(wallet.tokenId); 
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
  <div class=sticker-header>
  </div>


  {#if loadingTokens}
    <div class="loading-container">
      <div class="spinner"></div>
    </div> 
  <!-- {:else if tokens.length === 0} -->
    <!-- <p>No tokens found. Check your API connection.</p> -->
  {:else}
    <div class="container">
      <h1> {$t('nav.wallet')}</h1>

      {#each getUniqueTokenIds(tokens) as tokenId (tokenId)}
        <div
          class="card {walletsForTokens.has(tokenId) ? 'has-wallet' : ''}"
        >

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
            <p> {$t('wallet.network')}</p>
  
            {:else}
            {/if}
          </div>
          

          

        </div>
        <div class="btn-row">
        <button class="toggle-button" on:click={() => toggleTokenExpansion(tokenId)}
          >
          <BadgePlus/>
          <p>
            {$t('wallet.deposit')}

          </p>
        </button>
        </div>
          {#if expandedTokenIds[tokenId]}
          <div class="token-option-container">

            {#each getTokensByTokenId(tokenId) as token (token.id)}
              <div
                class="token-options {walletsForTokens.has(tokenId) ? 'has-wallet' : ''}"
                on:click|stopPropagation={() => handleAddWallet(token)}
              >
                <div class="network-name">{token.network}</div>
                
                {#if walletsForTokens.has(tokenId)}
                  {#each get(wallets).filter(wallet => 
                    wallet.userId === get(currentUser).id && 
                    wallet.tokenId === tokenId && 
                    wallet.network === token.network
                  ) as wallet (wallet.id)}
                    <div class="wallet-balance">
                      Balance: {wallet.balance || '0'}
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
      justify-content: flex-start;
      align-items: flex-end;
    }
    .toggle-button {
      transition: all 0.2s ease;
      width: auto;
      position: relative;
      width: auto;
      height: auto;
      padding: 1rem;
      &:hover {
        transition: all 0.2s ease;
        width: auto;
        background: var(--text-color);
        color: var(--tertiary-color);
        padding: 1rem;

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
    align-items:center;
    justify-content: flex-start;
    width: calc(100% - 6rem);
    font-size: 1rem;
    cursor: pointer;
    background: transparent;
    // box-shadow: -50px -1px 50px 4px rgba(255, 255, 255, 0.2);
    padding: 2rem;
    gap: 2rem;
    z-index: 1;
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
  flex-direction: row;
	align-items: flex-start;
  gap: 1rem;
  justify-content: flex-start;
	// margin-bottom: 0.5rem;
  }

  .token-option-container {
    // display: flex;
    // flex-direction: column;
    // gap: 1rem;
    // justify-content: flex-start;
    // margin: 0;
    display: grid;
      gap: 1rem;
      grid-template-columns: repeat(2, 1fr);

  }
  .token-options {
    background: var(--primary-color);
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem !important;
    width: auto;
    border-radius: 2rem;
    padding: 2rem;
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
