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
import { tokens } from 'clients/tokenClient';

export function getTotalBalanceForToken(tokenId: string): number {
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

export function getAvailableBalanceForTicker(ticker: string): number {
  // Convert ticker to uppercase for case-insensitive comparison
  const upperTicker = ticker.toUpperCase();
  
  // Find wallets that match this ticker
  const matchingWallets = get(wallets).filter(wallet => 
    wallet.userId === get(currentUser).id && 
    wallet.currency.toUpperCase() === upperTicker
  );
  
  console.log(`Found ${matchingWallets.length} wallets for ticker ${ticker} (available balance)`);
  
  // Sum the available balances (balance minus reserved)
  return matchingWallets.reduce((total, wallet) => {
    const walletBalance = typeof wallet.balance === 'string' 
      ? parseFloat(wallet.balance) || 0 
      : wallet.balance || 0;
    
    const reservedBalance = typeof wallet.balanceReserved === 'string'
      ? parseFloat(wallet.balanceReserved) || 0
      : wallet.balanceReserved || 0;
    
    return total + (walletBalance - reservedBalance);
  }, 0);
}

export function getTokenIdFromTicker(ticker: string): string | null {
  const token = get(tokens).find(token => token.ticker === ticker || token.symbol === ticker);
  return token ? token.id : null;
}

export function getTotalBalanceForTicker(ticker: string): number {
  const upperTicker = ticker.toUpperCase();
  
  const matchingWallets = get(wallets).filter(wallet => 
    wallet.userId === get(currentUser).id && 
    wallet.currency.toUpperCase() === upperTicker
  );
  
  console.log(`Found ${matchingWallets.length} wallets for ticker ${ticker}`);
  
  // Sum the balances
  return matchingWallets.reduce((total, wallet) => {
    const walletBalance = typeof wallet.balance === 'string' 
      ? parseFloat(wallet.balance) || 0 
      : wallet.balance || 0;
    const reservedBalance = typeof wallet.balanceReserved === 'string'
      ? parseFloat(wallet.balanceReserved) || 0
      : wallet.balanceReserved || 0;
  
      return total + (walletBalance - reservedBalance);
    }, 0);
}
export async function getTokenIdFromSymbol(symbol: string): Promise<string | null> {
  try {
    // Use the simpler filter format
    const tokensList = await pb.collection('tokens').getList(1, 1, {
      filter: `symbol = "${symbol}"`
    });
    
    if (tokensList.items.length > 0) {
      return tokensList.items[0].id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding token ID for symbol ${symbol}:`, error);
    return null;
  }
}

export async function getTotalBalanceForSymbol(symbol: string): Promise<number> {
  try {
    const tokenId = await getTokenIdFromSymbol(symbol);
    if (!tokenId) {
      console.log(`No token ID found for symbol ${symbol}`);
      return 0;
    }
    
    return getTotalBalanceForToken(tokenId);
  } catch (error) {
    console.error(`Error getting balance for ${symbol}:`, error);
    return 0;
  }
}

export function getTotalBalanceForCurrency(currencySymbol: string): number {
  const userWallets = get(wallets).filter(
    wallet => 
      wallet.userId === get(currentUser).id && 
      wallet.currency === currencySymbol
  );
  
  console.log(`Found ${userWallets.length} wallets for currency ${currencySymbol}`);
  
  // Sum up the balances
  return userWallets.reduce((total, wallet) => {
    const walletBalance = typeof wallet.balance === 'string' 
      ? parseFloat(wallet.balance) || 0 
      : wallet.balance || 0;
    
    return total + walletBalance;
  }, 0);
}

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

export { wallets, selectedWallet, fetchWallets, createWallet, updateWallet, deleteWallet };