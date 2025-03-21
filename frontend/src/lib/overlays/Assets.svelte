<script lang="ts">
    import { drag } from '$lib/actions/drag';
    import { gsap } from 'gsap';
    import { CustomEase } from 'gsap/CustomEase';
    import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase'; 
  import { get } from 'svelte/store';
  import { t } from 'stores/translation.store';
	import Box from "@tabler/icons-svelte/icons/box";
    import { fly, fade, slide, scale } from 'svelte/transition';
    import { cubicIn, cubicOut } from 'svelte/easing';
    import {
        toggleAll,
        allToggled,
        overlayStateAssets,
        toggleExpand,
        handleBackdropClick,
        handleMouseEnter,
        handleMouseLeave,
        handleDragEnd
    } from "$lib/actions/toggling";
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
    import Wallet from "$lib/containers/Wallets.svelte"
    import walletsForTokens from "$lib/containers/Wallets.svelte"
    import loadingTokens from "$lib/containers/Wallets.svelte"

    import Deposit from "$lib/containers/Deposit.svelte"
    import TradingPairs from "$lib/overlays/TradingPairs.svelte"
    import TradingHistory from "$lib/overlays/TradingHistory.svelte"
    import Withdraw from "$lib/containers/Withdraw.svelte"
    import Ramp from "$lib/containers/Ramp.svelte"
    import Transfer from "$lib/containers/Transfer.svelte"
    import TrendChart from "$lib/overlays/TrendChart.svelte"
    import PriceSticker from '$lib/containers/PriceSticker.svelte';
    import IcicleD3 from '$lib/containers/IcicleD3.svelte';
    import Agents from '$lib/overlays/Agents.svelte'
	import NewsFeed from '$lib/overlays/NewsFeed.svelte';
	import { BotIcon, NewspaperIcon, TrendingUpDown, Wallet2 } from 'lucide-svelte';

    CustomEase.create("customEase", "0.075, 0.82, 0.165, 1");

    $: currentOverlayStateAssets = $overlayStateAssets;

    function getCustomTransition(name: string) {
        switch (name) {
            case 'wallet':
                return { y: -250, duration: 400, easing: cubicOut };
            case 'deposit':
                return { y: -250, duration: 400, easing: cubicOut };
            case 'trends':
                return { x: 250, y: -250, duration: 400, easing: cubicOut };
            case 'chart2':
                return { x: -250, duration: 400, easing: cubicOut };
            case 'info':
                return { x: -250, duration: 400, easing: cubicOut };
            case 'feed':
                return { x: 250, y: 250, duration: 400, easing: cubicOut };
            default:
                return { y: 250, duration: 300 };
        }
    }
// onMount(async () => {
//     if (get(currentUser)) { 
//         try {
//             await fetchWallets();
//             await fetchTokens();
//             console.log('Wallets and tokens loaded:', get(wallets), get(tokens));
//         } catch (e) {
//             console.error('Error loading wallets or tokens:', e);
//         }
//     }
// });
</script>

{#each Object.entries(currentOverlayStateAssets) as [name, state]}
<!-- {#if state.active} -->
    {#if state.expanded}
        <div 
            class="backdrop"
            on:click={() => handleBackdropClick(overlayStateAssets, name)} 
            transition:fade={{ duration: 200 }}
        />
    {/if}

    {#if ['deposit', 'trends', 'chart2', 'info'].includes(name)}
        <!-- Container for deposit, withdraw, chart2, and info -->
        <div class="financial-overlays-container">
            <div 
                class="overlay {name}-overlay" 
                class:expanded={state.expanded}
                class:deposit-expanded={name === 'deposit' && state.expanded}
                class:trends-expanded={name === 'trends' && state.expanded}
                class:chart2-expanded={name === 'chart2' && state.expanded}
                class:info-expanded={name === 'info' && state.expanded}
                transition:fly={getCustomTransition(name)}
                on:click={() => !state.expanded && toggleExpand(overlayStateAssets, name)}
                use:drag={{
                    onDragEnd: () => handleDragEnd(overlayStateAssets, name)
                }}
            >
                {#if name === 'deposit'}
                    <div class="overlay-header">
                        <div class="overlay-title">
                            <!-- <TrendingUpDown size="2rem"/> -->
                            <h1 class="overlay-header">
                                {$t('nav.portfolio')}
                            </h1>
                        </div>
                    </div>
                    <Deposit />
                {:else if name === 'trends'}
                
                    <IcicleD3 />
                {:else if name === 'chart2'}
                    <div class="overlay-header">
                        <div class="overlay-title">
                            <!-- <NewspaperIcon size="2rem"/> -->
                            <h1 class="overlay-header">
                                {$t('nav.news')}
                            </h1>
                        </div>
                    </div>
                    <NewsFeed/>
                {:else if name === 'info'}
                    <div class="overlay-header">
                        <div class="overlay-title">
                            <!-- <TrendingUpDown size="2rem"/> -->
                            <h1 class="overlay-header">
                                {$t('nav.trend')}
                            </h1>
                        </div>
                    </div>
                    <PriceSticker />
                {/if}
            </div>
        </div>
    {:else}
        <!-- Render other overlays (wallet, feed) normally -->
        <div 
            class="overlay {name}-overlay" 
            class:expanded={state.expanded}
            class:wallet-expanded={name === 'wallet' && state.expanded}
            class:feed-expanded={name === 'feed' && state.expanded}
            transition:fly={getCustomTransition(name)}
            on:click={() => !state.expanded && toggleExpand(overlayStateAssets, name)}
            use:drag={{
                onDragEnd: () => handleDragEnd(overlayStateAssets, name)
            }}
        >
            {#if name === 'wallet'}
                <div class="overlay-header">
                    <div class="overlay-title">
                        <!-- <Wallet2 size="2rem"/> -->
                        <h1 class="overlay-header">{$t('nav.wallet')}</h1>
                    </div>
                </div>
                <Wallet/>
            {:else if name === 'feed'}
                <div class="overlay-header">
                    <div class="overlay-title">
                        <!-- <BotIcon size="2rem"/> -->
                        <h1 class="overlay-header">{$t('agent.agents')}</h1>

                    </div>
                </div>
                <Agents />
            {/if}
        </div>
    {/if}
<!-- {/if} -->
{/each}


<style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
    }   

    .overlay {
        backdrop-filter: blur(40px); 
        -webkit-backdrop-filter: blur(10px); 
        border-radius: 4rem;
        background: var(--secondary-color);
        box-shadow: -1px -1px 10px 1px var(--secondary-color);

    }

    .wallet-overlay {
        width: calc(50% - 4rem);
        height: 40rem;
        top: 4rem;
        left: 0;
        right: auto;
        bottom: auto;
        border-radius: 4rem;
        font-size: 2rem;
        overflow-y: auto;
        scrollbar-width: thin;
        scroll-behavior: smooth;
        scrollbar-color: var(--primary-color) transparent;

    }

    .feed-overlay {
        width: calc(35% - 4rem);
        height: auto;
        top: 48rem;
        left: 15%;
        right: auto;
        bottom: 4rem;
        font-size: 2rem;
        overflow: hidden;
        

    }



    .info-overlay {
        // width: calc(12.5% - 4rem);
        height: calc(25% - 2rem);
        width: calc(15% - 4rem);
        top: auto;
        bottom: 4rem;
        left: 0;
        right: auto;
        font-size: 1.5rem;
        overflow: hidden;
        flex: 1;
    }

    .deposit-overlay {
        top: 48rem;
        height: calc(25% - 2rem);
        width: calc(15% - 4rem);
        left: 0;
        display: flex;
        justify-content: center;
        right: auto;
        overflow: hidden;
    }

    .trends-overlay {
        left: auto;
        right: 0;
        top: 48rem;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        bottom: 4rem;
        width: calc(50% - 4rem);
        height: auto;
        overflow: hidden;


    }
    .chart2-overlay {
        right: 0;
        width: calc(50% - 4rem);
        height: 40rem;
        top: 4rem;        
        overflow: hidden;
    }

    .deposit-overlay.deposit-expanded {
        width: auto;
        height: auto;
        display: flex;
        justify-content: top;
        align-items: center;
        top: 4rem;
        left: 4rem;
        right: 4rem;
        bottom: 8rem;
        overflow-x: hidden;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: var(--secondary-color) transparent;
        scroll-behavior: smooth; 
        font-size: 1rem;
    }
    
.wallet-overlay.wallet-expanded,
.trends-overlay.trends-expanded,
.chart2-overlay.chart2-expanded,
.feed-overlay.feed-expanded,
.info-overlay.info-expanded {
    width: auto;
    height: auto;
    justify-content: center;
    align-items: center;
    top: 4rem;
    left: 4rem;
    right: 4rem;
    bottom: 8rem;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width:2px;
    scrollbar-color: var(--secondary-color) transparent;
    scroll-behavior: smooth; 
    font-size: 1rem;
}

    .balance-head {
        display: flex;
        gap: 2rem;
        margin-bottom: 1.5rem;
    }


    .recent-activity {
        margin-top: 1.5rem;
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
        .wallet-overlay {
            width: auto;
            height: calc(50% - 4rem);
            top: 4rem;
            left: 0;
            right: 50%;
            bottom: auto;
            font-size: 2rem;
            overflow: none;
            &.wallet-expanded {
                height: auto;
                top: 4rem;
                left:0;
                right: 0;
                width: auto;
                bottom: 8rem;
                font-size: 1rem;
            }
        }
        .feed-overlay {
            top: calc(25% + 4rem);
        bottom: auto;
        right: 0;
            left: auto;
        width: calc(50% - 4rem);
        height: calc(25% - 4rem);
        
        &.feed-expanded {
            height: auto;
            width: auto;
            top: calc(25% - 1rem);
            left: 0;
            right: 0;
            bottom: 4rem;
            font-size: 1rem;
        }
    }



    .deposit-overlay, .info-overlay {
        width: calc(50% - 4rem);
        height: 16rem;
        top: auto;
        bottom: auto;
        left: 0;
        right: auto;
        font-size: 1.5rem;
        overflow: none;
        flex: 1;
    }

    .deposit-overlay {
        top: calc(50% + 4rem);
        height: calc(25% - 8rem);
    }

    .trends-overlay {
        top: calc(50% + 4rem);
        right: 0;
        left: 50%;
        bottom: 4rem;
        margin: 0;
        padding: 0;
        justify-content: flex-end;
        align-items: flex-start;

    }
    .chart2-overlay {
        top: 4rem;
        bottom: auto;
        width: calc(50% - 4rem);
        height: calc(25% - 4rem);
        right: 0;

    }
    .info-overlay {
        top: auto;
        bottom: 4rem;
        height: calc(25% - 8rem);

    }

    .deposit-overlay.deposit-expanded,
    .trends-overlay.trends-expanded,
    .chart2-overlay.chart2-expanded,
    .info-overlay.info-expanded {
        height: auto;
        width: auto;
        justify-content: flex-start;
        margin-top: 0;
        margin-right: 0;
        display: flex;
        top: 28rem;
        left: 0;
        right: 0;
        bottom: 4rem;
        font-size: 1rem;
    }

    }

    @media (max-width: 768px) {
        .wallet-overlay {
            width: auto;
            height: calc(25% - 8rem);
            justify-content: flex-start;
            align-items: top;
            top: 4rem;
            left: 0;
            right: 0;
            bottom: auto;
            font-size: 2rem;
            overflow: none;
            &.wallet-expanded {
                height: auto;
                top: 4rem;
                left:0;
                right: 0;
                width: auto;
                bottom: 10rem;
                font-size: 1rem;
            }
        }
        .feed-overlay,  .trends-overlay {
            width: calc(50% - 4rem);        
            height: calc(30%);
            left: auto;
        right: auto;
        top: auto;
        bottom: 4rem;
        font-size: 1rem;
        overflow: none;
        &.feed-expanded, .trends-expanded {
            height: auto;
            width: auto;
            top: 12rem;
            left: 0;
            right: 0;
            bottom: 12rem;
            font-size: 1rem;
        }
    }
    .feed-overlay {
        left: 0;

    }

    .trends-overlay {
        right: 0;

    }

    .deposit-overlay, .info-overlay {
        width: calc(50% - 4rem);        
        height: calc(12% - 2rem);
        top: calc(25%);
        bottom: auto;
        left: auto;
        right: auto;
        font-size: 1.5rem;
        overflow: none;
        flex: 1;
        
    }

    .deposit-overlay {
        font-size: 1.5rem;
        overflow: none;
        flex: 1;
    }


    .chart2-overlay {
        left: 0;
        right: 0;
        top: auto;
        bottom: calc(40% - 3rem);
        height: 20%;
        width: auto;


    }
    .info-overlay {
       bottom: auto;
       right: 0;
    }

    .deposit-overlay.deposit-expanded,
    .trends-overlay.trends-expanded,
    .chart2-overlay.chart2-expanded,
    .info-overlay.info-expanded {
        height: auto;
        width: auto;
        top: 27rem;
        left: 0;
        right: 0;
        bottom: 4rem;
        font-size: 1rem;
    }

    }
    @media (max-width: 450px) {
        .wallet-overlay {
            width: auto;
            height: calc(25% - 8rem);
            top: 4rem;
            left: 0;
            right: 0;
            bottom: auto;
            font-size: 2rem;
            border-radius: 2rem;
            overflow: none;

        }
        .feed-overlay,  .trends-overlay {
            width: calc(50% - 4rem);        
            height: calc(12% - 2rem);
            border-radius: 2rem;
            left: auto;
        right: auto;
        top: auto;
        bottom: 2.5rem;
        font-size: 1rem;
        overflow: none;
    }
    .feed-overlay {
        left: 0;

    }

    .trends-overlay {
        right: 0;

    }

    .deposit-overlay, .info-overlay {
        width: calc(50% - 4rem);        
        height: calc(12% - 2rem);
        top: calc(25% - 1rem);
        border-radius: 2rem;
        bottom: auto;
        left: auto;
        right: auto;
        font-size: 1rem;
        overflow: none;
        flex: 1;
        
    }


    .chart2-overlay {
        left: 0;
        right: 0;
        top: calc(40% - 2rem);
        bottom: calc(22% - 2rem);
        border-radius: 2rem;
        height: auto;
        width: auto;


    }
    .info-overlay {
       bottom: auto;
       right: 0;
    }

    .deposit-overlay.deposit-expanded,
    .trends-overlay.trends-expanded,
    .chart2-overlay.chart2-expanded,
    .wallet-overlay.wallet-expanded,

    .info-overlay.info-expanded {
        height: auto;
        top: 4rem;
        left:0;
        right: 0;
        width: auto;
        bottom: 4rem;
        font-size: 1rem;
    }

    }
</style>

