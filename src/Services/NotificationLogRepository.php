<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

/**
 * NotificationLogRepository — Audit log for all notifications sent.
 * Records email/SMS sends for dispute resolution and compliance.
 */
class NotificationLogRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Log a notification attempt.
     *
     * @param int|null $userId
     * @param string $channel 'email' | 'sms'
     * @param string $recipient email address or phone number
     * @param string $event e.g. 'registration_code', 'commission_reminder'
     * @param string $status 'sent' | 'failed' | 'debug'
     * @param string|null $providerResponse raw response from API
     */
    public function log(?int $userId, string $channel, string $recipient, string $event, string $status, ?string $providerResponse = null): void
    {
        try {
            $sql = 'INSERT INTO notification_logs (user_id, channel, recipient, event, status, provider_response, created_at)
                    VALUES (:user_id, :channel, :recipient, :event, :status, :provider_response, CURRENT_TIMESTAMP)';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'user_id' => $userId,
                'channel' => $channel,
                'recipient' => $recipient,
                'event' => $event,
                'status' => $status,
                'provider_response' => $providerResponse,
            ]);
        } catch (\Throwable $e) {
            error_log("[IntermedCars] Failed to log notification: " . $e->getMessage());
        }
    }

    /**
     * Find recent notifications for a user.
     */
    public function findRecent(int $userId, int $limit = 20): array
    {
        $sql = 'SELECT * FROM notification_logs WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit';
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Find notifications by recipient (email or phone).
     */
    public function findByTarget(string $recipient, int $limit = 20): array
    {
        $sql = 'SELECT * FROM notification_logs WHERE recipient = :recipient ORDER BY created_at DESC LIMIT :limit';
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':recipient', $recipient, \PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
