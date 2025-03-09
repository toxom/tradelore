<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { fade, slide } from 'svelte/transition';
    import { drag } from '$lib/actions/drag';
    import { t } from 'stores/translation.store';
    import { pb } from '$lib/pocketbase';
    import { Atom, BadgeCheck, Camera, Currency, Edit, Globe, History, LogOutIcon, Mail, MapPinned, SquareUserRound, UserCheck2Icon, X } from 'lucide-svelte';
    import { UserRound, Settings, Lock, ShieldAlert } from 'lucide-svelte';

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
    } from 'stores/preferences.store'
    import {
	handleCountryChange,
        handleCurrencyChange,
        handleTimezoneChange
    } from 'clients/preferenceClient'
    import TokenPanel from '../admin/TokenPanel.svelte'
    import TabSelector from '$lib/containers/TabSelector.svelte';
    import WalletForm from '$lib/overlays/WalletForm.svelte';
    import Security from '$lib/auth/Security.svelte';
    export let user: any;
    export let onClose: () => void;
    import {
        toggleAll,
        allToggled,
        overlayStateTrade,
        toggleExpand,
        handleBackdropClick,
        handleMouseEnter,
        handleMouseLeave,
        isModalOpen,
        closeModal,
        modalPosition
    } from "$lib/actions/toggling";
    const dispatch = createEventDispatcher();
    const tabIcons = [UserRound, Settings, Lock, ShieldAlert];

    let activeTab = $t('nav.profileTabs.id');
    let isEditing = false;
    let editedUser = user ? { ...user } : {} as Partial<User>; 
    let originalUser = { ...user };
    let editingField: string | null = null;
    let editingFields = { name: false, firstName: false, lastName: false };


    function toggleEdit(field: keyof typeof editingFields) {
        editingFields[field] = true;
    }
    function cancelEdit() {
        editedUser = { ...originalUser };
        editingFields = { name: false, firstName: false, lastName: false };
    }
    async function saveChanges() {
        try {
            if (user && user.id) {
                await pb.collection('users').update(user.id, editedUser);
                user = { ...editedUser };
                originalUser = { ...editedUser }; // Update original values
            }
            editingFields = { name: false, firstName: false, lastName: false };
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }
    function handleModalDragEnd(distance: number) {
        console.log('Modal Drag Ended, Distance:', distance);
        if (distance < -1000) {
            console.log("Closing modal");
            onClose(); 
        }
    }
    function handleOutsideClick(event: MouseEvent) {
        if ((event.target as HTMLElement).closest('.modal-content')) {
            return;
        }
        console.log('Clicked outside, closing modal');
        onClose();
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
    <div class="modal-content" on:click|stopPropagation
    use:drag={{ onDragEnd: handleModalDragEnd }}
    >
    <div class="actions">
        <button class="logout-button" on:click={logout} transition:fade={{ duration: 300 }}>
            <LogOutIcon />
            <span>           
                {$t('profile.logout')}          
            </span>
        </button>
        <button class="close-button" on:click={onClose}>
            <X />
        </button>
    </div>
    <div class="modal-header">
        <TabSelector
            tabs={[
            $t('nav.profileTabs.id'),
            $t('nav.profileTabs.preferences'),
            $t('nav.profileTabs.security'),
            $t('nav.profileTabs.admin')
            ]}
            tabIcons={tabIcons}
            bind:activeTab
            on:tabChange={(e) => { 
            activeTab = e.detail.tab; 
            console.log('Active tab:', activeTab); 
            }}
        />

    </div>

    <!-- Tab content -->
    <div class="tab-content">
        {#if activeTab === $t('nav.profileTabs.id')}
        <div class="column-content">
            <div class="avatar-container">
                {#if user.avatar}
                    <img src={pb.getFileUrl(user, user.avatar)} alt="User avatar" class="avatar" />
                {:else}
                <img src={pb.getFileUrl(user, user.avatar)} alt="User avatar" class="avatar" />
    
                {/if}
            </div>             
            <div class="profile-info">
                {#if editingFields.name || editingFields.firstName || editingFields.lastName}
                <div class="edit-actions">
                    <button on:click={saveChanges}> {$t('profile.save')}</button>
                    <button on:click={cancelEdit}> {$t('profile.close')}</button>
                </div>
            {/if}
                <div class="info-row2">
                    <div class="info-row">
                        <span class="label">{$t('forms.info.userName')}</span>
                        {#if editingFields.name}
                            <input bind:value={editedUser.name} />
                        {:else}
                            <span class="edit" on:click={() => toggleEdit('name')}>{user.name || 'Not set'}</span>
                        {/if}
                    </div>  
                <div class="info-row">
                    <span class="label">
                        <Mail/> {$t('forms.info.email')}
                    </span>
                    <span>{user.email}</span>
                </div> 
                </div>   
                <div class="info-row2">
                    <div class="info-row">
                        <span class="label">{$t('forms.info.firstName')}</span>
                        {#if editingFields.firstName}
                            <input bind:value={editedUser.firstName} />
                        {:else}
                            <span class="edit" on:click={() => toggleEdit('firstName')}>{user.firstName || 'Not set'}</span>
                        {/if}
                    </div>

                    <div class="info-row">
                        <span class="label">{$t('forms.info.lastName')}</span>
                        {#if editingFields.lastName}
                            <input bind:value={editedUser.lastName} />
                        {:else}
                            <span class="edit" on:click={() => toggleEdit('lastName')}>{user.lastName || 'Not set'}</span>
                        {/if}
                    </div>

            </div>   

  




        <div class="info-row2">

            <div class="info-row">
                <span class="label">
                    <BadgeCheck/> {$t('forms.info.verified')}
                </span>
                <span>{user.verified ? $t('forms.info.verifiedYes') : $t('forms.info.verifiedNo')}</span>
                    
            </div>
            <div class="info-row">
                <span class="label">
                    <UserCheck2Icon/> {$t('forms.info.role')}
                </span>
                <span>{user.role}</span>
                    
            </div>
            </div>
            <div class="info-row2">

                <div class="info-row">

                    <span class="label">
                        {$t('forms.info.residence')}
                    </span>                        
                        <Dropdown
                            options={countries}
                            selectedValue={get(currentCountry)} 
                            on:select={handleCountryChange}
                        />
                </div>    

                    <div class="info-row">

                    <span class="label">
                        {$t('forms.info.timezone')}
                    </span>
                        <Dropdown
                            options={timezones}
                            selectedValue={get(currentTimezone)} 
                            on:select={handleTimezoneChange}
                        />
                </div>    
            </div>    

                    <div class="info-row">

                    <span class="label">
                        {$t('forms.info.currency')}
                    </span>                        
                    <Dropdown
                        options={currencies}
                        selectedValue={get(currentCurrency)} 
                        on:select={handleCurrencyChange}
                    />
    
                </div>    
                <div class="info-row2">
                    <div class="info-row">
                        <span class="label">
                            <span> 
                                <Atom/> {$t('forms.info.created')}
                            </span>
                        </span>
                        {new Date(user.created).toLocaleString()}
                    </div>
                    <div class="info-row">
                        <span class="label">
                            <History/> {$t('forms.info.updated')}
                        </span>
                        <span>{new Date(user.updated).toLocaleString()}</span>
                    </div>
                </div>



            </div>  
        </div>

        {:else if activeTab === $t('nav.profileTabs.preferences')}
        <div class="column-content">
             
            </div>   
        {:else if activeTab === $t('nav.profileTabs.security')}
        <Security/>
        {:else if activeTab === $t('nav.profileTabs.admin')}
        <WalletForm />

        <TokenPanel />

        {/if}
    </div>


        {#if $currentUser}
        <div class="profile-header">

 
                <div class="profile-info">



  

                <!-- <div class="info-row">
                    <span class="label">
                        <Currency/>
                    </span>                    
                    <span>{user.defaultCurrency}</span>
                </div>    -->
                </div>  
                 

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
        transition: all 0.3s ease;


    }

    .modal-header {
        display: flex;
        flex-direction: row;
        height: auto;
        position: sticky;
        transition: all 0.3s ease;
        margin-bottom: 1rem;
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
        border-bottom-left-radius: 4rem; 
        border-bottom-right-radius: 4rem;       
        border-bottom: 1px solid var(--tertiary-color);
        padding: 0;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 4rem;
        width: 100%;
        height: 90vh;
        overflow-y: scroll;
    scrollbar-width:2px;
    scrollbar-color: var(--secondary-color) transparent;
    scroll-behavior: smooth; 
    transition: all 0.3s ease;
        /* height: 100vh; */
    }

    .tab-content {
        margin: 0;
        overflow-y: auto;
        height: auto;
        width: 100%;
        transition: all 0.3s ease;

    }

    .column-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: auto;
        width: 100%
        
    }

    input {
        padding: 1rem 0.5rem;
        border: 1px solid transparent;
        border-bottom: 1px solid var(--text-color);
        background: transparent;
        font-size: 1rem;
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
    .edit-actions {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        width: 100%;
        gap: 1rem;
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
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        position: relative;
        margin: 0;
        left: 0;
        right: 0;
        margin-top: 1rem;
        width: 100%;
        flex-grow: 1;
        gap: 0;
        margin-bottom: 0.5rem;
        // padding: 1rem;
        color: var(--text-color);
        font-size: 1.5rem;
        font-weight: bold;
        letter-spacing: 0.1rem;

        // & .id {
        // }

        span.label {
            width: 100%;
            flex-direction: row;
            justify-content: left;
            font-size: 1.2rem;
            font-weight: 300;
            padding-left: 0;

        }

        & span.edit {
            transition: all 0.3s ease;
            &:hover {
                background: var(--tertiary-color);
                color: var(--primary-color);
                cursor: pointer;
                letter-spacing: 0.4rem;
            }
        }
    }
    .info-row2 {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        position: relative;
        margin: 0;
        left: 0;
        right: 0;
        margin-top: 1rem;
        width: 100%;
        flex-grow: 1;
        gap: 2rem;
        margin-bottom: 0.5rem;
        // padding: 1rem;
        color: var(--text-color);
        font-size: 1.5rem;
        font-weight: bold;

        // & .id {
        // }

        & .label {
            width: 100%;
            flex-direction: row;
            justify-content: left;
            font-size: 1.2rem;
            font-weight: 300;


        }
    }

    .label {
        width: auto;
    }

    .actions {
        display: flex;
        justify-content: right;
        align-items: right;
        position: absolute;
        top: 0;
        right: 1rem;
        margin-right: 0;
        gap: 0.5rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    button:hover {
        opacity: 0.8;
    }



    span {
        display: flex;
        gap: 1rem;
        padding-left: 1rem;
        color: var(--text-color);
        transition: all 0.3s ease;

        &.id {
            font-size: 2.5rem;
            display: flex;
            flex-direction: row;
            gap: 1rem;
        }
        &.label {
            display: flex;
            width: 80vw;
        }
    }

    @media (max-width: 1000px) {
        .modal-content {
        }
        .modal-header {
            display: flex;
            flex-direction: row;
            height: auto;
            margin-top: 0;
        }

        .actions {
            top: 0;
            right: 0;
            justify-content: space-between;
            width: calc(100% - 2rem);
            gap: 2rem
        }

        .info-row2 {
            flex-direction: column;
        }

    }
    </style>