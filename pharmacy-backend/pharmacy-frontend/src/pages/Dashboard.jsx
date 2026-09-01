import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Gauge, 
  ShoppingCart, 
  Pill, 
  Truck, 
  FileText, 
  Receipt, 
  PlusCircle, 
  UserPlus, 
  BarChart3, 
  RotateCw,
  Clock,
  PackageCheck
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    todayPurchases: 0,
    totalMedicines: 0,
    outOfStock: 0,
    expired: 0,
    totalSuppliers: 0,
    todaySuppliers: 0,
    totalInvoices: 0,
    todayInvoices: 0,
    incompletePayments: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [medRes, supRes, batchRes] = await Promise.all([
        axiosClient.get('/inventory/medicines').catch(() => ({ data: [] })),
        axiosClient.get('/suppliers').catch(() => ({ data: [] })),
        axiosClient.get('/inventory/batches').catch(() => ({ data: [] }))
      ]);

      const medicines = medRes.data || [];
      const suppliers = supRes.data || [];
      const batches = batchRes.data || [];

      // Expired & Out of Stock ගණනය කිරීම
      const todayStr = new Date().toISOString().split('T')[0];
      const expiredCount = batches.filter(b => b.expiryDate && b.expiryDate < todayStr).length;
      const outOfStockCount = batches.filter(b => b.quantity <= 0).length;

      setSummary(prev => ({
        ...prev,
        totalMedicines: medicines.length,
        outOfStock: outOfStockCount,
        expired: expiredCount,
        totalSuppliers: suppliers.length,
        totalPurchases: batches.length,
        totalInvoices: 0
      }));
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 bg-[#f4f6f9] min-h-[calc(100vh-5rem)] -m-6 p-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
          <Gauge className="w-5 h-5" />
          <span>Dashboard Panel</span>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition font-medium"
        >
          <span>Updating</span>
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 4 Top KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalPurchases}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Purchases</p>
            <p className="text-[11px] text-slate-400 mt-2">Today <span className="text-rose-500 font-bold">{summary.todayPurchases}</span></p>
          </div>
          <ShoppingCart className="w-12 h-12 text-slate-400 stroke-1" />
        </div>

        {/* Total Medicine */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalMedicines}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Medicine</p>
            <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5">
              <p>Out of Stock <span className="text-rose-500 font-bold">{summary.outOfStock}</span></p>
              <p>Expired <span className="text-rose-500 font-bold">{summary.expired}</span></p>
            </div>
          </div>
          <Pill className="w-12 h-12 text-slate-400 stroke-1" />
        </div>

        {/* Total Suppliers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalSuppliers}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Suppliers</p>
            <p className="text-[11px] text-slate-400 mt-2">Today <span className="text-rose-500 font-bold">{summary.todaySuppliers}</span></p>
          </div>
          <Truck className="w-12 h-12 text-slate-400 stroke-1" />
        </div>

        {/* Total Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalInvoices}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Invoices</p>
            <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5">
              <p>Today <span className="text-rose-500 font-bold">{summary.todayInvoices}</span></p>
              <p>Incomplete Payments <span className="text-rose-500 font-bold">{summary.incompletePayments}</span></p>
            </div>
          </div>
          <FileText className="w-12 h-12 text-slate-400 stroke-1" />
        </div>
      </div>

      {/* Row 1: Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New POS Sale */}
        <div 
          onClick={() => navigate('/pos')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <Receipt className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            New POS Sale
          </div>
          <span className="text-[10px] text-slate-400">New Point of Sale</span>
        </div>

        {/* Prescriptions / Invoices */}
        <div 
          onClick={() => navigate('/prescriptions')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <FileText className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            Prescriptions
          </div>
          <span className="text-[10px] text-slate-400">Review Customer Prescriptions</span>
        </div>

        {/* New Medicine */}
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <PlusCircle className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            New Medicine
          </div>
          <span className="text-[10px] text-slate-400">Add a new Medicine to the System</span>
        </div>

        {/* Suppliers & GRN */}
        <div 
          onClick={() => navigate('/suppliers')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <UserPlus className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            Suppliers & GRN
          </div>
          <span className="text-[10px] text-slate-400">Receive Stock & Add Suppliers</span>
        </div>
      </div>

      {/* Row 2: Report Shortcut Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Report */}
        <div 
          onClick={() => navigate('/pos')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <Clock className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            Todays Sales
          </div>
          <span className="text-[10px] text-slate-400">Everything done today POS + Invoices</span>
        </div>

        {/* Suppliers Report */}
        <div 
          onClick={() => navigate('/suppliers')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <Truck className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            Suppliers Report
          </div>
          <span className="text-[10px] text-slate-400">All registered suppliers details</span>
        </div>

        {/* Stock Report */}
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <PackageCheck className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            Stock Report
          </div>
          <span className="text-[10px] text-slate-400">Stock analysis and low alerts</span>
        </div>

        {/* Purchase Report */}
        <div 
          onClick={() => navigate('/suppliers')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <BarChart3 className="w-10 h-10 text-slate-600 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded text-emerald-700 font-semibold text-xs mb-1">
            Purchase Report
          </div>
          <span className="text-[10px] text-slate-400">All purchases and inward stock</span>
        </div>
      </div>
    </div>
  );
}