<?php

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use IntermedCars\Services\DetecaoDesintermediacaoService;

echo "=== Job Periódico de Deteção (a cada 6h) ===\n";
echo "Início: " . date('Y-m-d H:i:s') . "\n\n";

try {
    $service = new DetecaoDesintermediacaoService();
    $result = $service->analyzePattern();

    if (empty($result)) {
        echo "Nenhuma desintermediação detetada.\n";
    } else {
        echo count($result) . " caso(s) de desintermediação detetado(s):\n";
        foreach ($result as $item) {
            echo "  - Sessão #{$item['sessao_id']} ({$item['carro']}) → Revisão #{$item['revisao_id']}\n";
        }
    }
} catch (\Throwable $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nFim: " . date('Y-m-d H:i:s') . "\n";
