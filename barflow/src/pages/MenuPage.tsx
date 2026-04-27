import { useState } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { toast } from 'sonner';
import { UtensilsCrossed, Plus, Search, Edit2, Trash2, Save } from 'lucide-react';
import type { Category, Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function MenuPage() {
  const { categories, products, setCategories, setProducts } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveCategory = (data: Partial<Category>) => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...data } : c));
      toast.success('Categoria atualizada');
    } else {
      const newCategory: Category = {
        id: uuidv4(),
        name: data.name || '',
        icon: data.icon || '🍽️',
        color: data.color || '#FF6B35',
        order: categories.length,
        active: true,
        company_id: data.company_id || '',
      };
      setCategories([...categories, newCategory]);
      toast.success('Categoria criada');
    }
    setEditingCategory(null);
    setShowModal(false);
  };

  const handleSaveProduct = (data: Partial<Product>) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
      toast.success('Produto atualizado');
    } else {
      const newProduct: Product = {
        id: uuidv4(),
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        cost: data.cost || 0,
        category_id: data.category_id || '',
        active: true,
        preparation_time: 15,
        modifiers: [],
        company_id: data.company_id || '',
      };
      setProducts([...products, newProduct]);
      toast.success('Produto criado');
    }
    setEditingProduct(null);
    setShowModal(false);
  };

  const toggleProductActive = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, active: !p.active } : p
    ));
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="text-primary-500" />
            Cardápio
          </h1>
          <p className="text-gray-400">{products.length} produtos em {categories.length} categorias</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setActiveTab('categories');
            setEditingCategory(null);
            setEditingProduct(null);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Item
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'categories' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Categorias ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'products' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Produtos ({products.length})
        </button>
      </div>

      {activeTab === 'categories' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-primary-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{category.name}</h3>
                  <p className="text-sm text-gray-400">
                    {products.filter(p => p.category_id === category.id).length} produtos
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                >
                  <Edit2 size={16} className="inline" />
                </button>
                <button
                  onClick={() => setCategories(categories.filter(c => c.id !== category.id))}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 size={16} className="inline" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none max-w-md"
            />
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Produto</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Categoria</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Preço</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">🍽️</div>
                        )}
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-sm text-gray-400">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {categories.find(c => c.id === product.category_id)?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-primary-500 font-medium">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleProductActive(product.id)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {product.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingCategory ? 'Editar Categoria' : editingProduct ? 'Editar Produto' : 'Novo Item'}
            </h3>
            {activeTab === 'categories' ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveCategory({
                  name: formData.get('name') as string,
                  icon: formData.get('icon') as string,
                  color: formData.get('color') as string,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nome</label>
                    <input
                      name="name"
                      defaultValue={editingCategory?.name}
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ícone (emoji)</label>
                    <input
                      name="icon"
                      defaultValue={editingCategory?.icon}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cor</label>
                    <input
                      name="color"
                      type="color"
                      defaultValue={editingCategory?.color || '#FF6B35'}
                      className="w-full h-12 bg-gray-900 border border-gray-700 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingCategory(null); setEditingProduct(null); }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveProduct({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  price: parseFloat(formData.get('price') as string),
                  cost: parseFloat(formData.get('cost') as string) || 0,
                  category_id: formData.get('category_id') as string,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nome</label>
                    <input
                      name="name"
                      defaultValue={editingProduct?.name}
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                    <textarea
                      name="description"
                      defaultValue={editingProduct?.description}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Preço</label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingProduct?.price}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Categoria</label>
                      <select
                        name="category_id"
                        defaultValue={editingProduct?.category_id}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Selecione</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingCategory(null); setEditingProduct(null); }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Salvar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}