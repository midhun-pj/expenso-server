import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import custom modules
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import notFoundHandler from './middleware/notFoundHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import groceryRoutes from './routes/groceryRoutes.js';
import supermarketRoutes from './routes/supermarketRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import currenciesRoutes from './routes/currencyRoutes.js';
import productsRoutes from './routes/productRoutes.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/supermarkets', supermarketRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/currencies', currenciesRoutes);

app.use('/api/products', productsRoutes);

// Serve uploaded files (with authentication middleware)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
