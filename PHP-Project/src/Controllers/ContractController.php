<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\ContractService;
use IntermedCars\Database\Database;

class ContractController extends BaseController
{
    private ContractService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new ContractService();
    }

    public function getById(int $id): void
    {
        try {
            $result = $this->service->getContract($id);
            if (!$result['success']) {
                $this->error($result['message'], 404);
            }
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[ContractController] getById error: " . $e->getMessage());
            $this->error('Erro ao buscar contrato', 500);
        }
    }

    public function sign(int $id, array $data): void
    {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare('UPDATE transactions SET status = :status WHERE id = :id');
            $stmt->execute(['status' => 'contrato_assinado', 'id' => $id]);

            $this->success([
                'success' => true,
                'transaction_id' => $id,
                'message' => 'Contrato assinado com sucesso.',
            ], 'Contrato assinado');
        } catch (\Throwable $e) {
            error_log("[ContractController] sign error: " . $e->getMessage());
            $this->error('Erro ao assinar contrato', 500);
        }
    }
}
