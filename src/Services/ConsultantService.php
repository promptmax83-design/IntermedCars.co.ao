<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class ConsultantService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(array $data): array
    {
        $required = ['user_id', 'fullname', 'phone'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Campo obrigatório: {$field}");
            }
        }

        $sql = 'SELECT id FROM consultants WHERE user_id = :user_id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $data['user_id']]);
        if ($stmt->fetch()) {
            throw new \InvalidArgumentException("Este utilizador já é consultor");
        }

        $sql = 'INSERT INTO consultants (user_id, fullname, phone, rank, zone, created_at)
                VALUES (:user_id, :fullname, :phone, :rank, :zone, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id' => $data['user_id'],
            'fullname' => $data['fullname'],
            'phone' => $data['phone'],
            'rank' => $data['rank'] ?? 'Bronze',
            'zone' => $data['zone'] ?? null,
        ]);

        return [
            'success' => true,
            'consultant_id' => (int) $this->db->lastInsertId(),
        ];
    }

    public function getById(int $id): ?array
    {
        $sql = 'SELECT c.*, u.email FROM consultants c JOIN users u ON c.user_id = u.id WHERE c.id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    public function listActive(?string $zone = null, int $limit = 50): array
    {
        $sql = 'SELECT c.*, u.email FROM consultants c JOIN users u ON c.user_id = u.id WHERE c.is_active = 1';
        $params = [];

        if ($zone) {
            $sql .= ' AND c.zone = :zone';
            $params['zone'] = $zone;
        }

        $sql .= ' ORDER BY c.rating DESC, c.total_deals DESC LIMIT :limit';
        $params['limit'] = $limit;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function assign(?string $zone): ?array
    {
        if ($zone) {
            $sql = 'SELECT c.*, u.email FROM consultants c JOIN users u ON c.user_id = u.id WHERE c.is_active = 1 AND c.zone = :zone ORDER BY c.rating DESC LIMIT 1';
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['zone' => $zone]);
            $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($consultant) return $consultant;
        }

        $sql = 'SELECT c.*, u.email FROM consultants c JOIN users u ON c.user_id = u.id WHERE c.is_active = 1 ORDER BY c.rating DESC LIMIT 1';
        $stmt = $this->db->query($sql);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    public function updateRating(int $consultantId, float $newRating): array
    {
        $sql = 'UPDATE consultants SET rating = :rating WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['rating' => $newRating, 'id' => $consultantId]);
        return ['success' => true];
    }

    public function getStats(int $consultantId): array
    {
        $sql = "SELECT COUNT(*) as total_deals FROM negotiations WHERE consultant_id = :id AND status = 'concluido'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $consultantId]);
        $stats = $stmt->fetch(\PDO::FETCH_ASSOC);

        $sql = "SELECT SUM(consultant_payout_aoa) as total_earned FROM negotiations WHERE consultant_id = :id AND status = 'concluido'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $consultantId]);
        $earnings = $stmt->fetch(\PDO::FETCH_ASSOC);

        $consultant = $this->getById($consultantId);

        return [
            'total_deals' => (int) ($stats['total_deals'] ?? 0),
            'rating' => (float) ($consultant['rating'] ?? 0),
            'rank' => $consultant['rank'] ?? 'Bronze',
            'total_earned_aoa' => (float) ($earnings['total_earned'] ?? 0),
        ];
    }
}
