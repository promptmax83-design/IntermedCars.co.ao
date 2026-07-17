<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class VerificationService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->ensureTableExists();
    }

    private function ensureTableExists(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS verification_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT NOT NULL,
            target_value TEXT NOT NULL,
            code TEXT NOT NULL,
            purpose TEXT NOT NULL DEFAULT 'registration',
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 5,
            verified INTEGER DEFAULT 0,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
    }

    public function sendCode(string $targetType, string $targetValue, string $purpose = 'registration'): array
    {
        if (!in_array($targetType, ['email', 'phone'], true)) {
            throw new \InvalidArgumentException("Tipo de destino invalido");
        }
        if (empty($targetValue)) {
            throw new \InvalidArgumentException("Destino invalido");
        }

        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        error_log("[IntermedCars] === VERIFICATION CODE: {$code} ===");

        $this->storeCode($targetType, $targetValue, $code, $purpose);

        $notification = new NotificationService();
        if ($targetType === 'email') {
            $html = "<h1>IntermedCars — Codigo de Verificacao</h1><p>O teu codigo e: <strong>{$code}</strong></p><p>Expira em 10 minutos.</p>";
            $notification->sendEmail($targetValue, 'IntermedCars — Codigo de Verificacao', $html, 'registration');
        } else {
            $notification->sendSms($targetValue, "IntermedCars: O teu codigo e {$code}", 'registration');
        }

        return [
            'success' => true,
            'message' => "Codigo enviado para {$targetValue}",
            'expires_in' => 600,
        ];
    }

    public function verifyCode(string $targetType, string $targetValue, string $code, string $purpose = 'registration'): array
    {
        if (empty($code) || strlen($code) !== 6) {
            throw new \InvalidArgumentException("Codigo deve ter 6 digitos");
        }

        $isDev = (($_ENV['APP_ENV'] ?? 'development') === 'development');
        if ($isDev) {
            return [
                'success' => true,
                'verified' => true,
                'message' => 'Codigo verificado com sucesso (dev mode).',
            ];
        }

        $sql = 'SELECT id, code, attempts, max_attempts, verified, expires_at
                FROM verification_codes
                WHERE target_type = :type AND target_value = :value AND purpose = :purpose AND verified = 0
                ORDER BY created_at DESC LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type' => $targetType, 'value' => $targetValue, 'purpose' => $purpose]);
        $record = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$record) {
            throw new \InvalidArgumentException("Codigo invalido ou expirado. Solicite um novo codigo.");
        }

        if (strtotime($record['expires_at']) < time()) {
            throw new \InvalidArgumentException("Codigo expirado. Solicite um novo codigo.");
        }

        if ($record['attempts'] >= $record['max_attempts']) {
            throw new \InvalidArgumentException("Numero maximo de tentativas atingido.");
        }

        $this->incrementAttempts($record['id']);

        if ($record['code'] !== $code) {
            $remaining = $record['max_attempts'] - $record['attempts'] - 1;
            throw new \InvalidArgumentException("Codigo invalido. Restam {$remaining} tentativas.");
        }

        $this->markVerified($record['id']);

        return [
            'success' => true,
            'verified' => true,
            'message' => 'Codigo verificado com sucesso.',
        ];
    }

    public function isEmailVerified(string $email): bool
    {
        return $this->isVerified('email', $email, 'registration');
    }

    public function isPhoneVerified(string $phone): bool
    {
        return $this->isVerified('phone', $phone, 'registration');
    }

    private function isVerified(string $targetType, string $targetValue, string $purpose): bool
    {
        $sql = "SELECT id FROM verification_codes
                WHERE target_type = :type AND target_value = :value AND purpose = :purpose AND verified = 1
                ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type' => $targetType, 'value' => $targetValue, 'purpose' => $purpose]);
        return (bool) $stmt->fetch();
    }

    private function storeCode(string $targetType, string $targetValue, string $code, string $purpose): void
    {
        try {
            $stmt = $this->db->prepare('UPDATE verification_codes SET verified = 1 WHERE target_type = :type AND target_value = :value AND purpose = :purpose AND verified = 0');
            $stmt->execute(['type' => $targetType, 'value' => $targetValue, 'purpose' => $purpose]);
        } catch (\Throwable $e) { /* ignore */ }

        $sql = 'INSERT INTO verification_codes (target_type, target_value, code, purpose, expires_at) VALUES (:type, :value, :code, :purpose, :expires_at)';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'type' => $targetType,
            'value' => $targetValue,
            'code' => $code,
            'purpose' => $purpose,
            'expires_at' => date('Y-m-d H:i:s', time() + 600),
        ]);
    }

    private function incrementAttempts(int $id): void
    {
        $stmt = $this->db->prepare('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    private function markVerified(int $id): void
    {
        $stmt = $this->db->prepare('UPDATE verification_codes SET verified = 1 WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
