<script lang="ts">
    // Sample data for the order book
    const bids = [
        { price: 0.00011000, amount: 477505.2086, total: 934592.850 },
        { price: 0.00010999, amount: 50100.0000, total: 457087.642 },
        { price: 0.00010998, amount: 100.0000, total: 406987.642 },
        { price: 0.00010997, amount: 42788.0517, total: 406887.642 },
        { price: 0.00010996, amount: 50221.0375, total: 364099.590 },
        { price: 0.00010995, amount: 100.0000, total: 313878.552 },
        { price: 0.00010994, amount: 37212.3817, total: 313778.552 },
        { price: 0.00010993, amount: 131846.2658, total: 276566.171 },
        { price: 0.00010992, amount: 139633.8241, total: 144719.905 },
        { price: 0.00010991, amount: 5086.0810, total: 5086.081 },
    ];

    const asks = [
        { price: 0.00010990, amount: 3048.7080, total: 3048.708 },
        { price: 0.00010989, amount: 608.1000, total: 3656.808 },
        { price: 0.00010964, amount: 0.0003, total: 3656.808 },
        { price: 0.00010958, amount: 178.0000, total: 3834.808 },
        { price: 0.00010941, amount: 9883.0538, total: 13717.862 },
        { price: 0.00010940, amount: 20564.1598, total: 34282.022 },
        { price: 0.00010928, amount: 172731.8062, total: 207013.828 },
        { price: 0.00010918, amount: 17793.4215, total: 224807.249 },
        { price: 0.00010913, amount: 178.0000, total: 224985.249 },
        { price: 0.00010900, amount: 2000.0000, total: 226985.249 },
    ];

    // Function to calculate the relative width of the colored portion
    const getRelativeWidth = (amount: number, maxAmount: number) => {
        return (amount / maxAmount) * 100;
    };

    // Find the maximum amount in bids and asks
    const maxBidAmount = Math.max(...bids.map((bid) => bid.amount));
    const maxAskAmount = Math.max(...asks.map((ask) => ask.amount));
    const maxAmount = Math.max(maxBidAmount, maxAskAmount);
</script>


<div class="order-book">
    <!-- Order Book Header -->
    <div class="order-book-header">
        <span>Price (BCH)</span>
        <span>Amount (CET)</span>
        <span>Total (CET)</span>
    </div>

    <!-- Bids Section -->
    <div class="order-book-section bids">
        {#each bids as bid}
            <div class="order-book-row bid">
                <div
                    class="background"
                    style="width: {getRelativeWidth(bid.amount, maxAmount)}%; background: linear-gradient(to right, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0.2) 100%);"
                ></div>
                <span class="price">{bid.price.toFixed(8)}</span>
                <span class="amount">{bid.amount.toFixed(4)}</span>
                <span class="total">{bid.total.toFixed(3)}</span>
            </div>
        {/each}
    </div>

    <!-- Asks Section -->
    <div class="order-book-section asks">
        {#each asks as ask}
            <div class="order-book-row ask">
                <div
                    class="background"
                    style="width: {getRelativeWidth(ask.amount, maxAmount)}%; background: linear-gradient(to right, rgba(220, 53, 69, 0.2) 0%, rgba(220, 53, 69, 0.2) 100%);"
                ></div>
                <span class="price">{ask.price.toFixed(8)}</span>
                <span class="amount">{ask.amount.toFixed(4)}</span>
                <span class="total">{ask.total.toFixed(3)}</span>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
    .order-book {
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        width: 100%;
        margin: 0 auto;
    }

    .order-book-header {
        display: flex;
        justify-content: space-between;
        padding: 12px;

        color: var(--tertiary-color);
    }

    .order-book-section {
        display: flex;
        flex-direction: column;
        font-size: 0.9rem;
        
    }

    .order-book-section.bids {
        margin-bottom: 1rem;
        
    }

    .order-book-section.asks {
    }

    .order-book-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid var(--secondary-color);

        position: relative;
        overflow: hidden;
    }

    .order-book-row:last-child {
        border-bottom: none;
    }

    .order-book-row .price {
        color: var(--text-color);
        z-index: 1; 
    }

    .order-book-row.ask .price {
        color: var(--text-color); 
        z-index: 1; 
    }

    .order-book-row .amount,
    .order-book-row .total {
        color: #666;
        z-index: 1; 
    }

    .order-book-row {
        background: var(--primary-color);
    }

    .order-book-row .background {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        z-index: 0; 
    }
</style>