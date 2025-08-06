import pool from '../database/connection';
import { MenuItemModel } from './MenuItem';
import { Analytics } from '../types';

export class AnalyticsModel {
  static async getDashboardStats(kitchenCode?: string): Promise<Analytics> {
    const client = await pool.connect();
    try {
      let kitchenId: string | undefined = undefined;
      if (kitchenCode) {
        // Look up kitchen UUID from users table using kitchenCode
        const kitchenIdResult = await client.query(
          `SELECT id FROM users WHERE role = 'kitchen' AND kitchen_code = $1 LIMIT 1`,
          [kitchenCode]
        );
        if (!kitchenIdResult.rows.length || !kitchenIdResult.rows[0].id) {
          throw new Error('No kitchen user found for the given kitchen code');
        }
        kitchenId = kitchenIdResult.rows[0].id;
      }

      // Get total orders
      let totalOrders = 0;
      if (kitchenId) {
        const totalOrdersQuery = 'SELECT COUNT(*) as count FROM orders WHERE kitchen_id = $1';
        const totalOrdersResult = await client.query(totalOrdersQuery, [kitchenId]);
        totalOrders = parseInt(totalOrdersResult.rows[0].count);
      } else {
        const totalOrdersQuery = 'SELECT COUNT(*) as count FROM orders';
        const totalOrdersResult = await client.query(totalOrdersQuery);
        totalOrders = parseInt(totalOrdersResult.rows[0].count);
      }

      // Get total revenue
      let revenue = 0;
      if (kitchenId) {
        const revenueQuery = 'SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = $1 AND kitchen_id = $2';
        const revenueResult = await client.query(revenueQuery, ['delivered', kitchenId]);
        revenue = parseFloat(revenueResult.rows[0].revenue);
      } else {
        const revenueQuery = 'SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = $1';
        const revenueResult = await client.query(revenueQuery, ['delivered']);
        revenue = parseFloat(revenueResult.rows[0].revenue);
      }

      // Get orders today
      let ordersToday = 0;
      if (kitchenId) {
        const todayQuery = `
          SELECT COUNT(*) as count 
          FROM orders 
          WHERE DATE(created_at) = CURRENT_DATE AND kitchen_id = $1
        `;
        const todayResult = await client.query(todayQuery, [kitchenId]);
        ordersToday = parseInt(todayResult.rows[0].count);
      } else {
        const todayQuery = `
          SELECT COUNT(*) as count 
          FROM orders 
          WHERE DATE(created_at) = CURRENT_DATE
        `;
        const todayResult = await client.query(todayQuery);
        ordersToday = parseInt(todayResult.rows[0].count);
      }

      // Get popular items
      const popularItems = kitchenId
        ? await MenuItemModel.getPopularItems(5, kitchenId)
        : await MenuItemModel.getPopularItems(5, undefined as any); // You may want to adjust getPopularItems to support all kitchens

      return {
        totalOrders,
        revenue,
        popularItems,
        ordersToday
      };
    } finally {
      client.release();
    }
  }
}