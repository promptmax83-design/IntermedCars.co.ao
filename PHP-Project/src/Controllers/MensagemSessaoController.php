<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Database\Database;
use IntermedCars\Services\SessaoService;

class MensagemSessaoController extends BaseController
{
    private SessaoService $sessaoService;

    public function __construct()
    {
        parent::__construct();
        $this->sessaoService = new SessaoService();
    }

    /**
     * Enviar mensagem de texto numa sessão.
     */
    public function sendText(int $sessaoId): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            // Verificar acesso à sessão
            $sessao = $this->sessaoService->getById($userId, $sessaoId);
            if (!$sessao) {
                $this->error('Sessao nao encontrada', 404);
                return;
            }

            if ($sessao['status'] !== 'ativa') {
                $this->error('Sessao nao esta ativa', 400);
                return;
            }

            $data = $this->getRequestBody();
            $conteudo = trim($data['conteudo'] ?? '');

            if ($conteudo === '') {
                $this->error(' conteudo da mensagem e obrigatorio', 400);
                return;
            }

            // Inserir mensagem
            $stmt = $this->db->prepare(
                'INSERT INTO mensagens (carro_id, sessao_id, remetente_id, tipo, conteudo, created_at)
                 VALUES (:carro_id, :sessao_id, :remetente_id, :tipo, :conteudo, datetime(\'now\',\'localtime\'))'
            );
            $stmt->execute([
                'carro_id' => $sessao['carro_id'],
                'sessao_id' => $sessaoId,
                'remetente_id' => $userId,
                'tipo' => 'texto',
                'conteudo' => $conteudo,
            ]);

            $mensagemId = (int) $this->db->lastInsertId();

            // Atualizar updated_at da sessão
            $stmt = $this->db->prepare(
                'UPDATE sessoes_consultoria SET updated_at = datetime(\'now\',\'localtime\') WHERE id = :id'
            );
            $stmt->execute(['id' => $sessaoId]);

            // Log de atividade
            $this->sessaoService->logAtividade($sessaoId, $userId, 'mensagem_enviada', json_encode(['mensagem_id' => $mensagemId]));

            // Buscar mensagem criada
            $stmt = $this->db->prepare(
                'SELECT m.*, u.nome as remetente_nome, u.role as remetente_role
                 FROM mensagens m
                 JOIN users u ON u.id = m.remetente_id
                 WHERE m.id = :id'
            );
            $stmt->execute(['id' => $mensagemId]);
            $mensagem = $stmt->fetch(\PDO::FETCH_ASSOC);

            $this->success($mensagem, 'Mensagem enviada');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[MensagemSessaoController] sendText error: " . $e->getMessage());
            $this->error('Erro ao enviar mensagem', 500);
        }
    }

    /**
     * Enviar áudio gravado.
     */
    public function sendAudio(int $sessaoId): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $sessao = $this->sessaoService->getById($userId, $sessaoId);
            if (!$sessao) {
                $this->error('Sessao nao encontrada', 404);
                return;
            }

            if ($sessao['status'] !== 'ativa') {
                $this->error('Sessao nao esta ativa', 400);
                return;
            }

            if (!isset($_FILES['audio'])) {
                $this->error('Ficheiro de audio e obrigatorio', 400);
                return;
            }

            $file = $_FILES['audio'];
            $duracao = (int) ($_POST['duracao'] ?? 0);

            // Validar tipo
            $allowed = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav'];
            if (!in_array($file['type'], $allowed)) {
                $this->error('Tipo de audio nao suportado', 400);
                return;
            }

            // Guardar ficheiro
            $dir = __DIR__ . '/../../storage/audio/' . $sessao['carro_id'];
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $filename = 'audio_' . time() . '_' . $userId . '.webm';
            $filepath = $dir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                $this->error('Erro ao guardar audio', 500);
                return;
            }

            $audioPath = '/storage/audio/' . $sessao['carro_id'] . '/' . $filename;

            // Inserir mensagem
            $stmt = $this->db->prepare(
                'INSERT INTO mensagens (carro_id, sessao_id, remetente_id, tipo, audio_path, audio_duracao_segundos, created_at)
                 VALUES (:carro_id, :sessao_id, :remetente_id, :tipo, :audio_path, :duracao, datetime(\'now\',\'localtime\'))'
            );
            $stmt->execute([
                'carro_id' => $sessao['carro_id'],
                'sessao_id' => $sessaoId,
                'remetente_id' => $userId,
                'tipo' => 'audio',
                'audio_path' => $audioPath,
                'duracao' => $duracao,
            ]);

            $mensagemId = (int) $this->db->lastInsertId();

            // Atualizar sessão
            $stmt = $this->db->prepare(
                'UPDATE sessoes_consultoria SET updated_at = datetime(\'now\',\'localtime\') WHERE id = :id'
            );
            $stmt->execute(['id' => $sessaoId]);

            $this->sessaoService->logAtividade($sessaoId, $userId, 'mensagem_enviada', json_encode(['mensagem_id' => $mensagemId, 'tipo' => 'audio']));

            $stmt = $this->db->prepare(
                'SELECT m.*, u.nome as remetente_nome, u.role as remetente_role
                 FROM mensagens m JOIN users u ON u.id = m.remetente_id
                 WHERE m.id = :id'
            );
            $stmt->execute(['id' => $mensagemId]);
            $mensagem = $stmt->fetch(\PDO::FETCH_ASSOC);

            $this->success($mensagem, 'Audio enviado');
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            error_log("[MensagemSessaoController] sendAudio error: " . $e->getMessage());
            $this->error('Erro ao enviar audio', 500);
        }
    }

    /**
     * Obter histórico completo de mensagens do CARRO.
     */
    public function getMessages(int $sessaoId): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        try {
            $sessao = $this->sessaoService->getById($userId, $sessaoId);
            if (!$sessao) {
                $this->error('Sessao nao encontrada', 404);
                return;
            }

            $limit = min((int) ($this->getQueryParam('limit') ?? 50), 100);
            $offset = (int) ($this->getQueryParam('offset') ?? 0);

            // Buscar TODAS as mensagens do carro (não apenas da sessão)
            $stmt = $this->db->prepare(
                'SELECT m.*, u.nome as remetente_nome, u.role as remetente_role,
                        s.status as sessao_status
                 FROM mensagens m
                 JOIN users u ON u.id = m.remetente_id
                 LEFT JOIN sessoes_consultoria s ON s.id = m.sessao_id
                 WHERE m.carro_id = :carro_id
                 ORDER BY m.created_at ASC
                 LIMIT :limit OFFSET :offset'
            );
            $stmt->bindValue(':carro_id', $sessao['carro_id'], \PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            $stmt->execute();
            $mensagens = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Contar total
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) as total FROM mensagens WHERE carro_id = :carro_id'
            );
            $stmt->execute(['carro_id' => $sessao['carro_id']]);
            $total = (int) $stmt->fetchColumn();

            $this->success([
                'mensagens' => $mensagens,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
            ]);
        } catch (\InvalidArgumentException $e) {
            $this->error($e->getMessage(), 403);
        } catch (\Throwable $e) {
            error_log("[MensagemSessaoController] getMessages error: " . $e->getMessage());
            $this->error('Erro ao buscar mensagens', 500);
        }
    }

    /**
     * Sinalizar mensagem (consultor).
     */
    public function flagMessage(int $mensagemId): void
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
                $this->error('Apenas consultores podem sinalizar mensagens', 403);
                return;
            }

            $data = $this->getRequestBody();
            $motivo = $data['motivo'] ?? '';

            if ($motivo === '') {
                $this->error('Motivo da sinalizacao e obrigatorio', 400);
                return;
            }

            $stmt = $this->db->prepare(
                'UPDATE mensagens SET is_flagged = 1, flag_reason = :motivo, flag_by = :uid WHERE id = :id'
            );
            $stmt->execute(['motivo' => $motivo, 'uid' => $userId, 'id' => $mensagemId]);

            if ($stmt->rowCount() === 0) {
                $this->error('Mensagem nao encontrada', 404);
                return;
            }

            $this->success(null, 'Mensagem sinalizada com sucesso');
        } catch (\Throwable $e) {
            error_log("[MensagemSessaoController] flagMessage error: " . $e->getMessage());
            $this->error('Erro ao sinalizar mensagem', 500);
        }
    }
}
