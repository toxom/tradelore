import { pb, currentUser } from '$lib/pocketbase';
import { get } from 'svelte/store';
import type { Wallet, Token } from 'types/walletTypes';
import {
  wallets,
  selectedWallet,
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from 'stores/walletStore';

export async function getAvailableTokens(): Promise<Token[]> {
  try {
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      console.error('User not authenticated');
      return [];
    }

    // Fetch tokens with authentication
    return await pb.collection('tokens').getFullList<Token>({
      sort: 'symbol',
      headers: {
        'Authorization': pb.authStore.token
      }
    });
  } catch (error) {
    console.error('Failed to fetch tokens:', error);
    // Handle specific error types
    if (error instanceof Error && error.message.includes('403')) {
      console.error('Permission denied. Only superusers can access this resource.');
    }
    return [];
  }
}

export async function getWalletForTokenAndNetwork(
  currency: string,
  tokenId: string,
  network: string
): Promise<Wallet | null> {
  await fetchWallets();
  const foundWallet = get(wallets).find(
    (wallet) =>
      wallet.currency === currency &&
      wallet.tokenId === tokenId &&
      wallet.network === network
  );
  if (foundWallet) {
    selectedWallet.set(foundWallet);
    return foundWallet;
  }
  return null;
}

export async function addNewWallet(currency: string, tokenId: string, network: string) {
  const existingWallet = await getWalletForTokenAndNetwork(currency, tokenId, network);
  if (!existingWallet) {
    return createWallet(currency, tokenId, network);
  }
  return existingWallet;
}

function getTotalBalanceForToken(tokenId: string): number {
  const userWallets = get(wallets).filter(
    wallet => wallet.userId === get(currentUser).id && wallet.tokenId === tokenId
  );
  
  return userWallets.reduce((total, wallet) => {
    const walletBalance = typeof wallet.balance === 'string' 
      ? parseFloat(wallet.balance) || 0 
      : wallet.balance || 0;
    
    return total + walletBalance;
  }, 0);
}

export { wallets, selectedWallet, fetchWallets, createWallet, updateWallet, deleteWallet };