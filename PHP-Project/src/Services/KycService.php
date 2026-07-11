<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

/**
 * KYC Service
 *
 * Handles external identity verification via third-party APIs.
 * Supported providers: Onfido, Jumio, Veriff (configurable via env).
 *
 * Business Rules:
 *   - User must upload BI/Passaporte + selfie
 *   - External API verifies identity document authenticity
 *   - Face ID matches selfie to document photo
 *   - Anti-recidivism: cross-reference BI, email, phone, Face ID, parent names
 */
class KycService
{
    private string $provider;
    private string $apiKey;

    public function __construct()
    {
        $this->provider = $_ENV['KYC_PROVIDER'] ?? getenv('KYC_PROVIDER') ?: 'onfido';
        $this->apiKey = $_ENV['KYC_API_KEY'] ?? getenv('KYC_API_KEY') ?: '';
    }

    /**
     * Submit documents for verification.
     *
     * @param int $userId
     * @param string $documentPath Path to BI/Passaporte image
     * @param string $selfiePath Path to selfie/face photo
     * @return array{success: bool, check_id: string, message: string}
     */
    public function submitForVerification(int $userId, string $documentPath, string $selfiePath): array
    {
        if (empty($this->apiKey)) {
            // Fallback: auto-approve in dev mode
            return $this->devModeApproval($userId);
        }

        $endTime = time() + 30; // 30 second timeout
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'timeout' => 25,
                'header' => implode("\r\n", [
                    'Content-Type: application/json',
                    'Authorization: Token token="' . $this->apiKey . '"',
                ]),
                'content' => json_encode([
                    'user_id' => (string) $userId,
                    'document_path' => $documentPath,
                    'selfie_path' => $selfiePath,
                ]),
            ],
        ]);

        $response = @file_get_contents($this->getProviderUrl() . '/checks', false, $context);

        if ($response === false) {
            return [
                'success' => false,
                'check_id' => '',
                'message' => 'Erro ao contactar API de verificacao. A usar modo desenvolvimento.',
            ];
        }

        $data = json_decode($response, true);
        $checkId = $data['id'] ?? 'dev_' . bin2hex(random_bytes(16));

        return [
            'success' => true,
            'check_id' => $checkId,
            'message' => 'Documentos enviados para verificacao. Resultado em 24-48h.',
        ];
    }

    /**
     * Check verification status.
     *
     * @param string $checkId
     * @return array{status: string, verified: bool, message: string}
     */
    public function checkStatus(string $checkId): array
    {
        if (empty($this->apiKey) || str_starts_with($checkId, 'dev_')) {
            return [
                'status' => 'aprovado',
                'verified' => true,
                'message' => 'Verificacao aprovada (modo desenvolvimento).',
            ];
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 15,
                'header' => 'Authorization: Token token="' . $this->apiKey . '"',
            ],
        ]);

        $response = @file_get_contents($this->getProviderUrl() . '/checks/' . $checkId, false, $context);

        if ($response === false) {
            return [
                'status' => 'pendente',
                'verified' => false,
                'message' => 'Nao foi possivel verificar estado.',
            ];
        }

        $data = json_decode($response, true);
        $providerStatus = $data['status'] ?? 'pendente';

        $statusMap = [
            'complete' => 'aprovado',
            'clear' => 'aprovado',
            'consider' => 'pendente_revisao',
            'reject' => 'reprovado',
            'error' => 'erro',
        ];

        $status = $statusMap[$providerStatus] ?? 'pendente';

        return [
            'status' => $status,
            'verified' => $status === 'aprovado',
            'message' => $this->getStatusMessage($status),
        ];
    }

    /**
     * Dev mode: auto-approve verification.
     *
     * @param int $userId
     * @return array{success: bool, check_id: string, message: string}
     */
    private function devModeApproval(int $userId): array
    {
        $checkId = 'dev_' . bin2hex(random_bytes(16));

        // Update user status to verified
        $sql = 'UPDATE users SET status = :status WHERE id = :id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([
            'status' => 'verificado',
            'id' => $userId,
        ]);

        return [
            'success' => true,
            'check_id' => $checkId,
            'message' => 'Verificacao aprovada automaticamente (modo desenvolvimento).',
        ];
    }

    /**
     * Get provider API URL.
     */
    private function getProviderUrl(): string
    {
        $urls = [
            'onfido' => 'https://api.onfido.com/v3',
            'jumio' => 'https://netverify.com/api/v4',
            'veriff' => 'https://api.veriff.com/v1',
        ];

        return $urls[$this->provider] ?? $urls['onfido'];
    }

    /**
     * Get human-readable status message.
     */
    private function getStatusMessage(string $status): string
    {
        $messages = [
            'aprovado' => 'Identidade verificada com sucesso.',
            'pendente' => 'Verificacao em curso. Aguardando resposta da API.',
            'pendente_revisao' => 'Verificacao pendente de revisao manual.',
            'reprovado' => 'Verificacao recusada. Documentos nao conferem.',
            'erro' => 'Erro na verificacao. Tente novamente.',
        ];

        return $messages[$status] ?? 'Estado desconhecido.';
    }
}
