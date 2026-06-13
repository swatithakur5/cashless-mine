import { Injectable } from '@angular/core';
import { openDB } from 'idb';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'MPIN_DB';
  private storeName = 'user';

  private dbPromise = openDB(this.dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id' });
      }
    },
  });

  async setUser(userData: any): Promise<void> {
    const db = await this.dbPromise;
    await db.put(this.storeName, { id: 'currentUser', ...userData });
  }

  async getUser(): Promise<any> {
    const db = await this.dbPromise;
    return await db.get(this.storeName, 'currentUser');
  }

  async clearUser(): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.storeName, 'currentUser');
  }
}
