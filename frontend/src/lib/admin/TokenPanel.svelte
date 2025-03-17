<script lang="ts">
    import { onMount } from 'svelte';
    import { pb } from '$lib/pocketbase';
    import type { Token } from 'types/walletTypes';
        // import CoinGecko from 'coingecko-api';
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

    } from 'clients/tokenClient'
 


    async function handleToggleActive(token: Token) {
        try {
            await pb.collection('tokens').update(token.id, { isActive: !token.isActive }, {
                headers: {
                    Authorization: pb.authStore.token,
                },
            });
            await fetchTokens();
        } catch (error) {
            console.error('Failed to toggle token status:', error);
            // errorMessage = 'Failed to toggle token status. Check your permissions.';
        }
    }


onMount(async () => {
        try {
            await fetchTokens();
        } catch (error) {
            console.error('Error during onMount:', error);
        }
    });
</script>

{#if errorMessage}
    <div class="error">
        {errorMessage}
    </div>
{/if}

<div class="panel-container">
    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {/if}

    <div class="toolbar">
        <form on:submit|preventDefault={handleAddToken}>

            <div class="row-input">
                <h3>Token List</h3>
                <div class="row-input-stack">

                <label for="tokenId">Add Token:</label>
                <input type="text" id="tokenId" placeholder="e.g. tether" bind:value={newToken.tokenId} />
                <button type="submit">+</button>
                </div>

            </div>
        </form>
    </div>

    {#if isEditing && editingToken}
        <div>
            <h3>Edit Token</h3>
            <form on:submit|preventDefault={handleUpdateToken}>
                <div>
                    <label for="editSymbol">Symbol:</label>
                    <input type="text" id="editSymbol" bind:value={editingToken.ticker} />
                </div>
                <button type="submit">Update Token</button>
                <!-- <button type="button" on:click={() => (isEditing = false)}>Cancel</button> -->
            </form>
        </div>
    {/if}

    <table>
        <thead>
            <tr>
                <th>Token</th>
                <th></th>
                <th></th>
                <th>Network</th>
                <th>Contract Address</th>
                <th>Decimals</th>
                <th>Active</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each tokens as token (token.id)}
                <tr>
                    <td><img src={token.iconUrl} alt={token.name} width="32" /></td>
                    <td>{token.name}</td>
                    <td>{token.ticker}</td>

                    <td>{token.network}</td>
                    <td>{token.contract_address}</td>
                    <td>{token.decimal_place}</td>
                    <td>{token.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button on:click={() => handleEditToken(token)}>Edit</button>
                        <button on:click={() => handleToggleActive(token)}>
                            {token.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
    }   

    .panel-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        height: auto;
        top: 0;
        left: 0;
        right: 0;

        h3 {
            font-size: 2rem;
        }
        
    }

    form {
        background:transparent;
        width:900px;
    }

    .row-input-stack {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
    
    .toolbar {
        background-color: var(--primary-color);
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: auto;
    }
    .row-input {
        background: var(--primary-color);
        color: var(--text-color);
        display: flex;
        flex-direction: row;
        left: 0;
        
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 1rem;
        border-radius: 2rem;
        gap: 1rem;
        margin-bottom: 1rem;

        & label {
            font-size: 1.5rem;
        }

        & input {
            width: auto;
            border-radius: 2rem;
            font-size: 1.5rem;

        }


        & button {
            background: var(--secondary-color);
            border: 1px solid var(--primary-color);
            font-size: 2rem;
            width: 4rem;
            height: 4rem;
            border-radius: 50%;
            transition: all 0.3s ease;

            &:hover {
                background: var(--primary-color);
                border: 1px solid var(--secondary-color);
                color: green;
            }
        }

    }

  
</style>
    