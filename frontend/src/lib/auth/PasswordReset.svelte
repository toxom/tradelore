<script lang="ts">
    import { verifyTOTP } from '../auth/totp';
    import { pb } from '$lib/pocketbase';

    let username = 'testuser'; // Replace with actual username
    let token = '';
    let newPassword = '';

    async function resetPassword() {
        const user = await pb.collection('users').getFirstListItem(`username="${username}"`);

        if (!user?.totpSecret) {
            alert('2FA is not set up.');
            return;
        }

        if (verifyTOTP(user.totpSecret, token)) {
            await pb.collection('users').update(user.id, { password: newPassword });
            alert('Password reset successful!');
        } else {
            alert('Invalid 2FA code.');
        }
    }
</script>

<div>
    <h2>Reset Password</h2>
    <input type="text" bind:value={token} placeholder="Enter 2FA code">
    <input type="password" bind:value={newPassword} placeholder="New password">
    <button on:click={resetPassword}>Reset</button>
</div>