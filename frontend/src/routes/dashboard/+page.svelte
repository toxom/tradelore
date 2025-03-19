<script lang="ts">
    import { drag } from '$lib/actions/drag';
    import { gsap } from 'gsap';
    import { CustomEase } from 'gsap/CustomEase';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

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
            // case 'trends':
            //     return { x: 250, y: -250, duration: 400, easing: cubicOut };
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

    $: if ($currentUser === null || $currentUser === false) {
        // User has logged out, redirect to root page
        goto('/');
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
{#if $currentUser}
    {#each Object.entries(currentOverlayStateAssets) as [name, state]}
    <!-- {#if state.active} -->
        {#if state.expanded}
            <div 
                class="backdrop"
                on:click={() => handleBackdropClick(overlayStateAssets, name)} 
                transition:fade={{ duration: 200 }}
            />
        {/if}

        {#if ['deposit', 'chart2', 'info'].includes(name)}
            <!-- Container for deposit, withdraw, chart2, and info -->
            <div class="financial-overlays-container">
                <div 
                    class="overlay {name}-overlay" 
                    class:expanded={state.expanded}
                    class:deposit-expanded={name === 'deposit' && state.expanded}
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
                    <!-- {:else if name === 'trends'} -->
                    
                        <!-- <IcicleD3 /> -->
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
                {/if}
            </div>
        {/if}
    <!-- {/if} -->
    {/each}
{:else}
            
{/if}


<style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
    }   

    
</style>

