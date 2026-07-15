<?php

declare(strict_types=1);

namespace IntermedCars\Services;

/**
 * NotificationService — Unified email + SMS notification service.
 *
 * - Email: Brevo REST API (production)
 * - SMS: Africa's Talking REST API (Angola)
 * - Debug mode: logs and returns success without sending
 * - All sends are audit-logged via NotificationLogRepository
 */
class NotificationService
{
    private bool $isDev;
    private string $brevoApiKey;
    private string $brevoSenderEmail;
    private string $brevoSenderName;
    private string $atApiKey;
    private string $atUsername;
    private string $atSenderId;
    private ?int $currentUserId;
    private NotificationLogRepository $logRepo;
    private string $caInfo;

    public function __construct(array $config = [])
    {
        $this->loadEnv();

        $this->isDev = (($_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'production') === 'development');
        $this->brevoApiKey = $config['brevo_api_key'] ?? ($_ENV['BREVO_API_KEY'] ?? getenv('BREVO_API_KEY') ?: '');
        $this->brevoSenderEmail = $config['brevo_sender_email'] ?? ($_ENV['BREVO_SENDER_EMAIL'] ?? getenv('BREVO_SENDER_EMAIL') ?: 'noreply@intermedcars.com');
        $this->brevoSenderName = $config['brevo_sender_name'] ?? ($_ENV['BREVO_SENDER_NAME'] ?? getenv('BREVO_SENDER_NAME') ?: 'IntermedCars');
        $this->atApiKey = $config['at_api_key'] ?? ($_ENV['AT_API_KEY'] ?? getenv('AT_API_KEY') ?: '');
        $this->atUsername = $config['at_username'] ?? ($_ENV['AT_USERNAME'] ?? getenv('AT_USERNAME') ?: 'sandbox');
        $this->atSenderId = $config['at_sender_id'] ?? ($_ENV['AT_SENDER_ID'] ?? getenv('AT_SENDER_ID') ?: 'IntermedCars');
        $this->currentUserId = $config['user_id'] ?? null;
        $this->logRepo = new NotificationLogRepository();
        $this->caInfo = dirname(__DIR__, 2) . '/certs/cacert.pem';
    }

    /**
     * Load .env file if not already loaded.
     */
    private function loadEnv(): void
    {
        if (!empty($_ENV['BREVO_API_KEY'])) {
            return;
        }

        $envFile = dirname(__DIR__, 2) . '/.env';
        if (!file_exists($envFile)) {
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $value = trim($parts[1]);
                $_ENV[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
    }

    // ─── Public: Generic Send ────────────────────────────

    /**
     * Send email via Brevo API.
     */
    public function sendEmail(string $to, string $subject, string $htmlBody, string $event = 'generic'): array
    {
        // Debug mode — log without sending
        if ($this->isDev && empty($this->brevoApiKey)) {
            $this->logRepo->log($this->currentUserId, 'email', $to, $event, 'debug');
            error_log("[IntermedCars] DEV MODE — Email to {$to}, subject: {$subject}");
            return [
                'success' => true,
                'message' => "Email enviado para {$to}",
                'mode' => 'debug',
            ];
        }

        // Production — call Brevo API
        try {
            $payload = json_encode([
                'sender' => [
                    'name' => $this->brevoSenderName,
                    'email' => $this->brevoSenderEmail,
                ],
                'to' => [
                    ['email' => $to],
                ],
                'subject' => $subject,
                'htmlContent' => $htmlBody,
            ]);

            $ch = curl_init('https://api.brevo.com/v3/smtp/email');
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => [
                    'accept: application/json',
                    'api-key: ' . $this->brevoApiKey,
                    'content-type: application/json',
                ],
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_CAINFO => $this->caInfo,
                CURLOPT_TIMEOUT => 30,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logRepo->log($this->currentUserId, 'email', $to, $event, 'failed', $curlError);
                error_log("[IntermedCars] Brevo cURL error: {$curlError}");
                return ['success' => false, 'message' => "Erro de conexao: {$curlError}"];
            }

            if ($httpCode >= 200 && $httpCode < 300) {
                $this->logRepo->log($this->currentUserId, 'email', $to, $event, 'sent', $response);
                error_log("[IntermedCars] Email sent to {$to} via Brevo");
                return ['success' => true, 'message' => "Email enviado para {$to}"];
            }

            $this->logRepo->log($this->currentUserId, 'email', $to, $event, 'failed', "HTTP {$httpCode}: {$response}");
            error_log("[IntermedCars] Brevo failed: HTTP {$httpCode} — {$response}");
            return ['success' => false, 'message' => "Falha ao enviar email"];
        } catch (\Throwable $e) {
            $this->logRepo->log($this->currentUserId, 'email', $to, $event, 'failed', $e->getMessage());
            error_log("[IntermedCars] Email exception: " . $e->getMessage());
            return ['success' => false, 'message' => "Erro ao enviar email"];
        }
    }

    /**
     * Send SMS via KambaSMS (primary) with Africa's Talking fallback.
     */
    public function sendSms(string $phone, string $message, string $event = 'generic'): array
    {
        // Normalize phone to E.164 format for Angola
        $phone = $this->normalizePhone($phone);

        // Debug mode — log without sending
        if ($this->isDev && empty($this->atApiKey)) {
            $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'debug');
            error_log("[IntermedCars] DEV MODE — SMS to {$phone}: {$message}");
            return [
                'success' => true,
                'message' => "SMS enviado para {$phone}",
                'mode' => 'debug',
            ];
        }

        // 1. Try KambaSMS first
        $kamba = new KambaSMSService();
        $result = $kamba->send($phone, $message);

        if ($result['success']) {
            $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'sent', json_encode($result));
            error_log("[IntermedCars] SMS sent to {$phone} via KambaSMS");
            return $result;
        }

        error_log("[IntermedCars] KambaSMS failed, trying Africa's Talking fallback: {$result['message']}");

        // 2. Fallback to Africa's Talking if configured
        if (empty($this->atApiKey)) {
            $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'failed', 'No provider available: ' . $result['message']);
            return ['success' => false, 'message' => "Falha ao enviar SMS: " . $result['message']];
        }

        // Production — call Africa's Talking API (fallback)
        try {
            $data = [
                'username' => $this->atUsername,
                'to' => $phone,
                'message' => $message,
            ];

            $ch = curl_init('https://api.africastalking.com/version1/messaging');
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query($data),
                CURLOPT_HTTPHEADER => [
                    'apiKey: ' . $this->atApiKey,
                    'Content-Type: application/x-www-form-urlencoded',
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_CAINFO => $this->caInfo,
                CURLOPT_TIMEOUT => 30,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'failed', $curlError);
                error_log("[IntermedCars] AT cURL error: {$curlError}");
                return ['success' => false, 'message' => "Erro de conexao SMS: {$curlError}"];
            }

            if ($httpCode >= 200 && $httpCode < 300) {
                $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'sent', $response);
                error_log("[IntermedCars] SMS sent to {$phone} via Africa's Talking");
                return ['success' => true, 'message' => "SMS enviado para {$phone}"];
            }

            $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'failed', "HTTP {$httpCode}: {$response}");
            error_log("[IntermedCars] AT failed: HTTP {$httpCode} — {$response}");
            return ['success' => false, 'message' => "Falha ao enviar SMS"];
        } catch (\Throwable $e) {
            $this->logRepo->log($this->currentUserId, 'sms', $phone, $event, 'failed', $e->getMessage());
            error_log("[IntermedCars] SMS exception: " . $e->getMessage());
            return ['success' => false, 'message' => "Erro ao enviar SMS"];
        }
    }

    // ─── Public: Template Methods ────────────────────────

    /**
     * Send verification code via email or SMS based on targetType.
     * Generic method for both email and phone OTP.
     */
    public function sendRegistrationCode(string $targetType, string $targetValue, string $code): array
    {
        if ($targetType === 'email') {
            $subject = 'IntermedCars — Código de Verificação';
            $htmlBody = $this->buildOtpEmailTemplate($code, 'registration');
            return $this->sendEmail($targetValue, $subject, $htmlBody, 'registration_code');
        }

        if ($targetType === 'phone') {
            $message = "IntermedCars [Registo]: O seu código é {$code}. Válido por 10 minutos. Nunca partilhe este código.";
            return $this->sendSms($targetValue, $message, 'registration_code');
        }

        return ['success' => false, 'message' => "Tipo de destino invalido: {$targetType}"];
    }

    /**
     * Notify user that verification was confirmed.
     */
    public function notifyVerificationConfirmed(string $email, string $nome): array
    {
        $subject = 'IntermedCars — Conta Verificada';
        $htmlBody = $this->buildGenericEmailTemplate(
            'Conta Verificada',
            "Olá {$nome}, a sua conta foi verificada com sucesso. Pode agora utilizar todas as funcionalidades do IntermedCars."
        );
        return $this->sendEmail($email, $subject, $htmlBody, 'verification_confirmed');
    }

    /**
     * Notify seller that their vehicle was published.
     */
    public function notifyVehiclePublished(string $email, string $marcaModelo): array
    {
        $subject = 'IntermedCars — Viatura Publicada';
        $htmlBody = $this->buildGenericEmailTemplate(
            'Viatura Publicada',
            "A sua {$marcaModelo} está agora visível na plataforma. Os compradores podem encontrá-la e iniciar negociações."
        );
        return $this->sendEmail($email, $subject, $htmlBody, 'vehicle_published');
    }

    /**
     * Notify user of a new message received.
     */
    public function notifyMessageReceived(string $email, string $senderName): array
    {
        $subject = 'IntermedCars — Nova Mensagem';
        $htmlBody = $this->buildGenericEmailTemplate(
            'Nova Mensagem',
            "Recebeu uma nova mensagem de {$senderName}. Abra o IntermedCars para responder."
        );
        return $this->sendEmail($email, $subject, $htmlBody, 'message_received');
    }

    /**
     * Notify seller of a new offer (email + SMS).
     */
    public function notifyOfferReceived(string $email, string $phone, float $offerValue, string $buyerName): array
    {
        $results = [];

        $subject = 'IntermedCars — Oferta Recebida';
        $htmlBody = $this->buildGenericEmailTemplate(
            'Oferta Recebida',
            "Recebeu uma oferta de {$offerValue} Kz de {$buyerName}. Acesse a plataforma para aceitar ou recusar."
        );
        $results['email'] = $this->sendEmail($email, $subject, $htmlBody, 'offer_received');

        if (!empty($phone)) {
            $sms = "IntermedCars: Recebeu uma oferta de {$offerValue} Kz de {$buyerName}. Acesse a plataforma.";
            $results['sms'] = $this->sendSms($phone, $sms, 'offer_received');
        }

        return $results;
    }

    /**
     * Send commission payment reminder (email + SMS).
     * @param int $daysOverdue 0 = reminder, positive = days overdue
     */
    public function notifyCommissionReminder(string $email, string $phone, int $daysOverdue): array
    {
        $results = [];

        if ($daysOverdue === 0) {
            $subject = 'IntermedCars — Lembrete de Pagamento';
            $body = 'Lembrete: tem um pagamento de comissão pendente. Por favor, regularize a situação.';
            $sms = 'IntermedCars: Lembrete — pagamento de comissão pendente. Acesse a plataforma.';
        } else {
            $subject = "IntermedCars — Pagamento Atrasado ({$daysOverdue} dias)";
            $body = "O seu pagamento está atrasado há {$daysOverdue} dias. Para evitar suspensão da conta, regularize o mais brevemente possível.";
            $sms = "IntermedCars: Pagamento atrasado há {$daysOverdue} dias. Regularize para evitar suspensão.";
        }

        $htmlBody = $this->buildGenericEmailTemplate($subject, $body);
        $results['email'] = $this->sendEmail($email, $subject, $htmlBody, 'commission_reminder');

        if (!empty($phone)) {
            $results['sms'] = $this->sendSms($phone, $sms, 'commission_reminder');
        }

        return $results;
    }

    /**
     * Notify user that their account was suspended.
     */
    public function notifyAccountSuspended(string $email, string $phone): array
    {
        $results = [];

        $subject = 'IntermedCars — Conta Suspensa';
        $htmlBody = $this->buildGenericEmailTemplate(
            'Conta Suspensa',
            'A sua conta foi suspensa por falta de pagamento de comissão. Para reativar, contacte o suporte.'
        );
        $results['email'] = $this->sendEmail($email, $subject, $htmlBody, 'account_suspended');

        if (!empty($phone)) {
            $sms = 'IntermedCars: A sua conta foi suspensa. Contacte o suporte para reativar.';
            $results['sms'] = $this->sendSms($phone, $sms, 'account_suspended');
        }

        return $results;
    }

    /**
     * Notify user of KYC status (approved or rejected).
     */
    public function notifyKycStatus(string $email, string $nome, bool $approved): array
    {
        if ($approved) {
            $subject = 'IntermedCars — Identidade Verificada';
            $body = "Olá {$nome}, a sua identidade foi verificada com sucesso. A sua conta está agora totalmente activa.";
        } else {
            $subject = 'IntermedCars — Documentos Rejeitados';
            $body = "Olá {$nome}, os seus documentos de identificação foram rejeitados. Por favor, reenvie os documentos correctos.";
        }

        $htmlBody = $this->buildGenericEmailTemplate($subject, $body);
        return $this->sendEmail($email, $subject, $htmlBody, 'kyc_status');
    }

    // ─── Private: Helpers ────────────────────────────────

    /**
     * Normalize Angolan phone numbers to E.164 format.
     */
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', $phone);

        // Already E.164
        if (str_starts_with($phone, '+244')) {
            return $phone;
        }

        // Local format: 9XX XXX XXX
        if (strlen($phone) === 9 && str_starts_with($phone, '9')) {
            return '+244' . $phone;
        }

        // Without leading 9: 8XX XXX XXX (8 digits)
        if (strlen($phone) === 8) {
            return '+2449' . $phone;
        }

        return $phone;
    }

    private function buildOtpEmailTemplate(string $code, string $purpose): string
    {
        $title = $purpose === 'registration' ? 'Bem-vindo ao IntermedCars' : 'Código de Verificação';
        $subtitle = $purpose === 'registration'
            ? 'Complete o seu registo usando o código abaixo.'
            : 'Use o código abaixo para verificar.';
        $year = date('Y');

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#060608;padding:30px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">&#128663; IntermedCars</h1>
            <p style="color:#a0a0a0;margin:8px 0 0;font-size:14px;">Mediação Automóvel em Angola</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#060608;margin:0 0 8px;font-size:20px;">{$title}</h2>
            <p style="color:#666;margin:0 0 30px;font-size:15px;">{$subtitle}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f8f9fa;border:2px dashed #c9a84c;border-radius:8px;padding:25px;text-align:center;">
                  <p style="color:#999;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;">O seu código de verificação</p>
                  <p style="color:#060608;margin:0;font-size:36px;font-weight:bold;letter-spacing:8px;font-family:monospace;">{$code}</p>
                </td>
              </tr>
            </table>
            <p style="color:#999;margin:25px 0 0;font-size:13px;text-align:center;">
              &#9201; Este código expira em <strong>10 minutos</strong>.<br>
              &#128274; Se não solicitou este código, ignore este email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#999;margin:0;font-size:12px;">&copy; {$year} IntermedCars — Mediação Automóvel em Angola</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private function buildGenericEmailTemplate(string $title, string $body): string
    {
        $year = date('Y');

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#060608;padding:30px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">&#128663; IntermedCars</h1>
            <p style="color:#a0a0a0;margin:8px 0 0;font-size:14px;">Mediação Automóvel em Angola</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#060608;margin:0 0 16px;font-size:20px;">{$title}</h2>
            <p style="color:#333;margin:0;font-size:15px;line-height:1.6;">{$body}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#999;margin:0;font-size:12px;">&copy; {$year} IntermedCars — Mediação Automóvel em Angola</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }
}
