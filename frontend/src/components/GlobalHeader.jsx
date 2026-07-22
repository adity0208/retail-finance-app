import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function GlobalHeader({ onAdd }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);

  const doSearch = async () => {
    if (!q) return;
    try {
      const results = await import('../lib/db.js').then((m) => m.db.searchByCode(q));
      setResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Add Item
          </button>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            POS Terminal
          </div>
        </div>

        <div className="relative flex-1 min-w-0 md:max-w-xl">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Quick search by code or serial"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={doSearch}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </div>

          {results && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search results</div>
              <pre className="mt-2 max-h-64 overflow-auto text-xs text-slate-700">{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
