<script lang="ts">
    // Sample data for the order history table
    const orders = [
        {
            orderTime: '2023-10-01 10:30',
            side: 'Buy',
            orderPrice: '0.025',
            orderAmount: '500',
            unexecuted: '0',
            executed: '500',
            avgPrice: '0.025',
        },
        {
            orderTime: '2023-10-02 14:45',
            side: 'Sell',
            orderPrice: '0.026',
            orderAmount: '300',
            unexecuted: '100',
            executed: '200',
            avgPrice: '0.0255',
        },
        {
            orderTime: '2023-10-03 09:15',
            side: 'Buy',
            orderPrice: '0.024',
            orderAmount: '400',
            unexecuted: '0',
            executed: '400',
            avgPrice: '0.024',
        },
        {
            orderTime: '2023-10-01 10:30',
            side: 'Buy',
            orderPrice: '0.025',
            orderAmount: '500',
            unexecuted: '0',
            executed: '500',
            avgPrice: '0.025',
        },
        {
            orderTime: '2023-10-02 14:45',
            side: 'Sell',
            orderPrice: '0.026',
            orderAmount: '300',
            unexecuted: '100',
            executed: '200',
            avgPrice: '0.0255',
        },
        {
            orderTime: '2023-10-03 09:15',
            side: 'Buy',
            orderPrice: '0.024',
            orderAmount: '400',
            unexecuted: '0',
            executed: '400',
            avgPrice: '0.024',
        },
        {
            orderTime: '2023-10-02 14:45',
            side: 'Sell',
            orderPrice: '0.026',
            orderAmount: '300',
            unexecuted: '100',
            executed: '200',
            avgPrice: '0.0255',
        },
        {
            orderTime: '2023-10-03 09:15',
            side: 'Buy',
            orderPrice: '0.024',
            orderAmount: '400',
            unexecuted: '0',
            executed: '400',
            avgPrice: '0.024',
        },
        {
            orderTime: '2023-10-01 10:30',
            side: 'Buy',
            orderPrice: '0.025',
            orderAmount: '500',
            unexecuted: '0',
            executed: '500',
            avgPrice: '0.025',
        },
        {
            orderTime: '2023-10-02 14:45',
            side: 'Sell',
            orderPrice: '0.026',
            orderAmount: '300',
            unexecuted: '100',
            executed: '200',
            avgPrice: '0.0255',
        },
        {
            orderTime: '2023-10-03 09:15',
            side: 'Buy',
            orderPrice: '0.024',
            orderAmount: '400',
            unexecuted: '0',
            executed: '400',
            avgPrice: '0.024',
        },
    ];
</script>

<div>
    <span class="title">
        <h2>Order History</h2>
        <button class="cancel-all-button" on:click={() => alert('All orders canceled!')}>
            Cancel All
        </button>
    </span>




    <table class="order-history">
        
        <thead>
            <tr>
                <th>Order Time</th>
                <th>Side</th>
                <th>Order Price (BCH)</th>
                <th>Order Amount (CET)</th>
                <th>Unexecuted (CET)</th>
                <th>Executed (CET)</th>
                <th>Avg. Price (BCH)</th>
                <th>Operation</th>
            </tr>
        </thead>
        <tbody>
            {#each orders as order}
                <tr>
                    <td>{order.orderTime}</td>
                    <td class={order.side.toLowerCase() === 'buy' ? 'side-buy' : 'side-sell'}>
                        {order.side}
                    </td>
                    <td>{order.orderPrice}</td>
                    <td>{order.orderAmount}</td>
                    <td>{order.unexecuted}</td>
                    <td>{order.executed}</td>
                    <td>{order.avgPrice}</td>
                    <td class="operation" on:click={() => alert(`Cancel order: ${order.orderTime}`)}>
                        Cancel
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="scss">

    @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);
            color: var(--text-color);
        }    
        .order-history {
        width: 100%;
        border-collapse: collapse;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background: transparent;
    }

    .order-history th,
    .order-history td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid var(--secondary-color);
    }

    .order-history th {
        font-weight: 600;
        color: var(--text-color);
    }

    .order-history tbody tr:hover {
        background-color: var(--tertiary-color);
    }

    .order-history .side-buy {
        color: #28a745; /* Green for Buy */
    }

    .order-history .side-sell {
        color: #dc3545; /* Red for Sell */
    }

    .order-history .operation {
        color: #007bff;
        cursor: pointer;
    }

    .order-history .operation:hover {
        text-decoration: underline;
    }

    .cancel-all-button {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 16px;
    }

    .cancel-all-button:hover {
        background-color: #c82333;
    }

    span.title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-right: 2rem;
    }
</style>

