<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

/**
 *
 * Handles payment deadline enforcement and user banning.
 *
 * Business Rules:
 *   - Day 3 (72h): Standard warning message "pagamento em atraso" sent to the user
 *   - Day 4 (96h): +10.000 Kz penalty for abuse (total debt: 110.000 Kz) + temporary ban
 *   - Unban only after the full debt is paid
 *   - Anti-recidivism: cross-reference BI/passport, email, phone, Face ID, parent names
 */
class PenaltyService
{
    private const PENALTY_RATE = 0.01;
    private const STANDARD_COMMISSION_RATE = 0.01;

    /**
     * Calculate the penalty amount for a user.
     *
     * @param float $vehiclePrice The agreed vehicle price
     * @return array{standard_commission: float, penalty: float, total_debt: float}
     */
    public function calculatePenalty(float $vehiclePrice): array
    {
        $standardCommission = round($vehiclePrice * self::STANDARD_COMMISSION_RATE, 2);
        $penalty = round($vehiclePrice * self::PENALTY_RATE, 2);
        $totalDebt = $standardCommission + $penalty;

        return [
            'standard_commission' => $standardCommission,
            'penalty' => $penalty,
            'total_debt' => $totalDebt,
        ];
    }

    /**
     * Get the warning deadline timestamp.
     *
     * @param string $commissionDueAt ISO 8601 datetime string
     * @return string ISO 8601 datetime string
     */
    public function getWarningDeadline(string $commissionDueAt): string
    {
        $dueTime = new \DateTime($commissionDueAt);
        return $dueTime->format('Y-m-d\TH:i:sP');
    }

    /**
     * Get the penalty deadline timestamp (24h after warning).
     *
     * @param string $commissionDueAt ISO 8601 datetime string
     * @return string ISO 8601 datetime string
     */
    public function getPenaltyDeadline(string $commissionDueAt): string
    {
        $dueTime = new \DateTime($commissionDueAt);
        $dueTime->modify('+24 hours');
        return $dueTime->format('Y-m-d\TH:i:sP');
    }

    /**
     * Determine the current penalty status for a user based on commission deadline.
     *
     * @param string $commissionDueAt ISO 8601 datetime string of commission deadline
     * @return array{status: string, warning: bool, penalty_applied: bool, message: string}
     */
    public function getPenaltyStatus(string $commissionDueAt): array
    {
        $now = new \DateTime();
        $dueTime = new \DateTime($commissionDueAt);
        $warningDeadline = clone $dueTime;
        $penaltyDeadline = clone $dueTime;
        $penaltyDeadline->modify('+24 hours');

        if ($now <= $dueTime) {
            return [
                'status' => 'noao_excedido',
                'warning' => false,
                'penalty_applied' => false,
                'message' => 'Pagamento dentro do prazo.',
            ];
        }

        if ($now > $dueTime && $now <= $penaltyDeadline) {
            return [
                'status' => 'em_atraso',
                'warning' => true,
                'penalty_applied' => false,
                'message' => 'Pagamento em atraso. Prazo de 72h excedido.',
            ];
        }

        return [
            'status' => 'multa_aplicada',
            'warning' => true,
            'penalty_applied' => true,
            'message' => 'Multa de 10.000 Kz aplicada por abuso. Divida total: 110.000 Kz. Conta temporariamente banida.',
        ];
    }

    /**
     * Apply penalty to a user: temporary ban + debt record.
     *
     * @param int $userId
     * @param int $transactionId
     * @param float $penaltyAmount
     * @return array{success: bool, message: string}
     */
    public function applyPenalty(int $userId, int $transactionId, float $penaltyAmount): array
    {
        $sql = 'INSERT INTO user_debts (user_id, transaction_id, amount, type, created_at)
                VALUES (:user_id, :transaction_id, :amount, :type, NOW())';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'transaction_id' => $transactionId,
            'amount' => $penaltyAmount,
            'type' => 'multa_abuso',
        ]);

        $sql = 'UPDATE users SET status = :status, banned_at = NOW() WHERE id = :id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'status' => 'temporariamente_banido',
            'id' => $userId,
        ]);

        return [
            'success' => true,
            'message' => 'Multa aplicada e utilizador banido temporariamente.',
        ];
    }

    /**
     * Unban a user after full debt payment.
     *
     * @param int $userId
     * @return array{success: bool, message: string}
     */
    public function unbanUser(int $userId): array
    {
        $sql = 'SELECT SUM(amount) as total_debt FROM user_debts WHERE user_id = :user_id AND paid = 0';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($result && (float) $result['total_debt'] > 0) {
            return [
                'success' => false,
                'message' => 'Divida pendente. Pagamento total obrigatorio para desbloqueio.',
            ];
        }

        $sql = 'UPDATE users SET status = :status, banned_at = NULL WHERE id = :id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'status' => 'verificado',
            'id' => $userId,
        ]);

        return [
            'success' => true,
            'message' => 'Conta desbloqueada com sucesso.',
        ];
    }

    /**
     * Get the standard warning message for late payment.
     *
     * @return string The standard warning message
     */
    public function getWarningMessage(): string
    {
        return 'Pagamento em atraso. O prazo de 72 horas para pagamento da taxa foi excedido.';
    }
}
