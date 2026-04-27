import { useMemo } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { BarChart3, ShoppingCart, Users, Table2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const { orders, customers, tables } = useCompanyStore();

  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter(o => new Date(o.created_at).toDateString() === today);
  }, [orders]);

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + o.total, 0);
  }, [todayOrders]);

  const avgTicket = useMemo(() => {
    return todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
  }, [todayRevenue, todayOrders]);

  const availableTables = tables.filter(t => t.status === 'free').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number }> = {};
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { name: item.product_name, quantity: 0 };
        }
        productSales[item.product_id].quantity += item.quantity;
      });
    });
    return Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [todayOrders]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, revenue: 0 }));
    todayOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hours[hour].revenue += order.total;
    });
    return hours;
  }, [todayOrders]);

  const stats = [
    { label: 'Pedidos Hoje', value: todayOrders.length, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { label: 'Faturamento', value: `R$ ${todayRevenue.toFixed(2).replace('.', ',')}`, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/20' },
    { label: 'Ticket Médio', value: `R$ ${avgTicket.toFixed(2).replace('.', ',')}`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/20' },
    { label: 'Clientes', value: customers.length, icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/20' },
    { label: 'Mesas Disponíveis', value: `${availableTables}/${tables.length}`, icon: Table2, color: 'text-cyan-400', bg: 'bg-cyan-400/20' },
    { label: 'Mesas Ocupadas', value: `${occupiedTables}/${tables.length}`, icon: Table2, color: 'text-pink-400', bg: 'bg-pink-400/20' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Faturamento por Hora</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" tickFormatter={(h) => `${h}h`} />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelFormatter={(h) => `${h}:00`}
                />
                <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Produtos Mais Vendidos</h2>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <span className="text-gray-400">{product.quantity} un</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum pedido hoje</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}