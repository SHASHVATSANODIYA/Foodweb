import pool from '../database/connection';
import { Order, OrderItem } from '../types';

export class OrderModel {
  static async create(orderData: {
    customerId: string;
    items: Array<{ menuItemId: string; quantity: number; price: number }>;
    total: number;
    customerInfo: { name: string; phone: string; address?: string };
  }): Promise<Order> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderQuery = `
        INSERT INTO orders (customer_id, status, total, customer_info)
        VALUES ($1, $2, $3, $4)
        RETURNING id, customer_id, status, total, customer_info, created_at, updated_at
      `;
      
      const orderValues = [
        orderData.customerId,
        'pending',
        orderData.total,
        JSON.stringify(orderData.customerInfo)
      ];
      
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];
      
      // Create order items
      const itemPromises = orderData.items.map(item => {
        const itemQuery = `
          INSERT INTO order_items (order_id, menu_item_id, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING id, order_id, menu_item_id, quantity, price
        `;
        
        return client.query(itemQuery, [order.id, item.menuItemId, item.quantity, item.price]);
      });
      
      const itemResults = await Promise.all(itemPromises);
      
      await client.query('COMMIT');
      
      // Fetch complete order with items
      return await this.findById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<Order> {
    const orderQuery = `
      SELECT o.id, o.customer_id, o.status, o.total, o.customer_info, o.created_at, o.updated_at,
             u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `;
    
    const itemsQuery = `
      SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.price,
             mi.name, mi.description, mi.category, mi.image
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
    `;
    
    const [orderResult, itemsResult] = await Promise.all([
      pool.query(orderQuery, [id]),
      pool.query(itemsQuery, [id])
    ]);
    
    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    return this.mapDbOrder(orderResult.rows[0], itemsResult.rows);
  }

  static async findByCustomerId(customerId: string): Promise<Order[]> {
    const orderQuery = `
      SELECT o.id, o.customer_id, o.status, o.total, o.customer_info, o.created_at, o.updated_at,
             u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `;
    
    const orderResult = await pool.query(orderQuery, [customerId]);
    
    if (orderResult.rows.length === 0) {
      return [];
    }
    
    const orderIds = orderResult.rows.map(row => row.id);
    
    const itemsQuery = `
      SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.price,
             mi.name, mi.description, mi.category, mi.image
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ANY($1)
    `;
    
    const itemsResult = await pool.query(itemsQuery, [orderIds]);
    
    return orderResult.rows.map(orderRow => {
      const orderItems = itemsResult.rows.filter(item => item.order_id === orderRow.id);
      return this.mapDbOrder(orderRow, orderItems);
    });
  }

  static async findAll(): Promise<Order[]> {
    const orderQuery = `
      SELECT o.id, o.customer_id, o.status, o.total, o.customer_info, o.created_at, o.updated_at,
             u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `;
    
    const orderResult = await pool.query(orderQuery);
    
    if (orderResult.rows.length === 0) {
      return [];
    }
    
    const orderIds = orderResult.rows.map(row => row.id);
    
    const itemsQuery = `
      SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.price,
             mi.name, mi.description, mi.category, mi.image
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ANY($1)
    `;
    
    const itemsResult = await pool.query(itemsQuery, [orderIds]);
    
    return orderResult.rows.map(orderRow => {
      const orderItems = itemsResult.rows.filter(item => item.order_id === orderRow.id);
      return this.mapDbOrder(orderRow, orderItems);
    });
  }

  static async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    return await this.findById(id);
  }

  private static mapDbOrder(dbOrder: any, dbItems: any[]): Order {
    const items: OrderItem[] = dbItems.map(dbItem => ({
      id: dbItem.id,
      orderId: dbItem.order_id,
      menuItemId: dbItem.menu_item_id,
      quantity: dbItem.quantity,
      price: parseFloat(dbItem.price),
      menuItem: dbItem.name ? {
        id: dbItem.menu_item_id,
        name: dbItem.name,
        description: dbItem.description,
        price: parseFloat(dbItem.price),
        category: dbItem.category,
        image: dbItem.image,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined
    }));

    return {
      id: dbOrder.id,
      customerId: dbOrder.customer_id,
      items,
      status: dbOrder.status,
      total: parseFloat(dbOrder.total),
      createdAt: dbOrder.created_at.toISOString(),
      updatedAt: dbOrder.updated_at.toISOString(),
      customerInfo: typeof dbOrder.customer_info === 'string' 
        ? JSON.parse(dbOrder.customer_info) 
        : dbOrder.customer_info,
      customer: dbOrder.customer_name ? {
        id: dbOrder.customer_id,
        name: dbOrder.customer_name,
        email: dbOrder.customer_email,
        role: 'customer' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined
    };
  }
}