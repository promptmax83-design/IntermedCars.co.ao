<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

/**
 * MessageController
 *
 * Handles chat messaging between users.
 * Uses polling (every 3 seconds) instead of WebSocket for simplicity.
 */
class MessageController extends BaseController
{
    /**
     * Get conversations for a user.
     *
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getConversations(int $userId): array
    {
        $sql = 'SELECT DISTINCT
                    CASE WHEN m.sender_id = :userId THEN m.receiver_id ELSE m.sender_id END as other_user_id,
                    u.nome as other_user_name,
                    u.status as other_user_status,
                    (SELECT content FROM messages WHERE sender_id = other_user_id AND receiver_id = :userId ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages WHERE (sender_id = :userId AND receiver_id = other_user_id) OR (sender_id = other_user_id AND receiver_id = :userId) ORDER BY created_at DESC LIMIT 1) as last_message_at,
                    (SELECT COUNT(*) FROM messages WHERE sender_id = other_user_id AND receiver_id = :userId AND read_at IS NULL) as unread_count
                FROM messages m
                JOIN users u ON u.id = CASE WHEN m.sender_id = :userId THEN m.receiver_id ELSE m.sender_id END
                WHERE m.sender_id = :userId OR m.receiver_id = :userId
                ORDER BY last_message_at DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['userId' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get messages between two users.
     *
     * @param int $userId Current user ID
     * @param int $otherUserId Other user ID
     * @param int $limit Max messages to return
     * @param int $offset Pagination offset
     * @return array<int, array<string, mixed>>
     */
    public function getMessages(int $userId, int $otherUserId, int $limit = 50, int $offset = 0): array
    {
        $sql = 'SELECT m.*, 
                       sender.nome as sender_name,
                       receiver.nome as receiver_name
                FROM messages m
                JOIN users sender ON m.sender_id = sender.id
                JOIN users receiver ON m.receiver_id = receiver.id
                WHERE (m.sender_id = :userId AND m.receiver_id = :otherUserId)
                   OR (m.sender_id = :otherUserId AND m.receiver_id = :userId)
                ORDER BY m.created_at ASC
                LIMIT :limit OFFSET :offset';
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue('userId', $userId, \PDO::PARAM_INT);
        $stmt->bindValue('otherUserId', $otherUserId, \PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Send a message.
     *
     * @param int $senderId
     * @param int $receiverId
     * @param string $content
     * @param string $type 'text', 'image', 'proposal', 'location'
     * @param int|null $transactionId
     * @return array{success: bool, message_id: int, message: string}
     */
    public function sendMessage(
        int $senderId,
        int $receiverId,
        string $content,
        string $type = 'text',
        ?int $transactionId = null
    ): array {
        if (empty($content)) {
            throw new \InvalidArgumentException("Mensagem nao pode estar vazia.");
        }

        if (!in_array($type, ['text', 'image', 'proposal', 'location'], true)) {
            throw new \InvalidArgumentException("Tipo de mensagem invalido.");
        }

        $sql = 'INSERT INTO messages (sender_id, receiver_id, transaction_id, content, type, created_at)
                VALUES (:sender_id, :receiver_id, :transaction_id, :content, :type, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'transaction_id' => $transactionId,
            'content' => $content,
            'type' => $type,
        ]);

        $messageId = (int) $this->db->lastInsertId();

        return [
            'success' => true,
            'message_id' => $messageId,
            'message' => 'Mensagem enviada.',
        ];
    }

    /**
     * Mark messages as read.
     *
     * @param int $userId Current user (receiver)
     * @param int $senderId Messages from this user
     * @return array{success: bool, count: int, message: string}
     */
    public function markAsRead(int $userId, int $senderId): array
    {
        $sql = 'UPDATE messages SET read_at = CURRENT_TIMESTAMP
                WHERE sender_id = :senderId AND receiver_id = :userId AND read_at IS NULL';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'senderId' => $senderId,
            'userId' => $userId,
        ]);

        $count = $stmt->rowCount();

        return [
            'success' => true,
            'count' => $count,
            'message' => "{$count} mensagens marcadas como lidas.",
        ];
    }

    /**
     * Get unread message count for a user.
     *
     * @param int $userId
     * @return int Total unread messages
     */
    public function getUnreadCount(int $userId): int
    {
        $sql = 'SELECT COUNT(*) FROM messages WHERE receiver_id = :userId AND read_at IS NULL';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['userId' => $userId]);
        $count = $stmt->fetchColumn();
        return is_int($count) ? $count : 0;
    }
}
