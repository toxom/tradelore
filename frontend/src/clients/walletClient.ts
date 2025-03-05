import { pb } from '$lib/pocketbase';
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
  address: string
): Promise<Wallet | null> {
  await fetchWallets();
  const foundWallet = get(wallets).find(
    (wallet) => wallet.currency === currency && wallet.address === address
  );
  if (foundWallet) {
    selectedWallet.set(foundWallet);
    return foundWallet;
  }
  return null;
}

export async function addNewWallet(currency: string, address: string) {
  const existingWallet = await getWalletForTokenAndNetwork(currency, address);
  if (!existingWallet) {
    return createWallet(currency, address);
  }
  return existingWallet;
}

export { wallets, selectedWallet, fetchWallets, createWallet, updateWallet, deleteWallet };