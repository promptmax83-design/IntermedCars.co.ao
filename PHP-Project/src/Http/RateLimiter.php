<?php

declare(strict_types=1);

namespace IntermedCars\Http;

use IntermedCars\Database\Database;

/**
 * Rate Limiter using SQLite.
 * Prevents brute force, API abuse, and DoS attacks.
 */
class RateLimiter
{
    private static ?\PDO $db = null;

    private static function getDb(): \PDO
    {
        if (self::$db === null) {
            self::$db = Database::getConnection();
            try {
                self::$db->exec("CREATE TABLE IF NOT EXISTS rate_limits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ip_address VARCHAR(45) NOT NULL,
                    endpoint VARCHAR(100) NOT NULL,
                    attempts INTEGER DEFAULT 1,
                    window_start DATETIME DEFAULT CURRENT_TIMESTAMP
                )");
                self::$db->exec("CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(ip_address, endpoint, window_start)");
            } catch (\PDOException $e) {
                error_log("[RateLimiter] Table creation error: " . $e->getMessage());
            }
        }
        return self::$db;
    }

    /**
     * Check if request is allowed under rate limit.
     *
     * @param string $ip Client IP address
     * @param string $endpoint Endpoint identifier
     * @param int $maxAttempts Maximum attempts in window
     * @param int $windowSeconds Time window in seconds
     * @return bool true if allowed, false if rate limited
     */
    public static function check(string $ip, string $endpoint, int $maxAttempts, int $windowSeconds): bool
    {
        $db = self::getDb();

        try {
            // Clean old entries
            $stmt = $db->prepare('DELETE FROM rate_limits WHERE window_start < datetime(\'now\', \'-\' || :secs || \' seconds\')');
            $stmt->execute(['secs' => $windowSeconds]);

            // Count attempts in window
            $stmt = $db->prepare(
                'SELECT COALESCE(SUM(attempts), 0) FROM rate_limits
                 WHERE ip_address = :ip AND endpoint = :ep
                 AND window_start > datetime(\'now\', \'-\' || :secs || \' seconds\')'
            );
            $stmt->execute(['ip' => $ip, 'ep' => $endpoint, 'secs' => $windowSeconds]);
            $count = (int) $stmt->fetchColumn();

            if ($count >= $maxAttempts) {
                return false; // Rate limited
            }

            // Record this attempt
            $stmt = $db->prepare(
                'INSERT INTO rate_limits (ip_address, endpoint, attempts, window_start)
                 VALUES (:ip, :ep, 1, datetime(\'now\'))'
            );
            $stmt->execute(['ip' => $ip, 'ep' => $endpoint]);

            return true;
        } catch (\PDOException $e) {
            error_log("[RateLimiter] check error: " . $e->getMessage());
            return true; // Fail open — don't block legitimate requests
        }
    }

    /**
     * Get client IP address from request.
     */
    public static function getClientIp(): string
    {
        // Handle proxies (Cloudflare, etc.)
        $cf = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
        if ($cf !== '') {
            return $cf;
        }

        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if ($forwarded !== '') {
            $ips = explode(',', $forwarded);
            return trim($ips[0]);
        }

        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Block an IP for a specific endpoint.
     */
    public static function block(string $ip, string $endpoint, int $durationSeconds): void
    {
        $db = self::getDb();
        try {
            $stmt = $db->prepare(
                'INSERT INTO rate_limits (ip_address, endpoint, attempts, window_start)
                 VALUES (:ip, :ep, 999, datetime(\'now\', \'+\' || :dur || \' seconds\'))'
            );
            $stmt->execute(['ip' => $ip, 'ep' => $endpoint, 'dur' => $durationSeconds]);
        } catch (\PDOException $e) {
            error_log("[RateLimiter] block error: " . $e->getMessage());
        }
    }
}
