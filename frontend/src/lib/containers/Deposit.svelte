<script lang="ts">
    import { ArrowDownToLine, Search, Star } from 'lucide-svelte';
    import PieChart from '$lib/containers/PieChart.svelte'
    let totalBalance = 12500.75; 
    let portfolioGrowth = 8.5;



</script>
<PieChart     
size={600} 
bgColor="white" 
fgColor="green" 
/>

<div class="basic-container">
  <div class="metric">
      <div class="value">${totalBalance.toFixed(2)}</div>
      <div class="value">{portfolioGrowth.toFixed(1)}%</div>
  </div>
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
    .basic-container {
        display: flex;
        flex-direction: column;
        align-items: top;
        position: absolute;
        top: auto;
        margin-top: 4rem;
        justify-content: center;
        gap: 0;
        left:calc(50% - 6rem);
        margin-left: 0;
        border-radius: 50%;
        background: var(--bg-gradient-fade);
        width:12rem;
        height: 12rem;
        margin-bottom: 4rem;
        border: 1px solid var(--tertiary-color);
        transition: all 0.2s ease-in-out;
        &:hover {
            animation: scaleEffect 1.3s ease-in-out;
        }

    }

    @keyframes pulse {
	0% {
		opacity: 0.5;
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0.5;
	}
}
@keyframes scaleEffect {
      0% {
          transform: scale(1);
      }
      50% {
          transform: scale(1.1);
      }
      100% {
          transform: scale(1);
      }
  }

    .metric {
        display: flex;
        flex-direction: column;
        width: auto;
        height: 100%;
        gap: 1rem;
        margin-bottom: 0;
        text-align: center;
        justify-content: center;
        align-items: center;
        & .value {
            font-size: 4rem;
        font-weight: 600;
        color: var(--tertiary-color);

        }
        & .label {
            font-size: 2rem;
            color: var(--text-color);

          }
        & .conversion {
            font-size: 2rem;
            color: var(--text-color);
            font-style: italic;

        }
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