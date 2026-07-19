<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

class UserController extends BaseController
{
    public function getProfile(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT id, nome, email, telemovel, bi_passaporte, role, status, created_at FROM users WHERE id = :id');
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

    public function updateProfile(int $userId, array $data): array
    {
        if (array_key_exists('role', $data)) {
            http_response_code(403);
            return ['success' => false, 'error' => 'O tipo de conta nao pode ser alterado.'];
        }

        $allowed = ['nome', 'email', 'telemovel', 'bi_passaporte'];
        $updates = [];
        $params = ['id' => $userId];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $updates[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if (empty($updates)) {
            return ['success' => false, 'error' => 'Nenhum campo para atualizar.'];
        }

        $updates[] = "updated_at = datetime('now','localtime')";
        $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['success' => true, 'message' => 'Perfil atualizado com sucesso.'];
    }
}
