<script lang="ts">
    import { pb, currentUser } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import Landing from '$lib/overlays/Landing.svelte'
    import { fly, fade, slide, scale } from 'svelte/transition';
    import { cubicIn, cubicOut } from 'svelte/easing';
	import { AlignHorizontalDistributeCenter, ArrowUpDown, BarChart, ChartArea, ChartLine, ChartPie, Circle, CircleX, Crosshair, EyeOff, Filter, FilterX, History, Info, LayoutList, Maximize2, Minimize2, Settings2, ToggleLeft, ToggleRight, Tornado } from 'lucide-svelte';
	import Settings from '../components/dashboard/Settings.svelte';
    import Progress from '$lib/overlays/Progress.svelte';
    import Information from '$lib/overlays/TradingHistory.svelte';
    import { drag } from '$lib/actions/drag';
	import OrderForm from '$lib/overlays/OrderForm.svelte';
	import OrderBook from '$lib/overlays/OrderBook.svelte';
	import TradingPairs from '$lib/overlays/TradingPairs.svelte';
	import TradingHistory from '$lib/overlays/TradingHistory.svelte';
	import PriceChart from '$lib/overlays/PriceChart.svelte';
    import Assets from '$lib/overlays/Assets.svelte';
    import {
        toggleAll,
        allToggled,
        overlayStateTrade,
        toggleExpand,
        handleBackdropClick,
        handleMouseEnter,
        handleMouseLeave,
        handleDragEnd
    } from "$lib/actions/toggling";

    $: currentOverlayStateTrade = $overlayStateTrade;

    function getCustomTransition(name: string) {
        switch (name) {
            case 'pairs':
                return { x:-200, y: 250, duration: 400, easing: cubicOut };
            case 'book':
                return { y: -250, duration: 400, easing: cubicOut };
            case 'history':
                return { x: -250, duration: 400, easing: cubicOut };
            case 'order':
                return { x: 250, y: 250, duration: 400, easing: cubicOut };
            case 'chart':
                return { x: 250, y: 250, duration: 400, easing: cubicOut };
                
            default:
                return { y: 250, duration: 300 };
        }
    }


</script>


{#if $currentUser}

<div class="dashboard">
    <Assets/>
</div>


<div class="backdrop-container">

{#each Object.entries(currentOverlayStateTrade) as [name, state]}
    {#if state.active}
        {#if state.expanded}
            <div 
                class="backdrop"
                on:click={() => handleBackdropClick(overlayStateTrade, name)}
                transition:fade={{ duration: 200 }}
            />
        {/if}
        <div 
            class="overlay {name}-overlay" 
            class:expanded={state.expanded}
            class:pairs-expanded={name === 'pairs' && state.expanded}
            class:book-expanded={name === 'book' && state.expanded}
            class:history-expanded={name === 'history' && state.expanded}
            class:order-expanded={name === 'order' && state.expanded}
            class:chart-expanded={name === 'chart' && state.expanded}
            transition:fly={getCustomTransition(name)}
            on:click={() => !state.expanded && toggleExpand(overlayStateTrade, name)}
            use:drag={{
                onDragEnd: () => handleDragEnd(overlayStateTrade, name)
            }}
        >
            {#if name === 'pairs'}
                <TradingPairs/>
            {:else if name === 'book'}
                <OrderBook />
            {:else if name === 'history'}
                <TradingHistory />
            {:else if name === 'order'}
                <OrderForm />
            {:else if name === 'chart'}
                <PriceChart />
            {/if}
            <!-- <button class="close-button" on:click={(e) => { e.stopPropagation(); toggleOverlay(name); }}>
                <CircleX size={20} />
            </button> -->
            <button class="expand-button" on:click={(e) => { e.stopPropagation(); toggleExpand(overlayStateTrade, name); }}>
                {#if state.expanded}
                    <Minimize2 size={20} />
                {:else}
                    <Maximize2 size={20} />
                {/if}
            </button>
        </div>
    {/if}
{/each}
</div>
{:else}

<Landing/>
{/if}

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
        background-color: var(--secondary-color);
    }  



.overlay {

    background-color: var(--bg-color);

}


    .dashboard {
        display: flex;
        flex-direction: column;
        position: fixed;
        width: auto;
        height: auto;
        margin: 0;
        top: 2rem;
        left: 0;
        right: 0;
        bottom: 3rem;
    }



    .pairs-overlay {
        width: auto;
        height: 11rem;
        top: 2rem;
        left: 0;
        right: 0;
        bottom: calc(50% + 1rem);
        border: 1px solid transparent;
        border-radius: 2rem;
        font-size: 2rem;
        overflow: none;
        background: var(--bg-gradient);
        &.pairs-expanded {
            height: auto;
            top: 2rem;
            left: 0;
            right: 30rem;
            width: auto;
            bottom: 2rem;
            overflow-x: hidden;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: t transparent;
        scroll-behavior: smooth; 
        font-size: 1rem;

        }
    }
    // .progress-overlay {
    //     top: 2rem;
    //     bottom: calc(50% + 1rem);
    //     left: 0;
    //     right: auto;
    //     width: 350px;
    //     &.progress-expanded {
    //         width: auto;
    //         height: auto;
    //         top: 2rem;
    //         left: 1rem;
    //         right: 1rem;
    //         bottom: calc(50% + 1rem);
    //     }
    // }
    .history-overlay {
        top: auto;
        left: 0;
        right: 500px;
        bottom: 2rem;
        width: auto;
        height: 20rem;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: var(--secondary-color) transparent;
        scroll-behavior: smooth;
        z-index: 1;
        background: var(--bg-gradient-r);

        &.history-expanded {
            height: auto;
            width: auto;
            top: 18rem;
            left: 0;
            right: 500px;
            bottom: 2rem;
            z-index: 2000;
            cursor: default;
        }
    }

    .chart-overlay {
        top: 15rem;
        left: 0;
        right: calc(500px + 2rem);
        bottom: 2rem;
        height: auto;
        border: 1px solid transparent;
        background: var(--secondary-color);
        &.chart-expanded {
            top: 12rem;
            right: 0;
            left: 0;
            bottom: 2rem;
            height: auto;
            width: auto;
            z-index: 2000;
            cursor: default;
            background: var(--bg-gradient);

        }
    }
    .order-overlay {
        height: auto;
        width: 500px;
        top: calc(50% + 2rem);
        bottom: 2rem;
        right: 0;
        z-index: 1;
        background: var(--bg-gradient-left);
        color: var(--text-color);

        &.order-expanded {
            height: auto;
            width: 500px;
            top: auto;
            left: auto;
            right: 0;
            bottom:4rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .book-overlay {
        top: 15rem;
        right: 0;
        bottom: calc(50% - 4rem);
        width: 500px;
        height: auto;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: var(--secondary-color) transparent;
        scroll-behavior: smooth;
        z-index: 1;
        background: var(--bg-gradient-left);

        &.book-expanded {
            left: auto;
            right: 0;
            top: 17rem;
            bottom: 2rem;

            height: auto;
            width: 50%;
            z-index: 2000;
            cursor: default;
        }
    }



    span.text {
        display: none;
        transition: 0.3s all ease;
    }


    


    @media (max-width: 1600px) {
        .pairs-overlay {
        width: auto;
        height: 11rem;
        left: 0;
        right: 0;
        top: 2rem;
        bottom: auto;
        &.pairs-expanded {
            width: auto;
            height: auto;
            left: 0;
            bottom: 4rem;
        }
    }
    .history-overlay {
        left: 0;
        right: 20rem;
        top: auto;
        bottom: 4rem;
        width: auto;
        height: 20rem;
        &.history-expanded {
            width: auto;
            height: auto;
            top: 17rem;
            left: 0;
            right: 20rem;
            bottom: 4rem;
        }
    }
    // .progress-overlay {
    //     left: 0;
    //     right: auto;
    //     top: 2rem;
    //     width: 18rem;
    //     height: calc(50% - 7rem);
    //     &.progress-expanded {
    //         width: auto;
    //         height: auto;
    //         top: 2rem;
    //         left: 0;
    //         right: 0;
    //         bottom: 14rem;
    //     }
    // }
    .chart-overlay {
        top: 17rem;
        left:0;
        right: 0;
        bottom: 46rem;
        height: auto;
        &.chart-expanded {
            top: 18rem;
            right: 0;
            left: 0;
            bottom: 4rem;
            height: auto;
            width: auto;
            z-index: 2000;
            cursor: default;
        }
    }
    .order-overlay {
        width: auto;
        height: 18rem;
        bottom: 26rem;
        left: 0;
        right: 20rem;
        top: auto;
        &.order-expanded {
            height: 40rem;
            width: auto;
            top: auto;
            left: 0;
            right: 20rem;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .book-overlay {
        top: auto;
        right: 0;
        bottom: 4rem;
        width: 18rem;
        height: 40rem;
        &.book-expanded {
            width: 800px;
            height: auto;
            right: 0;
            bottom: 4rem;
        }
    }

    }

    @media (max-width: 1000px) {


    // .progress-overlay {
    //     left: 0;
    //     right: 0;
    //     top: 2rem;
    //     height: 5rem;
    //     overflow: hidden;
    //     width: auto;
    //     &.progress-expanded {
    //         top: 6rem;
    //         left: 0;
    //         right: 0;
    //         bottom: 16rem;
    //         width: auto;
    //         height: auto;
    //         cursor: default;
    //     }
    // }
    .chart-overlay {
        top: 17rem;
        left: 0;
        right: 0;
        bottom: 45rem;
        height: auto;
        &.chart-expanded {
            right: 0;
            left: 0;
            top: 10rem;
            height: auto;
            width: auto;
            bottom: 10rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .order-overlay {
        height: 23rem;
        width: auto;
        bottom: 20rem;
        left: calc(50% - 1rem);
        right: 0;
        top: auto;
        &.order-expanded {
            height: 45rem;
            width: auto;
            top: auto;
            left: 0;
            right: 0;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }

    .pairs-overlay {
        width: auto;
        height: 11rem;
        top: 2rem;
        left: 0;
        right: 0;
        bottom: 4rem;
        overflow: hidden;
        font-size: 1.2rem;
        &.pairs-expanded {
            width: auto;
            height: auto;
            right: 0;
            left: 0;
            top: 12rem;
            bottom: 15rem;
        }
    }

    .history-overlay {
        top: auto;
        left: 0;
        right: 0%;
        bottom: 4rem;
        width: auto;
        height: 14rem;
        &.history-expanded {
            width: auto;
            height: auto;
            left: 0;
            right: 0;
            top: 17rem;
            bottom: 4rem;
        }
    }
    .book-overlay {
        height: 23rem;
        width: auto;
        bottom: 20rem;
        right: calc(50% - 1rem);
        left: 0;
        top: auto;
        &.book-expanded {
            width: auto;
            height: auto;
            left: 0;
            right: 0;
            top: 18rem;
            bottom: 4rem;
        }
    }
    // .button-text.visible {
    //     display: none;
    // }
    
    }
    @media (max-width: 768px) {
        .button-overlays {
            display: flex;
            flex-direction: row;
            position: fixed;
            width: auto;
            height: 6rem;
            top: auto;
            bottom: 0;


        }

        .toggle-button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 20px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
        font-size: 16px;
        
    }

    //     .progress-overlay {
    //     left: 0;
    //     right: 0;
    //     top: 2rem;
    //     height: 4rem;
    //     &.progress-expanded {
    //         top: 8rem;
    //         left: 0;
    //         right: 0;
    //         bottom: 16rem;
    //         width: auto;
    //         height: auto;
    //         cursor: default;
    //     }
    // }
    .chart-overlay {
        top: 16rem;
        left: 0;
        right: 0;
        bottom: auto;
        height: 37rem;
        &.chart-expanded {
            right: 0;
            left: 0;
            top: 16rem;
            height: auto;
            width: auto;
            bottom: 2rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .order-overlay {
        height: 11rem;
        width: auto;
        bottom: calc(50% - 14rem);
        left: 0;
        right: 0;
        top: auto;
        &.order-expanded {
            height: auto;
            width: auto;
            top: 50%;
            left: 0;
            right: 0;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }

    .pairs-overlay {
        width: auto;
        height: 10rem;
        top: 2rem;
        left: 0;
        right: 0;
        bottom: auto;
        overflow: hidden;

        &.pairs-expanded {
            width: auto;
            height: auto;
            right: 0;
            left: 0;
            top: 12rem;
            bottom: 15rem;
        }
    }

    .history-overlay {
        top: auto;
        left: 0;
        right:0; 
        bottom: 2rem;
        width: auto;
        height: 15rem;
        &.history-expanded {
            width: auto;
            height: auto;
            right: 0;
            left: 0;
            top: 12rem;
            bottom: 2rem;
        }
    }
    .book-overlay {
        width: auto;
        height: 21rem;
        top: auto;
        left: 0;
        right: 0;
        bottom: 19rem;
        &.book-expanded {
            width: auto;
            height: auto;
            right: 0;
            left: 0;
            top: 30rem;
            bottom: 2rem;
        }
    }
    }


</style>
