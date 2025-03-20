import { writable, get, derived } from 'svelte/store';
import { pb, currentUser } from '$lib/pocketbase';
import type { Pair } from 'types/orderTypes';
import type { Token, Wallet } from 'types/walletTypes';
import type { RecordModel } from 'pocketbase';
import type { User } from 'types/accounts';

export const pairs = writable<Pair[]>([]);
export const selectedPair = writable<Pair | null>(null);
export const tokens = writable<Token[]>([]);
export const wallets = writable<Wallet[]>([]);
export const favoriteTokenIds = writable<Set<string>>(new Set());
export const favoritePairIds = writable<Set<string>>(new Set());
export const isDataLoaded = writable<boolean>(false);

export async function initFavorites() {
    console.log('Initializing favorites from user data');
    
    if (!pb.authStore.isValid) {
        console.log('User not authenticated, clearing favorites');
        favoriteTokenIds.set(new Set());
        favoritePairIds.set(new Set());
        return;
    }
    
    try {
        // Fetch the latest user data to ensure we have current favorites
        const userId = pb.authStore.model.id;
        const user = await pb.collection('users').getOne(userId);
        
        // Initialize token favorites
        const savedTokenFavorites = user.favoriteTokens || [];
        console.log('Loading token favorites:', savedTokenFavorites);
        favoriteTokenIds.set(new Set(savedTokenFavorites));
        
        // Initialize pair favorites
        const savedPairFavorites = user.favoritePairs || [];
        console.log('Loading pair favorites:', savedPairFavorites);
        favoritePairIds.set(new Set(savedPairFavorites));
        
        console.log('Favorites initialized successfully');
    } catch (error) {
        console.error('Failed to load favorites:', error);
        favoriteTokenIds.set(new Set());
        favoritePairIds.set(new Set());
    }
}

export async function loadWallets() {
    try {
        if (!pb.authStore.isValid) {
            console.log('User not authenticated, cannot load wallets');
            return;
        }
        
        const userId = pb.authStore.model?.id;
        console.log('Loading wallets for user:', userId);
        
        if (!userId) {
            console.error('User ID is undefined or null');
            return;
        }
        
        try {
            // Try getting wallets without any filter first
            const allWallets = await pb.collection('wallets').getFullList();
            console.log('All wallets:', allWallets);
            
            // Filter and map the results to match the Wallet interface
            const userWallets: Wallet[] = allWallets
                .filter(wallet => {
                    // Check if this wallet belongs to the current user
                    return (typeof wallet.user === 'string' && wallet.user === userId) || 
                           (typeof wallet.user === 'object' && wallet.user?.id === userId);
                })
                .map(wallet => {
                    // Cast the record to match the Wallet interface
                    return {
                        id: wallet.id,
                        user: typeof wallet.user === 'object' ? wallet.user.id : wallet.user,
                        currency: wallet.currency || '',
                        amount: Number(wallet.amount) || 0
                    } as Wallet;
                });
            
            console.log('Mapped user wallets:', userWallets);
            wallets.set(userWallets);
        } catch (error) {
            console.error('Error loading wallets:', error);
            wallets.set([]);
        }
    } catch (error) {
        console.error('Error in main loadWallets function:', error);
        wallets.set([]);
    }
}

selectedPair.subscribe(pair => {
    console.log('selectedPair changed:', pair);
    
    if (pair && get(isDataLoaded) && get(wallets).length === 0) {
        console.log("Pair selected but wallets empty. Attempting to reload wallets.");
        loadWallets();
    }
});

export const availableBalances = derived(
    [selectedPair, wallets, isDataLoaded],
    ([$selectedPair, $wallets, $isDataLoaded]) => {
        console.log('Calculating available balances:');
        console.log('- Data loaded:', $isDataLoaded);
        console.log('- Wallets count:', $wallets.length);
        console.log('- Selected pair:', $selectedPair);
        
        if (!$selectedPair) {
            console.log('No pair selected when calculating available balances');
            return { buy: 0, sell: 0 };
        }
        
        if ($wallets.length === 0) {
            console.log('Wallets array is empty, trying to load wallets now');
            // This is a side-effect in a derived store, which isn't ideal
            // but can help in this situation
            setTimeout(() => loadWallets(), 0);
            return { buy: 0, sell: 0 };
        }
        
        // Find matching wallets
        const buyWallets = $wallets.filter(wallet => 
            wallet.currency.toLowerCase() === $selectedPair.quote_token.toLowerCase()
        );
        
        const sellWallets = $wallets.filter(wallet => 
            wallet.currency.toLowerCase() === $selectedPair.base_token.toLowerCase()
        );
        
        console.log('Matching buy wallets:', buyWallets);
        console.log('Matching sell wallets:', sellWallets);
        
        // Sum the balances
        const buyBalance = buyWallets
            .reduce((total, wallet) => total + (wallet.amount || 0), 0);
        
        const sellBalance = sellWallets
            .reduce((total, wallet) => total + (wallet.amount || 0), 0);
        
        console.log(`Available balances for ${$selectedPair.base_token}/${$selectedPair.quote_token}: Buy=${buyBalance}, Sell=${sellBalance}`);
        
        return {
            buy: buyBalance,
            sell: sellBalance
        };
    }
);

export function getPairsForToken(ticker: string): Pair[] {
    const allPairs = get(pairs);
    const result = allPairs.filter(pair => 
        pair.base_token === ticker || pair.quote_token === ticker
    );
    
    console.log(`Found ${result.length} pairs for token ${ticker}`);
    return result;
}

export function selectPair(pair: Pair): void {
    console.log('Selecting pair:', pair);
    selectedPair.set(pair);
    
    if (get(wallets).length === 0) {
        console.log("Wallets empty after selecting pair. Reloading wallets.");
        loadWallets();
    }
}

// Function to load pairs
export async function loadPairs() {
    try {
        console.log('Loading pairs from pocketbase');
        const pairsData = await pb.collection('pairs').getFullList();
        
        // Map PocketBase records to your Pair interface
        const mappedPairs: Pair[] = pairsData.map(record => {
            return {
                id: record.id,
                base_token: record.base_token || '',
                quote_token: record.quote_token || '',
                is_active: record.is_active === true,
                lastPrice: record.lastPrice || 0,
                volume_24h: record.volume_24h || 0,
                created: record.created || '',
                updated: record.updated || ''
            } as Pair;
        });
        
        console.log('Loaded pairs:', mappedPairs);
        pairs.set(mappedPairs);
    } catch (error) {
        console.error('Error loading pairs:', error);
    }
}

// Function to load tokens
export async function loadTokens() {
    try {
        console.log('Loading tokens from pocketbase');
        const tokensData = await pb.collection('tokens').getFullList();
        
        // Map PocketBase records to your Token interface
        const mappedTokens: Token[] = tokensData.map(record => {
            return {
                id: record.id,
                tokenId: record.tokenId || record.id, // Fallback if tokenId is not defined
                name: record.name || '',
                ticker: record.ticker || '',
                iconUrl: record.iconUrl || ''
            } as Token;
        });
        
        console.log('Loaded tokens:', mappedTokens);
        tokens.set(mappedTokens);
    } catch (error) {
        console.error('Error loading tokens:', error);
    }
}

export async function initOrderData() {
    console.log('Initializing order data');
    isDataLoaded.set(false);
    
    try {
        await initFavorites();
        
        await Promise.all([
            loadPairs(),
            loadTokens(),
            loadWallets()
        ]);
        
        const allPairs = get(pairs);
        if (allPairs.length > 0 && !get(selectedPair)) {
            const firstActivePair = allPairs.find(pair => pair.is_active);
            if (firstActivePair) {
                console.log('Auto-selecting first active pair:', firstActivePair);
                selectedPair.set(firstActivePair);
            }
        }
        
        isDataLoaded.set(true);
        console.log('Order data initialization complete. Data loaded:', true);
        console.log('Token favorites loaded:', get(favoriteTokenIds).size);
        console.log('Pair favorites loaded:', get(favoritePairIds).size);
    } catch (error) {
        console.error('Error initializing order data:', error);
        isDataLoaded.set(false);
    }
}
