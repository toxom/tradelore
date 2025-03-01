<script lang="ts">
    // Sample data for user progress
    let totalBalance = 12500.75; // Total balance in USD
    let portfolioGrowth = 8.5; // Portfolio growth in percentage
    let recentActivity = [
        { type: 'Buy', coin: 'BTC', amount: 0.25, date: '2023-10-01' },
        { type: 'Sell', coin: 'ETH', amount: 1.5, date: '2023-10-02' },
        { type: 'Buy', coin: 'LTC', amount: 10, date: '2023-10-03' },
    ];
</script>

<div class="progress-tracker">

    <!-- Metrics -->
    <div class="metrics">
        <div class="metric">
            <div class="value">${totalBalance.toFixed(2)}</div>
            <div class="label">Total Balance</div>
        </div>
        <div class="metric">
            <div class="value">{portfolioGrowth.toFixed(1)}%</div>
            <div class="label">Portfolio Growth</div>
        </div>
    </div>

    <!-- Recent Activity -->
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
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }    .progress-tracker {
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        padding: 1rem;
        font-family: Arial, sans-serif;
    }

    .progress-tracker h2 {
        margin-top: 0;
        font-size: 1.5rem;
        color: #333;
    }

    .metrics {
        display: flex;
        gap: 2rem;
        margin-bottom: 1.5rem;
    }

    .metric {
        text-align: center;
    }

    .metric .value {
        font-size: 1.75rem;
        font-weight: 600;
        color: #28a745; /* Green for positive values */
    }

    .metric .label {
        font-size: 0.875rem;
        color: #666;
    }

    .recent-activity {
        margin-top: 1.5rem;
    }

    .recent-activity h3 {
        font-size: 1.25rem;
        color: #333;
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
</style>

