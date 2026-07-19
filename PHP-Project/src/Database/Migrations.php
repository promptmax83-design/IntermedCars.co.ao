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
        $m->ensureGeolocationColumns();
        $m->ensureSolicitacoesTable();
        $m->ensureAvaliacoesTable();
        $m->ensureAuditoriaRegistoTable();
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
        // SQLite não suporta UNIQUE em ALTER TABLE ADD COLUMN
        // Verificar se a coluna existe antes de criar
        try {
            $this->db->exec("ALTER TABLE consultants ADD COLUMN codigo_referencia VARCHAR(20) DEFAULT ''");
        } catch (\PDOException $e) {
            // Coluna já existe — ignorar
            if (!str_contains($e->getMessage(), 'duplicate column')) {
                error_log("[Migration] ensureConsultantCodes ALTER: " . $e->getMessage());
            }
        }

        // Gerar códigos IMC-XXXX para consultores sem código
        try {
            $stmt = $this->db->query("SELECT id, user_id FROM consultants WHERE codigo_referencia = '' OR codigo_referencia IS NULL");
            $consultants = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($consultants as $c) {
                $code = 'IMC-' . str_pad((string) $c['id'], 4, '0', STR_PAD_LEFT);
                $update = $this->db->prepare("UPDATE consultants SET codigo_referencia = :code WHERE id = :id");
                $update->execute(['code' => $code, 'id' => $c['id']]);
            }
        } catch (\PDOException $e) {
            error_log("[Migration] ensureConsultantCodes SELECT: " . $e->getMessage());
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

    private function ensureGeolocationColumns(): void
    {
        $columns = [
            "ALTER TABLE consultants ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL",
            "ALTER TABLE consultants ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL",
            "ALTER TABLE consultants ADD COLUMN provincia VARCHAR(50) DEFAULT NULL",
            "ALTER TABLE consultants ADD COLUMN municipio VARCHAR(50) DEFAULT NULL",
            "ALTER TABLE consultants ADD COLUMN bairro VARCHAR(50) DEFAULT NULL",
            "ALTER TABLE consultants ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'offline'",
            "ALTER TABLE consultants ADD COLUMN ultima_atividade DATETIME DEFAULT NULL",
            "ALTER TABLE consultants ADD COLUMN disponivel INTEGER NOT NULL DEFAULT 1",
            "ALTER TABLE vehicles ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL",
            "ALTER TABLE vehicles ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL",
        ];

        foreach ($columns as $sql) {
            try {
                $this->db->exec($sql);
            } catch (\PDOException $e) {
                if (!str_contains($e->getMessage(), 'duplicate column')) {
                    error_log("[Migration] Geolocation: {$e->getMessage()}");
                }
            }
        }

        // Seed test data
        try {
            $this->db->exec("UPDATE consultants SET 
                latitude = -8.8399, longitude = 13.2894, 
                estado = 'online', disponivel = 1,
                provincia = 'Luanda', municipio = 'Luanda', bairro = 'Centro',
                ultima_atividade = datetime('now','localtime')
                WHERE id = 1");
            $this->db->exec("UPDATE vehicles SET 
                latitude = -8.9098, longitude = 13.3428
                WHERE id = 1");
        } catch (\PDOException $e) {
            error_log("[Migration] Seed data: {$e->getMessage()}");
        }
    }

    private function ensureSolicitacoesTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS solicitacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            veiculo_id INTEGER NOT NULL,
            utilizador_id INTEGER NOT NULL,
            consultor_id INTEGER NOT NULL,
            latitude_veiculo DECIMAL(10, 8),
            longitude_veiculo DECIMAL(11, 8),
            latitude_cliente DECIMAL(10, 8),
            longitude_cliente DECIMAL(11, 8),
            distancia_km DECIMAL(6, 2),
            mensagem TEXT,
            estado VARCHAR(20) NOT NULL DEFAULT 'pendente',
            notificado_via VARCHAR(20) DEFAULT 'nenhum',
            notificado_em DATETIME,
            lida INTEGER DEFAULT 0,
            respondido_em DATETIME,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (veiculo_id) REFERENCES vehicles(id),
            FOREIGN KEY (utilizador_id) REFERENCES users(id),
            FOREIGN KEY (consultor_id) REFERENCES consultants(id)
        )");

        try {
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_solicitacoes_consultor_estado ON solicitacoes(consultor_id, estado)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_solicitacoes_utilizador ON solicitacoes(utilizador_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_consultants_location ON consultants(estado, disponivel, latitude, longitude)");
        } catch (\PDOException $e) {
            // Already exist
        }
    }

    private function ensureAuditoriaRegistoTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS auditoria_registo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilizador_id INTEGER NOT NULL,
            role_escolhido VARCHAR(20) NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            confirmado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilizador_id) REFERENCES users(id)
        )");
    }

    private function ensureAvaliacoesTable(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS avaliacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consultor_id INTEGER NOT NULL,
            utilizador_id INTEGER NOT NULL,
            nota DECIMAL(2, 1) NOT NULL,
            comentario TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (consultor_id) REFERENCES consultants(id),
            FOREIGN KEY (utilizador_id) REFERENCES users(id)
        )");

        try {
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_avaliacoes_consultor ON avaliacoes(consultor_id)");
        } catch (\PDOException $e) {
            // Already exists
        }
    }
}
