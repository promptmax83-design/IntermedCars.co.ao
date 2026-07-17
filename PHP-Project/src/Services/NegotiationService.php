<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class NegotiationService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(int $vehicleId, int $sellerId, string $zone = 'Luanda'): array
    {
        $vehicle = $this->getVehicle($vehicleId);
        if (!$vehicle) {
            throw new \InvalidArgumentException("Veiculo nao encontrado");
        }

        $consultant = $this->assignConsultant($zone);
        if (!$consultant) {
            throw new \InvalidArgumentException("Nenhum consultor disponivel na zona: {$zone}");
        }

        $sql = 'INSERT INTO negotiations (vehicle_id, seller_id, consultant_id, status, created_at)
                VALUES (:vid, :sid, :cid, :status, CURRENT_TIMESTAMP)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'vid' => $vehicleId,
            'sid' => $sellerId,
            'cid' => $consultant['id'],
            'status' => 'aguardando_vistoria',
        ]);

        $negotiationId = (int) $this->db->lastInsertId();

        return [
            'success' => true,
            'negotiation_id' => $negotiationId,
            'consultant' => $consultant,
            'vehicle' => $vehicle,
            'status' => 'aguardando_vistoria',
            'message' => 'Negociacao criada. Consultor atribuido.',
        ];
    }

    public function submitInspection(int $id, int $consultantId, array $data): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }
        if ($negotiation['status'] !== 'aguardando_vistoria') {
            throw new \InvalidArgumentException("Negociacao nao esta em fase de vistoria");
        }

        $report = $data['report'] ?? '';
        $photos = $data['photos'] ?? '';
        $proposedPrice = (float) ($data['proposed_price_aoa'] ?? 0);

        $sql = 'UPDATE negotiations 
                SET status = :status, 
                    inspection_report = :report,
                    inspection_photos = :photos,
                    proposed_price_aoa = :price,
                    inspected_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'status' => 'vistoriado',
            'report' => $report,
            'photos' => $photos,
            'price' => $proposedPrice > 0 ? $proposedPrice : null,
            'id' => $id,
        ]);

        return [
            'success' => true,
            'status' => 'vistoriado',
            'proposed_price_aoa' => $proposedPrice,
            'message' => 'Vistoria submetida com sucesso.',
        ];
    }

    public function closeDeal(int $id, ?int $userId, float $finalPrice): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }
        if ($finalPrice <= 0) {
            throw new \InvalidArgumentException("Valor final deve ser maior que zero");
        }

        $sellerFee = $finalPrice * 0.05;
        $buyerFee = $finalPrice * 0.03;

        $sql = 'UPDATE negotiations 
                SET final_car_price_aoa = :price,
                    commission_seller_aoa = :seller_fee,
                    commission_buyer_aoa = :buyer_fee,
                    status = :status,
                    closed_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'price' => $finalPrice,
            'seller_fee' => $sellerFee,
            'buyer_fee' => $buyerFee,
            'status' => 'aguardando_pagamento_taxas',
            'id' => $id,
        ]);

        $sellerRef = "IC-{$id}-seller-" . time();
        $buyerRef = "IC-{$id}-buyer-" . time();

        $this->createFeePayment($id, $negotiation['seller_id'], 'seller', $sellerFee, $sellerRef);
        $this->createFeePayment($id, $negotiation['buyer_id'] ?? 0, 'buyer', $buyerFee, $buyerRef);

        return [
            'success' => true,
            'final_price_aoa' => $finalPrice,
            'seller_fee' => $sellerFee,
            'buyer_fee' => $buyerFee,
            'seller_ref' => $sellerRef,
            'buyer_ref' => $buyerRef,
            'total_fees' => $sellerFee + $buyerFee,
            'status' => 'aguardando_pagamento_taxas',
            'message' => 'Negocio fechado. Taxas geradas.',
        ];
    }

    public function confirmPayment(int $id, string $role, string $paymentRef): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }

        if ($role === 'seller') {
            $sql = 'UPDATE negotiations SET has_seller_paid_fee = 1, seller_payment_ref = :ref, seller_paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        } elseif ($role === 'buyer') {
            $sql = 'UPDATE negotiations SET has_buyer_paid_fee = 1, buyer_payment_ref = :ref, buyer_paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        } else {
            throw new \InvalidArgumentException("Role invalido: {$role}");
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['ref' => $paymentRef, 'id' => $id]);

        $updated = $this->getById($id);
        if ($updated['has_seller_paid_fee'] && $updated['has_buyer_paid_fee']) {
            $this->updateStatus($id, 'taxas_pagas');
        }

        return [
            'success' => true,
            'role' => $role,
            'both_paid' => (bool) ($updated['has_seller_paid_fee'] && $updated['has_buyer_paid_fee']),
            'message' => "Pagamento de {$role} confirmado.",
        ];
    }

    public function complete(int $id): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }
        if ($negotiation['status'] !== 'taxas_pagas') {
            throw new \InvalidArgumentException("Taxas ainda nao foram pagas");
        }

        $this->updateStatus($id, 'concluido');
        $sql = 'UPDATE negotiations SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $this->updateConsultantStats((int) $negotiation['consultant_id']);

        return [
            'success' => true,
            'status' => 'concluido',
            'message' => 'Negocio concluido com sucesso!',
        ];
    }

    public function cancel(int $id, ?int $userId = null): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }

        $this->updateStatus($id, 'cancelado');
        $sql = 'UPDATE negotiations SET cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        return ['success' => true, 'status' => 'cancelado', 'message' => 'Negociacao cancelada.'];
    }

    public function getById(int $id): ?array
    {
        $sql = 'SELECT n.*, v.marca, v.modelo, v.ano, v.cor, v.matricula, v.km,
                       c.fullname as consultant_name, c.rank as consultant_rank, c.phone as consultant_phone
                FROM negotiations n
                LEFT JOIN vehicles v ON n.vehicle_id = v.id
                LEFT JOIN consultants c ON n.consultant_id = c.id
                WHERE n.id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function listByUser(int $userId): array
    {
        $sql = 'SELECT n.*, v.marca, v.modelo, v.ano, v.foto_url,
                       c.fullname as consultant_name
                FROM negotiations n
                LEFT JOIN vehicles v ON n.vehicle_id = v.id
                LEFT JOIN consultants c ON n.consultant_id = c.id
                WHERE n.seller_id = :uid OR n.buyer_id = :uid OR n.consultant_id IN (SELECT id FROM consultants WHERE user_id = :uid2)
                ORDER BY n.created_at DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId, 'uid2' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getPaymentStatus(int $id): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }

        return [
            'success' => true,
            'negotiation_id' => $id,
            'status' => $negotiation['status'],
            'final_price_aoa' => (float) ($negotiation['final_car_price_aoa'] ?? 0),
            'seller_fee' => (float) ($negotiation['commission_seller_aoa'] ?? 0),
            'buyer_fee' => (float) ($negotiation['commission_buyer_aoa'] ?? 0),
            'seller_paid' => (bool) ($negotiation['has_seller_paid_fee'] ?? false),
            'buyer_paid' => (bool) ($negotiation['has_buyer_paid_fee'] ?? false),
            'seller_paid_at' => $negotiation['seller_paid_at'] ?? null,
            'buyer_paid_at' => $negotiation['buyer_paid_at'] ?? null,
            'both_paid' => (bool) ($negotiation['has_seller_paid_fee'] && $negotiation['has_buyer_paid_fee']),
            'seller_ref' => $negotiation['seller_payment_ref'] ?? null,
            'buyer_ref' => $negotiation['buyer_payment_ref'] ?? null,
        ];
    }

    public function confirmDelivery(int $id, int $userId, string $role): array
    {
        $negotiation = $this->getById($id);
        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociacao nao encontrada");
        }

        $field = $role === 'buyer' ? 'buyer_delivered_at' : 'seller_delivered_at';
        $sql = "UPDATE negotiations SET {$field} = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $updated = $this->getById($id);
        if ($updated['buyer_delivered_at'] && $updated['seller_delivered_at']) {
            $this->updateStatus($id, 'concluido');
            $sql2 = 'UPDATE negotiations SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
            $stmt2 = $this->db->prepare($sql2);
            $stmt2->execute(['id' => $id]);
        }

        return [
            'success' => true,
            'role' => $role,
            'both_confirmed' => (bool) ($updated['buyer_delivered_at'] && $updated['seller_delivered_at']),
            'status' => $updated['buyer_delivered_at'] && $updated['seller_delivered_at'] ? 'concluido' : $updated['status'],
            'message' => $role === 'buyer' ? 'Rececao do carro confirmada.' : 'Entrega do veiculo confirmada.',
        ];
    }

    private function updateStatus(int $id, string $status): void
    {
        $sql = 'UPDATE negotiations SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['status' => $status, 'id' => $id]);
    }

    private function getVehicle(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM vehicles WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    private function assignConsultant(string $zone): ?array
    {
        $sql = 'SELECT * FROM consultants WHERE zone = :zone AND is_active = 1 ORDER BY rating DESC LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['zone' => $zone]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    private function createFeePayment(int $negotiationId, int $payerId, string $role, float $amount, string $ref): void
    {
        if ($payerId <= 0) return;
        $sql = 'INSERT INTO fee_payments (negotiation_id, payer_id, payer_role, amount_aoa, payment_ref, status) VALUES (:nid, :pid, :role, :amount, :ref, :status)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'nid' => $negotiationId,
            'pid' => $payerId,
            'role' => $role,
            'amount' => $amount,
            'ref' => $ref,
            'status' => 'pendente',
        ]);
    }

    private function updateConsultantStats(int $consultantId): void
    {
        $sql = 'UPDATE consultants SET total_deals = total_deals + 1 WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $consultantId]);
    }
}
