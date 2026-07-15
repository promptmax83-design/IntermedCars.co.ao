<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class CommissionService
{
    private \PDO $db;

    private const SELLER_COMMISSION_PCT = 0.05;
    private const BUYER_COMMISSION_PCT = 0.03;
    private const CONSULTANT_SPLIT = [
        'Bronze' => 0.20,
        'Prata' => 0.30,
        'Ouro' => 0.40,
        'Embaixador' => 0.50,
    ];

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function calculateCommissions(float $finalPrice): array
    {
        $sellerCommission = round($finalPrice * self::SELLER_COMMISSION_PCT, 2);
        $buyerCommission = round($finalPrice * self::BUYER_COMMISSION_PCT, 2);
        $totalFees = $sellerCommission + $buyerCommission;

        return [
            'final_car_price_aoa' => $finalPrice,
            'commission_seller_aoa' => $sellerCommission,
            'commission_buyer_aoa' => $buyerCommission,
            'total_fees_collected_aoa' => $totalFees,
        ];
    }

    public function calculateConsultantPayout(float $totalFees, string $rank): array
    {
        $sharePercent = self::CONSULTANT_SPLIT[$rank] ?? 0.20;
        $consultantPayout = round($totalFees * $sharePercent, 2);
        $platformNetRevenue = round($totalFees - $consultantPayout, 2);

        return [
            'consultant_payout_aoa' => $consultantPayout,
            'platform_net_revenue_aoa' => $platformNetRevenue,
            'consultant_share_pct' => $sharePercent,
        ];
    }

    public function generatePaymentRef(int $negotiationId, string $role): string
    {
        $prefix = $role === 'seller' ? 'VEN' : 'COM';
        $timestamp = date('ymd');
        $random = strtoupper(substr(uniqid(), -4));
        return "IC-{$prefix}-{$negotiationId}-{$timestamp}-{$random}";
    }

    public function areBothFeesPaid(int $negotiationId): bool
    {
        $sql = "SELECT 
                    SUM(CASE WHEN payer_role = 'seller' AND status = 'confirmado' THEN 1 ELSE 0 END) as seller_paid,
                    SUM(CASE WHEN payer_role = 'buyer' AND status = 'confirmado' THEN 1 ELSE 0 END) as buyer_paid
                FROM fee_payments WHERE negotiation_id = :neg_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['neg_id' => $negotiationId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        return ($row['seller_paid'] ?? 0) > 0 && ($row['buyer_paid'] ?? 0) > 0;
    }

    public function processConsultantPayout(int $negotiationId): array
    {
        $sql = 'SELECT * FROM negotiations WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiationId]);
        $negotiation = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociação não encontrada");
        }

        $sql = 'SELECT rank FROM consultants WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiation['consultant_id']]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);
        $rank = $consultant['rank'] ?? 'Bronze';

        $payout = $this->calculateConsultantPayout($negotiation['total_fees_collected_aoa'], $rank);

        $sql = 'UPDATE negotiations SET 
                    consultant_payout_aoa = :payout,
                    consultant_share_pct = :share,
                    platform_net_revenue_aoa = :platform,
                    status = :status,
                    completed_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'payout' => $payout['consultant_payout_aoa'],
            'share' => $payout['consultant_share_pct'],
            'platform' => $payout['platform_net_revenue_aoa'],
            'status' => 'concluido',
            'id' => $negotiationId,
        ]);

        $this->updateConsultantStats($negotiation['consultant_id']);

        return $payout;
    }

    public function getFinancialSummary(int $negotiationId): array
    {
        $sql = 'SELECT n.*, c.fullname as consultant_name, c.rank as consultant_rank
                FROM negotiations n
                JOIN consultants c ON n.consultant_id = c.id
                WHERE n.id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $negotiationId]);
        $negotiation = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$negotiation) {
            throw new \InvalidArgumentException("Negociação não encontrada");
        }

        return [
            'negotiation_id' => $negotiationId,
            'final_car_price_aoa' => (float) $negotiation['final_car_price_aoa'],
            'seller_commission' => [
                'amount_aoa' => (float) $negotiation['commission_seller_aoa'],
                'paid' => (bool) $negotiation['has_seller_paid_fee'],
                'payment_ref' => $negotiation['seller_payment_ref'],
            ],
            'buyer_commission' => [
                'amount_aoa' => (float) $negotiation['commission_buyer_aoa'],
                'paid' => (bool) $negotiation['has_buyer_paid_fee'],
                'payment_ref' => $negotiation['buyer_payment_ref'],
            ],
            'total_fees' => (float) $negotiation['total_fees_collected_aoa'],
            'consultant' => [
                'name' => $negotiation['consultant_name'],
                'rank' => $negotiation['consultant_rank'],
                'share_pct' => (float) $negotiation['consultant_share_pct'],
                'payout_aoa' => (float) $negotiation['consultant_payout_aoa'],
            ],
            'platform_net_revenue_aoa' => (float) $negotiation['platform_net_revenue_aoa'],
            'status' => $negotiation['status'],
        ];
    }

    private function updateConsultantStats(int $consultantId): void
    {
        $sql = 'UPDATE consultants SET total_deals = total_deals + 1 WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $consultantId]);

        $sql = 'SELECT total_deals, rating, rank FROM consultants WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $consultantId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$consultant) return;

        $newRank = $this->calculateNewRank($consultant['total_deals'], $consultant['rating']);

        if ($newRank !== $consultant['rank']) {
            $sql = 'UPDATE consultants SET rank = :rank WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['rank' => $newRank, 'id' => $consultantId]);

            $sql = 'INSERT INTO ranking_history (consultant_id, old_rank, new_rank, reason, deals_at_change, created_at)
                    VALUES (:cid, :old, :new, :reason, :deals, CURRENT_TIMESTAMP)';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'cid' => $consultantId,
                'old' => $consultant['rank'],
                'new' => $newRank,
                'reason' => 'Upgrade automático por performance',
                'deals' => $consultant['total_deals'],
            ]);
        }
    }

    private function calculateNewRank(int $totalDeals, float $rating): string
    {
        if ($totalDeals >= 50 && $rating >= 4.8) return 'Embaixador';
        if ($totalDeals >= 20 && $rating >= 4.5) return 'Ouro';
        if ($totalDeals >= 10 && $rating >= 4.0) return 'Prata';
        return 'Bronze';
    }
}
