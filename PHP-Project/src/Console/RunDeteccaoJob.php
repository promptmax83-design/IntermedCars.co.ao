<?php

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use IntermedCars\Services\DetecaoDesintermediacaoService;

echo "=== Job de Deteção de Desintermediação ===\n";
echo "Início: " . date('Y-m-d H:i:s') . "\n\n";

try {
    $service = new DetecaoDesintermediacaoService();
    $result = $service->analyzePattern();

    if (empty($result)) {
        echo "Nenhuma sessão sinalizada.\n";
    } else {
        echo count($result) . " sessão(ões) sinalizada(s):\n\n";
        foreach ($result as $item) {
            echo "  - Sessão #{$item['sessao_id']}: {$item['carro']}\n";
            echo "    Revisão #{$item['revisao_id']} criada\n";
            echo "    Consultor ID: {$item['consultor_id']}\n\n";
        }
    }
} catch (\Throwable $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

echo "Fim: " . date('Y-m-d H:i:s') . "\n";
