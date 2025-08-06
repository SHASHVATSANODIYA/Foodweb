import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: 401,
        message: 'Access token required'
      },
      id: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        jsonrpc: '2.0',
        error: {
          code: 401,
          message: 'Invalid token'
        },
        id: null
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      jsonrpc: '2.0',
      error: {
        code: 403,
        message: 'Invalid or expired token'
      },
      id: null
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        jsonrpc: '2.0',
        error: {
          code: 403,
          message: 'Insufficient permissions'
        },
        id: null
      });
    }
    next();
  };
};