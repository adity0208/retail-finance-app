import React, { useState, useEffect } from 'react';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [code, setCode] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const addToCart = (newItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.type === newItem.type && item.id === newItem.id);
      if (existing) {
        const maxQty = existing.stockCount || 1;
        if ((existing.qty || 0) + 1 > maxQty) {
          alert('Cannot add more than available stock');
          return prev;
        }
        return prev.map((item) =>
          item.type === newItem.type && item.id === newItem.id
            ? { ...item, qty: (item.qty || 0) + 1 }
            : item
        );
      }

      if (newItem.type === 'clothing' && (newItem.stockCount || 0) <= 0) {
        alert('Cannot add out-of-stock item');
        return prev;
      }

      return [...prev, newItem];
    });
  };

  useEffect(() => {
    const handler = async (e) => {
      const it = e.detail;
      if (!it) return;
      const { db } = await import('../lib/db.js');
      if (it.type === 'clothing') {
        const rec = await db.getClothingById(it.id);
        if (rec) {
          addToCart({
            type: 'clothing',
            id: rec.id,
            label: rec.articleCode || rec.quickLookupCode,
            photoData: rec.photoData || null,
            costPriceInPaise: rec.costPriceInPaise,
            sellingPriceInPaise: rec.retailPriceInPaise,
            stockCount: rec.stockCount || 0,
            qty: 1,
          });
        }
      } else if (it.type === 'electronics') {
        const rec = await db.getElectronicsById(it.id);
        if (rec) {
          if (rec.soldTo || rec.salePriceInPaise != null) {
            alert('This electronics item is already sold and cannot be added.');
            return;
          }
          addToCart({
            type: 'electronics',
            id: rec.id,
            label: rec.serialNumber || rec.quickLookupCode,
            photoData: rec.photoData || null,
            costPriceInPaise: rec.costPriceInPaise,
            sellingPriceInPaise: rec.salePriceInPaise || 0,
            stockCount: 1,
            qty: 1,
          });
        }
      }
    };

    window.addEventListener('add-to-cart', handler);
    return () => window.removeEventListener('add-to-cart', handler);
  }, []);

  const addByCode = async () => {
    if (!code.trim()) return;
    try {
      const results = await import('../lib/db.js').then((m) => m.db.searchByCode(code.trim()));
      if (results.clothing && results.clothing.length > 0) {
        const c = results.clothing[0];
        addToCart({
          type: 'clothing',
          id: c.id,
          label: c.articleCode || c.quickLookupCode,
          photoData: c.photoData || null,
          costPriceInPaise: c.costPriceInPaise,
          sellingPriceInPaise: c.retailPriceInPaise,
          stockCount: c.stockCount || 0,
          qty: 1,
        });
      } else if (results.electronics && results.electronics.length > 0) {
        const c = results.electronics[0];
        if (c.soldTo || c.salePriceInPaise != null) {
          alert('This electronics item is already sold and cannot be added.');
          setCode('');
          return;
        }
        addToCart({
          type: 'electronics',
          id: c.id,
          label: c.serialNumber || c.quickLookupCode,
          photoData: c.photoData || null,
          costPriceInPaise: c.costPriceInPaise,
          sellingPriceInPaise: c.salePriceInPaise || 0,
          stockCount: 1,
          qty: 1,
        });
      } else {
        alert('No item found');
      }
      setCode('');
    } catch (err) {
      console.error(err);
    }
  };

  const updatePrice = (index, value) => {
    const paise = Math.round(parseFloat(value || '0') * 100);
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, sellingPriceInPaise: paise } : it)));
  };

  const updateQty = (index, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const maxQty = it.stockCount || 1;
        if (q > maxQty) {
          alert('Quantity exceeds available stock');
          return { ...it, qty: maxQty };
        }
        return { ...it, qty: q };
      })
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const checkout = async () => {
    if (items.length === 0) return alert('Cart empty');
    try {
      const { db } = await import('../lib/db.js');
      const payloadItems = [];
      for (const it of items) {
        if (it.type === 'clothing') {
          const rec = await db.getClothingById(it.id);
          if (!rec) return alert('Item disappeared: ' + it.label);
          if (it.sellingPriceInPaise < rec.costPriceInPaise) return alert('Selling price cannot be lower than acquisition cost for ' + rec.articleCode);
          payloadItems.push({ type: 'clothing', id: it.id, qty: it.qty, sellingPriceInPaise: it.sellingPriceInPaise, costPriceInPaise: rec.costPriceInPaise });
        } else if (it.type === 'electronics') {
          const rec = await db.getElectronicsById(it.id);
          if (!rec) return alert('Item disappeared: ' + it.label);
          if (it.sellingPriceInPaise < rec.costPriceInPaise) return alert('Selling price cannot be lower than acquisition cost for ' + rec.serialNumber);
          payloadItems.push({ type: 'electronics', id: it.id, qty: it.qty, sellingPriceInPaise: it.sellingPriceInPaise, costPriceInPaise: rec.costPriceInPaise });
        }
      }

      const soldItems = [];
      for (const p of payloadItems) {
        if (p.type === 'clothing') {
          const rec = await db.getClothingById(p.id);
          const qty = p.qty || 1;
          if (rec.stockCount < qty) return alert('Insufficient stock for ' + rec.articleCode);
          rec.stockCount = rec.stockCount - qty;
          await db.updateClothing(rec);
          soldItems.push({ type: 'clothing', itemId: rec.id, articleCode: rec.articleCode, qty, sellingPriceInPaise: p.sellingPriceInPaise, costPriceInPaise: p.costPriceInPaise });
        } else if (p.type === 'electronics') {
          const rec = await db.getElectronicsById(p.id);
          if (rec.soldTo) return alert('Item already sold: ' + rec.serialNumber);
          rec.soldTo = customerPhone || 'walk-in';
          rec.salePriceInPaise = p.sellingPriceInPaise;
          const saleDate = new Date();
          const months = rec.warrantyPeriodInMonths || 0;
          rec.warrantyExpiryDate = months > 0 ? new Date(saleDate.getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString() : null;
          await db.updateElectronics(rec);
          soldItems.push({ type: 'electronics', itemId: rec.id, serialNumber: rec.serialNumber, sellingPriceInPaise: p.sellingPriceInPaise, costPriceInPaise: p.costPriceInPaise });
        }
      }

      const txn = await db.addTransaction({
        items: soldItems,
        amountInPaise: soldItems.reduce((s, i) => s + (i.sellingPriceInPaise || 0) * (i.qty || 1), 0),
        type: 'income',
        department: 'POS',
        paymentMethod: 'Cash',
        date: new Date().toISOString(),
      });
      alert('Sale complete. Transaction: ' + txn.id);
      setItems([]);
      window.dispatchEvent(new CustomEvent('inventory-updated'));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const totalPaise = items.reduce((s, it) => s + (it.sellingPriceInPaise || 0) * (it.qty || 1), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Scan or enter code</label>
          <input
            type="text"
            placeholder="E.g. TSHIRT-001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={addByCode}
          className="inline-flex h-full min-h-[52px] items-center justify-center rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Add
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <label className="block text-sm font-medium text-slate-700">Customer phone</label>
        <input
          type="text"
          placeholder="Required for electronics"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
        />
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
            No items in cart yet. Add a product from the catalog or scan a code.
          </div>
        ) : (
          items.map((it, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 overflow-hidden">
                    {it.photoData ? (
                      <img src={it.photoData} alt="Item" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm text-slate-400">No image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{it.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{it.type === 'clothing' ? 'Clothing product' : 'Electronic device'}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  aria-label={`Remove ${it.label} from cart`}
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-600">
                  Selling price (₹)
                  <input
                    type="text"
                    value={((it.sellingPriceInPaise || 0) / 100).toFixed(2)}
                    onChange={(e) => updatePrice(idx, e.target.value)}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-600">
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    onChange={(e) => updateQty(idx, e.target.value)}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-900">₹{(totalPaise / 100).toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={checkout}
            className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
}
