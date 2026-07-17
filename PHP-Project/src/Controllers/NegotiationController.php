<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\NegotiationService;

class NegotiationController extends BaseController
{
    private NegotiationService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new NegotiationService();
    }

    public function create(int $userId, array $data): void
    {
        try {
            $vehicleId = (int) ($data['vehicle_id'] ?? 0);
            $sellerId = (int) ($data['seller_id'] ?? $userId);
            $zone = $data['zone'] ?? 'Luanda';
            $result = $this->service->create($vehicleId, $sellerId, $zone);
            $this->success($result, $result['message'] ?? 'Negociacao criada');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] create error: " . $e->getMessage());
            $this->error('Erro interno do servidor', 500);
        }
    }

    public function listByUser(int $userId): void
    {
        try {
            $result = $this->service->listByUser($userId);
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] listByUser error: " . $e->getMessage());
            $this->error('Erro ao listar negociacoes', 500);
        }
    }

    public function getById(int $id): void
    {
        try {
            $result = $this->service->getById($id);
            if (!$result) {
                $this->error('Negociacao nao encontrada', 404);
            }
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] getById error: " . $e->getMessage());
            $this->error('Erro ao buscar negociacao', 500);
        }
    }

    public function getPaymentStatus(int $id): void
    {
        try {
            $result = $this->service->getPaymentStatus($id);
            $this->success($result);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 404);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] getPaymentStatus error: " . $e->getMessage());
            $this->error('Erro ao buscar status de pagamento', 500);
        }
    }

    public function inspection(int $id, array $data): void
    {
        try {
            $consultantId = (int) ($data['consultant_id'] ?? 0);
            $result = $this->service->submitInspection($id, $consultantId, $data);
            $this->success($result, $result['message'] ?? 'Vistoria submetida');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] inspection error: " . $e->getMessage());
            $this->error('Erro ao submeter vistoria', 500);
        }
    }

    public function close(int $id): void
    {
        try {
            $data = $this->getRequestBody();
            $finalPrice = (float) ($data['final_price_aoa'] ?? 0);
            if ($finalPrice <= 0) {
                $this->error('Preco final obrigatorio', 400);
            }
            $result = $this->service->closeDeal($id, null, $finalPrice);
            $this->success($result, $result['message'] ?? 'Negocio fechado');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] close error: " . $e->getMessage());
            $this->error('Erro ao fechar negocio', 500);
        }
    }

    public function confirmPayment(int $id): void
    {
        try {
            $data = $this->getRequestBody();
            $role = $data['role'] ?? 'seller';
            $paymentRef = $data['payment_ref'] ?? 'manual-' . time();
            $result = $this->service->confirmPayment($id, $role, $paymentRef);
            $this->success($result, $result['message'] ?? 'Pagamento confirmado');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] confirmPayment error: " . $e->getMessage());
            $this->error('Erro ao confirmar pagamento', 500);
        }
    }

    public function complete(int $id): void
    {
        try {
            $result = $this->service->complete($id);
            $this->success($result, $result['message'] ?? 'Negocio concluido');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] complete error: " . $e->getMessage());
            $this->error('Erro ao concluir negocio', 500);
        }
    }

    public function cancel(int $id): void
    {
        try {
            $result = $this->service->cancel($id);
            $this->success($result, $result['message'] ?? 'Negociacao cancelada');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] cancel error: " . $e->getMessage());
            $this->error('Erro ao cancelar negociacao', 500);
        }
    }

    public function confirmDelivery(int $id): void
    {
        try {
            $data = $this->getRequestBody();
            $userId = (int) ($data['user_id'] ?? 0);
            $role = $data['role'] ?? 'buyer';
            $result = $this->service->confirmDelivery($id, $userId, $role);
            $this->success($result, $result['message'] ?? 'Entrega confirmada');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[NegotiationController] confirmDelivery error: " . $e->getMessage());
            $this->error('Erro ao confirmar entrega', 500);
        }
    }
}
