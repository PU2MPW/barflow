-- SQL Schema para BarFlow - Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de empresas/companhias
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document VARCHAR(20) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  phone VARCHAR(20),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'waiter' CHECK (role IN ('admin', 'manager', 'waiter', 'kitchen', 'delivery')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🍽️',
  color VARCHAR(7) DEFAULT '#FF6B35',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15,
  modifiers JSONB DEFAULT '[]',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mesas
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  seats INTEGER DEFAULT 4,
  status TEXT DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'vip')),
  current_order_id UUID,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone VARCHAR(20),
  document VARCHAR(20),
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'standard' CHECK (loyalty_tier IN ('standard', 'silver', 'gold', 'vip')),
  total_spent DECIMAL(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  customer_id UUID REFERENCES customers(id),
  type TEXT NOT NULL CHECK (type IN ('dine_in', 'bar', 'takeout', 'delivery')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payments JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comandas abertas
CREATE TABLE IF NOT EXISTS open_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone VARCHAR(20),
  table_id UUID REFERENCES tables(id),
  pre_authorized_amount DECIMAL(10,2) DEFAULT 0,
  current_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens das comandas
CREATE TABLE IF NOT EXISTS tab_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES open_tabs(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  modifiers JSONB DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  table_id UUID REFERENCES tables(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER DEFAULT 2,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity DECIMAL(10,3) DEFAULT 0,
  unit VARCHAR(10) DEFAULT 'un',
  min_quantity DECIMAL(10,3) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de encerramentos de caixa
CREATE TABLE IF NOT EXISTS cash_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  opening_balance DECIMAL(10,2) DEFAULT 0,
  cash_sales DECIMAL(10,2) DEFAULT 0,
  card_sales DECIMAL(10,2) DEFAULT 0,
  pix_sales DECIMAL(10,2) DEFAULT 0,
  other_sales DECIMAL(10,2) DEFAULT 0,
  withdrawals DECIMAL(10,2) DEFAULT 0,
  supplies DECIMAL(10,2) DEFAULT 0,
  closing_balance DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (baseado no company_id)
CREATE POLICY "Users can view own company data" ON companies USING (true);
CREATE POLICY "Users can view users" ON users USING (true);
CREATE POLICY "Users can view categories" ON categories USING (true);
CREATE POLICY "Users can view products" ON products USING (true);
CREATE POLICY "Users can view tables" ON tables USING (true);
CREATE POLICY "Users can view customers" ON customers USING (true);
CREATE POLICY "Users can view orders" ON orders USING (true);
CREATE POLICY "Users can view open_tabs" ON open_tabs USING (true);
CREATE POLICY "Users can view reservations" ON reservations USING (true);
CREATE POLICY "Users can view inventory" ON inventory USING (true);
CREATE POLICY "Users can view coupons" ON coupons USING (true);

-- Inserir dados iniciais (demo)
INSERT INTO companies (id, name, document, city, state) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'BarFlow Demo', '12.345.678/0001-90', 'São Paulo', 'SP');

INSERT INTO users (id, email, name, role, company_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@barflow.com', 'Administrador', 'admin', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'gerente@barflow.com', 'Gerente', 'manager', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'garcom@barflow.com', 'Garçom', 'waiter', '00000000-0000-0000-0000-000000000001');

INSERT INTO categories (id, name, icon, color, sort_order, company_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Bebidas', '🍺', '#3B82F6', 1, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'Cervejas', '🍻', '#F59E0B', 2, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Petiscos', '🍟', '#EF4444', 3, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', 'Drinks', '🍹', '#EC4899', 4, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000005', 'Porções', '🍖', '#8B5CF6', 5, '00000000-0000-0000-0000-000000000001');

INSERT INTO products (id, name, description, price, cost, category_id, company_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Água', 'Água mineral 500ml', 4.00, 2.00, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'Refrigerante Lata', 'Coca-Cola, Pepsi ou Guaraná', 6.00, 3.00, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Suco Natural', 'Laranja, Limão ou Maracujá', 10.00, 4.00, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', 'Cerveja Long Neck', 'Heineken ou Stella', 12.00, 6.00, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000005', 'Cerveja 600ml', 'Brahma ou Skol', 10.00, 5.00, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000006', 'Batata Frita', 'Porção média', 22.00, 8.00, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000007', 'Cebola Anel', 'Anéis empanados', 24.00, 9.00, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000008', 'Caipirinha', 'Limão, cachaça e açúcar', 18.00, 6.00, '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000009', 'Caipiroska', 'Limão, vodka e açúcar', 20.00, 7.00, '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000010', 'Porção Picanha', '200g de picanha', 45.00, 25.00, '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001');

INSERT INTO tables (id, number, seats, company_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 1, 4, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 2, 4, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 3, 6, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', 4, 2, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000005', 5, 8, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000006', 6, 4, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000007', 7, 6, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000008', 8, 4, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000009', 9, 2, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000010', 10, 10, '00000000-0000-0000-0000-000000000001');

INSERT INTO customers (id, name, phone, loyalty_points, loyalty_tier, total_spent, visit_count, company_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'João Silva', '(11) 99999-1111', 450, 'silver', 850.00, 12, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'Maria Santos', '(11) 99999-2222', 1200, 'vip', 3200.00, 28, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Pedro Oliveira', '(11) 99999-3333', 80, 'standard', 120.00, 2, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', 'Ana Costa', '(11) 99999-4444', 650, 'gold', 1450.00, 18, '00000000-0000-0000-0000-000000000001');