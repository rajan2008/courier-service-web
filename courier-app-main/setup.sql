-- Create database (Commented out as you are likely already connected to it)
-- CREATE DATABASE courier_app;
-- \c courier_app;

-- 1. Create tables if they don't exist (Base structure)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','courier_admin','customer','employee')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pending_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    courier_owner VARCHAR(100),
    phone VARCHAR(20),
    otp VARCHAR(10) NOT NULL,
    otp_expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    local_awb VARCHAR(50) UNIQUE NOT NULL,
    partner_awb VARCHAR(50),
    pickup_pincode VARCHAR(10),
    delivery_pincode VARCHAR(10),
    weight NUMERIC(10,2),
    price NUMERIC(10,2),
    status VARCHAR(30) DEFAULT 'pending',
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add missing columns to 'users' table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS courier_owner VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Add constraints if missing (Harder to check conditionally in pure SQL without PL/pgSQL, but let's assume constraints are fine or handled by app logic for now)
-- However, we can ensure the role constraint exists by simply re-declaring it if creating from scratch, but ALTER CHECK is tricky.
-- For now, adding the columns is the critical part to fix the INSERT error.

-- 3. Add missing columns to 'shipments' table if they don't exist
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS courier_owner VARCHAR(100);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS assigned_to INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_address TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(20);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_city VARCHAR(100);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_state VARCHAR(100);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_name VARCHAR(100);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_address TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_phone VARCHAR(20);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_city VARCHAR(100);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_state VARCHAR(100);

-- 4. Insert default super admin (if email doesn't exist)
INSERT INTO users (name, email, phone, password, role, is_verified)
VALUES (
    'Super Admin',
    'rajanprajapati41190@gmail.com',
    '9999999999',
    '$2b$10$CwTycUXWue0Thq9StjUM0uJ8e6Mq8a0eQnB8r/8wWjOgrnJ7tHtQy', -- bcrypt hash for "admin123"
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;
