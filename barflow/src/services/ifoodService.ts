import { v4 as uuidv4 } from 'uuid';
import type { Order, OrderItem } from '../types';

type iFoodStatus = 'RECEIVED' | 'ACCEPTED' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED';

interface iFoodOrder {
  id: string;
  externalId: string;
  orderId: string;
  restaurantId: string;
  createdAt: string;
  orderType: 'DELIVERY' | 'TAKEOUT' | 'DINE_IN';
  items: iFoodItem[];
  subtotal: number;
  total: number;
  discount: number;
  deliveryFee: number;
  address?: iFoodAddress;
  customer: iFoodCustomer;
  status: iFoodStatus;
  estimatedDeliveryTime?: string;
  payment: {
    method: 'ONLINE' | 'OFFLINE' | 'MACHINE';
    amount: number;
    preAuthCode?: string;
  };
}

interface iFoodItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  additions?: iFoodAddition[];
  extras?: iFoodExtra[];
}

interface iFoodAddition {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface iFoodExtra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface iFoodAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  reference?: string;
}

interface iFoodCustomer {
  id: string;
  name: string;
  phone?: string;
  document?: string;
}

interface iFoodDeliveryPerson {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  vehicle?: string;
}

interface iFoodConfig {
  clientId: string;
  clientSecret: string;
  restaurantId: string;
  webhookUrl: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

class iFoodService {
  private config: iFoodConfig | null = null;
  private orders: Map<string, iFoodOrder> = new Map();
  private listeners: Set<(orders: iFoodOrder[]) => void> = new Set();
  private deliveryPersons: iFoodDeliveryPerson[] = [];

  configure(config: iFoodConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  subscribe(listener: (orders: iFoodOrder[]) => void) {
    this.listeners.add(listener);
    listener(this.getOrders());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getOrders()));
  }

  getOrders(): iFoodOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrdersByStatus(status: iFoodStatus): iFoodOrder[] {
    return this.getOrders().filter(order => order.status === status);
  }

  getDeliveryPersons(): iFoodDeliveryPerson[] {
    return this.deliveryPersons;
  }

  setDeliveryPersons(persons: iFoodDeliveryPerson[]) {
    this.deliveryPersons = persons;
  }

  async authenticate(): Promise<boolean> {
    if (!this.config) return false;

    try {
      // PLACEHOLDER: Autenticar com iFood API
      // const response = await fetch('https://ws.ifood.com.br/oauth/token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: `grant_type=client_credentials&client_id=${this.config.clientId}&client_secret=${this.config.clientSecret}`
      // });
      // const data = await response.json();
      // this.config.accessToken = data.access_token;
      
      this.config.accessToken = 'mock_access_token_' + Date.now();
      this.config.tokenExpiry = new Date(Date.now() + 3600000);

      return true;
    } catch (error) {
      console.error('iFood authentication error:', error);
      return false;
    }
  }

  async syncOrders(): Promise<iFoodOrder[]> {
    // PLACEHOLDER: Buscar pedidos da API do iFood
    // Por enquanto, retorna pedidos simulados
    
    if (this.orders.size === 0) {
      this.simulateDemoOrders();
    }

    return this.getOrders();
  }

  private simulateDemoOrders() {
    const demoOrders: iFoodOrder[] = [
      {
        id: uuidv4(),
        externalId: 'IFOOD-001',
        orderId: '12345',
        restaurantId: this.config?.restaurantId || 'rest-001',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        orderType: 'DELIVERY',
        items: [
          { id: uuidv4(), name: 'X-Bacon Especial', quantity: 2, price: 28.90, total: 57.80 },
          { id: uuidv4(), name: 'Batata Frita M', quantity: 1, price: 18.90, total: 18.90 },
          { id: uuidv4(), name: 'Refrigerante 600ml', quantity: 2, price: 8.90, total: 17.80 },
        ],
        subtotal: 94.50,
        total: 106.50,
        discount: 0,
        deliveryFee: 12.00,
        address: {
          street: 'Av. Paulista',
          number: '1000',
          complement: 'Apto 501',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01310000',
          reference: 'Próximo ao metrô',
        },
        customer: {
          id: 'cust-001',
          name: 'Maria Silva',
          phone: '(11) 98765-4321',
        },
        status: 'RECEIVED',
        estimatedDeliveryTime: new Date(Date.now() + 2700000).toISOString(),
        payment: {
          method: 'ONLINE',
          amount: 106.50,
        },
      },
      {
        id: uuidv4(),
        externalId: 'IFOOD-002',
        orderId: '12346',
        restaurantId: this.config?.restaurantId || 'rest-001',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        orderType: 'DELIVERY',
        items: [
          { id: uuidv4(), name: 'Combo Família', quantity: 1, price: 89.90, total: 89.90 },
          { id: uuidv4(), name: 'Suco Natural 500ml', quantity: 3, price: 12.90, total: 38.70 },
        ],
        subtotal: 128.60,
        total: 143.60,
        discount: 5.00,
        deliveryFee: 15.00,
        address: {
          street: 'Rua Augusta',
          number: '500',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01305000',
        },
        customer: {
          id: 'cust-002',
          name: 'João Santos',
          phone: '(11) 99876-5432',
        },
        status: 'READY',
        estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(),
        payment: {
          method: 'ONLINE',
          amount: 143.60,
        },
      },
    ];

    demoOrders.forEach(order => this.orders.set(order.id, order));
    this.notifyListeners();
  }

  async updateStatus(orderId: string, status: iFoodStatus): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.status = status;
    this.orders.set(orderId, order);
    this.notifyListeners();

    // PLACEHOLDER: Enviar atualização para iFood API
    // await fetch(`https://ws.ifood.com.br/orders/v3.0/orders/${order.externalId}/status`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config?.accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ status })
    // });

    return true;
  }

  async dispatchOrder(orderId: string, _deliveryPerson: iFoodDeliveryPerson): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.status = 'DISPATCHED';
    this.orders.set(orderId, order);
    this.notifyListeners();

    // PLACEHOLDER: Registrar entregador no iFood
    return true;
  }

  convertToOrder(ifoodOrder: iFoodOrder): Partial<Order> {
    const items: OrderItem[] = ifoodOrder.items.map(item => ({
      id: uuidv4(),
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      modifiers: [],
      total: item.total,
      status: 'pending' as const,
      notes: item.notes,
    }));

    return {
      items,
      subtotal: ifoodOrder.subtotal,
      discount: ifoodOrder.discount,
      tax: ifoodOrder.deliveryFee,
      total: ifoodOrder.total,
      type: ifoodOrder.orderType === 'DELIVERY' ? 'delivery' : 'takeout',
      status: 'pending',
      notes: `iFood #${ifoodOrder.orderId}`,
    };
  }

  setNewOrderHandler(handler: (order: iFoodOrder) => void) {
    // PLACEHOLDER: Configurar webhook listener para novos pedidos
    // if (this.config?.webhookUrl) {
    //   // Configurar servidor para ouvir webhooks do iFood
    // }
    
    // Para demo, simula novos pedidos periódicos
    setInterval(() => {
      if (Math.random() < 0.1) {
        const newOrder: iFoodOrder = {
          id: uuidv4(),
          externalId: `IFOOD-${Date.now()}`,
          orderId: String(12347 + this.orders.size),
          restaurantId: this.config?.restaurantId || 'rest-001',
          createdAt: new Date().toISOString(),
          orderType: 'DELIVERY',
          items: [
            { id: uuidv4(), name: 'Pizza Grande', quantity: 1, price: 59.90, total: 59.90 },
          ],
          subtotal: 59.90,
          total: 74.90,
          discount: 0,
          deliveryFee: 15.00,
          customer: { id: uuidv4(), name: 'Novo Cliente', phone: '(11) 99999-9999' },
          status: 'RECEIVED',
          payment: { method: 'ONLINE', amount: 74.90 },
        };
        this.orders.set(newOrder.id, newOrder);
        this.notifyListeners();
        handler(newOrder);
      }
    }, 30000);
  }
}

export const ifoodService = new iFoodService();
export type { iFoodConfig, iFoodOrder, iFoodStatus, iFoodDeliveryPerson };