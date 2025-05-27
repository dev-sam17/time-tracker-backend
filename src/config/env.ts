import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Fall back to .env if specific environment file doesn't exist
// dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
  // Server configuration
  port: parseInt(process.env.PORT || '3210', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  databaseUrl: process.env.DATABASE_URL,
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Determine if we're in development mode
  isDev: () => environment === 'development',
  
  // Determine if we're in production mode
  isProd: () => environment === 'production',
};
