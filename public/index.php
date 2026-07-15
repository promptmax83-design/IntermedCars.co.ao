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

// Run database migrations
\IntermedCars\Database\Migrations::runAll();

use IntermedCars\Http\Router;
use IntermedCars\Http\AuthMiddleware;
use IntermedCars\Controllers\AuthController;
use IntermedCars\Controllers\VehicleController;
use IntermedCars\Services\TransactionService;
use IntermedCars\Services\CommissionService;
use IntermedCars\Services\PenaltyService;
use IntermedCars\Services\PaymentProofService;
use IntermedCars\Services\ContractService;
use IntermedCars\Services\ConsultantService;
use IntermedCars\Services\VerificationService;

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

// ─── Verification ──────────────────────────────────────────

$router->post('/api/auth/send-code', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $targetType = $data['type'] ?? '';
        $targetValue = $data['value'] ?? '';
        $purpose = $data['purpose'] ?? 'registration';
        
        $service = new VerificationService();
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
        
        $service = new VerificationService();
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
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] register error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao criar conta'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/auth/login', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $controller = new AuthController();
        $result = $controller->login($email, $password);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao fazer login'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
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
    $service = new PaymentProofService();
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
    $transactionService = new TransactionService();
    $proofService = new PaymentProofService();
    $transactionId = (int) ($data['transaction_id'] ?? 0);
    $amount = (float) ($data['amount'] ?? 0);
    $role = $data['role'] ?? 'buyer';
    $filePath = $_FILES['proof']['tmp_name'] ?? '';
    $result = $transactionService->processCommissionPayment($transactionId, $userId, $amount, $role);
    if ($filePath !== '') {
        $proofService->uploadProof($userId, $transactionId, $filePath);
    }
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

// ─── Users ────────────────────────────────────────────────
$router->get('/api/users/{id}', static function (): void {
    $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
    $controller = new \IntermedCars\Controllers\UserController();
    $result = $controller->getProfile($id);
    echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Admin ────────────────────────────────────────────────
$router->get('/api/admin/users', static function (): void {
    AuthMiddleware::requireAuth();
    $sql = 'SELECT id, nome, email, telemovel, status, bi_passaporte, created_at FROM users ORDER BY created_at DESC';
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
    $sql = 'SELECT n.*, v.marca, v.modelo, buyer.nome as buyer_name, seller.nome as seller_name
            FROM negotiations n
            JOIN vehicles v ON n.vehicle_id = v.id
            JOIN users buyer ON n.buyer_id = buyer.id
            JOIN users seller ON n.seller_id = seller.id
            ORDER BY n.created_at DESC';
    $stmt = \IntermedCars\Database\Database::getConnection()->query($sql);
    echo json_encode($stmt->fetchAll(\PDO::FETCH_ASSOC), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

$router->get('/api/admin/stats', static function (): void {
    AuthMiddleware::requireAuth();
    $controller = new VehicleController();
    $vehicleStats = $controller->getStats();

    $db = \IntermedCars\Database\Database::getConnection();
    $userCount = (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $transactionCount = (int) $db->query('SELECT COUNT(*) FROM negotiations')->fetchColumn();
    $commissionRevenue = (float) ($db->query("SELECT COALESCE(SUM(amount_aoa), 0) FROM fee_payments WHERE status = 'confirmado'")->fetchColumn() ?: 0);

    echo json_encode(array_merge($vehicleStats, [
        'user_count' => $userCount,
        'transaction_count' => $transactionCount,
        'commission_revenue' => $commissionRevenue,
    ]), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// ─── Notification Test Routes (dev only) ──────────────────
$router->post('/api/notifications/test-email', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $to = $data['email'] ?? '';
        $service = new \IntermedCars\Services\NotificationService();
        $result = $service->sendEmail($to, 'IntermedCars — Teste', '<h1>Funciona!</h1><p>Isto é um teste do sistema de notificações.</p>', 'test');
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/notifications/test-sms', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $phone = $data['phone'] ?? '';
        $service = new \IntermedCars\Services\NotificationService();
        $result = $service->sendSms($phone, 'IntermedCars: SMS de teste recebido com sucesso!', 'test');
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/notifications/logs', static function (): void {
    try {
        $repo = new \IntermedCars\Services\NotificationLogRepository();
        $limit = (int) ($_GET['limit'] ?? 50);
        $recipient = $_GET['recipient'] ?? null;

        if ($recipient) {
            $logs = $repo->findByTarget($recipient, $limit);
        } else {
            $logs = $repo->findRecent(0, $limit);
        }

        echo json_encode($logs, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Negotiations ──────────────────────────────────────
$router->post('/api/negotiations', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->create((int) ($data['vehicle_id'] ?? 0), $userId, $data['zone'] ?? 'Luanda');
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao criar negociação'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/inspection', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->submitInspection($id, $userId, $data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao submeter vistoria'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/close', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->closeDeal($id, $userId, (float) ($data['final_price'] ?? 0));
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao fechar negócio'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/confirm-payment', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->confirmPayment($id, $data['role'] ?? '', $data['payment_ref'] ?? '');
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao confirmar pagamento'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/negotiations/{id}/complete', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->complete($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao concluir'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/negotiations/{id}', static function (): void {
    try {
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->getById($id);
        if (!$result) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Não encontrada'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE); return; }
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/negotiations/{id}/financial', static function (): void {
    try {
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new \IntermedCars\Services\CommissionService();
        $result = $service->getFinancialSummary($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Negotiations (user routes) ────────────────────────
$router->post('/api/negotiations/{id}/cancel', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->cancel($id, $userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/negotiations/user', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $service = new \IntermedCars\Services\NegotiationService();
        $result = $service->listByUser($userId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Payment Proofs ────────────────────────────────────
$router->post('/api/payment-proofs', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $filePath = $_FILES['file']['tmp_name'] ?? '';
        $service = new PaymentProofService();
        $result = $service->uploadProof($userId, (int) ($data['transaction_id'] ?? 0), $filePath);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[IntermedCars] " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/payment-proofs/{id}', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new PaymentProofService();
        $result = $service->getProofStatus($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Contracts ──────────────────────────────────────────
$router->post('/api/transactions/{id}/contract', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new ContractService();
        $result = $service->generateContract($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/transactions/{id}/contract', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new ContractService();
        $result = $service->getContract($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Admin ──────────────────────────────────────────────
$router->post('/api/admin/penalties', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new PenaltyService();
        $result = $service->applyPenalty(
            (int) ($data['user_id'] ?? 0),
            (int) ($data['transaction_id'] ?? 0),
            (float) ($data['penalty_amount'] ?? 0)
        );
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/admin/users/{id}/unban', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new PenaltyService();
        $result = $service->unbanUser($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Consultants ───────────────────────────────────────
$router->post('/api/consultants', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $data['user_id'] = $userId;
        $service = new \IntermedCars\Services\ConsultantService();
        $result = $service->create($data);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/consultants', static function (): void {
    try {
        $service = new \IntermedCars\Services\ConsultantService();
        $result = $service->listActive($_GET['zone'] ?? null);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/consultants/{id}', static function (): void {
    try {
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new \IntermedCars\Services\ConsultantService();
        $result = $service->getById($id);
        if (!$result) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Não encontrado'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE); return; }
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/consultants/{id}/stats', static function (): void {
    try {
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $service = new \IntermedCars\Services\ConsultantService();
        $result = $service->getStats($id);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->put('/api/consultants/{id}/rating', static function (): void {
    try {
        AuthMiddleware::requireAuth();
        $id = (int) ($_SERVER['ROUTE_PARAMS']['id'] ?? 0);
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new ConsultantService();
        $result = $service->updateRating($id, (float) ($data['rating'] ?? 0));
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Multicaixa Express (ProxyPay) ─────────────────────
$router->post('/api/payments/multicaixa/callback', static function (): void {
    try {
        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new \IntermedCars\Services\MulticaixaService();
        $result = $service->handleCallback($payload);
        
        if ($result['accepted']) {
            $db = \IntermedCars\Database\Database::getConnection();
            $stmt = $db->prepare("UPDATE fee_payments SET status = 'confirmado', confirmed_at = datetime('now','localtime') WHERE payment_ref = :ref AND status = 'pendente'");
            $stmt->execute(['ref' => $result['transaction_id']]);
        }
        
        echo json_encode(['received' => true], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[Multicaixa] Callback error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Callback processing failed'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->post('/api/payments/multicaixa/pay', static function (): void {
    try {
        $userId = AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $service = new \IntermedCars\Services\MulticaixaService();
        
        $negotiationId = (int) ($data['negotiation_id'] ?? 0);
        $role = $data['role'] ?? '';
        $phone = $data['phone'] ?? '';
        $amount = (float) ($data['amount'] ?? 0);
        
        if (!$negotiationId || !$role || !$phone || $amount <= 0) {
            throw new \InvalidArgumentException("Dados incompletos");
        }
        
        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8080') . '/api/payments/multicaixa/callback';
        $idempotencyKey = "neg-{$negotiationId}-{$role}-" . time();
        
        $result = $service->createPayment($phone, $amount, $callbackUrl, $idempotencyKey);
        
        if ($result['success']) {
            $db = \IntermedCars\Database\Database::getConnection();
            $stmt = $db->prepare("INSERT INTO fee_payments (negotiation_id, payer_id, payer_role, amount_aoa, payment_ref, status) VALUES (:nid, :pid, :role, :amount, :ref, 'pendente')");
            $stmt->execute([
                'nid' => $negotiationId,
                'pid' => $userId,
                'role' => $role,
                'amount' => $amount,
                'ref' => $result['transaction_id'] ?? '',
            ]);
        }
        
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        error_log("[Multicaixa] Pay error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao processar pagamento'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

$router->get('/api/payments/multicaixa/{transactionId}', static function (): void {
    try {
        $transactionId = $_SERVER['ROUTE_PARAMS']['transactionId'] ?? '';
        $service = new \IntermedCars\Services\MulticaixaService();
        $result = $service->getTransaction($transactionId);
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── Notification Test — KambaSMS (dev only) ─────────────
$router->post('/api/notifications/test-sms-kamba', static function (): void {
    try {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $phone = $data['phone'] ?? '';
        $service = new \IntermedCars\Services\KambaSMSService();
        $result = $service->send($phone, 'IntermedCars: SMS de teste via KambaSMS.');
        echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }
});

// ─── 404 ──────────────────────────────────────────────────
$router->notFound(static function (): void {
    http_response_code(404);
    echo json_encode(['error' => 'Rota nao encontrada'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
});

// Dispatch
$router->dispatch();
