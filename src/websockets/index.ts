import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import logger from '../utils/logger';
import config from '../config/env';

// Define event types
export enum SocketEvents {
  TRACKER_CREATED = 'tracker:created',
  TRACKER_UPDATED = 'tracker:updated',
  TRACKER_DELETED = 'tracker:deleted',
  TRACKER_ARCHIVED = 'tracker:archived',
  SESSION_STARTED = 'session:started',
  SESSION_STOPPED = 'session:stopped',
  STATS_UPDATED = 'stats:updated',
}

// Socket.io instance
let io: Server;

// Initialize WebSocket server
export const initWebsockets = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const clientId = socket.id;
    logger.info(`Client connected: ${clientId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${clientId}`);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

// Emit events to all connected clients
export const emitEvent = (event: SocketEvents, data: any) => {
  if (!io) {
    logger.warn('Attempted to emit event before WebSocket server initialization');
    return;
  }
  
  logger.debug(`Emitting event: ${event}`);
  io.emit(event, data);
};

// Get the Socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
};
