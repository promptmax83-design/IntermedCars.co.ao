-- IntermedCars Database Schema
-- SQLite version
-- Version: 1.0.0
-- Date: 2026-07-11

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telemovel TEXT NOT NULL,
  bi_passaporte TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  nome_pai TEXT NOT NULL DEFAULT '',
  nome_mae TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pendente_verificacao'
    CHECK (status IN ('pendente_verificacao','verificado','verificacao_recusada','temporariamente_banido')),
  bi_frente_path TEXT,
  bi_verso_path TEXT,
  selfie_path TEXT,
  verified_at TEXT,
  banned_at TEXT,
  ban_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (email),
  UNIQUE (bi_passaporte),
  UNIQUE (telemovel)
);

CREATE INDEX idx_users_status ON users (status);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL DEFAULT 'carro'
    CHECK (tipo IN ('carro','carrinha','camiao')),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  preco REAL NOT NULL,
  specs TEXT,
  combustivel TEXT NOT NULL DEFAULT 'gasolina'
    CHECK (combustivel IN ('gasolina','diesel','eletrico','hibrido')),
  caixa TEXT NOT NULL DEFAULT 'automatica'
    CHECK (caixa IN ('manual','automatica')),
  cor TEXT NOT NULL DEFAULT '',
  potencia INTEGER NOT NULL DEFAULT 0,
  tracao TEXT NOT NULL DEFAULT 'dianteira'
    CHECK (tracao IN ('dianteira','traseira','integral')),
  km INTEGER NOT NULL DEFAULT 0,
  local TEXT NOT NULL DEFAULT '',
  descricao TEXT,
  vendedor_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel'
    CHECK (status IN ('disponivel','em_negociacao','comprado','cancelado')),
  vistoria INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vendedor_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_status ON vehicles (status);
CREATE INDEX idx_vehicles_vendedor ON vehicles (vendedor_id);
CREATE INDEX idx_vehicles_tipo ON vehicles (tipo);
CREATE INDEX idx_vehicles_marca ON vehicles (marca);
CREATE INDEX idx_vehicles_preco ON vehicles (preco);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images (vehicle_id);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  proposed_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposta_enviada'
    CHECK (status IN (
      'proposta_enviada','proposta_aceite','proposta_recusada',
      'deposito_efetuado','vistoria_concluida',
      'comissao_pendente','comissao_paga',
      'prazo_excedido','multa_aplicada','divida_pendente',
      'transacao_concluida','transacao_cancelada'
    )),
  accepted_at TEXT,
  deposit_amount REAL,
  deposited_at TEXT,
  inspection_completed_at TEXT,
  commission_deadline TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_vehicle ON transactions (vehicle_id);
CREATE INDEX idx_transactions_buyer ON transactions (buyer_id);
CREATE INDEX idx_transactions_seller ON transactions (seller_id);
CREATE INDEX idx_transactions_status ON transactions (status);

CREATE TABLE IF NOT EXISTS commission_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN ('buyer','seller')),
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','confirmado','rejeitado')),
  proof_id INTEGER,
  paid_at TEXT,
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
);

CREATE INDEX idx_commission_payments_user ON commission_payments (user_id);
CREATE INDEX idx_commission_payments_transaction ON commission_payments (transaction_id);
CREATE INDEX idx_commission_payments_status ON commission_payments (status);

CREATE TABLE IF NOT EXISTS payment_proofs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente_analise'
    CHECK (status IN ('pendente_analise','aprovado','suspeito','aprovado_manual','rejeitado_manual')),
  ai_confidence REAL,
  ai_flags TEXT,
  analyzed_at TEXT,
  reviewer_id INTEGER,
  review_notes TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_proofs_user ON payment_proofs (user_id);
CREATE INDEX idx_payment_proofs_transaction ON payment_proofs (transaction_id);
CREATE INDEX idx_payment_proofs_status ON payment_proofs (status);

CREATE TABLE IF NOT EXISTS user_debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL DEFAULT 'comissao'
    CHECK (type IN ('comissao','multa_abuso')),
  paid INTEGER NOT NULL DEFAULT 0,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_debts_user ON user_debts (user_id);
CREATE INDEX idx_user_debts_transaction ON user_debts (transaction_id);
CREATE INDEX idx_user_debts_paid ON user_debts (paid);

CREATE TABLE IF NOT EXISTS vehicle_status_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  user_id INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicle_status_logs_vehicle ON vehicle_status_logs (vehicle_id);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  transaction_id INTEGER,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text'
    CHECK (type IN ('text','image','proposal','location')),
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_receiver ON messages (receiver_id);
CREATE INDEX idx_messages_transaction ON messages (transaction_id);
CREATE INDEX idx_messages_created ON messages (created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info','warning','success','error')),
  link TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (read_at);

PRAGMA foreign_keys = ON;
