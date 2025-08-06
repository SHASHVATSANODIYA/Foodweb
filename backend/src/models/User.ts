import pool from '../database/connection';
import bcrypt from 'bcryptjs';
import { User } from '../types';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    
    const query = `
      INSERT INTO users (name, email, password, role, kitchen_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, kitchen_code, created_at, updated_at
    `;
    
    const values = [
      userData.name,
      userData.email,
      hashedPassword,
      userData.role,
      userData.kitchenCode || null
    ];
    
    const result = await pool.query(query, values);
    return this.mapDbUser(result.rows[0]);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    return result.rows.length > 0 ? this.mapDbUser(result.rows[0]) : null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0 ? this.mapDbUser(result.rows[0]) : null;
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return await bcrypt.compare(password, user.password);
  }

  private static mapDbUser(dbUser: any): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      password: dbUser.password,
      role: dbUser.role,
      kitchenCode: dbUser.kitchen_code,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    };
  }
}