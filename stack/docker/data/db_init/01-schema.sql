-- MySQL initialization script for Promptly application

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS promptly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the promptly database
USE promptly;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified DATETIME,
  password VARCHAR(255),
  image VARCHAR(2048),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  example_outputs TEXT,
  suggested_model VARCHAR(100) NOT NULL,
  image VARCHAR(2048),
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create prompt_categories junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS prompt_categories (
  prompt_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (prompt_id, category_id),
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id VARCHAR(36) PRIMARY KEY,
  prompt_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Ensure a user can only rate a prompt once
  UNIQUE (prompt_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY,
  prompt_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create follows table (for user following functionality)
CREATE TABLE IF NOT EXISTS follows (
  follower_id VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Prevent users from following themselves
  CHECK (follower_id != following_id)
);

-- Create saved_prompts table (for users to save prompts)
CREATE TABLE IF NOT EXISTS saved_prompts (
  user_id VARCHAR(36) NOT NULL,
  prompt_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, prompt_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Insert initial categories
INSERT INTO categories (id, name) VALUES 
  (UUID(), 'marketing'),
  (UUID(), 'product'),
  (UUID(), 'e-commerce'),
  (UUID(), 'social media'),
  (UUID(), 'sales'),
  (UUID(), 'creative writing'),
  (UUID(), 'programming'),
  (UUID(), 'business'),
  (UUID(), 'education'),
  (UUID(), 'customer service');

-- Create NextAuth.js tables
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider_type VARCHAR(255) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY provider_providerAccountId_key (provider_id, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  expires DATETIME NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_comments_prompt_id ON comments(prompt_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_ratings_prompt_id ON ratings(prompt_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_saved_prompts_user_id ON saved_prompts(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
