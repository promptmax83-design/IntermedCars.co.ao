<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\ConsultantService;

class ConsultantController extends BaseController
{
    private ConsultantService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new ConsultantService();
    }

    public function create(int $userId, array $data): void
    {
        try {
            $data['user_id'] = $userId;
            $result = $this->service->create($data);
            $this->success($result, $result['message'] ?? 'Consultor registado');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[ConsultantController] create error: " . $e->getMessage());
            $this->error('Erro ao registar consultor', 500);
        }
    }

    public function list(): void
    {
        try {
            $zone = $_GET['zone'] ?? null;
            $result = $this->service->listActive($zone);
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[ConsultantController] list error: " . $e->getMessage());
            $this->error('Erro ao listar consultores', 500);
        }
    }

    public function getById(int $id): void
    {
        try {
            $result = $this->service->getById($id);
            if (!$result) {
                $this->error('Consultor nao encontrado', 404);
            }
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[ConsultantController] getById error: " . $e->getMessage());
            $this->error('Erro ao buscar consultor', 500);
        }
    }

    public function getStats(int $id): void
    {
        try {
            $result = $this->service->getStats($id);
            $this->success($result);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 404);
        } catch (\Throwable $e) {
            error_log("[ConsultantController] getStats error: " . $e->getMessage());
            $this->error('Erro ao buscar estatisticas', 500);
        }
    }

    public function rate(int $id, array $data): void
    {
        try {
            $rating = (float) ($data['rating'] ?? 0);
            $result = $this->service->updateRating($id, $rating);
            $this->success($result, $result['message'] ?? 'Rating atualizado');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[ConsultantController] rate error: " . $e->getMessage());
            $this->error('Erro ao avaliar consultor', 500);
        }
    }
}
