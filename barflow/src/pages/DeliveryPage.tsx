import { useState, useEffect, useMemo } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { ifoodService, type iFoodOrder, type iFoodDeliveryPerson } from '../services/ifoodService';
import { nfceService } from '../services/nfceService';
import { toast } from 'sonner';
import { 
  Truck, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  User,
  Package,
  RefreshCw,
  Receipt,
  Settings
} from 'lucide-react';

type iFoodStatus = 'RECEIVED' | 'ACCEPTED' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Package }> = {
  RECEIVED: { label: 'Recebido', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: Package },
  ACCEPTED: { label: 'Aceito', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Clock },
  READY: { label: 'Pronto', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: Check },
  DISPATCHED: { label: 'Saiu', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: Check },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: X },
  CONFIRMED: { label: 'Confirmado', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', icon: Check },
};

const KANBAN_COLUMNS: iFoodStatus[] = ['RECEIVED', 'ACCEPTED', 'READY', 'DISPATCHED'];

export function DeliveryPage() {
  const { createOrder } = useCompanyStore();
  const [ifoodOrders, setIfoodOrders] = useState<iFoodOrder[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<iFoodDeliveryPerson[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<iFoodOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [nfceLoading, setNfceLoading] = useState(false);

  const demoDeliveryPersons: iFoodDeliveryPerson[] = [
    { id: '1', name: 'Carlos Silva', phone: '(11) 99999-1111', vehicle: 'Moto' },
    { id: '2', name: 'Paulo Santos', phone: '(11) 99999-2222', vehicle: 'Moto' },
    { id: '3', name: 'Roberto Lima', phone: '(11) 99999-3333', vehicle: 'Carro' },
    { id: '4', name: 'Marcos Oliveira', phone: '(11) 99999-4444', vehicle: 'Moto' },
  ];

  useEffect(() => {
    setDeliveryPersons(demoDeliveryPersons);

    const unsubscribe = ifoodService.subscribe(setIfoodOrders);
    ifoodService.syncOrders();

    ifoodService.setNewOrderHandler((order) => {
      toast.info(`Novo pedido iFood #${order.orderId}`, {
        description: `${order.items.length} item(s) - ${order.customer.name}`,
        duration: 5000,
      });
    });

    return () => { unsubscribe(); };
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: iFoodStatus) => {
    setIsLoading(true);
    const success = await ifoodService.updateStatus(orderId, newStatus);
    setIsLoading(false);

    if (success) {
      toast.success(`Pedido ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } else {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDispatchOrder = (orderId: string) => {
    if (deliveryPersons.length === 0) {
      toast.error('Nenhum entregador disponível');
      return;
    }

    const order = ifoodOrders.find(o => o.id === orderId);
    if (!order) return;

    const person = deliveryPersons[0];
    ifoodService.dispatchOrder(orderId, person);
    toast.success(`Pedido saiu para entrega com ${person.name}`);
  };

  const handleEmitNFCe = async (order: iFoodOrder) => {
    setNfceLoading(true);

    const orderData: Partial<import('../types').Order> = {
      type: 'delivery',
      status: 'pending',
      items: order.items.map(item => ({
        id: crypto.randomUUID(),
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        modifiers: [],
        total: item.total,
        status: 'pending' as const,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.deliveryFee,
      total: order.total,
      notes: `iFood #${order.orderId}`,
      created_by: '',
      company_id: '',
    };

    const created = createOrder(orderData as import('../types').Order);
    const nfceResult = await nfceService.emitNFCe(created);

    setNfceLoading(false);

    if (nfceResult.success) {
      toast.success('NFC-e emitida!', {
        description: `Chave: ${nfceResult.key}`,
      });
    } else {
      toast.error('Erro na NFC-e', {
        description: nfceResult.error,
      });
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await ifoodService.syncOrders();
    setIsLoading(false);
    toast.success('Pedidos sincronizados');
  };

  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, iFoodOrder[]> = {
      RECEIVED: [],
      ACCEPTED: [],
      READY: [],
      DISPATCHED: [],
      DELIVERED: [],
      CANCELLED: [],
    };

    ifoodOrders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  }, [ifoodOrders]);

  const totalOrders = ifoodOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const pendingOrders = ordersByStatus.RECEIVED?.length || 0;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Truck size={32} className="text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Delivery Hub</h1>
            <p className="text-gray-400">
              {totalOrders} pedidos ativos | {pendingOrders} novos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings size={20} className="text-gray-400" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw size={20} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        <div className="flex-1 grid grid-cols-4 gap-4 overflow-x-auto">
          {KANBAN_COLUMNS.map((status) => {
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;
            const orders = ordersByStatus[status] || [];

            return (
              <div
                key={status}
                className="bg-gray-800/50 rounded-xl p-4 flex flex-col min-w-[280px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                      <config.icon className={config.color} size={16} />
                    </div>
                    <span className="font-semibold text-white">{config.label}</span>
                  </div>
                  <span className={`${config.bgColor} ${config.color} px-2 py-0.5 rounded-full text-sm font-medium`}>
                    {orders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-gray-900 rounded-lg p-3 border cursor-pointer transition-all hover:border-gray-600 ${
                        selectedOrder?.id === order.id ? 'border-primary-500' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">#{order.orderId}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>

                      <h4 className="font-medium text-white mb-1">{order.customer.name}</h4>

                      <div className="text-sm text-gray-400 mb-2">
                        {order.items.length} item(s) | R$ {order.total.toFixed(2).replace('.', ',')}
                      </div>

                      {order.address && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <MapPin size={12} />
                          <span className="truncate">{order.address.street}, {order.address.number}</span>
                        </div>
                      )}

                      <div className="flex gap-1">
                        {status === 'RECEIVED' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(order.id, 'ACCEPTED');
                              }}
                              className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                              Aceitar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(order.id, 'CANCELLED');
                              }}
                              className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                              Recusar
                            </button>
                          </>
                        )}

                        {status === 'ACCEPTED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, 'READY');
                            }}
                            className="flex-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Pronto
                          </button>
                        )}

                        {status === 'READY' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDispatchOrder(order.id);
                            }}
                            className="flex-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Dispatch
                          </button>
                        )}

                        {status === 'DISPATCHED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, 'DELIVERED');
                            }}
                            className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Entregue
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <config.icon size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum pedido</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedOrder && (
          <div className="w-96 bg-gray-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white">Pedido #{selectedOrder.orderId}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${STATUS_CONFIG[selectedOrder.status]?.bgColor || 'bg-gray-500/20'} ${STATUS_CONFIG[selectedOrder.status]?.color || 'text-gray-400'} mb-4`}>
              {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
            </div>

            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Cliente</h4>
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-gray-500" />
                <span className="text-white">{selectedOrder.customer.name}</span>
              </div>
              {selectedOrder.customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">{selectedOrder.customer.phone}</span>
                </div>
              )}
            </div>

            {selectedOrder.address && (
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Entrega</h4>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-white">{selectedOrder.address.street}, {selectedOrder.address.number}</p>
                    {selectedOrder.address.complement && (
                      <p className="text-gray-400">{selectedOrder.address.complement}</p>
                    )}
                    <p className="text-gray-400">{selectedOrder.address.neighborhood} - {selectedOrder.address.city}/{selectedOrder.address.state}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 bg-gray-900 rounded-lg p-3 mb-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Itens</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="text-white">{item.quantity}x {item.name}</span>
                      {item.notes && (
                        <p className="text-xs text-gray-500">{item.notes}</p>
                      )}
                    </div>
                    <span className="text-gray-400">R$ {item.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">R$ {selectedOrder.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Desconto</span>
                  <span className="text-green-400">-R$ {selectedOrder.discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Entrega</span>
                <span className="text-white">R$ {selectedOrder.deliveryFee.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-700">
                <span className="text-white">Total</span>
                <span className="text-primary-500">R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleEmitNFCe(selectedOrder)}
                disabled={nfceLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Receipt size={18} />
                {nfceLoading ? 'Emitindo NFC-e...' : 'Emitir NFC-e'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfig && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={24} className="text-primary-500" />
              Configurações iFood
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client ID</label>
                <input
                  type="text"
                  placeholder="Seu Client ID do iFood"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client Secret</label>
                <input
                  type="password"
                  placeholder="Seu Client Secret do iFood"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Restaurant ID</label>
                <input
                  type="text"
                  placeholder="Seu Restaurant ID"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowConfig(false);
                  toast.success('Configurações salvas');
                }}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}