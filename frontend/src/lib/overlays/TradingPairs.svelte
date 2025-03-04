<script lang="ts">
    import { Search, Star } from 'lucide-svelte';

    let activeTab = false;
    const tabs = ['BTC', 'ETH', 'USDT', 'Favorites'];


    const assets = [
        { coin: 'CET', price: 0.00010992, value: 58469.55860, favorite: false },
        { coin: 'ETH', price: 0.61170550, value: 27438.33119, favorite: true },
        { coin: 'BTC', price: 8.63802050, value: 22889.27021, favorite: false },
        { coin: 'LTC', price: 0.10839772, value: 8404.589251, favorite: false },
        { coin: 'USDT', price: 0.00008900, value: 7368.329999, favorite: true },
        { coin: 'ETC', price: 0.02154150, value: 6119.991649, favorite: false },
        { coin: 'CTXC', price: 0.00152000, value: 4578.653269, favorite: false },
        { coin: 'CDY', price: 0.00000725, value: 2897.176052, favorite: false },
        { coin: 'XRP', price: 0.00062200, value: 2368.098247, favorite: false },
        { coin: 'LOOM', price: 0.00022997, value: 2276.314443, favorite: false },
        { coin: 'KAN', price: 0.00002541, value: 1793.703088, favorite: false },
        { coin: 'DOGE', price: 0.00000327, value: 1722.615329, favorite: false },
        { coin: 'EOS', price: 0.01089758, value: 953.2252987, favorite: false },
        { coin: 'NEO', price: 0.04397070, value: 671.5878210, favorite: false },
        { coin: 'BTM', price: 0.00050292, value: 359.6440168, favorite: false },
    ];

    $: filteredAssets = activeTab
        ? activeTab === 'Favorites'
            ? assets.filter((asset) => asset.favorite) 
            : assets.filter((asset) => asset.coin === activeTab) 
        : assets; 

    // Function to handle tab clicks
    const handleTabClick = (tab: string) => {
        if (activeTab === tab) {
            activeTab = null; // Unselect the tab if it's already active
        } else {
            activeTab = tab; // Set the active tab
        }
    };

</script>

<div class="container">
    <div class="controls">
        <div class="search-box">
            <Search />
            <input 
                type="text" 
                placeholder="Search..."
            />
        </div>
        <div class="tabs">
            {#each tabs as tab}
                <button
                    class="tab {activeTab === tab ? 'active' : ''}"
                    on:click={() => handleTabClick(tab)}
                >
                    {#if tab === 'Favorites'}
                        <Star size="16" />
                    {/if}
                    {tab}
                </button>
            {/each}
        </div>


    </div>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Coin</th>
                    <th>Price</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredAssets as asset}
                    <tr>
                        <td class="coin">{asset.coin}</td>
                        <td class="price">{asset.price.toFixed(8)}</td>
                        <td class="value">{asset.value.toFixed(5)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>


</div>
<div>

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

    .container {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        left: 0;
        min-width: 300px;
        overflow-x: hidden;
 
    }


    .controls {
        display: flex;
        flex-direction: row;
        position: absolute;
        left: 1rem;
        right: auto;
        bottom: 1rem;
        // background: var(--bg-gradient);
        // border-radius: 1rem;

        gap: 1rem;
        width: auto;
        z-index: 10;
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 0;
        padding: 0.5rem;

        border-radius: 1rem;
        background: white;
        height: 2rem;
        margin-top: 0.5rem;
        margin-right: 0.5rem;
        flex: 1;
        color: var(--secondary-color);

        input {
            border: none;
            width: 300px;
            outline: none;
            font-size: 1rem;
            border-radius: 1rem;
            margin-left: 1rem;
            padding: 0.5rem 1rem;
        }

    }

    .tabs {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        gap: 0;
        margin-top: 0.5rem;
        margin-left: 0;
        margin-bottom: 0;
        bottom: 1rem;
        width: auto;
        padding: 0;
    }

    .tab {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: transparent;
        gap: 0.5rem;
        padding: 1rem;
        width: auto;
        border: none;
        color: var(--tertiary-color);
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: background-color 0.2s;

        &:hover {
            background-color: var(--secondary-color);
            color: var(--text-color);
        }

        &.active {
            background-color: var(--tertiary-color);
            color: var(--text-color);
            font-weight: 800;
        }
    }


    .table-container {
        width: auto;
        display: flex;
        flex-direction: column;
        position: absolute;
        bottom: 4rem;
        top: 0;
        left: 0;
        right: 0;
        border-collapse: collapse;
        overflow-x: hidden;


        &.static {
            position: sticky;
            top: 3rem;
            margin-top: 1rem;
            justify-content: left;
            display: flex;
            height: 3rem;
            margin-bottom: 1rem;

        }
 


        .table-container .coin {
        font-weight: 500;
    }

    .table-container .price {
        color: #28a745; /* Green for price */
    }

    .table-container .value {
        color: #666;
    }


        table {
            margin-left: 1rem;
            border-collapse: collapse;

            & thead {
                height: 3rem;
                
            }

            & tbody {
                // background: var(--primary-color);


            }


            & tbody tr {
                transition: 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
                &:hover {
                background:var(--bg-gradient-right);
                color: var(--tertiary-color);
                font-size: 2rem;
                cursor: pointer;

            }
        


        }



            th, td {
                padding: 0.75rem 0.5rem;
                text-align: left;
                border-bottom: 1px solid var(--primary-color);
                border-left: none;
                height: 2.5rem;
            }

            td.coin {
                font-weight: 800;
                letter-spacing: 0.25rem;
                width: 100px;
                text-align: left;
                border-right: 1px solid var(--tertiary-color);

            }
            td.price {
                letter-spacing: 0.25rem;
                width: 300px;
                text-align: left;
                border-right: 1px solid var(--tertiary-color);

            }
            td.value {
                letter-spacing: 0.25rem;
                width: auto;
                text-align: left;
                border-right: 1px solid transparent;
            }

            th {
                position: sticky;
                top: 0;
                color: var(--text-color);
                font-weight: 200;
                height: 3rem;
                padding: 0.5rem;
        background: transparent !important;
                border-bottom: 1px solid var(--secondary-color);
            }
        }
    }


    /* Scrollbar styling */
    .table-container {
        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    }
</style>