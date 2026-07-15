<?php

declare(strict_types=1);

namespace IntermedCars\Services;

/**
 * KambaSMS — Angola SMS Provider
 * Supports Unitel, Movicel, Africell
 * API: https://api.kambasms.ao
 */
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
            error_log("[KambaSMS] DEBUG mode — SMS to {$phone}: {$message}");
            return ['success' => true, 'message' => 'SMS enviado (debug mode)', 'debug' => true];
        }

        if (empty($this->apiKey)) {
            return ['success' => false, 'message' => 'KambaSMS API key nao configurada'];
        }

        $payload = json_encode([
            'to' => $phone,
            'text' => $message,
        ]);

        $ch = curl_init("{$this->apiUrl}/messages/send");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'X-API-Key: ' . $this->apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log("[KambaSMS] cURL error: {$curlError}");
            return ['success' => false, 'message' => "Erro de rede: {$curlError}"];
        }

        $data = json_decode($response, true) ?: [];

        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'message' => 'SMS enviado com sucesso',
                'response' => $data,
            ];
        }

        $apiMsg = $data['message'] ?? $data['error'] ?? "HTTP {$httpCode}";
        error_log("[KambaSMS] API error {$httpCode}: {$apiMsg}");
        return ['success' => false, 'message' => "Erro SMS: {$apiMsg}"];
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', $phone);
        if (str_starts_with($phone, '+')) {
            return $phone;
        }
        if (str_starts_with($phone, '244')) {
            return '+' . $phone;
        }
        if (preg_match('/^9\d{8}$/', $phone)) {
            return '+244' . $phone;
        }
        return '+244' . ltrim($phone, '0');
    }
}
