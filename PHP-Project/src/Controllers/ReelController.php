<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\ReelService;

class ReelController extends BaseController
{
    private ReelService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new ReelService();
    }

    public function create(): void
    {
        try {
            $userId = $this->getAuthUserId();
            if (!$userId) {
                $this->error('Nao autenticado', 401);
                return;
            }

            $data = $this->getRequestBody();
            $userRole = $data['user_role'] ?? 'vendedor';

            $reel = $this->service->create($userId, $userRole, $data);
            $this->success($reel, 'Reel criado com sucesso');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[ReelController] create error: " . $e->getMessage());
            $this->error('Erro ao criar reel', 500);
        }
    }

    public function feed(): void
    {
        try {
            $sort = $this->getQueryParam('sort', 'newest');
            $provincia = $this->getQueryParam('provincia');
            $vehicleId = $this->getQueryParam('vehicle_id') ? (int) $this->getQueryParam('vehicle_id') : null;
            $page = max(1, (int) $this->getQueryParam('page', 1));
            $limit = min(50, max(1, (int) $this->getQueryParam('limit', 10)));

            $result = $this->service->feed($sort, $provincia, $vehicleId, $page, $limit);
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[ReelController] feed error: " . $e->getMessage());
            $this->error('Erro ao carregar feed', 500);
        }
    }

    public function getById(int $id): void
    {
        try {
            $reel = $this->service->getById($id);

            $userId = $this->getAuthUserId();
            if ($userId) {
                $reel['is_liked'] = $this->service->isLiked($id, $userId);
            }

            $this->success($reel);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 404);
        } catch (\Throwable $e) {
            error_log("[ReelController] getById error: " . $e->getMessage());
            $this->error('Erro ao buscar reel', 500);
        }
    }

    public function toggleLike(int $id): void
    {
        try {
            $userId = $this->getAuthUserId();
            if (!$userId) {
                $this->error('Nao autenticado', 401);
                return;
            }

            $result = $this->service->toggleLike($id, $userId);
            $this->success($result);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[ReelController] toggleLike error: " . $e->getMessage());
            $this->error('Erro ao processar like', 500);
        }
    }

    public function recordView(int $id): void
    {
        try {
            $userId = $this->getAuthUserId();
            $sessionId = $this->getQueryParam('session_id');
            $this->service->recordView($id, $userId, $sessionId);
            $this->success(['message' => 'View registada']);
        } catch (\Throwable $e) {
            error_log("[ReelController] recordView error: " . $e->getMessage());
            $this->success(['message' => 'View registada']);
        }
    }

    public function delete(int $id): void
    {
        try {
            $userId = $this->getAuthUserId();
            if (!$userId) {
                $this->error('Nao autenticado', 401);
                return;
            }

            $isAdmin = false;
            $result = $this->service->delete($id, $userId, $isAdmin);
            $this->success($result);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 403);
        } catch (\Throwable $e) {
            error_log("[ReelController] delete error: " . $e->getMessage());
            $this->error('Erro ao remover reel', 500);
        }
    }
}
