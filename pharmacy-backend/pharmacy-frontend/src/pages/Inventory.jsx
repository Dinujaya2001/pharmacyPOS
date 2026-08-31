import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Package, Plus, Search, AlertCircle, Layers } from 'lucide-react';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activeTab, setActiveTab] = useState('medicines');
  const [search, setSearch] = useState('');

  // Form States
  const [showMedModal, setShowMedModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    brand: '',
    dosageForm: 'Tablet',
    strength: '',
    prescriptionRequired: false,
    categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medRes, catRes, batchRes] = await Promise.all([
        axiosClient.get('/inventory/medicines'),
        axiosClient.get('/inventory/categories'),
        axiosClient.get('/inventory/batches')
      ]);
      setMedicines(medRes.data);
      setCategories(catRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      console.error('Error fetching inventory data', err);
    }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/inventory/medicines', newMed);
      setShowMedModal(false);
      setNewMed({
        name: '',
        genericName: '',
        brand: '',
        dosageForm: 'Tablet',
        strength: '',
        prescriptionRequired: false,
        categoryId: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add medicine');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory & Stock</h1>
          <p className="text-xs text-slate-500 mt-1">Manage medicines, categories, and batch stocks</p>
        </div>
        <button
          onClick={() => setShowMedModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 flex items-center gap-2 ${activeTab === 'medicines' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500'}`}
        >
          <Package className="w-4 h-4" /> Medicines ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 flex items-center gap-2 ${activeTab === 'batches' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500'}`}
        >
          <Layers className="w-4 h-4" /> Batch Stocks ({batches.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by name, brand, or batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {activeTab === 'medicines' ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Generic Name</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Rx Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines
                .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName.toLowerCase().includes(search.toLowerCase()))
                .map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400">#{m.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{m.name} <span className="text-xs text-slate-400 font-normal">({m.strength})</span></td>
                    <td className="py-3 px-4 text-slate-600">{m.genericName}</td>
                    <td className="py-3 px-4 text-slate-600">{m.brand}</td>
                    <td className="py-3 px-4 text-slate-600">{m.category?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {m.prescriptionRequired ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">Yes</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">OTC</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Batch No</th>
                <th className="py-3 px-4">Medicine</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Buying Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches
                .filter(b => b.batchNumber.toLowerCase().includes(search.toLowerCase()) || b.medicine?.name.toLowerCase().includes(search.toLowerCase()))
                .map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{b.batchNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{b.medicine?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{b.expiryDate}</td>
                    <td className="py-3 px-4 text-slate-600">Rs. {b.buyingPrice}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">Rs. {b.sellingPrice}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${b.quantity < 20 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
                        {b.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showMedModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Medicine</h3>
            <form onSubmit={handleCreateMedicine} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Generic Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Paracetamol"
                    value={newMed.genericName}
                    onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Panadol"
                    value={newMed.brand}
                    onChange={(e) => setNewMed({ ...newMed, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    required
                    value={newMed.categoryId}
                    onChange={(e) => setNewMed({ ...newMed, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="rx"
                  checked={newMed.prescriptionRequired}
                  onChange={(e) => setNewMed({ ...newMed, prescriptionRequired: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="rx" className="text-xs text-slate-700">Prescription Required (Rx)</label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}