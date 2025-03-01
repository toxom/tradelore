<script lang="ts">
    import { onMount, createEventDispatcher, tick } from 'svelte';
    import { pb } from '$lib/pocketbase';
    import { fly, fade, slide } from 'svelte/transition';
    import { X, Calculator, Camera, Bell, MapPin, CircleX, LogIn, User, LogOut, MessageCircle, Filter, FilterX, Compass } from 'lucide-svelte';
	import { Moon, Sun, Sunset, Sunrise, Focus, Bold, Gauge, Key, Bone } from 'lucide-svelte';
    import Notifications from '$lib/overlays/NotificationsOverlay.svelte';
    import Profile from '$lib/overlays/ProfileOverlay.svelte';
    import { currentUser } from '$lib/pocketbase';
    import Auth from '$lib/overlays/Auth.svelte'
	import Landing from '$lib/overlays/Landing.svelte'
	import { t } from '../stores/translation.store';
	import { currentLanguage, languages, setLanguage } from '../stores/language.store';
	import { currentTheme } from '../stores/theme.store';
    import { goto } from '$app/navigation';
	import Language from '@tabler/icons-svelte/icons/language';
	import Dropdown from '$lib/containers/Dropdown.svelte';
	import Footer from '$lib/containers/Footer.svelte';
	import StyleSwitcher from '$lib/overlays/StyleSwitcher.svelte';

	export let user: any;
	export let onClose: () => void;

	const currentLang = $currentLanguage;
	let showStyles = false;
	let currentStyle = '';
	let showNotifications = false;
	let showLanguageNotification = false;
	let selectedLanguageName = '';
	let placeholderText = '';

    let activeLink = '/'; 
    let overlayState = {
        notifications: false,
        reports: false,
        navigator: false,
        auth: false,
		styles: false 
    };

    let showAuth = false;
    let showProfile = false;

	const dispatch = createEventDispatcher();
	const styles = [
		{ name: 'Daylight Delight', value: 'default', icon: Sun },
		{ name: 'Midnight Madness', value: 'dark', icon: Moon },
		{ name: 'Sunrise Surprise', value: 'light', icon: Sunrise },
		{ name: 'Sunset Serenade', value: 'sunset', icon: Sunset },
		{ name: 'Laser Focus', value: 'focus', icon: Focus },
		{ name: 'Bold & Beautiful', value: 'bold', icon: Bold },
		{ name: 'Turbo Mode', value: 'turbo', icon: Gauge },
		{ name: 'Bone Tone', value: 'bone', icon: Bone }
	];
    export async function handleLanguageChange() {
		showLanguageNotification = true;

		const currentLang = $currentLanguage;
		const currentIndex = languages.findIndex((lang) => lang.code === currentLang);
		const nextIndex = (currentIndex + 1) % languages.length;
		const nextLanguage = languages[nextIndex];

		await setLanguage(nextLanguage.code);
		selectedLanguageName = nextLanguage.name;

		await tick();

		setTimeout(() => {
			showLanguageNotification = true;
		}, 0);
		setTimeout(() => {
			showLanguageNotification = false;
		}, 600);
	}
    function toggleAuthOrProfile() {
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

	async function handleLogout() {
		try {
			await pb.authStore.clear();
			currentUser.set(null);
			dispatch('logout');
			onClose();
			goto('/');
		} catch (err) {
			console.error('Logout error:', err);
		}
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

</script>


<div class="container" on:click={handleOutsideClick}>

	<header>
		<span class='logo'>
			<Compass size={40} />
			<h1>
				Magellan
			</h1>
		</span>
		<div class="nav-links" transition:fly={{ y: 50, duration: 300 }}>
			<button 
			class="nav-link" 
			class:active={overlayState.notifications} 
			data-overlay="notifications"
			on:click|stopPropagation={() => toggleOverlay('notifications')}
			>
				<Bell size={20} />
			</button>
			<StyleSwitcher />
			<Dropdown
				options={languages}
				selectedValue={currentLang}
				on:select={handleLanguageChange}
			/>
			<button class="nav-link" on:click={toggleAuthOrProfile} transition:fly={{ y: -200, duration: 300}}>
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

	<main>
		<slot />
	</main>
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
				<X size={24} />
			</button>
			<Auth on:success={handleAuthSuccess} on:logout={handleLogout} />
		</div>
	</div>
	{/if}
	{#if showProfile}
	<div class="profile-overlay" on:click={handleOverlayClick} transition:fly={{ y: -200, duration: 300 }}>
		<div class="profile-content" transition:fly={{ y: -200, duration: 300 }}>
			<button class="close-button" on:click={() => showProfile = false}>
				<X size={24} />
			</button>
			<Profile 
				user={$currentUser} 
				userId={$currentUser ? $currentUser.id : null} 
				onClose={() => showProfile = false} 
				on:logout={handleLogout} 
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
	<Footer/>
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
		font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

	main {
        background: var(--bg-gradien);
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
		top: 7rem;
        width: 100%;
        height: auto;
        overflow-y: auto;
    }
header {
    display: flex;
    flex-direction: row;
    position: fixed;
    // max-width: 1600px; 
    top: 0;
    // left: 50%; 
    // transform: translateX(-50%); 
    width: 100%; 
    justify-content: space-between;
    align-items: center;
    height: 4rem;
    transition: all 0.3s ease;
    user-select: none;
    z-index: 2000;
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
		background-color: transparent;
	}
	.nav-link {
        display: flex;
        gap: 8px;
        justify-content: center;
		background: var(--primary-color);
		color: var(--text-color);
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
        color: var(--tertiary-color);
        border-color: var(--primary-color);
        font-weight: bold;
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
        top: 4.5rem;
        right: 0;
        bottom: 4.5rem;
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
    .close-button {
        position: absolute;
        color: red;
        border-radius: 50%;
        top: 10px;
        right: 10px;
        background-color: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
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

    @media (max-width: 768px) {
        span.logo {
            h1 {
                display: none;
            }
        }
        .user-name {
            display: none;
        }
    }

  </style>