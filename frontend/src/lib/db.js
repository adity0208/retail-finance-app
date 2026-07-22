import { openDB } from 'idb';

const DB_NAME = 'retail-ledger-db';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('electronics')) {
      const store = db.createObjectStore('electronics', { keyPath: 'id' });
      store.createIndex('serialNumber', 'serialNumber', { unique: true });
      store.createIndex('quickLookupCode', 'quickLookupCode', { unique: false });
      store.createIndex('soldTo', 'soldTo');
    }

    if (!db.objectStoreNames.contains('clothing')) {
      const store = db.createObjectStore('clothing', { keyPath: 'id' });
      store.createIndex('articleCode', 'articleCode', { unique: true });
      store.createIndex('quickLookupCode', 'quickLookupCode', { unique: false });
      store.createIndex('category', 'category');
    }

    if (!db.objectStoreNames.contains('expenses')) {
      db.createObjectStore('expenses', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('transactions')) {
      db.createObjectStore('transactions', { keyPath: 'id' });
    }
  }
});

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export const db = {
  async addElectronics(payload) {
    const d = await dbPromise;
    const item = {
      id: genId('e-'),
      serialNumber: payload.serialNumber,
      modelName: payload.modelName,
      deviceCategory: payload.deviceCategory || 'Cooler',
      purchaseDate: payload.purchaseDate || new Date().toISOString(),
      costPriceInPaise: payload.costPriceInPaise != null ? payload.costPriceInPaise : 0,
      soldTo: null,
      salePriceInPaise: null,
      photoData: payload.photoData || null,
      warrantyPeriodInMonths: payload.warrantyPeriodInMonths || 0,
      warrantyExpiryDate: null,
      quickLookupCode: payload.quickLookupCode || (payload.articleCode || payload.serialNumber || genId('Q-'))
    };
    await d.add('electronics', item);
    return item;
  },

  async addClothing(payload) {
    const d = await dbPromise;
    const item = {
      id: genId('c-'),
      photoData: payload.photoData || null,
      gender: payload.gender,
      size: payload.size,
      costPriceInPaise: payload.costPriceInPaise,
      retailPriceInPaise: payload.retailPriceInPaise,
      articleCode: payload.articleCode || genId('A-'),
      quickLookupCode: payload.quickLookupCode || (payload.articleCode || genId('Q-')),
      stockCount: payload.stockCount != null ? payload.stockCount : 0,
      category: payload.category || 'Shirts',
      createdAt: new Date().toISOString()
    };
    await d.add('clothing', item);
    return item;
  },

  async searchByCode(code) {
    const d = await dbPromise;
    const q = String(code).trim();
    const clothing = [];
    const electronics = [];

    let tx = d.transaction('clothing');
    let idx = tx.store.index('articleCode');
    try {
      const byArticle = await idx.get(q);
      if (byArticle) clothing.push(byArticle);
    } catch (e) { }
    try {
      const byQuick = await tx.store.getAll();
      for (const item of byQuick) {
        if (item.quickLookupCode === q) clothing.push(item);
      }
    } catch (e) { }

    tx = d.transaction('electronics');
    try {
      const idxS = tx.store.index('serialNumber');
      const bySerial = await idxS.get(q);
      if (bySerial) electronics.push(bySerial);
    } catch (e) { }
    try {
      const allEl = await tx.store.getAll();
      for (const item of allEl) {
        if (item.quickLookupCode === q) electronics.push(item);
      }
    } catch (e) { }

    return { clothing, electronics };
  },

  async getClothingById(id) { const d = await dbPromise; return d.get('clothing', id); },
  async getElectronicsById(id) { const d = await dbPromise; return d.get('electronics', id); },

  async updateClothing(item) { const d = await dbPromise; await d.put('clothing', item); return item; },
  async updateElectronics(item) { const d = await dbPromise; await d.put('electronics', item); return item; },

  async addTransaction(txn) { const d = await dbPromise; const rec = { id: genId('t-'), ...txn }; await d.add('transactions', rec); return rec; },
  async addExpense(exp) { const d = await dbPromise; const rec = { id: genId('x-'), ...exp }; await d.add('expenses', rec); return rec; },

  async listLowStockCategories(threshold = 3) {
    const d = await dbPromise;
    const all = await d.getAll('clothing');
    const map = {};
    for (const it of all) {
      const cat = it.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + (it.stockCount || 0);
    }
    const below = [];
    for (const k of Object.keys(map)) if (map[k] < threshold) below.push({ category: k, count: map[k] });
    return below;
  },

  async getTotals() {
    const d = await dbPromise;
    const txns = await d.getAll('transactions');
    const exps = await d.getAll('expenses');
    let grossSales = 0;
    let costSum = 0;
    for (const t of txns) {
      if (t.items && Array.isArray(t.items)) {
        for (const it of t.items) {
          grossSales += it.sellingPriceInPaise * (it.qty || 1);
          costSum += (it.costPriceInPaise || 0) * (it.qty || 1);
        }
      } else if (t.amountInPaise) {
        grossSales += t.amountInPaise;
      }
    }
    let expenses = 0;
    for (const e of exps) expenses += (e.amountInPaise || 0);
    const netMargin = grossSales - costSum;
    const netProfit = netMargin - expenses;
    return { grossSales, costSum, netMargin, expenses, netProfit, txnsCount: txns.length, expCount: exps.length };
  },

  async getTransactions() { const d = await dbPromise; return d.getAll('transactions'); },
  async getExpenses() { const d = await dbPromise; return d.getAll('expenses'); },
  async getAllClothing() { const d = await dbPromise; return d.getAll('clothing'); },
  async getAllElectronics() { const d = await dbPromise; return d.getAll('electronics'); },
  async getClothingByCategory() {
    const d = await dbPromise;
    const all = await d.getAll('clothing');
    const map = {};
    for (const it of all) {
      const c = it.category || 'Uncategorized';
      map[c] = (map[c] || 0) + (it.stockCount || 0);
    }
    return map;
  }
};
