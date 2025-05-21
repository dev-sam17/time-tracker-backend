import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Create a singleton instance of PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
    ],
  });
};

// Define the global type for PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Use global variable to store the client in development to prevent multiple instances
const prisma = global.prisma ?? prismaClientSingleton();

// Log queries in development mode
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: {query: string; duration: number}) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
  
  prisma.$on('error', (e: {message: string}) => {
    logger.error(`Prisma Error: ${e.message}`);
  });
}

// Set global prisma instance in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
