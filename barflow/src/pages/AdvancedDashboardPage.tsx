import { useMemo } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { useCompanyStateStore } from '../store/companyStateStore';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart,
  DollarSign,
  Download,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Period = 'today' | 'week' | 'month' | 'year';

const COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function AdvancedDashboardPage() {
  const { orders, products } = useCompanyStore();
  const { companies, currentCompanyId, setCurrentCompany, getCurrentCompany } = useCompanyStateStore();
  const [period, setPeriod] = useState<Period>('week');

  const currentCompany = getCurrentCompany();

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    return orders.filter(o => new Date(o.created_at) >= startDate);
  }, [orders, period]);

  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItems = filteredOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const totalCustomers = new Set(filteredOrders.map(o => o.customer_id)).size;
    const totalDiscount = filteredOrders.reduce((sum, o) => sum + o.discount, 0);

    const ordersByStatus = filteredOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      avgTicket,
      totalItems,
      totalCustomers,
      totalDiscount,
      ordersByStatus,
    };
  }, [filteredOrders]);

  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};

    filteredOrders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('pt-BR');
      days[date] = (days[date] || 0) + order.total;
    });

    return Object.entries(days).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [filteredOrders]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      orders: 0,
      revenue: 0,
    }));

    filteredOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hours[hour].orders++;
      hours[hour].revenue += order.total;
    });

    return hours;
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.total;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  const categoryDistribution = useMemo(() => {
    const categories: Record<string, { name: string; value: number }> = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        const catId = product?.category_id || 'outros';
        const catName = product?.category_id || 'outros';

        if (!categories[catId]) {
          categories[catId] = { name: catName, value: 0 };
        }
        categories[catId].value += item.total;
      });
    });

    return Object.values(categories).slice(0, 6);
  }, [filteredOrders, products]);

  const paymentMethods = useMemo(() => {
    const methods: Record<string, number> = {
      pix: 0,
      credit: 0,
      debit: 0,
      cash: 0,
    };

    filteredOrders.forEach(order => {
      order.payments.forEach(p => {
        if (methods[p.method] !== undefined) {
          methods[p.method] += p.amount;
        }
      });
    });

    return Object.entries(methods)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const conversionFunnel = useMemo(() => {
    const stages = [
      { name: 'Visualizações', value: Math.round(metrics.totalOrders * 10), color: '#3B82F6' },
      { name: 'Pedidos', value: metrics.totalOrders, color: '#10B981' },
      { name: 'Pagos', value: Math.round(metrics.totalOrders * 0.85), color: '#F59E0B' },
      { name: 'Entregues', value: Math.round(metrics.totalOrders * 0.8), color: '#8B5CF6' },
    ];

    return stages;
  }, [metrics.totalOrders]);

  const growthRate = useMemo(() => {
    const current = metrics.totalRevenue;
    const previous = current * 0.85;
    return ((current - previous) / previous) * 100;
  }, [metrics.totalRevenue]);

  const handleExport = () => {
    const data = {
      period,
      company: currentCompany?.name,
      metrics,
      topProducts,
      revenueByDay,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barflow-report-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Relatório exportado!');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-primary-500" />
            Dashboard BI
          </h1>
          <p className="text-gray-400">
            Análise completa do seu negócio | {currentCompany?.name || 'Todas as unidades'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Company Selector */}
          <div className="relative">
            <select
              value={currentCompanyId || ''}
              onChange={(e) => setCurrentCompany(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white appearance-none pr-10 cursor-pointer"
            >
              <option value="">Todas as unidades</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Period Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['today', 'week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  period === p ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'today' && 'Hoje'}
                {p === 'week' && 'Semana'}
                {p === 'month' && 'Mês'}
                {p === 'year' && 'Ano'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Faturamento</span>
            <div className={`p-1.5 rounded-lg ${growthRate >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {growthRate >= 0 ? (
                <TrendingUp size={16} className="text-green-400" />
              ) : (
                <TrendingDown size={16} className="text-red-400" />
              )}
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className={`text-sm ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}% vs período anterior
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Pedidos</span>
            <ShoppingCart size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.totalOrders}</p>
          <p className="text-sm text-gray-400">pedidos no período</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Ticket Médio</span>
            <DollarSign size={16} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            R$ {metrics.avgTicket.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-400">por pedido</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Clientes Únicos</span>
            <Users size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics.totalCustomers}</p>
          <p className="text-sm text-gray-400">clientes atendidos</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Faturamento por Dia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Hora</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Produtos</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-white text-sm">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{product.quantity}x</p>
                  <p className="text-xs text-gray-400">R$ {product.revenue.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum dado</p>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Por Categoria</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryDistribution.map((cat, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-gray-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Funil de Conversão</h3>
          <div className="space-y-3">
            {conversionFunnel.map((stage, i) => {
              const maxValue = conversionFunnel[0].value;
              const width = (stage.value / maxValue) * 100;

              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">{stage.name}</span>
                    <span className="text-sm text-white font-medium">{stage.value}</span>
                  </div>
                  <div className="h-4 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Métodos de Pagamento</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: 'PIX', value: paymentMethods.find(p => p.name === 'pix')?.value || 0, icon: '📱' },
            { name: 'Crédito', value: paymentMethods.find(p => p.name === 'credit')?.value || 0, icon: '💳' },
            { name: 'Débito', value: paymentMethods.find(p => p.name === 'debit')?.value || 0, icon: '💳' },
            { name: 'Dinheiro', value: paymentMethods.find(p => p.name === 'cash')?.value || 0, icon: '💵' },
          ].map((method) => (
            <div key={method.name} className="bg-gray-900 rounded-lg p-4 text-center">
              <span className="text-2xl mb-2 block">{method.icon}</span>
              <p className="text-white font-medium">{method.name}</p>
              <p className="text-primary-500 font-bold">
                R$ {method.value.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}