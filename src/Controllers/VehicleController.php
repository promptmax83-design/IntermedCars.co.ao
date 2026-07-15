<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Models\Vehicle;
use IntermedCars\Models\VehicleStatus;

/**
 * VehicleController
 *
 * Handles vehicle CRUD operations and status transitions.
 */
class VehicleController extends BaseController
{
    /**
     * List vehicles with optional status filter.
     *
     * @param string|null $status Filter by VehicleStatus value
     * @param string $orderBy Column to sort by
     * @param string $order ASC or DESC
     * @return array<int, array<string, mixed>>
     */
    public function list(
        ?string $status = null,
        string $orderBy = 'created_at',
        string $order = 'DESC',
        ?string $search = null,
        int $limit = 50,
        int $offset = 0
    ): array {
        $sql = 'SELECT v.*, u.nome as vendedor_nome,
                       vi.file_path as primary_image
                FROM vehicles v
                JOIN users u ON v.vendedor_id = u.id
                LEFT JOIN vehicle_images vi ON vi.vehicle_id = v.id AND vi.is_primary = 1';
        $params = [];

        $conditions = [];
        if ($status !== null) {
            $vehicleStatus = VehicleStatus::tryFrom($status);
            if ($vehicleStatus !== null) {
                $conditions[] = 'v.status = :status';
                $params['status'] = $vehicleStatus->value;
            }
        }

        if ($search !== null && $search !== '') {
            $conditions[] = '(v.marca LIKE :search OR v.modelo LIKE :search2 OR v.local LIKE :search3)';
            $params['search'] = '%' . $search . '%';
            $params['search2'] = '%' . $search . '%';
            $params['search3'] = '%' . $search . '%';
        }

        if (!empty($conditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $allowedColumns = ['created_at', 'preco', 'ano', 'km', 'marca'];
        if (!in_array($orderBy, $allowedColumns, true)) {
            $orderBy = 'created_at';
        }

        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY v.{$orderBy} {$order}";
        $sql .= " LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, \PDO::PARAM_INT);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get vehicle by ID with seller info.
     *
     * @return array<string, mixed>|null
     */
    public function getById(int $id): ?array
    {
        $sql = 'SELECT v.*, u.nome as vendedor_nome, u.email as vendedor_email,
                       u.telemovel as vendedor_telemovel
                FROM vehicles v
                JOIN users u ON v.vendedor_id = u.id
                WHERE v.id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$result) {
            return null;
        }

        $imgSql = 'SELECT * FROM vehicle_images WHERE vehicle_id = :vehicle_id ORDER BY is_primary DESC, sort_order ASC';
        $imgStmt = $this->db->prepare($imgSql);
        $imgStmt->execute(['vehicle_id' => $id]);
        $result['images'] = $imgStmt->fetchAll(\PDO::FETCH_ASSOC);

        return $result;
    }

    /**
     * Create a new vehicle listing.
     *
     * @param array<string, mixed> $data
     * @return array{success: bool, vehicle_id: int, message: string}
     */
    public function create(array $data): array
    {
        $required = ['tipo', 'marca', 'modelo', 'ano', 'preco', 'vendedor_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Campo obrigatorio: {$field}");
            }
        }

        $sql = 'INSERT INTO vehicles (tipo, marca, modelo, ano, preco, specs, combustivel, caixa, cor, potencia, tracao, km, local, descricao, vendedor_id, status)
                VALUES (:tipo, :marca, :modelo, :ano, :preco, :specs, :combustivel, :caixa, :cor, :potencia, :tracao, :km, :local, :descricao, :vendedor_id, :status)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'tipo' => $data['tipo'],
            'marca' => $data['marca'],
            'modelo' => $data['modelo'],
            'ano' => (int) $data['ano'],
            'preco' => (float) $data['preco'],
            'specs' => $data['specs'] ?? null,
            'combustivel' => $data['combustivel'] ?? 'gasolina',
            'caixa' => $data['caixa'] ?? 'automatica',
            'cor' => $data['cor'] ?? '',
            'potencia' => (int) ($data['potencia'] ?? 0),
            'tracao' => $data['tracao'] ?? 'dianteira',
            'km' => (int) ($data['km'] ?? 0),
            'local' => $data['local'] ?? '',
            'descricao' => $data['descricao'] ?? null,
            'vendedor_id' => (int) $data['vendedor_id'],
            'status' => VehicleStatus::DISPONIVEL->value,
        ]);

        $vehicleId = (int) $this->db->lastInsertId();

        return [
            'success' => true,
            'vehicle_id' => $vehicleId,
            'message' => 'Veiculo criado com sucesso.',
        ];
    }

    /**
     * Update a vehicle listing.
     *
     * @param int $id
     * @param array<string, mixed> $data
     * @return array{success: bool, message: string}
     */
    public function update(int $id, array $data): array
    {
        $allowed = ['tipo', 'marca', 'modelo', 'ano', 'preco', 'specs', 'combustivel', 'caixa', 'cor', 'potencia', 'tracao', 'km', 'local', 'descricao'];
        $updates = [];
        $params = ['id' => $id];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if (empty($updates)) {
            throw new \InvalidArgumentException("Nenhum campo para atualizar.");
        }

        $sql = 'UPDATE vehicles SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return [
            'success' => true,
            'message' => 'Veiculo atualizado com sucesso.',
        ];
    }

    /**
     * Start negotiation - transition from disponivel to em_negociacao.
     *
     * @throws \InvalidArgumentException if vehicle is not in disponivel status
     * @return array{success: bool, vehicle_id: int, old_status: string, new_status: string, message: string}
     */
    public function startNegotiation(int $vehicleId, int $buyerId): array
    {
        $vehicle = $this->getVehicleForUpdate($vehicleId);

        if ($vehicle->status !== VehicleStatus::DISPONIVEL) {
            throw new \InvalidArgumentException(
                "Veiculo #{$vehicleId} nao esta disponivel para negociacao."
            );
        }

        $sql = 'UPDATE vehicles SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'status' => VehicleStatus::EM_NEGOCIACAO->value,
            'id' => $vehicleId,
        ]);

        $this->logStatusTransition($vehicleId, VehicleStatus::DISPONIVEL, VehicleStatus::EM_NEGOCIACAO, $buyerId);

        return [
            'success' => true,
            'vehicle_id' => $vehicleId,
            'old_status' => VehicleStatus::DISPONIVEL->value,
            'new_status' => VehicleStatus::EM_NEGOCIACAO->value,
            'message' => 'Negociacao iniciada.',
        ];
    }

    /**
     * Complete purchase - transition from em_negociacao to comprado.
     *
     * @throws \InvalidArgumentException if vehicle is not in em_negociacao status
     * @return array{success: bool, vehicle_id: int, old_status: string, new_status: string, commission: float, message: string}
     */
    public function completePurchase(int $vehicleId, float $commissionPaid): array
    {
        $vehicle = $this->getVehicleForUpdate($vehicleId);

        if ($vehicle->status !== VehicleStatus::EM_NEGOCIACAO) {
            throw new \InvalidArgumentException(
                "Veiculo #{$vehicleId} nao esta em negociacao."
            );
        }

        $sql = 'UPDATE vehicles SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'status' => VehicleStatus::COMPRADO->value,
            'id' => $vehicleId,
        ]);

        $this->logStatusTransition($vehicleId, VehicleStatus::EM_NEGOCIACAO, VehicleStatus::COMPRADO);

        return [
            'success' => true,
            'vehicle_id' => $vehicleId,
            'old_status' => VehicleStatus::EM_NEGOCIACAO->value,
            'new_status' => VehicleStatus::COMPRADO->value,
            'commission' => $commissionPaid,
            'message' => 'Transacao concluida.',
        ];
    }

    /**
     * Cancel listing - transition from disponivel or em_negociacao to cancelado.
     *
     * @throws \InvalidArgumentException if vehicle is already sold or cancelled
     * @return array{success: bool, vehicle_id: int, old_status: string, new_status: string, message: string}
     */
    public function cancelListing(int $vehicleId, int $ownerId): array
    {
        $vehicle = $this->getVehicleForUpdate($vehicleId);

        if ($vehicle->status === VehicleStatus::COMPRADO) {
            throw new \InvalidArgumentException("Veiculo #{$vehicleId} ja foi vendido.");
        }

        if ($vehicle->status === VehicleStatus::CANCELADO) {
            throw new \InvalidArgumentException("Veiculo #{$vehicleId} ja esta cancelado.");
        }

        $oldStatus = $vehicle->status;

        $sql = 'UPDATE vehicles SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'status' => VehicleStatus::CANCELADO->value,
            'id' => $vehicleId,
        ]);

        $this->logStatusTransition($vehicleId, $oldStatus, VehicleStatus::CANCELADO, $ownerId);

        return [
            'success' => true,
            'vehicle_id' => $vehicleId,
            'old_status' => $oldStatus->value,
            'new_status' => VehicleStatus::CANCELADO->value,
            'message' => 'Anuncio cancelado.',
        ];
    }

    /**
     * Reactivate listing - transition from em_negociacao back to disponivel.
     *
     * @throws \InvalidArgumentException if vehicle is not in em_negociacao status
     * @return array{success: bool, vehicle_id: int, old_status: string, new_status: string, message: string}
     */
    public function reactivateListing(int $vehicleId): array
    {
        $vehicle = $this->getVehicleForUpdate($vehicleId);

        if ($vehicle->status !== VehicleStatus::EM_NEGOCIACAO) {
            throw new \InvalidArgumentException(
                "Veiculo #{$vehicleId} nao esta em negociacao."
            );
        }

        $sql = 'UPDATE vehicles SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'status' => VehicleStatus::DISPONIVEL->value,
            'id' => $vehicleId,
        ]);

        $this->logStatusTransition($vehicleId, VehicleStatus::EM_NEGOCIACAO, VehicleStatus::DISPONIVEL);

        return [
            'success' => true,
            'vehicle_id' => $vehicleId,
            'old_status' => VehicleStatus::EM_NEGOCIACAO->value,
            'new_status' => VehicleStatus::DISPONIVEL->value,
            'message' => 'Veiculo reativado no mercado.',
        ];
    }

    /**
     * Upload an image for a vehicle.
     *
     * @param int $vehicleId
     * @param int $userId
     * @return array{success: bool, image_id: int, file_path: string, message: string}
     */
    public function uploadImage(int $vehicleId, int $userId): array
    {
        $vehicle = $this->getVehicleForUpdate($vehicleId);

        if ($vehicle->vendedor_id !== $userId) {
            throw new \InvalidArgumentException("Nao tens permissao para adicionar imagens a este veiculo.");
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new \InvalidArgumentException("Nenhuma imagem enviada.");
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes, true)) {
            throw new \InvalidArgumentException("Tipo de imagem nao suportado. Use JPG, PNG ou WebP.");
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException("Imagem excede 5MB.");
        }

        $uploadDir = __DIR__ . '/../../storage/vehicles/' . $vehicleId;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('img_', true) . '.' . $ext;
        $filepath = $uploadDir . '/' . $filename;
        $relativePath = "storage/vehicles/{$vehicleId}/{$filename}";

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new \RuntimeException("Erro ao guardar imagem.");
        }

        $isPrimary = (bool) ($_POST['is_primary'] ?? false);
        $sortOrder = (int) ($_POST['sort_order'] ?? 0);

        if ($isPrimary) {
            $sql = 'UPDATE vehicle_images SET is_primary = 0 WHERE vehicle_id = :vehicle_id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['vehicle_id' => $vehicleId]);
        }

        $sql = 'INSERT INTO vehicle_images (vehicle_id, file_path, is_primary, sort_order)
                VALUES (:vehicle_id, :file_path, :is_primary, :sort_order)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'vehicle_id' => $vehicleId,
            'file_path' => $relativePath,
            'is_primary' => $isPrimary ? 1 : 0,
            'sort_order' => $sortOrder,
        ]);

        $imageId = (int) $this->db->lastInsertId();

        return [
            'success' => true,
            'image_id' => $imageId,
            'file_path' => $relativePath,
            'message' => 'Imagem carregada com sucesso.',
        ];
    }

    /**
     * Get dashboard statistics by status.
     *
     * @return array{disponivel: int, em_negociacao: int, comprado: int, cancelado: int, total: int}
     */
    public function getStats(): array
    {
        $sql = 'SELECT status, COUNT(*) as count FROM vehicles GROUP BY status';
        $stmt = $this->db->query($sql);
        if ($stmt === false) {
            return [
                'disponivel' => 0,
                'em_negociacao' => 0,
                'comprado' => 0,
                'cancelado' => 0,
                'total' => 0,
            ];
        }
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $stats = [
            'disponivel' => 0,
            'em_negociacao' => 0,
            'comprado' => 0,
            'cancelado' => 0,
            'total' => 0,
        ];

        foreach ($results as $row) {
            $status = $row['status'];
            $count = (int) $row['count'];
            if (isset($stats[$status])) {
                $stats[$status] = $count;
            }
            $stats['total'] += $count;
        }

        return $stats;
    }

    /**
     * Internal: Get vehicle and verify it exists for update operations.
     */
    private function getVehicleForUpdate(int $vehicleId): Vehicle
    {
        $sql = 'SELECT * FROM vehicles WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $vehicleId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            throw new \InvalidArgumentException("Veiculo #{$vehicleId} nao encontrado.");
        }

        return new Vehicle(
            id: (int) $row['id'],
            tipo: $row['tipo'],
            marca: $row['marca'],
            modelo: $row['modelo'],
            ano: (int) $row['ano'],
            preco: (float) $row['preco'],
            specs: $row['specs'] ?? '',
            combustivel: $row['combustivel'],
            caixa: $row['caixa'],
            cor: $row['cor'],
            potencia: (int) $row['potencia'],
            tracao: $row['tracao'],
            km: (int) $row['km'],
            local: $row['local'],
            descricao: $row['descricao'] ?? '',
            vendedor_id: (int) $row['vendedor_id'],
            status: VehicleStatus::from($row['status']),
            vistoria: (bool) $row['vistoria'],
            created_at: $row['created_at'],
            updated_at: $row['updated_at'],
        );
    }

    /**
     * Internal: Log status transition for audit trail.
     */
    private function logStatusTransition(
        int $vehicleId,
        VehicleStatus $from,
        VehicleStatus $to,
        ?int $userId = null
    ): void {
        $sql = 'INSERT INTO vehicle_status_logs (vehicle_id, from_status, to_status, user_id, created_at)
                VALUES (:vehicle_id, :from_status, :to_status, :user_id, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'vehicle_id' => $vehicleId,
            'from_status' => $from->value,
            'to_status' => $to->value,
            'user_id' => $userId,
        ]);
    }
}
