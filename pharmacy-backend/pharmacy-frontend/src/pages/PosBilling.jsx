import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, Package } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

export default function PosBilling() {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axiosClient.get('/inventory/batches');
      setBatches(res.data.filter((b) => Number(b.quantity) > 0));
    } catch (err) {
      console.error('Failed to fetch inventory batches', err);
    }
  };

  const handleDirectQuantityChange = (batchId, value, maxStock) => {
    if (value === '') {
      setCart(cart.map((item) => (item.batchId === batchId ? { ...item, quantity: '' } : item)));
      return;
    }
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue <= 0) return;

    if (numericValue > maxStock) {
      alert(`Stock limit exceeded! Only ${maxStock} available.`);
      setCart(cart.map((item) => (item.batchId === batchId ? { ...item, quantity: maxStock } : item)));
      return;
    }
    setCart(cart.map((item) => (item.batchId === batchId ? { ...item, quantity: numericValue } : item)));
  };

  const addToCart = (batch) => {
    const existing = cart.find((item) => item.batchId === batch.id);
    if (existing) {
      const currentQty = Number(existing.quantity) || 0;
      if (currentQty + 1 > batch.quantity) {
        alert('Stock limit reached for this batch');
        return;
      }
      setCart(
        cart.map((item) =>
          item.batchId === batch.id ? { ...item, quantity: currentQty + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          batchId: batch.id,
          name: batch.medicine?.name,
          brand: batch.medicine?.brand || 'Generic',
          batchNumber: batch.batchNumber,
          unitPrice: Number(batch.sellingPrice),
          maxStock: Number(batch.quantity),
          quantity: 1
        }
      ]);
    }
  };

  const updateQuantity = (batchId, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.batchId === batchId) {
            const currentQty = Number(item.quantity) || 0;
            const newQty = currentQty + delta;
            if (newQty > item.maxStock) {
              alert('Stock limit exceeded');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (batchId) => {
    setCart(cart.filter((item) => item.batchId !== batchId));
  };

  const grossTotal = cart.reduce((sum, item) => sum + item.unitPrice * (Number(item.quantity) || 0), 0);
  const netTotal = Math.max(0, grossTotal - Number(discount));

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const hasInvalidQty = cart.some((item) => (Number(item.quantity) || 0) <= 0);
    if (hasInvalidQty) {
      alert('Please enter valid quantities for all items in the cart.');
      return;
    }

    try {
      const payload = {
        paymentMethod: paymentMethod || 'CASH',
        discountAmount: Number(discount) || 0,
        items: cart.map((i) => ({
          batchId: i.batchId,
          quantity: Number(i.quantity) || 0
        }))
      };

      const res = await axiosClient.post('/orders', payload);

      setReceiptData({
        orderId: res.data?.id || Math.floor(1000 + Math.random() * 9000),
        items: cart.map((c) => ({
          medicineName: c.name,
          quantity: Number(c.quantity) || 0,
          unitPrice: c.unitPrice
        })),
        subtotal: grossTotal,
        discount: Number(discount) || 0,
        netTotal: netTotal,
        paymentMethod: paymentMethod || 'CASH'
      });

      setShowReceipt(true);
      setCart([]);
      setDiscount(0);
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.medicine?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.medicine?.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-6rem)] font-sans">
      {/* Left: Product Row/Table View */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col shadow-sm">
        {/* Search Bar */}
        <div className="relative mb-3.5">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search medicine name, brand, or batch ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto border border-slate-200/70 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Medicine Name</th>
                <th className="p-2.5">Batch</th>
                <th className="p-2.5">Expiry</th>
                <th className="p-2.5 text-right">Available Qty</th>
                <th className="p-2.5 text-right">Unit Price</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((batch) => (
                <tr
                  key={batch.id}
                  onClick={() => addToCart(batch)}
                  className="hover:bg-emerald-50/40 cursor-pointer transition"
                >
                  <td className="p-2.5">
                    <p className="font-bold text-slate-800">{batch.medicine?.name}</p>
                    <p className="text-[10px] text-slate-400">{batch.medicine?.brand || 'OTC Item'}</p>
                  </td>
                  <td className="p-2.5 font-mono text-slate-600">{batch.batchNumber}</td>
                  <td className="p-2.5 text-slate-600">{batch.expiryDate}</td>
                  <td className="p-2.5 text-right">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md">
                      {batch.quantity}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">
                    Rs. {Number(batch.sellingPrice).toFixed(2)}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(batch);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition shadow-sm"
                    >
                      + Add
                    </button>
                  </td>
                </tr>
              ))}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                    No active medicines found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Cart & Billing Area */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" /> Current Bill Items
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {cart.length} Lines
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {cart.map((item) => (
              <div
                key={item.batchId}
                className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Rs. {item.unitPrice.toFixed(2)} | Max: {item.maxStock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">
                      Rs. {(item.unitPrice * (Number(item.quantity) || 0)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.batchId)}
                      className="text-rose-500 text-[10px] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.batchId, -1)}
                      className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={item.maxStock}
                      value={item.quantity}
                      onChange={(e) => handleDirectQuantityChange(item.batchId, e.target.value, item.maxStock)}
                      className="w-14 px-1 py-0.5 text-center text-xs font-bold bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.batchId, 1)}
                      className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDirectQuantityChange(item.batchId, (Number(item.quantity) || 0) + 10, item.maxStock)}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectQuantityChange(item.batchId, 30, item.maxStock)}
                      className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded"
                    >
                      30
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectQuantityChange(item.batchId, 60, item.maxStock)}
                      className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded"
                    >
                      60
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Cart is empty. Select items from the table.
              </div>
            )}
          </div>
        </div>

        {/* Calculation & Checkout */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal:</span>
            <span>Rs. {grossTotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Discount (Rs):</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-between font-bold text-sm text-slate-800 pt-1 border-t border-slate-100">
            <span>Net Total:</span>
            <span className="text-emerald-700 text-base">Rs. {netTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {['CASH', 'CARD'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                  paymentMethod === m
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            Complete Checkout (Rs. {netTotal.toFixed(2)})
          </button>
        </div>
      </div>

      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        orderData={receiptData}
      />
    </div>
  );
}