<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { t } from '../../stores/translation.store';
    export let showLogin = true; // Start with login form visible
    export let errorMessage: string | null = null;
  
    const dispatch = createEventDispatcher();
  
    function toggleForm() {
      showLogin = !showLogin;
      errorMessage = null; // Clear error message on toggle
    }
  
    async function handleFormSubmit(event: Event) {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
  
      try {
        if (showLogin) {
          console.log('Logging in:', { email, password });
          dispatch('login', { email });
        } else {
          console.log('Signing up:', { email, password });
          dispatch('signup', { email });
        }
      } catch (error) {
        console.error('Form submission error:', error);
        errorMessage = 'An error occurred. Please try again.'; 
      }
    }
  </script>

  <div class="auth-container" transition:fade={{ duration: 200 }}>
    <div class="auth-card" transition:fly={{ y: 50, duration: 300 }}>


        {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}
      <form on:submit={handleFormSubmit}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit"> {$t('nav.signup')}</button>
      </form>
    </div>
  </div>
  
  <style lang="scss">
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