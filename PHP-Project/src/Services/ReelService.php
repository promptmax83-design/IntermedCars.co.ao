<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class ReelService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(int $userId, string $userRole, array $data): array
    {
        $videoUrl = $data['video_url'] ?? '';
        if (empty($videoUrl)) {
            throw new \InvalidArgumentException("video_url e obrigatorio");
        }

        $caption = $data['caption'] ?? '';
        $vehicleId = !empty($data['vehicle_id']) ? (int) $data['vehicle_id'] : null;
        $marca = $data['marca'] ?? null;
        $modelo = $data['modelo'] ?? null;
        $ano = !empty($data['ano']) ? (int) $data['ano'] : null;
        $preco = !empty($data['preco_aoa']) ? (float) $data['preco_aoa'] : null;
        $tags = $data['tags'] ?? null;
        $lat = !empty($data['latitude']) ? (float) $data['latitude'] : null;
        $lng = !empty($data['longitude']) ? (float) $data['longitude'] : null;
        $provincia = $data['provincia'] ?? null;
        $duration = !empty($data['duration_seconds']) ? (int) $data['duration_seconds'] : 30;
        $thumbnail = $data['thumbnail_url'] ?? null;

        $sql = 'INSERT INTO reels (user_id, user_role, video_url, thumbnail_url, duration_seconds,
                vehicle_id, marca, modelo, ano, preco_aoa, caption, tags,
                latitude, longitude, provincia, created_at, updated_at)
                VALUES (:uid, :role, :video, :thumb, :dur, :vid, :marca, :modelo, :ano, :preco,
                :caption, :tags, :lat, :lng, :prov, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'uid' => $userId,
            'role' => $userRole,
            'video' => $videoUrl,
            'thumb' => $thumbnail,
            'dur' => $duration,
            'vid' => $vehicleId,
            'marca' => $marca,
            'modelo' => $modelo,
            'ano' => $ano,
            'preco' => $preco,
            'caption' => $caption,
            'tags' => $tags,
            'lat' => $lat,
            'lng' => $lng,
            'prov' => $provincia,
        ]);

        $reelId = (int) $this->db->lastInsertId();

        return $this->getById($reelId);
    }

    public function getById(int $id): array
    {
        $sql = 'SELECT r.*, u.nome as user_name
                FROM reels r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.id = :id AND r.status = \'ativo\'';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$result) {
            throw new \InvalidArgumentException("Reel nao encontrado");
        }
        return $result;
    }

    public function feed(string $sort = 'newest', ?string $provincia = null, ?int $vehicleId = null, int $page = 1, int $limit = 10): array
    {
        $where = "r.status = 'ativo'";
        $params = [];

        if ($provincia) {
            $where .= " AND r.provincia = :provincia";
            $params['provincia'] = $provincia;
        }
        if ($vehicleId) {
            $where .= " AND r.vehicle_id = :vehicle_id";
            $params['vehicle_id'] = $vehicleId;
        }

        $orderBy = match ($sort) {
            'trending' => 'r.views_count + r.likes_count * 10 DESC',
            'most_viewed' => 'r.views_count DESC',
            'newest' => 'r.created_at DESC',
            default => 'r.created_at DESC',
        };

        $offset = ($page - 1) * $limit;

        $sql = "SELECT r.*, u.nome as user_name
                FROM reels r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE {$where}
                ORDER BY {$orderBy}
                LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $reels = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $countSql = "SELECT COUNT(*) FROM reels r WHERE {$where}";
        $countStmt = $this->db->prepare($countSql);
        foreach ($params as $k => $v) {
            $countStmt->bindValue($k, $v);
        }
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();

        return [
            'reels' => $reels,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => (int) ceil($total / $limit),
        ];
    }

    public function toggleLike(int $reelId, int $userId): array
    {
        $sql = 'SELECT id FROM reel_likes WHERE reel_id = :rid AND user_id = :uid';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['rid' => $reelId, 'uid' => $userId]);
        $existing = $stmt->fetch();

        if ($existing) {
            $this->db->prepare('DELETE FROM reel_likes WHERE reel_id = :rid AND user_id = :uid')
                ->execute(['rid' => $reelId, 'uid' => $userId]);
            $this->db->prepare('UPDATE reels SET likes_count = likes_count - 1 WHERE id = :id')
                ->execute(['id' => $reelId]);
            return ['liked' => false, 'likes_count' => $this->getLikesCount($reelId)];
        } else {
            $this->db->prepare('INSERT INTO reel_likes (reel_id, user_id) VALUES (:rid, :uid)')
                ->execute(['rid' => $reelId, 'uid' => $userId]);
            $this->db->prepare('UPDATE reels SET likes_count = likes_count + 1 WHERE id = :id')
                ->execute(['id' => $reelId]);
            return ['liked' => true, 'likes_count' => $this->getLikesCount($reelId)];
        }
    }

    public function recordView(int $reelId, ?int $userId, ?string $sessionId): void
    {
        $this->db->prepare('UPDATE reels SET views_count = views_count + 1 WHERE id = :id')
            ->execute(['id' => $reelId]);

        $sql = 'INSERT INTO reel_views (reel_id, user_id, session_id) VALUES (:rid, :uid, :sid)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'rid' => $reelId,
            'uid' => $userId,
            'sid' => $sessionId,
        ]);
    }

    public function delete(int $reelId, int $userId, bool $isAdmin = false): array
    {
        $reel = $this->getById($reelId);
        if (!$isAdmin && $reel['user_id'] != $userId) {
            throw new \InvalidArgumentException("Sem permissao para remover este reel");
        }

        $this->db->prepare('UPDATE reels SET status = \'removido\', updated_at = CURRENT_TIMESTAMP WHERE id = :id')
            ->execute(['id' => $reelId]);

        return ['success' => true, 'message' => 'Reel removido'];
    }

    public function isLiked(int $reelId, int $userId): bool
    {
        $sql = 'SELECT COUNT(*) FROM reel_likes WHERE reel_id = :rid AND user_id = :uid';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['rid' => $reelId, 'uid' => $userId]);
        return (int) $stmt->fetchColumn() > 0;
    }

    private function getLikesCount(int $reelId): int
    {
        $sql = 'SELECT likes_count FROM reels WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $reelId]);
        return (int) $stmt->fetchColumn();
    }
}
