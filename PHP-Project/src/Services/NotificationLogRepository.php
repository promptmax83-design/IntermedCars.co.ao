<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class NotificationLogRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function log(string $channel, string $recipient, string $event, string $status, ?string $providerResponse = null): void
    {
        $sql = 'INSERT INTO notification_logs (channel, recipient, event, status, provider_response) VALUES (:ch, :rec, :ev, :st, :pr)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'ch' => $channel,
            'rec' => $recipient,
            'ev' => $event,
            'st' => $status,
            'pr' => $providerResponse,
        ]);
    }

    public function findRecent(int $offset = 0, int $limit = 50): array
    {
        $stmt = $this->db->prepare('SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findByTarget(string $recipient, int $limit = 50): array
    {
        $stmt = $this->db->prepare('SELECT * FROM notification_logs WHERE recipient = :rec ORDER BY created_at DESC LIMIT :limit');
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute(['rec' => $recipient]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
