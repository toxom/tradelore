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
	import Eye from '@tabler/icons-svelte/icons/eye';
	import EyeglassOff from '@tabler/icons-svelte/icons/eyeglass-off';

    let showAuth = false;
    let showProfile = false;
    let activeLink = '/'; 
    let overlayState = {
        pairs: { active: true, expanded: false },
        book: { active: true, expanded: false },
        progress: { active: true, expanded: false },
        history: { active: true, expanded: false },
        order: { active: true, expanded: false },
        chart: { active: true, expanded: false }
    };
    let hoveredButton: string | null = null;

    let allToggled = true;

    function handleMouseEnter(buttonName: string) {
        hoveredButton = buttonName;
    }

    function handleMouseLeave() {
        hoveredButton = null;
    }


    function toggleAuthOrProfile() {
        if ($currentUser) {
            showProfile = !showProfile;
            showAuth = false;
        } else {
            showAuth = !showAuth;
            showProfile = false;
        }
    }

 function handleAuthSuccess() {
        showAuth = false;
    }
    

    function handleLogout() {
        showProfile = false;
        showAuth = false;
        goto('/');
    }

        function toggleOverlay(overlayName: keyof typeof overlayState) {
        overlayState[overlayName].active = !overlayState[overlayName].active;
        if (!overlayState[overlayName].active) {
            overlayState[overlayName].expanded = false;
        }
        overlayState = { ...overlayState };
        activeLink = overlayName;
        updateAllToggledState();
    }
    
    function handleOverlayClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            showAuth = false;
            showProfile = false;
        }
    }

    function handleDragEnd(name: keyof typeof overlayState) {
        if (overlayState[name].expanded) {
            overlayState[name].expanded = false;
            overlayState = { ...overlayState };
        }
    }

    function toggleAll() {
        allToggled = !allToggled;
        Object.keys(overlayState).forEach(key => {
            overlayState[key].active = allToggled;
            if (!allToggled) {
                overlayState[key].expanded = false;
            }
        });
        overlayState = { ...overlayState };
    }

    function toggleExpand(overlayName: keyof typeof overlayState) {
        overlayState[overlayName].expanded = !overlayState[overlayName].expanded;
        overlayState = { ...overlayState };
    }

    function updateAllToggledState() {
        allToggled = Object.values(overlayState).every(value => value.active === true);
    }

    function handleBackdropClick(name: keyof typeof overlayState) {
        if (overlayState[name].expanded) {
            overlayState[name].expanded = false;
            overlayState = { ...overlayState };
        }
    }

    function getCustomTransition(name: string) {
        switch (name) {
            case 'filter':
                return { x:-200, y: 250, duration: 400, easing: cubicOut };
            case 'book':
                return { y: -250, duration: 400, easing: cubicOut };
            case 'progress':
                return { x: 250, y: -250, duration: 400, easing: cubicOut };
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


<!-- {#if $currentUser} -->

<div class="bottom-buttons">
    <button 
        class="toggle-button toggle-all-button" 
        class:active={allToggled}
        on:click={toggleAll}
        on:mouseenter={() => handleMouseEnter('toggleAll')}
        on:mouseleave={handleMouseLeave}
    >
        <AlignHorizontalDistributeCenter  />
        <span class="text">
            Trade
        </span>
<!-- 
        {#if allToggled}
            
        {:else}

        {/if}
        <span class="button-text" class:visible={hoveredButton === 'toggleAll' || allToggled}>
            {allToggled ? 'Trade' : 'Trade'}
        </span> -->
<!-- 
        <span class="button-text" class:visible={hoveredButton === 'toggleAll' || allToggled}>
            {#if allToggled}
                Trade
            {:else}
            {/if}
        </span> -->
    </button>
    <!-- {#each Object.entries(overlayState) as [name, state]}
        <button 
            class="toggle-button" 
            class:active={state.active}
            on:click={() => toggleOverlay(name)}
            on:mouseenter={() => handleMouseEnter(name)}
            on:mouseleave={handleMouseLeave}
        >

            {#if name === 'pairs'}
                {#if state.active}
                <span class="icon">
                    <LayoutList size={20} />
                </span>
                {:else}
                <span class="icon">
                    <LayoutList size={20} />
                </span>                
                {/if}
            {:else if name === 'book'}
                <span class="icon">
                    <Tornado size={20} />
                </span>
            {:else if name === 'progress'}
                <span class="icon">
                    <Crosshair size={20} />
                </span>
            {:else if name === 'history'}
                <span class="icon">
                    <History size={20} />
                </span>            
            {:else if name === 'order'}
                <span class="icon">
                    <ArrowUpDown size={20} />
                </span>    
            {:else if name === 'chart'}
                <span class="icon">
                    <ChartLine size={20} />
                </span>                
            {/if}
            <span class="button-text" class:visible={hoveredButton === name || state.active}>
                {#if state.active}
                    <EyeOff size={20} />
                {:else}
                    {name}
                {/if}
            </span>

        </button>
    {/each} -->
</div>
<!-- {:else} -->

<!-- <Landing/> -->
<!-- {/if} -->

{#each Object.entries(overlayState) as [name, state]}
    {#if state.active}
        {#if state.expanded}
            <div 
                class="backdrop"
                on:click={() => handleBackdropClick(name)}
                transition:fade={{ duration: 200 }}
            />
        {/if}
        <div 
            class="overlay {name}-overlay" 
            class:expanded={state.expanded}
            class:pairs-expanded={name === 'pairs' && state.expanded}
            class:book-expanded={name === 'book' && state.expanded}
            class:progress-expanded={name === 'progress' && state.expanded}
            class:history-expanded={name === 'history' && state.expanded}
            class:order-expanded={name === 'order' && state.expanded}
            class:chart-expanded={name === 'chart' && state.expanded}
            transition:fly={getCustomTransition(name)}
            on:click={() => !state.expanded && toggleExpand(name)}
            use:drag={{
                onDragEnd: () => handleDragEnd(name)
            }}
        >
            {#if name === 'pairs'}
                <TradingPairs/>
            {:else if name === 'book'}
                <OrderBook />
            {:else if name === 'progress'}
                <Progress />
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
            <button class="expand-button" on:click={(e) => { e.stopPropagation(); toggleExpand(name); }}>
                {#if state.expanded}
                    <Minimize2 size={20} />
                {:else}
                    <Maximize2 size={20} />
                {/if}
            </button>
        </div>
    {/if}
{/each}

<style lang="scss">
     .map-container {
        position: fixed;
        bottom: 0;
        width: 98%;
        height: auto;
        background-color: rgb(0, 0, 0);
    }

    .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1999;
    }

    .overlay {
        position: fixed;
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        backdrop-filter: blur(50px);
        background: var(--primary-color);
        border: 1px solid var(--secondary-color);
        padding: 1rem;
        margin: 1rem;
        color: var(--text-color);
        /* z-index: 10; */
        transition: all 0.3s ease;
        cursor: pointer;
        user-select: none;

        h2 {
            font-weight: 700;
            width: calc(100% - 1rem);
            margin-top: 0;
        }
    }
    .overlay.expanded {
        width: 98%; 
        height: 90%; 
        top: 3%;
        left: auto;
        right: auto;
        bottom: 500px;
        z-index: 2000;
        cursor: default;
        box-shadow: -100px -1px 100px 4px rgba(255, 255, 255, 0.2);

    }
    .pairs-overlay {
        width: auto;
        height: 11rem;

        top: 4rem;
        left: calc(350px + 4rem);
        right: 0;
        bottom: calc(50% + 1rem);
        font-size: 2rem;
        overflow: none;
        &.pairs-expanded {
            height: auto;
            top: 4rem;
            left: calc(350px + 4rem);
            right: 0;
            width: auto;
            bottom: 4rem;
            overflow-x: hidden;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: var(--secondary-color) transparent;
        scroll-behavior: smooth; 
        font-size: 1rem;

        }
    }
    .history-overlay {
        left: 65%;
        right: 0;
        bottom: 4rem;
        width: auto;
        height: 35rem;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: var(--secondary-color) transparent;
        scroll-behavior: smooth;

        &.history-expanded {
            height: auto;
            width: auto;
            top: 4rem;
            left: calc(350px + 2rem);
            right: 0;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .progress-overlay {
        top: 4rem;
        bottom: calc(50% + 1rem);
        left: 0;
        right: auto;
        width: 350px;
        &.progress-expanded {
            width: auto;
            height: auto;
            top: 4rem;
            left: 1rem;
            right: 1rem;
            bottom: calc(50% + 1rem);
        }
    }
    .chart-overlay {
        top: 19rem;
        left: calc(350px + 4rem);
        right: 35%;
        bottom: 4rem;
        height: auto;
        &.chart-expanded {
            top: 4rem;
            right: 0;
            left: 0;
            bottom: 19rem;
            height: auto;
            width: auto;
            z-index: 2000;
            cursor: default;
        }
    }
    .order-overlay {
        height:auto;
        top: 19rem;
        bottom:42rem;
        left: 65%;
        right: 0;
        &.order-expanded {
            height: auto;
            width: auto;
            top: 17rem;
            left: 65%;
            right: 0;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .book-overlay {
        top: calc(50% - 1rem);
        left: 0;
        bottom: 4rem;
        width: 350px;
        height: auto;
        overflow-y: scroll;
        scrollbar-width:2px;
        scrollbar-color: var(--secondary-color) transparent;
        scroll-behavior: smooth;
        &.book-expanded {
            left: 0;
            top: 4rem;
            height: auto;
            width: 50%;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .bottom-buttons {
        display: flex;
        flex-direction: row;
        width: fit-content;
        position: fixed;
        top: 0.75rem;
        left: 350px; 
        justify-content: space-between;
        align-items: center;
        z-index: 2000;

    }

    .toggle-button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: auto;
        height: 2.5rem;
        border: 1px solid var(--tertiary-color);
        border-radius: 20px;
        background: var(--bg-gradient-left);
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
        font-size: 16px;
        
    }

    .toggle-button:hover,
    .toggle-button.active {
        width: auto;
        padding-right: 1rem;
        width: auto;
    }

    span.text {
        display: none;
        transition: 0.3s all ease;
    }

    .toggle-all-button {
        color: var(--text-color);
        transition: 0.3s all ease;
        width: auto;
        border-color: var(--secondary-color);

        &:hover {
            background-color: var(--secondary-color);

            span.text {
                display: flex;
            }
        }
    }

    // .toggle-all-button.active {
    // }

    .button-text {
        white-space: nowrap;
        opacity: 0;
        max-width: 0;
        transition: opacity 0.3s ease, max-width 0.3s ease;
    }

    .button-text.visible {
        opacity: 1;
        max-width: 200px;
    }

    .close-button, .expand-button {
        display: none;
        position: absolute;
        color: #ffffff;
        border-radius: 50%;
        top: 10px;
        right: 0;
        margin-right: 0;
        background-color: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        transition: all 0.3s ease;

    }

    .close-button {
        right: 10px;

        &:hover {
            color: red;
        }
    }

    .expand-button {
        right: 10px;

        &:hover {
            color: rgb(0, 255, 119);
        }
    }


    @media (max-width: 1600px) {
        .pairs-overlay {
        width: auto;
        height: 11rem;
        left: calc(300px + 2rem);
        right: 0;
        top: 4rem;
        bottom: auto;
        &.pairs-expanded {
            width: auto;
            height: auto;
            left: 20rem;
            bottom: 4rem;
        }
    }
    .history-overlay {
        left: calc(300px + 2rem);
        right: 0;
        top: calc(50% + 14rem);
        bottom: 4rem;
        width: auto;
        height: auto;
        &.history-expanded {
            width: auto;
            height: auto;
            top: 4rem;
            left: calc(300px + 2rem);
            right: 0;
            bottom: 4rem;
        }
    }
    .progress-overlay {
        left: 0;
        right: auto;
        top: 4rem;
        width: 18rem;
        height: calc(50% - 7rem);
        &.progress-expanded {
            width: auto;
            height: auto;
            top: 4rem;
            left: 0;
            right: 0;
            bottom: 14rem;
        }
    }
    .chart-overlay {
        top: 18rem;
        left: calc(300px + 2rem);
        right: 0;
        bottom: calc(50% - 1rem);
        height: auto;
        &.chart-expanded {
            top: 4rem;
            right: 0;
            left: 0;
            bottom: 16rem;
            height: auto;
            width: auto;
            z-index: 2000;
            cursor: default;
        }
    }
    .order-overlay {
        height: 11rem;
        bottom: calc(50% - 15rem);
        left: calc(300px + 2rem);
        right: 0;
        top: auto;
        &.order-expanded {
            height: auto;
            width: auto;
            top: 50%;
            left: calc(300px + 2rem);
            right: 0;
            bottom: 4rem;
            z-index: 2000;
            cursor: default;
        }
    }
    .book-overlay {
        top: auto;
        left: 0;
        bottom: 4rem;
        width: 18rem;
        height: calc(50% - 8rem);
        &.book-expanded {
            width: 800px;
            height: auto;
            left: 0;
            bottom: 4rem;
        }
    }

    }

    @media (max-width: 1000px) {


    .progress-overlay {
        left: 0;
        right: 0;
        top: 4rem;
        height: 5rem;
        overflow: hidden;
        width: auto;
        &.progress-expanded {
            top: 6rem;
            left: 0;
            right: 0;
            bottom: 16rem;
            width: auto;
            height: auto;
            cursor: default;
        }
    }
    .chart-overlay {
        top: 27rem;
        left: 0;
        right: 0;
        bottom: 31rem;
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
        height: 11rem;
        width: auto;
        bottom: 16rem;
        left: 0;
        right: 0;
        top: auto;
        &.order-expanded {
            height: auto;
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
        top: 12rem;
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
        right: 50%;
        bottom: 4rem;
        width: auto;
        height: 8rem;
        &.history-expanded {
            width: auto;
            height: auto;
            left: 0;
            right: 0;
            top: 18rem;
            bottom: 4rem;
        }
    }
    .book-overlay {
        top: auto;
        left: 50%;
        right: 0; 
        bottom: 4rem;
        width: auto;
        height: 8rem;
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
        .bottom-buttons {
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

        .progress-overlay {
        left: 0;
        right: 0;
        top: 4rem;
        height: 4rem;
        &.progress-expanded {
            top: 8rem;
            left: 0;
            right: 0;
            bottom: 16rem;
            width: auto;
            height: auto;
            cursor: default;
        }
    }
    .chart-overlay {
        top: 24rem;
        left: 0;
        right: 0;
        bottom: 50%;
        height: auto;
        &.chart-expanded {
            right: 0;
            left: 0;
            top: 7rem;
            height: auto;
            width: auto;
            bottom: 10rem;
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
        top: 11rem;
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
        bottom: 4rem;
        width: auto;
        height: 21rem;
        &.history-expanded {
            width: auto;
            height: auto;
            right: 0;
            left: 0;
            top: 12rem;
            bottom: 15rem;
        }
    }
    .book-overlay {
        width: auto;
        height: 11rem;
        top: auto;
        left: 0;
        right: 0;
        bottom: 28rem;
        &.book-expanded {
            width: auto;
            height: auto;
            right: 0;
            left: 0;
            top: 12rem;
            bottom: 15rem;
        }
    }
    }


</style>
