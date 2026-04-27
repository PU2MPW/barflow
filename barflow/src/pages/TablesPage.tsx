import { useState } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { toast } from 'sonner';
import { Clock, Crown, Coffee, Plus, Search } from 'lucide-react';
import type { Table, TableStatus } from '../types';

export function TablesPage() {
  const { tables, setTables } = useCompanyStore();
  const [showNewOrder, setShowNewOrder] = useState<Table | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'occupied': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reserved': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'vip': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getStatusLabel = (status: TableStatus) => {
    switch (status) {
      case 'free': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'vip': return 'VIP';
    }
  };

  const updateTableStatus = (tableId: string, status: TableStatus) => {
    const updatedTables = tables.map(t => 
      t.id === tableId ? { ...t, status } : t
    );
    setTables(updatedTables);
    toast.success(`Mesa atualizada para ${getStatusLabel(status)}`);
  };

  const filteredTables = tables.filter(t => 
    t.number.toString().includes(searchQuery) ||
    getStatusLabel(t.status).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Mesas</h1>
          <p className="text-gray-400">{tables.length} mesas cadastradas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar mesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none w-64"
            />
          </div>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Nova Mesa
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className={`bg-gray-800 rounded-xl p-4 border ${table.status === 'occupied' ? 'border-red-500/30' : 'border-gray-700'} transition-all hover:border-primary-500/30`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(table.status)}`}>
                    {table.status === 'vip' ? <Crown size={20} /> : <Coffee size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Mesa {table.number}</h3>
                    <p className="text-xs text-gray-400">{table.seats} lugares</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(table.status)}`}>
                  {getStatusLabel(table.status)}
                </span>
                {table.status === 'occupied' && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock size={14} />
                    <span>00:00</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowNewOrder(table)}
                  className="flex-1 bg-primary-500/20 text-primary-500 hover:bg-primary-500/30 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Novo Pedido
                </button>
                <button
                  onClick={() => updateTableStatus(table.id, table.status === 'free' ? 'occupied' : 'free')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  {table.status === 'free' ? 'Ocupar' : 'Liberar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Coffee size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500">Nenhuma mesa encontrada</p>
          </div>
        )}
      </div>

      {showNewOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Abrir Pedido - Mesa {showNewOrder.number}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome do Cliente (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateTableStatus(showNewOrder.id, 'occupied');
                    setShowNewOrder(null);
                    toast.success('Mesa ocupada');
                  }}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Abrir Mesa
                </button>
                <button
                  onClick={() => setShowNewOrder(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}