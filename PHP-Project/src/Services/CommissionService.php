<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

/**
 *
 * Handles the fixed platform fee per transaction (100,000 Kz, seller only).
 *
 * Business Rules:
 *   - Fixed platform fee of 100,000 Kz paid by the seller only. Buyer pays nothing (optional tip).
 *   - Commission is charged AFTER the inspection (vistoria) is completed
 *   - Payment deadline: 72 hours from the completed inspection
 *   - No upfront charging
 *   - Payment must include proof (comprovativo) verified by AI
 *   - IBAN: stored in env vars (PAYMENT_IBAN), never in source code
 */
class CommissionService
{
    private const FIXED_FEE_SELLER = 100000;
    private const PAYMENT_DEADLINE_HOURS = 72;

    private PaymentProofService $proofService;

    public function __construct()
    {
        $this->proofService = new PaymentProofService();
    }

    /**
     * Calculate commission amounts for a transaction.
     *
     * @param float $vehiclePrice The agreed vehicle price (unused, kept for API compatibility)
     * @return array{buyer_commission: float, seller_commission: float, total_commission: float}
     */
    public function calculateCommission(float $vehiclePrice): array
    {
        return [
            'buyer_commission' => 0,
            'seller_commission' => self::FIXED_FEE_SELLER,
            'total_commission' => self::FIXED_FEE_SELLER,
        ];
    }

    /**
     * Get the payment deadline in hours from inspection completion.
     */
    public function getPaymentDeadlineHours(): int
    {
        return self::PAYMENT_DEADLINE_HOURS;
    }

    /**
     * Calculate the absolute deadline timestamp from inspection completion.
     *
     * @param string $inspectionCompletedAt ISO 8601 datetime string
     * @return string ISO 8601 datetime string of the deadline
     */
    public function calculateDeadline(string $inspectionCompletedAt): string
    {
        $inspectionTime = new \DateTime($inspectionCompletedAt);
        $inspectionTime->modify('+' . self::PAYMENT_DEADLINE_HOURS . ' hours');
        return $inspectionTime->format('Y-m-d\TH:i:sP');
    }

    /**
     * Check if the payment deadline has been exceeded.
     *
     * @param string $deadline ISO 8601 datetime string
     * @return bool true if deadline has passed
     */
    public function isDeadlineExceeded(string $deadline): bool
    {
        $deadlineTime = new \DateTime($deadline);
        $now = new \DateTime();
        return $now > $deadlineTime;
    }

    /**
     * Calculate hours remaining until deadline.
     *
     * @param string $deadline ISO 8601 datetime string
     * @return float hours remaining (negative if exceeded)
     */
    public function hoursRemaining(string $deadline): float
    {
        $deadlineTime = new \DateTime($deadline);
        $now = new \DateTime();
        $diff = $now->diff($deadlineTime);
        $hours = ($diff->days * 24) + $diff->h + ($diff->i / 60);
        return $diff->invert ? -$hours : $hours;
    }

    /**
     * Record a commission payment for a user.
     *
     * @param int $userId
     * @param int $transactionId
     * @param float $amount
     * @param string $role 'buyer' or 'seller'
     * @return array{success: bool, payment_id: int, message: string}
     */
    public function recordPayment(int $userId, int $transactionId, float $amount, string $role): array
    {
        if (!in_array($role, ['seller'], true)) {
            throw new \InvalidArgumentException("Papel invalido. Deve ser 'seller'.");
        }

        if ($amount <= 0) {
            throw new \InvalidArgumentException("Valor deve ser positivo.");
        }

        $sql = 'INSERT INTO commission_payments (user_id, transaction_id, amount, role, paid_at)
                VALUES (:user_id, :transaction_id, :amount, :role, NOW())';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'role' => $role,
        ]);
        $paymentId = (int) Database::getConnection()->lastInsertId();

        return [
            'success' => true,
            'payment_id' => $paymentId,
            'message' => "Taxa fixa de {$role} registada com sucesso.",
        ];
    }

    /**
     * Process a commission payment with proof verification.
     *
     * Flow:
     *   1. User pays commission via bank transfer to platform IBAN
     *   2. User uploads payment proof (image/PDF)
     *   3. AI analyzes the proof for authenticity
     *   4. If valid: payment recorded, user unbanned if applicable
     *   5. If suspicious: flagged for manual review
     *
     * @param int $userId
     * @param int $transactionId
     * @param float $amount
     * @param string $role 'seller' only
     * @param string $proofFilePath Path to uploaded payment proof
     * @return array{success: bool, proof_verified: bool, payment_id: int, message: string}
     */
    public function processPaymentWithProof(
        int $userId,
        int $transactionId,
        float $amount,
        string $role,
        string $proofFilePath
    ): array {
        // 1. Upload the proof
        $uploadResult = $this->proofService->uploadProof($userId, $transactionId, $proofFilePath);

        if (!$uploadResult['success']) {
            return [
                'success' => false,
                'proof_verified' => false,
                'payment_id' => 0,
                'message' => 'Erro ao carregar comprovativo: ' . $uploadResult['message'],
            ];
        }

        // 2. AI analyzes the proof
        $analysisResult = $this->proofService->analyzeProof($uploadResult['proof_id'], $amount);

        // 3. Record the payment regardless of AI result
        // (if AI flags it, internal team reviews; if valid, auto-complete)
        $paymentResult = $this->recordPayment($userId, $transactionId, $amount, $role);

        // 4. If AI verified, mark payment as confirmed
        if ($analysisResult['verified']) {
            $sql = 'UPDATE commission_payments SET status = :status, proof_id = :proof_id,
                    confirmed_at = NOW() WHERE id = :id';
            $stmt = Database::getConnection()->prepare($sql);
            $stmt->execute([
                'status' => 'confirmado',
                'proof_id' => $uploadResult['proof_id'],
                'id' => $paymentResult['payment_id'],
            ]);
        }

        return [
            'success' => true,
            'proof_verified' => $analysisResult['verified'],
            'payment_id' => $paymentResult['payment_id'],
            'message' => $analysisResult['verified']
                ? "Taxa fixa de {$role} paga e comprovativo validado."
                : "Comprovativo enviado. Analise IA concluida - aguardando revisao da equipa.",
        ];
    }

    /**
     * Get the payment details (IBAN and beneficiary) for displaying to users.
     *
     * @return array{iban: string, beneficiary: string}
     */
    public function getPaymentDetails(): array
    {
        return $this->proofService->getPaymentDetails();
    }
}
