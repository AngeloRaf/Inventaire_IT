-- 1) Créer la base
CREATE DATABASE inventory_it
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE inventory_it;

-- 2) Créer la table items
CREATE TABLE IF NOT EXISTS items (
  id            CHAR(36) NOT NULL,
  model         VARCHAR(120) NULL,
  NAME          VARCHAR(180) NOT NULL,
  category      VARCHAR(120) NOT NULL,
  STATUS        VARCHAR(120) NOT NULL,
  COMMENT       TEXT NULL,
  location      VARCHAR(180) NULL,
  assigned_to   VARCHAR(180) NULL,
  purchase_date DATE NULL,
  warranty_end  DATE NULL,
  quantity      INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_items_category (category),
  INDEX idx_items_status (STATUS),
  INDEX idx_items_assigned (assigned_to)
);

-- 3) (Optionnel) Échantillon
INSERT INTO items (id, model, NAME, category, STATUS, COMMENT, location, assigned_to, purchase_date, warranty_end, quantity)
VALUES
  (UUID(), 'Latitude 5400', 'Dell', 'Ordinateur', 'En service', 'Machine principale', 'IT', 'IT', '2022-01-01', '2025-01-01', 1);
`items`

SELECT * FROM items