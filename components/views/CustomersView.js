"use client";

import React, { useState, useMemo } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import { deleteCustomer } from "@/lib/db";
import {
  Users,
  UserPlus,
  Search,
  Building,
  Phone,
  Mail,
  Edit,
  Eye,
  FileText,
  DollarSign,
  ArrowRight,
  Trash2,
} from "lucide-react";

export default function CustomersView() {
  const {
    customersWithStats,
    openCustomerModal,
    openCustomerProfile,
    openCreateInvoice,
    showToast,
  } = useUI();

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return customersWithStats.filter((c) => {
      const q = search.toLowerCase();
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q) ||
        (c.gstin || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
      );
    });
  }, [customersWithStats, search]);

  const handleDeleteCustomer = async (c) => {
    if (confirm(`Are you sure you want to delete customer "${c.company || c.name}"? This will remove them from the registry.`)) {
      try {
        await deleteCustomer(c.id);
        showToast(`Customer "${c.company || c.name}" deleted.`, "info");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete customer.", "error");
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
              Customer Registry &amp; Client Accounts
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold border border-[#FDE68A]">
              B2B Accounts
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Verified commercial clients with GSTIN credentials, state taxation classifications, and 360° account summaries.
          </p>
        </div>

        <button
          onClick={() => openCustomerModal()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 text-[#FDE68A]" />
          <span>+ Register Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company, contact person, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs focus:outline-hidden focus:border-[#0E1C2F]"
          />
        </div>
        <div className="text-xs text-[#667085] font-mono flex items-center justify-between sm:justify-end">
          <span>Total Commercial Clients:</span>
          <span className="font-bold text-[#0E1C2F] ml-1.5">{customersWithStats.length}</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Company &amp; Client</th>
                <th className="py-2.5 px-3">GSTIN &amp; State</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-center">Invoices</th>
                <th className="py-2.5 px-3 text-right">Lifetime Billed</th>
                <th className="py-2.5 px-3 text-right">Total Inflow</th>
                <th className="py-2.5 px-3 text-right">Outstanding</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DD]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-xs text-[#667085]">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FBF9F5] transition-colors">
                    <td className="py-3 px-3">
                      <button
                        onClick={() => openCustomerProfile(c)}
                        className="font-bold text-[#182230] hover:text-[#B45309] text-left hover:underline block"
                      >
                        {c.company || c.name}
                      </button>
                      {c.company && (
                        <div className="text-[11px] text-[#475467]">Attn: {c.name}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-[#0E1C2F]">
                        {c.gstin || "Unregistered"}
                      </div>
                      <div className="text-[10px] text-[#667085]">
                        {c.state || "Andhra Pradesh"} (Code {c.stateCode || "37"})
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {c.phone && <div className="font-mono text-[#182230]">{c.phone}</div>}
                      {c.email && <div className="text-[10px] text-[#667085]">{c.email}</div>}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {c.totalInvoices}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                      {formatINR(c.lifetimeRevenue)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {formatINR(c.totalPaid)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#991B1B]">
                      {c.totalOutstanding > 0 ? formatINR(c.totalOutstanding) : "₹0.00"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openCustomerProfile(c)}
                          className="p-1.5 rounded text-[#0E1C2F] hover:bg-[#EFECE4] transition-colors"
                          title="View 360° Profile & Ledger"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openCustomerModal(c)}
                          className="p-1.5 rounded text-[#667085] hover:text-[#0E1C2F] hover:bg-[#EFECE4] transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c)}
                          className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
