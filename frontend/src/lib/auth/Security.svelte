<script lang="ts">
    import { onMount } from 'svelte';
    import { verifyTOTP, generateTOTPSecret, generateQRCode } from '$lib/auth/totp';
    import { pb, currentUser } from '$lib/pocketbase';
    import { get } from 'svelte/store';
  
    let username = ''; // Will be populated from the current auth
    let token = ''; // TOTP code entered by the user
    let qrCode = ''; // QR code for 2FA setup
    let secret = ''; // The TOTP secret generated
    let is2FAEnabled = false; // Flag to track if 2FA is enabled
    let isPasswordResetRequested = false; // Flag to track if password reset is in progress
    let twoFAError = ''; 
    let isGeneratingQR = false; 
    let userObject: any = null; // Local reference to user object
  
    onMount(async () => {
      try {
        if (pb.authStore.isValid) {
          try {
            // Fetch the latest user data
            const userData = await pb.collection('users').getOne(pb.authStore.model.id);
            
            // Update the store properly
            currentUser.set(userData);
            
            // Keep a local reference
            userObject = userData;
            
            username = userData.username;
            
            is2FAEnabled = !!userData.totpSecret;
            console.log('2FA enabled:', is2FAEnabled);
            console.log('TOTP secret:', userData.totpSecret);
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
          }
        } else {
          console.warn('User not authenticated');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    });
  
    // Generate QR code for 2FA setup
    async function generateQRCodeForUser() {
      isGeneratingQR = true;
      try {
        if (!username) {
          const currentUserValue = get(currentUser);
          if (currentUserValue) {
            username = currentUserValue.username;
          } else {
            throw new Error('No username available');
          }
        }
        
        // Generate a new TOTP secret for the user
        const { secret: generatedSecret, otpauth } = generateTOTPSecret(username);
        secret = generatedSecret;
        
        // Generate QR code from the otpauth URL
        qrCode = await generateQRCode(otpauth);
      } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Failed to generate QR code: ' + (error.message || 'Unknown error'));
      } finally {
        isGeneratingQR = false;
      }
    }
  
    // Handle enabling 2FA
    async function enable2FA() {
      try {
        if (!secret || !qrCode) {
          alert('Please generate a QR code first.');
          return;
        }
  
        if (!pb.authStore.isValid) {
          alert('You need to be logged in to enable 2FA.');
          return;
        }
  
        const currentUserValue = get(currentUser);
        console.log('Current user ID:', currentUserValue?.id);
        console.log('TOTP secret to save:', secret);
  
        // Update the user with the TOTP secret
        const updatedUser = await pb.collection('users').update(currentUserValue.id, { 
          totpSecret: secret 
        });
        
        console.log('Updated user:', updatedUser);
        
        // Update the store properly
        currentUser.set(updatedUser);
        
        // Update local reference
        userObject = updatedUser;
        
        is2FAEnabled = true;
        alert('2FA enabled! Use the QR code in your authenticator app.');
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        alert('Failed to enable 2FA: ' + (error.message || 'Unknown error'));
      }
    }
  
    // Verify 2FA code before performing any action (like password reset)
    async function verifyCode() {
      twoFAError = '';
      try {
        const currentUserValue = get(currentUser);
        console.log('Current user for verification:', currentUserValue);
        console.log('TOTP secret for verification:', currentUserValue?.totpSecret);
        
        if (!currentUserValue?.totpSecret) {
          alert('2FA is not set up.');
          return;
        }
  
        console.log('Verifying token:', token);
        const isValid = verifyTOTP(currentUserValue.totpSecret, token);
        console.log('Token verification result:', isValid);
  
        if (isValid) {
          if (isPasswordResetRequested) {
            // Trigger password reset logic here
            await requestPasswordReset();
          } else {
            alert('Code verified successfully!');
          }
        } else {
          twoFAError = 'Invalid 2FA code. Try again.';
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        twoFAError = 'Error verifying code. Please try again.';
      }
    }
  
    // Request password reset
    async function requestPasswordReset() {
      try {
        const currentUserValue = get(currentUser);
        // Make sure we have the user's email
        if (!currentUserValue?.email) {
          alert('No email available for password reset.');
          return;
        }
        
        await pb.collection('users').requestPasswordReset(currentUserValue.email);
        alert('Password reset link sent to your email.');
        isPasswordResetRequested = false;
      } catch (error) {
        console.error('Error requesting password reset:', error);
        alert('Failed to send password reset link: ' + (error.message || 'Unknown error'));
      }
    }
  </script>
  
  
  <div class="container">
    <h2>Two-Factor Authentication Setup</h2>
  
    {#if !pb.authStore.isValid}
      <div class="auth-warning">
        <p>Please log in to access 2FA settings.</p>
      </div>
    {:else}
      {#if !is2FAEnabled}
        <div class="setup-container">
          <h3>Set Up Two-Factor Authentication</h3>
          {#if qrCode}
            <div class="qr-container">
              <img src={qrCode} alt="Scan this QR code in your authenticator app">
              <p>Scan this QR code with your authenticator app (like Google Authenticator)</p>
              <p>Secret key (if needed): <code>{secret}</code></p>
              <button on:click={enable2FA}>Enable 2FA</button>
            </div>
          {:else}
            <button on:click={generateQRCodeForUser} disabled={isGeneratingQR}>
              {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
            </button>
          {/if}
        </div>
      {/if}
  
      {#if is2FAEnabled}
        <div class="verify-container">
          <h3>Verify 2FA Code</h3>
          <input 
            type="text" 
            bind:value={token} 
            placeholder="Enter the code from your authenticator app" 
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
          />
          {#if twoFAError}
            <p class="error">{twoFAError}</p>
          {/if}
          <button on:click={verifyCode}>Verify 2FA</button>
        </div>
      {/if}
  
      {#if !isPasswordResetRequested && is2FAEnabled}
        <div class="reset-container">
          <button on:click={() => isPasswordResetRequested = true}>Request Password Reset</button>
        </div>
      {/if}
  
      {#if isPasswordResetRequested && is2FAEnabled}
        <div class="reset-container">
          <h3>Enter 2FA Code to Reset Password</h3>
          <p>Please enter the current code from your authenticator app to verify your identity:</p>
          <input 
            type="text" 
            bind:value={token} 
            placeholder="Enter the code from your authenticator app" 
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
          />
          <button on:click={verifyCode}>Verify 2FA and Reset Password</button>
        </div>
      {/if}
    {/if}
  </div>
  <style lang="scss">
    @use "src/styles/themes.scss" as *;
    
    * {
        font-family: var(--font-family);
        color: var(--text-color)
    }       
    .container {
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--bg-color);
      border-radius: 2rem;
      margin-top: 4rem;
    }
    
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px 0;
    }
    
    .qr-container img {
      max-width: 200px;
      margin-bottom: 15px;
    }
    
    .setup-container, .verify-container, .reset-container, .auth-warning {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid var(--tertiary-color);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
    }
    
    .auth-warning {
      background-color: #fff3cd;
      border-color: #ffeeba;
      color: #856404;
    }
    
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    button {
      padding: 10px 15px;
      background-color: var(--tertiary-color);
      color: var(--primary-color);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    button:hover:not(:disabled) {
      background-color: #3a5ce7;
    }
    
    .error {
      color: #e74c3c;
      margin: 10px 0;
    }
    
    code {
      background-color: #f8f8f8;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>