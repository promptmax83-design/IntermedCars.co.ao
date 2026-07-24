<?php
declare(strict_types=1);
$db = new PDO('sqlite:C:/Users/LENOVO/OneDrive/Documentos/Default Project/IntermedCars.co.ao/database/intermedcars.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$h = password_hash('123456', PASSWORD_DEFAULT);
$now = date('Y-m-d H:i:s');

$users = [
    ['Admin','admin@intermedcars.co.ao','911000000','BI001'],
    ['Carlos Consultor','consultor@intermedcars.co.ao','912345678','BI002'],
    ['Maria Vendedora','vendedora@intermedcars.co.ao','923456789','BI003'],
    ['Joao Comprador','comprador@intermedcars.co.ao','934567890','BI004'],
];
$s = $db->prepare("INSERT OR IGNORE INTO users (nome,email,telemovel,bi_passaporte,password_hash,nome_pai,nome_mae,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)");
foreach ($users as $u) {
    $s->execute([$u[0], $u[1], $u[2], $u[3], $h, 'N/A', 'N/A', 'verificado', $now, $now]);
}

$cid = $db->query("SELECT id FROM users WHERE email='consultor@intermedcars.co.ao'")->fetchColumn();
if ($cid) {
    $cs = $db->prepare("INSERT OR IGNORE INTO consultants (user_id,fullname,phone,rank,rating,total_deals,is_active,zone,created_at) VALUES (?,?,?,?,?,?,?,?,?)");
    $cs->execute([$cid, 'Carlos Consultor', '912345678', 'Prata', 4.50, 12, 1, 'Luanda', $now]);
}
$sid = $db->query("SELECT id FROM users WHERE email='vendedora@intermedcars.co.ao'")->fetchColumn();

$vs = [
['carro','Toyota','Corolla',2020,4500000,'Branco',35000,'automatica','gasolina',110,'dianteira','Excelente estado. Motor 1.8, ar condicionado.','Luanda',$sid],
['carro','Hyundai','Tucson',2021,8500000,'Preto',22000,'automatica','gasolina',150,'dianteira','SUV completo. Motor 2.0, teto solar.','Luanda',$sid],
['carro','Kia','Sportage',2019,6500000,'Cinza',45000,'automatica','gasolina',140,'dianteira','SUV espacoso. Motor 1.6 turbo, LED.','Luanda',$sid],
['carro','Toyota','Hilux',2018,9500000,'Branco',60000,'manual','diesel',150,'integral','Picape 4x4 diesel. Motor 2.4.','Luanda',$sid],
['carro','Nissan','Note',2017,2800000,'Vermelho',55000,'automatica','gasolina',75,'dianteira','Compacto economico. Motor 1.2.','Luanda',$sid],
['carro','Honda','Civic',2021,7200000,'Azul',18000,'automatica','gasolina',177,'dianteira','Sedan moderno. Motor 1.5 turbo.','Luanda',$sid],
['carro','Mazda','CX-5',2020,8900000,'Branco',30000,'automatica','gasolina',165,'dianteira','SUV premium. Motor 2.0, pele.','Luanda',$sid],
['carro','Volkswagen','Golf',2019,5200000,'Cinza',40000,'automatica','gasolina',150,'dianteira','Compacto alemao. Motor 1.4 TSI.','Luanda',$sid],
];

$vCols = 'tipo,marca,modelo,ano,preco,cor,km,caixa,combustivel,potencia,tracao,descricao,local,vendedor_id';
$n = 14;
$ph = implode(',', array_fill(0, $n, '?'));
$vStmt = $db->prepare("INSERT OR IGNORE INTO vehicles ($vCols,status,created_at,updated_at) VALUES ($ph,'disponivel',datetime('now','localtime'),datetime('now','localtime'))");
foreach ($vs as $v) {
    $vStmt->execute($v);
}

$uc = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
$vc = $db->query("SELECT COUNT(*) FROM vehicles")->fetchColumn();
echo "Seed OK: $uc users, $vc vehicles\n";
