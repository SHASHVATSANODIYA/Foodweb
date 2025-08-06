import { z } from 'zod';
import { OrderModel } from '../models/Order';
import { AuthenticatedRequest } from '../types';

const placeOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  customerInfo: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().optional()
  })
});

const getOrderSchema = z.object({
  orderId: z.string().uuid()
});

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered'])
});

export const orderHandlers = {
  'orders.placeOrder': async (params: any, req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    
    const { items, customerInfo } = placeOrderSchema.parse(params);
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = await OrderModel.create({
      customerId: req.user.id,
      items,
      total,
      customerInfo
    });
    
    return order;
  },

  'orders.getOrder': async (params: any, req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    
    const { orderId } = getOrderSchema.parse(params);
    
    const order = await OrderModel.findById(orderId);
    
    // Customers can only see their own orders
    if (req.user.role === 'customer' && order.customerId !== req.user.id) {
      throw new Error('Access denied');
    }
    
    return order;
  },

  'orders.getCustomerOrders': async (params: any, req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    
    if (req.user.role !== 'customer') {
      throw new Error('Access denied');
    }
    
    return await OrderModel.findByCustomerId(req.user.id);
  },

  'orders.updateStatus': async (params: any, req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    
    if (!['kitchen', 'admin'].includes(req.user.role)) {
      throw new Error('Access denied');
    }
    
    const { orderId, status } = updateStatusSchema.parse(params);
    
    return await OrderModel.updateStatus(orderId, status);
  }
};