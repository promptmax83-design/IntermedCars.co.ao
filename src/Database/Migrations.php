<?php

declare(strict_types=1);

namespace IntermedCars\Database;

/**
 * Database Migrations — Idempotent table creation.
 * Safe to call on every request; uses CREATE TABLE IF NOT EXISTS.
 */
class Migrations
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Run all migrations. Safe to call multiple times.
     */
    public static function runAll(): void
    {
        $migrations = new self();
        $migrations->ensureNotificationLogsTable();
        $migrations->ensureConsultantsTable();
        $migrations->ensureNegotiationsTable();
        $migrations->ensureFeePaymentsTable();
        $migrations->ensureChatChannelsTable();
        $migrations->ensureChannelMessagesTable();
        $migrations->ensureRankingHistoryTable();
        TransactionMigration::migrate($migrations->db);
    }

    /**
     * Create notification_logs table if it doesn't exist.
     */
    private function ensureNotificationLogsTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS notification_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER DEFAULT NULL,
                channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
                recipient TEXT NOT NULL,
                event TEXT NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'debug')),
                provider_response TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS notification_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT DEFAULT NULL,
                channel ENUM('email', 'sms') NOT NULL,
                recipient VARCHAR(255) NOT NULL,
                event VARCHAR(100) NOT NULL,
                status ENUM('sent', 'failed', 'debug') NOT NULL,
                provider_response TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_notification_logs_user_id (user_id),
                INDEX idx_notification_logs_event (event),
                INDEX idx_notification_logs_created_at (created_at)
            )";
        }

        $this->db->exec($sql);

        // Add indexes for SQLite (SQLite doesn't support inline INDEX definitions)
        if ($driver === 'sqlite') {
            $this->ensureIndex('idx_notification_logs_user_id', 'notification_logs', 'user_id');
            $this->ensureIndex('idx_notification_logs_event', 'notification_logs', 'event');
            $this->ensureIndex('idx_notification_logs_created_at', 'notification_logs', 'created_at');
        }
    }

    /**
     * Create an index if it doesn't exist (SQLite only).
     */
    private function ensureIndex(string $indexName, string $table, string $column): void
    {
        try {
            $sql = "CREATE INDEX IF NOT EXISTS {$indexName} ON {$table} ({$column})";
            $this->db->exec($sql);
        } catch (\Throwable $e) {
            error_log("[IntermedCars] Index creation failed for {$indexName}: " . $e->getMessage());
        }
    }

    /**
     * Create consultants table.
     */
    public function ensureConsultantsTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS consultants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                fullname VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL UNIQUE,
                rank VARCHAR(20) NOT NULL DEFAULT 'Bronze' CHECK (rank IN ('Bronze', 'Prata', 'Ouro', 'Embaixador')),
                rating DECIMAL(3, 2) DEFAULT 5.00,
                total_deals INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                zone VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS consultants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                fullname VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL UNIQUE,
                rank ENUM('Bronze', 'Prata', 'Ouro', 'Embaixador') DEFAULT 'Bronze' NOT NULL,
                rating DECIMAL(3, 2) DEFAULT 5.00,
                total_deals INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                zone VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )";
        }
        $this->db->exec($sql);
    }

    /**
     * Create negotiations table.
     */
    public function ensureNegotiationsTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS negotiations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                seller_id INTEGER NOT NULL,
                buyer_id INTEGER,
                consultant_id INTEGER NOT NULL,
                final_car_price_aoa DECIMAL(15, 2),
                commission_seller_aoa DECIMAL(15, 2) DEFAULT 0.00,
                commission_buyer_aoa DECIMAL(15, 2) DEFAULT 0.00,
                total_fees_collected_aoa DECIMAL(15, 2) DEFAULT 0.00,
                has_seller_paid_fee INTEGER DEFAULT 0,
                has_buyer_paid_fee INTEGER DEFAULT 0,
                seller_payment_ref VARCHAR(100),
                buyer_payment_ref VARCHAR(100),
                seller_paid_at DATETIME,
                buyer_paid_at DATETIME,
                consultant_payout_aoa DECIMAL(15, 2) DEFAULT 0.00,
                consultant_share_pct DECIMAL(5, 4) DEFAULT 0.2000,
                platform_net_revenue_aoa DECIMAL(15, 2) DEFAULT 0.00,
                consultant_paid_at DATETIME,
                status VARCHAR(30) NOT NULL DEFAULT 'aguardando_vistoria'
                    CHECK (status IN ('aguardando_vistoria','vistoriado','aguardando_pagamento_taxas','taxas_pagas','concluido','cancelado')),
                inspection_report TEXT,
                inspection_photos TEXT,
                proposed_price_aoa DECIMAL(15, 2),
                inspected_at DATETIME,
                closed_at DATETIME,
                completed_at DATETIME,
                cancelled_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
                FOREIGN KEY (seller_id) REFERENCES users(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id),
                FOREIGN KEY (consultant_id) REFERENCES consultants(id)
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS negotiations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                seller_id INT NOT NULL,
                buyer_id INT,
                consultant_id INT NOT NULL,
                final_car_price_aoa DECIMAL(15, 2),
                commission_seller_aoa DECIMAL(15, 2) DEFAULT 0.00,
                commission_buyer_aoa DECIMAL(15, 2) DEFAULT 0.00,
                total_fees_collected_aoa DECIMAL(15, 2) DEFAULT 0.00,
                has_seller_paid_fee TINYINT(1) DEFAULT 0,
                has_buyer_paid_fee TINYINT(1) DEFAULT 0,
                seller_payment_ref VARCHAR(100),
                buyer_payment_ref VARCHAR(100),
                seller_paid_at DATETIME,
                buyer_paid_at DATETIME,
                consultant_payout_aoa DECIMAL(15, 2) DEFAULT 0.00,
                consultant_share_pct DECIMAL(5, 4) DEFAULT 0.2000,
                platform_net_revenue_aoa DECIMAL(15, 2) DEFAULT 0.00,
                consultant_paid_at DATETIME,
                status ENUM('aguardando_vistoria','vistoriado','aguardando_pagamento_taxas','taxas_pagas','concluido','cancelado') DEFAULT 'aguardando_vistoria' NOT NULL,
                inspection_report TEXT,
                inspection_photos TEXT,
                proposed_price_aoa DECIMAL(15, 2),
                inspected_at DATETIME,
                closed_at DATETIME,
                completed_at DATETIME,
                cancelled_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
                FOREIGN KEY (seller_id) REFERENCES users(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id),
                FOREIGN KEY (consultant_id) REFERENCES consultants(id)
            )";
        }
        $this->db->exec($sql);
    }

    /**
     * Create fee_payments table.
     */
    public function ensureFeePaymentsTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS fee_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                negotiation_id INTEGER NOT NULL,
                payer_id INTEGER NOT NULL,
                payer_role VARCHAR(20) NOT NULL CHECK (payer_role IN ('seller', 'buyer')),
                amount_aoa DECIMAL(15, 2) NOT NULL,
                payment_method VARCHAR(50),
                payment_ref VARCHAR(100),
                proof_file_path VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'rejeitado')),
                confirmed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (negotiation_id) REFERENCES negotiations(id),
                FOREIGN KEY (payer_id) REFERENCES users(id)
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS fee_payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                negotiation_id INT NOT NULL,
                payer_id INT NOT NULL,
                payer_role ENUM('seller', 'buyer') NOT NULL,
                amount_aoa DECIMAL(15, 2) NOT NULL,
                payment_method VARCHAR(50),
                payment_ref VARCHAR(100),
                proof_file_path VARCHAR(255),
                status ENUM('pendente', 'confirmado', 'rejeitado') DEFAULT 'pendente',
                confirmed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (negotiation_id) REFERENCES negotiations(id),
                FOREIGN KEY (payer_id) REFERENCES users(id)
            )";
        }
        $this->db->exec($sql);
    }

    /**
     * Create chat_channels table.
     */
    public function ensureChatChannelsTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS chat_channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                negotiation_id INTEGER NOT NULL,
                channel_type VARCHAR(30) NOT NULL CHECK (channel_type IN ('seller_consultant', 'buyer_consultant')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (negotiation_id) REFERENCES negotiations(id)
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS chat_channels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                negotiation_id INT NOT NULL,
                channel_type ENUM('seller_consultant', 'buyer_consultant') NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (negotiation_id) REFERENCES negotiations(id)
            )";
        }
        $this->db->exec($sql);
    }

    /**
     * Create channel_messages table.
     */
    public function ensureChannelMessagesTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS channel_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                is_flagged INTEGER DEFAULT 0,
                flag_reason VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES chat_channels(id),
                FOREIGN KEY (sender_id) REFERENCES users(id)
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS channel_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                channel_id INT NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                is_flagged TINYINT(1) DEFAULT 0,
                flag_reason VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES chat_channels(id),
                FOREIGN KEY (sender_id) REFERENCES users(id)
            )";
        }
        $this->db->exec($sql);
    }

    /**
     * Create ranking_history table.
     */
    public function ensureRankingHistoryTable(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS ranking_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                consultant_id INTEGER NOT NULL,
                old_rank VARCHAR(20),
                new_rank VARCHAR(20) NOT NULL,
                reason VARCHAR(255),
                deals_at_change INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (consultant_id) REFERENCES consultants(id)
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS ranking_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                consultant_id INT NOT NULL,
                old_rank VARCHAR(20),
                new_rank VARCHAR(20) NOT NULL,
                reason VARCHAR(255),
                deals_at_change INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (consultant_id) REFERENCES consultants(id)
            )";
        }
        $this->db->exec($sql);
    }
}
