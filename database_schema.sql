
-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table (minimal since we're using external auth)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    external_auth_id TEXT UNIQUE NOT NULL, -- Auth provider user ID
    auth_provider TEXT DEFAULT 'supabase', -- 'supabase', 'auth0', 'firebase'
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Supermarkets master table
CREATE TABLE supermarkets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT,        -- Hex color for UI
    icon TEXT,         -- Icon name/emoji
    is_income BOOLEAN DEFAULT FALSE,  -- TRUE for income categories
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE TABLE currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(3) UNIQUE NOT NULL,   -- ISO 4217 Currency Code like 'USD', 'EUR'
    name TEXT NOT NULL,                -- Currency Name, e.g. 'US Dollar'
    symbol TEXT,                      -- Currency Symbol, e.g. '$', '€'
    decimal_places INTEGER DEFAULT 2, -- Number of decimal places usually 2
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- Main expenses table
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    supermarket_id INTEGER, -- NULL for non-grocery expenses
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    expense_date DATE NOT NULL,
    payment_method TEXT, -- 'cash', 'credit_card', 'debit_card', 'online', etc.
    receipt_url TEXT, -- Path to uploaded receipt image
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
    is_processed_from_receipt BOOLEAN DEFAULT FALSE, -- TRUE if created from OCR
    raw_ocr_data TEXT, -- Store original OCR response as JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (supermarket_id) REFERENCES supermarkets (id)
);

CREATE TABLE grocery_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    brand TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- Grocery items table (for detailed grocery receipts)
CREATE TABLE grocery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL,
    supermarket_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL, 
    quantity DECIMAL(8, 3) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'piece',
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
    FOREIGN KEY (supermarket_id) REFERENCES supermarkets (id)
    FOREIGN KEY (product_id) REFERENCES grocery_products (id)
);

-- Budget tracking table
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER, -- NULL for total budget
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    period TEXT NOT NULL, -- 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    alert_percentage DECIMAL(5, 2) DEFAULT 80, -- Alert when 80% of budget is used
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- Income tracking table
CREATE TABLE income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER, -- Income category
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    income_date DATE NOT NULL,
    source TEXT, -- 'salary', 'freelance', 'investment', etc.
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Receipt processing queue (for OCR processing)
CREATE TABLE receipt_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    ocr_service TEXT, -- 'tabscanner', 'veryfi', 'mindee', etc.
    ocr_response TEXT, -- JSON response from OCR service
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- User sessions for managing multiple logins
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    device_info TEXT, -- User agent, device type
    ip_address TEXT,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_grocery_items_expense_id ON grocery_items(expense_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_receipt_queue_status ON receipt_queue(processing_status);

-- Insert default categories
INSERT INTO categories (id, user_id, name, color, icon, is_income, parent_category_id) VALUES 
-- Default expense categories (user_id will be set when user registers)
(1, 0, 'Groceries', '#4CAF50', '🛒', FALSE, NULL),
(2, 0, 'Transportation', '#2196F3', '🚗', FALSE, NULL),
(3, 0, 'Entertainment', '#E91E63', '🎬', FALSE, NULL),
(4, 0, 'Bills & Utilities', '#FF9800', '💡', FALSE, NULL),
(5, 0, 'Healthcare', '#9C27B0', '🏥', FALSE, NULL),
(6, 0, 'Dining Out', '#F44336', '🍽️', FALSE, NULL),
(7, 0, 'Shopping', '#673AB7', '🛍️', FALSE, NULL),
(8, 0, 'Travel', '#00BCD4', '✈️', FALSE, NULL),
-- Default income categories
(9, 0, 'Salary', '#4CAF50', '💰', TRUE, NULL),
(10, 0, 'Freelance', '#8BC34A', '💼', TRUE, NULL),
(11, 0, 'Investment', '#CDDC39', '📈', TRUE, NULL),
(12, 0, 'Other Income', '#FFC107', '💳', TRUE, NULL);
