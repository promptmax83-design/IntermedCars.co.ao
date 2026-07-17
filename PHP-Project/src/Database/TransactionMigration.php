<?php

declare(strict_types=1);

namespace IntermedCars\Database;

class TransactionMigration
{
    public static function migrate(\PDO $db): void
    {
        try {
            $check = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'");
            if (!$check || !$check->fetch()) {
                return;
            }

            $count = $db->query("SELECT COUNT(*) FROM transactions")->fetchColumn();
            if ($count == 0) {
                return;
            }

            $existing = $db->query("SELECT COUNT(*) FROM negotiations")->fetchColumn();
            if ($existing > 0) {
                return;
            }

            error_log("[TransactionMigration] Migrating {$count} transactions to negotiations...");

            $db->beginTransaction();
            try {
                $rows = $db->query("SELECT * FROM transactions")->fetchAll(\PDO::FETCH_ASSOC);
                $stmt = $db->prepare("INSERT INTO negotiations (vehicle_id, seller_id, buyer_id, final_car_price_aoa, status, created_at, completed_at) VALUES (:vid, :sid, :bid, :price, :status, :created, :completed)");

                foreach ($rows as $row) {
                    $status = match($row['status'] ?? '') {
                        'transacao_concluida' => 'concluido',
                        'cancelada' => 'cancelado',
                        default => 'aguardando_vistoria',
                    };
                    $stmt->execute([
                        'vid' => $row['vehicle_id'],
                        'sid' => $row['seller_id'],
                        'bid' => $row['buyer_id'] ?? null,
                        'price' => $row['price'] ?? 0,
                        'status' => $status,
                        'created' => $row['created_at'] ?? date('Y-m-d H:i:s'),
                        'completed' => in_array($status, ['concluido', 'cancelado']) ? ($row['updated_at'] ?? date('Y-m-d H:i:s')) : null,
                    ]);
                }

                $db->commit();
                error_log("[TransactionMigration] Migration complete.");
            } catch (\Throwable $e) {
                $db->rollBack();
                error_log("[TransactionMigration] Migration failed: " . $e->getMessage());
            }
        } catch (\Throwable $e) {
            error_log("[TransactionMigration] Check failed (ignoring): " . $e->getMessage());
        }
    }
}
