import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AnalyticsModel } from '../models/Analytics';

interface JWTUserPayload {
  userId: string;
}

export const setupWebSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // ✅ Middleware: Auth via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTUserPayload;
      const user = await UserModel.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.data.user = user;
      next();
    } catch (err) {
      console.error('WebSocket auth failed:', err);
      next(new Error('Authentication error'));
    }
  });

  // ✅ On Connect
  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🔌 WebSocket connected: ${user.name} (${user.role})`);

    // Join role and scoped rooms
    socket.join(user.role);
    if (user.role === 'kitchen' && user.kitchenCode) {
      socket.join(`kitchen:${user.kitchenCode}`);
    }
    if (user.role === 'customer') {
      socket.join(`customer:${user.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`❌ WebSocket disconnected: ${user.name}`);
    });
  });

  return io;
};
