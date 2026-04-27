import { useState, useMemo } from 'react';
import { useTabsStore } from '../store/tabsStore';
import { useTabItemsStore } from '../store/tabItemsStore';
import { useCompanyStore } from '../store/companyStore';
import { toast } from 'sonner';
import { 
  Receipt, 
  Plus, 
  Search, 
  Clock, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Split,
  X,
  Check,
  Trash2,
  Minus,
  Plus as PlusIcon,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import type { PaymentMethod } from '../types';

const PAYMENT_METHODS: { method: PaymentMethod; icon: typeof CreditCard; label: string }[] = [
  { method: 'pix', icon: Smartphone, label: 'PIX' },
  { method: 'credit', icon: CreditCard, label: 'Crédito' },
  { method: 'debit', icon: CreditCard, label: 'Débito' },
  { method: 'cash', icon: Banknote, label: 'Dinheiro' },
];

export function TabsPage() {
  const { openTabs, activeTabId, setActiveTab, createTab, closeTab, cancelTab } = useTabsStore();
  const { getItems, getTotal, addItem, removeItem, updateQuantity, clearItems } = useTabItemsStore();
  const { products } = useCompanyStore();
  
  const [showNewTab, setShowNewTab] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [splitConfig, setSplitConfig] = useState<{
    type: 'equal' | 'custom' | 'item';
    parts: number;
    amounts: number[];
  }>({ type: 'equal', parts: 2, amounts: [] });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [moneyReceived, setMoneyReceived] = useState('');

  const [newTabData, setNewTabData] = useState({
    customerName: '',
    customerPhone: '',
    preAuthorizedAmount: 100,
  });

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const activeItems = activeTabId ? getItems(activeTabId) : [];
  const activeTotal = activeTabId ? getTotal(activeTabId) : 0;

  const openTabsList = openTabs.filter(t => t.status === 'open');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.active && (
        !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [products, searchQuery]);

  const handleCreateTab = async () => {
    if (!newTabData.customerName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    const tab = await createTab({
      customerName: newTabData.customerName,
      customerPhone: newTabData.customerPhone,
      preAuthorizedAmount: newTabData.preAuthorizedAmount,
    });
    if (tab) {
      setActiveTab(tab.id);
    }
    setShowNewTab(false);
    setNewTabData({ customerName: '', customerPhone: '', preAuthorizedAmount: 100 });
    toast.success('Comanda aberta!');
  };

  const handleCloseTab = () => {
    if (!activeTabId) return;
    
    const balance = getTotal(activeTabId);
    if (balance > 0) {
      toast.error('É necessário receber o valor antes de fechar a comanda');
      return;
    }

    closeTab(activeTabId);
    clearItems(activeTabId);
    setActiveTab(null);
    toast.success('Comanda fechada!');
  };

  const handleCancelTab = () => {
    if (!activeTabId) return;
    if (confirm('Tem certeza que deseja cancelar esta comanda?')) {
      cancelTab(activeTabId);
      clearItems(activeTabId);
      setActiveTab(null);
      toast.success('Comanda cancelada');
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddSelectedProducts = () => {
    if (!activeTabId || selectedProducts.size === 0) return;

    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        addItem(activeTabId, {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          modifiers: [],
          total: product.price,
        });
      }
    });

    setSelectedProducts(new Set());
    toast.success(`${selectedProducts.size} item(s) adicionado(s)`);
  };

  const getTimeSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const change = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(moneyReceived) || 0;
    return received - activeTotal;
  }, [paymentMethod, moneyReceived, activeTotal]);

  return (
    <div className="h-full flex">
      {/* Lista de Comandas */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt size={20} className="text-primary-500" />
              Comandas
            </h2>
            <button
              onClick={() => setShowNewTab(true)}
              className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-400">{openTabsList.length} comandas abertas</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {openTabsList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                activeTabId === tab.id
                  ? 'bg-primary-500/20 border-2 border-primary-500'
                  : 'bg-gray-900 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white">{tab.customer_name}</span>
                <span className="text-xs text-gray-400">{getTimeSince(tab.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                {tab.table_id && (
                  <span className="text-sm text-gray-400">Mesa {tab.table_id}</span>
                )}
                {tab.pre_authorized_amount > 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                    Pré-autorizado: R$ {tab.pre_authorized_amount}
                  </span>
                )}
              </div>
            </button>
          ))}

          {openTabsList.length === 0 && (
            <div className="text-center py-8">
              <Receipt size={48} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">Nenhuma comanda aberta</p>
              <button
                onClick={() => setShowNewTab(true)}
                className="mt-3 text-primary-500 hover:text-primary-400"
              >
                Abrir nova comanda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detalhes da Comanda */}
      <div className="flex-1 flex flex-col">
        {activeTab ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
              <div>
                <h2 className="text-xl font-bold text-white">{activeTab.customer_name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  {activeTab.customer_phone && (
                    <span className="text-sm text-gray-400">{activeTab.customer_phone}</span>
                  )}
                  {activeTab.table_id && (
                    <span className="text-sm text-gray-400">Mesa {activeTab.table_id}</span>
                  )}
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    {getTimeSince(activeTab.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelTab}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Produtos */}
            <div className="flex-1 flex">
              {/* Lista de Itens */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Itens da Comanda</h3>
                  <span className="text-sm text-gray-400">{activeItems.length} itens</span>
                </div>

                <div className="space-y-3">
                  {activeItems.map((item) => (
                    <div key={item.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{item.product_name}</h4>
                          <p className="text-sm text-gray-400">
                            R$ {item.unit_price.toFixed(2).replace('.', ',')} cada
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary-500 font-bold">
                            R$ {item.total.toFixed(2).replace('.', ',')}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={() => updateQuantity(activeTabId!, item.id, item.quantity - 1)}
                              className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(activeTabId!, item.id, item.quantity + 1)}
                              className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600"
                            >
                              <PlusIcon size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(activeTabId!, item.id)}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remover
                      </button>
                    </div>
                  ))}

                  {activeItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum item na comanda</p>
                      <p className="text-sm mt-1">Adicione produtos abaixo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Adicionar Produtos */}
              <div className="w-96 border-l border-gray-700 p-4 flex flex-col">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                        selectedProducts.has(product.id)
                          ? 'bg-primary-500/20 border border-primary-500'
                          : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedProducts.has(product.id) && (
                          <Check size={16} className="text-primary-500" />
                        )}
                        <p className="text-white font-medium text-sm">{product.name}</p>
                      </div>
                      <p className="text-primary-500 font-bold text-sm">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </p>
                    </button>
                  ))}
                </div>

                {selectedProducts.size > 0 && (
                  <button
                    onClick={handleAddSelectedProducts}
                    className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Adicionar {selectedProducts.size} item(s)
                  </button>
                )}
              </div>
            </div>

            {/* Footer com Total e Pagamento */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-gray-400">Total</span>
                  <p className="text-3xl font-bold text-white">
                    R$ {activeTotal.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSplit(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Split size={18} />
                    Dividir
                  </button>
                  <button
                    onClick={() => setShowPayment(true)}
                    disabled={activeTotal === 0}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <CreditCard size={18} />
                    Pagar
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Receipt size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-xl text-gray-400 mb-2">Selecione uma comanda</p>
              <p className="text-gray-500">ou abra uma nova comanda</p>
              <button
                onClick={() => setShowNewTab(true)}
                className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <UserPlus size={18} />
                Nova Comanda
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Nova Comanda */}
      {showNewTab && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Receipt size={24} className="text-primary-500" />
              Abrir Nova Comanda
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome do Cliente *</label>
                <input
                  type="text"
                  value={newTabData.customerName}
                  onChange={(e) => setNewTabData({ ...newTabData, customerName: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={newTabData.customerPhone}
                  onChange={(e) => setNewTabData({ ...newTabData, customerPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Valor Pré-autorizado (opcional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    value={newTabData.preAuthorizedAmount}
                    onChange={(e) => setNewTabData({ ...newTabData, preAuthorizedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valor bloqueado no cartão do cliente na abertura
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTab(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTab}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Abrir Comanda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pagamento */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard size={24} className="text-green-500" />
              Forma de Pagamento
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">Valor a receber</p>
              <p className="text-3xl font-bold text-white">
                R$ {activeTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {PAYMENT_METHODS.map(({ method, icon: Icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === method
                      ? 'bg-green-500 text-white'
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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    value={moneyReceived}
                    onChange={(e) => setMoneyReceived(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-green-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                {change > 0 && (
                  <div className="mt-3 p-3 bg-green-500/20 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} className="text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Troco para</p>
                      <p className="text-xl font-bold text-green-400">
                        R$ {change.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPayment(false);
                  setPaymentMethod('pix');
                  setMoneyReceived('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearItems(activeTabId!);
                  setShowPayment(false);
                  toast.success('Pagamento registrado!');
                  handleCloseTab();
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Split de Conta */}
      {showSplit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Split size={24} className="text-primary-500" />
              Dividir Conta
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Tipo de Divisão</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'equal', label: 'Igual' },
                  { value: 'custom', label: 'Valores' },
                  { value: 'item', label: 'Por Item' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSplitConfig({ ...splitConfig, type: value as typeof splitConfig.type })}
                    className={`p-3 rounded-lg font-medium transition-colors ${
                      splitConfig.type === value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {splitConfig.type === 'equal' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Número de pessoas</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={splitConfig.parts}
                  onChange={(e) => setSplitConfig({ ...splitConfig, parts: parseInt(e.target.value) || 2 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Cada pessoa paga</p>
                  <p className="text-2xl font-bold text-primary-500">
                    R$ {(activeTotal / splitConfig.parts).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSplit(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}