<?php
$dbPath = __DIR__ . '/database/intermedcars.sqlite';
$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$schema = file_get_contents(__DIR__ . '/database/schema.sqlite.sql');
$db->exec($schema);
echo "Schema OK\n";

$users = [
    ['Joao Silva', 'joao@intermedcars.co.ao', '+244912345678', '001234567BA045', 'Manuel Silva', 'Maria Silva', 'verificado'],
    ['Ana Rodrigues', 'ana@intermedcars.co.ao', '+244923456789', '002345678BA046', 'Carlos Rodrigues', 'Teresa Rodrigues', 'verificado'],
    ['Pedro Santos', 'pedro@intermedcars.co.ao', '+244934567890', '003456789BA047', 'Antonio Santos', 'Rosa Santos', 'verificado'],
    ['Maria Silva', 'maria@intermedcars.co.ao', '+244945678901', '004567890BA048', 'Jose Silva', 'Ana Silva', 'verificado'],
    ['Carlos Mendes', 'carlos@intermedcars.co.ao', '+244956789012', '005678901BA049', 'Francisco Mendes', 'Lucia Mendes', 'verificado'],
    ['Ebivandro Manuel', 'ebivandro@intermedcars.co.ao', '+244967890123', '006789012BA050', 'Terbio Manuel', 'Agostinho Manuel', 'verificado'],
];
$stmt = $db->prepare("INSERT INTO users (nome, email, telemovel, bi_passaporte, password_hash, nome_pai, nome_mae, status) VALUES (?, ?, ?, ?, 'hash_placeholder', ?, ?, ?)");
foreach ($users as $u) {
    $stmt->execute($u);
}
echo count($users) . " users inserted\n";

$vehicles = [
    ['carro', 'BMW', 'Serie 5 530e', 2023, 42900000.00, 'hibrido', 'automatica', 'Preto', 299, 'traseira', 15000, 'Luanda', 'BMW Serie 5 530e M Sport', 2, 'disponivel'],
    ['carro', 'Mercedes-Benz', 'Classe C 200', 2022, 38500000.00, 'gasolina', 'automatica', 'Branco', 204, 'dianteira', 22000, 'Luanda', 'Mercedes Classe C 200 AMG Line', 2, 'em_negociacao'],
    ['carro', 'Tesla', 'Model 3 Long Range', 2023, 44900000.00, 'eletrico', 'automatica', 'Vermelho', 366, 'traseira', 12000, 'Benguela', 'Tesla Model 3 LR', 4, 'disponivel'],
    ['carro', 'Audi', 'Q5 40 TDI', 2023, 49900000.00, 'diesel', 'automatica', 'Cinza', 204, 'integral', 10000, 'Lubango', 'Audi Q5 S-Line', 2, 'disponivel'],
    ['carro', 'Porsche', 'Macan S', 2022, 68900000.00, 'gasolina', 'automatica', 'Azul', 380, 'integral', 18000, 'Luanda', 'Porsche Macan S', 5, 'comprado'],
    ['carrinha', 'Volvo', 'XC60 B5', 2023, 52900000.00, 'hibrido', 'automatica', 'Prata', 250, 'integral', 8000, 'Cabinda', 'Volvo XC60 Recharge', 2, 'disponivel'],
    ['carro', 'Toyota', 'Land Cruiser 300', 2023, 75000000.00, 'diesel', 'automatica', 'Branco', 305, 'integral', 5000, 'Luanda', 'Toyota LC300', 4, 'disponivel'],
    ['carro', 'Hyundai', 'Tucson 1.6 T-GDi', 2023, 32000000.00, 'hibrido', 'automatica', 'Azul', 230, 'dianteira', 15000, 'Huambo', 'Hyundai Tucson Hybrid', 2, 'disponivel'],
];
$stmt = $db->prepare("INSERT INTO vehicles (tipo, marca, modelo, ano, preco, combustivel, caixa, cor, potencia, tracao, km, local, descricao, vendedor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($vehicles as $v) {
    $stmt->execute($v);
}
echo count($vehicles) . " vehicles inserted\n";

$db->exec("INSERT INTO transactions (vehicle_id, buyer_id, seller_id, proposed_price, status) VALUES (2, 3, 2, 37000000.00, 'proposta_aceite'), (5, 3, 5, 65000000.00, 'transacao_concluida')");
echo "2 transactions inserted\n";

$db->exec("INSERT INTO messages (sender_id, receiver_id, transaction_id, content, type) VALUES (3, 2, 1, 'Ola, tenho interesse no Mercedes', 'text'), (2, 3, 1, 'Claro! Pode avancar', 'text'), (3, 2, 1, 'Proponho 37M Kz', 'proposal'), (2, 3, 1, 'Aceito!', 'text')");
echo "4 messages inserted\n";

$db->exec("INSERT INTO notifications (user_id, title, message, type, link) VALUES (3, 'Proposta Aceite', 'Vendedor aceitou', 'success', '/cofre'), (2, 'Nova Proposta', 'Pedro fez proposta', 'info', '/chat'), (3, 'Lembrete', 'Paga comissao', 'warning', '/cofre')");
echo "3 notifications inserted\n";

echo "DONE - Database: " . $dbPath . "\n";
