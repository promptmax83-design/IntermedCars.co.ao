-- IntermedCars Migration: Add verification_codes table
-- Run: mysql -u root intermedcars < database/migrations/003_add_verification_codes.sql

CREATE TABLE IF NOT EXISTS verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    target_type ENUM('email', 'phone') NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose ENUM('registration', 'login', 'password_reset') NOT NULL DEFAULT 'registration',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    verified BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_target (target_type, target_value),
    INDEX idx_code (code),
    INDEX idx_purpose (purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
