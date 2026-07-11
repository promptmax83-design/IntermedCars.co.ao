<?php

declare(strict_types=1);

namespace IntermedCars\Database;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $driver = $_ENV['DB_DRIVER'] ?? getenv('DB_DRIVER') ?: 'mysql';

            if ($driver === 'sqlite') {
                self::$instance = self::connectSqlite();
            } else {
                self::$instance = self::connectMysql();
            }
        }

        return self::$instance;
    }

    private static function connectSqlite(): PDO
    {
        $path = $_ENV['DB_PATH'] ?? getenv('DB_PATH') ?: dirname(__DIR__, 2) . '/database/intermedcars.sqlite';

        try {
            $pdo = new PDO("sqlite:{$path}", null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            $pdo->exec('PRAGMA journal_mode=WAL');
            $pdo->exec('PRAGMA foreign_keys=ON');

            return $pdo;
        } catch (PDOException $e) {
            throw new \RuntimeException(
                'SQLite connection failed: ' . $e->getMessage()
            );
        }
    }

    private static function connectMysql(): PDO
    {
        $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
        $name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'intermedcars';
        $user = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
        $pass = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: '';

        $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";

        try {
            return new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new \RuntimeException(
                'Database connection failed: ' . $e->getMessage()
            );
        }
    }

    public static function reset(): void
    {
        self::$instance = null;
    }
}
