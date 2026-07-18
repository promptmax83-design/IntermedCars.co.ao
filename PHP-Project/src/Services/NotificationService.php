<?php

declare(strict_types=1);

namespace IntermedCars\Services;

class NotificationService
{
    private KambaSMSService $smsService;
    private NotificationLogRepository $logRepo;
    private bool $debug;

    public function __construct()
    {
        $this->smsService = new KambaSMSService();
        $this->logRepo = new NotificationLogRepository();
        $this->debug = (($_ENV['APP_ENV'] ?? 'development') === 'development');
    }

    public function sendEmail(string $to, string $subject, string $htmlBody, string $event = 'general'): array
    {
        $apiKey = $_ENV['BREVO_API_KEY'] ?? '';
        $senderEmail = $_ENV['BREVO_SENDER_EMAIL'] ?? 'no-reply@intermedcars.co.ao';
        $senderName = $_ENV['BREVO_SENDER_NAME'] ?? 'IntermedCars';

        if ($this->debug) {
            error_log("[Notification] DEBUG email to {$to}: {$subject}");
            $this->logRepo->log('email', $to, $event, 'debug');
            return ['success' => true, 'message' => 'Email enviado (debug mode)', 'debug' => true];
        }

        if (empty($apiKey)) {
            $this->logRepo->log('email', $to, $event, 'failed', 'No API key');
            return ['success' => false, 'message' => 'Brevo API key nao configurada'];
        }

        $payload = json_encode([
            'sender' => ['name' => $senderName, 'email' => $senderEmail],
            'to' => [['email' => $to]],
            'subject' => $subject,
            'htmlContent' => $htmlBody,
        ]);

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'api-key: ' . $apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_CAINFO => dirname(__DIR__, 2) . '/certs/cacert.pem',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            $this->logRepo->log('email', $to, $event, 'failed', $error);
            return ['success' => false, 'message' => "Erro de rede: {$error}"];
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            $this->logRepo->log('email', $to, $event, 'sent');
            return ['success' => true, 'message' => 'Email enviado com sucesso.'];
        }

        $this->logRepo->log('email', $to, $event, 'failed', "HTTP {$httpCode}: {$response}");
        return ['success' => false, 'message' => "Erro Brevo: {$httpCode}"];
    }

    public function sendSms(string $phone, string $message, string $event = 'general'): array
    {
        $result = $this->smsService->send($phone, $message);
        $status = $result['success'] ? 'sent' : 'failed';
        $this->logRepo->log('sms', $phone, $event, $status, $result['message'] ?? null);
        return $result;
    }

    public function sendRegistrationCode(string $targetType, string $targetValue, string $code): array
    {
        if ($targetType === 'email') {
            $html = "<h1>IntermedCars - Codigo de Verificacao</h1><p>O teu codigo de verificacao e: <strong>{$code}</strong></p><p>Este codigo expira em 10 minutos.</p>";
            return $this->sendEmail($targetValue, 'IntermedCars — Codigo de Verificacao', $html, 'registration');
        } else {
            $msg = "IntermedCars: O teu codigo e {$code}. Expira em 10 minutos.";
            return $this->sendSms($targetValue, $msg, 'registration');
        }
    }
}
