<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Database\Database;

class LocationController extends BaseController
{
    protected \PDO $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = Database::getConnection();
    }

    public function updateMyLocation(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        $consultant = $this->getConsultantByUserId($userId);
        if (!$consultant) {
            $this->error('Consultor nao encontrado', 404);
            return;
        }

        $ultima = $consultant['ultima_atividade'];
        if ($ultima) {
            $diff = time() - strtotime($ultima);
            if ($diff < 10) {
                $this->error('Aguarde antes de atualizar novamente', 429);
                return;
            }
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $lat = $data['latitude'] ?? null;
        $lng = $data['longitude'] ?? null;

        if ($lat === null || $lng === null) {
            $this->error('latitude e longitude sao obrigatorios', 400);
            return;
        }
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            $this->error('Coordenadas invalidas', 400);
            return;
        }

        $sql = "UPDATE consultants SET 
            latitude = :lat, longitude = :lng,
            provincia = COALESCE(:prov, provincia),
            municipio = COALESCE(:mun, municipio),
            bairro = COALESCE(:bai, bairro),
            ultima_atividade = datetime('now','localtime')
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'lat' => $lat, 'lng' => $lng,
            'prov' => $data['provincia'] ?? null,
            'mun' => $data['municipio'] ?? null,
            'bai' => $data['bairro'] ?? null,
            'id' => $consultant['id'],
        ]);

        $this->success(['message' => 'Localizacao atualizada']);
    }

    public function updateMyStatus(): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        $consultant = $this->getConsultantByUserId($userId);
        if (!$consultant) {
            $this->error('Consultor nao encontrado', 404);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $estado = $data['estado'] ?? 'offline';

        $validStates = ['online', 'offline', 'ocupado', 'ausente'];
        if (!in_array($estado, $validStates, true)) {
            $this->error('Estado invalido. Valores: ' . implode(', ', $validStates), 400);
            return;
        }

        $sql = "UPDATE consultants SET estado = :estado, ultima_atividade = datetime('now','localtime') WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['estado' => $estado, 'id' => $consultant['id']]);

        $this->success(['estado' => $estado]);
    }

    public function findNearby(): void
    {
        $lat = isset($_GET['lat']) ? (float) $_GET['lat'] : null;
        $lng = isset($_GET['lng']) ? (float) $_GET['lng'] : null;
        $radius = isset($_GET['radius']) ? (float) $_GET['radius'] : 15.0;

        if ($lat === null || $lng === null) {
            $this->error('Parametros lat e lng sao obrigatorios', 400);
            return;
        }

        $radius = min($radius, 50);

        $sql = "SELECT *,
            (6371 * acos(
                cos(:lat * 0.0174532925) * cos(latitude * 0.0174532925) *
                cos((longitude * 0.0174532925) - (:lng * 0.0174532925)) +
                sin(:lat2 * 0.0174532925) * sin(latitude * 0.0174532925)
            )) AS distancia_km
            FROM consultants
            WHERE estado = 'online'
            AND disponivel = 1
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND ultima_atividade > datetime('now', 'localtime', '-5 minutes')
            HAVING distancia_km <= :radius
            ORDER BY distancia_km ASC
            LIMIT 50";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'lat' => $lat, 'lng' => $lng, 'lat2' => $lat, 'radius' => $radius,
        ]);

        $this->success($stmt->fetchAll(\PDO::FETCH_ASSOC));
    }

    public function findNearbyForVehicle(int $vehicleId): void
    {
        $stmt = $this->db->prepare('SELECT latitude, longitude FROM vehicles WHERE id = :id');
        $stmt->execute(['id' => $vehicleId]);
        $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$vehicle || !$vehicle['latitude'] || !$vehicle['longitude']) {
            $this->findNearby();
            return;
        }

        $lat = (float) $vehicle['latitude'];
        $lng = (float) $vehicle['longitude'];
        $radius = isset($_GET['radius']) ? min((float) $_GET['radius'], 50) : 15.0;

        $sql = "SELECT *,
            (6371 * acos(
                cos(:lat * 0.0174532925) * cos(latitude * 0.0174532925) *
                cos((longitude * 0.0174532925) - (:lng * 0.0174532925)) +
                sin(:lat2 * 0.0174532925) * sin(latitude * 0.0174532925)
            )) AS distancia_km
            FROM consultants
            WHERE estado = 'online'
            AND disponivel = 1
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND ultima_atividade > datetime('now', 'localtime', '-5 minutes')
            HAVING distancia_km <= :radius
            ORDER BY distancia_km ASC
            LIMIT 20";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['lat' => $lat, 'lng' => $lng, 'lat2' => $lat, 'radius' => $radius]);

        $this->success($stmt->fetchAll(\PDO::FETCH_ASSOC));
    }

    public function getConsultantLocation(int $consultantId): void
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            $this->error('Nao autenticado', 401);
            return;
        }

        $sql = "SELECT s.id FROM sessoes_consultoria s 
                WHERE s.consultor_id = :consultor_id 
                AND s.status = 'ativa'
                AND (s.comprador_id = :uid OR s.vendedor_id = :uid)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['consultor_id' => $consultantId, 'uid' => $userId]);
        $hasSession = $stmt->fetch();

        if (!$hasSession) {
            $this->error('Sem acesso a localizacao deste consultor', 403);
            return;
        }

        $stmt2 = $this->db->prepare(
            'SELECT latitude, longitude, ultima_atividade FROM consultants WHERE id = :id'
        );
        $stmt2->execute(['id' => $consultantId]);
        $consultant = $stmt2->fetch(\PDO::FETCH_ASSOC);

        if (!$consultant) {
            $this->error('Consultor nao encontrado', 404);
            return;
        }

        $this->success([
            'latitude' => $consultant['latitude'],
            'longitude' => $consultant['longitude'],
            'ultima_atividade' => $consultant['ultima_atividade'],
        ]);
    }

    private function getConsultantByUserId(int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM consultants WHERE user_id = :uid');
        $stmt->execute(['uid' => $userId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ?: null;
    }
}
