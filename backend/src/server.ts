import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { handleRpcRequest } from './rpc';
import { setupWebSocket, emitOrderCreated, emitOrderUpdated } from './websocket';
import { authenticateToken } from './middleware/auth';
import { AuthenticatedRequest } from './types';
import { createTables } from './database/migrate';
import { seedData } from './database/seed';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

// Setup WebSocket
const io = setupWebSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// RPC endpoint with conditional authentication
app.post('/rpc', async (req: AuthenticatedRequest, res, next) => {
  const { method } = req.body;
  
  // Methods that don't require authentication
  const publicMethods = [
    'auth.login',
    'auth.registerCustomer',
    'auth.registerKitchen',
    'menu.getMenu',
    'menu.getItem'
  ];
  
  if (publicMethods.includes(method)) {
    return handleRpcRequest(req, res);
  }
  
  // Apply authentication middleware for protected methods
  authenticateToken(req, res, () => {
    handleRpcRequest(req, res);
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    jsonrpc: '2.0',
    error: {
      code: -32603,
      message: 'Internal server error'
    },
    id: null
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: 'Endpoint not found'
    },
    id: null
  });
});

// Store io instance globally for use in RPC handlers
declare global {
  var io: any;
}
global.io = io;

// Database initialization and server startup
const startServer = async () => {
  try {
    console.log('Initializing database...');
    await createTables();
    
    console.log('Seeding initial data...');
    await seedData();
    
    server.listen(port, () => {
      console.log(`🚀 Food Ordering Backend running on port ${port}`);
      console.log(`📡 RPC endpoint: http://localhost:${port}/rpc`);
      console.log(`🔌 WebSocket endpoint: ws://localhost:${port}`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export { io };