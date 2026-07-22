import React, { useState } from 'react';
import GlobalHeader from './components/GlobalHeader.jsx';
import AddItemModal from './components/AddItemModal.jsx';
import Cart from './components/Cart.jsx';
import Dashboard from './components/Dashboard.jsx';
import Catalog from './components/Catalog.jsx';
import { LayoutDashboard, ShoppingCart, PackagePlus, DollarSign } from 'lucide-react';

export default function App() {
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('pos');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100">
      <div className="md:flex">
        <aside className="w-full md:w-72 md:fixed md:inset-y-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 z-20">
          <div className="flex items-center justify-between px-6 py-6 md:py-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-100">
                R
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Retail</p>
                <h1 className="text-xl font-semibold text-slate-900">RetailPOS</h1>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4 pb-6">
            <button
              type="button"
              onClick={() => setView('pos')}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${view === 'pos'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className={`w-5 h-5 ${view === 'pos' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Point of Sale
            </button>

            <button
              type="button"
              onClick={() => setView('dashboard')}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${view === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Dashboard
            </button>

            <div className="h-px bg-slate-200 my-4" />

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex w-full items-center gap-3 rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <PackagePlus className="w-5 h-5 text-slate-500" />
              Add New Item
            </button>

            <button
              type="button"
              onClick={() => setView('expenses')}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${view === 'expenses'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <DollarSign className={`w-5 h-5 ${view === 'expenses' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Track Expenses
            </button>
          </nav>
        </aside>

        <div className="flex-1 md:ml-72">
          <GlobalHeader onAdd={() => setShowAdd(true)} />

          <main className="p-6 md:p-8 max-w-7xl mx-auto">
            {view === 'pos' ? (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
                  <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Inventory</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Product Catalog</h2>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                        IndexedDB Cache Active
                      </span>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm min-h-[540px]">
                      <Catalog />
                    </div>
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sticky top-6">
                      <div className="mb-5 border-b border-slate-200 pb-3">
                        <h3 className="text-xl font-semibold text-slate-900">Active Terminal</h3>
                      </div>
                      <Cart />
                    </div>
                  </aside>
                </div>
              </div>
            ) : view === 'dashboard' ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <Dashboard />
              </div>
            ) : (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-slate-700">Expense tracking is coming soon. You can still manage inventory and checkout sales from the POS terminal.</div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
