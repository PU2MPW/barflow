import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { OrderItem } from '../types';

interface TabItemsState {
  items: Record<string, OrderItem[]>;
  
  addItem: (tabId: string, item: Omit<OrderItem, 'id' | 'status'>) => void;
  removeItem: (tabId: string, itemId: string) => void;
  updateQuantity: (tabId: string, itemId: string, quantity: number) => void;
  getItems: (tabId: string) => OrderItem[];
  getTotal: (tabId: string) => number;
  clearItems: (tabId: string) => void;
}

export const useTabItemsStore = create<TabItemsState>()(
  persist(
    (set, get) => ({
      items: {},

      addItem: (tabId, item) => {
        set((state) => {
          const tabItems = state.items[tabId] || [];
          const existingIndex = tabItems.findIndex(
            i => i.product_id === item.product_id &&
                 JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
          );

          if (existingIndex >= 0) {
            const updatedItems = [...tabItems];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
              total: (updatedItems[existingIndex].quantity + item.quantity) * updatedItems[existingIndex].unit_price,
            };
            return {
              items: { ...state.items, [tabId]: updatedItems },
            };
          }

          return {
            items: {
              ...state.items,
              [tabId]: [
                ...tabItems,
                { ...item, id: uuidv4(), status: 'pending' as const },
              ],
            },
          };
        });
      },

      removeItem: (tabId, itemId) => {
        set((state) => ({
          items: {
            ...state.items,
            [tabId]: (state.items[tabId] || []).filter(i => i.id !== itemId),
          },
        }));
      },

      updateQuantity: (tabId, itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(tabId, itemId);
          return;
        }
        set((state) => ({
          items: {
            ...state.items,
            [tabId]: (state.items[tabId] || []).map(item => {
              if (item.id !== itemId) return item;
              return { ...item, quantity, total: quantity * item.unit_price };
            }),
          },
        }));
      },

      getItems: (tabId) => {
        return get().items[tabId] || [];
      },

      getTotal: (tabId) => {
        const items = get().items[tabId] || [];
        return items.reduce((sum, item) => sum + item.total, 0);
      },

      clearItems: (tabId) => {
        set((state) => ({
          items: { ...state.items, [tabId]: [] },
        }));
      },
    }),
    {
      name: 'barflow-tab-items',
    }
  )
);