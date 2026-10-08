"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import { deleteDocument } from "@/lib/db";
import { WhatsAppIcon } from "../WhatsAppShareModal";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  CreditCard,
  Download,
  Printer,
  Calendar,
  Building,
  Trash2,
} from "lucide-react";

export default function InvoicesView({ autoOpenCreate = false }) {
  const {
    documents,
    openCreateInvoice,
    openPreview,
    openPaymentModal,
    openCustomerProfile,
    openWhatsAppModal,
    showToast,
    dbLoading,
    syncStatus,
    syncError,
    retryCloudSync,
  } = useUI();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (autoOpenCreate) {
      openCreateInvoice();
    }
  }, [autoOpenCreate, openCreateInvoice]);

  const invoices = useMemo(() => {
    return documents.filter((d) => d.documentType === "invoice");
  }, [documents]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((doc) => {
      const q = search.toLowerCase();
      const docNum = (doc.documentNumber || "").toLowerCase();
      const company = (doc.customerSnapshot?.company || "").toLowerCase();
      const name = (doc.customerSnapshot?.name || "").toLowerCase();
      const gstin = (doc.customerSnapshot?.gstin || "").toLowerCase();

      const matchesSearch =
        docNum.includes(q) ||
        company.includes(q) ||
        name.includes(q) ||
        gstin.includes(q);

      const matchesStatus =
        statusFilter === "all" || doc.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);


  const handleDelete = async (doc) => {
    if (confirm(`Are you sure you want to permanently DELETE invoice ${doc.documentNumber}? This will remove it from all records.`)) {
      try {
        await deleteDocument(doc.id);
        showToast(`Invoice ${doc.documentNumber} deleted permanently.`, "info");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete invoice.", "error");
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
              GST Commercial Tax Invoices
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold border border-[#FDE68A]">
              B2B Register
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Commercial tax invoices with Andhra Pradesh intra-state (CGST+SGST) and inter-state (IGST) tax calculation.
          </p>
        </div>

        <button
          onClick={openCreateInvoice}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#FDE68A]" />
          <span>New Tax Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, client, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs focus:outline-hidden focus:border-[#0E1C2F]"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[#667085] text-xs">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs font-medium flex-1 sm:flex-initial"
          >
            <option value="all">All Invoices ({invoices.length})</option>
            <option value="unpaid">Unpaid Only</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Settled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer / GSTIN</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DD]">
              {dbLoading && invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-xs text-[#1E40AF]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold">Loading your UFW invoices from cloud...</span>
                    </div>
                  </td>
                </tr>
              ) : syncStatus === "error" && invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-xs text-red-700">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="font-semibold">Unable to load invoices from cloud.</span>
                      <button
                        type="button"
                        onClick={() => retryCloudSync && retryCloudSync()}
                        className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold cursor-pointer"
                      >
                        Retry Sync
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-xs text-[#667085]">
                    {search || statusFilter !== "all"
                      ? "No invoices found matching your filter criteria."
                      : "No tax invoices created yet. Click '+ Tax Invoice' above to generate one."}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((doc) => {
                  const isVoid = doc.status === "void";
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-[#FBF9F5] transition-colors ${
                        isVoid ? "opacity-50 bg-[#F7F5F0]" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#0E1C2F]">
                        {doc.documentNumber}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => openCustomerProfile(doc.customerSnapshot)}
                          className="font-bold text-[#182230] hover:text-[#B45309] text-left hover:underline block max-w-xs truncate"
                        >
                          {doc.customerSnapshot?.company || doc.customerSnapshot?.name}
                        </button>
                        <div className="text-[10px] font-mono text-[#667085]">
                          GSTIN: {doc.customerSnapshot?.gstin || "Unregistered"} (State: {doc.customerSnapshot?.stateCode || "37"})
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#475467] font-mono">
                        <div>{doc.issueDate}</div>
                        {doc.dueDate && (
                          <div className="text-[10px] text-[#667085]">Due: {doc.dueDate}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#475467]">
                        {formatINR(doc.taxableAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#475467]">
                        {formatINR(doc.totalTax)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                        {formatINR(doc.grandTotal)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#991B1B]">
                        {doc.balanceDue > 0 ? formatINR(doc.balanceDue) : "₹0.00"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            isVoid
                              ? "bg-slate-200 text-slate-700"
                              : doc.paymentStatus === "paid"
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : doc.paymentStatus === "partially_paid"
                              ? "bg-[#FEF3C7] text-[#854D0E]"
                              : "bg-[#FEE2E2] text-[#991B1B]"
                          }`}
                        >
                          {doc.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPreview(doc)}
                            className="p-1.5 rounded text-[#0E1C2F] hover:bg-[#EFECE4] transition-colors"
                            title="Print / Save PDF"
                            aria-label="Print / Save PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openWhatsAppModal(doc)}
                            className="p-1.5 rounded text-[#25D366] hover:bg-emerald-50 transition-colors"
                            title="Share via WhatsApp"
                            aria-label="Share via WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </button>
                          {doc.balanceDue > 0 && (
                            <button
                              onClick={() => openPaymentModal(doc)}
                              className="p-1.5 rounded text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Collect Payment"
                              aria-label="Collect Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Invoice Permanently"
                            aria-label="Delete Invoice Permanently"
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
