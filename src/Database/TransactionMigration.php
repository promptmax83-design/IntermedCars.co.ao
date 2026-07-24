<?php

declare(strict_types=1);

namespace IntermedCars\Database;

use PDO;

/**
 * Migrates legacy transaction records into the canonical negotiations table.
 * Runs once; uses a log table to track completion.
 */
class TransactionMigration
{
    public static function migrate(PDO $db): void
    {
        $check = $db->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='transaction_migration_log'");
        if ($check && $check->fetchColumn() > 0) {
            return;
        }

        $db->beginTransaction();
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS transaction_migration_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migrated_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");

            $sql = "SELECT t.id, t.vehicle_id, t.seller_id, t.buyer_id, t.proposed_price, t.status, t.created_at, t.updated_at
                    FROM transactions t
                    WHERE t.id NOT IN (
                        SELECT n.id FROM negotiations n
                        WHERE n.vehicle_id = t.vehicle_id
                          AND n.seller_id = t.seller_id
                          AND n.buyer_id = t.buyer_id
                    )";

            $rows = $db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);

            $insert = $db->prepare(
                "INSERT INTO negotiations (vehicle_id, seller_id, buyer_id, final_car_price_aoa, status, closed_at, completed_at, created_at, updated_at)
                 VALUES (:vehicle_id, :seller_id, :buyer_id, :price, :status, :closed_at, :completed_at, :created_at, :updated_at)"
            );

            $count = 0;
            foreach ($rows as $row) {
                $status = match ($row['status']) {
                    'transacao_concluida' => 'concluido',
                    'cancelada' => 'cancelado',
                    default => 'aguardando_vistoria',
                };

                $closedAt = $row['status'] === 'transacao_concluida' ? $row['created_at'] : null;
                $completedAt = $row['status'] === 'transacao_concluida' ? $row['updated_at'] : null;

                $insert->execute([
                    'vehicle_id' => $row['vehicle_id'],
                    'seller_id' => $row['seller_id'],
                    'buyer_id' => $row['buyer_id'],
                    'price' => $row['proposed_price'],
                    'status' => $status,
                    'closed_at' => $closedAt,
                    'completed_at' => $completedAt,
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                ]);
                $count++;
            }

            $db->exec("INSERT INTO transaction_migration_log (migrated_count) VALUES ({$count})");
            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }
}
