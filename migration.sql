-- ============================================================
-- Kape Inato — Full Migration (safe to re-run)
-- Run in phpMyAdmin → SQL tab
-- ============================================================

-- ── Fix #2 — Payment columns ─────────────────────────────────
ALTER TABLE online_orders 
    ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid','proof_submitted','confirmed') DEFAULT 'unpaid',
    ADD COLUMN IF NOT EXISTS payment_proof VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS payment_confirmed_at DATETIME DEFAULT NULL;

-- ── Fix #10 — Convert to InnoDB for transactions + FK support ─
ALTER TABLE menu_items      ENGINE = InnoDB;
ALTER TABLE online_orders   ENGINE = InnoDB;
ALTER TABLE online_order_items ENGINE = InnoDB;
ALTER TABLE users           ENGINE = InnoDB;

-- ── Fix #10 — Proper line-items table ────────────────────────
CREATE TABLE IF NOT EXISTS online_order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    online_order_id INT NOT NULL,
    menu_item_id    INT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    price_at_time   DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (online_order_id) REFERENCES online_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id)    REFERENCES menu_items(id)    ON DELETE RESTRICT,
    INDEX idx_online_order (online_order_id),
    INDEX idx_menu_item    (menu_item_id)
);

-- ── Fix #10 — Drop legacy TEXT items column ───────────────────
ALTER TABLE online_orders DROP COLUMN IF EXISTS items;

-- ── Fix #7 — Set correct default images per category ─────────
UPDATE menu_items SET image_path = 'default_pizza.jpg'
    WHERE category = 'Pizza' 
    AND (image_path = 'default.jpg' OR image_path = '' OR image_path IS NULL);

UPDATE menu_items SET image_path = 'default_pasta.jpg'
    WHERE category = 'Pasta' 
    AND (image_path = 'default.jpg' OR image_path = '' OR image_path IS NULL);

UPDATE menu_items SET image_path = 'default_drinks.jpg'
    WHERE category = 'Drinks' 
    AND (image_path = 'default.jpg' OR image_path = '' OR image_path IS NULL);

UPDATE menu_items SET image_path = 'default_appetizers.jpg'
    WHERE category = 'Appetizers' 
    AND (image_path = 'default.jpg' OR image_path = '' OR image_path IS NULL);
