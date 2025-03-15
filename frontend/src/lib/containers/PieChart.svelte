<script lang="ts">
      import { get } from 'svelte/store';
      import { pb, currentUser } from '$lib/pocketbase';
      import type { Wallet, Token} from 'types/walletTypes';
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
    export let size = 300;
    export let bgColor = 'cornflowerblue';
    export let fgColor = 'orange';

    // Test data structure
    interface PieSegment {
        label: string;
        value: number;
        color: string;
        tokenId: string;
        ticker: string;
    }

    const tokenColors = [
        '#FF6384', '#36A2EB', '#FFCE56', 
        '#4BC0C0', '#9966FF', '#FF9F40',
        '#8AC926', '#1982C4', '#6A4C93',
        '#F94144', '#F3722C', '#577590'
    ];
    let totalBalance = 12500.75; 
    let portfolioGrowth = 8.5;
    let pieData: PieSegment[] = [];
    let isLoading = true;
    let hoveredSegment: number | null = null;

    const testData: PieSegment[] = getUniqueTokenIds(tokens).map((tokenId, index) => {
    const balance = getTotalBalanceForToken(tokenId);
    return {
        label: tokenId, 
        value: balance,
        color: tokenColors[index % tokenColors.length] 
    };
});


    $: viewBox = `0 0 ${size} ${size}`;
    $: radius = size / 2;
    $: total = testData.reduce((sum, segment) => sum + segment.value, 0);

    // Calculate segment paths and positions
    $: segments = testData.map((segment, index) => {
        const startAngle = calculateStartAngle(index);
        const endAngle = startAngle + calculateAngle(segment.value);
        
        const x1 = radius + radius * Math.cos(startAngle);
        const y1 = radius + radius * Math.sin(startAngle);
        const x2 = radius + radius * Math.cos(endAngle);
        const y2 = radius + radius * Math.sin(endAngle);

        const largeArcFlag = calculateAngle(segment.value) > Math.PI ? 1 : 0;

        const d = `
            M ${radius} ${radius}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;

        return {
            ...segment,
            path: d,
            startAngle,
            endAngle
        };
    });

    function calculateStartAngle(index: number): number {
        const startValue = testData.slice(0, index).reduce((sum, segment) => sum + segment.value, 0);
        return (startValue / total) * (2 * Math.PI) - Math.PI / 2;
    }

    function calculateAngle(value: number): number {
        return (value / total) * (2 * Math.PI);
    }

    function handleMouseEnter(index: number) {
        hoveredSegment = index;
    }

    function handleMouseLeave() {
        hoveredSegment = null;
    }

    function getUniqueTokenIds(tokens: Token[]): string[] {
    return Array.from(new Set(tokens.map((token) => token.tokenId)));
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

export function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/placeholder-coin.png';
  }

  export function getTokenIcon(tokenId: string): string {
    const token = tokens.find((t) => t.tokenId === tokenId);
    return token?.iconUrl || '/placeholder-coin.png';
  }


</script>

  
<div class="container">
    <div class="basic-container">
        <div class="metric">
            <div class="value">${totalBalance.toFixed(2)}</div>
            <div class="value">{portfolioGrowth.toFixed(1)}%</div>
        </div>
      </div>
    <svg 
        width={size} 
        height={size} 
        {viewBox}
    >
        {#each segments as segment, index}
            <path
                d={segment.path}
                fill={segment.color}
                class:hover={hoveredSegment === index}
                on:mouseenter={() => handleMouseEnter(index)}
                on:mouseleave={handleMouseLeave}
                class="pie-segment"
            />

            <!-- <g transform={`translate(${segment.midX - 12}, ${segment.midY - 12})`}>
                
                <image
                    href={getTokenIcon(segment.tokenId)}
                    width="24"
                    height="24"
                    class="icon"
                    on:error={handleImageError}
                />
                <text
                    x="12"
                    y="100"
                    class="balance-text"
                >
                    {segment.value.toFixed(6)}

                </text>
            </g> -->
        {/each}
        
        <circle 
            r={radius / 2} 
            cx={radius} 
            cy={radius} 
            fill={bgColor} 
        />

    </svg>
</div>

<style lang="scss">

    @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);

        }
    .container {
        display: flex;
        height: auto;
        position: relative;
        justify-content: flex-start;
        margin-top: 3rem;
        padding: 2rem;
        height: auto;
        margin: 0;
    }

    .pie-segment {
        transition: transform 0.3s ease;
        transform-origin: center;
        transform: scale(0.9);

    }

    .pie-segment.hover {
        transform: scale(1);
        filter: brightness(1.2);
    }

    .basic-container {
        display: flex;
        flex-direction: column;
        align-items: top;
        position: absolute;
        top:calc(50% - 7rem);
        left:calc(50% - 7rem);
        justify-content: center;
        gap: 0;
        margin-left: 0;
        border-radius: 50%;
        background: transparent;
        opacity: 0.5;
        width:14rem;
        height: 14rem;
        transition: all 0.2s ease-in-out;
        &:hover {
            animation: scaleEffect 1.3s ease-in-out;
        }

    }

    .metric {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: transparent;
        width: auto;
        height: 100%;
        gap: 0;
        margin-bottom: 0;
        text-align: left;
        color: var(--text-color);

        & .value {
            font-size: 3rem;
        font-weight: 600;
        color: var(--text-color);
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

</style>