<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { fade, slide } from 'svelte/transition';
    import { pb } from '$lib/pocketbase';
    import { Atom, BadgeCheck, Camera, Currency, Globe, History, LogOutIcon, Mail, MapPinned, SquareUserRound } from 'lucide-svelte';
    import { currentUser } from '$lib/pocketbase';
    import { createEventDispatcher } from 'svelte';
    import type { User } from '../../types/accounts';
	import Dropdown from '$lib/containers/Dropdown.svelte';
    import {
        countries,
        timezones,
        currencies,
        currentCountry,
        currentTimezone,
        currentCurrency,
    } from '../../stores/preferences.store'
    import {
	handleCountryChange,
        handleCurrencyChange,
        handleTimezoneChange
    } from '../../clients/preferenceClient'

    export let user: any;
    export let onClose: () => void;


    let isEditing = false;
    let editedUser = user ? { ...user } : {} as Partial<User>; 
    const dispatch = createEventDispatcher();

    function toggleEdit() {
        isEditing = !isEditing;
    }

    async function saveChanges() {
        try {
            if (user && user.id) {
                await pb.collection('users').update(user.id, editedUser);
                user = { ...editedUser };
                isEditing = false;
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }

    function handleOutsideClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    async function logout() {
        try {
            await pb.authStore.clear();
            currentUser.set(null);
            dispatch('logout');
            onClose();
        } catch (err) {
            console.error('Logout error:', err);
        }
    }


</script>


<div class="modal-overlay" on:click={handleOutsideClick} transition:fade={{ duration: 300 }}>
    <div class="modal-content" on:click|stopPropagation>
        <button class="logout-button" on:click={logout} transition:fade={{ duration: 300 }}>
            <LogOutIcon size={24} />
            <span>Logout</span>
        </button>
        {#if $currentUser}
        <div class="profile-header">
                <div class="avatar-container">
                    {#if user.avatar}
                        <img src={pb.getFileUrl(user, user.avatar)} alt="User avatar" class="avatar" />
                    {:else}
                    <img src={pb.getFileUrl(user, user.avatar)} alt="User avatar" class="avatar" />

                    {/if}
                </div>
 
                <div class="profile-info">
                <div class="info-row">
                    <!-- <span class="label"></span> -->
                    <span class="id">
                        {user.firstName}
                    </span>
                    <span class="id">
                        {user.lastName}
                    </span>
                </div>


                <div class="dropdown-section">
                    <span class="label">
                        <MapPinned/>
                    </span>  
                    <span class="label">
                        <Dropdown
                            options={countries}
                            selectedValue={get(currentCountry)} 
                            on:select={handleCountryChange}
                        />
                    </span>                      
                </div>   
                <!-- <div class="info-row">
                    <span class="label">
                        <MapPinned/>
                    </span>                     
                    <span>{user.residence}</span>
                </div>    -->
                <div class="dropdown-section">
                    <span>Timezone</span>

                    <span class="label">
                        <Dropdown
                            options={timezones}
                            selectedValue={get(currentTimezone)} 
                            on:select={handleTimezoneChange}
                        />
                    </span>                      
                </div>   
                <div class="dropdown-section">
                    <span>Base Currency</span>

                    <Dropdown
                        options={currencies}
                        selectedValue={get(currentCurrency)} 
                        on:select={handleCurrencyChange}
                    />
                </div>

                <!-- <div class="info-row">
                    <span class="label">
                        <Currency/>
                    </span>                    
                    <span>{user.defaultCurrency}</span>
                </div>    -->
                </div>  
                 
                <div class="profile-info">
                    <div class="info-row">
                        {#if isEditing}
                            <input bind:value={editedUser.name} />
                        {:else}
                            <span class="label">
                                <SquareUserRound/>
                            </span>
                            <span>{user.name || 'Not set'}</span>
                        {/if}
                    </div> 
                    <div class="info-row">
                        <span class="label">
                            <Mail/>
                        </span>
                        <span>{user.email}</span>
                    </div>   


                <div class="info-row">
                    <span class="label">
                        <Atom/>
                    </span>
                    <span>{new Date(user.created).toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="label">
                        <History/>
                    </span>
                    <span>{new Date(user.updated).toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="label">
                        <BadgeCheck/>
                    </span>                    
                    <span>{user.verified ? 'Yes' : 'No'}</span>
                </div>
 
 
                </div>  
            </div>

            <div class="actions">
                {#if isEditing}
                    <button on:click={saveChanges}>Save</button>
                    <button on:click={toggleEdit}>Cancel</button>
                {:else}
                    <button on:click={toggleEdit}>Edit</button>
                {/if}
                <button on:click={onClose}>Close</button>
            </div>
        {:else}
            <div class="no-user-message">
                <p>No user information available.</p>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
    }      
    
    .modal-overlay {
        position: fixed;
        top: 4rem;
        left: 0;
        right: 0;
        bottom: auto;
        max-width: 100%;
        /* height: 100%; */
        /* background-color: rgba(0, 0, 0, 0.5); */
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        z-index: 1000;
        width: auto;
        display: flex;
        /* background-color: #131313; */
        color: #ffffff;
        /* border: 1px solid rgb(53, 53, 53); */
        border-radius: 20px;
        justify-content: center;
        align-items: center;
        /* gap: 20px; */
        /* height: 50px; */
        /* padding: 10px 20px; */


    }

    .modal-content {
        /* background: linear-gradient(
            to top, 
            rgba(70, 118, 114, 0.9) 0%,
            rgba(70, 118, 114, 0.85) 5%,
            rgba(70, 118, 114, 0.8) 10%,
            rgba(70, 118, 114, 0.75) 15%,
            rgba(70, 118, 114, 0.7) 20%,
            rgba(70, 118, 114, 0.65) 25%,
            rgba(70, 118, 114, 0.6) 30%,
            rgba(70, 118, 114, 0.55) 35%,
            rgba(70, 118, 114, 0.5) 40%,
            rgba(70, 118, 114, 0.45) 45%,
            rgba(70, 118, 114, 0.4) 50%,
            rgba(70, 118, 114, 0.35) 55%,
            rgba(70, 118, 114, 0.3) 60%,
            rgba(70, 118, 114, 0.25) 65%,
            rgba(70, 118, 114, 0.2) 70%,
            rgba(70, 118, 114, 0.15) 75%,
            rgba(70, 118, 114, 0.1) 80%,
            rgba(70, 118, 114, 0.05) 85%,
            rgba(70, 118, 114, 0) 100%
            ); */
        backdrop-filter: blur(40px);        
        padding: 2rem;
        border-radius: 20px;
        /* border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        /* border-bottom-left-radius: 8px; */
        border-bottom-right-radius: 8px;
        /* max-width: 100%; */
        border: 1px solid rgb(53, 53, 53);

        /* max-width: 500px; */
        width: 100vw;
        /* height: 100vh; */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .profile-header {
        display: flex;
        align-items: top;
        margin-bottom: 1rem;
        color: var(--text-color);
        height: 20rem;

    }

    .avatar-container {
        left: calc(50% - 4rem);
        right: calc(50% - 4rem);

        width: 14rem;
        height: 14rem;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 1rem;
    }

    .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #757575;
    }

    h2 {
        margin: 0;
        font-size: 1.5rem;
        color: white;

    }

    .dropdown-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: fit-content;
        justify-content: center;
        align-items: left;
        padding: 0.5rem 1rem;
        // border: 1px solid black;
        border-radius: 2rem;
    }

    .profile-info {
        margin: 0;
        color: white;
        display: flex;
        flex-direction: column;
        width: auto;
        gap: 1rem;
    }

    .info-row {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        position: relative;
        margin: 0;
        left: 0;
        right: 0;
        width: 20rem;
        flex-grow: 1;
        gap: 1rem;
        margin-bottom: 0.5rem;
        // padding: 1rem;
        color: var(--text-color);
        font-size: 1.5rem;
    }

    .label {
        font-weight: bold;
        width: auto;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    button:hover {
        opacity: 0.8;
    }

    .logout-button {
        display: flex;
        gap: 10px;
        position: absolute;
        right: 20px;
        top: 20px;
    }

    span {
        display: flex;
        gap: 1rem;
        color: var(--text-color);
        &.id {
            font-size: 2.5rem;
            display: flex;
            flex-direction: row;
            gap: 1rem;
        }
    }
</style>