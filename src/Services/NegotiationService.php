<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class NegotiationService
{
    private \PDO $db;
    private CommissionService $commissionService;
    private NotificationService $notificationService;
    private ConsultantService $consultantService;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->commissionService = new CommissionService();
        $this->notificationService = new NotificationService();
        $this->consultantService = new ConsultantService();
    }

    public function create(int $vehicleId, int $sellerId, string $zone): array
    {
        $consultant = $this->consultantService->assign($zone);
        if (!$consultant) {
            throw new \InvalidArgumentException("Nenhum consultor disponível na zona");
        }

        $sql = 'INSERT INTO negotiations (vehicle_id, seller_id, consultant_id, status, created_at)
                VALUES (:vehicle_id, :seller_id, :consultant_id, :status, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'vehicle_id' => $vehicleId,
            'seller_id' => $sellerId,
            'consultant_id' => $consultant['id'],
            'status' => 'aguardando_vistoria',
        ]);

        $negotiationId = (int) $this->db->lastInsertId();
        $this->createChatChannels($negotiationId);

        return [
            'success' => true,
            'negotiation_id' => $negotiationId,
            'consultant' => [
                'id' => $consultant['id'],
                'name' => $consultant['fullname'],
                'rank' => $consultant['rank'],
            ],
        ];
    }

    public function submitInspection(int $negotiationId, int $consultantId, array $data): array
    {
        $this->validateConsultant($negotiationId, $consultantId);
        $this->validateStatus($negotiationId, 'aguardando_vistoria');

        $sql = 'UPDATE negotiations SET 
                    inspection_report = :report,
                    inspection_photos = :photos,
                    proposed_price_aoa = :price,
                    inspected_at = CURRENT_TIMESTAMP,
                    status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'report' => $data['report'] ?? '',
            'photos' => json_encode($data['photos'] ?? []),
            'price' => $data['proposed_price'] ?? 0,
            'status' => 'vistoriado',
            'id' => $negotiationId,
        ]);

        return ['success' => true, 'message' => 'Vistoria submetida com sucesso'];
    }

    public function closeDeal(int $negotiationId, int $consultantId, float $finalPrice): array
    {
        $this->validateConsultant($negotiationId, $consultantId);
        $this->validateStatus($negotiationId, 'vistoriado');

        $commissions = $this->commissionService->calculateCommissions($finalPrice);
        $sellerRef = $this->commissionService->generatePaymentRef($negotiationId, 'seller');
        $buyerRef = $this->commissionService->generatePaymentRef($negotiationId, 'buyer');

        $sql = 'UPDATE negotiations SET 
                    final_car_price_aoa = :price,
                    commission_seller_aoa = :seller_comm,
                    commission_buyer_aoa = :buyer_comm,
                    total_fees_collected_aoa = :total,
                    seller_payment_ref = :seller_ref,
                    buyer_payment_ref = :buyer_ref,
                    closed_at = CURRENT_TIMESTAMP,
                    status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'price' => $finalPrice,
            'seller_comm' => $commissions['commission_seller_aoa'],
            'buyer_comm' => $commissions['commission_buyer_aoa'],
            'total' => $commissions['total_fees_collected_aoa'],
            'seller_ref' => $sellerRef,
            'buyer_ref' => $buyerRef,
            'status' => 'aguardando_pagamento_taxas',
            'id' => $negotiationId,
        ]);

        return [
            'success' => true,
            'final_price' => $finalPrice,
            'seller_commission' => $commissions['commission_seller_aoa'],
            'buyer_commission' => $commissions['commission_buyer_aoa'],
            'seller_payment_ref' => $sellerRef,
            'buyer_payment_ref' => $buyerRef,
        ];
    }

    public function confirmPayment(int $negotiationId, string $role, string $paymentRef): array
    {
        $this->validateStatus($negotiationId, 'aguardando_pagamento_taxas');

        $column = $role === 'seller' ? 'has_seller_paid_fee' : 'has_buyer_paid_fee';
        $sql = "UPDATE negotiations SET {$column} = 1, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiationId]);

        if ($this->commissionService->areBothFeesPaid($negotiationId)) {
            $sql = "UPDATE negotiations SET status = 'taxas_pagas', updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['id' => $negotiationId]);
            return ['success' => true, 'both_paid' => true, 'message' => 'Ambas as taxas pagas! Sinal Verde activado.'];
        }

        return ['success' => true, 'both_paid' => false, 'message' => "Pagamento {$role} registado. Aguardando a outra parte."];
    }

    public function complete(int $negotiationId): array
    {
        $this->validateStatus($negotiationId, 'taxas_pagas');
        $payout = $this->commissionService->processConsultantPayout($negotiationId);

        return [
            'success' => true,
            'message' => 'Transação concluída com sucesso!',
            'consultant_payout' => $payout,
        ];
    }

    public function cancel(int $negotiationId, ?int $userId = null): array
    {
        $sql = "UPDATE negotiations SET status = 'cancelado', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiationId]);
        return ['success' => true, 'message' => 'Negociação cancelada'];
    }

    public function getById(int $id): ?array
    {
        $sql = 'SELECT n.*, v.marca, v.modelo, v.ano, v.cor,
                    s.nome as seller_name, s.email as seller_email,
                    b.nome as buyer_name, b.email as buyer_email,
                    c.fullname as consultant_name, c.rank as consultant_rank
                FROM negotiations n
                JOIN vehicles v ON n.vehicle_id = v.id
                JOIN users s ON n.seller_id = s.id
                LEFT JOIN users b ON n.buyer_id = b.id
                JOIN consultants c ON n.consultant_id = c.id
                WHERE n.id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    public function listByUser(int $userId): array
    {
        $sql = 'SELECT n.*, v.marca, v.modelo, c.fullname as consultant_name
                FROM negotiations n
                JOIN vehicles v ON n.vehicle_id = v.id
                JOIN consultants c ON n.consultant_id = c.id
                WHERE n.seller_id = :userId OR n.buyer_id = :userId
                ORDER BY n.created_at DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['userId' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function validateConsultant(int $negotiationId, int $consultantId): void
    {
        $sql = 'SELECT consultant_id FROM negotiations WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiationId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row || (int) $row['consultant_id'] !== $consultantId) {
            throw new \InvalidArgumentException("Não é o consultor desta negociação");
        }
    }

    private function validateStatus(int $negotiationId, string $expectedStatus): void
    {
        $sql = 'SELECT status FROM negotiations WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiationId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) {
            throw new \InvalidArgumentException("Negociação não encontrada");
        }
        if ($row['status'] !== $expectedStatus) {
            throw new \InvalidArgumentException("Estado inválido: esperado '{$expectedStatus}', obtido '{$row['status']}'");
        }
    }

    private function createChatChannels(int $negotiationId): void
    {
        $sql = 'INSERT INTO chat_channels (negotiation_id, channel_type, created_at) VALUES (:neg_id, :type, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['neg_id' => $negotiationId, 'type' => 'seller_consultant']);
        $stmt->execute(['neg_id' => $negotiationId, 'type' => 'buyer_consultant']);
    }
}
