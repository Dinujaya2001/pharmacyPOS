import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, orderData }) {
  const receiptRef = useRef();

  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // State එක restore කිරීමට
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Receipt Preview</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable 80mm Thermal Receipt Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-50 flex justify-center">
          <div
            ref={receiptRef}
            className="w-[78mm] bg-white p-4 text-black font-mono text-[11px] leading-tight border border-slate-200 shadow-sm"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="text-sm font-bold tracking-wider">PHARMAPOS PHARMACY</h2>
              <p className="text-[10px]">No 123, Galle Road, Colombo</p>
              <p className="text-[10px]">Tel: 011-2345678</p>
            </div>

            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Inv: #{orderData.orderId || orderData.id || 'N/A'}</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier: Admin</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-2 border-b border-dashed border-black">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-dashed border-black text-[10px]">
                    <th className="py-1">Item</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-slate-300">
                  {orderData.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1 truncate max-w-[90px]">
                        {item.medicineName || item.name}
                      </td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">{item.unitPrice?.toFixed(2)}</td>
                      <td className="text-right py-1 font-semibold">
                        {(item.quantity * item.unitPrice)?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations */}
            <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-black">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {orderData.subtotal?.toFixed(2) || orderData.totalAmount?.toFixed(2)}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>- Rs. {orderData.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                <span>NET TOTAL:</span>
                <span>Rs. {orderData.netTotal?.toFixed(2) || orderData.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1">
                <span>Payment: {orderData.paymentMethod || 'CASH'}</span>
                <span>PAID</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[9px] space-y-0.5">
              <p>*** THANK YOU - COME AGAIN ***</p>
              <p>Software by PharmacyPOS</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={onClose}
            className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}