import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Truck, Plus, FilePlus, Info } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showGrnModal, setShowGrnModal] = useState(false);

  // New Supplier State
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  // GRN State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [grnItems, setGrnItems] = useState([
    {
      medicineId: '',
      batchNumber: '',
      expiryDate: '',
      manufactureDate: '',
      quantity: '',
      buyingPrice: '',
      sellingPrice: ''
    }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [supRes, medRes, batchRes] = await Promise.all([
        axiosClient.get('/suppliers'),
        axiosClient.get('/inventory/medicines'),
        axiosClient.get('/inventory/batches')
      ]);
      setSuppliers(supRes.data);
      setMedicines(medRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      console.error('Error fetching inventory details', err);
    }
  };

  // Medicine එකක් තෝරාගත් විට කලින් තිබූ Batch & Price විස්තර Auto-Fill කිරීම
  const handleMedicineChange = (medicineId) => {
    const medIdNum = Number(medicineId);
    
    // මෙම Medicine එකට අදාළව දැනට පද්ධතියේ ඇති අවසාන Batch එක සොයා ගැනීම
    const existingBatches = batches.filter(b => b.medicine?.id === medIdNum);
    const lastBatch = existingBatches.length > 0 ? existingBatches[existingBatches.length - 1] : null;

    setGrnItems([{
      ...grnItems[0],
      medicineId: medicineId,
      batchNumber: lastBatch ? lastBatch.batchNumber : '',
      expiryDate: lastBatch ? lastBatch.expiryDate : '',
      buyingPrice: lastBatch ? String(lastBatch.buyingPrice) : '',
      sellingPrice: lastBatch ? String(lastBatch.sellingPrice) : '',
      quantity: '' // Quantity එක පමණක් අලුතින් Type කිරීමට හිස්ව තබයි
    }]);
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
        supplierId: Number(selectedSupplierId),
        items: grnItems.map((item) => ({
          medicineId: Number(item.medicineId),
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          manufactureDate: item.manufactureDate,
          quantity: Number(item.quantity) || 0,
          buyingPrice: Number(item.buyingPrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0
        }))
      };

      await axiosClient.post('/suppliers/grn', payload);
      alert('GRN Created and Stock Successfully Updated!');
      setShowGrnModal(false);
      
      setSelectedSupplierId('');
      setGrnItems([
        {
          medicineId: '',
          batchNumber: '',
          expiryDate: '',
          manufactureDate: '',
          quantity: '',
          buyingPrice: '',
          sellingPrice: ''
        }
      ]);
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
        {suppliers.map((sup) => (
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
              <input
                required
                placeholder="Supplier Name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                placeholder="Contact Person"
                value={newSupplier.contactPerson}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                placeholder="Phone Number"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                placeholder="Email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                placeholder="Address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRN Entry Modal */}
      {showGrnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Stock Inward (GRN Entry)</h3>
                <p className="text-[11px] text-slate-400">Select medicine to load latest batch & price details automatically</p>
              </div>
            </div>

            <form onSubmit={handleCreateGrn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Supplier</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Medicine</label>
                    <select
                      required
                      value={grnItems[0].medicineId}
                      onChange={(e) => handleMedicineChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Batch Number</label>
                    <input
                      required
                      placeholder="e.g. BT-902"
                      value={grnItems[0].batchNumber}
                      onChange={(e) => setGrnItems([{ ...grnItems[0], batchNumber: e.target.value }])}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Expiry Date</label>
                    <input
                      required
                      type="date"
                      value={grnItems[0].expiryDate}
                      onChange={(e) => setGrnItems([{ ...grnItems[0], expiryDate: e.target.value }])}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Quantity (Units)</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 100"
                      min="1"
                      value={grnItems[0].quantity}
                      onChange={(e) => setGrnItems([{ ...grnItems[0], quantity: e.target.value }])}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Buying Price (Rs)</label>
                    <input
                      required
                      type="number"
                      step="any"
                      placeholder="0.00"
                      min="0"
                      value={grnItems[0].buyingPrice}
                      onChange={(e) => setGrnItems([{ ...grnItems[0], buyingPrice: e.target.value }])}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Selling Price (Rs)</label>
                    <input
                      required
                      type="number"
                      step="any"
                      placeholder="0.00"
                      min="0"
                      value={grnItems[0].sellingPrice}
                      onChange={(e) => setGrnItems([{ ...grnItems[0], sellingPrice: e.target.value }])}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGrnModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition"
                >
                  Receive Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}