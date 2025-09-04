# Expense Manager API

Expense management API with receipt OCR processing, built with Node.js, Express, and SQLite.

## 🚀 Features

- **User Authentication**: Secure authentication with Supabase integration
- **Expense Management**: Complete CRUD operations for expenses
- **Receipt OCR**: Automatic receipt processing with multiple OCR providers
- **Budget Tracking**: Set and monitor budgets with alerts
- **Income Tracking**: Track multiple income sources
- **Category Management**: Customizable expense and income categories
- **Grocery Item Details**: Detailed line-item tracking for grocery receipts
- **Dashboard Analytics**: Comprehensive spending insights
- **Multi-Currency Support**: Handle expenses in different currencies
- **File Upload**: Secure receipt image/PDF upload with optimization
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Comprehensive error handling and logging
- **Database Migrations**: Automated database setup and migrations

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3 with WAL mode
- **Authentication**: Supabase Auth
- **OCR Services**: Tabscanner, Veryfi, Mindee
- **File Processing**: Sharp for image optimization
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Supabase account (for authentication)
- OCR service API keys (optional, for receipt processing)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/midhun-pj/expenso-server.git
cd expenso-server
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration  
DB_PATH=./data/expense_manager.db

# Authentication (Required)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OCR Services (Optional)
TABSCANNER_API_KEY=your_tabscanner_api_key
VERYFI_CLIENT_ID=your_veryfi_client_id
VERYFI_API_KEY=your_veryfi_api_key
MINDEE_API_KEY=your_mindee_api_key
```

### 3. Database Setup

```bash
# Run migrations and seed data
npm run migrate
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/reset-password` - Reset password

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget with spending
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Income
- `GET /api/income` - List income entries
- `POST /api/income` - Create income entry
- `PUT /api/income/:id` - Update income entry
- `DELETE /api/income/:id` - Delete income entry

### Receipts
- `POST /api/receipts/upload` - Upload and process receipt
- `GET /api/receipts/queue` - Get processing queue
- `GET /api/receipts/:id` - Get processed receipt data

### Dashboard
- `GET /api/dashboard/overview` - Financial overview
- `GET /api/dashboard/spending-by-category` - Category breakdown
- `GET /api/dashboard/monthly-trends` - Monthly spending trends

## 🏗 Project Structure

```
expense-manager-api/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── database/         # Database setup and migrations
│   ├── middleware/       # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── uploads/             # File uploads directory
├── logs/               # Application logs
├── tests/              # Test files
├── docs/               # API documentation
├── .env.example        # Environment template
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Configuration

### Database
- Uses SQLite with WAL mode for better performance
- Automatic migrations on startup
- Foreign key constraints enabled
- Optimized with proper indexing

### Authentication
- Supabase for user management
- JWT tokens for API authentication
- Session management for multiple devices
- Password reset functionality

### File Upload
- Image optimization with Sharp
- PDF support for receipts
- File size and type validation
- Automatic cleanup of old files

### OCR Integration
- Multiple OCR provider support
- Automatic fallback between services
- Normalized response format
- Error handling and retries

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- Strong `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Valid Supabase credentials
- OCR service API keys

### Security Considerations
- Use HTTPS in production
- Configure proper CORS origins
- Set up database backups
- Monitor logs and metrics
- Regular security updates

## 📊 Database Schema

The application uses the following main entities:
- **Users**: User accounts and authentication
- **Categories**: Expense and income categories
- **Expenses**: Individual expense records
- **Income**: Income tracking
- **Budgets**: Budget planning and monitoring
- **Grocery Items**: Detailed line items for receipts
- **Supermarkets**: Store information
- **Receipt Queue**: OCR processing queue

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 API Documentation

Visit `/` for API endpoint documentation when the server is running.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
