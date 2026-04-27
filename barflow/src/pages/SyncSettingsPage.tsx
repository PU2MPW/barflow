import { useState } from 'react';
import { useOffline } from '../hooks/useOffline';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Trash2, 
  Cloud, 
  CloudOff, 
  Database, 
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';

export function SyncSettingsPage() {
  const { isOnline, lastSync, pendingChanges, syncStatus, sync } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await sync();
    setIsSyncing(false);

    if (result.success) {
      toast.success('Sincronização completa!');
    } else {
      toast.warning(`${result.failed} item(s) falharam`);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados offline? Isso pode causar perda de dados não sincronizados.')) {
      localStorage.clear();
      toast.success('Cache limpo! Recarregue a página.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <RefreshCw className="text-primary-500" />
          Sincronização
        </h1>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Status da Conexão</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Cloud className="text-green-400" size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <CloudOff className="text-red-400" size={20} />
                </div>
              )}
              <div>
                <p className="text-white font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-sm text-gray-400">
                  {isOnline ? 'Conectado ao servidor' : 'Usando dados locais'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">
                  {lastSync 
                    ? new Date(lastSync).toLocaleString('pt-BR')
                    : 'Nunca'
                  }
                </p>
                <p className="text-sm text-gray-400">Última sincronização</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Changes Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Alterações Pendentes</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pendingChanges > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'
              }`}>
                {pendingChanges > 0 ? (
                  <AlertTriangle className="text-yellow-400" size={20} />
                ) : (
                  <Check className="text-green-400" size={20} />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {pendingChanges === 0 
                    ? 'Tudo sincronizado' 
                    : `${pendingChanges} alteração(ões) pendente(s)`
                  }
                </p>
                <p className="text-sm text-gray-400">
                  {pendingChanges > 0
                    ? 'Aguardando conexão ou sincronização'
                    : 'Seus dados estão seguros'
                  }
                </p>
              </div>
            </div>
          </div>

          {pendingChanges > 0 && (
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-sm text-yellow-400">
                <strong>Atenção:</strong> Alterações não sincronizadas serão perdidas 
                se você limpar o cache do navegador.
              </p>
            </div>
          )}
        </div>

        {/* Sync Status Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sincronização Automática</h2>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              syncStatus === 'pending' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-gray-300 capitalize">
              {syncStatus === 'synced' && 'Sincronizado'}
              {syncStatus === 'syncing' && 'Sincronizando...'}
              {syncStatus === 'pending' && 'Pendente'}
              {syncStatus === 'error' && 'Erro na sincronização'}
            </span>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            A sincronização automática ocorre a cada 30 segundos quando há conexão.
          </div>

          <button
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>

        {/* Cache Management Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="text-red-400" />
            Gerenciar Cache
          </h2>
          
          <div className="text-sm text-gray-400 mb-4">
            Limpar o cache remove todos os dados offline. Use com cautela.
          </div>

          <button
            onClick={handleClearCache}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={20} />
            Limpar Cache Local
          </button>
        </div>
      </div>
    </div>
  );
}