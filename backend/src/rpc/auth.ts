import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../types';

const registerCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

const registerKitchenSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  kitchenCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authHandlers = {
  'auth.registerCustomer': async (params: any) => {
    const { name, email, password } = registerCustomerSchema.parse(params);
    
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    const user = await UserModel.create({
      name,
      email,
      password,
      role: 'customer'
    });
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword
    };
  },

  'auth.registerKitchen': async (params: any) => {
    const { name, email, password, kitchenCode } = registerKitchenSchema.parse(params);
    
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    const user = await UserModel.create({
      name,
      email,
      password,
      role: 'kitchen',
      kitchenCode: kitchenCode || 'MAIN_KITCHEN'
    });
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword
    };
  },

  'auth.login': async (params: any) => {
    const { email, password } = loginSchema.parse(params);
    
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const isValidPassword = await UserModel.validatePassword(user, password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword
    };
  },

  'auth.logout': async (params: any, req: AuthenticatedRequest) => {
    // In a more sophisticated implementation, you might maintain a blacklist of tokens
    // For now, we'll just return success since JWT tokens are stateless
    return { success: true };
  }
};