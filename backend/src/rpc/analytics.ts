import { AnalyticsModel } from '../models/Analytics';
import { AuthenticatedRequest } from '../types';

export const analyticsHandlers = {
  'analytics.getDashboardStats': async (_params: any, req: AuthenticatedRequest) => {
    if (!req.user) throw new Error('Authentication required');
    if (!['admin', 'kitchen'].includes(req.user.role)) throw new Error('Access denied');

    const kitchenId = req.user.kitchenCode;
    if (!kitchenId) throw new Error('Missing kitchen code');

    return await AnalyticsModel.getDashboardStats(kitchenId);
  }
};
