<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

class SessaoService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Verificar se o utilizador pode criar sessão.
     * Apenas clientes (comprador/vendedor) podem criar.
     */
    public function canCreateSession(int $userId, int $carroId): array
    {
        // Verificar role do utilizador
        $stmt = $this->db->prepare('SELECT role FROM users WHERE id = :id');
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || $user['role'] !== 'cliente') {
            throw new \InvalidArgumentException('Apenas clientes podem criar sessoes de consultoria');
        }

        // Verificar se o carro existe
        $stmt = $this->db->prepare('SELECT id, vendedor_id, status FROM vehicles WHERE id = :id');
        $stmt->execute(['id' => $carroId]);
        $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$vehicle) {
            throw new \InvalidArgumentException('Veiculo nao encontrado');
        }

        if (!in_array($vehicle['status'], ['disponivel', 'em_negociacao'])) {
            throw new \InvalidArgumentException('Veiculo nao esta disponivel para consultoria');
        }

        return ['vehicle' => $vehicle, 'user_role' => $user['role']];
    }

    /**
     * Criar nova sessão de consultoria.
     */
    public function create(int $userId, int $carroId, string $canal = 'chat'): array
    {
        $this->canCreateSession($userId, $carroId);

        // Determinar vendedor e comprador
        $stmt = $this->db->prepare('SELECT vendedor_id FROM vehicles WHERE id = :id');
        $stmt->execute(['id' => $carroId]);
        $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);

        $vendedorId = (int) $vehicle['vendedor_id'];
        $compradorId = $userId;

        // Se o userId é o vendedor, inverter
        if ($userId === $vendedorId) {
            // Vendedor chamando — precisamos do comprador de uma negociação existente
            $stmt = $this->db->prepare('SELECT buyer_id FROM negotiations WHERE vehicle_id = :vid AND seller_id = :sid LIMIT 1');
            $stmt->execute(['vid' => $carroId, 'sid' => $userId]);
            $neg = $stmt->fetch(\PDO::FETCH_ASSOC);
            $compradorId = $neg ? (int) $neg['buyer_id'] : $userId;
        }

        // Criar sessão
        $stmt = $this->db->prepare(
            'INSERT INTO sessoes_consultoria (carro_id, comprador_id, vendedor_id, originador_id, canal, status, created_at, updated_at)
             VALUES (:carro_id, :comprador_id, :vendedor_id, :originador_id, :canal, :status, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))'
        );
        $stmt->execute([
            'carro_id' => $carroId,
            'comprador_id' => $compradorId,
            'vendedor_id' => $vendedorId,
            'originador_id' => $userId,
            'canal' => $canal,
            'status' => 'pendente',
        ]);

        $sessaoId = (int) $this->db->lastInsertId();

        // Buscar consultor mais próximo e disponível
        $consultorId = $this->findAvailableConsultant($carroId);

        if ($consultorId) {
            $stmt = $this->db->prepare(
                'UPDATE sessoes_consultoria SET consultor_id = :cid, updated_at = datetime(\'now\',\'localtime\') WHERE id = :id'
            );
            $stmt->execute(['cid' => $consultorId, 'id' => $sessaoId]);
        }

        // Buscar info da sessão criada
        return $this->getById($userId, $sessaoId);
    }

    /**
     * Encontrar consultor disponível mais próximo do veículo.
     */
    private function findAvailableConsultant(int $carroId): ?int
    {
        $stmt = $this->db->prepare(
            'SELECT c.id as consultant_id, c.user_id
             FROM consultants c
             JOIN vehicles v ON v.id = :carro_id
             WHERE c.estado = \'online\'
               AND c.disponivel = 1
               AND c.latitude IS NOT NULL
               AND c.longitude IS NOT NULL
               AND c.ultima_atividade > datetime(\'now\', \'localtime\', \'-5 minutes\')
             ORDER BY
               ABS(c.latitude - COALESCE(v.latitude, c.latitude)) +
               ABS(c.longitude - COALESCE(v.longitude, c.longitude)) ASC
             LIMIT 1'
        );
        $stmt->execute(['carro_id' => $carroId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        return $row ? (int) $row['user_id'] : null;
    }

    /**
     * Aceitar sessão (consultor).
     */
    public function aceitar(int $userId, int $sessaoId): array
    {
        // Verificar se é consultor
        $stmt = $this->db->prepare('SELECT id FROM consultants WHERE user_id = :uid');
        $stmt->execute(['uid' => $userId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$consultant) {
            throw new \InvalidArgumentException('Apenas consultores podem aceitar sessoes');
        }

        // Verificar sessão
        $stmt = $this->db->prepare('SELECT * FROM sessoes_consultoria WHERE id = :id');
        $stmt->execute(['id' => $sessaoId]);
        $sessao = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$sessao) {
            throw new \InvalidArgumentException('Sessao nao encontrada');
        }

        if ($sessao['status'] !== 'pendente') {
            throw new \InvalidArgumentException('Sessao nao esta pendente');
        }

        // Aceitar
        $stmt = $this->db->prepare(
            'UPDATE sessoes_consultoria
             SET status = \'ativa\', consultor_id = :cid, iniciada_em = datetime(\'now\',\'localtime\'), updated_at = datetime(\'now\',\'localtime\')
             WHERE id = :id'
        );
        $stmt->execute(['cid' => $userId, 'id' => $sessaoId]);

        // Atualizar estado do consultor para ocupado
        $stmt = $this->db->prepare(
            'UPDATE consultants SET estado = \'ocupado\', disponivel = 0, updated_at = datetime(\'now\',\'localtime\') WHERE user_id = :uid'
        );
        $stmt->execute(['uid' => $userId]);

        // Registrar atividade
        $this->logAtividade($sessaoId, $userId, 'sessao_aberta');

        return $this->getById($userId, $sessaoId);
    }

    /**
     * Recusar sessão (consultor).
     */
    public function recusar(int $userId, int $sessaoId, string $motivo = ''): array
    {
        $stmt = $this->db->prepare('SELECT id FROM consultants WHERE user_id = :uid');
        $stmt->execute(['uid' => $userId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$consultant) {
            throw new \InvalidArgumentException('Apenas consultores podem recusar sessoes');
        }

        $stmt = $this->db->prepare('SELECT * FROM sessoes_consultoria WHERE id = :id');
        $stmt->execute(['id' => $sessaoId]);
        $sessao = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$sessao || $sessao['status'] !== 'pendente') {
            throw new \InvalidArgumentException('Sessao nao encontrada ou nao pendente');
        }

        $stmt = $this->db->prepare(
            'UPDATE sessoes_consultoria
             SET status = \'encerrada\', motivo_encerramento = :motivo, encerrada_em = datetime(\'now\',\'localtime\'), updated_at = datetime(\'now\',\'localtime\')
             WHERE id = :id'
        );
        $stmt->execute(['motivo' => $motivo ?: 'Consultor recusou', 'id' => $sessaoId]);

        return $this->getById($userId, $sessaoId);
    }

    /**
     * Encerrar sessão (qualquer participante).
     */
    public function encerrar(int $userId, int $sessaoId, string $motivo = ''): array
    {
        $sessao = $this->getById($userId, $sessaoId);
        if (!$sessao) {
            throw new \InvalidArgumentException('Sessao nao encontrada');
        }

        $stmt = $this->db->prepare(
            'UPDATE sessoes_consultoria
             SET status = \'encerrada\', motivo_encerramento = :motivo, encerrada_em = datetime(\'now\',\'localtime\'), updated_at = datetime(\'now\',\'localtime\')
             WHERE id = :id'
        );
        $stmt->execute(['motivo' => $motivo, 'id' => $sessaoId]);

        // Liberar consultor se estava ocupado
        if ($sessao['consultor_id']) {
            $stmt = $this->db->prepare(
                'UPDATE consultants SET estado = \'online\', disponivel = 1, updated_at = datetime(\'now\',\'localtime\') WHERE user_id = :uid'
            );
            $stmt->execute(['uid' => $sessao['consultor_id']]);
        }

        $this->logAtividade($sessaoId, $userId, 'sessao_fechada');

        return $this->getById($userId, $sessaoId);
    }

    /**
     * Listar sessões do utilizador.
     */
    public function list(int $userId, ?string $statusFilter = null): array
    {
        $sql = 'SELECT s.*,
                    v.marca, v.modelo, v.ano, v.preco,
                    u_orig.nome as originador_nome,
                    u_comp.nome as comprador_nome,
                    u_vend.nome as vendedor_nome,
                    u_cons.nome as consultor_nome
                FROM sessoes_consultoria s
                JOIN vehicles v ON v.id = s.carro_id
                JOIN users u_orig ON u_orig.id = s.originador_id
                JOIN users u_comp ON u_comp.id = s.comprador_id
                JOIN users u_vend ON u_vend.id = s.vendedor_id
                LEFT JOIN users u_cons ON u_cons.id = s.consultor_id
                WHERE (s.comprador_id = :uid OR s.vendedor_id = :uid OR s.consultor_id = :uid)';

        $params = ['uid' => $userId];

        if ($statusFilter) {
            $sql .= ' AND s.status = :status';
            $params['status'] = $statusFilter;
        }

        $sql .= ' ORDER BY s.created_at DESC LIMIT 50';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Obter detalhe da sessão.
     */
    public function getById(int $userId, int $sessaoId): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT s.*,
                v.marca, v.modelo, v.ano, v.preco, v.foto as vehicle_foto,
                u_orig.nome as originador_nome,
                u_comp.nome as comprador_nome,
                u_vend.nome as vendedor_nome,
                u_cons.nome as consultor_nome
            FROM sessoes_consultoria s
            JOIN vehicles v ON v.id = s.carro_id
            JOIN users u_orig ON u_orig.id = s.originador_id
            JOIN users u_comp ON u_comp.id = s.comprador_id
            JOIN users u_vend ON u_vend.id = s.vendedor_id
            LEFT JOIN users u_cons ON u_cons.id = s.consultor_id
            WHERE s.id = :id'
        );
        $stmt->execute(['id' => $sessaoId]);
        $sessao = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$sessao) {
            return null;
        }

        // Verificar se o utilizador é participante
        $isParticipant = in_array((int)$userId, [
            (int)$sessao['comprador_id'],
            (int)$sessao['vendedor_id'],
            (int)$sessao['consultor_id'],
        ]);

        if (!$isParticipant) {
            throw new \InvalidArgumentException('Nao tem acesso a esta sessao');
        }

        return $sessao;
    }

    /**
     * Registrar atividade na sessão.
     */
    public function logAtividade(int $sessaoId, int $userId, string $tipoAtividade, ?string $metadata = null): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO sessao_atividades (sessao_id, user_id, tipo_atividade, metadata_json, created_at)
             VALUES (:sid, :uid, :tipo, :meta, datetime(\'now\',\'localtime\'))'
        );
        $stmt->execute([
            'sid' => $sessaoId,
            'uid' => $userId,
            'tipo' => $tipoAtividade,
            'meta' => $metadata,
        ]);
    }

    /**
     * Auto-expirar sessões pendentes (>5min) e inativas (>30min).
     */
    public function expireSessions(): array
    {
        // Expitar pendentes > 5 minutos
        $stmt = $this->db->prepare(
            'UPDATE sessoes_consultoria SET status = \'expirada\', updated_at = datetime(\'now\',\'localtime\')
             WHERE status = \'pendente\' AND created_at < datetime(\'now\',\'localtime\',\'-5 minutes\')'
        );
        $stmt->execute();
        $pendentes = $stmt->rowCount();

        // Expitar ativas sem atividade > 30 minutos
        $stmt = $this->db->prepare(
            'UPDATE sessoes_consultoria SET status = \'expirada\', encerrada_em = datetime(\'now\',\'localtime\'), updated_at = datetime(\'now\',\'localtime\')
             WHERE status = \'ativa\' AND updated_at < datetime(\'now\',\'localtime\',\'-30 minutes\')'
        );
        $stmt->execute();
        $inativas = $stmt->rowCount();

        return ['pendentes_expiradas' => $pendentes, 'inativas_expiradas' => $inativas];
    }
}
