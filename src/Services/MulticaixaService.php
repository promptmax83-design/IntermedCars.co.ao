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
        $this->sandbox = ($_ENV['PROXYPAY_SANDBOX'] ?? 'true') === 'true';
        $this->baseUrl = $this->sandbox 
            ? 'https://api.sandbox.proxypay.co.ao'
            : 'https://api.proxypay.co.ao';
        $this->posId = (int) ($_ENV['PROXYPAY_POS_ID'] ?? '0');
    }
    
    /**
     * Create a payment request via Multicaixa Express.
     * The customer receives a push notification on MCX Express app
     * and has 90 seconds to accept/reject.
     */
    public function createPayment(string $phone, float $amount, string $callbackUrl, string $idempotencyKey = ''): array
    {
        if (empty($this->apiKey) || $this->posId === 0) {
            throw new \RuntimeException('ProxyPay not configured. Set PROXYPAY_API_KEY and PROXYPAY_POS_ID in .env');
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
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new \RuntimeException("ProxyPay network error: {$error}");
        }
        
        $data = json_decode($response, true);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'transaction_id' => $data['transaction_id'] ?? null,
                'status' => $data['status'] ?? 'processing',
                'message' => 'Pagamento Multicaixa Express iniciado. O cliente deve confirmar no MCX Express.',
            ];
        }
        
        $errorMsg = $data['message'] ?? $data['error'] ?? "HTTP {$httpCode}";
        error_log("[Multicaixa] API error {$httpCode}: {$response}");
        return ['success' => false, 'message' => "Erro Multicaixa: {$errorMsg}"];
    }
    
    /**
     * Check transaction status (for polling if callback is not received).
     */
    public function getTransaction(string $transactionId): array
    {
        $ch = curl_init("{$this->baseUrl}/opg/v1/transactions/{$transactionId}");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            $data = json_decode($response, true);
            return ['success' => true, 'data' => $data];
        }
        
        return ['success' => false, 'message' => "Erro ao consultar transação: {$httpCode}"];
    }
    
    /**
     * Handle callback from ProxyPay (to be called by the callback endpoint).
     */
    public function handleCallback(array $payload): array
    {
        $transactionId = $payload['transaction_id'] ?? '';
        $status = $payload['status'] ?? '';
        $mobile = $payload['mobile'] ?? '';
        $amount = $payload['amount'] ?? 0;
        
        error_log("[Multicaixa] Callback received: tx={$transactionId}, status={$status}, mobile={$mobile}");
        
        return [
            'transaction_id' => $transactionId,
            'status' => $status,
            'mobile' => $mobile,
            'amount' => $amount,
            'accepted' => $status === 'accepted',
        ];
    }
    
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', $phone);
        if (str_starts_with($phone, '+244')) {
            return substr($phone, 4);
        }
        if (str_starts_with($phone, '244')) {
            return substr($phone, 3);
        }
        return ltrim($phone, '0');
    }
}
