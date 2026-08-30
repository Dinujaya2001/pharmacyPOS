import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, Printer } from 'lucide-react';

export default function PosBilling() {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axiosClient.get('/inventory/batches');
      setBatches(res.data.filter(b => b.quantity > 0));
    } catch (err) {
      console.error('Failed to fetch batches', err);
    }
  };

  const addToCart = (batch) => {
    const existing = cart.find(item => item.batchId === batch.id);
    if (existing) {
      if (existing.quantity + 1 > batch.quantity) {
        alert('Stock limit reached for this batch');
        return;
      }
      setCart(cart.map(item => item.batchId === batch.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        batchId: batch.id,
        name: batch.medicine.name,
        batchNumber: batch.batchNumber,
        unitPrice: batch.sellingPrice,
        maxStock: batch.quantity,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (batchId, delta) => {
    setCart(cart.map(item => {
      if (item.batchId === batchId) {
        const newQty = item.quantity + delta;
        if (newQty > item.maxStock) {
          alert('Stock limit exceeded');
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (batchId) => {
    setCart(cart.filter(item => item.batchId !== batchId));
  };

  const grossTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const netTotal = Math.max(0, grossTotal - Number(discount));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        paymentMethod,
        discountAmount: Number(discount),
        items: cart.map(i => ({ batchId: i.batchId, quantity: i.quantity }))
      };
      const res = await axiosClient.post('/orders', payload);
      setLastOrder(res.data);
      setCart([]);
      setDiscount(0);
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  const filteredBatches = batches.filter(b => 
    b.medicine?.name.toLowerCase().includes(search.toLowerCase()) ||
    b.batchNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">
      {/* Product Selection Area */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col">
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine by name or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
          {filteredBatches.map(batch => (
            <div 
              key={batch.id} 
              onClick={() => addToCart(batch)}
              className="p-3 border border-slate-100 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-xl cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{batch.medicine?.name}</h4>
                <p className="text-[11px] text-slate-500">Batch: {batch.batchNumber} | Exp: {batch.expiryDate}</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-emerald-600 text-sm">Rs. {batch.sellingPrice}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
                  {batch.quantity} left
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Billing Checkout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" /> Cart Items
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {cart.length}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {cart.map(item => (
              <div key={item.batchId} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="truncate w-32">
                  <p className="font-semibold text-slate-800 text-xs truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">Rs. {item.unitPrice} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.batchId, -1)} className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100">
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.batchId, 1)} className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100">
                    <Plus className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">Rs. {(item.unitPrice * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.batchId)} className="text-rose-500 text-[10px] hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation & Checkout */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
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
              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right text-xs"
            />
          </div>
          <div className="flex justify-between font-bold text-base text-slate-800 pt-2 border-t border-slate-100">
            <span>Net Total:</span>
            <span className="text-emerald-600">Rs. {netTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setPaymentMethod('CASH')}
              className={`py-1.5 text-xs font-semibold rounded-lg border ${paymentMethod === 'CASH' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600'}`}
            >
              CASH
            </button>
            <button 
              type="button" 
              onClick={() => setPaymentMethod('CARD')}
              className={`py-1.5 text-xs font-semibold rounded-lg border ${paymentMethod === 'CARD' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600'}`}
            >
              CARD
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-md transition duration-150 disabled:opacity-50"
          >
            Complete Checkout (Rs. {netTotal.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
}