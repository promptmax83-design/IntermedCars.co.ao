<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

class UserController extends BaseController
{
    public function getProfile(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT id, nome, email, telemovel, bi_passaporte, status, created_at FROM users WHERE id = :id');
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user) {
            throw new \InvalidArgumentException("Utilizador nao encontrado");
        }

        $vehicleCount = $this->db->prepare('SELECT COUNT(*) FROM vehicles WHERE vendedor_id = :id');
        $vehicleCount->execute(['id' => $userId]);

        $saleCount = $this->db->prepare("SELECT COUNT(*) FROM negotiations WHERE (seller_id = :id OR buyer_id = :id) AND status = 'concluido'");
        $saleCount->execute(['id' => $userId]);

        return [
            'success' => true,
            'user' => $user,
            'vehicle_count' => (int) $vehicleCount->fetchColumn(),
            'completed_sales' => (int) $saleCount->fetchColumn(),
        ];
    }
}
