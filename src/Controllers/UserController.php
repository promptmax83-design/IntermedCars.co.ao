<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

class UserController extends BaseController
{
    public function getProfile(int $userId): array
    {
        $this->validateUserId($userId);

        $sql = 'SELECT id, nome, email, telemovel, bi_passaporte, status, created_at, verified_at
                FROM users WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user) {
            throw new \InvalidArgumentException("Utilizador nao encontrado");
        }

        // Count vehicles listed by this user
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM vehicles WHERE vendedor_id = :id');
        $stmt->execute(['id' => $userId]);
        $vehicleCount = (int) $stmt->fetchColumn();

        // Count completed sales
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM negotiations n
             JOIN vehicles v ON n.vehicle_id = v.id
             WHERE v.vendedor_id = :id AND n.status = :status'
        );
        $stmt->execute(['id' => $userId, 'status' => 'concluido']);
        $salesCount = (int) $stmt->fetchColumn();

        return [
            'id' => (int) $user['id'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'telemovel' => $user['telemovel'],
            'verificado' => $user['status'] === 'verificado',
            'status' => $user['status'],
            'created_at' => $user['created_at'],
            'verified_at' => $user['verified_at'] ?? null,
            'veiculos' => $vehicleCount,
            'vendas' => $salesCount,
        ];
    }

    private function validateUserId(int $userId): void
    {
        if ($userId <= 0) {
            throw new \InvalidArgumentException("ID de utilizador invalido");
        }
    }
}
