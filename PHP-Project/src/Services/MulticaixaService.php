<?php

declare(strict_types=1);

namespace IntermedCars\Services;

class MulticaixaService
{
    private string $apiKey;
    private string $baseUrl;
    private int $posId;
    private bool $sandbox;

    public function __construct()
    {
        $this->apiKey = $_ENV['PROXYPAY_API_KEY'] ?? '';
        $this->sandbox = (($_ENV['PROXYPAY_SANDBOX'] ?? 'true') === 'true');
        $this->baseUrl = $this->sandbox
            ? 'https://api.sandbox.proxypay.co.ao'
            : 'https://api.proxypay.co.ao';
        $this->posId = (int) ($_ENV['PROXYPAY_POS_ID'] ?? '0');
    }

    public function createPayment(string $phone, float $amount, string $callbackUrl, string $idempotencyKey = ''): array
    {
        if (empty($this->apiKey) || $this->posId === 0) {
            return ['success' => false, 'message' => 'ProxyPay nao configurado. Configure PROXYPAY_API_KEY e PROXYPAY_POS_ID no .env'];
        }

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey,
        ];
        if (!empty($idempotencyKey)) {
            $headers[] = "Idempotency-Key: {$idempotencyKey}";
        }

        $payload = [
            'type' => 'payment',
            'pos_id' => $this->posId,
            'mobile' => $this->normalizePhone($phone),
            'amount' => number_format($amount, 2, '.', ''),
            'callback_url' => $callbackUrl,
        ];

        $ch = curl_init("{$this->baseUrl}/opg/v1/transactions");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_CAINFO => dirname(__DIR__, 2) . '/certs/cacert.pem',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'message' => "Erro de rede: {$error}"];
        }

        $data = json_decode($response, true) ?: [];

        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'transaction_id' => $data['transaction_id'] ?? null,
                'status' => $data['status'] ?? 'processing',
                'message' => 'Pagamento Multicaixa Express iniciado.',
            ];
        }

        return ['success' => false, 'message' => "Erro ProxyPay: " . ($data['message'] ?? "HTTP {$httpCode}")];
    }

    public function createFeePayment(string $phone, float $amount, int $negotiationId, string $role): array
    {
        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8080') . '/api/payments/multicaixa/callback';
        $idempotencyKey = "fee-{$negotiationId}-{$role}-" . time();
        return $this->createPayment($phone, $amount, $callbackUrl, $idempotencyKey);
    }

    public function handleCallback(array $payload): array
    {
        return [
            'transaction_id' => $payload['transaction_id'] ?? '',
            'status' => $payload['status'] ?? '',
            'mobile' => $payload['mobile'] ?? '',
            'amount' => $payload['amount'] ?? 0,
            'accepted' => ($payload['status'] ?? '') === 'accepted',
        ];
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', $phone);
        if (str_starts_with($phone, '+244')) return substr($phone, 4);
        if (str_starts_with($phone, '244')) return substr($phone, 3);
        return ltrim($phone, '0');
    }
}
