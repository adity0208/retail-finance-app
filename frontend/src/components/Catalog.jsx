import React, { useEffect, useState } from 'react';

export default function Catalog() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { db } = await import('../lib/db.js');
      const cloth = await db.getAllClothing();
      const elec = await db.getAllElectronics();
      const merged = [
        ...cloth.map((c) => ({ ...c, __type: 'clothing' })),
        ...elec.map((e) => ({ ...e, __type: 'electronics' })),
      ];
      setItems(merged);
    };
    load();

    const refresh = () => load();
    window.addEventListener('inventory-updated', refresh);
    return () => window.removeEventListener('inventory-updated', refresh);
  }, []);

  const addToCart = (it) => {
    window.dispatchEvent(new CustomEvent('add-to-cart', { detail: it }));
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.length === 0 ? (
        <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          No catalog items available yet.
        </div>
      ) : (
        items.map((it) => (
          <div
            key={it.id}
            className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden">
                {it.photoData ? (
                  <img src={it.photoData} alt="Item" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">No image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-slate-900 line-clamp-2">{it.modelName || it.articleCode || it.serialNumber}</div>
                <p className="mt-2 text-sm text-slate-500">{it.__type === 'clothing' ? it.category : it.deviceCategory}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                {it.__type}
              </span>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {it.__type === 'clothing'
                    ? `${it.stockCount || 0} in stock`
                    : it.soldTo || it.salePriceInPaise != null
                      ? 'Sold'
                      : 'Available'}
                </span>
                <button
                  type="button"
                  onClick={() => addToCart({ type: it.__type, id: it.id })}
                  disabled={it.__type === 'clothing' ? (it.stockCount || 0) <= 0 : !!it.soldTo || it.salePriceInPaise != null}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${it.__type === 'clothing' ? ((it.stockCount || 0) <= 0 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700') : (!!it.soldTo || it.salePriceInPaise != null ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}
                >
                  {it.__type === 'clothing'
                    ? (it.stockCount || 0) <= 0 ? 'Out of stock' : 'Add'
                    : (!!it.soldTo || it.salePriceInPaise != null) ? 'Sold' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
