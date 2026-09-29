"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import { voidDocument, deleteDocument } from "@/lib/db";
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Eye,
  CreditCard,
  Ban,
  Zap,
  Trash2,
} from "lucide-react";

export default function BillsView({ autoOpenCreate = false }) {
  const {
    documents,
    openCreateBill,
    openPreview,
    showToast,
  } = useUI();

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (autoOpenCreate) {
      openCreateBill();
    }
  }, [autoOpenCreate, openCreateBill]);

  const bills = useMemo(() => {
    return documents.filter((d) => d.documentType === "bill");
  }, [documents]);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const q = search.toLowerCase();
      const docNum = (b.documentNumber || "").toLowerCase();
      const name = (b.customerSnapshot?.name || "").toLowerCase();
      const phone = (b.customerSnapshot?.phone || "");
      return (
        docNum.includes(q) ||
        name.includes(q) ||
        phone.includes(q)
      );
    });
  }, [bills, search]);

  const handleVoid = async (doc) => {
    if (confirm(`Void retail bill ${doc.documentNumber}?`)) {
      try {
        await voidDocument(doc.id, "Voided by counter staff");
        showToast(`Bill ${doc.documentNumber} marked as VOID.`, "info");
      } catch (err) {
        console.error(err);
        showToast("Error voiding bill.", "error");
      }
    }
  };

  const handleDelete = async (b) => {
    if (confirm(`Permanently delete retail bill ${b.documentNumber}? This will remove it from all records.`)) {
      try {
        await deleteDocument(b.id);
        showToast(`Bill ${b.documentNumber} deleted permanently.`, "info");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete bill.", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E1C2F] font-serif">
              Retail &amp; Counter Bills
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-[#B45309] font-bold border border-amber-200">
              Point of Sale Desk
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Instant point-of-sale retail billing for farmers, local contractors, walk-in customers with cash/UPI receipts.
          </p>
        </div>

        <button
          onClick={openCreateBill}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Zap className="w-4 h-4 text-white" />
          <span>+ Rapid Counter Bill</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bill #, buyer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs focus:outline-hidden focus:border-[#0E1C2F]"
          />
        </div>
        <div className="text-xs text-[#667085] font-mono flex items-center justify-between sm:justify-end">
          <span>Total Counter Bills:</span>
          <span className="font-bold text-[#0E1C2F] ml-1.5">{bills.length}</span>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-[#1C314D] text-white font-mono uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Bill #</th>
                <th className="py-2.5 px-3">Buyer / Farm Name</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-center">Items</th>
                <th className="py-2.5 px-3 text-right">Grand Total (₹)</th>
                <th className="py-2.5 px-3 text-center">Payment Mode</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DD]">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-xs text-[#667085]">
                    No counter bills found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => {
                  const isVoid = b.status === "void";
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-[#FBF9F5] transition-colors ${
                        isVoid ? "opacity-50 bg-[#F7F5F0]" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#0E1C2F]">
                        {b.documentNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#182230]">
                          {b.customerSnapshot?.name || "Counter Customer"}
                        </div>
                        {b.customerSnapshot?.phone && (
                          <div className="text-[10px] font-mono text-[#667085]">
                            {b.customerSnapshot.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#475467] font-mono">{b.issueDate}</td>
                      <td className="py-3 px-3 text-center font-mono">
                        {(b.items || []).length}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                        {formatINR(b.grandTotal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          {b.paymentMethod || "Cash"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            isVoid
                              ? "bg-slate-200 text-slate-700"
                              : "bg-[#DCFCE7] text-[#166534]"
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPreview(b)}
                            className="p-1.5 rounded text-[#0E1C2F] hover:bg-[#EFECE4] transition-colors"
                            title="Print / Save PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {!isVoid && (
                            <button
                              onClick={() => handleVoid(b)}
                              className="p-1.5 rounded text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Void Bill"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Bill Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
