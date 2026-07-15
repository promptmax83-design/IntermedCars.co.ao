-- IntermedCars Database Schema
-- MySQL 8 / PDO
-- Version: 1.0.0
-- Date: 2026-07-11

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Users table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `telemovel` VARCHAR(20) NOT NULL,
  `bi_passaporte` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `nome_pai` VARCHAR(255) NOT NULL DEFAULT '',
  `nome_mae` VARCHAR(255) NOT NULL DEFAULT '',
  `status` ENUM('pendente_verificacao','verificado','verificacao_recusada','temporariamente_banido') NOT NULL DEFAULT 'pendente_verificacao',
  `bi_frente_path` VARCHAR(500) DEFAULT NULL,
  `bi_verso_path` VARCHAR(500) DEFAULT NULL,
  `selfie_path` VARCHAR(500) DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `banned_at` DATETIME DEFAULT NULL,
  `ban_reason` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_bi` (`bi_passaporte`),
  UNIQUE KEY `uk_users_telemovel` (`telemovel`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Vehicles table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tipo` ENUM('carro','carrinha','camiao') NOT NULL DEFAULT 'carro',
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(150) NOT NULL,
  `ano` INT UNSIGNED NOT NULL,
  `preco` DECIMAL(15,2) NOT NULL,
  `specs` TEXT DEFAULT NULL,
  `combustivel` ENUM('gasolina','diesel','eletrico','hibrido') NOT NULL DEFAULT 'gasolina',
  `caixa` ENUM('manual','automatica') NOT NULL DEFAULT 'automatica',
  `cor` VARCHAR(50) NOT NULL DEFAULT '',
  `potencia` INT UNSIGNED NOT NULL DEFAULT 0,
  `tracao` ENUM('dianteira','traseira','integral') NOT NULL DEFAULT 'dianteira',
  `km` INT UNSIGNED NOT NULL DEFAULT 0,
  `local` VARCHAR(100) NOT NULL DEFAULT '',
  `descricao` TEXT DEFAULT NULL,
  `vendedor_id` INT UNSIGNED NOT NULL,
  `status` ENUM('disponivel','em_negociacao','comprado','cancelado') NOT NULL DEFAULT 'disponivel',
  `vistoria` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vehicles_status` (`status`),
  INDEX `idx_vehicles_vendedor` (`vendedor_id`),
  INDEX `idx_vehicles_tipo` (`tipo`),
  INDEX `idx_vehicles_marca` (`marca`),
  INDEX `idx_vehicles_preco` (`preco`),
  CONSTRAINT `fk_vehicles_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Vehicle images table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicle_images` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `vehicle_id` INT UNSIGNED NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_vehicle_images_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_vehicle_images_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Transactions table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `vehicle_id` INT UNSIGNED NOT NULL,
  `buyer_id` INT UNSIGNED NOT NULL,
  `seller_id` INT UNSIGNED NOT NULL,
  `proposed_price` DECIMAL(15,2) NOT NULL,
  `status` ENUM(
    'proposta_enviada','proposta_aceite','proposta_recusada',
    'deposito_efetuado','vistoria_concluida',
    'comissao_pendente','comissao_paga',
    'prazo_excedido','multa_aplicada','divida_pendente',
    'transacao_concluida','transacao_cancelada'
  ) NOT NULL DEFAULT 'proposta_enviada',
  `accepted_at` DATETIME DEFAULT NULL,
  `deposit_amount` DECIMAL(15,2) DEFAULT NULL,
  `deposited_at` DATETIME DEFAULT NULL,
  `inspection_completed_at` DATETIME DEFAULT NULL,
  `commission_deadline` DATETIME DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_transactions_vehicle` (`vehicle_id`),
  INDEX `idx_transactions_buyer` (`buyer_id`),
  INDEX `idx_transactions_seller` (`seller_id`),
  INDEX `idx_transactions_status` (`status`),
  CONSTRAINT `fk_transactions_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Commission payments table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `commission_payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `role` ENUM('buyer','seller') NOT NULL,
  `status` ENUM('pendente','confirmado','rejeitado') NOT NULL DEFAULT 'pendente',
  `proof_id` INT UNSIGNED DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `confirmed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_commission_payments_user` (`user_id`),
  INDEX `idx_commission_payments_transaction` (`transaction_id`),
  INDEX `idx_commission_payments_status` (`status`),
  CONSTRAINT `fk_commission_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commission_payments_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Payment proofs table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_proofs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(50) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `status` ENUM('pendente_analise','aprovado','suspeito','aprovado_manual','rejeitado_manual') NOT NULL DEFAULT 'pendente_analise',
  `ai_confidence` DECIMAL(3,2) DEFAULT NULL,
  `ai_flags` JSON DEFAULT NULL,
  `analyzed_at` DATETIME DEFAULT NULL,
  `reviewer_id` INT UNSIGNED DEFAULT NULL,
  `review_notes` TEXT DEFAULT NULL,
  `reviewed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payment_proofs_user` (`user_id`),
  INDEX `idx_payment_proofs_transaction` (`transaction_id`),
  INDEX `idx_payment_proofs_status` (`status`),
  CONSTRAINT `fk_payment_proofs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_proofs_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. User debts table (penalties)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_debts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `type` ENUM('comissao','multa_abuso') NOT NULL DEFAULT 'comissao',
  `paid` TINYINT(1) NOT NULL DEFAULT 0,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_debts_user` (`user_id`),
  INDEX `idx_user_debts_transaction` (`transaction_id`),
  INDEX `idx_user_debts_paid` (`paid`),
  CONSTRAINT `fk_user_debts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_debts_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Vehicle status logs (audit trail)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicle_status_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `vehicle_id` INT UNSIGNED NOT NULL,
  `from_status` VARCHAR(30) NOT NULL,
  `to_status` VARCHAR(30) NOT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_vehicle_status_logs_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_vehicle_status_logs_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Messages table (chat)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT UNSIGNED NOT NULL,
  `receiver_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED DEFAULT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('text','image','proposal','location') NOT NULL DEFAULT 'text',
  `read_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_messages_sender` (`sender_id`),
  INDEX `idx_messages_receiver` (`receiver_id`),
  INDEX `idx_messages_transaction` (`transaction_id`),
  INDEX `idx_messages_created` (`created_at`),
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Notifications table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info','warning','success','error') NOT NULL DEFAULT 'info',
  `link` VARCHAR(500) DEFAULT NULL,
  `read_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_read` (`read_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
