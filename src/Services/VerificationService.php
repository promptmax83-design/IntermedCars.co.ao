<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class VerificationService
{
    private \PDO $db;
    
    private const CODE_LENGTH = 6;
    private const CODE_EXPIRY_MINUTES = 10;
    private const MAX_ATTEMPTS = 5;
    private const RESEND_COOLDOWN_SECONDS = 60;
    
    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->ensureTableExists();
    }
    
    private function ensureTableExists(): void
    {
        $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';
        
        if ($driver === 'sqlite') {
            $sql = "CREATE TABLE IF NOT EXISTS verification_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER DEFAULT NULL,
                target_type TEXT NOT NULL,
                target_value TEXT NOT NULL,
                code TEXT NOT NULL,
                purpose TEXT NOT NULL DEFAULT 'registration',
                attempts INTEGER DEFAULT 0,
                max_attempts INTEGER DEFAULT 5,
                verified INTEGER DEFAULT 0,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )";
        } else {
            $sql = "CREATE TABLE IF NOT EXISTS verification_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT DEFAULT NULL,
                target_type VARCHAR(10) NOT NULL,
                target_value VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                purpose VARCHAR(20) NOT NULL DEFAULT 'registration',
                attempts INT DEFAULT 0,
                max_attempts INT DEFAULT 5,
                verified TINYINT(1) DEFAULT 0,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )";
        }
        
        $this->db->exec($sql);
    }
    
    public function sendCode(string $targetType, string $targetValue, string $purpose = 'registration'): array
    {
        error_log("[IntermedCars] sendCode called: type={$targetType}, value={$targetValue}");
        
        if (!in_array($targetType, ['email', 'phone'], true)) {
            throw new \InvalidArgumentException("Tipo de destino invalido");
        }
        
        if (empty($targetValue)) {
            throw new \InvalidArgumentException("Destino invalido");
        }
        
        $code = $this->generateCode();
        error_log("[IntermedCars] === VERIFICATION CODE: {$code} ===");
        
        $this->storeCode($targetType, $targetValue, $code, $purpose);
        
        $notification = new NotificationService();
        if ($targetType === 'email') {
            $sendResult = $notification->sendEmail($targetValue, $code, $purpose);
        } else {
            $sendResult = $notification->sendSms($targetValue, $code, $purpose);
        }
        
        return [
            'success' => true,
            'message' => "Codigo enviado para {$targetValue}",
            'expires_in' => self::CODE_EXPIRY_MINUTES * 60,
        ];
    }
    
    public function verifyCode(string $targetType, string $targetValue, string $code, string $purpose = 'registration'): array
    {
        error_log("[IntermedCars] verifyCode called: type={$targetType}, value={$targetValue}, code={$code}");
        
        if (empty($code) || strlen($code) !== 6) {
            throw new \InvalidArgumentException("Codigo deve ter 6 digitos");
        }
        
        try {
                $sql = 'SELECT id, code, attempts, max_attempts, verified, expires_at 
                    FROM verification_codes 
                    WHERE target_type = :type 
                    AND target_value = :value 
                    AND purpose = :purpose 
                    AND verified = 0
                    ORDER BY created_at DESC 
                    LIMIT 1';
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'type' => $targetType,
                'value' => $targetValue,
                'purpose' => $purpose,
            ]);
            
            $record = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($record) {
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
        } catch (\InvalidArgumentException $e) {
            throw $e;
        } catch (\Throwable $e) {
            error_log("[IntermedCars] DB verify failed: " . $e->getMessage());
            throw new \InvalidArgumentException("Erro ao verificar codigo. Tente novamente.");
        }
        
        // If we get here, no valid record was found
        throw new \InvalidArgumentException("Codigo invalido ou expirado. Solicite um novo codigo.");
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
                WHERE target_type = :type 
                AND target_value = :value 
                AND purpose = :purpose 
                AND verified = 1 
                ORDER BY created_at DESC 
                LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'type' => $targetType,
            'value' => $targetValue,
            'purpose' => $purpose,
        ]);
        
        return (bool) $stmt->fetch();
    }
    
    private function generateCode(): string
    {
        return str_pad((string) random_int(100000, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);
    }
    
    private function storeCode(string $targetType, string $targetValue, string $code, string $purpose): void
    {
        try {
            $sql = 'UPDATE verification_codes 
                    SET verified = 1 
                    WHERE target_type = :type 
                    AND target_value = :value 
                    AND purpose = :purpose 
                    AND verified = 0';
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'type' => $targetType,
                'value' => $targetValue,
                'purpose' => $purpose,
            ]);
        } catch (\Throwable $e) {
            error_log("[IntermedCars] Update previous codes failed (ignoring): " . $e->getMessage());
        }
        
        $sql = 'INSERT INTO verification_codes 
                (target_type, target_value, code, purpose, expires_at) 
                VALUES (:type, :value, :code, :purpose, :expires_at)';
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            'type' => $targetType,
            'value' => $targetValue,
            'code' => $code,
            'purpose' => $purpose,
            'expires_at' => date('Y-m-d H:i:s', time() + (self::CODE_EXPIRY_MINUTES * 60)),
        ]);
        
        if (!$result) {
            throw new \RuntimeException("Falha ao inserir codigo na base de dados");
        }
    }
    
    private function checkCooldown(string $targetType, string $targetValue): void
    {
        $sql = 'SELECT created_at FROM verification_codes 
                WHERE target_type = :type 
                AND target_value = :value 
                ORDER BY created_at DESC 
                LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type' => $targetType, 'value' => $targetValue]);
        $last = $stmt->fetchColumn();
        
        if ($last && (time() - strtotime($last)) < self::RESEND_COOLDOWN_SECONDS) {
            $remaining = self::RESEND_COOLDOWN_SECONDS - (time() - strtotime($last));
            throw new \InvalidArgumentException(
                "Aguarde {$remaining} segundos antes de solicitar um novo codigo."
            );
        }
    }
    
    private function incrementAttempts(int $id): void
    {
        $sql = 'UPDATE verification_codes SET attempts = attempts + 1 WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
    }
    
    private function markVerified(int $id): void
    {
        $sql = 'UPDATE verification_codes SET verified = 1 WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
    }
    
    /**
     * @deprecated Use NotificationService directly. Kept for backward compatibility.
     */
    private function sendCodeNotification(string $targetType, string $targetValue, string $code): bool
    {
        $notification = new NotificationService();
        if ($targetType === 'email') {
            $result = $notification->sendEmail($targetValue, $code);
        } else {
            $result = $notification->sendSms($targetValue, $code);
        }
        return $result['success'];
    }
}