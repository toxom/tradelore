import { pb } from '$lib/pocketbase';
import { predefinedTokens } from 'utils/constants'; 
import type { Token } from 'types/walletTypes';

export interface TokenPrice {
  id: string;
  ticker: string;
  name: string;
  price: number;
  priceChangePercentage24h?: number;
  lastUpdated: string;
}

export let errorMessage = '';

export let tokens: Token[] = [];
export let newToken: Token = {
    id: '',
    ticker: '',
    tokenId: '',
    name: '',
    network: '',
    contract_address: '',
    decimal_place: '',
    iconUrl: '',
    isActive: true,
    created_at: '',
    updated_at: '',
};
export let isEditing = false;
export let editingToken: Token | null = null;


export async function populateOrUpdateTokens() {
  for (const token of predefinedTokens) {
    try {
      let existingToken;
      if (token.contractAddress) {
        existingToken = await pb.collection('tokens').getFirstListItem(`contractAddress="${token.contractAddress}"`);
      } else {
        existingToken = await pb.collection('tokens').getFirstListItem(`symbol="${token.symbol}" && network="${token.network}"`);
      }

      if (existingToken) {
        await pb.collection('tokens').update(existingToken.id, { isActive: true });
        console.log(`Token ${token.symbol} updated.`);
      } else {
        const tokenData = await fetchTokenData(token.symbol, token.contractAddress); 
        if (tokenData) {
          await pb.collection('tokens').create({
            symbol: token.symbol,
            name: tokenData.name,
            network: token.network,
            contractAddress: token.contractAddress,
            decimals: tokenData.decimals,
            iconUrl: tokenData.iconUrl,
            isActive: true,
          });
          console.log(`Token ${token.symbol} created.`);
        }
      }
    } catch (error) {
      console.error(`Error processing token ${token.symbol}:`, error);
    }
  }
}

// export async function fetchTokenData(symbol: string, contractAddress?: string) {
//   try {
//     const CoinGecko = require('coingecko-api');
//     const CoinGeckoClient = new CoinGecko();
//     let data;
//     if (contractAddress) {
//       data = await CoinGeckoClient.coins.getContractData(contractAddress, 'ethereum'); // Adjust platform as needed
//     } else {
//       data = await CoinGeckoClient.coins.fetch(symbol.toLowerCase(), {});
//     }
//     return {
//       name: data.name,
//       decimals: data.detail_platforms?.ethereum?.decimal_place || data.platforms?.ethereum?.decimal_place || data.detail_platforms?.binance-smart-chain?.decimal_place || data.platforms?.binance-smart-chain?.decimal_place || 18, // Adjust platform
//       iconUrl: data.image.large,
//     };
//   } catch (error) {
//     console.error(`Error fetching data for ${symbol}:`, error);
//     return null;
//   }
// }

export async function fetchTokens() {
    try {
        tokens = await pb.collection('tokens').getFullList<Token>({
            headers: {
                Authorization: pb.authStore.token,
            },
        });
    } catch (error) {
        console.error('Failed to fetch tokens:', error);
        errorMessage = 'Failed to fetch tokens. Check your permissions.';
    }
}
export async function fetchTokenParents() {
  let uniqueTokens: Token[] = [];
  try {
    const allTokens = await pb.collection('tokens').getFullList<Token>({
      headers: {
        Authorization: pb.authStore.token,
      },
    });
    
    // Create a Map to store unique tokens based on tokenId
    const tokenMap = new Map<string, Token>();
    
    // Populate the map with unique tokens
    allTokens.forEach(token => {
      if (!tokenMap.has(token.tokenId)) {
        tokenMap.set(token.tokenId, token);
      }
    });
    
    // Convert map values back to array
    uniqueTokens = Array.from(tokenMap.values());
    
    return uniqueTokens;
  } catch (error) {
    console.error('Failed to fetch unique tokens:', error);
    throw new Error('Failed to fetch unique tokens. Check your permissions.');
  }
}

export async function fetchTokenData(tokenId: string): Promise<Token[]> {
    try {
      console.log(`Fetching token data for ID: ${tokenId}`);
  
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
      if (!response.ok) {
        console.error(`Error fetching data: ${response.status} ${response.statusText}`);
        return [];
      }
  
      const data = await response.json();
      console.log("Raw API Response:", data);
  
      if (!data.detail_platforms || typeof data.detail_platforms !== "object") {
        console.warn("Missing or invalid 'detail_platforms' field in API response.");
        return [];
      }
  
      // Extract platform entries and log them
      const platformEntries = Object.entries(data.detail_platforms || {});
      console.log("Extracted platform entries:", platformEntries);
  
      if (platformEntries.length === 0) {
        console.warn("No platforms found in 'detail_platforms'.");
        return [];
      }
  
      const tokens: Token[] = platformEntries.map(([network, platformDetails]) => {
        const contract_address = platformDetails?.contract_address || "N/A";
        const decimal_place = platformDetails?.decimal_place?.toString() || "0";
        const image = data.image?.thumb || "N/A"; 
  
        const token: Token = {
          id: data.id || tokenId,
          ticker: (data.symbol || "").toUpperCase(),
          tokenId: data.tokenId || data.id,
          name: data.name || "Unknown Token",
          network, 
          contract_address,
          decimal_place,
          iconUrl: image,
          isActive: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
  
        console.log("Token object created:", token);
        return token;
      });
  
      console.log("Final Tokens Array:", tokens);
      return tokens;
  
    } catch (error) {
      console.error("Error in fetchTokenData:", error);
      return [];
    }
  }

export async function handleAddToken() {
if (newToken.tokenId.trim() === '') {
    errorMessage = 'Symbol is a required field.';
    return;
}

try {
    const tokenData = await fetchTokenData(newToken.tokenId);
    if (!tokenData || tokenData.length === 0) {
        errorMessage = 'Failed to fetch token data. Please check the symbol.';
        return;
    }

    for (const token of tokenData) {
        await pb.collection('tokens').create(
            {
                ...newToken,
                name: token.name,
                ticker: token.ticker,
                network: token.network,
                contract_address: token.contract_address,
                decimal_place: token.decimal_place,
                iconUrl: token.iconUrl,
            },
            {
                headers: {
                    Authorization: pb.authStore.token,
                },
            }
        );
    }

    // Clear the form
    newToken = {
        id: '',
        ticker: '',
        tokenId: '',
        name: '',
        network: '',
        contract_address: '',
        decimal_place: '',
        iconUrl: '',
        isActive: true,
        created_at: '',
        updated_at: '',
    };
    await fetchTokens();
} catch (error) {
    console.error('Failed to add token:', error);
    errorMessage = 'Failed to add token. Check your permissions.';
}
}

export function handleEditToken(token: Token) {
    isEditing = true;
    editingToken = { ...token };
}

export async function handleUpdateToken() {
    try {
        if (editingToken) {
            await pb.collection('tokens').update(editingToken.id, editingToken, {
                headers: {
                    Authorization: pb.authStore.token,
                },
            });
            isEditing = false;
            editingToken = null;
            await fetchTokens();
        }
    } catch (error) {
        console.error('Failed to update token:', error);
        errorMessage = 'Failed to update token. Check your permissions.';
    }
}
export async function fetchTokenPrices(tokens: Token[]): Promise<TokenPrice[]> {
  try {
    // Filter for active tokens
    const activeTokens = tokens.filter(token => token.isActive);
    
    // Extract unique token IDs to avoid duplicate API calls
    const uniqueTokenIds = [...new Set(activeTokens.map(token => token.tokenId))];
    
    if (uniqueTokenIds.length === 0) {
      console.log("No active tokens to fetch prices for");
      return [];
    }
    
    console.log(`Fetching prices for ${uniqueTokenIds.length} unique tokens`);
    
    // Join token IDs with commas for the API call
    const idsParam = uniqueTokenIds.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      console.error(`Error fetching prices: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Received price data for ${data.length} tokens`);
    
    return data.map((item: any) => ({
      id: item.id,
      ticker: item.symbol.toUpperCase(),
      name: item.name,
      price: item.current_price,
      priceChangePercentage24h: item.price_change_percentage_24h,
      lastUpdated: item.last_updated
    }));
    
  } catch (error) {
    console.error("Error in fetchTokenPrices:", error);
    return [];
  }
}