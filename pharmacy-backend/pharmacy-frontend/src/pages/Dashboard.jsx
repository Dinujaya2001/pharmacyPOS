import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { DollarSign, ShoppingBag, AlertTriangle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, lowStockRes] = await Promise.all([
          axiosClient.get('/analytics/summary'),
          axiosClient.get('/analytics/low-stock?threshold=50')
        ]);
        setSummary(summaryRes.data);
        setLowStock(lowStockRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500 font-medium">Loading Dashboard Analytics...</div>;
  }

  const cards = [
    { title: "Today's Revenue", val: `Rs. ${summary?.todaySales || 0}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: "Today's Orders", val: summary?.todayOrdersCount || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: "Monthly Sales", val: `Rs. ${summary?.monthlySales || 0}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: "Low Stock Alerts", val: summary?.lowStockItemsCount || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics & Reports</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time pharmacy metrics & inventory status</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">{c.title}</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{c.val}</h3>
              </div>
              <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Critical Low Stock Alerts
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Medicine ID</th>
                <th className="py-2.5 px-3">Medicine Name</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3 text-right">Available Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStock.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-slate-400 text-xs">All stocks are in healthy status.</td>
                </tr>
              ) : (
                lowStock.map((item) => (
                  <tr key={item.medicineId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500">#{item.medicineId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.medicineName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.brand}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-semibold text-xs">
                        {item.totalStock} units
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}