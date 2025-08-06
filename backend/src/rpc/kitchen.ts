import { OrderModel } from '../models/Order';
import { AuthenticatedRequest } from '../types';

export const kitchenHandlers = {
  'kitchen.getOrders': async (params: any, req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    
    if (!['kitchen', 'admin'].includes(req.user.role)) {
      throw new Error('Access denied');
    }
    
    return await OrderModel.findAll();
  }
};