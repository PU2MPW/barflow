/* eslint-disable @typescript-eslint/no-explicit-any */
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { v4 as uuidv4 } from 'uuid';

PouchDB.plugin(PouchDBFind);

type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error';

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineState {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncStatus: SyncStatus;
}

class OfflineService {
  private db: PouchDB.Database;
  private syncDb: PouchDB.Database;
  private listeners: Set<(state: OfflineState) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private state: OfflineState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    pendingChanges: 0,
    syncStatus: 'synced',
  };

  constructor() {
    this.db = new PouchDB('barflow_offline');
    this.syncDb = new PouchDB('barflow_sync_queue');

    this.setupEventListeners();
    this.loadPendingChanges();
  }

  private setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private async loadPendingChanges() {
    try {
      const result = await this.syncDb.allDocs({ include_docs: true });
      this.state.pendingChanges = result.rows.length;
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading pending changes:', error);
    }
  }

  private handleOnline() {
    this.state.isOnline = true;
    this.notifyListeners();
    this.startSync();
  }

  private handleOffline() {
    this.state.isOnline = false;
    this.state.syncStatus = 'pending';
    this.notifyListeners();
    this.stopSync();
  }

  subscribe(listener: (state: OfflineState) => void) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => { this.listeners.delete(listener); };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  getState() {
    return { ...this.state };
  }

  isOnline() {
    return this.state.isOnline;
  }

  async save<T extends Record<string, unknown>>(collection: string, data: T): Promise<T> {
    const docId = data.id ? `${collection}_${data.id}` : `${collection}_${uuidv4()}`;
    const doc: any = {
      ...data,
      _id: docId,
      collection,
      created_at: (data.created_at as string) || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _syncStatus: 'pending',
    };

    try {
      try {
        const existing = await this.db.get(docId);
        doc._rev = existing._rev;
      } catch {
        // Document doesn't exist yet
      }

      const result = await this.db.put(doc);
      doc._rev = result.rev;

      if (!this.state.isOnline) {
        await this.queueChange({
          id: doc._id,
          type: doc._rev ? 'update' : 'create',
          collection,
          data: doc,
          timestamp: Date.now(),
          retries: 0,
        });
      }

      return this.cleanDoc(doc);
    } catch (error) {
      console.error(`Error saving to ${collection}:`, error);
      throw error;
    }
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    try {
      const doc = await this.db.get(`${collection}_${id}`);
      return this.cleanDoc(doc) as T;
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async getAll<T>(collection: string): Promise<T[]> {
    try {
      const result = await this.db.find({
        selector: { collection },
      });
      return result.docs.map((doc: any) => this.cleanDoc(doc)) as T[];
    } catch (error) {
      console.error(`Error getting all from ${collection}:`, error);
      return [];
    }
  }

  async delete(collection: string, id: string): Promise<void> {
    try {
      const doc = await this.db.get(`${collection}_${id}`);
      await this.db.remove(doc);

      if (!this.state.isOnline) {
        await this.queueChange({
          id: `${collection}_${id}`,
          type: 'delete',
          collection,
          data: { collection, id },
          timestamp: Date.now(),
          retries: 0,
        });
      }
    } catch (error) {
      console.error('Error deleting:', error);
      throw error;
    }
  }

  private async queueChange(item: SyncQueueItem) {
    await this.syncDb.put({
      _id: item.id,
      ...item,
    });
    this.state.pendingChanges++;
    this.notifyListeners();
  }

  async sync(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (!this.state.isOnline) {
      return { success: false, synced: 0, failed: 0 };
    }

    this.state.syncStatus = 'syncing';
    this.notifyListeners();

    let synced = 0;
    let failed = 0;

    try {
      const pending = await this.syncDb.allDocs({ include_docs: true });

      for (const row of pending.rows) {
        const item = row.doc as any as SyncQueueItem;

        try {
          await this.pushToServer(item);
          await this.syncDb.remove(row.id, row.value.rev);
          synced++;

          const doc: any = await this.db.get(item.id).catch(() => null);
          if (doc) {
            doc._syncStatus = 'synced';
            await this.db.put(doc);
          }
        } catch {
          failed++;
          if (item.retries < 3) {
            await this.syncDb.put({
              ...item,
              _id: item.id,
              retries: item.retries + 1,
            });
          } else {
            await this.syncDb.remove(row.id, row.value.rev);
          }
        }
      }

      this.state.lastSync = new Date();
      this.state.pendingChanges = pending.rows.length - failed;
      this.state.syncStatus = failed > 0 ? 'error' : 'synced';
      this.notifyListeners();

      return { success: failed === 0, synced, failed };
    } catch (error) {
      this.state.syncStatus = 'error';
      this.notifyListeners();
      return { success: false, synced, failed };
    }
  }

  private async pushToServer(_item: SyncQueueItem): Promise<void> {
    // PLACEHOLDER: Implementar integração com Supabase/Backend real
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  startSync(intervalMs = 30000) {
    this.stopSync();
    this.syncInterval = setInterval(() => this.sync(), intervalMs);
    this.sync();
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async clearAll() {
    await this.db.destroy();
    await this.syncDb.destroy();
    this.db = new PouchDB('barflow_offline');
    this.syncDb = new PouchDB('barflow_sync_queue');
    this.state.pendingChanges = 0;
    this.notifyListeners();
  }

  private cleanDoc(doc: any) {
    const { _id, _rev, collection, _syncStatus, created_at, updated_at, ...data } = doc;
    const id = data.id || _id?.split('_')[1];
    if (id) return { ...data, id };
    return data;
  }
}

export const offlineService = new OfflineService();
export type { OfflineState, SyncQueueItem };