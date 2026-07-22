import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [lowStock, setLowStock] = useState([]);
  const [totals, setTotals] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    const load = async () => {
      const { db } = await import('../lib/db.js');
      setLowStock(await db.listLowStockCategories(3));
      setTotals(await db.getTotals());
      setCategoryMap(await db.getClothingByCategory());
    };
    load();

    const refresh = () => load();
    window.addEventListener('inventory-updated', refresh);
    return () => window.removeEventListener('inventory-updated', refresh);
  }, []);

  const BarChart = ({ grossSales = 0, expenses = 0 }) => {
    const max = Math.max(grossSales, expenses, 1);
    const gH = Math.round((grossSales / max) * 80);
    const eH = Math.round((expenses / max) * 80);

    return (
      <svg width="100%" height="120" viewBox="0 0 200 100" preserveAspectRatio="none" className="mt-4 overflow-visible">
        <g>
          <rect x="30" y={90 - gH} width="40" height={gH} rx="6" fill="#4338CA" />
          <rect x="100" y={90 - eH} width="40" height={eH} rx="6" fill="#818CF8" />
          <text x="30" y="96" fontSize="8" fill="#0F172A">Revenue</text>
          <text x="100" y="96" fontSize="8" fill="#0F172A">Expenses</text>
        </g>
      </svg>
    );
  };

  const StockMeter = ({ map }) => {
    const entries = Object.entries(map || {});
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-3xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-sm font-semibold text-slate-900">{k}</div>
            <div className="mt-2 text-sm text-slate-500">{v} in stock</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Insights</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Business snapshot</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Gross revenue</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">₹{totals ? (totals.grossSales / 100).toFixed(2) : '0.00'}</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Expenses</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">₹{totals ? (totals.expenses / 100).toFixed(2) : '0.00'}</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Net profit</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">₹{totals ? (totals.netProfit / 100).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Revenue vs Expenses</h3>
            <p className="mt-1 text-sm text-slate-500">Compare recent performance in one glance.</p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Current period</div>
        </div>
        {totals ? <BarChart grossSales={totals.grossSales / 100} expenses={totals.expenses / 100} /> : <div className="mt-4 text-sm text-slate-500">Loading chart...</div>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Low stock alerts</h3>
          </div>
          {lowStock.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No low-stock categories.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {lowStock.map((s) => (
                <div key={s.category} className="rounded-3xl bg-slate-50 p-4 text-slate-900">
                  <p className="font-semibold">{s.category}</p>
                  <p className="mt-1 text-sm text-slate-500">{s.count} items remaining</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Stock by category</h3>
          </div>
          <div className="mt-4">
            <StockMeter map={categoryMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
