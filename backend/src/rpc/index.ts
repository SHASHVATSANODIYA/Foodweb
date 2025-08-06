import { Request, Response } from 'express';
import { RpcRequest, RpcResponse, AuthenticatedRequest } from '../types';
import { authHandlers } from './auth';
import { menuHandlers } from './menu';
import { orderHandlers } from './orders';
import { kitchenHandlers } from './kitchen';
import { analyticsHandlers } from './analytics';

const handlers = {
  ...authHandlers,
  ...menuHandlers,
  ...orderHandlers,
  ...kitchenHandlers,
  ...analyticsHandlers
};

export const handleRpcRequest = async (req: AuthenticatedRequest, res: Response) => {
  const rpcRequest: RpcRequest = req.body;
  
  // Validate JSON-RPC 2.0 format
  if (rpcRequest.jsonrpc !== '2.0' || !rpcRequest.method || rpcRequest.id === undefined) {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request'
      },
      id: rpcRequest.id || null
    });
  }
  
  const handler = handlers[rpcRequest.method as keyof typeof handlers];
  
  if (!handler) {
    return res.status(404).json({
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: 'Method not found'
      },
      id: rpcRequest.id
    });
  }
  
  try {
    const result = await handler(rpcRequest.params, req);
    
    const response: RpcResponse = {
      jsonrpc: '2.0',
      result,
      id: rpcRequest.id
    };
    
    res.json(response);
  } catch (error) {
    console.error('RPC Error:', error);
    
    const response: RpcResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      },
      id: rpcRequest.id
    };
    
    res.status(500).json(response);
  }
};