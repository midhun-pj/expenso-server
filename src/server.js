import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Expense Tracker API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

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

export default server;
