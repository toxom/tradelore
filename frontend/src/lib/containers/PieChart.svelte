<script lang="ts">
        import { onMount } from 'svelte';
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

    let selectedCurrency = 'usd';
    let currencySymbols: {[key: string]: string} = {
        'usd': '$',
        'eur': '€',
        'btc': '₿',
        'eth': 'Ξ'
    };
    // Test data structure
    interface PieSegment {
        label: string;
        value: number;
        color: string;
        tokenId: string;
        ticker: string;
        originalValue: number;
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
    let error = '';

    function getUniqueTokenIds(tokensArray: Token[]): string[] {
        return Array.from(new Set(tokensArray.map((token) => token.tokenId)));
    }
    function calculateStartAngle(index: number): number {
        const startValue = pieData.slice(0, index).reduce((sum: number, segment: PieSegment) => sum + segment.value, 0);
        console.log(`calculateStartAngle for index ${index}, start value: ${startValue}, total: ${total}`);
        return (startValue / total) * (2 * Math.PI) - Math.PI / 2;
    }

    function calculateAngle(value: number): number {
        console.log(`calculateAngle for value ${value}, total: ${total}`);
        return (value / total) * (2 * Math.PI);
    }
    function calculateSegments() {
        console.log("Calculating segments from pieData:", pieData);
        
        totalBalance = pieData.reduce((sum, segment) => sum + segment.value, 0);
        console.log("Total balance calculated:", totalBalance);
        const total = pieData.reduce((sum, segment) => sum + segment.value, 0);
        console.log("Total value calculated inside function:", total);
        
        if (pieData.length === 0) {
            console.warn("pieData is empty, no segments to calculate");
            segments = [];
            return;
        }
        
        if (total === 0) {
            console.warn("Total value is 0, cannot calculate segments");
            segments = [];
            return;
        }
        
        segments = pieData.map((segment, index) => {
            // Calculate startAngle directly here without using the helper function
            const startValue = pieData.slice(0, index).reduce((sum: number, segment: PieSegment) => sum + segment.value, 0);
            const startAngle = (startValue / total) * (2 * Math.PI) - Math.PI / 2;
            
            // Calculate angle directly
            const angle = (segment.value / total) * (2 * Math.PI);
            const endAngle = startAngle + angle;
            
            const x1 = radius + radius * Math.cos(startAngle);
            const y1 = radius + radius * Math.sin(startAngle);
            const x2 = radius + radius * Math.cos(endAngle);
            const y2 = radius + radius * Math.sin(endAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const d = `
                M ${radius} ${radius}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
            `;

            // Calculate midpoint for labels
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            const labelRadius = radius * 0.7;
            const midX = radius + labelRadius * Math.cos(midAngle);
            const midY = radius + labelRadius * Math.sin(midAngle);

            return {
                ...segment,
                path: d,
                startAngle,
                endAngle,
                midX,
                midY
            };
        });
        
        console.log("Calculated segments:", segments);
    }
    function convertAmount(originalValue: number, fromTokenId: string, toCurrency: string): number {
        return originalValue;
    }

    function updateCurrencyValues() {
        // Convert each segment value to the selected currency
        pieData = pieData.map(segment => {
            let convertedValue = segment.originalValue;
            
            // For tokens (convert to the selected currency)
            if (selectedCurrency !== segment.tokenId) {
                convertedValue = convertAmount(
                    segment.originalValue, 
                    segment.tokenId, 
                    selectedCurrency
                );
            }
            
            return {
                ...segment,
                value: convertedValue
            };
        });
        
        // Calculate total balance in selected currency
        totalBalance = pieData.reduce((sum, segment) => sum + segment.value, 0);
        console.log("Total balance calculated:", totalBalance);

        // Calculate pie segments based on new values
        calculateSegments();
    }

    $: if (selectedCurrency) {
        updateCurrencyValues();
    }

    $: viewBox = `0 0 ${size} ${size}`;
    $: radius = size / 2;
    // $: total = pieData.reduce((sum, segment) => sum + segment.value, 0);

    let segments: Array<PieSegment & {
    path: string;
    startAngle: number;
    endAngle: number;
    midX: number;
    midY: number;
}> = [];
    async function fetchConversionRates(tokenIds: string[]): Promise<void> {
        console.log("Would fetch conversion rates for:", tokenIds);
    }
    async function initializeData() {
        isLoading = true;
        error = '';
        
        console.log("Starting initializeData");
        
        try {
            // Fetch tokens and wallets if needed
            console.log("Fetching tokens...");
            await fetchTokens();
            console.log("Tokens fetched");
            
            console.log("Fetching wallets...");
            await fetchWallets();
            console.log("Wallets fetched");
            
            // tokens is a direct array, no need for get()
            const tokensArray = tokens;
            // wallets is a store, need to use get()
            const walletsArray = get(wallets);
            
            console.log("Tokens array length:", tokensArray.length);
            console.log("Wallets array length:", walletsArray.length);
            
            const uniqueTokenIds = getUniqueTokenIds(tokensArray);
            console.log("Unique token IDs:", uniqueTokenIds);
            
            function getTotalBalanceForToken(tokenId: string): number {
                console.log(`Getting balance for token: ${tokenId}`);
                
                const userWallets = walletsArray.filter(
                    wallet => wallet.userId === (get(currentUser)?.id || '') && wallet.tokenId === tokenId
                );
                
                console.log(`Found ${userWallets.length} wallets for token ${tokenId}`);
                
                return userWallets.reduce((total, wallet) => {
                    const walletBalance = typeof wallet.balance === 'string' 
                        ? parseFloat(wallet.balance) || 0 
                        : wallet.balance || 0;
                    return total + walletBalance;
                }, 0);
            }
            
            // Initialize pieData with basic information
            pieData = uniqueTokenIds.map((tokenId, index) => {
                const token = tokensArray.find(t => t.tokenId === tokenId);
                const balance = getTotalBalanceForToken(tokenId);
                
                return {
                    label: token?.name || tokenId,
                    value: balance,
                    originalValue: balance,
                    color: tokenColors[index % tokenColors.length],
                    tokenId: tokenId,
                    ticker: token?.ticker || tokenId
                };
            }).filter(segment => segment.originalValue > 0); // Only show tokens with balance
            
            console.log("Generated pieData:", pieData);
            
            // Calculate segments based on values
            calculateSegments();
            
            isLoading = false;
        } catch (err) {
            console.error("Error initializing chart data:", err);
            error = 'Failed to load portfolio data.';
            isLoading = false;
        }
    }

//     const testData: PieSegment[] = getUniqueTokenIds(tokens).map((tokenId, index) => {
//     const balance = getTotalBalanceForToken(tokenId);
//     return {
//         label: tokenId, 
//         value: balance,
//         color: tokenColors[index % tokenColors.length] 
//     };
// });


//     $: viewBox = `0 0 ${size} ${size}`;
//     $: radius = size / 2;
//     $: total = testData.reduce((sum, segment) => sum + segment.value, 0);

//     // Calculate segment paths and positions
//     $: segments = testData.map((segment, index) => {
//         const startAngle = calculateStartAngle(index);
//         const endAngle = startAngle + calculateAngle(segment.value);
        
//         const x1 = radius + radius * Math.cos(startAngle);
//         const y1 = radius + radius * Math.sin(startAngle);
//         const x2 = radius + radius * Math.cos(endAngle);
//         const y2 = radius + radius * Math.sin(endAngle);

//         const largeArcFlag = calculateAngle(segment.value) > Math.PI ? 1 : 0;

//         const d = `
//             M ${radius} ${radius}
//             L ${x1} ${y1}
//             A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
//             Z
//         `;

//         return {
//             ...segment,
//             path: d,
//             startAngle,
//             endAngle
//         };
//     });



    function handleMouseEnter(index: number) {
        hoveredSegment = index;
    }

    function handleMouseLeave() {
        hoveredSegment = null;
    }
    function formatValue(value: number): string {
        if (selectedCurrency === 'btc' || selectedCurrency === 'eth') {
            return value.toFixed(6);
        }
        return value.toFixed(2);
    }



export function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/placeholder-coin.png';
  }

  export function getTokenIcon(tokenId: string): string {
    const token = tokens.find((t) => t.tokenId === tokenId);
    return token?.iconUrl || '/placeholder-coin.png';
}
  onMount(() => {
        initializeData();
    });

</script>

  
<div class="container">
    <div class="basic-container">
        <div class="metric">
            <div class="metric-item">
                <!-- <div class="metric-label">Portfolio Value</div> -->
                <div class="value">{currencySymbols[selectedCurrency] || ''}{formatValue(totalBalance)}</div>
            </div>

        </div>
        
        <div class="currency-toggle">
            <!-- <span>Display in:</span> -->
            {#each Object.keys(currencySymbols) as currency}
                <button 
                    class:active={selectedCurrency === currency}
                    on:click={() => selectedCurrency = currency}
                >
                    {currency.toUpperCase()}
                </button>
            {/each}
        </div>
        <div class="metric-item">
            <div class="metric-label">24h Change</div>
            <div class="value" class:positive={portfolioGrowth > 0} class:negative={portfolioGrowth < 0}>
                {portfolioGrowth > 0 ? '+' : ''}{portfolioGrowth.toFixed(1)}%
            </div>
        </div>
    </div>
    
    {#if isLoading}
        <div>Loading chart data...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
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
            
            {#if segment.value / totalBalance > 0.05}
                <g>
                    <image
                        href={getTokenIcon(segment.tokenId)}
                        x={segment.midX - 15}
                        y={segment.midY - 35}
                        width="30"
                        height="30"
                        on:error={handleImageError}
                    />
                    
                    <!-- Always visible text labels with more spacing -->
                    <text 
                        x={segment.midX} 
                        y={segment.midY + 15}
                        text-anchor="middle" 
                        fill="white" 
                        font-weight="bold"
                        font-size="12"
                        class="token-label"
                    >
                        {segment.ticker.toUpperCase()}
                    </text>
                    
                    <text 
                        x={segment.midX} 
                        y={segment.midY + 40}
                        text-anchor="middle" 
                        fill="white"
                        font-size="10"
                        class="percentage-label" 
                    >
                        {((segment.value / totalBalance) * 100).toFixed(1)}%
                    </text>
                </g>
            {/if}
        {/each}
        
        <circle 
            r={radius / 2} 
            cx={radius} 
            cy={radius} 
            fill={bgColor} 
        />

        <!-- Tooltip that appears near the hovered segment -->
        {#if hoveredSegment !== null && segments[hoveredSegment]}
            {@const segment = segments[hoveredSegment]}
            {@const tooltipX = segment.midX > radius ? segment.midX - 20 : segment.midX - 80}
            {@const tooltipY = segment.midY > radius ? segment.midY - 50 : segment.midY - 80}
            
            <g class="tooltip">
                <rect 
                    x={tooltipX} 
                    y={tooltipY} 
                    width="160" 
                    height="160" 
                    rx="10" 
                    fill="rgba(0,0,0,0.5)" 
                />
                <text x={tooltipX + 80} y={tooltipY + 40} text-anchor="middle" fill="white" font-weight="bold">
                    {segment.ticker.toUpperCase()}
                </text>
                <text x={tooltipX + 80} y={tooltipY + 80} text-anchor="middle" fill="white">
                    {currencySymbols[selectedCurrency] || ''}{formatValue(segment.value)}
                </text>
                <text x={tooltipX + 80} y={tooltipY + 120} text-anchor="middle" fill="white" font-size="12">
                    {((segment.value / totalBalance) * 100).toFixed(1)}%
                </text>
            </g>
        {/if}
    </svg>
    {/if}
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
    image {
        border-radius: 50%;
        filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3));
        background-color: red;
    }

    text {
        font-size: 1.5rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        z-index: 1000;
        background-color: red;
    }
    .basic-container {
        display: flex;
        flex-direction: column;
        align-items: top;
        position: absolute;
        background: var(--bg-gradient);
        top:calc(50% - 9rem);
        left:calc(50% - 9rem);
        justify-content: center;
        gap: 0;
        margin-left: 0;
        border-radius: 50%;
        opacity: 1;
        width:18rem;
        height: 18rem;
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
        padding: 0;
        margin-bottom: 0.5rem;
    }
    
    .metric-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }
    
    .metric-label {
        font-size: 1rem;
        color: var(--text-color);

    }
    
    .value {
        font-size: calc(2.5rem - 0.5vmin);
        font-weight: bold;
    }
    
    .positive {
        color: #28a745;
        
    }
    
    .negative {
        color: #dc3545;
    }
    
    .currency-toggle {
        display: flex;
        flex-direction: row;
        width: auto;
        justify-content: center;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .currency-toggle button {
        padding: 0.25rem 0.5rem;
        color: var(--placeholder-color);
        border: 1px solid transparent;
        background: none;
        border-radius: 1rem;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .currency-toggle button.active {
        background: var(--bg-gradient-fade);
        color: white;
        font-weight: bold;
        border-color: var(--tertiary-color);
    }

    .token-label, .percentage-label {
        stroke: rgba(0, 0, 0, 0.5);
        stroke-width: 0.5px;
        paint-order: stroke;
    }
    
    .tooltip {
        pointer-events: none; 
        z-index: 2000;
    }
    
    .tooltip rect {
        filter: blur(1px);

    }

</style>