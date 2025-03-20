import { pb } from '$lib/pocketbase';
import type { Orderbook } from 'types/orderTypes';

export class OrdersClient {
  static async getOrderbook(pairId: string) {
    try {
      console.log(`[OrdersClient] Fetching orderbook for pairId: ${pairId}`);
      
      // More permissive query - remove status filter temporarily to see if we get any data
      const orders = await pb.collection('orderbook').getList(1, 100, {
        filter: `pairId="${pairId}"`,
        sort: '-created'
      });
      
      console.log(`[OrdersClient] Fetched ${orders.items.length} orders`);
      
      // If we got orders, log the first one to see its structure
      if (orders.items.length > 0) {
        console.log('[OrdersClient] Sample order:', orders.items[0]);
      } else {
        // Try a query with no filters to see if the collection has any data at all
        console.log('[OrdersClient] No orders found with pairId filter, trying without filters...');
        const allOrders = await pb.collection('orderbook').getList(1, 5, {});
        console.log(`[OrdersClient] Collection has ${allOrders.items.length} total orders`);
        if (allOrders.items.length > 0) {
          console.log('[OrdersClient] Sample order from collection:', allOrders.items[0]);
          // Log all pairIds in the collection
          const pairIds = [...new Set(allOrders.items.map(order => order.pairId))];
          console.log('[OrdersClient] Available pairIds in collection:', pairIds);
        }
      }
      
      const result = this.processOrders(orders.items as unknown as Orderbook[]);
      return result;
    } catch (error) {
      console.error('[OrdersClient] Error fetching orderbook:', error);
      return { bids: [], asks: [] };
    }
  }

  private static processOrders(orders: Orderbook[]) {
    if (orders.length === 0) {
      return { bids: [], asks: [] };
    }
    
    // Log the fields of the first order to debug field names
    console.log('[OrdersClient] Order fields:', Object.keys(orders[0]));
    
    // Check for all possible type values
    const types = [...new Set(orders.map(order => order.type))];
    console.log(`[OrdersClient] Order types found: ${types.join(', ')}`);
    
    // More flexible filtering to handle potential case differences
    const bidsArray = orders.filter(order => 
      order.type?.toLowerCase() === 'buy');
    const asksArray = orders.filter(order => 
      order.type?.toLowerCase() === 'sell');
    
    console.log(`[OrdersClient] Found ${bidsArray.length} buy orders and ${asksArray.length} sell orders`);
    
    // Sort bids (buys) in descending order by price
    const sortedBids = bidsArray.sort((a, b) => b.price - a.price);
    
    // Sort asks (sells) in ascending order by price
    const sortedAsks = asksArray.sort((a, b) => a.price - b.price);
    
    // Take the top 10 (or fewer if there aren't 10)
    const bids = this.calculateTotals(sortedBids.slice(0, 10));
    const asks = this.calculateTotals(sortedAsks.slice(0, 10));
    
    return { bids, asks };
  }

  private static calculateTotals(orders: Orderbook[]) {
    let runningTotal = 0;
    
    return orders.map(order => {
      // Use active_amount if it exists, otherwise fall back to amount
      const amount = typeof order.active_amount === 'number' ? 
        order.active_amount : order.amount;
      
      runningTotal += amount;
      
      return {
        price: order.price,
        amount: amount,
        total: runningTotal
      };
    });
  }
}