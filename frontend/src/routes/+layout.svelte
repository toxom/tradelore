<script lang="ts">
    import { onMount, createEventDispatcher, tick } from 'svelte';
    import { pb, currentUser } from '$lib/pocketbase';
    import { fly, fade, slide, scale, crossfade } from 'svelte/transition';
    import { cubicOut, quintOut } from 'svelte/easing';
    import { X, Calculator, Camera, Bell, MapPin, CircleX, LogIn, User, LogOut, MessageCircle, Filter, FilterX, Compass, ArrowBigUp, ArrowUp, Bot } from 'lucide-svelte';
	import { Moon, Sun, Sunset, Sunrise, Focus, Bold, Gauge, Key, Bone } from 'lucide-svelte';
    import { Wallet, Landmark, CreditCard, BarChart, PieChart } from 'lucide-svelte';
    import Notifications from '$lib/overlays/NotificationsOverlay.svelte';
    import Agents from '$lib/overlays/Agents.svelte';

    import Profile from '$lib/overlays/ProfileOverlay.svelte';
    import Auth from '$lib/overlays/Auth.svelte'
	import Landing from '$lib/overlays/Landing.svelte'
	import { t } from '../stores/translation.store';
	import { currentLanguage, languages } from '../stores/preferences.store';
	import { currentTheme } from '../stores/theme.store';
    import { goto } from '$app/navigation';
    import { drag } from '$lib/actions/drag';
	import Language from '@tabler/icons-svelte/icons/language';
	import Dropdown from '$lib/containers/Dropdown.svelte';
    import StyleSwitcher from '$lib/overlays/StyleSwitcher.svelte';
	import Footer from '$lib/containers/Footer.svelte';
    import ToggleAllButton from "$lib/buttons/ToggleAllButton.svelte"
    import { handleLanguageChange } from '../clients/languageClient'
    import {
        countries,
        timezones,
        currencies,
        currentCountry,
        currentTimezone,
        currentCurrency,
    } from '../stores/preferences.store'
    import { page } from '$app/stores';


	export let user: any;
	export let onClose: () => void;

	const currentLang = $currentLanguage;
	let showStyles = false;
    let visible = true;
	let currentStyle = '';
	let showNotifications = false;
    let showAgents = false;

	let showLanguageNotification = false;
	let selectedLanguageName = '';
	let placeholderText = '';

    let activeLink = '/'; 
    let overlayState = {
        notifications: false,
        agents: false,
        reports: false,
        navigator: false,
        auth: false,
		styles: false 
    };

    let showAuth = false;
    let showProfile = false;
    let dragDistance = 0; 
    let isToggled = false;

    const [send, receive] = crossfade({
        duration: 400,
        fallback(node) {
            return scale(node, { 
                start: 0.8, 
                opacity: 0,
                duration: 300,
                easing: quintOut 
            });
        }
    });

    let activeView = '/dashboard'; 

    async function navigateWithTransition(path) {
        if (activeView === path) return; 
        
        const previousView = activeView;
        activeView = path;
        
        setTimeout(() => {
            goto(path);
        }, 200); 
    }

    $: if ($page) {
        activeView = $page.url.pathname;
    }

	const dispatch = createEventDispatcher();

    function toggleAuthOrProfile() {
        isToggled = !isToggled;
        if ($currentUser) {
            showProfile = !showProfile;
            showAuth = false;
        } else {
            showAuth = !showAuth;
            showProfile = false;
        }
    }

 function handleAuthSuccess() {
        showAuth = false;
    }


	function handleStyleChange(event: CustomEvent) {
        const { style } = event.detail;
        currentTheme.set(style);
        toggleOverlay('styles'); 
    }


	function toggleOverlay(overlayName: keyof typeof overlayState, exclusive: boolean = true) {
    if (exclusive) {
        // Close all other overlays first
        Object.keys(overlayState).forEach(key => {
            if (key !== overlayName) {
                overlayState[key] = false;
            }
        });
    }

    overlayState[overlayName] = !overlayState[overlayName];

    if (!overlayState[overlayName]) {
        activeLink = ''; 
    } else {
        activeLink = overlayName; 
    }
}
    function handleOverlayClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            showAuth = false;
            showProfile = false;
			showStyles = false;
			showNotifications = false;
            showAgents = false;
			activeLink = ''; 
        }
    }
	function handleOutsideClick(event: MouseEvent) {
    const target = event.target as Element;
    
    if (overlayState.notifications && 
        !target.closest('.sidenav-notifications') && 
        !target.closest('.nav-link[data-overlay="notifications"]')) {
        overlayState.notifications = false;
    }
    if (overlayState.agents && 
        !target.closest('.sidenav-agetns') && 
        !target.closest('.nav-link[data-overlay="agents"]')) {
        overlayState.agents = false;
    }
    
    // Check if styles is open and click is outside
    if (overlayState.styles && 
        !target.closest('.sidenav-styles') && 
        !target.closest('.nav-link[data-overlay="styles"]')) {
        overlayState.styles = false;
    }
}
	function toggleStyles() {
		showStyles = !showStyles;
	}

	function handleStyleClose() {
        toggleOverlay('styles'); 
	}

    function handleModalDragStart(distance: number) {
        console.log('Modal Drag Started, Distance:', distance);
        if (distance > 10) { 
            console.log("Opening modal");
            toggleAuthOrProfile(); 
        }
    }
    function handleDragStart(event: CustomEvent) {
        dragDistance = event.detail.distance; 
    }
</script>


<div class="container" on:click={handleOutsideClick}>

	<header >
		<span class='logo'>
			<Compass/>
			<h1>
                {$t('nav.title')}
            </h1>
		</span>
		<div class="nav-links" transition:fly={{ y: 20, duration: 0 }}>
            {#if $currentUser}
            <button 
                class="nav-link"
                class:active={activeView === '/dashboard'}
                on:click={() => navigateWithTransition('/dashboard')}
            >
                <div in:receive={{key: 'wallet'}} out:send={{key: 'wallet'}}>
                    <Wallet size={20} />
                    <span>{$t('nav.wallet')}</span>
                </div>
            </button>
            <button 
                class="nav-link"
                class:active={activeView === '/trading'}
                on:click={() => navigateWithTransition('/trading')}
            >
                <div in:receive={{key: 'trade'}} out:send={{key: 'trade'}}>
                    <BarChart size={20} />
                    <span>{$t('nav.trade')}</span>
                </div>
            </button>          
            <button 
                class="nav-link" 
                class:active={overlayState.notifications} 
                data-overlay="notifications"
                on:click|stopPropagation={() => toggleOverlay('notifications')}
            >
                <Bell size={20} />
            </button>
            <button 
                class="nav-link" 
                class:active={overlayState.agents} 
                data-overlay="agents"
                on:click|stopPropagation={() => toggleOverlay('agents')}
            >
                <Bot size={20} />
            </button>
            {:else}
			<StyleSwitcher />
			<Dropdown
				options={languages}
				selectedValue={currentLang}
				on:select={handleLanguageChange}
			/>
			{/if}

			<button 
                class="nav-link" 
                on:click={toggleAuthOrProfile} 
                transition:fly={{ y: -200, duration: 300}}>
				{#if $currentUser}
						<div class="avatar-container">
							{#if $currentUser.avatar}
								<img src={pb.getFileUrl($currentUser, $currentUser.avatar)} alt="User avatar" class="avatar" />
							{:else}
								<div class="avatar-placeholder">
									<Camera size={24} />
								</div>
							{/if}
						</div>
						<span class="user-name">{$currentUser.name || $currentUser.email}</span>

				{:else}
					<LogIn size={24} />
					<span>{$t('nav.login')}</span>
				{/if}
			</button>
		</div>
	</header>

    <div class="page-container">
        {#key $page.url.pathname}
            <main in:fade={{ duration: 250, delay: 150 }} out:fade={{ duration: 150 }}>
                <slot />
            </main>
        {/key}
    </div>
	<div class="overlays-container" class:notifications-open={overlayState.notifications}>
		{#each Object.entries(overlayState) as [overlayName, isVisible]}
			{#if isVisible && overlayName !== 'notifications'}
				<div class="overlay" on:click|self={() => toggleOverlay(overlayName)}>
					
				</div>
			{/if}
		{/each}
	</div>
	{#if showAuth}
	<div class="auth-overlay" on:click={handleOverlayClick}  transition:fly={{ y: -200, duration: 300}} >
		<div class="auth-content" transition:fly={{y: 200, duration: 300}}>
			<button class="close-button" transition:fly={{ y: -200, duration: 300}} on:click={() => showAuth = false}>
				<ArrowUp  size={40} />
			</button>
			<Auth on:success={handleAuthSuccess} />
		</div>
	</div>
	{/if}
	{#if showProfile}
	<div class="profile-overlay" on:click={handleOverlayClick}>
		<div class="profile-content" 
        in:scale={{ 
            start: 0.1,       
            easing: cubicOut,
            opacity: 0,
        }}
        out:scale={{ 
            start: 0.1,       
            easing: cubicOut, 
            opacity: 0,
            delay: 100,
        }}
        >
			<button class="close-button" on:click={() => showProfile = false}>
				<X size={24} />
			</button>
			<Profile 
				user={$currentUser} 
				userId={$currentUser ? $currentUser.id : null} 
				onClose={() => showProfile = false} 
			/>
		</div>
	</div>
	{/if}
	{#if overlayState.notifications}
    <div 
        class="sidenav sidenav-notifications" 
        on:click|stopPropagation={() => {}}
        transition:fly={{ x: 50, duration: 300 }}
    >
        <Notifications />
        <button class="close-button" on:click={() => toggleOverlay('notifications')}>
            <CircleX size={20} />
        </button>
    </div>
    {/if}
    {#if overlayState.agents}
    <div 
        class="sidenav sidenav-agents" 
        on:click|stopPropagation={() => {}}
        transition:fly={{ x: 50, duration: 300 }}
    >
        <Agents />
        <button class="close-button" on:click={() => toggleOverlay('notifications')}>
            <CircleX size={20} />
        </button>
    </div>
    {/if}
    {#if overlayState.styles}
    <div 
        class="sidenav sidenav-styles"
        on:click|stopPropagation={() => {}}
        transition:fly={{ x: 50, duration: 300 }}
    >
        <StyleSwitcher />
        <button class="close-button" on:click={() => toggleOverlay('styles')}>
            <CircleX size={20} />
        </button>
    </div>
    {/if}
    {#if $currentUser}
    {:else}
    <Footer/>

    {/if}
  </div>
  {#if showStyles}
  <div
	  class="style-overlay"
	  on:click={handleOverlayClick}
	  transition:fly={{ x: -200, duration: 300 }}
  >
	  <div
		  class="style-content"
		  on:click={handleOverlayClick}
		  transition:fly={{ x: -20, duration: 300 }}
	  >
		  <StyleSwitcher on:close={handleStyleClose} on:styleChange={handleStyleChange} />
	  </div>
  </div>
{/if}


  <style lang="scss">
        @use "src/styles/themes.scss" as *;

    /* :global(.loading-spinner) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    } */

    *  {
		top: 0;
		font-family:var(--font-family);
    }


    
    button.close-button {
        background: transparent;
        border: none;
        color: var(--text-color);
        width: 4rem;
        height: 4rem;
        display: flex;
    }
	main {
        background: var(--bg-gradient);
		margin: 0;
		padding: 0;
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.container {
		width: 100%;
}

    .auth-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px); /* For Safari support */
        display: flex;
        justify-content: center;
        align-items: center;
        
        z-index: 1000;
    }


    .auth-content {
        position: fixed;
        background: transparent;
        display: flex;
        flex-direction: column;
		top: 33%;
        bottom: 33%;
        width: 100%;
        height: auto;
        overflow-y: auto;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
    }

header {
    display: flex;
    flex-direction: row;
    position: fixed;
    // max-width: 1600px; 
    top: 0;
    left: 0;
    right: 0;
    // left: 50%; 
    // transform: translateX(-50%); 
    width: auto; 
    margin: 0;
    // background: var(--bg-color);
    backdrop-filter: blur(40px);
    justify-content: space-around;
    align-items: center;
    height: 4rem;
    transition: all 0.3s ease;
    user-select: none;
    z-index: 1000;
	border-bottom: 1px solid var(--secondary-color);
	& h1 {
        font-size: 30px;
		color: var(--text-color);
		background-color: transparent;
	}
	}
    .illustration {
            position: absolute;
            width: 60%;
            height: auto;
            left: 20%;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.025;
            z-index: 1;
            pointer-events: none;
        }
	.nav-links {
		display: flex;
		gap: 20px;
		align-items: center;
		justify-content: center;
		margin-right: 2rem;
	}
	.nav-link {
        display: flex;
        gap: 8px;
        justify-content: center;
        color: var(--tertiary-color);
        align-items: center;
        border-radius: 10px;
        padding: 5px 10px;
        text-decoration: none;
        font-size: 16px;
        transition: all 0.3s ease;
        border: 1px solid;  
		border-color: var(--secondary-color);

        & .avatar-container {

            border-radius: 50%;
        }

    }
    .nav-link:hover {
        background-color: rgba(0, 0, 0, 0.05); 
        transform: translateY(-2px);
        color: white;
    }
    .nav-link.active {
        background-color: var(--bg-color); 
        color: var(--text-color);
        border-color: var(--primary-color);
    }

    footer {
	  color: var(--text-color);
	  text-align: center;
	  justify-content: center;
	  align-items: center;
	  width: 100%;
	  position: fixed;
	  bottom: 0;
	  height: 0;
	}
    .overlays-container {
        position: fixed;
        top: 54px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        transition: right 300ms ease;
    }
    .overlays-container.open {
        right: 300px; 
    }
    .sidenav {
        position: relative;
        margin-top: auto;
        right: 0;
        bottom: 0;
        width: 400px;
		background: var(--bg-gradient-left);
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;

        &.sidenav-agents {
            background-color: red !important;
        }
    }
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content {
        height: 98%;
        width: 98%;
        border-radius: 50px;
        overflow: auto;
    }
	button {
		background-color: var(--bg-color);
	}

    .sidenav {
        position: fixed;
        top: 4rem;
        right: 0;
        bottom: 4.5rem;
        max-width: 800px;
        width: auto;
		border-top-left-radius: 2rem;
		border-bottom-left-radius: 2rem;
        box-shadow: -2px 0 5px rgba(219, 7, 7, 0.1);
        overflow-y: auto;
    }
	span.logo {
		display: flex;
		flex-direction: row;
		height: 50px;
		margin: 0;
		gap: 1rem;
		margin-left: 2rem;
		justify-content: center;
		align-items: center;
		color: var(--text-color);
	}

    .user-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .avatar-container {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
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
        color: var(--tertiary-color);
    }
    span {
        background-color: transparent;
    }

    .profile-content {
        transform-origin: top right;
    }

    @media (max-width: 768px) {

        header {
            display: flex;
            flex-direction: row;
            position: fixed;
            // max-width: 1600px; 
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            // left: 50%; 
            // transform: translateX(-50%); 
            width: auto; 
            margin: 0;
            // background: var(--bg-color);
            backdrop-filter: blur(40px);
            justify-content: space-around;
            align-items: center;
            height: 4rem;
            transition: all 0.3s ease;
            user-select: none;
            z-index: 1000;
            border-bottom: 1px solid var(--secondary-color);
        }
        span.logo {                
        display: none;
            h1 {
                display: none;
            }
        }
        .user-name {
            display: none;
        }
    }

  </style>