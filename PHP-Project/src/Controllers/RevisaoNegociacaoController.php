<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Database\Database;
use IntermedCars\Services\DetecaoDesintermediacaoService;

class RevisaoNegociacaoController extends BaseController
{
    private DetecaoDesintermediacaoService $detecaoService;

    public function __construct()
    {
        parent::__construct();
        $this->detecaoService = new DetecaoDesintermediacaoService();
    }

    /**
     * Listar revisões (admin ou consultor).
     * GET /api/revisoes?status=aguardando_relato
     */
    public function list(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $status = $this->getQueryParam('status');

            // Verificar se é admin
            $stmt = $this->db->prepare('SELECT role FROM users WHERE id = :id');
            $stmt->execute(['id' => $userId]);
            $role = $stmt->fetchColumn();

            if ($role === 'admin') {
                // Admin vê todas
                $sql = "SELECT r.*, u.nome as consultor_nome, s.carro_id,
                               v.marca, v.modelo
                        FROM revisoes_negociacao r
                        JOIN users u ON u.id = r.consultor_id
                        JOIN sessoes_consultoria s ON s.id = r.sessao_id
                        JOIN vehicles v ON v.id = s.carro_id";
                $params = [];

                if ($status) {
                    $sql .= " WHERE r.status = :status";
                    $params['status'] = $status;
                }

                $sql .= " ORDER BY r.created_at DESC LIMIT 50";
            } else {
                // Consultor vê apenas as suas
                $sql = "SELECT r.*, v.marca, v.modelo
                        FROM revisoes_negociacao r
                        JOIN sessoes_consultoria s ON s.id = r.sessao_id
                        JOIN vehicles v ON v.id = s.carro_id
                        WHERE r.consultor_id = :uid";
                $params = ['uid' => $userId];

                if ($status) {
                    $sql .= " AND r.status = :status";
                    $params['status'] = $status;
                }

                $sql .= " ORDER BY r.created_at DESC LIMIT 50";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $revisoes = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->success($revisoes);
        } catch (\Throwable $e) {
            error_log("[RevisaoController] list error: " . $e->getMessage());
            $this->error('Erro ao listar revisoes', 500);
        }
    }

    /**
     * Submeter relato (consultor).
     * POST /api/revisoes/{id}/relato
     * Body: { relato: string }
     */
    public function submitRelato(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            // Verificar se é consultor
            $stmt = $this->db->prepare('SELECT id FROM consultants WHERE user_id = :uid');
            $stmt->execute(['uid' => $userId]);
            if (!$stmt->fetch()) {
                $this->error('Apenas consultores podem submeter relatos', 403);
                return;
            }

            // Buscar revisão
            $stmt = $this->db->prepare('SELECT * FROM revisoes_negociacao WHERE id = :id');
            $stmt->execute(['id' => $id]);
            $revisao = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$revisao) {
                $this->error('Revisao nao encontrada', 404);
                return;
            }

            if ($revisao['consultor_id'] != $userId) {
                $this->error('Esta revisao nao e sua', 403);
                return;
            }

            if ($revisao['status'] !== 'aguardando_relato') {
                $this->error('Revisao nao esta aguardando relato', 400);
                return;
            }

            if (strtotime($revisao['prazo_limite']) < time()) {
                $this->error('Prazo para relato expirado', 400);
                return;
            }

            $data = $this->getRequestBody();
            $relato = trim($data['relato'] ?? '');

            if (strlen($relato) < 100) {
                $this->error('Relato deve ter no minimo 100 caracteres', 400);
                return;
            }

            // Atualizar revisão
            $stmt = $this->db->prepare(
                "UPDATE revisoes_negociacao
                 SET relato_consultor = :relato, relato_enviado_em = datetime('now', 'localtime'),
                     status = 'relatado_analise', updated_at = datetime('now', 'localtime')
                 WHERE id = :id"
            );
            $stmt->execute(['relato' => $relato, 'id' => $id]);

            $this->success(null, 'Relato submetido com sucesso. Aguardando analise do admin.');
        } catch (\Throwable $e) {
            error_log("[RevisaoController] submitRelato error: " . $e->getMessage());
            $this->error('Erro ao submeter relato', 500);
        }
    }

    /**
     * Decidir sobre revisão (admin).
     * POST /api/admin/revisoes/{id}/decidir
     * Body: { decisao: "aprovar"|"rejeitar", motivo: string }
     */
    public function decidir(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            // Verificar se é admin
            $stmt = $this->db->prepare('SELECT role FROM users WHERE id = :id');
            $stmt->execute(['id' => $userId]);
            $role = $stmt->fetchColumn();

            if ($role !== 'admin') {
                $this->error('Apenas administradores podem decidir revisoes', 403);
                return;
            }

            // Buscar revisão
            $stmt = $this->db->prepare('SELECT * FROM revisoes_negociacao WHERE id = :id');
            $stmt->execute(['id' => $id]);
            $revisao = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$revisao) {
                $this->error('Revisao nao encontrada', 404);
                return;
            }

            if ($revisao['status'] !== 'relatado_analise') {
                $this->error('Revisao nao esta pendente de analise', 400);
                return;
            }

            $data = $this->getRequestBody();
            $decisao = $data['decisao'] ?? '';
            $motivo = trim($data['motivo'] ?? '');

            if (!in_array($decisao, ['aprovar', 'rejeitar'])) {
                $this->error('decisao deve ser "aprovar" ou "rejeitar"', 400);
                return;
            }

            if ($motivo === '') {
                $this->error('motivo e obrigatorio', 400);
                return;
            }

            $consultorUserId = (int) $revisao['consultor_id'];

            if ($decisao === 'aprovar') {
                // Aprovar — reativar conta
                $stmt = $this->db->prepare(
                    "UPDATE revisoes_negociacao
                     SET status = 'aprovado', motivo_decisao_admin = :motivo, decidido_por = :admin,
                         updated_at = datetime('now', 'localtime')
                     WHERE id = :id"
                );
                $stmt->execute(['motivo' => $motivo, 'admin' => $userId, 'id' => $id]);

                // Reativar consultor
                $stmt = $this->db->prepare(
                    "UPDATE consultants SET is_active = 1, disponivel = 1, estado = 'online',
                     updated_at = datetime('now', 'localtime')
                     WHERE user_id = :uid"
                );
                $stmt->execute(['uid' => $consultorUserId]);

                // Notificar
                $stmt = $this->db->prepare(
                    "INSERT INTO notifications (user_id, title, message, type, created_at)
                     VALUES (:uid, 'Revisao aprovada', 'A sua conta foi reativada. Bem-vindo de volta!', 'success', datetime('now', 'localtime'))"
                );
                $stmt->execute(['uid' => $consultorUserId]);

            } else {
                // Rejeitar — expulsar e expor
                $stmt = $this->db->prepare(
                    "UPDATE revisoes_negociacao
                     SET status = 'expulso_apos_analise', motivo_decisao_admin = :motivo, decidido_por = :admin,
                         exposto_publicamente = 1, exposto_em = datetime('now', 'localtime'),
                         updated_at = datetime('now', 'localtime')
                     WHERE id = :id"
                );
                $stmt->execute(['motivo' => $motivo, 'admin' => $userId, 'id' => $id]);

                // Bane conta
                $stmt = $this->db->prepare(
                    "UPDATE users SET status = 'temporariamente_banido', banned_at = datetime('now', 'localtime'),
                     ban_reason = :motivo, updated_at = datetime('now', 'localtime')
                     WHERE id = :uid"
                );
                $stmt->execute(['motivo' => $motivo, 'uid' => $consultorUserId]);

                // Desativa consultor
                $stmt = $this->db->prepare(
                    "UPDATE consultants SET is_active = 0, disponivel = 0, estado = 'offline',
                     updated_at = datetime('now', 'localtime')
                     WHERE user_id = :uid"
                );
                $stmt->execute(['uid' => $consultorUserId]);

                // Notificar
                $stmt = $this->db->prepare(
                    "INSERT INTO notifications (user_id, title, message, type, created_at)
                     VALUES (:uid, 'Conta suspensa', 'A sua conta foi suspensa apos analise do relato.', 'error', datetime('now', 'localtime'))"
                );
                $stmt->execute(['uid' => $consultorUserId]);
            }

            $this->success(null, 'Decisao registada com sucesso');
        } catch (\Throwable $e) {
            error_log("[RevisaoController] decidir error: " . $e->getMessage());
            $this->error('Erro ao decisir revisao', 500);
        }
    }

    /**
     * Página pública de consultores banidos.
     * GET /api/consultores-banidos (SEM autenticação)
     */
    public function listBanidos(): void
    {
        try {
            $stmt = $this->db->query(
                "SELECT r.id, r.status, r.motivo_decisao_admin, r.exposto_em,
                        u.nome as consultor_nome,
                        s.carro_id, v.marca, v.modelo
                 FROM revisoes_negociacao r
                 JOIN users u ON u.id = r.consultor_id
                 JOIN sessoes_consultoria s ON s.id = r.sessao_id
                 JOIN vehicles v ON v.id = s.carro_id
                 WHERE r.status IN ('expulso_por_silencio', 'expulso_apos_analise')
                   AND r.exposto_publicamente = 1
                 ORDER BY r.exposto_em DESC
                 LIMIT 50"
            );

            $banidos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Classificar visualmente
            foreach ($banidos as &$banido) {
                $banido['badge_cor'] = $banido['status'] === 'expulso_por_silencio' ? 'amber' : 'red';
                $banido['badge_label'] = $banido['status'] === 'expulso_por_silencio'
                    ? 'Nao submeteu relato'
                    : 'Relato rejeitado pelo admin';
            }

            $this->success($banidos);
        } catch (\Throwable $e) {
            error_log("[RevisaoController] listBanidos error: " . $e->getMessage());
            $this->error('Erro ao listar consultores banidos', 500);
        }
    }
}
