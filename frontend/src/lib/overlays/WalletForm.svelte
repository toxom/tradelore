<script lang="ts">
    import { ethers, Wallet, JsonRpcProvider } from 'ethers';
    
    import {
            generateMnemonic,
            createWalletFromMnemonic,
            getAddress,
            getPrivateKey,
            signMessage,
            connectToProvider,
            getBalance,
            sendEther,
            generateNewWalletAndAddress,
        } from 'clients/walletClient';
    
    
        let mnemonic: string = '';
        let address: string = '';
        let privateKey: string = '';
        let message: string = '';
        let signature: string = '';
        let balance: string = '';
        let toAddress: string = '';
        let amountEther: string = '';
        let providerUrl: string = import.meta.env.VITE_INFURA_ETH_PROVIDER_URL || '';
        let provider: ethers.providers.JsonRpcProvider | null = null;
        let loading = false;
        let notification = { message: '', type: '' };
    

        async function handleAction(action: () => Promise<void>, successMessage: string) {
            loading = true;
            try {
                await action();
                notification = { message: successMessage, type: 'success' };
            } catch (error) {
                notification = { message: error.message, type: 'error' };
            } finally {
                loading = false;
                // Clear notification after 3 seconds
                setTimeout(() => {
                    notification = { message: '', type: '' };
                }, 3000);
            }
        }
    
        async function handleGenerateMnemonic() {
            await handleAction(async () => {
                mnemonic = await generateMnemonic();
            }, "Mnemonic generated successfully");
        }
    
        async function handleCreateWallet() {
            await handleAction(async () => {
                if (mnemonic) {
                    const wallet = await createWalletFromMnemonic(mnemonic);
                    address = await getAddress(wallet);
                    privateKey = await getPrivateKey(wallet); // NEVER do this in production!
                } else {
                    throw new Error("Please generate a mnemonic first");
                }
            }, "Wallet created successfully");
        }
    
        async function handleSignMessage() {
            await handleAction(async () => {
                if (mnemonic && message) {
                    const wallet = await createWalletFromMnemonic(mnemonic);
                    signature = await signMessage(wallet, message);
                } else {
                    throw new Error("Mnemonic and message are required");
                }
            }, "Message signed successfully");
        }
    
        async function handleConnectProvider() {
            await handleAction(async () => {
                provider = await connectToProvider(providerUrl);
            }, "Connected to provider");
        }
    
        async function handleGetBalance() {
            await handleAction(async () => {
                if (provider && address) {
                    balance = await getBalance(provider, address);
                } else {
                    throw new Error("Provider and address are required");
                }
            }, "Balance retrieved successfully");
        }
    
        async function handleSendEther() {
            await handleAction(async () => {
                if (mnemonic && provider && toAddress && amountEther) {
                    const wallet = await createWalletFromMnemonic(mnemonic);
                    await sendEther(wallet, toAddress, amountEther, provider); // USE WITH EXTREME CAUTION
                } else {
                    throw new Error("Mnemonic, provider, to address, and amount are required");
                }
            }, "Transaction sent successfully");
        }
    
        async function handleGenerateNewWalletAndAddress() {
            await handleAction(async () => {
                const newWalletData = await generateNewWalletAndAddress();
                mnemonic = newWalletData.mnemonic;
                address = newWalletData.address;
                privateKey = await getPrivateKey(await createWalletFromMnemonic(mnemonic));
            }, "New wallet generated successfully");
        }
    
        function copyToClipboard(text: string) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    notification = { message: "Copied to clipboard", type: 'success' };
                    setTimeout(() => {
                        notification = { message: '', type: '' };
                    }, 1000);
                })
                .catch(err => {
                    notification = { message: "Failed to copy: " + err, type: 'error' };
                });
        }
    </script>
    

    
    <div class="wallet-container">
        <h1>Ethereum Wallet Interface</h1>
        <div class="section-row">
            <div class="section-column">
                <div class="section">
                    <div class="section-title">Wallet Generation</div>
                    <div class="input-group">
                        <button on:click={handleGenerateMnemonic}>Generate Mnemonic</button>
                        <button on:click={handleGenerateNewWalletAndAddress}>Generate Complete New Wallet</button>
                    </div>
                    <div class="input-group">
                        <label for="mnemonic">Mnemonic Phrase</label>
                        <div class="flex">
                            <textarea id="mnemonic" bind:value={mnemonic} placeholder="Your mnemonic will appear here"></textarea>
                            {#if mnemonic}
                                <div class="copy-icon" on:click={() => copyToClipboard(mnemonic)}>📋</div>
                            {/if}
                        </div>
                        {#if mnemonic}
                            <div class="warning-text">Keep this phrase secret! Anyone with this phrase can access your funds.</div>
                        {/if}
                    </div>
                </div>
            
                <div class="section">
                    <div class="section-title">Wallet Details</div>
                    <div class="input-group">
                        <button on:click={handleCreateWallet}>Create/Load Wallet from Mnemonic</button>
                    </div>
                    <div class="input-group">
                        <label for="address">Wallet Address</label>
                        <div class="flex">
                            <input type="text" id="address" bind:value={address} placeholder="Your wallet address will appear here" readonly />
                            {#if address}
                                <div class="copy-icon" on:click={() => copyToClipboard(address)}>📋</div>
                            {/if}
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="privateKey">Private Key (NEVER SHARE IN PRODUCTION)</label>
                        <div class="flex">
                            <input type="text" id="privateKey" bind:value={privateKey} placeholder="Your private key will appear here" readonly />
                            {#if privateKey}
                                <div class="copy-icon" on:click={() => copyToClipboard(privateKey)}>📋</div>
                            {/if}
                        </div>
                        {#if privateKey}
                            <div class="warning-text">WARNING: Never share your private key! This is shown for educational purposes only.</div>
                        {/if}
                    </div>
                </div>
            </div>
            <div class="section-column">
                <div class="section">
                    <div class="section-title">Connect to Network</div>
                    <div class="input-group">
                        <label for="providerUrl">Provider URL</label>
                        <input type="text" id="providerUrl" bind:value={providerUrl} placeholder="e.g., https://eth-mainnet.alchemyapi.io/v2/your-api-key" />
                    </div>
                    <div class="input-group">
                        <button on:click={handleConnectProvider}>Connect to Provider</button>
                    </div>
                </div>
            
                <div class="section">
                    <div class="section-title">Wallet Operations</div>
                    <div class="input-group">
                        <button on:click={handleGetBalance}>Get Balance</button>
                        {#if balance}
                            <span class="balance-display">{balance} ETH</span>
                        {/if}
                    </div>
            
                    <div class="input-group">
                        <label for="message">Message to Sign</label>
                        <input type="text" id="message" bind:value={message} placeholder="Enter a message to sign" />
                    </div>
                    <div class="input-group">
                        <button on:click={handleSignMessage}>Sign Message</button>
                    </div>
                    <div class="input-group">
                        <label for="signature">Signature</label>
                        <div class="flex">
                            <textarea id="signature" bind:value={signature} placeholder="The signature will appear here" readonly></textarea>
                            {#if signature}
                                <div class="copy-icon" on:click={() => copyToClipboard(signature)}>📋</div>
                            {/if}
                        </div>
                    </div>
                </div>
            
                <div class="section">
                    <div class="section-title">Send Transaction</div>
                    <div class="input-group">
                        <label for="toAddress">Recipient Address</label>
                        <input type="text" id="toAddress" bind:value={toAddress} placeholder="Enter recipient's Ethereum address" />
                    </div>
                    <div class="input-group">
                        <label for="amountEther">Amount (ETH)</label>
                        <input type="text" id="amountEther" bind:value={amountEther} placeholder="Enter amount in ETH" />
                    </div>
                    <div class="input-group">
                        <button class="danger-button" on:click={handleSendEther}>Send ETH Transaction</button>
                        <div class="warning-text">WARNING: This will send actual ETH if connected to a real network.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    {#if loading}
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>
    {/if}
    
    {#if notification.message}
        <div class="notification {notification.type}">
            {notification.message}
        </div>
    {/if}

    <style lang="scss">
        @use "src/styles/themes.scss" as *;
        * {
            font-family: var(--font-family);
        }
        :global(body) {
            color: #111827;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
    
        .wallet-container {
            max-width: 1600px;
            margin: 2rem auto;
            padding: 2rem;
            background: var(--bg-gradient);
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
    
        h1 {
            color: var(--text-color);
            font-size: 1.8rem;
            margin-bottom: 2rem;
            text-align: center;
        }

        .section-row {
            display: flex;
            flex-direction: row;
            gap: 1rem;
        }

        .section-column {
            display: flex;
            flex-direction: column;
            width: 50%;
        }
    
        .section {
            margin-bottom: 1.5rem;
            padding: 1.25rem;
            border-radius: 0.375rem;
            background-color: var(--secondary-color);

        }
    
        .section-title {
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 1rem;
            color: #4b5563;
        }
    
        .input-group {
            margin-bottom: 0.75rem;
        }
    
        button {
            background-color: var(--tertiary-color);
            color: var(--text-color);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 1rem;
            font-weight: 800;
        }
    
        button:hover {
            background-color: var(--bg-color);
        }
    
        button:disabled {
            background-color: #93c5fd;
            cursor: not-allowed;
        }
    
        .danger-button {
            background-color: #ef4444;
        }
    
        .danger-button:hover {
            background-color: #dc2626;
        }
    
        input, textarea {
            background: var(--primary-color);
            width: 100%;
            font-size: 1rem;
            padding: 1.5rem;
            border: none;
            color: var(--text-color);
            border-radius:1rem;
            margin-top: 0.25rem;
            font-family: inherit;
            box-sizing: border-box;
        }
    
        textarea {
            min-height: 4rem;
            resize: vertical;
        }
    
        .notification {
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            padding: 0.75rem 1.25rem;
            border-radius: 0.25rem;
            color: white;
            font-weight: 500;
            z-index: 100;
            max-width: 300px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            animation: fadeIn 0.3s ease-out;
        }
    
        .notification.success {
            background-color: #10b981;
        }
    
        .notification.error {
            background-color: #ef4444;
        }
    
        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
    
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 50;
        }
    
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }
    
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    
        .copy-icon {
            cursor: pointer;
            margin-left: 0.5rem;
            color: #6b7280;
        }
    
        .copy-icon:hover {
            color: #3b82f6;
        }
    
        .warning-text {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
    
        .flex {
            display: flex;
            align-items: center;
        }
    
        .balance-display {
            display: inline-block;
            background-color: #ecfdf5;
            color: #047857;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            margin-left: 0.5rem;
        }
    </style>