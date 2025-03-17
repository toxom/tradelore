<script lang="ts">
    // Sample data for user progress
    let portfolioGrowth = 8.5; // Portfolio growth in percentage
    let recentActivity = [
        { type: 'Buy', coin: 'BTC', amount: 0.25, date: '2023-10-01' },
        { type: 'Sell', coin: 'ETH', amount: 1.5, date: '2023-10-02' },
        { type: 'Buy', coin: 'LTC', amount: 10, date: '2023-10-03' },
    ];
</script>

<div class="basic-container">
    <div class="metric">
        <div class="label">Total Balance</div>
        <div class="value">${totalBalance.toFixed(2)}</div>
        <div class="conversion">≈${totalBalance.toFixed(2)}</div>
    </div>
    <div class="metric">
        <div class="label">Portfolio Growth</div>
        <div class="value">{portfolioGrowth.toFixed(1)}%</div>
        <div class="conversion">≈${portfolioGrowth.toFixed(2)}</div>
    </div>

</div>
<button class="basic-button">
    Add Funds
</button>
<div class="recent-activity">
    <h3>Recent Activity</h3>
    <ul class="activity-list">
        {#each recentActivity as activity}
            <li class="activity-item">
                <span class="type">{activity.type} {activity.coin}</span>
                <span class="details">{activity.amount} {activity.coin} on {activity.date}</span>
            </li>
        {/each}
    </ul>
</div>
<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }
    .basic-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        width: auto;
        height: auto;
        margin-bottom: 1rem;
    }




    .recent-activity {
        margin-top: 5rem;
    }

    .recent-activity h3 {
        font-size: 1.25rem;
        color: var(--text-color);
        margin-bottom: 1rem;
    }

    .activity-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .activity-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
        border-bottom: none;
    }

    .activity-item .type {
        font-weight: 500;
        color: #333;
    }

    .activity-item .details {
        color: #666;
    }

    @media (max-width: 1600px) {
        .metric {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom:4rem;
            text-align: left;
            & .value {
                font-size: 2.5rem;
            font-weight: 600;
            }
            & .label {
                font-size: 2rem;
            }
            & .conversion {
                font-size: 2rem;
                font-style: italic;
            }
        }
    }
    @media (max-width: 1000px) {
            .basic-container {
            display: flex;
            flex-direction: column;
            align-items: top;
            gap: 2rem;
            width: 100%;
            height: 100%;
            margin-bottom: rem;
        }
        .metric {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 0;
            margin: 0;
            text-align: center;
            & .value {
                font-size: 2rem;
            font-weight: 600;
            }
            & .label {
                font-size: 1.5rem;
            }
            & .conversion {
                font-size: 1.5rem;
                font-style: italic;
            }
        }
    }
    @media (max-width: 1000px) {
        .basic-container {
            display: flex;
            flex-direction: column;
            align-items: top;
            gap: 1rem;
            width: 100%;
            height: auto;
            margin-bottom: rem;
        }
        .metric {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: auto;
            gap: 0;
            margin: 0;
            text-align: center;
            & .value {
                font-size: 2rem;
            font-weight: 600;
            }
            & .label {
                font-size: 1.5rem;
            }
            & .conversion {
                font-size: 1.5rem;
                font-style: italic;
            }
        }
    }
</style>

