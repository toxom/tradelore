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


    $: currentOverlayStateAssets = $overlayStateAssets;

    function getCustomTransition(name: string) {
        switch (name) {
            case 'wallet':
                return { x:-200, y: 250, duration: 400, easing: cubicOut };
            case 'deposit':
                return { y: -250, duration: 400, easing: cubicOut };
            case 'withdraw':
                return { x: 250, y: -250, duration: 400, easing: cubicOut };
            case 'earn':
                return { x: -250, duration: 400, easing: cubicOut };
            case 'referral':
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

    {#if ['deposit', 'withdraw', 'earn', 'referral'].includes(name)}
        <!-- Container for deposit, withdraw, earn, and referral -->
        <div class="financial-overlays-container">
            <div 
                class="overlay {name}-overlay" 
                class:expanded={state.expanded}
                class:deposit-expanded={name === 'deposit' && state.expanded}
                class:withdraw-expanded={name === 'withdraw' && state.expanded}
                class:earn-expanded={name === 'earn' && state.expanded}
                class:referral-expanded={name === 'referral' && state.expanded}
                transition:fly={getCustomTransition(name)}
                on:click={() => !state.expanded && toggleExpand(overlayStateAssets, name)}
                use:drag={{
                    onDragEnd: () => handleDragEnd(overlayStateAssets, name)
                }}
            >
                {#if name === 'deposit'}
                    <Deposit />
                {:else if name === 'withdraw'}
                    <Withdraw />
                {:else if name === 'earn'}
                    <Ramp />
                {:else if name === 'referral'}
                    <Transfer />
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
        background-color: var(--primary-color);
    }

    .wallet-overlay {
        width: auto;
        height: 20rem;
        top: 4rem;
        left: 25%;
        right: 25%;
        bottom: auto;
        border-radius: 2rem;
        font-size: 2rem;
        overflow: hidden;
        &.wallet-expanded {
            width: auto;
            height: auto;
            top: 4rem;
            left: 25%;
            right: 25%;
            bottom: 4rem;
            overflow-x: hidden;
            overflow-y: scroll;
            scrollbar-width:2px;
            scrollbar-color: var(--secondary-color) transparent;
            scroll-behavior: smooth; 
            font-size: 1rem;
        }
    }

    .feed-overlay {
        width: auto;
        height: auto;
        top: 42rem;
        left: 25%;
        right: 25%;
        bottom: 4rem;
        border-radius: 2rem;
        font-size: 2rem;
        overflow: none;
        &.feed-expanded {
            height: auto;
            width: auto;
            top: 4rem;
            left: 25%;
            right: 25%;
            bottom: 4rem;
            overflow-x: hidden;
            overflow-y: scroll;
            scrollbar-width:2px;
            scrollbar-color: var(--secondary-color) transparent;
            scroll-behavior: smooth; 
            font-size: 1rem;
        }
    }



    .deposit-overlay, .withdraw-overlay, .earn-overlay, .referral-overlay {
        width: calc(12.5% - 4rem);
        height: 10rem;
        top: 28rem;
        bottom: auto;
        left: auto;
        right: auto;
        font-size: 1.5rem;
        overflow: hidden;
        border-radius: 2rem;
        flex: 1;
    }

    .deposit-overlay {
        left: 25%;
        right: auto;
    }

    .withdraw-overlay {
        left: 37.5%;


    }
    .earn-overlay {
        left: 50%;
    }
    .referral-overlay {
        top: 28rem;
        right: 0;
        left: 62.5%;
        bottom: 50%;
    }

    .deposit-overlay.deposit-expanded,
.withdraw-overlay.withdraw-expanded,
.earn-overlay.earn-expanded,
.referral-overlay.referral-expanded {
    height: auto;
    width: auto;
    top: 28rem;
    left: 25%;
    right: 25%;
    bottom: 4rem;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width: 2px;
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
        color: #28a745; /* Green for positive values */
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

    @media (max-width: 2400px) {
        .wallet-overlay {
            width: auto;
            height: auto;
            top: 4rem;
            left: 0;
            right: 25%;
            bottom: calc(75% + 1rem);
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
        width: auto;
        height: auto;
        top: calc(25% - 1rem);
        left: 0;
        right: 25%;
        bottom: 4rem;
        border-radius: 2rem;
        font-size: 2rem;
        overflow: none;
        &.feed-expanded {
            height: auto;
            width: auto;
            top: 4rem;
            left: 0;
            right: 25%;
            bottom: 8rem;
            font-size: 1rem;
        }
    }



    .deposit-overlay, .withdraw-overlay, .earn-overlay, .referral-overlay {
        width: calc(25% - 4rem);
        height: auto;
        top: auto;
        bottom: auto;
        left: auto;
        right: 0;
        font-size: 1.5rem;
        overflow: none;
        border-radius: 2rem;
        flex: 1;
    }

    .deposit-overlay {
        top: 4rem;
        height: 30rem;
    }

    .withdraw-overlay {
        top: 38rem;
        height: 30rem;

    }
    .earn-overlay {
        top: 72rem;
        bottom: auto;
        height: 14rem;

    }
    .referral-overlay {
        top: auto;
        bottom: 4rem;
        height: 14rem;
    }

    .deposit-overlay.deposit-expanded,
    .withdraw-overlay.withdraw-expanded,
    .earn-overlay.earn-expanded,
    .referral-overlay.referral-expanded {
        height: auto;
        width: auto;
        top: 4rem;
        left: 50%;
        right: 0;
        bottom: 4rem;
        font-size: 1rem;
    }

    }
    @media (max-width: 1000px) {
        .wallet-overlay {
            width: auto;
            height: 20rem;
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
                right: 25%;
                width: auto;
                bottom: 8rem;
                font-size: 1rem;
            }
        }
        .feed-overlay {
        width: auto;
        height: auto;
        top: 28rem;
        left: 0;
        right: 25%;
        bottom: 4rem;
        border-radius: 2rem;
        font-size: 2rem;
        overflow: none;
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



    .deposit-overlay, .withdraw-overlay, .earn-overlay, .referral-overlay {
        width: calc(25% - 3rem);
        height: 16rem;
        top: auto;
        bottom: auto;
        left: auto;
        right: 0;
        font-size: 1.5rem;
        overflow: none;
        border-radius: 2rem;
        flex: 1;
    }

    .deposit-overlay {
        top: 28rem;
    }

    .withdraw-overlay {
        top: 48rem;

    }
    .earn-overlay {
        top: 68rem;
        bottom: auto;

    }
    .referral-overlay {
        top: auto;
        bottom: 4rem;
    }

    .deposit-overlay.deposit-expanded,
    .withdraw-overlay.withdraw-expanded,
    .earn-overlay.earn-expanded,
    .referral-overlay.referral-expanded {
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
            height: 19rem;
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
        .feed-overlay {
        width: auto;
        height: auto;
        top: 27rem;
        left: 0;
        right: 0;
        bottom: 10rem;
        border-radius: 2rem;
        font-size: 2rem;
        overflow: none;
        &.feed-expanded {
            height: auto;
            width: auto;
            top: 12rem;
            left: 0;
            right: 0;
            bottom: 12rem;
            font-size: 1rem;
        }
    }



    .deposit-overlay, .withdraw-overlay, .earn-overlay, .referral-overlay {
        width: calc(25% - 4rem);
        height: 2rem;
        top: auto;
        bottom: 4rem;
        left: auto;
        right: 0;
        font-size: 1.5rem;
        overflow: none;
        border-radius: 2rem;
        flex: 1;
    }

    .deposit-overlay {
        left: 0;
    }

    .withdraw-overlay {
        left: 25%;

    }
    .earn-overlay {
        left: 50%;

    }
    .referral-overlay {
        right: 0;
    }

    .deposit-overlay.deposit-expanded,
    .withdraw-overlay.withdraw-expanded,
    .earn-overlay.earn-expanded,
    .referral-overlay.referral-expanded {
        height: auto;
        width: auto;
        top: 27rem;
        left: 0;
        right: 0;
        bottom: 4rem;
        font-size: 1rem;
    }

    }

</style>

