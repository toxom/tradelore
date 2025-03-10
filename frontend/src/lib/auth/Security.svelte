<script lang="ts">
    import { onMount } from 'svelte';
    import { verifyTOTP, generateTOTPSecret, generateQRCode } from '$lib/auth/totp';
    import { pb, currentUser } from '$lib/pocketbase';
    import { get } from 'svelte/store';
    import { t } from '../../stores/translation.store';
	import { ShieldCheck } from 'lucide-svelte';

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
            const savedSecret = localStorage.getItem('totpSecret');
            const savedQRCode = localStorage.getItem('totpQRCode');
            if (savedSecret && savedQRCode) {
              secret = savedSecret;
              qrCode = savedQRCode;
            }
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

    // Save the secret and QR code to localStorage
    localStorage.setItem('totpSecret', secret);
    localStorage.setItem('totpQRCode', qrCode);
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
        
        currentUser.set(updatedUser);
        
        userObject = updatedUser;
        
        is2FAEnabled = true;
        alert($t('forms.twoF.alertEnabled'));
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        alert($t('forms.twoF.alertFailed') + (error.message || 'Unknown error'));
      }
    }
    async function reset2FA() {
  try {
    if (!pb.authStore.isValid) {
      alert('You need to be logged in to reset 2FA.');
      return;
    }

    const currentUserValue = get(currentUser);
    if (!currentUserValue) {
      alert('No user data available.');
      return;
    }

    // Clear the TOTP secret from the user's record
    const updatedUser = await pb.collection('users').update(currentUserValue.id, {
      totpSecret: null,
      factorValidated: false 
    });

    // Update the local state
    currentUser.set(updatedUser);
    userObject = updatedUser;
    is2FAEnabled = false;
    secret = '';
    qrCode = '';
    localStorage.removeItem('totpSecret');
    localStorage.removeItem('totpQRCode');

    alert($t('forms.twoF.alertResetSuccess'));
  } catch (error) {
    console.error('Error resetting 2FA:', error);
    alert($t('forms.twoF.alertResetFailed') + (error.message || 'Unknown error'));
  }
}
  
async function verifyCode() {
  twoFAError = '';
  try {
    const currentUserValue = get(currentUser);
    console.log('Current user for verification:', currentUserValue);
    console.log('TOTP secret for verification:', currentUserValue?.totpSecret);

    if (!currentUserValue?.totpSecret) {
      alert($t('forms.twoF.alertVerify'));
      return;
    }

    console.log('Verifying token:', token);
    const isValid = verifyTOTP(currentUserValue.totpSecret, token);
    console.log('Token verification result:', isValid);

    if (isValid) {
      // Update the user's record to set factorValidated to true
      const updatedUser = await pb.collection('users').update(currentUserValue.id, {
        factorValidated: true
      });

      // Update the local state
      currentUser.set(updatedUser);
      userObject = updatedUser;

      if (isPasswordResetRequested) {
        // Trigger password reset logic here
        await requestPasswordReset();
      } else {
        alert($t('forms.twoF.alertVerifySuccess'));
      }
    } else {
      twoFAError = $t('forms.twoF.alertVerifyFailed');
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    twoFAError = $t('forms.twoF.alertVerifyError');
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
    <h2>
      {$t('forms.twoF.title')}
    </h2>
  
    {#if !pb.authStore.isValid}
      <div class="auth-warning">
        <p>      
          {$t('forms.twoF.warning')}
        </p>
      </div>
    {:else}
      {#if !is2FAEnabled}
        <div class="setup-container">
          <h3>
            {$t('forms.twoF.setup')}
          </h3>
          {#if qrCode}
            <div class="qr-container">
              <img src={qrCode} alt="Scan this QR code in your authenticator app">
              <p>            
                {$t('forms.twoF.prompt')}
              </p>
              <p>            
                {$t('forms.twoF.key')}
                <code>{secret}</code>
              </p>
              <button on:click={enable2FA}>
                {$t('forms.twoF.secondAction')}
              </button>
            </div>
          {:else}
            <button on:click={generateQRCodeForUser} disabled={isGeneratingQR}>
              {isGeneratingQR ? $t('forms.twoF.firstActionLoad') : $t('forms.twoF.firstAction')}
            </button>
          {/if}
        </div>
      {/if}
  
      {#if is2FAEnabled}
        <div class="verify-container">
          {#if !userObject?.factorValidated}
            <h3>
              {$t('forms.twoF.verify')}
            </h3>
            <input 
              type="text" 
              bind:value={token} 
              placeholder={$t('forms.twoF.placeholder')}
              maxlength="6"
              pattern="[0-9]*"
              inputmode="numeric"
            />
            {#if twoFAError}
              <p class="error">{twoFAError}</p>
            {/if}
            <button on:click={verifyCode}>
              {$t('forms.twoF.verify')}
            </button>
          {:else}
            <div class="row-medium">
              <ShieldCheck/>
              <h3>
                {$t('forms.twoF.check')}
              </h3>
            </div>
            <div class='btn-row'>
              
              <button on:click={reset2FA} class="reset-button">
                {$t('forms.twoF.reset')}
              </button>
              {#if !isPasswordResetRequested}
                <button on:click={() => isPasswordResetRequested = true}>
                  {$t('forms.password.firstAction')}
                </button>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
  
      {#if isPasswordResetRequested && is2FAEnabled && userObject?.factorValidated}
        <div class="reset-container">
          <h3>          
            {$t('forms.password.placeholder')}
          </h3>
          <p>
            {$t('forms.password.prompt')}
          </p>
          <input 
            type="text" 
            bind:value={token} 
            placeholder={$t('forms.password.placeholder')}
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
          />
          <button on:click={verifyCode}>
            {$t('forms.password.verify')}
          </button>
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
      max-width: auto;
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
      max-width: 300px;
      margin-bottom: 15px;
    }
    
    .setup-container, .verify-container, .reset-container, .auth-warning {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid var(--secondary-color);
      background: var(--bg-gradient-fade);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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