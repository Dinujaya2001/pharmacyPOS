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
  PackageCheck, 
  X, 
  TrendingUp, 
  CreditCard,
  Printer,
  Coins
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);

  const [activeReportModal, setActiveReportModal] = useState(null);

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
    todaySalesAmount: 0,
    todayGrossProfit: 0
  });

  const [weeklyData, setWeeklyData] = useState([]);

  // Date format helper function (Jackson Array, String, Local Timezone Support)
  const extractDateStr = (dateVal) => {
    if (!dateVal) return '';
    if (Array.isArray(dateVal)) {
      const y = dateVal[0];
      const m = String(dateVal[1]).padStart(2, '0');
      const d = String(dateVal[2]).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [medRes, supRes, batchRes, orderRes] = await Promise.all([
        axiosClient.get('/inventory/medicines').catch(() => ({ data: [] })),
        axiosClient.get('/suppliers').catch(() => ({ data: [] })),
        axiosClient.get('/inventory/batches').catch(() => ({ data: [] })),
        axiosClient.get('/orders').catch(() => ({ data: [] }))
      ]);

      const medData = medRes.data || [];
      const supData = supRes.data || [];
      const batchData = batchRes.data || [];
      const orderData = orderRes.data || [];

      setMedicines(medData);
      setSuppliers(supData);
      setBatches(batchData);
      setOrders(orderData);

      const todayStr = new Date().toLocaleDateString('en-CA');

      const expiredCount = batchData.filter(b => b.expiryDate && b.expiryDate < todayStr).length;
      const outOfStockCount = batchData.filter(b => (Number(b.quantity) || 0) <= 0).length;

      // Filter Today's Orders[cite: 1]
      const todayOrders = orderData.filter(o => extractDateStr(o.orderDate || o.createdAt) === todayStr);
      const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.netAmount || o.totalAmount || 0), 0);

      // Calculate Today's Gross Profit: (Selling Price - Buying Price) * Qty[cite: 1]
      let totalCostOfGoodsSold = 0;
      todayOrders.forEach(order => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach(item => {
            const matchedBatch = batchData.find(b => b.id === (item.batchId || item.medicineBatch?.id));
            const buyingPrice = matchedBatch ? Number(matchedBatch.buyingPrice || 0) : 0;
            const qty = Number(item.quantity || 0);
            totalCostOfGoodsSold += (buyingPrice * qty);
          });
        }
      });
      const todayProfit = Math.max(0, todaySales - totalCostOfGoodsSold);

      // Past 7 Days Revenue Trend
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);
        const targetStr = targetDate.toLocaleDateString('en-CA');
        const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });

        const daySales = orderData
          .filter(o => extractDateStr(o.orderDate || o.createdAt) === targetStr)
          .reduce((sum, o) => sum + Number(o.netAmount || o.totalAmount || 0), 0);

        days.push({ day: dayName, date: targetStr, sales: daySales });
      }
      setWeeklyData(days);

      setSummary({
        totalMedicines: medData.length,
        outOfStock: outOfStockCount,
        expired: expiredCount,
        totalSuppliers: supData.length,
        todaySuppliers: 0,
        totalPurchases: batchData.length,
        todayPurchases: batchData.filter(b => extractDateStr(b.createdAt) === todayStr).length,
        totalInvoices: orderData.length,
        todayInvoices: todayOrders.length,
        todaySalesAmount: todaySales,
        todayGrossProfit: todayProfit
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-CA');
  const maxWeeklySale = Math.max(...weeklyData.map(d => d.sales), 100);

  return (
    <div className="space-y-5 bg-[#f4f6f9] min-h-[calc(100vh-5rem)] -m-6 p-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
          <Gauge className="w-5 h-5 text-emerald-600" />
          <span>Dashboard & Analytics Panel</span>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-xs text-slate-600 rounded-xl border border-slate-200 transition font-semibold"
        >
          <span>Updating</span>
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div 
          onClick={() => setActiveReportModal('PURCHASE')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500/60 transition group"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalPurchases}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Purchases</p>
            <p className="text-[11px] text-slate-400 mt-2">Today <span className="text-rose-500 font-bold">{summary.todayPurchases}</span></p>
          </div>
          <ShoppingCart className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 transition stroke-1" />
        </div>

        <div 
          onClick={() => setActiveReportModal('STOCK')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500/60 transition group"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalMedicines}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Medicine</p>
            <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5">
              <p>Out of Stock <span className="text-rose-500 font-bold">{summary.outOfStock}</span></p>
              <p>Expired <span className="text-rose-500 font-bold">{summary.expired}</span></p>
            </div>
          </div>
          <Pill className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 transition stroke-1" />
        </div>

        <div 
          onClick={() => setActiveReportModal('SUPPLIERS')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500/60 transition group"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalSuppliers}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Suppliers</p>
            <p className="text-[11px] text-slate-400 mt-2">Today <span className="text-rose-500 font-bold">{summary.todaySuppliers}</span></p>
          </div>
          <Truck className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 transition stroke-1" />
        </div>

        <div 
          onClick={() => setActiveReportModal('TODAYS_SALES')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500/60 transition group"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-none">{summary.totalInvoices}</h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">Total Invoices</p>
            <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5">
              <p>Today <span className="text-rose-500 font-bold">{summary.todayInvoices}</span></p>
              <p>Sales: <span className="text-emerald-600 font-bold">Rs. {summary.todaySalesAmount.toFixed(2)}</span></p>
            </div>
          </div>
          <FileText className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 transition stroke-1" />
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart & Quick Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">
        {/* Weekly Revenue Graph */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Past 7 Days Revenue Trend (Rs)
            </h3>
            <span className="text-[11px] text-slate-400">Live Sales Data</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100">
            {weeklyData.map((w, idx) => {
              const heightPercent = Math.max(12, Math.round((w.sales / maxWeeklySale) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                    Rs. {w.sales.toFixed(0)}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all duration-300 shadow-sm"
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-1">{w.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settlement & Profit Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Today's Profit & Settlement
            </h3>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" /> Today Gross Profit
                </span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  Rs. {summary.todayGrossProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Cash Transactions</span>
                <span className="font-bold text-slate-800">
                  {orders.filter(o => o.paymentMethod === 'CASH').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Card Transactions</span>
                <span className="font-bold text-slate-800">
                  {orders.filter(o => o.paymentMethod === 'CARD').length}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveReportModal('TODAYS_SALES')}
            className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            View & Print Sales Audit
          </button>
        </div>
      </div>

      {/* Row 1: Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div 
          onClick={() => navigate('/pos')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <Receipt className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            New POS Sale
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Point of Sale Cashier</span>
        </div>

        <div 
          onClick={() => navigate('/prescriptions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <FileText className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            Prescriptions
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Review Online RX Orders</span>
        </div>

        <div 
          onClick={() => navigate('/inventory', { state: { openAddModal: true } })}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <PlusCircle className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            New Medicine
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Add Medicine to Master</span>
        </div>

        <div 
          onClick={() => navigate('/suppliers', { state: { openGrnModal: true } })}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <UserPlus className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            Suppliers & GRN
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Inward Stock Batches</span>
        </div>
      </div>

      {/* Row 2: Reports Shortcut Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div 
          onClick={() => setActiveReportModal('TODAYS_SALES')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <Clock className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            Todays Sales
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Daily POS + Invoices Record</span>
        </div>

        <div 
          onClick={() => setActiveReportModal('SUPPLIERS')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <Truck className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            Suppliers Report
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Vendor contacts & statistics</span>
        </div>

        <div 
          onClick={() => setActiveReportModal('STOCK')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <PackageCheck className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            Stock Report
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Inventory & Expired audits</span>
        </div>

        <div 
          onClick={() => setActiveReportModal('PURCHASE')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col items-center justify-center text-center group"
        >
          <BarChart3 className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-600 transition" />
          <div className="border border-emerald-600 px-3 py-1 rounded-lg text-emerald-700 font-semibold text-xs mb-1 group-hover:bg-emerald-50 transition">
            Purchase Report
          </div>
          <span className="text-[10px] text-slate-400 font-medium">GRN cost & Margin analysis</span>
        </div>
      </div>

      {/* ================= PRINTABLE REPORTS MODALS ================= */}
      {/* 1. Today's Sales Audit Modal */}
      {activeReportModal === 'TODAYS_SALES' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:m-0 print:bg-transparent print:static">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible print:border-none">
            
            {/* Modal Top Bar (Web Screen Only) */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Daily Sales Audit Report</h3>
                  <p className="text-xs text-slate-400">Date: {todayStr} | Total Orders: {orders.filter(o => extractDateStr(o.orderDate || o.createdAt) === todayStr).length}</p>
                </div>
              </div>
              <button onClick={() => setActiveReportModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Centered Printable Area */}
            <div className="p-6 overflow-y-auto space-y-4 print:p-0 print:overflow-visible" id="printable-sales-report">
              
              {/* Centered Formal Pharmacy Header */}
              <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-wider uppercase">PHARMAPOS HEALTHCARE</h1>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Daily Sales & Settlement Report</p>
                
                {/* Meta details with User Name & User Role */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-slate-700 font-medium">
                  <p><span className="font-bold text-slate-900">Date:</span> {todayStr}</p>
                  <p><span className="font-bold text-slate-900">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>
                    <span className="font-bold text-slate-900">Generated By:</span> {localStorage.getItem('username') || 'tharaka'} 
                    <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded font-bold uppercase text-[10px]">
                      ({localStorage.getItem('role') || 'ADMIN'})
                    </span>
                  </p>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 print:border print:border-slate-300 print:p-2.5 print:rounded-xl">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center print:border-none print:p-0">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">Total Revenue</span>
                  <span className="text-base font-bold text-slate-900">Rs. {summary.todaySalesAmount.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center print:border-none print:p-0">
                  <span className="text-[10px] font-semibold text-emerald-800 block uppercase">Gross Profit</span>
                  <span className="text-base font-bold text-emerald-700">Rs. {summary.todayGrossProfit.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center print:border-none print:p-0">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">Total Invoices</span>
                  <span className="text-base font-bold text-slate-900">{orders.filter(o => extractDateStr(o.orderDate || o.createdAt) === todayStr).length}</span>
                </div>
              </div>

              {/* Clean Table Layout */}
              <div className="border border-slate-300 rounded-xl overflow-hidden print:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 print:bg-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-12">#</th>
                      <th className="p-2.5">Invoice No</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Cashier / Staff</th>
                      <th className="p-2.5 text-center">Payment</th>
                      <th className="p-2.5 text-right">Discount</th>
                      <th className="p-2.5 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.filter(o => extractDateStr(o.orderDate || o.createdAt) === todayStr).map((o, index) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-center text-slate-500 font-medium">{index + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{o.invoiceNumber || `#ORD-${o.id}`}</td>
                        <td className="p-2.5 text-slate-700">
                          {new Date(o.orderDate || o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800">
                          {o.cashier?.username || localStorage.getItem('username') || 'tharaka'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-[10px]">
                            {o.paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right text-slate-600">Rs. {Number(o.discountAmount || 0).toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          Rs. {Number(o.netAmount || o.totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {orders.filter(o => extractDateStr(o.orderDate || o.createdAt) === todayStr).length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-slate-500 font-medium">
                          No sales recorded yet for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Centered Signatures & Footer Note */}
              <div className="pt-8 pb-4 flex justify-between text-xs text-slate-800 hidden print:flex">
                <div className="border-t border-slate-400 pt-1 text-center w-40">
                  <p className="font-semibold">Prepared By</p>
                  <p className="text-[10px] text-slate-500">Cashier Signature</p>
                </div>
                <div className="border-t border-slate-400 pt-1 text-center w-40">
                  <p className="font-semibold">Verified By</p>
                  <p className="text-[10px] text-slate-500">Manager Signature</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400 hidden print:block">
                *** End of Official Daily Sales Audit - PharmaPOS System ***
              </div>
            </div>

            {/* Modal Bottom Bar (Web Screen Only) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <Printer className="w-4 h-4" /> Print Clean Report
              </button>
              <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Stock & Expiry Report Modal */}
      {activeReportModal === 'STOCK' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col print:max-w-none print:shadow-none print:h-auto print:overflow-visible">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl print:hidden">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">PharmaPOS - Stock & Inventory Audit Report</h3>
                  <p className="text-xs text-slate-400">Total Medicines: {medicines.length} | Batches Tracked: {batches.length}</p>
                </div>
              </div>
              <button onClick={() => setActiveReportModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg print:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 print:overflow-visible">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Batch No</th>
                      <th className="p-2.5">Expiry Date</th>
                      <th className="p-2.5 text-right">Stock (Units)</th>
                      <th className="p-2.5 text-right">Selling Price</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((b) => {
                      const isExpired = b.expiryDate && b.expiryDate < todayStr;
                      const isOutOfStock = (Number(b.quantity) || 0) <= 0;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{b.medicine?.name}</td>
                          <td className="p-2.5 font-mono text-slate-600">{b.batchNumber}</td>
                          <td className="p-2.5 text-slate-600">{b.expiryDate}</td>
                          <td className="p-2.5 text-right font-bold text-slate-800">{b.quantity}</td>
                          <td className="p-2.5 text-right text-emerald-700 font-bold">Rs. {Number(b.sellingPrice).toFixed(2)}</td>
                          <td className="p-2.5 text-center">
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold">Out of Stock</span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">Expired</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">In Stock</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <Printer className="w-4 h-4" /> Print Stock Audit
              </button>
              <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Suppliers Report Modal */}
      {activeReportModal === 'SUPPLIERS' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col print:max-w-none print:shadow-none print:h-auto print:overflow-visible">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl print:hidden">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">PharmaPOS - Registered Suppliers Directory</h3>
                  <p className="text-xs text-slate-400">Total Suppliers: {suppliers.length}</p>
                </div>
              </div>
              <button onClick={() => setActiveReportModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg print:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto print:overflow-visible">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Supplier Name</th>
                      <th className="p-2.5">Contact Person</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">{s.name}</td>
                        <td className="p-2.5 text-slate-600">{s.contactPerson || '-'}</td>
                        <td className="p-2.5 text-slate-700 font-medium">{s.phone}</td>
                        <td className="p-2.5 text-slate-500">{s.email || '-'}</td>
                        <td className="p-2.5 text-slate-500">{s.address || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <Printer className="w-4 h-4" /> Print Suppliers List
              </button>
              <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Purchase & GRN Margins Modal */}
      {activeReportModal === 'PURCHASE' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col print:max-w-none print:shadow-none print:h-auto print:overflow-visible">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl print:hidden">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">PharmaPOS - Inward Purchases & Margin Audit</h3>
                  <p className="text-xs text-slate-400">Total Batches: {batches.length}</p>
                </div>
              </div>
              <button onClick={() => setActiveReportModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg print:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto print:overflow-visible">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Medicine</th>
                      <th className="p-2.5">Batch</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Buying (Rs)</th>
                      <th className="p-2.5 text-right">Selling (Rs)</th>
                      <th className="p-2.5 text-right">Gross Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((b) => {
                      const buy = Number(b.buyingPrice) || 0;
                      const sell = Number(b.sellingPrice) || 0;
                      const margin = sell - buy;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{b.medicine?.name}</td>
                          <td className="p-2.5 font-mono text-slate-600">{b.batchNumber}</td>
                          <td className="p-2.5 text-right font-bold text-slate-700">{b.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600">Rs. {buy.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-800">Rs. {sell.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700">
                            +Rs. {margin.toFixed(2)} ({buy > 0 ? ((margin / buy) * 100).toFixed(0) : 0}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <Printer className="w-4 h-4" /> Print Purchase Report
              </button>
              <button onClick={() => setActiveReportModal(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}