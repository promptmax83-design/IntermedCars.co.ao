<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\SessaoService;

class SessaoController extends BaseController
{
    private SessaoService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new SessaoService();
    }

    public function create(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $data = $this->getRequestBody();
            $carroId = (int) ($data['carro_id'] ?? 0);
            $canal = $data['canal'] ?? 'chat';

            if ($carroId <= 0) {
                $this->error('carro_id e obrigatorio', 400);
                return;
            }

            if (!in_array($canal, ['chat', 'sms', 'chamada'])) {
                $this->error('canal invalido. Use: chat, sms ou chamada', 400);
                return;
            }

            $result = $this->service->create($userId, $carroId, $canal);
            $this->success($result, 'Sessao criada com sucesso');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[SessaoController] create error: " . $e->getMessage());
            $this->error('Erro interno do servidor', 500);
        }
    }

    public function aceitar(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $result = $this->service->aceitar($userId, $id);
            $this->success($result, 'Sessao aceite com sucesso');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[SessaoController] aceitar error: " . $e->getMessage());
            $this->error('Erro ao aceitar sessao', 500);
        }
    }

    public function recusar(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $data = $this->getRequestBody();
            $motivo = $data['motivo'] ?? '';
            $result = $this->service->recusar($userId, $id, $motivo);
            $this->success($result, 'Sessao recusada');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[SessaoController] recusar error: " . $e->getMessage());
            $this->error('Erro ao recusar sessao', 500);
        }
    }

    public function encerrar(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $data = $this->getRequestBody();
            $motivo = $data['motivo'] ?? '';
            $result = $this->service->encerrar($userId, $id, $motivo);
            $this->success($result, 'Sessao encerrada');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[SessaoController] encerrar error: " . $e->getMessage());
            $this->error('Erro ao encerrar sessao', 500);
        }
    }

    public function list(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $status = $this->getQueryParam('status');
            $result = $this->service->list($userId, $status);
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[SessaoController] list error: " . $e->getMessage());
            $this->error('Erro ao listar sessoes', 500);
        }
    }

    public function getById(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $result = $this->service->getById($userId, $id);
            if (!$result) {
                $this->error('Sessao nao encontrada', 404);
                return;
            }
            $this->success($result);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 403);
        } catch (\Throwable $e) {
            error_log("[SessaoController] getById error: " . $e->getMessage());
            $this->error('Erro ao buscar sessao', 500);
        }
    }
}
