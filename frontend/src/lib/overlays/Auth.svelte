<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { pb, currentUser, checkPocketBaseConnection, updateUser, signIn } from '$lib/pocketbase';
    import { Camera, LogIn, UserPlus, LogOutIcon } from 'lucide-svelte';
    import Profile from '$lib/overlays/ProfileOverlay.svelte'
    import type { User } from 'types/accounts';
    import { ClientResponseError } from 'pocketbase';

    let email: string = '';
    let password: string = '';
    let errorMessage: string = '';
    let avatarUrl: string | null = null;
    let showProfileModal = false;

    const dispatch = createEventDispatcher();

    function handleAuthSuccess() {
        dispatch('success');
    }
    
    async function signUp() {
        try {
            const data = {
                email,
                password,
                passwordConfirm: password,
                name: 'username',
            };
            const createdUser = await pb.collection('users').create(data);
            await login();
        } catch (err) {
            console.error('Signup error:', err);
            errorMessage = err.message || 'An error occurred during signup';
        }
    }

    async function login() {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            currentUser.set(authData.record);
            errorMessage = '';
            dispatch('success');
            goto('/dashboard'); // Explicitly navigate to dashboard after login
        } catch (err) {
            console.error('Login error:', err);
            errorMessage = err.message || 'An error occurred during login';
        }
    }
    
    async function logout() {
        try {
            pb.authStore.clear();
            currentUser.set(null);
            dispatch('logout');
            
            // Force redirect to root and wait for it to complete
            await goto('/', { replaceState: true });
            
            // Optional: Force a page refresh to clear any cached state
            // window.location.href = '/';
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    function toggleProfileModal() {
        showProfileModal = !showProfileModal;
    }

    function updateAvatarUrl() {
        if ($currentUser && $currentUser.avatar) {
            avatarUrl = pb.getFileUrl($currentUser, $currentUser.avatar);
        }
    }

    $: if ($currentUser && $currentUser.avatar) {
        updateAvatarUrl();
    }
    
    onMount(async () => {
        const isConnected = await checkPocketBaseConnection();
        if (!isConnected) {
            errorMessage = 'Unable to connect to the server. Please try again later.';
        }
        if ($currentUser && $currentUser.id) {
            updateAvatarUrl();
        }
    });
</script>


<div class="auth-container">
    {#if $currentUser}
        <div class="user-info">
            <div class="avatar-container">
                {#if avatarUrl}
                    <img src={avatarUrl} alt="User avatar" class="avatar" />
                {:else}
                    <div class="avatar-placeholder">
                        <Camera size={24} />
                    </div>
                {/if}
            </div>
            <p class="welcome-message" on:click={toggleProfileModal}>
                <strong>{$currentUser.username || $currentUser.email}</strong>
            </p>
        </div>
        <!-- <button class="logout-button" on:click={logout}>
            <LogOutIcon size={24} />
            <span>Logout</span>
        </button> -->
    {:else}
        <div class="login-container">
            <form on:submit|preventDefault class="auth-form">
                <input
                    class="input"
                    type="email"
                    bind:value={email}
                    placeholder="Email"
                    required

                />
                <input
                    class="input"
                    type="password"
                    bind:value={password}
                    placeholder="Password"
                    required
                />
                <div class="button-group">
                    <button class="auth" on:click={login}>
                        <span>
                            <LogIn />
                            Login
                        </span>
                    </button>
                    <button class="auth" on:click={signUp}>
                        <span>
                            <UserPlus />
                            Sign Up</span>
                    </button>

                </div>
            </form>
            <span class="terms">
                    By using our service you agree
                <p>Privacy Policy</p>
                &
                <p>Terms of Use</p>
            </span>

        </div>

    {/if}
    
    {#if errorMessage}
        <p class="error" transition:fade>{errorMessage}</p>
    {/if}
</div>

{#if showProfileModal}
    <Profile user={$currentUser} onClose={toggleProfileModal} />
    <button class="logout-button" on:click={signOut} transition:fade={{ duration: 300 }}>
        <LogOutIcon size={24} />
        <span>Logout</span>
    </button>
{/if}

<style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
        color: var(--text-color);
    }      
    .auth-container {
        display: flex;
        color: var(--text-color);

        /* border-radius: 20px; */
        
        justify-content: center;
        align-items: center;
        gap: 20px;
        /* height: 50px; */
        padding: 10px 20px;
        /* width: 100%; */
        /* padding: 20px; */
        /* width: 100%; */
        /* width: 300px; */
        /* z-index: 100000; */
        /* height: 40px; */ 

    }

    .login-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: auto;
        flex: 1;
        max-width: 800px;
    }

    span.terms {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        justify-content: center;
        align-items: center;
        color: var(--text-color);
        height: auto;
        p {
            color: var(--text-color);
            font-weight: 800;
        }
    }
    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        user-select: none;
    }

    .avatar-container {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
    }

    .avatar, .avatar-placeholder {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #2c3e50;
    }

    .welcome-message {
        cursor: pointer;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        /* height: 100px; */
        gap: 1rem;
        max-width: 1000px;

    }


    .auth-form input {
        background-color: var(--secondary-color);
        color: var(--text-color); 
        padding: 1rem;
        border-radius: 5px; 
        border: 1px solid var(--secondary-color); 
        border-radius: 2rem;
        font-size: 2rem; 
        width: calc(100% - 2rem); 
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    .auth-form input:focus {
        outline: none;
        border-color: var(--text-color);
    }

    .auth-form input::placeholder {
        color: var(--text-color); 
    }

    .auth-form input[type="email"],
    .auth-form input[type="password"] {
    }


    .error {
        color: #e74c3c;
        margin-top: 10px;
    }





.button-group {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        align-items: center;
        gap: 1rem;
        /* margin-left: 5%; */
        /* margin-top: 10px; */
        /* width: 100%; */
        button.auth {
            border: none;
            border-radius: 2rem; 
            cursor: pointer; 
            display: flex;
            flex: 1;
            gap: 1rem;
            width: 100%;
            align-items: center;
            justify-content: center;
            background: var(--bg-gradient-fade);
            font-size: 1.5rem;
            padding: 1rem;
            transition: all 0.3s ease;

            &:hover {
                background: var(--bg-color);
                padding: 2rem;
            }

            span {
                display: flex;
                gap: 1rem;
                justify-content: center;
                align-items: center;


            }
        }

    }


</style>