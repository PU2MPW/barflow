import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenTab, OrderItem, Payment } from '../types';
import { dataService } from '../lib/dataService';

interface TabsState {
  openTabs: OpenTab[];
  activeTabId: string | null;
  loading: boolean;
  
  createTab: (data: {
    customerName: string;
    customerPhone?: string;
    tableId?: string;
    preAuthorizedAmount?: number;
  }) => Promise<OpenTab | null>;
  
  closeTab: (tabId: string) => Promise<OpenTab | null>;
  cancelTab: (tabId: string) => Promise<void>;
  
  addItemToTab: (tabId: string, item: Omit<OrderItem, 'id' | 'status'>) => void;
  
  addPayment: (tabId: string, payment: Omit<Payment, 'id' | 'created_at'>) => void;
  
  getTabById: (tabId: string) => OpenTab | undefined;
  getTabBalance: (tabId: string) => { total: number; paid: number; remaining: number };
  
  setActiveTab: (tabId: string | null) => void;
  
  syncFromSupabase: () => Promise<void>;
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      activeTabId: null,
      loading: false,

      createTab: async (data) => {
        const userId = localStorage.getItem('barflow-user-id') || '';
        const tabData: Omit<OpenTab, 'id' | 'created_at'> = {
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          table_id: data.tableId,
          pre_authorized_amount: data.preAuthorizedAmount || 0,
          current_amount: 0,
          status: 'open',
          notes: '',
          created_by: userId,
          company_id: '',
        };

        const newTab = await dataService.createOpenTab(tabData);
        if (newTab) {
          set((state) => ({ openTabs: [...state.openTabs, newTab] }));
        }
        return newTab;
      },

      closeTab: async (tabId) => {
        const success = await dataService.closeOpenTab(tabId);
        if (success) {
          const tab = get().openTabs.find(t => t.id === tabId);
          set((state) => ({
            openTabs: state.openTabs.map(t => 
              t.id === tabId ? { ...t, status: 'closed' as const } : t
            ),
          }));
          return tab || null;
        }
        return null;
      },

      cancelTab: async (tabId) => {
        const success = await dataService.closeOpenTab(tabId);
        if (success) {
          set((state) => ({
            openTabs: state.openTabs.map(t => 
              t.id === tabId ? { ...t, status: 'cancelled' as const } : t
            ),
          }));
        }
      },

      addItemToTab: (tabId, item) => {
        set((state) => ({
          openTabs: state.openTabs.map(tab => {
            if (tab.id !== tabId) return tab;
            const newAmount = tab.current_amount + (item.unit_price * item.quantity);
            return {
              ...tab,
              current_amount: newAmount,
            };
          }),
        }));
      },

      addPayment: (_tabId, _payment) => {
        set((state) => ({
          openTabs: state.openTabs,
        }));
      },

      getTabById: (tabId) => {
        return get().openTabs.find(t => t.id === tabId);
      },

      getTabBalance: (tabId) => {
        const tab = get().openTabs.find(t => t.id === tabId);
        if (!tab) return { total: 0, paid: 0, remaining: 0 };
        return {
          total: tab.current_amount,
          paid: 0,
          remaining: tab.current_amount,
        };
      },

      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
      },

      syncFromSupabase: async () => {
        set({ loading: true });
        try {
          const tabs = await dataService.loadOpenTabs();
          set({ openTabs: tabs, loading: false });
        } catch (error) {
          console.error('Erro ao sincronizar comandas:', error);
          set({ loading: false });
        }
      },
    }),
    {
      name: 'barflow-tabs',
      partialize: (state) => ({
        activeTabId: state.activeTabId,
      }),
    }
  )
);