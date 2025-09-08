import app from './app.js';
import logger from './utils/logger.js';

import { database } from './config/database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await database.connect();
  // Optionally: await database.initSchema();
  app.listen(process.env.PORT || 3400, () => {
    console.log(`Server running on port ${process.env.PORT || 3400}`);
  });
}

startServer();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});
