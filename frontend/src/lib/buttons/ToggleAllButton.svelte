<script lang="ts">
    import { toggleAll, allToggled, handleMouseEnter, handleMouseLeave, overlayStateAssets, overlayStateTrade } from "$lib/actions/toggling";
    import { Wallet, Box, Landmark, CreditCard, BarChart, PieChart } from 'lucide-svelte'; 

    type IconType = typeof Wallet | typeof Box | typeof Landmark | typeof CreditCard | typeof BarChart | typeof PieChart;

    export let type: 'assets' | 'trade' = 'assets';
    export let text: string = 'test';
    export let icon: typeof Box = Box; 
    $: overlayState = type === 'assets' ? overlayStateAssets : overlayStateTrade;
    $: isAllToggled = $allToggled;
</script>

<button
    class="toggle-button toggle-all-button"
    class:active={isAllToggled}
    on:click={() => toggleAll(overlayState)}
    on:mouseenter={() => handleMouseEnter('toggleAll')}
    on:mouseleave={handleMouseLeave}
>
    <svelte:component this={icon} /> 
    <span class="text">{text}</span> 
</button>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
    .active {
    }

    @media (max-width: 768px) {
        span.text {
            display: none;
        }
    }
</style>