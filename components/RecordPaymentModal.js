"use client";

import React, { useState, useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { recordPayment } from "@/lib/db";
import { formatINR } from "@/lib/calculations";
import { X, CreditCard, CheckCircle, IndianRupee, AlertCircle } from "lucide-react";

export default function RecordPaymentModal() {
  const { isPaymentModalOpen, closePaymentModal, paymentModalDoc, showToast } = useUI();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (paymentModalDoc) {
      setAmount(paymentModalDoc.balanceDue > 0 ? paymentModalDoc.balanceDue : paymentModalDoc.grandTotal);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Bank Transfer");
      setReferenceNumber("");
      setNotes("");
    }
  }, [paymentModalDoc, isPaymentModalOpen]);

  if (!isPaymentModalOpen || !paymentModalDoc) return null;

  const doc = paymentModalDoc;
  const balanceDue = Number(doc.balanceDue) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmt = Number(amount);

    if (isNaN(payAmt) || payAmt <= 0) {
      showToast("Please enter a valid payment amount greater than zero.", "error");
      return;
    }

    try {
      await recordPayment({
        documentId: doc.id,
        documentNumber: doc.documentNumber,
        documentType: doc.documentType,
        customerId: doc.customerId,
        customerName: doc.customerSnapshot?.company || doc.customerSnapshot?.name,
        amount: payAmt,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
        notes: notes.trim(),
      });

      showToast(`Payment of ₹${payAmt.toLocaleString()} applied to ${doc.documentNumber}`, "success");
      closePaymentModal();
    } catch (err) {
      console.error(err);
      showToast("Error recording payment. Please try again.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#0E1C2F] text-white px-6 py-4 flex items-center justify-between border-b border-[#1C314D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 border border-emerald-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Collect Payment Inflow</h2>
              <div className="text-xs text-[#98A2B3]">
                Applied to: <span className="font-mono text-[#FDE68A] font-bold">{doc.documentNumber}</span>
              </div>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#FBF9F5]">
          {/* Document Summary Card */}
          <div className="bg-white p-3.5 rounded-lg border border-[#E8E5DD] text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#667085]">Customer:</span>
              <span className="font-bold text-[#0E1C2F]">
                {doc.customerSnapshot?.company || doc.customerSnapshot?.name}
              </span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-[#667085]">Invoice Total:</span>
              <span>{formatINR(doc.grandTotal)}</span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-[#667085]">Previously Received:</span>
              <span className="text-emerald-700 font-semibold">{formatINR(doc.totalPaid)}</span>
            </div>
            <div className="flex justify-between items-center font-mono pt-1 border-t border-[#E8E5DD]">
              <span className="font-bold text-[#991B1B]">Current Outstanding:</span>
              <span className="text-sm font-black text-[#991B1B]">{formatINR(balanceDue)}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Payment Amount to Collect (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#DCD7CD] rounded bg-white font-mono font-bold text-base text-[#0E1C2F]"
                  required
                />
              </div>
              {balanceDue > 0 && (
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setAmount(balanceDue)}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] text-[#854D0E] font-semibold border border-[#FDE68A]"
                  >
                    Set Full Balance ({formatINR(balanceDue)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(balanceDue / 2))}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#EFECE4] text-[#344054] font-semibold border border-[#DCD7CD]"
                  >
                    50% Partial ({formatINR(Math.round(balanceDue / 2))})
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI (GooglePay/PhonePe)</option>
                  <option value="Cash">Cash Inflow</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                Transaction Reference / UTR / Cheque No.
              </label>
              <input
                type="text"
                placeholder="e.g. UBINR52026090123984 or UPI/489102"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Remarks / Note</label>
              <textarea
                rows="2"
                placeholder="Union Bank Account receipt, verified by accounts"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD7CD] rounded bg-white"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E5DD]">
            <button
              type="button"
              onClick={closePaymentModal}
              className="px-4 py-2 rounded-md border border-[#DCD7CD] bg-white text-[#344054] text-xs font-semibold hover:bg-[#F2EFE8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span>Record Inflow &amp; Update Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
