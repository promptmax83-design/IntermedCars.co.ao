<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Database\Database;

class SolicitacaoController extends BaseController
{
    protected \PDO $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = Database::getConnection();
    }

    public function create(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $veiculoId = (int) ($data['veiculo_id'] ?? 0);
        $consultorId = (int) ($data['consultor_id'] ?? 0);
        $latCliente = $data['latitude_cliente'] ?? null;
        $lngCliente = $data['longitude_cliente'] ?? null;

        if (!$veiculoId || !$consultorId) {
            $this->error('veiculo_id e consultor_id sao obrigatorios', 400);
            return;
        }

        $stmt = $this->db->prepare('SELECT id, latitude, longitude FROM vehicles WHERE id = :id');
        $stmt->execute(['id' => $veiculoId]);
        $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$vehicle) {
            $this->error('Veiculo nao encontrado', 404);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM consultants WHERE id = :id');
        $stmt->execute(['id' => $consultorId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$consultant) {
            $this->error('Consultor nao encontrado', 404);
            return;
        }
        if ($consultant['estado'] !== 'online' || $consultant['disponivel'] != 1) {
            $this->error('Consultor nao esta disponivel no momento', 400);
            return;
        }

        $distancia = null;
        if ($vehicle['latitude'] && $vehicle['longitude'] && $consultant['latitude'] && $consultant['longitude']) {
            $distancia = $this->haversine(
                (float) $vehicle['latitude'], (float) $vehicle['longitude'],
                (float) $consultant['latitude'], (float) $consultant['longitude']
            );
        }

        $sql = "INSERT INTO solicitacoes 
            (veiculo_id, utilizador_id, consultor_id, 
             latitude_veiculo, longitude_veiculo,
             latitude_cliente, longitude_cliente,
             mensagem, distancia_km, estado, criado_em)
            VALUES (:vid, :uid, :cid, :latv, :lngv, :latc, :lngc, :msg, :dist, 'pendente', datetime('now','localtime'))";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'vid' => $veiculoId, 'uid' => $userId, 'cid' => $consultorId,
            'latv' => $vehicle['latitude'], 'lngv' => $vehicle['longitude'],
            'latc' => $latCliente, 'lngc' => $lngCliente,
            'msg' => $data['mensagem'] ?? null, 'dist' => $distancia,
        ]);

        $solicitacaoId = (int) $this->db->lastInsertId();

        $this->db->prepare("INSERT INTO notification_logs (user_id, channel, recipient, event, status, created_at) VALUES (:uid, 'in_app', :rec, :evt, 'enviado', datetime('now','localtime'))")
            ->execute([
                'uid' => $consultant['user_id'],
                'rec' => "consultor_{$consultorId}",
                'evt' => "Nova solicitacao - Distancia: " . ($distancia ? round($distancia, 1) . "km" : "N/D"),
            ]);

        $this->success([
            'id' => $solicitacaoId,
            'distancia_km' => $distancia,
            'message' => 'Solicitacao enviada com sucesso',
        ], 201);
    }

    public function mySolicitacoes(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        $stmt = $this->db->prepare('SELECT id FROM consultants WHERE user_id = :uid');
        $stmt->execute(['uid' => $userId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$consultant) {
            $this->error('Consultor nao encontrado', 404);
            return;
        }

        $sql = "SELECT s.*, 
                u.nome as utilizador_nome, u.telemovel as utilizador_telefone,
                v.marca as veiculo_marca, v.modelo as veiculo_modelo, 
                v.ano as veiculo_ano, v.preco as veiculo_preco, v.local as veiculo_local
                FROM solicitacoes s
                JOIN users u ON u.id = s.utilizador_id
                JOIN vehicles v ON v.id = s.veiculo_id
                WHERE s.consultor_id = :cid
                ORDER BY s.criado_em DESC LIMIT 50";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['cid' => $consultant['id']]);
        $this->success($stmt->fetchAll(\PDO::FETCH_ASSOC));
    }

    public function aceitar(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) { $this->error('Nao autenticado', 401); return; }

        $stmt = $this->db->prepare('SELECT id FROM consultants WHERE user_id = :uid');
        $stmt->execute(['uid' => $userId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$consultant) { $this->error('Consultor nao encontrado', 404); return; }

        $stmt = $this->db->prepare('SELECT * FROM solicitacoes WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $solicitacao = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$solicitacao || $solicitacao['consultor_id'] != $consultant['id']) {
            $this->error('Solicitacao nao encontrada', 404); return;
        }
        if ($solicitacao['estado'] !== 'pendente') {
            $this->error('Solicitacao ja foi processada', 400); return;
        }

        $this->db->prepare("UPDATE solicitacoes SET estado = 'aceite', respondido_em = datetime('now','localtime'), atualizado_em = datetime('now','localtime') WHERE id = :id")
            ->execute(['id' => $id]);

        $this->db->prepare("UPDATE consultants SET estado = 'ocupado', ultima_atividade = datetime('now','localtime') WHERE id = :id")
            ->execute(['id' => $consultant['id']]);

        $this->success(['message' => 'Solicitacao aceite']);
    }

    public function recusar(int $id): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) { $this->error('Nao autenticado', 401); return; }

        $stmt = $this->db->prepare('SELECT id FROM consultants WHERE user_id = :uid');
        $stmt->execute(['uid' => $userId]);
        $consultant = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$consultant) { $this->error('Consultor nao encontrado', 404); return; }

        $stmt = $this->db->prepare('SELECT * FROM solicitacoes WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $solicitacao = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$solicitacao || $solicitacao['consultor_id'] != $consultant['id']) {
            $this->error('Solicitacao nao encontrada', 404); return;
        }

        $this->db->prepare("UPDATE solicitacoes SET estado = 'recusado', respondido_em = datetime('now','localtime'), atualizado_em = datetime('now','localtime') WHERE id = :id")
            ->execute(['id' => $id]);

        $this->success(['message' => 'Solicitacao recusada']);
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 2);
    }
}
