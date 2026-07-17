<?php

declare(strict_types=1);

namespace IntermedCars\Services;

class KambaSMSService
{
    private string $apiKey;
    private string $apiUrl;
    private bool $debug;

    public function __construct()
    {
        $this->apiKey = $_ENV['KAMBASMS_API_KEY'] ?? '';
        $this->apiUrl = $_ENV['KAMBASMS_API_URL'] ?? 'https://api.kambasms.ao';
        $this->debug = (($_ENV['APP_ENV'] ?? 'development') === 'development');
    }

    public function send(string $phone, string $message): array
    {
        $phone = $this->normalizePhone($phone);

        if ($this->debug && empty($this->apiKey)) {
            error_log("[KambaSMS] DEBUG: SMS to {$phone}: {$message}");
            return ['success' => true, 'message' => 'SMS enviado (debug mode)', 'debug' => true];
        }

        if (empty($this->apiKey)) {
            return ['success' => false, 'message' => 'KambaSMS API key nao configurada'];
        }

        $ch = curl_init("{$this->apiUrl}/messages/send");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'X-API-Key: ' . $this->apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode(['to' => $phone, 'text' => $message]),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_CAINFO => dirname(__DIR__, 2) . '/certs/cacert.pem',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['success' => false, 'message' => "Erro de rede: {$curlError}"];
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return ['success' => true, 'message' => 'SMS enviado com sucesso.'];
        }

        return ['success' => false, 'message' => "Erro KambaSMS: {$httpCode}"];
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', $phone);
        if (str_starts_with($phone, '+')) return $phone;
        if (str_starts_with($phone, '244')) return '+' . $phone;
        if (preg_match('/^9\d{8}$/', $phone)) return '+244' . $phone;
        return '+244' . ltrim($phone, '0');
    }
}
