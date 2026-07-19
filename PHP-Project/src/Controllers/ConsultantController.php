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

    public function metrics(int $id): void
    {
        try {
            $stmt = $this->db->prepare("SELECT id FROM consultants WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                $this->error('Consultor nao encontrado', 404);
            }

            $pedidosHoje = 0;
            try {
                $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM solicitacoes WHERE consultor_id = ? AND date(criado_em) = date('now','localtime')");
                $stmt->execute([$id]);
                $pedidosHoje = (int) $stmt->fetchColumn();
            } catch (\PDOException $e) {
                error_log("[ConsultantController] metrics solicitacoes error: " . $e->getMessage());
            }

            $tempoMedio = 0.0;
            try {
                $stmt = $this->db->prepare("SELECT AVG((julianday(atualizado_em) - julianday(criado_em)) * 24 * 60) as media_minutos FROM solicitacoes WHERE consultor_id = ? AND estado = 'aceite' AND atualizado_em IS NOT NULL");
                $stmt->execute([$id]);
                $tempoMedio = round((float) ($stmt->fetchColumn() ?: 0), 1);
            } catch (\PDOException $e) {
                error_log("[ConsultantController] metrics tempo medio error: " . $e->getMessage());
            }

            $avaliacaoMedia = 0.0;
            $totalAvaliacoes = 0;
            try {
                $stmt = $this->db->prepare("SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes WHERE consultor_id = ?");
                $stmt->execute([$id]);
                $avaliacao = $stmt->fetch(\PDO::FETCH_ASSOC);
                $avaliacaoMedia = round((float) ($avaliacao['media'] ?? 0), 1);
                $totalAvaliacoes = (int) ($avaliacao['total'] ?? 0);
            } catch (\PDOException $e) {
                error_log("[ConsultantController] metrics avaliacoes error: " . $e->getMessage());
            }

            $this->success([
                'pedidos_hoje' => $pedidosHoje,
                'tempo_medio_resposta_min' => $tempoMedio,
                'avaliacao_media' => $avaliacaoMedia,
                'total_avaliacoes' => $totalAvaliacoes,
            ]);
        } catch (\Throwable $e) {
            error_log("[ConsultantController] metrics error: " . $e->getMessage());
            $this->error('Erro ao buscar metricas', 500);
        }
    }
}
