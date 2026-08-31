import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axiosClient.get('/prescriptions/pending');
      setPrescriptions(res.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.put(`/prescriptions/${id}/status?status=${status}`);
      fetchPrescriptions();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Prescription Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Review prescriptions uploaded by customers and verify items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.length === 0 ? (
          <div className="col-span-3 bg-white p-8 rounded-2xl text-center text-slate-400 text-sm border border-slate-200">
            No pending prescriptions at this moment.
          </div>
        ) : (
          prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {rx.imageUrl ? (
                    <img src={rx.imageUrl} alt="Prescription" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-xs">No image preview</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-500">RX #{rx.id}</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> PENDING
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{rx.patientName || 'Anonymous Patient'}</h4>
                  <p className="text-xs text-slate-500">{rx.contactNumber}</p>
                  {rx.notes && (
                    <p className="text-xs bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-100">
                      {rx.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateStatus(rx.id, 'REJECTED')}
                  className="py-1.5 flex items-center justify-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => updateStatus(rx.id, 'ACCEPTED')}
                  className="py-1.5 flex items-center justify-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}