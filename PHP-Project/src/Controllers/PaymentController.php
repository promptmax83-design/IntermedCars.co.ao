<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\MulticaixaService;

class PaymentController extends BaseController
{
    private MulticaixaService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new MulticaixaService();
    }

    public function multicaixaPay(int $userId, array $data): void
    {
        try {
            $phone = $data['phone'] ?? '';
            $amount = (float) ($data['amount'] ?? 0);
            $negotiationId = (int) ($data['negotiation_id'] ?? 0);

            if (empty($phone)) {
                $this->error('Numero de telemovel obrigatorio', 400);
            }
            if ($amount <= 0) {
                $this->error('Valor deve ser maior que zero', 400);
            }

            $result = $this->service->createFeePayment($phone, $amount, $negotiationId, $data['role'] ?? 'buyer');
            $this->success($result, $result['message'] ?? 'Pagamento iniciado');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[PaymentController] multicaixaPay error: " . $e->getMessage());
            $this->error('Erro ao processar pagamento', 500);
        }
    }

    public function multicaixaCallback(array $data): void
    {
        try {
            $result = $this->service->handleCallback($data);
            $this->success($result, 'Callback processado');
        } catch (\Throwable $e) {
            error_log("[PaymentController] multicaixaCallback error: " . $e->getMessage());
            $this->error('Erro ao processar callback', 500);
        }
    }

    public function getStatus(string $transactionId): void
    {
        try {
            $this->success([
                'transaction_id' => $transactionId,
                'status' => 'pending',
                'message' => 'Status do pagamento consultado.',
            ]);
        } catch (\Throwable $e) {
            error_log("[PaymentController] getStatus error: " . $e->getMessage());
            $this->error('Erro ao consultar status', 500);
        }
    }
}
