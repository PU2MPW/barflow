import { useState, useEffect } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { toast } from 'sonner';
import { ChefHat, Clock, CheckCircle, AlertCircle, Volume2, VolumeX } from 'lucide-react';

type KDSItem = {
  id: string;
  order_id: string;
  table_number: number;
  product_name: string;
  quantity: number;
  modifiers: string[];
  notes?: string;
  status: 'new' | 'preparing' | 'ready';
  created_at: Date;
  station: string;
};

const STATIONS = ['Bebidas', 'Lanches', 'Porções', 'Churrasco'];

export function KDSPage() {
  const { orders } = useCompanyStore();
  const [items, setItems] = useState<KDSItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const newOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
    const kdsItems: KDSItem[] = [];
    
    newOrders.forEach(order => {
      order.items.forEach(item => {
        kdsItems.push({
          id: item.id,
          order_id: order.id,
          table_number: 1,
          product_name: item.product_name,
          quantity: item.quantity,
          modifiers: item.modifiers.map(m => m.name),
          notes: item.notes,
          status: item.status === 'preparing' ? 'preparing' : 'new',
          created_at: new Date(order.created_at),
          station: item.product_name.toLowerCase().includes('bebida') || item.product_name.toLowerCase().includes('suco') ? 'Bebidas' : 'Lanches',
        });
      });
    });

    setItems(kdsItems);
  }, [orders]);

  const updateItemStatus = (itemId: string, status: KDSItem['status']) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status } : item
    ));

    if (status === 'ready') {
      toast.success('Item pronto!');
    }
  };

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getTimeColor = (date: Date) => {
    const minutes = (Date.now() - date.getTime()) / 60000;
    if (minutes < 5) return 'text-green-400';
    if (minutes < 10) return 'text-yellow-400';
    if (minutes < 15) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col p-4 bg-bar-darker">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ChefHat size={32} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
            {STATIONS.map(station => (
              <div key={station} className="px-3 py-1 rounded bg-gray-700">
                <span className="text-white text-sm">{station}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
        {STATIONS.map(station => {
          const stationItems = items.filter(i => i.station === station);
          return (
            <div key={station} className="bg-gray-800/50 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white text-lg">{station}</h2>
                <span className="bg-primary-500/20 text-primary-500 px-2 py-1 rounded text-sm font-medium">
                  {stationItems.length}
                </span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto">
                {stationItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Nenhum pedido</p>
                  </div>
                ) : (
                  stationItems.map(item => (
                    <div
                      key={item.id}
                      className={`bg-gray-900 rounded-lg p-3 border-l-4 ${
                        item.status === 'new' ? 'border-blue-500' :
                        item.status === 'preparing' ? 'border-yellow-500' :
                        'border-green-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Mesa {item.table_number}</span>
                        <span className={`flex items-center gap-1 text-sm ${getTimeColor(item.created_at)}`}>
                          <Clock size={14} />
                          {getTimeSince(item.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-white">{item.quantity}x</span>
                          <span className="text-lg text-white ml-2">{item.product_name}</span>
                        </div>
                      </div>

                      {item.modifiers.length > 0 && (
                        <div className="mt-2 text-sm text-gray-400">
                          {item.modifiers.join(', ')}
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-2 text-sm text-yellow-400 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {item.notes}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        {item.status === 'new' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'preparing')}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-lg text-sm transition-colors"
                          >
                            Preparar
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'ready')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                          >
                            Pronto
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <div className="flex-1 bg-green-500/20 text-green-400 font-medium py-2 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                            <CheckCircle size={16} />
                            Entregue
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}