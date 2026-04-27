import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useCompanyStore } from '../store/companyStore';
import type { Product, OrderItem } from '../types';
import { Search, ShoppingCart, Trash2, Minus, Plus, CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type OrderType = 'dine_in' | 'bar' | 'takeout' | 'delivery';
type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix';

export function PDVPage() {
  const { user } = useAuthStore();
  const { categories, products, tables, createOrder, setTables } = useCompanyStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [moneyReceived, setMoneyReceived] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return p.active && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const change = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(moneyReceived) || 0;
    return received - cartTotal;
  }, [moneyReceived, cartTotal, paymentMethod]);

  const addToCart = (product: Product) => {
    const newItem: OrderItem = {
      id: uuidv4(),
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      modifiers: [],
      total: product.price,
      status: 'pending',
    };

    setCart([...cart, newItem]);
    toast.success(`${product.name} adicionado`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty, total: newQty * item.unit_price };
        }
        return item;
      }).filter(Boolean) as OrderItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable(null);
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error('Adicione itens ao pedido');
      return;
    }

    const order = createOrder({
      table_id: selectedTable ? String(selectedTable) : undefined,
      type: orderType,
      status: 'pending',
      items: cart,
      subtotal: cartTotal,
      discount: 0,
      tax: 0,
      total: cartTotal,
      payments: [{
        id: uuidv4(),
        method: paymentMethod,
        amount: cartTotal,
        created_at: new Date().toISOString(),
      }],
      created_by: user?.id || '',
      company_id: '',
    });

    if (order.table_id) {
      setTables(tables.map(t => 
        t.number === selectedTable ? { ...t, status: 'occupied', current_order_id: order.id } : t
      ));
    }

    toast.success('Pedido criado com sucesso!');
    clearCart();
    setShowPayment(false);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            {(['dine_in', 'bar', 'takeout', 'delivery'] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  orderType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type === 'dine_in' && 'Mesa'}
                {type === 'bar' && 'Balcão'}
                {type === 'takeout' && 'Para Viagem'}
                {type === 'delivery' && 'Delivery'}
              </button>
            ))}
          </div>

          {orderType === 'dine_in' && (
            <select
              value={selectedTable || ''}
              onChange={(e) => setSelectedTable(e.target.value ? Number(e.target.value) : null)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              <option value="">Selecionar Mesa</option>
              {tables.filter(t => t.status === 'free').map((table) => (
                <option key={table.id} value={table.number}>
                  Mesa {table.number}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex-1 bg-gray-800/50 rounded-2xl p-4 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-gray-900 border border-gray-700 rounded-xl p-3 flex flex-col items-center hover:border-primary-500 hover:bg-gray-800/80 transition-all"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-800 rounded-lg mb-2 flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
                <h3 className="font-medium text-white text-sm text-center">{product.name}</h3>
                <p className="text-primary-500 font-bold mt-1">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShoppingCart size={20} />
              Pedido
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Limpar
              </button>
            )}
          </div>
          {orderType === 'dine_in' && selectedTable && (
            <p className="text-sm text-gray-400 mt-1">Mesa {selectedTable}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum item adicionado</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.product_name}</h4>
                    <p className="text-sm text-gray-400">
                      R$ {item.unit_price.toFixed(2).replace('.', ',')} each
                    </p>
                  </div>
                  <p className="text-primary-500 font-bold">
                    R$ {item.total.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700 space-y-4">
          <div className="flex items-center justify-between text-lg">
            <span className="text-gray-400">Total</span>
            <span className="text-white font-bold text-2xl">
              R$ {cartTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard size={20} />
            Fechar Pedido
          </button>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Forma de Pagamento</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { method: 'pix', icon: Smartphone, label: 'PIX' },
                { method: 'credit', icon: CreditCard, label: 'Crédito' },
                { method: 'debit', icon: CreditCard, label: 'Débito' },
                { method: 'cash', icon: Banknote, label: 'Dinheiro' },
              ].map(({ method, icon: Icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as PaymentMethod)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === method
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon size={24} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Valor Recebido</label>
                <input
                  type="number"
                  value={moneyReceived}
                  onChange={(e) => setMoneyReceived(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  placeholder="0.00"
                />
                {change > 0 && (
                  <p className="text-green-400 mt-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Troco: R$ {change.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}