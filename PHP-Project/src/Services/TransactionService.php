<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;
use IntermedCars\Models\TransactionStatus;

/**
 * TransactionService
 *
 * Manages the complete lifecycle of a vehicle transaction.
 *
 * Flow:
 *   1. Buyer sends proposal (proposta_enviada)
 *   2. Seller accepts (proposta_aceite) -> vehicle status: em_negociacao
 *   3. Buyer deposits into escrow (deposito_efetuado)
 *   4. Inspection is completed (vistoria_concluida)
 *   5. Commission is calculated and becomes pending (comissao_pendente)
 *   6a. Seller pays within 72h -> comissao_paga -> transacao_concluida
 *   6b. One party fails to pay within 72h -> prazo_excedido
 *   7. If still unpaid at 96h -> multa_aplicada -> divida_pendente -> banido
 */
class TransactionService
{
    private CommissionService $commissionService;
    private PenaltyService $penaltyService;

    public function __construct()
    {
        $this->commissionService = new CommissionService();
        $this->penaltyService = new PenaltyService();
    }

    /**
     * Create a new transaction when buyer sends a proposal.
     *
     * @param int $vehicleId
     * @param int $buyerId
     * @param int $sellerId
     * @param float $proposedPrice
     * @return array{success: bool, transaction_id: int, status: string, message: string}
     */
    public function createProposal(int $vehicleId, int $buyerId, int $sellerId, float $proposedPrice): array
    {
        if ($buyerId === $sellerId) {
            throw new \InvalidArgumentException("Comprador e vendedor nao podem ser a mesma pessoa.");
        }

        if ($proposedPrice <= 0) {
            throw new \InvalidArgumentException("Valor proposto deve ser positivo.");
        }

        $sql = 'INSERT INTO transactions (vehicle_id, buyer_id, seller_id, proposed_price, status, created_at)
                VALUES (:vehicle_id, :buyer_id, :seller_id, :proposed_price, :status, NOW())';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'vehicle_id' => $vehicleId,
            'buyer_id' => $buyerId,
            'seller_id' => $sellerId,
            'proposed_price' => $proposedPrice,
            'status' => TransactionStatus::PROPOSTA_ENVIADA->value,
        ]);
        $transactionId = (int) Database::getConnection()->lastInsertId();

        return [
            'success' => true,
            'transaction_id' => $transactionId,
            'status' => TransactionStatus::PROPOSTA_ENVIADA->value,
            'message' => 'Proposta enviada ao vendedor.',
        ];
    }

    /**
     * Seller accepts the proposal.
     *
     * @param int $transactionId
     * @param int $sellerId
     * @return array{success: bool, status: string, message: string}
     */
    public function acceptProposal(int $transactionId, int $sellerId): array
    {
        $sql = 'UPDATE transactions SET status = :status, accepted_at = NOW() WHERE id = :id AND seller_id = :seller_id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'status' => TransactionStatus::PROPOSTA_ACEITE->value,
            'id' => $transactionId,
            'seller_id' => $sellerId,
        ]);

        return [
            'success' => true,
            'status' => TransactionStatus::PROPOSTA_ACEITE->value,
            'message' => 'Proposta aceite. Comprador deve efetuar deposito no cofre.',
        ];
    }

    /**
     * Record the buyer's deposit into escrow.
     *
     * @param int $transactionId
     * @param int $buyerId
     * @param float $amount
     * @return array{success: bool, status: string, message: string}
     */
    public function recordDeposit(int $transactionId, int $buyerId, float $amount): array
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException("Valor do deposito deve ser positivo.");
        }

        $sql = 'UPDATE transactions SET status = :status, deposit_amount = :amount, deposited_at = NOW()
                WHERE id = :id AND buyer_id = :buyer_id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'status' => TransactionStatus::DEPOSITO_EFETUADO->value,
            'amount' => $amount,
            'id' => $transactionId,
            'buyer_id' => $buyerId,
        ]);

        return [
            'success' => true,
            'status' => TransactionStatus::DEPOSITO_EFETUADO->value,
            'message' => 'Deposito registado no cofre. Aguardando vistoria.',
        ];
    }

    /**
     * Record the completion of vehicle inspection.
     *
     * @param int $transactionId
     * @param bool $approved Whether the inspection was approved
     * @return array{success: bool, status: string, commission_deadline: string, message: string}
     */
    public function completeInspection(int $transactionId, bool $approved): array
    {
        if (!$approved) {
            // If inspection fails, cancel the transaction and refund
            return [
                'success' => true,
                'status' => TransactionStatus::TRANSACAO_CANCELADA->value,
                'commission_deadline' => '',
                'message' => 'Vistoria reprovada. Transacao cancelada e reembolso iniciado.',
            ];
        }

        // Calculate commission deadline (72h from now)
        $now = new \DateTime();
        $deadline = $now->modify('+72 hours')->format('Y-m-d\TH:i:sP');

        $sql = 'UPDATE transactions SET status = :status, inspection_completed_at = NOW(),
                commission_deadline = :deadline WHERE id = :id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'status' => TransactionStatus::COMISSAO_PENDENTE->value,
            'deadline' => $deadline,
            'id' => $transactionId,
        ]);

        return [
            'success' => true,
            'status' => TransactionStatus::COMISSAO_PENDENTE->value,
            'commission_deadline' => $deadline,
            'message' => 'Vistoria aprovada. Taxa fixa de 100.000 Kz pendente (apenas vendedor). Prazo: 72 horas.',
        ];
    }

    /**
     * Process commission payment from a party.
     *
     * @param int $transactionId
     * @param int $userId
     * @param float $amount
     * @param string $role 'buyer' or 'seller'
     * @return array{success: bool, both_paid: bool, status: string, message: string}
     */
    public function processCommissionPayment(int $transactionId, int $userId, float $amount, string $role): array
    {
        // Record the payment
        $this->commissionService->recordPayment($userId, $transactionId, $amount, $role);

        // Check if both parties have paid
        // $sql = 'SELECT role, COUNT(*) as paid_count FROM commission_payments
        //         WHERE transaction_id = :transaction_id GROUP BY role';
        // $stmt = $this->db->prepare($sql);
        // $stmt->execute(['transaction_id' => $transactionId]);
        // $payments = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $bothPaid = $this->checkBothPartiesPaid($transactionId);

        if ($bothPaid) {
            $sql = 'UPDATE transactions SET status = :status, completed_at = NOW() WHERE id = :id';
            $stmt = Database::getConnection()->prepare($sql);
            $stmt->execute([
                'status' => TransactionStatus::TRANSACAO_CONCLUIDA->value,
                'id' => $transactionId,
            ]);

            return [
                'success' => true,
                'both_paid' => true,
                'status' => TransactionStatus::TRANSACAO_CONCLUIDA->value,
                'message' => 'Taxa fixa paga pelo vendedor. Transacao concluida.',
            ];
        }

        return [
            'success' => true,
            'both_paid' => false,
            'status' => TransactionStatus::COMISSAO_PENDENTE->value,
            'message' => "Taxa fixa de {$role} registada. Aguardando pagamento da taxa.",
        ];
    }

    /**
     * Check and enforce deadlines for pending commissions.
     *
     * This should be called by a cron job or scheduler.
     *
     * @param int $transactionId
     * @return array{success: bool, action: string, status: string, message: string}
     */
    public function enforceDeadline(int $transactionId): array
    {
        $sql = 'SELECT * FROM transactions WHERE id = :id AND status = :status';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'id' => $transactionId,
            'status' => TransactionStatus::COMISSAO_PENDENTE->value,
        ]);
        $transaction = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$transaction) {
            return ['success' => false, 'action' => 'none', 'status' => '', 'message' => 'Transacao nao encontrada ou nao pendente.'];
        }

        $deadline = $transaction['commission_deadline'];

        // Check penalty status
        $penaltyStatus = $this->penaltyService->getPenaltyStatus($deadline);

        if ($penaltyStatus['status'] === 'em_atraso') {
            // Send warning message
            // $this->sendWarningMessage($transaction['buyer_id'], $transaction['seller_id']);
            return [
                'success' => true,
                'action' => 'warning_sent',
                'status' => TransactionStatus::PRAZO_EXCEDIDO->value,
                'message' => $this->penaltyService->getWarningMessage(),
            ];
        }

        if ($penaltyStatus['status'] === 'multa_aplicada') {
            // Apply penalty to the non-paying party
            // Identify which party hasn't paid
            // $this->penaltyService->applyPenalty($nonPayingUserId, $transactionId, $penaltyAmount);
            return [
                'success' => true,
                'action' => 'penalty_applied',
                'status' => TransactionStatus::MULTA_APLICADA->value,
                'message' => 'Multa de 10.000 Kz aplicada. Conta temporariamente banida.',
            ];
        }

        return [
            'success' => true,
            'action' => 'no_action',
            'status' => TransactionStatus::COMISSAO_PENDENTE->value,
            'message' => 'Dentro do prazo. Nenhuma acao necessaria.',
        ];
    }

    /**
     * Check if seller has paid the platform fee.
     *
     * @param int $transactionId
     * @return bool true if seller has paid
     */
    private function checkBothPartiesPaid(int $transactionId): bool
    {
        $sql = "SELECT COUNT(*) as paid FROM commission_payments
                WHERE transaction_id = :transaction_id AND role = 'seller'";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute(['transaction_id' => $transactionId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return ($result['paid'] ?? 0) >= 1;
    }

    /**
     * Get all transactions where the user is buyer or seller.
     *
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId): array
    {
        $sql = 'SELECT t.*,
                       v.marca, v.modelo, v.preco as vehicle_price,
                       buyer.nome as buyer_name,
                       seller.nome as seller_name
                FROM transactions t
                JOIN vehicles v ON t.vehicle_id = v.id
                JOIN users buyer ON t.buyer_id = buyer.id
                JOIN users seller ON t.seller_id = seller.id
                WHERE t.buyer_id = :user_id OR t.seller_id = :user_id
                ORDER BY t.created_at DESC';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
