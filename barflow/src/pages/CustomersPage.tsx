import { useState } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { toast } from 'sonner';
import { Users, Plus, Search, Phone, Mail, Edit2, Crown, Medal, Star, User } from 'lucide-react';
import type { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TIER_CONFIG = {
  vip: { icon: Crown, color: 'text-purple-400', bg: 'bg-purple-400/20', label: 'VIP' },
  gold: { icon: Medal, color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Ouro' },
  silver: { icon: Star, color: 'text-gray-400', bg: 'bg-gray-400/20', label: 'Prata' },
  standard: { icon: User, color: 'text-blue-400', bg: 'bg-blue-400/20', label: 'Padrão' },
};

export function CustomersPage() {
  const { customers, setCustomers } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveCustomer = (data: Partial<Customer>) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...data } : c));
      toast.success('Cliente atualizado');
    } else {
      const newCustomer: Customer = {
        id: uuidv4(),
        name: data.name || '',
        phone: data.phone || '',
        email: data.email,
        loyalty_points: 0,
        loyalty_tier: 'standard',
        total_spent: 0,
        visit_count: 0,
        company_id: '',
        created_at: new Date().toISOString(),
      };
      setCustomers([...customers, newCustomer]);
      toast.success('Cliente criado');
    }
    setEditingCustomer(null);
    setShowModal(false);
  };

  const updatePoints = (customerId: string, points: number) => {
    setCustomers(customers.map(c => {
      if (c.id !== customerId) return c;
      const newPoints = c.loyalty_points + points;
      let newTier = c.loyalty_tier;
      if (newPoints >= 1000) newTier = 'vip';
      else if (newPoints >= 500) newTier = 'gold';
      else if (newPoints >= 200) newTier = 'silver';
      return { ...c, loyalty_points: newPoints, loyalty_tier: newTier };
    }));
    toast.success('Pontos atualizados');
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-primary-500" />
            Clientes
          </h1>
          <p className="text-gray-400">{customers.length} clientes cadastrados</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none w-64"
            />
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingCustomer(null); }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Contato</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tier</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Pontos</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Total Gasto</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Visitas</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.map((customer) => {
                const tier = TIER_CONFIG[customer.loyalty_tier];
                const TierIcon = tier.icon;
                return (
                  <tr key={customer.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${tier.bg} ${tier.color} rounded-full flex items-center justify-center`}>
                          <TierIcon size={20} />
                        </div>
                        <span className="text-white font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-gray-400 flex items-center gap-2 text-sm">
                          <Phone size={14} /> {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="text-gray-400 flex items-center gap-2 text-sm">
                            <Mail size={14} /> {customer.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${tier.bg} ${tier.color}`}>
                        {tier.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary-500 font-medium">{customer.loyalty_points}</span>
                        <button
                          onClick={() => updatePoints(customer.id, 10)}
                          className="text-xs bg-primary-500/20 text-primary-500 px-2 py-1 rounded hover:bg-primary-500/30"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-medium">
                      R$ {customer.total_spent.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {customer.visit_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditingCustomer(customer); setShowModal(true); }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveCustomer({
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nome</label>
                  <input
                    name="name"
                    defaultValue={editingCustomer?.name}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={editingCustomer?.phone}
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email (opcional)</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingCustomer?.email}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}