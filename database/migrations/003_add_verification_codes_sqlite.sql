CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT NULL,
    target_type TEXT NOT NULL CHECK(target_type IN ('email', 'phone')),
    target_value TEXT NOT NULL,
    code TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'registration' CHECK(purpose IN ('registration', 'login', 'password_reset')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    verified INTEGER DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_target ON verification_codes(target_type, target_value);
CREATE INDEX idx_verification_code ON verification_codes(code);
