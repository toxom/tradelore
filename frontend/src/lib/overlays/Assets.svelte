<script lang="ts">
    import { drag } from '$lib/actions/drag';
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
    import Wallet from "$lib/containers/Wallets.svelte"
    import Deposit from "$lib/containers/Deposit.svelte"
    import TradingPairs from "$lib/overlays/TradingPairs.svelte"
    import TradingHistory from "$lib/overlays/TradingHistory.svelte"
    import Withdraw from "$lib/containers/Withdraw.svelte"
    import Ramp from "$lib/containers/Ramp.svelte"
    import Transfer from "$lib/containers/Transfer.svelte"
    import TrendChart from "$lib/overlays/TrendChart.svelte"
    import PriceSticker from '$lib/containers/PriceSticker.svelte';


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
                    <Deposit />
                {:else if name === 'trends'}
                    <Withdraw />
                {:else if name === 'chart2'}
                    <TrendChart />
                {:else if name === 'info'}
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
                <Wallet/>
            {:else if name === 'feed'}
                <TradingPairs />
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
        overflow: hidden;

    }

    .feed-overlay {
        width: calc(35% - 4rem);
        height: auto;
        top: 48rem;
        left: 15%;
        right: auto;
        bottom: 4rem;
        font-size: 2rem;
        overflow: none;

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
        right: auto;
    }

    .trends-overlay {
        left: auto;
        right: 0;
        top: 48rem;
        bottom: 4rem;
        width: calc(50% - 4rem);
        height: auto;


    }
    .chart2-overlay {
        right: 0;
        width: calc(50% - 4rem);
        height: 40rem;
        top: 4rem;        
        overflow: hidden;
    }


    .deposit-overlay.deposit-expanded,
    .wallet-overlay.wallet-expanded,

.trends-overlay.trends-expanded,
.chart2-overlay.chart2-expanded,
.feed-overlay.feed-expanded,

.info-overlay.info-expanded {
    width: auto;
    height: auto;
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

    .metric {
        text-align: center;
    }

    .metric .value {
        font-size: 1.75rem;
        font-weight: 600;
    }

    .metric .label {
        font-size: 0.875rem;
        color: #666;
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
                right: 25%;
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

