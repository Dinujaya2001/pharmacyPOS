import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { FileText, CheckCircle2, XCircle, Clock, Eye, AlertCircle, Phone, MessageSquare } from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axiosClient.get('/prescriptions');
      setPrescriptions(res.data);
    } catch (err) {
      console.error('Failed to load prescriptions', err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(true);
    try {
      await axiosClient.patch(`/prescriptions/${id}/status`, {
        status: status,
        pharmacistNotes: pharmacistNotes
      });
      alert(`Prescription marked as ${status}!`);
      setSelectedPrescription(null);
      setPharmacistNotes('');
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = prescriptions.filter(p => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescription Verification</h1>
          <p className="text-xs text-slate-500 mt-1">Review uploaded customer prescriptions and approve orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1 self-start">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === st ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Prescription Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">#RX-{p.id}</span>
                {getStatusBadge(p.status)}
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-sm">{p.customerName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {p.customerPhone}
                </p>
              </div>

              {p.customerNotes && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5">Customer Note:</span>
                  {p.customerNotes}
                </div>
              )}

              {/* Prescription Thumbnail Preview */}
              <div 
                onClick={() => { setSelectedPrescription(p); setPharmacistNotes(p.pharmacistNotes || ''); }}
                className="relative h-44 bg-slate-100 rounded-xl overflow-hidden cursor-pointer group border border-slate-200"
              >
                <img 
                  src={`http://localhost:8080${p.imageUrl}`} 
                  alt="Prescription" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Prescription+Image'; }}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                  <Eye className="w-4 h-4" /> Click to Verify
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => { setSelectedPrescription(p); setPharmacistNotes(p.pharmacistNotes || ''); }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs"
              >
                Review RX
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No prescriptions found matching the selected filter.
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 bg-slate-950 flex items-center justify-center p-4 relative min-h-[300px]">
              <img 
                src={`http://localhost:8080${selectedPrescription.imageUrl}`} 
                alt="Prescription Large Preview" 
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-md"
                onError={(e) => { e.target.src = 'https://placehold.co/600x800?text=Prescription+Image'; }}
              />
            </div>

            {/* Review & Notes Section */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400">RX ID: #{selectedPrescription.id}</span>
                    <h2 className="text-lg font-bold text-slate-800">{selectedPrescription.customerName}</h2>
                  </div>
                  {getStatusBadge(selectedPrescription.status)}
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><span className="font-semibold text-slate-700">Phone:</span> {selectedPrescription.customerPhone}</p>
                  <p><span className="font-semibold text-slate-700">Uploaded:</span> {new Date(selectedPrescription.createdAt).toLocaleString()}</p>
                  {selectedPrescription.customerNotes && (
                    <p><span className="font-semibold text-slate-700">Customer Notes:</span> {selectedPrescription.customerNotes}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pharmacist Verification Notes
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Add instructions, medicine availability, dosage comments, or reason for rejection..."
                    value={pharmacistNotes}
                    onChange={(e) => setPharmacistNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate(selectedPrescription.id, 'APPROVED')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Prescription
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate(selectedPrescription.id, 'REJECTED')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject Prescription
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPrescription(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-xl transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}