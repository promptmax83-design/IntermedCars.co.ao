<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Database\Database;
use IntermedCars\Http\AuthMiddleware;
use PDO;

/**
 * Base controller for IntermedCars API
 *
 * All controllers must extend this class to ensure
 * consistent error handling and response formatting.
 */
abstract class BaseController
{
    protected PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Send a JSON response
     *
     * @param array<string, mixed> $data
     * @param int $statusCode
     * @return never
     */
    protected function jsonResponse(array $data, int $statusCode = 200): never
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send a success response
     *
     * @param mixed $data
     * @param string|int $messageOrStatus
     * @return never
     */
    protected function success(mixed $data = null, string|int $messageOrStatus = 'Success'): never
    {
        $response = [
            'success' => true,
        ];

        if (is_int($messageOrStatus)) {
            http_response_code($messageOrStatus);
            $response['message'] = 'Success';
        } else {
            $response['message'] = $messageOrStatus;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        $this->jsonResponse($response);
    }

    /**
     * Send an error response
     *
     * @param string $message
     * @param int $statusCode
     * @param array<string, string>|null $errors
     * @return never
     */
    protected function error(string $message, int $statusCode = 400, ?array $errors = null): never
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        $this->jsonResponse($response, $statusCode);
    }

    /**
     * Get request body as array
     *
     * @return array<string, mixed>
     */
    protected function getRequestBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($decoded)) {
            return [];
        }

        return $decoded;
    }

    /**
     * Get a query parameter value
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    protected function getQueryParam(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * Get authenticated user ID from JWT token
     *
     * @return int|null User ID or null if not authenticated
     */
    protected function getAuthUserId(): ?int
    {
        return AuthMiddleware::getUserId();
    }
}
