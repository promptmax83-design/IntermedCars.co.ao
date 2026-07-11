-- IntermedCars Seed Data
-- Version: 1.0.0
-- Date: 2026-07-11

SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Users (password: 12345678 for all)
-- --------------------------------------------------------
INSERT INTO `users` (`nome`, `email`, `telemovel`, `bi_passaporte`, `password_hash`, `nome_pai`, `nome_mae`, `status`) VALUES
('Joao Silva', 'joao@intermedcars.co.ao', '+244912345678', '001234567BA045', '$argon2id$v=19$m=65536,t=4,p=1$c29tZXNhbHRzZXJpYWw$placeholder', 'Manuel Silva', 'Maria Silva', 'verificado'),
('Ana Rodrigues', 'ana@intermedcars.co.ao', '+244923456789', '002345678BA046', '$argon2id$v=19$m=65536,t=4,p=1$c29tZXNhbHRzZXJpYWw$placeholder', 'Carlos Rodrigues', 'Teresa Rodrigues', 'verificado'),
('Pedro Santos', 'pedro@intermedcars.co.ao', '+244934567890', '003456789BA047', '$argon2id$v=19$m=65536,t=4,p=1$c29tZXNhbHRzZXJpYWw$placeholder', 'Antonio Santos', 'Rosa Santos', 'verificado'),
('Maria Silva', 'maria@intermedcars.co.ao', '+244945678901', '004567890BA048', '$argon2id$v=19$m=65536,t=4,p=1$c29tZXNhbHRzZXJpYWw$placeholder', 'Jose Silva', 'Ana Silva', 'verificado'),
('Carlos Mendes', 'carlos@intermedcars.co.ao', '+244956789012', '005678901BA049', '$argon2id$v=19$m=65536,t=4,p=1$c29tZXNhbHRzZXJpYWw$placeholder', 'Francisco Mendes', 'Lucia Mendes', 'verificado'),
('Ebivandro Manuel', 'ebivandro@intermedcars.co.ao', '+244967890123', '006789012BA050', '$argon2id$v=19$m=65536,t=4,p=1$c29tZXNhbHRzZXJpYWw$placeholder', 'Terbio Manuel', 'Agostinho Manuel', 'verificado');

-- --------------------------------------------------------
-- Vehicles
-- --------------------------------------------------------
INSERT INTO `vehicles` (`tipo`, `marca`, `modelo`, `ano`, `preco`, `combustivel`, `caixa`, `cor`, `potencia`, `tracao`, `km`, `local`, `descricao`, `vendedor_id`, `status`) VALUES
('carro', 'BMW', 'Serie 5 530e', 2023, 42900000.00, 'hibrido', 'automatica', 'Preto', 299, 'traseira', 15000, 'Luanda', 'BMW Serie 5 530e M Sport. Veiculo em excelente estado, revisoes em dia.', 2, 'disponivel'),
('carro', 'Mercedes-Benz', 'Classe C 200', 2022, 38500000.00, 'gasolina', 'automatica', 'Branco', 204, 'dianteira', 22000, 'Luanda', 'Mercedes Classe C 200 AMG Line. Interior em couro, teto panoramico.', 2, 'em_negociacao'),
('carro', 'Tesla', 'Model 3 Long Range', 2023, 44900000.00, 'eletrico', 'automatica', 'Vermelho', 366, 'traseira', 12000, 'Benguela', 'Tesla Model 3 LR. Autonomia 602km, autopilot.', 4, 'disponivel'),
('carro', 'Audi', 'Q5 40 TDI', 2023, 49900000.00, 'diesel', 'automatica', 'Cinza', 204, 'quatro', 10000, 'Lubango', 'Audi Q5 S-Line. Quatro rodas, camera 360.', 2, 'disponivel'),
('carro', 'Porsche', 'Macan S', 2022, 68900000.00, 'gasolina', 'automatica', 'Azul', 380, 'quatro', 18000, 'Luanda', 'Porsche Macan S. Desportivo, performance superior.', 5, 'comprado'),
('carrinha', 'Volvo', 'XC60 B5', 2023, 52900000.00, 'hibrido', 'automatica', 'Prata', 250, 'quatro', 8000, 'Cabinda', 'Volvo XC60 Recharge. Seguranca 5 estrelas, familiar.', 2, 'disponivel'),
('carro', 'Toyota', 'Land Cruiser 300', 2023, 75000000.00, 'diesel', 'automatica', 'Branco', 305, 'quatro', 5000, 'Luanda', 'Toyota LC300. Ideal para terreno, topo de gama.', 4, 'disponivel'),
('carro', 'Hyundai', 'Tucson 1.6 T-GDi', 2023, 32000000.00, 'hibrido', 'automatica', 'Azul', 230, 'dianteira', 15000, 'Huambo', 'Hyundai Tucson Hybrid. Moderno, economico.', 2, 'disponivel');

-- --------------------------------------------------------
-- Sample transactions
-- --------------------------------------------------------
INSERT INTO `transactions` (`vehicle_id`, `buyer_id`, `seller_id`, `proposed_price`, `status`) VALUES
(2, 3, 2, 37000000.00, 'proposta_aceite'),
(5, 3, 5, 65000000.00, 'transacao_concluida');

-- --------------------------------------------------------
-- Sample messages
-- --------------------------------------------------------
INSERT INTO `messages` (`sender_id`, `receiver_id`, `transaction_id`, `content`, `type`) VALUES
(3, 2, 1, 'Ola, tenho interesse no Mercedes Classe C. Posso fazer uma proposta?', 'text'),
(2, 3, 1, 'Claro! Pode avancar com a proposta.', 'text'),
(3, 2, 1, 'Proponho 37.000.000 Kz. E aceitavel?', 'proposal'),
(2, 3, 1, 'Aceito! Vamos avancar com o cofre.', 'text');

-- --------------------------------------------------------
-- Sample notifications
-- --------------------------------------------------------
INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `link`) VALUES
(3, 'Proposta Aceite', 'O vendedor aceitou a tua proposta para o Mercedes Classe C.', 'success', '/cofre'),
(2, 'Nova Proposta', 'Pedro Santos fez uma proposta de 37.000.000 Kz no Mercedes Classe C.', 'info', '/chat'),
(3, 'Lembrete de Pagamento', 'Tens 48h para pagar a comissao de 370.000 Kz.', 'warning', '/cofre');
