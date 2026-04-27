import { supabase } from '../lib/supabase';
import type { Company, Category, Product, Table, Customer, OpenTab, Order } from '../types';

export const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export interface DataSyncResult {
  success: boolean;
  error?: string;
}

export const dataService = {
  async loadCompany(): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', DEMO_COMPANY_ID)
      .single();
    
    if (error) {
      console.error('Erro ao carregar empresa:', error);
      return null;
    }
    return data as Company;
  },

  async loadCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', DEMO_COMPANY_ID)
      .order('sort_order');
    
    if (error) {
      console.error('Erro ao carregar categorias:', error);
      return [];
    }
    return data as Category[];
  },

  async loadProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', DEMO_COMPANY_ID)
      .eq('active', true);
    
    if (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
    return data as Product[];
  },

  async loadTables(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('company_id', DEMO_COMPANY_ID)
      .order('number');
    
    if (error) {
      console.error('Erro ao carregar mesas:', error);
      return [];
    }
    return data as Table[];
  },

  async loadCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', DEMO_COMPANY_ID)
      .order('name');
    
    if (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
    return data as Customer[];
  },

  async loadOpenTabs(): Promise<OpenTab[]> {
    const { data, error } = await supabase
      .from('open_tabs')
      .select('*')
      .eq('company_id', DEMO_COMPANY_ID)
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar comandas:', error);
      return [];
    }
    return data as OpenTab[];
  },

  async loadOrders(): Promise<Order[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('company_id', DEMO_COMPANY_ID)
      .gte('created_at', today)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar pedidos:', error);
      return [];
    }
    return data as Order[];
  },

  async loadAllData(): Promise<{
    company: Company | null;
    categories: Category[];
    products: Product[];
    tables: Table[];
    customers: Customer[];
    openTabs: OpenTab[];
    orders: Order[];
  }> {
    const [company, categories, products, tables, customers, openTabs, orders] = await Promise.all([
      this.loadCompany(),
      this.loadCategories(),
      this.loadProducts(),
      this.loadTables(),
      this.loadCustomers(),
      this.loadOpenTabs(),
      this.loadOrders(),
    ]);

    return { company, categories, products, tables, customers, openTabs, orders };
  },

  async createOpenTab(tab: Omit<OpenTab, 'id' | 'created_at'>): Promise<OpenTab | null> {
    const { data, error } = await supabase
      .from('open_tabs')
      .insert({ ...tab, company_id: DEMO_COMPANY_ID })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar comanda:', error);
      return null;
    }
    return data as OpenTab;
  },

  async closeOpenTab(tabId: string): Promise<boolean> {
    const { error } = await supabase
      .from('open_tabs')
      .update({ status: 'closed' })
      .eq('id', tabId);
    
    if (error) {
      console.error('Erro ao fechar comanda:', error);
      return false;
    }
    return true;
  },

  async updateTableStatus(tableId: string, status: string, currentOrderId?: string): Promise<boolean> {
    const { error } = await supabase
      .from('tables')
      .update({ status, current_order_id: currentOrderId })
      .eq('id', tableId);
    
    if (error) {
      console.error('Erro ao atualizar mesa:', error);
      return false;
    }
    return true;
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert({ ...order, company_id: DEMO_COMPANY_ID })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar pedido:', error);
      return null;
    }
    return data as Order;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) {
      console.error('Erro ao atualizar pedido:', error);
      return false;
    }
    return true;
  },
};