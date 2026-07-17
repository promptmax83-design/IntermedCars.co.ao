<?php

declare(strict_types=1);

namespace IntermedCars\Http;

/**
 * JWT Authentication Middleware
 *
 * PHP 8.3 native, no Composer.
 * Implements JWT token generation, validation, and extraction.
 */
class AuthMiddleware
{
    private static ?string $secretKey = null;
    private const TOKEN_EXPIRY = 86400; // 24 hours

    private static function getSecretKey(): string
    {
        if (self::$secretKey === null) {
            self::$secretKey = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: 'intermedcars-secret-key-change-in-production';
        }
        return self::$secretKey;
    }

    /**
     * Generate a JWT token for a user.
     *
     * @param int $userId
     * @param string $email
     * @return string JWT token
     */
    public static function generateToken(int $userId, string $email): string
    {
        $headerData = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $header = self::base64UrlEncode($headerData !== false ? $headerData : '');

        $payloadData = json_encode([
            'sub' => $userId,
            'email' => $email,
            'iat' => time(),
            'exp' => time() + self::TOKEN_EXPIRY,
        ]);
        $payload = self::base64UrlEncode($payloadData !== false ? $payloadData : '');

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::getSecretKey(), true)
        );

        return "{$header}.{$payload}.{$signature}";
    }

    /**
     * Validate and decode a JWT token.
     *
     * @param string $token
     * @return array{sub: int, email: string, iat: int, exp: int}|null Decoded payload or null if invalid
     */
    public static function validateToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::getSecretKey(), true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        // Decode payload
        $decodedJson = self::base64UrlDecode($payload);
        $decoded = json_decode($decodedJson, true);
        if (!is_array($decoded)) {
            return null;
        }

        // Check expiry
        if (!isset($decoded['exp']) || !is_int($decoded['exp']) || $decoded['exp'] < time()) {
            return null;
        }

        // Ensure required fields
        if (!isset($decoded['sub']) || !is_int($decoded['sub'])) {
            return null;
        }

        return [
            'sub' => $decoded['sub'],
            'email' => (string) ($decoded['email'] ?? ''),
            'iat' => (int) ($decoded['iat'] ?? 0),
            'exp' => $decoded['exp'],
        ];
    }

    /**
     * Extract token from Authorization header.
     *
     * @return string|null JWT token or null
     */
    public static function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

        if ($header === '') {
            return null;
        }

        if (!str_starts_with($header, 'Bearer ')) {
            return null;
        }

        return substr($header, 7);
    }

    /**
     * Get authenticated user ID from request.
     *
     * @return int|null User ID or null if not authenticated
     */
    public static function getUserId(): ?int
    {
        $token = self::extractToken();
        if ($token === null) {
            return null;
        }

        $payload = self::validateToken($token);
        if ($payload === null) {
            return null;
        }

        return $payload['sub'];
    }

    /**
     * Require authentication - sends 401 if not authenticated.
     *
     * @return int User ID
     */
    public static function requireAuth(): int
    {
        $userId = self::getUserId();
        if ($userId === null) {
            http_response_code(401);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'Autenticacao obrigatoria'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
            exit;
        }
        return $userId;
    }

    /**
     * Base64 URL encode.
     */
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode.
     */
    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'), true) ?: '';
    }
}
