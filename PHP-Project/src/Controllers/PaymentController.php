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
            $db = \IntermedCars\Database\Database::getConnection();

            // Check fee_payments table
            $sql = "SELECT fp.*, n.status as negotiation_status, n.final_car_price_aoa
                    FROM fee_payments fp
                    LEFT JOIN negotiations n ON fp.negotiation_id = n.id
                    WHERE fp.id = :id OR fp.payment_ref = :ref
                    ORDER BY fp.created_at DESC LIMIT 1";
            $stmt = $db->prepare($sql);
            $stmt->execute(['id' => (int) $transactionId, 'ref' => $transactionId]);
            $payment = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($payment) {
                $this->success([
                    'transaction_id' => $transactionId,
                    'payment_id' => $payment['id'],
                    'status' => $payment['status'],
                    'amount_aoa' => $payment['amount_aoa'],
                    'payer_role' => $payment['payer_role'],
                    'negotiation_status' => $payment['negotiation_status'] ?? null,
                    'confirmed_at' => $payment['confirmed_at'] ?? null,
                    'message' => 'Status do pagamento consultado.',
                ]);
                return;
            }

            // Check negotiations table
            $sql2 = "SELECT id, status, final_car_price_aoa, commission_seller_aoa, commission_buyer_aoa,
                            has_seller_paid_fee, has_buyer_paid_fee
                     FROM negotiations WHERE id = :id";
            $stmt2 = $db->prepare($sql2);
            $stmt2->execute(['id' => (int) $transactionId]);
            $negotiation = $stmt2->fetch(\PDO::FETCH_ASSOC);

            if ($negotiation) {
                $this->success([
                    'transaction_id' => $transactionId,
                    'type' => 'negotiation',
                    'status' => $negotiation['status'],
                    'final_price_aoa' => $negotiation['final_car_price_aoa'],
                    'seller_fee' => $negotiation['commission_seller_aoa'],
                    'buyer_fee' => $negotiation['commission_buyer_aoa'],
                    'seller_paid' => (bool) $negotiation['has_seller_paid_fee'],
                    'buyer_paid' => (bool) $negotiation['has_buyer_paid_fee'],
                    'message' => 'Status da negociacao consultado.',
                ]);
                return;
            }

            $this->error('Pagamento nao encontrado', 404);
        } catch (\Throwable $e) {
            error_log("[PaymentController] getStatus error: " . $e->getMessage());
            $this->error('Erro ao consultar status', 500);
        }
    }
}
