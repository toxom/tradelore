<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { pb, currentUser, checkPocketBaseConnection, updateUser } from '$lib/pocketbase';
    import { Camera, LogIn, UserPlus, LogOutIcon } from 'lucide-svelte';
    import Profile from '$lib/overlays/ProfileOverlay.svelte'

    let email: string = '';
    let password: string = '';
    let errorMessage: string = '';
    let avatarUrl: string | null = null;
    let showProfileModal = false;

    const dispatch = createEventDispatcher();

    onMount(async () => {
        const isConnected = await checkPocketBaseConnection();
        if (!isConnected) {
            errorMessage = 'Unable to connect to the server. Please try again later.';
        }
        if ($currentUser && $currentUser.id) {
            updateAvatarUrl();
        }
    });

    function handleAuthSuccess() {
        dispatch('success');
    }

    async function login() {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            currentUser.set(authData.record);
            errorMessage = '';
            dispatch('success');
        } catch (err) {
            console.error('Login error:', err);
            errorMessage = err.message || 'An error occurred during login';
        }
    }

    async function signUp() {
        try {
            const data = {
                email,
                password,
                passwordConfirm: password,
                name: 'Hey',
            };
            const createdUser = await pb.collection('users').create(data);
            await login();
        } catch (err) {
            console.error('Signup error:', err);
            errorMessage = err.message || 'An error occurred during signup';
        }
    }

    async function logout() {
        try {
            await pb.authStore.clear();
            currentUser.set(null);
            dispatch('logout');
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
                    style="background-color: #444444;"

                />
                <input
                    class="input"
                    type="password"
                    bind:value={password}
                    placeholder="Password"
                    required
                />
                <div class="button-group">
                    <button class="button button-signup" on:click={signUp}>
                        <UserPlus size={16} />
                        <span>Sign Up</span>
                    </button>
                    <button class="button button-login" on:click={login}>
                        <LogIn size={16} />
                        <span>Login</span>
                    </button>
                </div>
            </form>
            <div class="terms">
                <p>
                    By using our service you agree:
                </p>
                <p>Privacy Policy</p>
                <p>&</p>
                <p>Terms of Use</p>
            </div>

        </div>

    {/if}
    
    {#if errorMessage}
        <p class="error" transition:fade>{errorMessage}</p>
    {/if}
</div>

{#if showProfileModal}
    <Profile user={$currentUser} onClose={toggleProfileModal} />
    <button class="logout-button" on:click={logout} transition:fade={{ duration: 300 }}>
        <LogOutIcon size={24} />
        <span>Logout</span>
    </button>
{/if}

<style lang="scss">
    .auth-container {
        display: flex;
        color: #ffffff;

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
    }

    .terms {
        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: center;
        color: gray;
        height: 40px;
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
        flex-direction: row;
        justify-content: center;
        align-items: center;
        /* height: 100px; */
        gap: 3px;

    }


    .auth-form input {
        background-color: #3f9fff; /* Blue background color */
        color: #ffffff; /* White text color */
        /* height: 20px; Consistent height */
        padding: 10px; /* Padding for text */
        border-radius: 5px; /* Rounded corners */
        border: 1px solid #34495e; /* Subtle border */
        font-size: 16px; /* Readable font size */
        /* width: 90%; Full width of container */
        /* margin-left: 5%; */
        transition: border-color 0.3s, box-shadow 0.3s; /* Smooth transition for focus effect */
    }

    .auth-form input:focus {
        outline: none; /* Remove default focus outline */
        border-color: #3498db; /* Highlight border color on focus */
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.25); /* Subtle glow effect */
        background-color: #34495e; /* Slightly lighter background on focus */
    }

    .auth-form input::placeholder {
        color: #95a5a6; /* Lighter color for placeholder text */
    }

    .auth-form input[type="email"],
    .auth-form input[type="password"] {
        background-color: #08090a;
    }

    .button {
        display: flex;
        align-items: center;
        width: 100%;
        gap: 5px;
        padding: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .button-signup {
        background-color: #27ae60;
        width: 100%;
        display: flex;

    }

    .button-login {
        background-color: #3498db;
        width: 100%;
        display: flex;

    }

    .logout-button {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        right: 2rem;
        top: 70px;
        gap: 5px;
        /* width: 100%; */
        padding: 10px;
        /* margin-top: 10px; */
        background-color: #e74c3c;
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        transition: background-color 0.3s;
        font-size: 16px;
        z-index: 1000;
    }

    .error {
        color: #e74c3c;
        margin-top: 10px;
    }





.button-group {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 250px;
        gap: 2px;
        /* margin-left: 5%; */
        /* margin-top: 10px; */
        /* width: 100%; */
        

    }

.button-group .button {
    /* background-color: #007bff; Button background color */
    color: white; /* Button text color */
    border: none; /* Remove default border */
    border-radius: 4px; /* Rounded corners */
    cursor: pointer; /* Pointer cursor on hover */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

/* Hover effects for buttons */
.button-group .button:hover {
    background-color: #0056b3; /* Darken background on hover */
}

</style>