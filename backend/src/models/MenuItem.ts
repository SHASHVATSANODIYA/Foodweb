import { v4 as uuidv4 } from 'uuid';
import pool from '../database/connection';
import { MenuItem } from '../types';

export class MenuItemModel {
  static async findAll(): Promise<MenuItem[]> {
    const query = `
      SELECT id, name, description, price, category, image, available, created_at, updated_at
      FROM menu_items
      WHERE available = true
      ORDER BY category, name
    `;
    
    const result = await pool.query(query);
    return result.rows.map(this.mapDbMenuItem);
  }

  static async findById(id: string): Promise<MenuItem | null> {
    const query = `
      SELECT id, name, description, price, category, image, available, created_at, updated_at
      FROM menu_items
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapDbMenuItem(result.rows[0]) : null;
  }

  /**
   * Get popular menu items by order frequency for a specific kitchen.
   * @param limit number of items to return
   * @param kitchenId the kitchen ID to filter by
   */
  static async getPopularItems(limit: number = 5, kitchenId?: string): Promise<MenuItem[]> {
    let query: string;
    let params: any[];
    if (kitchenId) {
      query = `
        SELECT mi.id, mi.name, mi.description, mi.price, mi.category, mi.image, mi.available, 
               mi.created_at, mi.updated_at, COUNT(oi.id) as order_count
        FROM menu_items mi
        JOIN order_items oi ON mi.id = oi.menu_item_id
        JOIN orders o ON o.id = oi.order_id
        WHERE mi.available = true AND o.kitchen_id = $1
        GROUP BY mi.id, mi.name, mi.description, mi.price, mi.category, mi.image, mi.available, mi.created_at, mi.updated_at
        ORDER BY order_count DESC, mi.name
        LIMIT $2
      `;
      params = [kitchenId, limit];
    } else {
      query = `
        SELECT mi.id, mi.name, mi.description, mi.price, mi.category, mi.image, mi.available, 
               mi.created_at, mi.updated_at, COUNT(oi.id) as order_count
        FROM menu_items mi
        JOIN order_items oi ON mi.id = oi.menu_item_id
        JOIN orders o ON o.id = oi.order_id
        WHERE mi.available = true
        GROUP BY mi.id, mi.name, mi.description, mi.price, mi.category, mi.image, mi.available, mi.created_at, mi.updated_at
        ORDER BY order_count DESC, mi.name
        LIMIT $1
      `;
      params = [limit];
    }
    const result = await pool.query(query, params);
    return result.rows.map(this.mapDbMenuItem);
  }

  static async create(data: {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    available?: boolean;
  }): Promise<MenuItem> {
    const id = uuidv4();
    const {
      name,
      description,
      price,
      category,
      image = null,
      available = true,
    } = data;

    const query = `
      INSERT INTO menu_items (id, name, description, price, category, image, available)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [id, name, description, price, category, image, available];
    const result = await pool.query(query, values);
    return this.mapDbMenuItem(result.rows[0]);
  }

  private static mapDbMenuItem(dbItem: any): MenuItem {
    return {
      id: dbItem.id,
      name: dbItem.name,
      description: dbItem.description,
      price: parseFloat(dbItem.price),
      category: dbItem.category,
      image: dbItem.image,
      available: dbItem.available,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
    };
  }
}
