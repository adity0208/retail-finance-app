import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddItemModal({ onClose }) {
  const [type, setType] = useState('clothing');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    modelName: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyPeriodInMonths: 0,
    photoData: '',
    gender: 'Men',
    size: 'M',
    costPrice: '',
    retailPrice: '',
    articleCode: '',
    category: 'Shirts',
    deviceCategory: 'Cooler',
  });

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setForm((prev) => ({ ...prev, photoData: reader.result }));
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    try {
      if (type === 'clothing') {
        const costPriceInPaise = Math.round(parseFloat(form.costPrice || '0') * 100);
        const retailPriceInPaise = Math.round(parseFloat(form.retailPrice || '0') * 100);

        const payload = {
          photoData: form.photoData || null,
          gender: form.gender,
          size: form.size,
          costPriceInPaise,
          retailPriceInPaise,
          articleCode: form.articleCode || undefined,
          quickLookupCode: form.articleCode || undefined,
          stockCount: 1,
          category: form.category || 'Shirts',
        };

        const { db } = await import('../lib/db.js');
        const item = await db.addClothing(payload);
        alert('Created clothing item: ' + (item.quickLookupCode || item.articleCode));
        window.dispatchEvent(new Event('inventory-updated'));
        onClose();
      } else {
        const costPriceInPaise = Math.round(parseFloat(form.costPrice || '0') * 100);
        const payload = {
          serialNumber: form.serialNumber,
          modelName: form.modelName,
          purchaseDate: form.purchaseDate,
          warrantyPeriodInMonths: Number(form.warrantyPeriodInMonths || 0),
          deviceCategory: form.deviceCategory || 'Cooler',
          costPriceInPaise,
          photoData: form.photoData || null,
        };
        const { db } = await import('../lib/db.js');
        const item = await db.addElectronics(payload);
        alert('Created electronics item: ' + (item.quickLookupCode || item.serialNumber));
        window.dispatchEvent(new Event('inventory-updated'));
        onClose();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Add Item</h2>
            <p className="mt-1 text-sm text-slate-500">Capture stock for clothing or electronics.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 py-6 md:grid-cols-2">
          <div className="col-span-full">
            <div className="flex flex-wrap gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="radio" name="item-type" checked={type === 'clothing'} onChange={() => setType('clothing')} className="h-4 w-4 rounded border-slate-300 text-indigo-600 transition" />
                Clothing
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="radio" name="item-type" checked={type === 'electronics'} onChange={() => setType('electronics')} className="h-4 w-4 rounded border-slate-300 text-indigo-600 transition" />
                Electronics
              </label>
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-slate-700">Photo</label>
            <div className="mt-3 flex items-center gap-4">
              <label className="flex h-28 w-28 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-slate-400 hover:bg-slate-100 cursor-pointer">
                <input type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
                <span className="text-2xl">??</span>
              </label>
              {photoPreview && <img src={photoPreview} alt="Preview" className="h-28 w-28 rounded-3xl border border-slate-200 object-cover" />}
            </div>
          </div>

          {type === 'clothing' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700">Article Code (optional)</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Article Code"
                  value={form.articleCode}
                  onChange={(e) => setForm({ ...form, articleCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Gender</label>
                <select
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Kids</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Undergarments</option>
                  <option>Kurti</option>
                  <option>Jeans</option>
                  <option>Shirts</option>
                  <option>Sarees</option>
                  <option>Trousers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Size</label>
                <select
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                >
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Cost Price (?)</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Cost Price (?)"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Retail Price (?)</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Retail Price (?)"
                  value={form.retailPrice}
                  onChange={(e) => setForm({ ...form, retailPrice: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700">Serial Number</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Serial Number"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Model Name</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Model Name"
                  value={form.modelName}
                  onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Purchase Date</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Warranty Months</label>
                <input
                  type="number"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Warranty Months"
                  value={form.warrantyPeriodInMonths}
                  onChange={(e) => setForm({ ...form, warrantyPeriodInMonths: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Device Category</label>
                <select
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  value={form.deviceCategory}
                  onChange={(e) => setForm({ ...form, deviceCategory: e.target.value })}
                >
                  <option>Cooler</option>
                  <option>Mobile</option>
                  <option>Appliance</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Acquisition Cost (?)</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Acquisition Cost (?)"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
