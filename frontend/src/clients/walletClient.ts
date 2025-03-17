import { ethers, Wallet, JsonRpcProvider } from 'ethers';

export async function generateMnemonic(): Promise<string> {
    const wallet = ethers.Wallet.createRandom();
    if (wallet.mnemonic) {
        return wallet.mnemonic.phrase;
    } else {
        throw new Error("Mnemonic not available");
    }
}

export async function createWalletFromMnemonic(mnemonic: string): Promise<ethers.Wallet> {
    // In v6, use this method instead of Wallet.fromMnemonic
    return ethers.Wallet.fromPhrase(mnemonic);
}

export async function getAddress(wallet: ethers.Wallet): Promise<string> {
    return wallet.address;
}

export async function getPrivateKey(wallet: ethers.Wallet): Promise<string> {
    return wallet.privateKey; // NEVER expose private keys in production client code!
}

export async function signMessage(wallet: ethers.Wallet, message: string): Promise<string> {
    return wallet.signMessage(message);
}

export async function connectToProvider(providerUrl: string): Promise<JsonRpcProvider> {
    return new JsonRpcProvider(providerUrl);
}

export async function getBalance(provider: JsonRpcProvider, address: string): Promise<string> {
    const balanceWei = await provider.getBalance(address);
    // Use formatEther directly from ethers instead of utils
    return ethers.formatEther(balanceWei);
}

export async function sendEther(
    wallet: ethers.Wallet,
    toAddress: string,
    amountEther: string,
    provider: JsonRpcProvider
): Promise<ethers.TransactionResponse> { // Updated return type
    const signer = wallet.connect(provider);
    // Use parseEther directly from ethers
    const amountWei = ethers.parseEther(amountEther);
    return signer.sendTransaction({
        to: toAddress,
        value: amountWei,
    });
}

export async function generateNewWalletAndAddress(): Promise<{ address: string; mnemonic: string }> {
    const wallet = ethers.Wallet.createRandom();
    if(wallet.mnemonic){
        return { address: wallet.address, mnemonic: wallet.mnemonic.phrase };
    } else {
        throw new Error("Mnemonic not available");
    }
}