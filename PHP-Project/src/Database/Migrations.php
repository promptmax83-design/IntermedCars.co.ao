<?php

declare(strict_types=1);

namespace IntermedCars\Database;

class Migrations
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public static function runAll(): void
    {
        $m = new self();
        $m->ensureUserRoleColumn();
        $m->ensureNotificationLogsTable();
        $m->ensureConsultantsTable();
        $m->ensureConsultantCodes();
        $m->ensureNegotiationsTable();
        $m->ensureFeePaymentsTable();
        $m->ensureChatChannelsTable();
        $m->ensureChannelMessagesTable();
        $m->ensureRankingHistoryTable();
    }

    private function ensureUserRoleColumn(): void
    {
        try {
            $this->db->exec("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'");
        } catch (\PDOException) {
            // Column already exists
        }
    }

    private function ensureNotificationLogsTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS notification_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT NULL,
            channel TEXT NOT NULL,
            recipient TEXT NOT NULL,
            event TEXT NOT NULL,
            status TEXT NOT NULL,
            provider_response TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
    }

    private function ensureConsultantsTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS consultants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            fullname VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL UNIQUE,
            codigo_referencia VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
            rank VARCHAR(20) NOT NULL DEFAULT 'Bronze',
            rating DECIMAL(3, 2) DEFAULT 5.00,
            total_deals INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            zone VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
    }

    private function ensureConsultantCodes(): void
    {
        try {
            $this->db->exec("ALTER TABLE consultants ADD COLUMN codigo_referencia VARCHAR(20) UNIQUE DEFAULT ''");
        } catch (\PDOException) {
            // Column already exists
        }

        $stmt = $this->db->query("SELECT id, user_id FROM consultants WHERE codigo_referencia = '' OR codigo_referencia IS NULL");
        $consultants = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($consultants as $c) {
            $code = 'IMC-' . str_pad((string) $c['id'], 4, '0', STR_PAD_LEFT);
            $update = $this->db->prepare("UPDATE consultants SET codigo_referencia = :code WHERE id = :id");
            $update->execute(['code' => $code, 'id' => $c['id']]);
        }
    }

    private function ensureNegotiationsTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS negotiations (
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
            status VARCHAR(30) NOT NULL DEFAULT 'aguardando_vistoria',
            inspection_report TEXT,
            inspection_photos TEXT,
            proposed_price_aoa DECIMAL(15, 2),
            inspected_at DATETIME,
            closed_at DATETIME,
            completed_at DATETIME,
            cancelled_at DATETIME,
            buyer_delivered_at DATETIME,
            seller_delivered_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
            FOREIGN KEY (seller_id) REFERENCES users(id),
            FOREIGN KEY (buyer_id) REFERENCES users(id),
            FOREIGN KEY (consultant_id) REFERENCES consultants(id)
        )");
    }

    private function ensureFeePaymentsTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS fee_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            negotiation_id INTEGER NOT NULL,
            payer_id INTEGER NOT NULL,
            payer_role VARCHAR(20) NOT NULL,
            amount_aoa DECIMAL(15, 2) NOT NULL,
            payment_method VARCHAR(50),
            payment_ref VARCHAR(100),
            proof_file_path VARCHAR(255),
            status VARCHAR(20) DEFAULT 'pendente',
            confirmed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (negotiation_id) REFERENCES negotiations(id),
            FOREIGN KEY (payer_id) REFERENCES users(id)
        )");
    }

    private function ensureChatChannelsTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS chat_channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            negotiation_id INTEGER NOT NULL,
            channel_type VARCHAR(30) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (negotiation_id) REFERENCES negotiations(id)
        )");
    }

    private function ensureChannelMessagesTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS channel_messages (
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
        )");
    }

    private function ensureRankingHistoryTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS ranking_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consultant_id INTEGER NOT NULL,
            old_rank VARCHAR(20),
            new_rank VARCHAR(20) NOT NULL,
            reason VARCHAR(255),
            deals_at_change INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (consultant_id) REFERENCES consultants(id)
        )");
    }
}
