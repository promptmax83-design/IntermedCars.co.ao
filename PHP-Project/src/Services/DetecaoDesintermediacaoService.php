<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

/**
 * Serviço de deteção automática de desintermediação.
 * Cruza silêncio das 3 partes + carro removido do mapa.
 */
class DetecaoDesintermediacaoService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Analisar padrão de desintermediação em todas as sessões encerradas.
     * Gatilho: silêncio de 72h + carro removido + sem negociação formal.
     * Retorna lista de sessões sinalizadas.
     */
    public function analyzePattern(): array
    {
        $flagged = [];

        // 1. Buscar sessões encerradas há 72h+ onde o carro foi removido
        $stmt = $this->db->query(
            "SELECT s.id, s.carro_id, s.comprador_id, s.vendedor_id, s.consultor_id, s.encerrada_em,
                    v.status as vehicle_status, v.marca, v.modelo
             FROM sessoes_consultoria s
             JOIN vehicles v ON v.id = s.carro_id
             WHERE s.status = 'encerrada'
               AND s.consultor_id IS NOT NULL
               AND s.encerrada_em < datetime('now', 'localtime', '-72 hours')
               AND v.status IN ('comprado', 'cancelado')"
        );

        $candidates = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($candidates as $sessao) {
            // 2. Verificar se NÃO existe negociação formal
            $stmt = $this->db->prepare(
                "SELECT COUNT(*) FROM negotiations 
                 WHERE vehicle_id = :vid 
                 AND status IN ('aguardando_vistoria', 'vistoriado', 'aguardando_pagamento_taxas', 'taxas_pagas', 'concluido')"
            );
            $stmt->execute(['vid' => $sessao['carro_id']]);
            $hasNegotiation = (int) $stmt->fetchColumn() > 0;

            if ($hasNegotiation) {
                continue; // Negócio formal existe — não é desintermediação
            }

            // 3. Verificar se já existe revisão para esta sessão
            $stmt = $this->db->prepare(
                "SELECT COUNT(*) FROM revisoes_negociacao WHERE sessao_id = :sid"
            );
            $stmt->execute(['sid' => $sessao['id']]);
            $alreadyReviewed = (int) $stmt->fetchColumn() > 0;

            if ($alreadyReviewed) {
                continue; // Já sinalizada
            }

            // 4. Verificar se houve atividade das 3 partes na sessão
            $stmt = $this->db->prepare(
                "SELECT COUNT(DISTINCT user_id) FROM sessao_atividades WHERE sessao_id = :sid"
            );
            $stmt->execute(['sid' => $sessao['id']]);
            $participantes = (int) $stmt->fetchColumn();

            if ($participantes < 3) {
                continue; // Não houve interação das 3 partes — não é suspeito
            }

            // 5. Padrão suspeito confirmado → criar revisão
            $revisaoId = $this->flagSession((int) $sessao['id']);
            $flagged[] = [
                'sessao_id' => $sessao['id'],
                'revisao_id' => $revisaoId,
                'carro' => $sessao['marca'] . ' ' . $sessao['modelo'],
                'consultor_id' => $sessao['consultor_id'],
            ];
        }

        return $flagged;
    }

    /**
     * Sinalizar sessão e criar revisão.
     * - Cria revisoes_negociacao com status 'aguardando_relato'
     * - prazo_limite = now + 2 dias
     * - Restringe conta do consultor
     */
    public function flagSession(int $sessaoId): int
    {
        // Buscar sessão
        $stmt = $this->db->prepare(
            "SELECT * FROM sessoes_consultoria WHERE id = :id"
        );
        $stmt->execute(['id' => $sessaoId]);
        $sessao = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$sessao || !$sessao['consultor_id']) {
            throw new \InvalidArgumentException('Sessao invalida ou sem consultor');
        }

        $consultorUserId = (int) $sessao['consultor_id'];

        // Criar revisão
        $stmt = $this->db->prepare(
            "INSERT INTO revisoes_negociacao (sessao_id, consultor_id, prazo_limite, status, created_at, updated_at)
             VALUES (:sid, :cid, datetime('now', 'localtime', '+2 days'), 'aguardando_relato', datetime('now', 'localtime'), datetime('now', 'localtime'))"
        );
        $stmt->execute([
            'sid' => $sessaoId,
            'cid' => $consultorUserId,
        ]);

        $revisaoId = (int) $this->db->lastInsertId();

        // Restringir conta do consultor (temporariamente)
        $stmt = $this->db->prepare(
            "UPDATE consultants SET is_active = 0, disponivel = 0, updated_at = datetime('now', 'localtime')
             WHERE user_id = :uid"
        );
        $stmt->execute(['uid' => $consultorUserId]);

        // Notificar consultor
        $stmt = $this->db->prepare(
            "INSERT INTO notifications (user_id, title, message, type, link, created_at)
             VALUES (:uid, :title, :msg, 'warning', :link, datetime('now', 'localtime'))"
        );
        $stmt->execute([
            'uid' => $consultorUserId,
            'title' => 'Sessao sinalizada',
            'msg' => 'Uma sessao foi sinalizada por padrao suspeito. Tem 2 dias para submeter relato.',
            'link' => '/consultor/pedidos',
        ]);

        return $revisaoId;
    }

    /**
     * Processar prazos expirados (expulsão por silêncio).
     * Executar via cron diário.
     */
    public function processExpiredDeadlines(): int
    {
        // Buscar revisões com prazo vencido e sem relato
        $stmt = $this->db->query(
            "SELECT r.id, r.consultor_id, r.sessao_id
             FROM revisoes_negociacao r
             WHERE r.status = 'aguardando_relato'
               AND r.prazo_limite < datetime('now', 'localtime')"
        );

        $expired = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $expulsos = 0;

        foreach ($expired as $revisao) {
            $this->expulseConsultant(
                (int) $revisao['id'],
                (int) $revisao['consultor_id'],
                'expulso_por_silencio',
                'Nao submeteu relato dentro do prazo de 2 dias'
            );
            $expulsos++;
        }

        return $expulsos;
    }

    /**
     * Expulsar consultor e expor publicamente.
     */
    private function expulseConsultant(int $revisaoId, int $consultorUserId, string $status, string $motivo): void
    {
        // Atualizar revisão
        $stmt = $this->db->prepare(
            "UPDATE revisoes_negociacao
             SET status = :status, motivo_decisao_admin = :motivo, 
                 exposto_publicamente = 1, exposto_em = datetime('now', 'localtime'),
                 updated_at = datetime('now', 'localtime')
             WHERE id = :id"
        );
        $stmt->execute(['status' => $status, 'motivo' => $motivo, 'id' => $revisaoId]);

        // Bane a conta do utilizador
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

        // Notificar por email
        $stmt = $this->db->prepare(
            "INSERT INTO notifications (user_id, title, message, type, created_at)
             VALUES (:uid, 'Conta suspensa', :msg, 'error', datetime('now', 'localtime'))"
        );
        $stmt->execute([
            'uid' => $consultorUserId,
            'msg' => 'A sua conta foi suspensa por nao submeter relato dentro do prazo.',
        ]);
    }
}
