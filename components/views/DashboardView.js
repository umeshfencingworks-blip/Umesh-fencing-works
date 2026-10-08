"use client";

import React from "react";
import Link from "next/link";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import {
  FileText,
  Receipt,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
  Plus,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function DashboardView() {
  const {
    metrics,
    documents,
    customers,
    auditLogs,
    openCreateInvoice,
    openCreateBill,
    openCustomerModal,
    openPreview,
    openPaymentModal,
  } = useUI();

  const recentInvoices = documents
    .filter((d) => d.documentType === "invoice")
    .slice(0, 5);

  const recentBills = documents
    .filter((d) => d.documentType === "bill")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E5DD]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E1C2F] font-serif">
              Operational Command Desk
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Active billing registers, receivables tracking, and recent factory dispatches.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateBill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F2EFE8] text-[#1C314D] border border-[#DCD7CD] text-xs font-semibold shadow-2xs"
          >
            <Receipt className="w-3.5 h-3.5 text-[#B45309]" />
            <span>+ Counter Bill</span>
          </button>
          <button
            onClick={openCreateInvoice}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>+ Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed Documents */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
              B2B Tax Invoices
            </span>
            <div className="w-7 h-7 rounded bg-[#F0F4FA] flex items-center justify-center text-[#1C314D]">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0E1C2F] font-sans">
            {metrics.invoiceCount}
          </div>
          <div className="text-[11px] text-[#475467] flex items-center justify-between pt-1 border-t border-[#E8E5DD]">
            <span>Volume: {formatINR(metrics.totalBilledInvoices)}</span>
            <Link href="/invoices" prefetch={true} className="text-[#B45309] font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Counter Bills */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
              Counter Retail Bills
            </span>
            <div className="w-7 h-7 rounded bg-amber-50 flex items-center justify-center text-[#B45309]">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0E1C2F] font-sans">
            {metrics.billCount}
          </div>
          <div className="text-[11px] text-[#475467] flex items-center justify-between pt-1 border-t border-[#E8E5DD]">
            <span>Volume: {formatINR(metrics.totalBilledBills)}</span>
            <Link href="/bills" prefetch={true} className="text-[#B45309] font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] font-mono">
              Outstanding Receivables
            </span>
            <div className="w-7 h-7 rounded bg-red-50 flex items-center justify-center text-red-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#991B1B] font-sans">
            {formatINR(metrics.totalOutstanding)}
          </div>
          <div className="text-[11px] text-[#475467] flex items-center justify-between pt-1 border-t border-[#E8E5DD]">
            <span>{metrics.overdueCount} Invoices Overdue</span>
            <Link href="/invoices?filter=unpaid" prefetch={true} className="text-red-700 font-semibold hover:underline">
              Collect &rarr;
            </Link>
          </div>
        </div>

        {/* Commercial Customers */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
              Registered Clients
            </span>
            <div className="w-7 h-7 rounded bg-[#F7F5F0] flex items-center justify-center text-[#0E1C2F]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0E1C2F] font-sans">
            {customers.length}
          </div>
          <div className="text-[11px] text-[#475467] flex items-center justify-between pt-1 border-t border-[#E8E5DD]">
            <span>Andhra &amp; Inter-State B2B</span>
            <Link href="/customers" prefetch={true} className="text-[#B45309] font-semibold hover:underline">
              Registry &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Invoices & Recent Retail Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tax Invoices */}
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-[#E8E5DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#B45309]" />
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
                Recent GST Tax Invoices
              </h2>
            </div>
            <Link href="/invoices" prefetch={true} className="text-xs font-semibold text-[#B45309] hover:underline flex items-center gap-1">
              <span>All Invoices</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-[#FBF9F5] text-[#667085] font-mono uppercase text-[9px] border-b border-[#E8E5DD]">
                  <th className="py-2 px-3">Invoice #</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-right">Balance</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {recentInvoices.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FBF9F5]">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">
                      {doc.documentNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#182230] truncate max-w-[140px]">
                        {doc.customerSnapshot?.company || doc.customerSnapshot?.name}
                      </div>
                      <div className="text-[10px] text-[#667085]">{doc.issueDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                      {formatINR(doc.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#991B1B]">
                      {doc.balanceDue > 0 ? formatINR(doc.balanceDue) : "₹0.00"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          doc.paymentStatus === "paid"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : doc.paymentStatus === "partially_paid"
                            ? "bg-[#FEF3C7] text-[#854D0E]"
                            : "bg-[#FEE2E2] text-[#991B1B]"
                        }`}
                      >
                        {doc.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPreview(doc)}
                          className="p-1 text-[#1C314D] hover:bg-[#EFECE4] rounded"
                          title="Print / View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {doc.balanceDue > 0 && (
                          <button
                            onClick={() => openPaymentModal(doc)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Collect Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Retail Bills */}
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-[#E8E5DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#B45309]" />
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
                Recent Point-of-Sale Counter Bills
              </h2>
            </div>
            <Link href="/bills" prefetch={true} className="text-xs font-semibold text-[#B45309] hover:underline flex items-center gap-1">
              <span>All Bills</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#FBF9F5] text-[#667085] font-mono uppercase text-[9px] border-b border-[#E8E5DD]">
                  <th className="py-2 px-3">Bill #</th>
                  <th className="py-2 px-3">Counter Buyer</th>
                  <th className="py-2 px-3 text-right">Total (₹)</th>
                  <th className="py-2 px-3 text-center">Mode</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {recentBills.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FBF9F5]">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">
                      {doc.documentNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#182230]">
                        {doc.customerSnapshot?.name || "Walk-In Farmer"}
                      </div>
                      <div className="text-[10px] text-[#667085]">{doc.issueDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                      {formatINR(doc.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] font-bold">
                        {doc.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openPreview(doc)}
                        className="p-1 text-[#1C314D] hover:bg-[#EFECE4] rounded"
                        title="Print / View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Activity Stream */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B45309]" />
            <span>Recent System &amp; Ledger Events</span>
          </div>
          <Link href="/admin-controls?tab=activity" prefetch={true} className="text-xs text-[#667085] hover:underline font-mono">
            View Full Audit Trail &rarr;
          </Link>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-[#FBF9F5] border border-[#E8E5DD] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFECE4] text-[#0E1C2F]">
                  {log.action}
                </span>
                <span className="text-[#182230] font-medium">{log.details}</span>
              </div>
              <span className="text-[10px] text-[#667085] font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
