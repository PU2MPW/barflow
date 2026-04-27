import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Category, Product, Table, Order, Customer, OpenTab, Inventory } from '../types';
import { dataService } from '../lib/dataService';

interface CompanyState {
  company: any;
  categories: Category[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  customers: Customer[];
  openTabs: OpenTab[];
  inventory: Inventory[];
  loading: boolean;
  synced: boolean;
  
  setCompany: (company: any) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setTables: (tables: Table[]) => void;
  setOrders: (orders: Order[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setOpenTabs: (tabs: OpenTab[]) => void;
  setInventory: (inventory: Inventory[]) => void;
  setLoading: (loading: boolean) => void;
  
  syncFromSupabase: () => Promise<void>;
  
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  
  addPoints: (customerId: string, points: number) => void;
  redeemPoints: (customerId: string, points: number) => boolean;
  
  initializeDemoData: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      company: null,
      categories: [],
      products: [],
      tables: [],
      orders: [],
      customers: [],
      openTabs: [],
      inventory: [],
      loading: false,
      synced: false,

      setCompany: (company) => set({ company }),
      setCategories: (categories) => set({ categories }),
      setProducts: (products) => set({ products }),
      setTables: (tables) => set({ tables }),
      setOrders: (orders) => set({ orders }),
      setCustomers: (customers) => set({ customers }),
      setOpenTabs: (openTabs) => set({ openTabs }),
      setInventory: (inventory) => set({ inventory }),
      setLoading: (loading) => set({ loading }),

      syncFromSupabase: async () => {
        set({ loading: true });
        try {
          const data = await dataService.loadAllData();
          set({
            company: data.company,
            categories: data.categories,
            products: data.products,
            tables: data.tables,
            customers: data.customers,
            openTabs: data.openTabs,
            orders: data.orders,
            synced: true,
            loading: false,
          });
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error);
          set({ loading: false });
        }
      },

      createOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ orders: [...state.orders, newOrder] }));
        return newOrder;
      },

      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
          ),
        }));
      },

      addPoints: (customerId, points) => {
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id !== customerId) return c;
            const newPoints = c.loyalty_points + points;
            let newTier = c.loyalty_tier;
            if (newPoints >= 1000) newTier = 'vip';
            else if (newPoints >= 500) newTier = 'gold';
            else if (newPoints >= 200) newTier = 'silver';
            return { ...c, loyalty_points: newPoints, loyalty_tier: newTier };
          }),
        }));
      },

      redeemPoints: (customerId, points) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer || customer.loyalty_points < points) return false;
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, loyalty_points: c.loyalty_points - points } : c
          ),
        }));
        return true;
      },

      initializeDemoData: () => {
        const state = get();
        if (state.categories.length === 0) {
          set({
            categories: [],
            products: [],
            tables: [],
            customers: [],
          });
        }
      },
    }),
    {
      name: 'barflow-company',
      partialize: (state) => ({
        company: state.company,
        synced: state.synced,
      }),
    }
  )
);