-- Création de la base de données avec encodage UTF-8
CREATE DATABASE frodon_db 
WITH 
    ENCODING 'UTF8' 
    LC_COLLATE='fr_FR.UTF-8' 
    LC_CTYPE='fr_FR.UTF-8'
    TEMPLATE template0;

\c frodon_db;

-- Configuration de l'encodage client
SET client_encoding TO 'UTF8';
SET standard_conforming_strings = on;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type VARCHAR(50) DEFAULT 'customer', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE, 
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GAR', -- Gandariary
    category_id INTEGER REFERENCES categories(id),
    image_url VARCHAR(500),
    stock_quantity INTEGER DEFAULT 0,
    is_product_of_day BOOLEAN DEFAULT false,
    product_ref VARCHAR(50) UNIQUE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_product_of_day ON products(is_product_of_day);
CREATE INDEX idx_users_email ON users(email);


INSERT INTO users (email, password_hash, first_name, last_name, user_type) VALUES
('admin@frodon.com', 'ad$min0', 'Gandalf', 'le Gris', 'admin'),
('customer@frodon.com', 'cu$t0m3r1', 'Frodon', 'Sacquet', 'customer'),
('merchant@frodon.com', 'm3rch8nt', 'Elrond', 'de Fondcombe', 'merchant'),
('legolas@frodon.com', 'su$t0m3r2', 'Legolas', 'de Vertfeuille', 'customer'),
('gimli@frodon.com', 'cu$t0m3r0', 'Gimli', 'fils de Gloin', 'customer'),
('boromir@frodon.com', 'cu$t0m3r3', 'Boromir', 'de Gondor', 'customer');


INSERT INTO categories (name, slug, description) VALUES
('Potions et Élixirs', 'potions-elixirs', 'Potions magiques, élixirs de guérison et breuvages enchantés'),
('Armes et Armures', 'armes-armures', 'Épées, boucliers, armures et équipements de combat'),
('Bijoux Magiques', 'bijoux-magiques', 'Anneaux, amulettes et bijoux aux pouvoirs mystiques'),
('Grimoires et Parchemins', 'grimoires-parchemins', 'Livres de sorts, parchemins anciens et manuscrits'),
('Herbes et Ingrédients', 'herbes-ingredients', 'Plantes médicinales, herbes rares et ingrédients alchimiques'),
('Objets Enchantés', 'objets-enchantes', 'Objets du quotidien dotés de propriétés magiques');

INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_product_of_day, product_ref) VALUES
('Poudre de fée lumineuse', 'Poudre magique récoltée auprès des fées de la Forêt Enchantée. Émet une douce lumière et peut être utilisée pour des sorts d''illumination ou comme ingrédient pour potions de clarté.', 150.00, 5, '/images/poudre-fee-lumineuse.jpg', 25,  false, 'MGD-001'),
('Anneau de protection de Valinor', 'Anneau forgé par les maîtres orfèvres de Valinor. Offre une protection contre les sorts maléfiques et augmente la résistance magique de son porteur.', 950.00, 3, '/images/anneau-valinor.jpg', 7, false, 'MTR-078'),
('Élixir de guérison elfique', 'Potion rare concoctée par les guérisseurs elfes de Fondcombe. Restaure instantanément des points de vie et guérit le sang des poisons.', 300.00, 1, '/images/elixir-guerison-elfique.jpg', 40, true, 'ENC-109'),
('Épée de Mithril', 'Lame forgée dans le mithril des mines de la Moria. Légère comme une plume mais plus tranchante que l''acier le plus fin.', 2500.00, 2, '/images/epee-mithril.jpg', 3, false, 'ARM-045'),
('Grimoire des Anciens', 'Livre de sorts millénaire contenant les secrets des mages d''antan. Écrit en langues elfiques anciennes.', 1200.00, 4, '/images/grimoire-anciens.jpg', 8, false, 'GRI-023'),
('Amulette de Lórien', 'Bijou béni par Galadriel elle-même. Protège son porteur des influences maléfiques et améliore la vision nocturne.', 800.00, 3, '/images/amulette-lorien.jpg', 12, false, 'BIJ-067');

-- Création des vues 
CREATE VIEW products_with_category AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.currency,
    p.stock_quantity,
    p.is_featured,
    p.is_product_of_day,
    p.image_url,
    p.product_ref,
    c.name as category_name,
    c.slug as category_slug,
    c.description as category_description
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

CREATE VIEW product_of_the_day AS
SELECT * FROM products_with_category 
WHERE is_product_of_day = true 
ORDER BY created_at DESC
LIMIT 1;


-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérification de l'encodage
SELECT name, setting FROM pg_settings WHERE name LIKE '%encoding%';

-- Panier
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_user ON carts(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE VIEW cart_details AS
SELECT 
    ci.id AS cart_item_id,
    c.id AS cart_id,
    u.email AS user_email,
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.currency,
    ci.quantity,
    (p.price * ci.quantity) AS total_price,
    ci.added_at
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN users u ON c.user_id = u.id
JOIN products p ON ci.product_id = p.id
WHERE c.is_active = true;