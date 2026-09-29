"use client";

import React, { useMemo } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import {
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  CreditCard,
  Edit,
  Eye,
  CheckCircle,
} from "lucide-react";

export default function CustomerProfileModal() {
  const {
    isCustomerProfileOpen,
    closeCustomerProfile,
    customerProfileData,
    documents,
    payments,
    openPreview,
    openPaymentModal,
    openCustomerModal,
  } = useUI();

  const customer = customerProfileData;

  const customerDocs = useMemo(() => {
    if (!customer) return [];
    return documents.filter((d) => d.customerId === customer.id);
  }, [customer, documents]);

  const customerPayments = useMemo(() => {
    if (!customer) return [];
    return payments.filter(
      (p) =>
        p.customerId === customer.id ||
        customerDocs.some((d) => d.id === p.documentId)
    );
  }, [customer, customerDocs, payments]);

  if (!isCustomerProfileOpen || !customer) return null;

  const totalInvoiced = customerDocs.reduce(
    (sum, d) => (d.status !== "void" ? sum + (Number(d.grandTotal) || 0) : sum),
    0
  );
  const totalPaid = customerDocs.reduce(
    (sum, d) => (d.status !== "void" ? sum + (Number(d.totalPaid) || 0) : sum),
    0
  );
  const totalOutstanding = customerDocs.reduce(
    (sum, d) => (d.status !== "void" ? sum + (Number(d.balanceDue) || 0) : sum),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0E1C2F] text-white px-6 py-4 flex items-center justify-between border-b border-[#1C314D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1C314D] border border-[#B45309] flex items-center justify-center">
              <Building className="w-5 h-5 text-[#FDE68A]" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {customer.company || customer.name}
              </h2>
              <div className="text-xs text-[#98A2B3] flex items-center gap-2">
                <span>GSTIN: {customer.gstin || "Unregistered"}</span>
                <span>•</span>
                <span>State Code: {customer.stateCode || "37"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeCustomerProfile();
                openCustomerModal(customer);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1C314D] hover:bg-[#284166] text-white text-xs font-semibold"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={closeCustomerProfile}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-[#FBF9F5]">
          {/* Lifetime Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
                Total Lifetime Billed
              </div>
              <div className="text-xl font-extrabold text-[#0E1C2F] mt-1 font-sans">
                {formatINR(totalInvoiced)}
              </div>
              <div className="text-[11px] text-[#475467] mt-0.5 font-mono">
                {customerDocs.length} Total Documents
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
                Total Inflows Received
              </div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1 font-sans">
                {formatINR(totalPaid)}
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5 font-mono">
                {customerPayments.length} Payment Receipts
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] font-mono">
                Current Outstanding Balance
              </div>
              <div className="text-xl font-extrabold text-[#991B1B] mt-1 font-sans">
                {formatINR(totalOutstanding)}
              </div>
              <div className="text-[11px] text-[#991B1B] mt-0.5 font-semibold">
                {totalOutstanding > 0 ? "Pending Collection" : "Zero Balance • Clear"}
              </div>
            </div>
          </div>

          {/* Client Details Card */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] font-mono">
                Client Information
              </div>
              <div>
                <span className="text-[#667085]">Contact Person: </span>
                <span className="font-semibold text-[#182230]">{customer.name}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#667085]" />
                  <span className="font-mono">{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] font-mono">
                Registered Addresses
              </div>
              <div>
                <span className="text-[#667085] block text-[10px] uppercase">Billing Address:</span>
                <span className="text-[#344054]">{customer.billingAddress || "Anantapur, Andhra Pradesh"}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px] uppercase">Shipping Site Address:</span>
                <span className="text-[#344054]">{customer.shippingAddress || customer.billingAddress}</span>
              </div>
            </div>
          </div>

          {/* Document History Table */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono">
                Document Ledger ({customerDocs.length})
              </div>
            </div>

            {customerDocs.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#667085]">No documents found for this client.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F7F5F0] text-[#667085] font-mono uppercase text-[10px] border-b border-[#E8E5DD]">
                      <th className="py-2 px-3">Doc #</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Grand Total</th>
                      <th className="py-2 px-3 text-right">Balance Due</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DD]">
                    {customerDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#FBF9F5]">
                        <td className="py-2 px-3 font-mono font-bold text-[#0E1C2F]">
                          {doc.documentNumber}
                        </td>
                        <td className="py-2 px-3 capitalize text-[#475467]">
                          {doc.documentType === "invoice" ? "Tax Invoice" : "Retail Bill"}
                        </td>
                        <td className="py-2 px-3 text-[#475467]">{doc.issueDate}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                          {formatINR(doc.grandTotal)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#991B1B]">
                          {formatINR(doc.balanceDue)}
                        </td>
                        <td className="py-2 px-3 text-center">
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
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openPreview(doc)}
                              className="p-1 text-[#1C314D] hover:bg-[#EFECE4] rounded"
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {doc.balanceDue > 0 && (
                              <button
                                onClick={() => openPaymentModal(doc)}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                title="Collect Payment"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
