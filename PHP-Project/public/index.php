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

// Run migrations
\IntermedCars\Database\Migrations::runAll();
\IntermedCars\Database\TransactionMigration::migrate(\IntermedCars\Database\Database::getConnection());

use IntermedCars\Http\Router;
use IntermedCars\Http\AuthMiddleware;
use IntermedCars\Controllers\AuthController;
use IntermedCars\Controllers\VehicleController;
use IntermedCars\Controllers\MessageController;
use IntermedCars\Controllers\NegotiationController;
use IntermedCars\Controllers\ConsultantController;
use IntermedCars\Controllers\PaymentController;
use IntermedCars\Controllers\NotificationController;
use IntermedCars\Controllers\ContractController;
use IntermedCars\Services\TransactionService;
use IntermedCars\Services\CommissionService;
use IntermedCars\Services\PaymentProofService;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
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

// ─── Verification ─────────────────────────────────────────
$router->post('/api/auth/send-code', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $targetType = $data['type'] ?? '';
        $targetValue = $data['value'] ?? '';
        $purpose = $data['purpose'] ?? 'registration';

        $service = new \IntermedCars\Services\VerificationService();
        $result = $service->sendCode($targetType, $targetValue, $purpose);

        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] send-code error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/verify-code', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $targetType = $data['type'] ?? '';
        $targetValue = $data['value'] ?? '';
        $code = $data['code'] ?? '';
        $purpose = $data['purpose'] ?? 'registration';

        $service = new \IntermedCars\Services\VerificationService();
        $result = $service->verifyCode($targetType, $targetValue, $code, $purpose);

        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] verify-code error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Auth ─────────────────────────────────────────────────
$router->post('/api/auth/register', static function (): void {
    try {
        $controller = new AuthController();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $result = $controller->register($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/login', static function (): void {
    try {
        $controller = new AuthController();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $result = $controller->login($email, $password);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/upload-bi-frente', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new AuthController();
        $filePath = $_FILES['file']['tmp_name'] ?? '';
        $result = $controller->uploadBiFrente($userId, $filePath);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/upload-bi-verso', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new AuthController();
        $filePath = $_FILES['file']['tmp_name'] ?? '';
        $result = $controller->uploadBiVerso($userId, $filePath);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/upload-selfie', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new AuthController();
        $filePath = $_FILES['file']['tmp_name'] ?? '';
        $result = $controller->uploadSelfie($userId, $filePath);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/process-kyc', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new AuthController();
        $result = $controller->processKyc($userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/auth/verification-status', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new AuthController();
        $result = $controller->getVerificationStatus($userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Vehicles ─────────────────────────────────────────────
$router->get('/api/vehicles/stats', static function (): void {
    $controller = new VehicleController();
    $result = $controller->getStats();
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

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
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $data['vendedor_id'] = $userId;
        $controller = new VehicleController();
        $result = $controller->create($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->put('/api/vehicles/{id}', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new VehicleController();
        $result = $controller->update($id, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->delete('/api/vehicles/{id}', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new VehicleController();
        $result = $controller->cancelListing($id, $userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/vehicles/{id}/images', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $vehicleId = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new VehicleController();
        $result = $controller->uploadImage($vehicleId, $userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Negotiations ─────────────────────────────────────────
$router->post('/api/negotiations', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new NegotiationController();
        $result = $controller->create($userId, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/negotiations/user', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new NegotiationController();
        $result = $controller->listByUser($userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/negotiations/{id}', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->getById($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/negotiations/{id}/payment-status', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->getPaymentStatus($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/inspection', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new NegotiationController();
        $result = $controller->inspection($id, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/close', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->close($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/confirm-payment', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->confirmPayment($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/complete', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->complete($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/cancel', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->cancel($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/confirm-delivery', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new NegotiationController();
        $result = $controller->confirmDelivery($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Consultants ──────────────────────────────────────────
// === GEOLOCATION ===
$router->put('/api/consultants/me/location', static function (): void {
    $c = new \IntermedCars\Controllers\LocationController();
    $c->updateMyLocation();
});

$router->put('/api/consultants/me/status', static function (): void {
    $c = new \IntermedCars\Controllers\LocationController();
    $c->updateMyStatus();
});

$router->get('/api/consultants/nearby', static function (): void {
    $c = new \IntermedCars\Controllers\LocationController();
    $c->findNearby();
});

$router->get('/api/consultants/nearby/vehicle/{id}', static function (int $id): void {
    $c = new \IntermedCars\Controllers\LocationController();
    $c->findNearbyForVehicle($id);
});

// === SOLICITACOES ===
$router->post('/api/solicitacoes', static function (): void {
    $c = new \IntermedCars\Controllers\SolicitacaoController();
    $c->create();
});

$router->get('/api/solicitacoes/me', static function (): void {
    $c = new \IntermedCars\Controllers\SolicitacaoController();
    $c->mySolicitacoes();
});

$router->put('/api/solicitacoes/{id}/aceitar', static function (int $id): void {
    $c = new \IntermedCars\Controllers\SolicitacaoController();
    $c->aceitar($id);
});

$router->put('/api/solicitacoes/{id}/recusar', static function (int $id): void {
    $c = new \IntermedCars\Controllers\SolicitacaoController();
    $c->recusar($id);
});

// === CONSULTANT CRUD ===
$router->post('/api/consultants', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new ConsultantController();
        $result = $controller->create($userId, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/consultants', static function (): void {
    $controller = new ConsultantController();
    $result = $controller->list();
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/consultants/{id}', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new ConsultantController();
    $result = $controller->getById($id);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/consultants/{id}/metrics', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new ConsultantController();
    $controller->metrics($id);
});

$router->get('/api/consultants/{id}/stats', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new ConsultantController();
    $result = $controller->getStats($id);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->put('/api/consultants/{id}/rating', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new ConsultantController();
        $result = $controller->rate($id, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Messages ─────────────────────────────────────────────
$router->get('/api/messages/conversations', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new MessageController();
        $result = $controller->getConversations($userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/messages/{userId}', static function (): void {
    try {
        $currentUserId = AuthMiddleware::requireAuth();
        $otherUserId = (int) ($_SERVER['ROUTE_PARAMS']['userId'] ?? 0);
        $limit = (int) ($_GET['limit'] ?? 50);
        $offset = (int) ($_GET['offset'] ?? 0);
        $controller = new MessageController();
        $result = $controller->getMessages($currentUserId, $otherUserId, $limit, $offset);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/messages', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new MessageController();
        $result = $controller->sendMessage(
            $userId,
            (int) ($data['receiver_id'] ?? 0),
            $data['content'] ?? '',
            $data['type'] ?? 'text',
            isset($data['transaction_id']) ? (int) $data['transaction_id'] : null
        );
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/messages/{userId}/read', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $senderId = (int) ($_SERVER['ROUTE_PARAMS']['userId'] ?? 0);
        $controller = new MessageController();
        $result = $controller->markAsRead($userId, $senderId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/messages/unread/count', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $controller = new MessageController();
        $count = $controller->getUnreadCount($userId);
        echo json_encode(['count' => $count], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Payments ─────────────────────────────────────────────
$router->post('/api/payments/multicaixa/pay', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new PaymentController();
        $result = $controller->multicaixaPay($userId, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/payments/multicaixa/callback', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new PaymentController();
        $result = $controller->multicaixaCallback($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/payments/multicaixa/{transactionId}', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $transactionId = $_SERVER['ROUTE_PARAMS']['transactionId'] ?? '';
        $controller = new PaymentController();
        $result = $controller->getStatus($transactionId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Commission & Payment Proofs ─────────────────────────
$router->get('/api/commission/payment-details', static function (): void {
    $service = new CommissionService();
    $result = $service->getPaymentDetails();
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Contracts ────────────────────────────────────────────
$router->get('/api/contracts/{id}', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $controller = new ContractController();
        $result = $controller->getById($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/contracts/{id}/sign', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new ContractController();
        $result = $controller->sign($id, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Notifications ────────────────────────────────────────
$router->post('/api/notifications/test-email', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new NotificationController();
        $result = $controller->testEmail($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/notifications/test-sms', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new NotificationController();
        $result = $controller->testSms($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/notifications/test-sms-kamba', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $controller = new NotificationController();
        $result = $controller->testSmsKamba($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/notifications/logs', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $controller = new NotificationController();
        $result = $controller->getLogs();
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Users ────────────────────────────────────────────────
$router->patch('/api/users/profile', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $controller = new \IntermedCars\Controllers\UserController();
        $result = $controller->updateProfile($userId, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/users/{id}', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $db = \IntermedCars\Database\Database::getConnection();
        $stmt = $db->prepare('SELECT id, nome, email, telemovel, status, bi_number, created_at FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Utilizador nao encontrado'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
            return;
        }
        echo json_encode($user, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Admin ────────────────────────────────────────────────
$router->get('/api/admin/users', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $sql = 'SELECT id, nome, email, telemovel, status, bi_number, created_at FROM users ORDER BY created_at DESC';
        $stmt = \IntermedCars\Database\Database::getConnection()->query($sql);
        echo json_encode($stmt->fetchAll(\PDO::FETCH_ASSOC), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/admin/vehicles', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $controller = new VehicleController();
        $result = $controller->list();
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/admin/transactions', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $sql = 'SELECT t.*, v.marca, v.modelo, buyer.nome as buyer_name, seller.nome as seller_name
                FROM transactions t
                JOIN vehicles v ON t.vehicle_id = v.id
                JOIN users buyer ON t.buyer_id = buyer.id
                JOIN users seller ON t.seller_id = seller.id
                ORDER BY t.created_at DESC';
        $stmt = \IntermedCars\Database\Database::getConnection()->query($sql);
        echo json_encode($stmt->fetchAll(\PDO::FETCH_ASSOC), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/admin/stats', static function (): void {
    try {
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
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── 404 ──────────────────────────────────────────────────
$router->notFound(static function (): void {
    http_response_code(404);
    echo json_encode(['error' => 'Rota nao encontrada'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// Dispatch
$router->dispatch();
