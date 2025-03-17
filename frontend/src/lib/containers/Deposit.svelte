<script lang="ts">
    import { ArrowDownToLine, Search, Star } from 'lucide-svelte';
    import PieChart from '$lib/containers/PieChart.svelte'
    let totalBalance = 12500.75; 
    let portfolioGrowth = 8.5;



</script>

<div class="portfolio-container">
    <PieChart     
        size={600} 
        bgColor="white" 
        fgColor="green" 
    />
    <!-- <div class="basic-container">
        <div class="metric">
            <div class="value">${totalBalance.toFixed(2)}</div>
            <div class="value">{portfolioGrowth.toFixed(1)}%</div>
        </div>
    </div> -->
</div>




<style lang="scss">

    @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);
            color: var(--text-color);

        }

    :global(body) {
        margin: 0;
        padding: 0;
    }
    .portfolio-container {
        display: flex;
        position: absolute;
        top: 0;
        justify-content: center;
        align-items: flex-start;
        height: auto;
        margin-top: 0;
    }

    .recent-activity {
        margin-top: 5rem;
    }
    .container {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        left: 0;
        overflow-x: hidden;

    }

    span.overlay-shortcut {
        display: flex;
        flex-direction: column;
        height: auto;
        padding: 1rem;
        gap: 0;
        justify-content: center;
        align-items: center;

        h2 {
            font-size: 1.5rem;
        }
    }


</style>