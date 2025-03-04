<script lang="ts">
      import { pb, signIn, signUp, signOut } from '$lib/pocketbase';
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { t } from '../../stores/translation.store';

    export let showLogin = true;
    export let errorMessage: string | null = null;
  
    const dispatch = createEventDispatcher();
    let email = '';
    let password = '';
    let loading = false;

    function toggleForm() {
      showLogin = !showLogin;
      errorMessage = null; 
    }
  
    async function handleFormSubmit(event: Event) {
      event.preventDefault();
      loading = true;
      errorMessage = null;
      
      try {
        if (showLogin) {
          console.log('Attempting login with:', email);
          const authData = await signIn(email, password);
          
          if (authData) {
            console.log('Login successful:', authData);
            dispatch('login', { email, success: true });
          } else {
            errorMessage = 'Login failed. Please check your credentials.';
            dispatch('login', { email, success: false });
          }
        } else {
          console.log('Attempting signup with:', email);
          const user = await signUp(email, password);
          
          if (user) {
            console.log('Signup successful:', user);
            dispatch('signup', { email, success: true });
          } else {
            errorMessage = 'Signup failed. This email might already be registered.';
            dispatch('signup', { email, success: false });
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      } finally {
        loading = false;
      }
    }
</script>

<div class="auth-container" transition:fade={{ duration: 200 }}>
  <div class="auth-card" transition:fly={{ y: 50, duration: 300 }}>
    <h2>{showLogin ? $t('nav.login') : $t('nav.signup')}</h2>
    
    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}
    
    <form on:submit={handleFormSubmit}>
      <input type="email" bind:value={email} placeholder="Email" required />
      <input type="password" bind:value={password} placeholder="Password" required />
      
      <button type="submit" disabled={loading}>
        {#if loading}
          Loading...
        {:else}
          {showLogin ? $t('nav.login') : $t('nav.signup')}
        {/if}
      </button>
    </form>
    
    <p>
      {showLogin ? "Don't have an account?" : "Already have an account?"}
      <button class="toggle-button" on:click={toggleForm}>
        {showLogin ? $t('nav.signup') : $t('nav.login')}
      </button>
    </p>
  </div>
</div>
  
<style lang="scss">
  @use "src/styles/themes.scss" as *;
  
  * {
      font-family: var(--font-family);
  }        
  .auth-container {
      position: relative;
      width: auto;
      height: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 2rem;
      border-radius: 2rem;
      color: white;
    }
  
    .auth-card {
      width: 100%;
      height: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      h2 {
        margin-bottom: 1.5rem;
      }
      form {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1.5rem;
          border-radius: 2rem;
        }
        button {
          padding: 0.75rem 1rem;
          background: var(--accent1);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.5rem;
          border-radius: 2rem;
          &:hover {
            background: var(--primary-color);
            color: var(--text-color);
        }
        }
      }
      .toggle-text {
        margin-top: 1rem;    
        font-size: 1.5rem;    
      }
      .toggle-button {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        text-decoration: underline;
        font-size: 2rem;
        width: 100%;
      }
      .error-message {
        color: red;
        margin-bottom: 1rem;
      }
    }
    @media (max-width: 767px) {
        .auth-card {
            form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                input {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    font-size: 2rem;
                }
                button {
                    font-size: 2rem;
                }
            }
        }
    }
  </style>