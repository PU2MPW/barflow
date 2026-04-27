import { useState } from 'react';
import { useCompanyStateStore } from '../store/companyStateStore';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Check,
  X,
  Copy
} from 'lucide-react';

export function MultiCompanyPage() {
  const { companies, addCompany, updateCompany, deleteCompany, setCurrentCompany } = useCompanyStateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    address: '',
    city: '',
    state: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.document) {
      toast.error('Nome e CNPJ são obrigatórios');
      return;
    }

    if (editingId) {
      updateCompany(editingId, formData);
      toast.success('Unidade atualizada!');
    } else {
      addCompany({ ...formData, active: true });
      toast.success('Unidade criada!');
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', document: '', address: '', city: '', state: '', phone: '' });
  };

  const handleEdit = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setFormData({
        name: company.name,
        document: company.document,
        address: company.address,
        city: company.city,
        state: company.state,
        phone: company.phone,
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
      deleteCompany(id);
      toast.success('Unidade removida');
    }
  };

  const handleDuplicate = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      addCompany({
        ...company,
        name: `${company.name} (Cópia)`,
        active: true,
      });
      toast.success('Unidade duplicada!');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="text-primary-500" />
              Gestão de Unidades
            </h1>
            <p className="text-gray-400">{companies.length} unidades cadastradas</p>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', document: '', address: '', city: '', state: '', phone: '' });
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Nova Unidade
          </button>
        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className={`bg-gray-800 rounded-xl p-6 border transition-all ${
                company.active ? 'border-gray-700 hover:border-primary-500/50' : 'border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-primary-500" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(company.id)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(company.id)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{company.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{company.document}</p>

              <div className="space-y-2 text-sm">
                {company.address && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span>{company.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <span>{company.city}/{company.state}</span>
                </div>
                {company.phone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={14} />
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {company.active ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                      Ativa
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                      Inativa
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCurrentCompany(company.id)}
                  className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                >
                  Ver dados →
                </button>
              </div>
            </div>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma unidade cadastrada</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              Criar primeira unidade
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {editingId ? 'Editar Unidade' : 'Nova Unidade'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome da Unidade *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: BarFlow Centro"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">CNPJ *</label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Av. Paulista, 1000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}