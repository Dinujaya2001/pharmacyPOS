import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Truck, Plus, CheckCircle, FilePlus } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showGrnModal, setShowGrnModal] = useState(false);

  // New Supplier State
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });

  // GRN State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [grnItems, setGrnItems] = useState([
    { medicineId: '', batchNumber: '', expiryDate: '', manufactureDate: '', quantity: 100, buyingPrice: 10, sellingPrice: 15 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [supRes, medRes] = await Promise.all([
        axiosClient.get('/suppliers'),
        axiosClient.get('/inventory/medicines')
      ]);
      setSuppliers(supRes.data);
      setMedicines(medRes.data);
    } catch (err) {
      console.error('Error fetching suppliers', err);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/suppliers', newSupplier);
      setShowSupplierModal(false);
      setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  const handleCreateGrn = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplierId: selectedSupplierId,
        items: grnItems
      };
      await axiosClient.post('/suppliers/grn', payload);
      alert('GRN Created and Stock Updated Successfully!');
      setShowGrnModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process GRN');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers & Goods Received (GRN)</h1>
          <p className="text-xs text-slate-500 mt-1">Manage wholesale suppliers and enter new stock batches</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
          <button
            onClick={() => setShowGrnModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition"
          >
            <FilePlus className="w-4 h-4" /> New GRN Entry
          </button>
        </div>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{sup.name}</h3>
                <p className="text-xs text-slate-400">{sup.contactPerson}</p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-100">
              <p><span className="font-semibold text-slate-700">Phone:</span> {sup.phone}</p>
              <p><span className="font-semibold text-slate-700">Email:</span> {sup.email}</p>
              <p><span className="font-semibold text-slate-700">Address:</span> {sup.address}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Supplier</h3>
            <form onSubmit={handleAddSupplier} className="space-y-3 text-sm">
              <input required placeholder="Supplier Name" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <input placeholder="Contact Person" value={newSupplier.contactPerson} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <input required placeholder="Phone Number" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <input placeholder="Email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <input placeholder="Address" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRN Entry Modal */}
      {showGrnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Inward (GRN Entry)</h3>
            <form onSubmit={handleCreateGrn} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Supplier</label>
                <select required value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <option value="">Choose Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Medicine</label>
                    <select required value={grnItems[0].medicineId} onChange={e => setGrnItems([{ ...grnItems[0], medicineId: e.target.value }])} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs">
                      <option value="">Select Medicine</option>
                      {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Batch Number</label>
                    <input required placeholder="e.g. BT-902" value={grnItems[0].batchNumber} onChange={e => setGrnItems([{ ...grnItems[0], batchNumber: e.target.value }])} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Expiry Date</label>
                    <input required type="date" value={grnItems[0].expiryDate} onChange={e => setGrnItems([{ ...grnItems[0], expiryDate: e.target.value }])} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Quantity</label>
                    <input required type="number" value={grnItems[0].quantity} onChange={e => setGrnItems([{ ...grnItems[0], quantity: Number(e.target.value) }])} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Buying Price (Rs)</label>
                    <input required type="number" step="0.01" value={grnItems[0].buyingPrice} onChange={e => setGrnItems([{ ...grnItems[0], buyingPrice: Number(e.target.value) }])} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Selling Price (Rs)</label>
                    <input required type="number" step="0.01" value={grnItems[0].sellingPrice} onChange={e => setGrnItems([{ ...grnItems[0], sellingPrice: Number(e.target.value) }])} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowGrnModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium">Receive Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}