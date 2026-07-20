<?php

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use IntermedCars\Services\SessaoService;
use IntermedCars\Services\DetecaoDesintermediacaoService;

echo "=== Job de Expiração e Silêncio ===\n";
echo "Início: " . date('Y-m-d H:i:s') . "\n\n";

// 1. Expirar sessões
echo "--- Expirar Sessões ---\n";
try {
    $sessaoService = new SessaoService();
    $result = $sessaoService->expireSessions();
    echo "  Pendentes expiradas: {$result['pendentes_expiradas']}\n";
    echo "  Inativas expiradas: {$result['inativas_expiradas']}\n\n";
} catch (\Throwable $e) {
    echo "ERRO ao expirar sessões: " . $e->getMessage() . "\n\n";
}

// 2. Processar prazos expirados
echo "--- Processar Prazos de Relato ---\n";
try {
    $detecaoService = new DetecaoDesintermediacaoService();
    $expulsos = $detecaoService->processExpiredDeadlines();
    echo "  Consultores expulsos por silêncio: {$expulsos}\n\n";
} catch (\Throwable $e) {
    echo "ERRO ao processar prazos: " . $e->getMessage() . "\n\n";
}

echo "Fim: " . date('Y-m-d H:i:s') . "\n";
