// walletStore.ts
import { writable, get } from 'svelte/store';
import { pb, currentUser } from '$lib/pocketbase';
import type { Wallet } from 'types/walletTypes';


export const wallets = writable<Wallet[]>([]);
export const selectedWallet = writable<Wallet | null>(null);

export async function fetchWallets() {
  const user = get(currentUser);
  if (user) {
    try {
      const records = await pb.collection('wallets').getFullList<Wallet>({
        filter: `userId = "${user.id}"`,
      });
      wallets.set(records);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  }
}

export async function createWallet(currency: string, address: string) {
  const user = get(currentUser);
  if (user) {
    try {
      const record = await pb.collection('wallets').create<Wallet>({
        userId: user.id,
        currency,
        address,
        balance: 0,
      });
      wallets.update((current) => [...current, record]);
      selectedWallet.set(record);
      return record;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      return null;
    }
  }
  return null;
}

export async function updateWallet(walletId: string, updates: Partial<Wallet>) {
  try {
    const record = await pb.collection('wallets').update<Wallet>(walletId, updates);
    wallets.update((current) =>
      current.map((w) => (w.id === record.id ? record : w))
    );
    if (get(selectedWallet)?.id === record.id) {
      selectedWallet.set(record);
    }
    return record;
  } catch (error) {
    console.error('Failed to update wallet:', error);
    return null;
  }
}

export async function deleteWallet(walletId: string) {
  try {
    await pb.collection('wallets').delete(walletId);
    wallets.update((current) => current.filter((w) => w.id !== walletId));
    if (get(selectedWallet)?.id === walletId) {
      selectedWallet.set(null);
    }
  } catch (error) {
    console.error('Failed to delete wallet:', error);
  }
}