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
        $userId = (int) ($data['user_id'] ?? 0);
        $fullname = $data['fullname'] ?? '';
        $phone = $data['phone'] ?? '';
        $zone = $data['zone'] ?? 'Luanda';

        if (!$userId || !$fullname || !$phone) {
            throw new \InvalidArgumentException("Campos obrigatorios: user_id, fullname, phone");
        }

        $maxId = $this->db->query('SELECT MAX(id) FROM consultants')->fetchColumn();
        $nextId = ((int) ($maxId ?? 0)) + 1;
        $codigoReferencia = 'IMC-' . str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);

        $sql = 'INSERT INTO consultants (user_id, fullname, phone, zone, rank, rating, total_deals, is_active, codigo_referencia)
                VALUES (:uid, :name, :phone, :zone, :rank, :rating, 0, 1, :code)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'uid' => $userId,
            'name' => $fullname,
            'phone' => $phone,
            'zone' => $zone,
            'rank' => 'Bronze',
            'rating' => 5.00,
            'code' => $codigoReferencia,
        ]);

        return [
            'success' => true,
            'consultant_id' => (int) $this->db->lastInsertId(),
            'codigo_referencia' => $codigoReferencia,
            'rank' => 'Bronze',
            'message' => 'Consultor registado com sucesso.',
        ];
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM consultants WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function listActive(?string $zone = null): array
    {
        if ($zone) {
            $stmt = $this->db->prepare('SELECT * FROM consultants WHERE is_active = 1 AND zone = :zone ORDER BY rating DESC');
            $stmt->execute(['zone' => $zone]);
        } else {
            $stmt = $this->db->query('SELECT * FROM consultants WHERE is_active = 1 ORDER BY rating DESC');
        }
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updateRating(int $id, float $rating): array
    {
        if ($rating < 0 || $rating > 5) {
            throw new \InvalidArgumentException("Rating deve ser entre 0 e 5");
        }

        $sql = 'UPDATE consultants SET rating = :rating WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['rating' => $rating, 'id' => $id]);

        $this->checkRankUpgrade($id);

        return ['success' => true, 'message' => 'Rating atualizado.'];
    }

    public function getStats(int $id): array
    {
        $consultant = $this->getById($id);
        if (!$consultant) {
            throw new \InvalidArgumentException("Consultor nao encontrado");
        }

        $sql = 'SELECT COUNT(*) as total, 
                       SUM(CASE WHEN status = \'concluido\' THEN 1 ELSE 0 END) as concluidas,
                       SUM(CASE WHEN status = \'cancelado\' THEN 1 ELSE 0 END) as canceladas,
                       SUM(CASE WHEN status IN (\'aguardando_vistoria\',\'vistoriado\',\'aguardando_pagamento_taxas\',\'taxas_pagas\') THEN 1 ELSE 0 END) as ativas
                FROM negotiations WHERE consultant_id = :cid';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['cid' => $id]);
        $stats = $stmt->fetch(\PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'consultant' => $consultant,
            'stats' => $stats,
        ];
    }

    public function getByCodigo(string $codigo): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM consultants WHERE codigo_referencia = :code AND is_active = 1');
        $stmt->execute(['code' => $codigo]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    private function checkRankUpgrade(int $id): void
    {
        $consultant = $this->getById($id);
        if (!$consultant) return;

        $deals = (int) $consultant['total_deals'];
        $rating = (float) $consultant['rating'];
        $currentRank = $consultant['rank'];

        $newRank = $currentRank;
        if ($currentRank === 'Bronze' && $deals >= 10 && $rating >= 4.0) {
            $newRank = 'Prata';
        } elseif ($currentRank === 'Prata' && $deals >= 20 && $rating >= 4.5) {
            $newRank = 'Ouro';
        } elseif ($currentRank === 'Ouro' && $deals >= 50 && $rating >= 4.8) {
            $newRank = 'Embaixador';
        }

        if ($newRank !== $currentRank) {
            $stmt = $this->db->prepare('UPDATE consultants SET rank = :rank WHERE id = :id');
            $stmt->execute(['rank' => $newRank, 'id' => $id]);

            $stmt2 = $this->db->prepare('INSERT INTO ranking_history (consultant_id, old_rank, new_rank, reason, deals_at_change) VALUES (:cid, :old, :new, :reason, :deals)');
            $stmt2->execute([
                'cid' => $id,
                'old' => $currentRank,
                'new' => $newRank,
                'reason' => "Upgrade automatico: {$deals} deals, {$rating} rating",
                'deals' => $deals,
            ]);
        }
    }
}
