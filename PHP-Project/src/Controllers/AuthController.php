<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Http\AuthMiddleware;
use IntermedCars\Services\KycService;

/**
 * AuthController
 *
 * Handles user registration, authentication, and KYC verification.
 */
class AuthController extends BaseController
{
    private KycService $kycService;

    public function __construct()
    {
        parent::__construct();
        $this->kycService = new KycService();
    }
    /**
     * Register a new user with basic information.
     *
     * @param array{nome: string, email: string, telemovel?: string, bi_passaporte: string, password: string, nome_pai: string, nome_mae: string} $data
     * @return array{success: bool, user_id: int, token: string, message: string}
     */
    public function register(array $data): array
    {
        $required = ['nome', 'email', 'bi_passaporte', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Campo obrigatorio: {$field}");
            }
        }

        $data['telemovel'] = $data['telemovel'] ?? '000000000';

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("Email invalido");
        }

        if (strlen($data['bi_passaporte']) < 9) {
            throw new \InvalidArgumentException("BI/Passaporte deve ter minimo 9 caracteres");
        }

        $data['telemovel'] = preg_replace('/[\s\-\(\)]/', '', $data['telemovel']);

        if ($data['telemovel'] !== '000000000' && !preg_match('/^(\+?244)?9\d{8}$/', $data['telemovel'])) {
            throw new \InvalidArgumentException("Telemovel invalido");
        }

        if (strlen($data['password']) < 8) {
            throw new \InvalidArgumentException("Password deve ter minimo 8 caracteres");
        }

        // Anti-recidivism check
        $this->checkAntiRecidivism($data);

        // Check if email already exists
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email');
        $stmt->execute(['email' => $data['email']]);
        if ($stmt->fetch()) {
            throw new \InvalidArgumentException("Email ja registado");
        }

        // Check if BI already exists
        $stmt = $this->db->prepare('SELECT id FROM users WHERE bi_passaporte = :bi');
        $stmt->execute(['bi' => $data['bi_passaporte']]);
        if ($stmt->fetch()) {
            throw new \InvalidArgumentException("BI/Passaporte ja registado");
        }

        $role = $data['role'] ?? 'cliente';
        if (!in_array($role, ['cliente', 'consultor'], true)) {
            throw new \InvalidArgumentException("Tipo de conta invalido");
        }

        $passwordHash = defined('PASSWORD_ARGON2ID')
            ? password_hash($data['password'], PASSWORD_ARGON2ID)
            : password_hash($data['password'], PASSWORD_BCRYPT);

        $sql = 'INSERT INTO users (nome, email, telemovel, bi_passaporte, password_hash, nome_pai, nome_mae, role, status, created_at)
                VALUES (:nome, :email, :telemovel, :bi_passaporte, :password_hash, :nome_pai, :nome_mae, :role, :status, datetime(\'now\',\'localtime\'))';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'nome' => $data['nome'],
            'email' => $data['email'],
            'telemovel' => $data['telemovel'],
            'bi_passaporte' => $data['bi_passaporte'],
            'password_hash' => $passwordHash,
            'nome_pai' => $data['nome_pai'] ?? '',
            'nome_mae' => $data['nome_mae'] ?? '',
            'role' => $role,
            'status' => 'pendente_verificacao',
        ]);

        $userId = (int) $this->db->lastInsertId();

        if ($role === 'consultor') {
            $stmt = $this->db->prepare(
                'INSERT INTO consultants (user_id, fullname, phone, zone, created_at)
                 VALUES (:user_id, :fullname, :phone, :zone, datetime(\'now\',\'localtime\'))'
            );
            $stmt->execute([
                'user_id' => $userId,
                'fullname' => $data['nome'],
                'phone' => $data['telemovel'],
                'zone' => $data['zona'] ?? '',
            ]);
        }

        $token = AuthMiddleware::generateToken($userId, $data['email']);

        return [
            'success' => true,
            'user_id' => $userId,
            'token' => $token,
            'message' => 'Conta criada com sucesso.',
        ];
    }

    /**
     * Login with email and password.
     *
     * @param string $email
     * @param string $password
     * @return array{success: bool, user: array<string, mixed>, token: string}
     */
    public function login(string $email, string $password): array
    {
        if (empty($email) || empty($password)) {
            throw new \InvalidArgumentException("Email e password obrigatorios");
        }

        $sql = 'SELECT id, nome, email, bi_passaporte, password_hash, status, role FROM users WHERE email = :email';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new \InvalidArgumentException("Credenciais invalidas");
        }

        if ($user['status'] === 'temporariamente_banido') {
            throw new \InvalidArgumentException("Conta temporariamente banida por incumprimento.");
        }

        $token = AuthMiddleware::generateToken((int) $user['id'], $user['email']);

        return [
            'success' => true,
            'user' => [
                'id' => (int) $user['id'],
                'nome' => $user['nome'],
                'email' => $user['email'],
                'verificado' => $user['status'] === 'verificado',
                'role' => $user['role'] ?? 'user',
            ],
            'token' => $token,
        ];
    }

    /**
     * Upload BI front image.
     *
     * @param int $userId
     * @param string $filePath Path to uploaded temporary file
     * @return array{success: bool, message: string}
     */
    public function uploadBiFrente(int $userId, string $filePath): array
    {
        $this->validateUserId($userId);

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        $mimeType = mime_content_type($filePath);
        if (!in_array($mimeType, $allowedTypes, true)) {
            throw new \InvalidArgumentException("Tipo de ficheiro nao permitido.");
        }

        $fileSize = filesize($filePath);
        if ($fileSize > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException("Ficheiro excede 5MB");
        }

        $encryptedPath = $this->encryptAndStore($filePath, $userId, 'bi_frente');

        $sql = 'UPDATE users SET bi_frente_path = :path, updated_at = datetime(\'now\',\'localtime\') WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['path' => $encryptedPath, 'id' => $userId]);

        return [
            'success' => true,
            'message' => 'Frente do BI carregada com sucesso.',
        ];
    }

    /**
     * Upload BI back image.
     *
     * @param int $userId
     * @param string $filePath Path to uploaded temporary file
     * @return array{success: bool, message: string}
     */
    public function uploadBiVerso(int $userId, string $filePath): array
    {
        $this->validateUserId($userId);

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        $mimeType = mime_content_type($filePath);
        if (!in_array($mimeType, $allowedTypes, true)) {
            throw new \InvalidArgumentException("Tipo de ficheiro nao permitido.");
        }

        $fileSize = filesize($filePath);
        if ($fileSize > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException("Ficheiro excede 5MB");
        }

        $encryptedPath = $this->encryptAndStore($filePath, $userId, 'bi_verso');

        $sql = 'UPDATE users SET bi_verso_path = :path, updated_at = datetime(\'now\',\'localtime\') WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['path' => $encryptedPath, 'id' => $userId]);

        return [
            'success' => true,
            'message' => 'Verso do BI carregado com sucesso.',
        ];
    }

    /**
     * Upload selfie for facial recognition.
     *
     * @param int $userId
     * @param string $filePath Path to uploaded selfie
     * @return array{success: bool, message: string}
     */
    public function uploadSelfie(int $userId, string $filePath): array
    {
        $this->validateUserId($userId);

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $mimeType = mime_content_type($filePath);
        if (!in_array($mimeType, $allowedTypes, true)) {
            throw new \InvalidArgumentException("Tipo de ficheiro nao permitido.");
        }

        $encryptedPath = $this->encryptAndStore($filePath, $userId, 'selfie');

        $sql = 'UPDATE users SET selfie_path = :path, updated_at = datetime(\'now\',\'localtime\') WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['path' => $encryptedPath, 'id' => $userId]);

        return [
            'success' => true,
            'message' => 'Selfie carregada com sucesso.',
        ];
    }

    /**
     * Process KYC verification.
     *
     * @param int $userId
     * @return array{success: bool, verified: bool, message: string}
     */
    public function processKyc(int $userId): array
    {
        $this->validateUserId($userId);

        $sql = 'SELECT bi_frente_path, bi_verso_path, selfie_path FROM users WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || !$user['bi_frente_path'] || !$user['bi_verso_path'] || !$user['selfie_path']) {
            throw new \InvalidArgumentException("Documentos incompletos");
        }

        // In production: call external verification API
        // $verified = $this->callExternalVerificationApi($userId);
        // For now, auto-verify
        $verified = $this->callExternalVerificationApi($userId);

        if ($verified) {
            $sql = 'UPDATE users SET status = :status, verified_at = datetime(\'now\',\'localtime\') WHERE id = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['status' => 'verificado', 'id' => $userId]);

            return [
                'success' => true,
                'verified' => true,
                'message' => 'Identidade verificada com sucesso.',
            ];
        }

        $sql = 'UPDATE users SET status = :status, updated_at = datetime(\'now\',\'localtime\') WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['status' => 'verificacao_recusada', 'id' => $userId]);

        return [
            'success' => true,
            'verified' => false,
            'message' => 'Verificacao recusada. Documentos nao conferem.',
        ];
    }

    /**
     * Internal: Call external verification API.
     *
     * @param int $userId
     * @return bool
     */
    private function callExternalVerificationApi(int $userId): bool
    {
        // Get user's uploaded documents
        $sql = 'SELECT bi_frente_path, selfie_path FROM users WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || empty($user['bi_frente_path']) || empty($user['selfie_path'])) {
            return false;
        }

        $result = $this->kycService->submitForVerification(
            $userId,
            $user['bi_frente_path'],
            $user['selfie_path']
        );

        return $result['success'];
    }

    /**
     * Get user verification status.
     *
     * @param int $userId
     * @return array{status: string, verificado: bool, pode_anunciar: bool, pode_depositar: bool}
     */
    public function getVerificationStatus(int $userId): array
    {
        $this->validateUserId($userId);

        $sql = 'SELECT status FROM users WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $userId]);
        $statusResult = $stmt->fetchColumn();
        $status = is_string($statusResult) ? $statusResult : 'pendente_verificacao';

        $isVerified = $status === 'verificado';

        return [
            'status' => $status,
            'verificado' => $isVerified,
            'pode_anunciar' => $isVerified,
            'pode_depositar' => $isVerified,
        ];
    }

    /**
     * Anti-recidivism check.
     *
     * @param array{nome: string, email: string, telemovel: string, bi_passaporte: string, nome_pai: string, nome_mae: string} $data
     * @return void
     */
    private function checkAntiRecidivism(array $data): void
    {
        // Check for banned users with matching identifiers
        $sql = 'SELECT id, nome, status FROM users
                WHERE (bi_passaporte = :bi OR email = :email OR telemovel = :telemovel)
                AND status = :banned_status';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'bi' => $data['bi_passaporte'],
            'email' => $data['email'],
            'telemovel' => $data['telemovel'] ?? '',
            'banned_status' => 'temporariamente_banido',
        ]);
        $bannedUser = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($bannedUser) {
            throw new \InvalidArgumentException(
                'Conta bloqueada por incumprimento. Contacte o suporte.'
            );
        }

        // Check parent names (fuzzy match)
        $sql = 'SELECT id, nome, nome_pai, nome_mae FROM users
                WHERE status = :banned_status';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['banned_status' => 'temporariamente_banido']);
        $bannedUsers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($bannedUsers as $banned) {
            $similarFather = similar_text(
                strtolower($data['nome_pai'] ?? ''),
                strtolower($banned['nome_pai'] ?? '')
            );
            $similarMother = similar_text(
                strtolower($data['nome_mae'] ?? ''),
                strtolower($banned['nome_mae'] ?? '')
            );

            if ($similarFather > 0.8 && $similarMother > 0.8) {
                throw new \InvalidArgumentException(
                    'Conta bloqueada por incumprimento. Contacte o suporte.'
                );
            }
        }
    }

    /**
     * Internal: Validate user ID exists.
     */
    private function validateUserId(int $userId): void
    {
        if ($userId <= 0) {
            throw new \InvalidArgumentException("ID de utilizador invalido");
        }
    }

    /**
     * Internal: Encrypt file and store outside public directory.
     */
    private function encryptAndStore(string $sourcePath, int $userId, string $type): string
    {
        $filename = bin2hex(random_bytes(32)) . '.' . pathinfo($sourcePath, PATHINFO_EXTENSION);

        $storageDir = dirname(__DIR__, 2) . '/storage/kyc/' . $userId;
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0700, true);
        }

        $destPath = $storageDir . '/' . $type . '_' . $filename;
        copy($sourcePath, $destPath);
        chmod($destPath, 0600);

        return $destPath;
    }
}
