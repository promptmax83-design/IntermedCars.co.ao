<?php

declare(strict_types=1);

/**
 * IntermedCars API - Entry Point
 *
 * PHP 8.3 native, no frameworks, no Composer runtime dependencies.
 * Routes all API requests to appropriate controllers.
 */

// Load .env file
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
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
            putenv("$key=$value");
        }
    }
}

require_once dirname(__DIR__) . '/src/autoload.php';

use IntermedCars\Http\Router;
use IntermedCars\Http\AuthMiddleware;
use IntermedCars\Controllers\AuthController;
use IntermedCars\Controllers\VehicleController;
use IntermedCars\Services\TransactionService;
use IntermedCars\Services\CommissionService;
use IntermedCars\Services\PenaltyService;
use IntermedCars\Services\PaymentProofService;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$router = new Router();

// ─── Health ───────────────────────────────────────────────
$router->get('/api/health', static function (): void {
    echo json_encode([
        'status' => 'ok',
        'version' => '1.0.0',
        'php' => PHP_VERSION,
    ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Auth ─────────────────────────────────────────────────
$router->post('/api/auth/register', static function (): void {
    $controller = new AuthController();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $result = $controller->register($data);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/auth/login', static function (): void {
    $controller = new AuthController();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $result = $controller->login($email, $password);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/auth/upload-bi-frente', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new AuthController();
    $filePath = $_FILES['file']['tmp_name'] ?? '';
    $result = $controller->uploadBiFrente($userId, $filePath);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/auth/upload-bi-verso', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new AuthController();
    $filePath = $_FILES['file']['tmp_name'] ?? '';
    $result = $controller->uploadBiVerso($userId, $filePath);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/auth/upload-selfie', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new AuthController();
    $filePath = $_FILES['file']['tmp_name'] ?? '';
    $result = $controller->uploadSelfie($userId, $filePath);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/auth/process-kyc', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new AuthController();
    $result = $controller->processKyc($userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/auth/verification-status', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new AuthController();
    $result = $controller->getVerificationStatus($userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Vehicles ─────────────────────────────────────────────
$router->get('/api/vehicles', static function (): void {
    $controller = new VehicleController();
    $status = $_GET['status'] ?? null;
    $orderBy = $_GET['order'] ?? 'created_at';
    $search = $_GET['search'] ?? null;
    $limit = (int) ($_GET['limit'] ?? 50);
    $offset = (int) ($_GET['offset'] ?? 0);
    $result = $controller->list($status, $orderBy, 'DESC', $search, $limit, $offset);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/vehicles/{id}', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new VehicleController();
    $result = $controller->getById($id);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/vehicles', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $data['vendedor_id'] = $userId;
    $controller = new VehicleController();
    $result = $controller->create($data);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->put('/api/vehicles/{id}', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $controller = new VehicleController();
    $result = $controller->update($id, $data);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->delete('/api/vehicles/{id}', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new VehicleController();
    $result = $controller->cancelListing($id, $userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/vehicles/stats', static function (): void {
    $controller = new VehicleController();
    $result = $controller->getStats();
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/vehicles/{id}/images', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $vehicleId = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new VehicleController();
    $result = $controller->uploadImage($vehicleId, $userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Vehicle Status Transitions ───────────────────────────
$router->post('/api/vehicles/{id}/start-negotiation', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new VehicleController();
    $result = $controller->startNegotiation($id, $userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/vehicles/{id}/complete-purchase', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $commission = (float) ($data['commission'] ?? 0);
    $controller = new VehicleController();
    $result = $controller->completePurchase($id, $commission);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/vehicles/{id}/reactivate', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new VehicleController();
    $result = $controller->reactivateListing($id);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Transactions ─────────────────────────────────────────
$router->post('/api/transactions', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $service = new TransactionService();
    $result = $service->createProposal(
        (int) ($data['vehicle_id'] ?? 0),
        $userId,
        (int) ($data['seller_id'] ?? 0),
        (float) ($data['price'] ?? 0)
    );
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/transactions/{id}/accept', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $service = new TransactionService();
    $result = $service->acceptProposal($id, $userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/transactions/{id}/deposit', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $service = new TransactionService();
    $result = $service->recordDeposit($id, $userId, (float) ($data['amount'] ?? 0));
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/transactions/{id}/inspection', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $service = new TransactionService();
    $result = $service->completeInspection($id, (bool) ($data['approved'] ?? true));
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Commission & Payment Proofs ─────────────────────────
$router->get('/api/commission/payment-details', static function (): void {
    $service = new CommissionService();
    $result = $service->getPaymentDetails();
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/transactions', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $service = new \IntermedCars\Services\TransactionService();
    $result = $service->getByUserId($userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/commission/pay', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $service = new CommissionService();
    $filePath = $_FILES['proof']['tmp_name'] ?? '';
    $result = $service->processPaymentWithProof(
        $userId,
        (int) ($data['transaction_id'] ?? 0),
        (float) ($data['amount'] ?? 0),
        $data['role'] ?? 'buyer',
        $filePath
    );
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Chat / Messages ──────────────────────────────────────
$router->get('/api/messages/conversations', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new \IntermedCars\Controllers\MessageController();
    $result = $controller->getConversations($userId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/messages/{userId}', static function (): void {
    $currentUserId = AuthMiddleware::requireAuth();
    $otherUserId = (int) ($_SERVER['ROUTE_PARAMS']['userId'] ?? 0);
    $limit = (int) ($_GET['limit'] ?? 50);
    $offset = (int) ($_GET['offset'] ?? 0);
    $controller = new \IntermedCars\Controllers\MessageController();
    $result = $controller->getMessages($currentUserId, $otherUserId, $limit, $offset);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/messages', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $controller = new \IntermedCars\Controllers\MessageController();
    $result = $controller->sendMessage(
        $userId,
        (int) ($data['receiver_id'] ?? 0),
        $data['content'] ?? '',
        $data['type'] ?? 'text',
        isset($data['transaction_id']) ? (int) $data['transaction_id'] : null
    );
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->post('/api/messages/{userId}/read', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $senderId = (int) ($_SERVER['ROUTE_PARAMS']['userId'] ?? 0);
    $controller = new \IntermedCars\Controllers\MessageController();
    $result = $controller->markAsRead($userId, $senderId);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/messages/unread/count', static function (): void {
    $userId = AuthMiddleware::requireAuth();
    $controller = new \IntermedCars\Controllers\MessageController();
    $count = $controller->getUnreadCount($userId);
    echo json_encode(['count' => $count], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Admin ────────────────────────────────────────────────
$router->get('/api/admin/users', static function (): void {
    AuthMiddleware::requireAuth();
    $sql = 'SELECT id, nome, email, telemovel, status, bi_number, created_at FROM users ORDER BY created_at DESC';
    $stmt = \IntermedCars\Database\Database::getConnection()->query($sql);
    echo json_encode($stmt->fetchAll(\PDO::FETCH_ASSOC), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/admin/vehicles', static function (): void {
    AuthMiddleware::requireAuth();
    $controller = new VehicleController();
    $result = $controller->list();
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/admin/transactions', static function (): void {
    AuthMiddleware::requireAuth();
    $service = new \IntermedCars\Services\TransactionService();
    $sql = 'SELECT t.*, v.marca, v.modelo, buyer.nome as buyer_name, seller.nome as seller_name
            FROM transactions t
            JOIN vehicles v ON t.vehicle_id = v.id
            JOIN users buyer ON t.buyer_id = buyer.id
            JOIN users seller ON t.seller_id = seller.id
            ORDER BY t.created_at DESC';
    $stmt = \IntermedCars\Database\Database::getConnection()->query($sql);
    echo json_encode($stmt->fetchAll(\PDO::FETCH_ASSOC), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/admin/stats', static function (): void {
    AuthMiddleware::requireAuth();
    $controller = new VehicleController();
    $vehicleStats = $controller->getStats();

    $db = \IntermedCars\Database\Database::getConnection();
    $userCount = (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $transactionCount = (int) $db->query('SELECT COUNT(*) FROM transactions')->fetchColumn();
    $commissionRevenue = (float) ($db->query("SELECT COALESCE(SUM(amount), 0) FROM commission_payments WHERE status = 'confirmado'")->fetchColumn() ?: 0);

    echo json_encode(array_merge($vehicleStats, [
        'user_count' => $userCount,
        'transaction_count' => $transactionCount,
        'commission_revenue' => $commissionRevenue,
    ]), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── 404 ──────────────────────────────────────────────────
$router->notFound(static function (): void {
    http_response_code(404);
    echo json_encode(['error' => 'Rota nao encontrada'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// Dispatch
$router->dispatch();
