"use client";

import React, { useState, useMemo } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import {
  Truck,
  Plus,
  Search,
  FileSpreadsheet,
  Trash2,
  Eye,
  CreditCard,
  DollarSign,
  Package,
  Calendar,
  Building,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Printer,
  X,
  FileText,
  Layers,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function PurchaseLedger() {
  const {
    purchases,
    purchaseSummary,
    savePurchase,
    recordPurchasePayment,
    deletePurchase,
    exportPurchaseLedgerCSV,
    showToast,
    navigate,
  } = useUI();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPurchaseForView, setSelectedPurchaseForView] = useState(null);
  const [paymentModalPurchase, setPaymentModalPurchase] = useState(null);

  // New Purchase Form State
  const initialPurchaseForm = {
    supplierName: "",
    contactPerson: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierGstin: "",
    supplierAddress: "",
    supplierCity: "Anantapur",
    supplierInvoiceNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentMethod: "Bank Transfer (NEFT)",
    amountPaid: "",
    paymentReference: "",
    vehicleNumber: "",
    transporter: "",
    notes: "",
    items: [
      {
        materialName: "Hot-Dip Galvanized Iron Wire (8 Gauge)",
        category: "Steel Wire",
        qty: "500",
        unit: "kg",
        rate: "76",
        taxRate: "18",
      },
    ],
  };

  const [formData, setFormData] = useState(initialPurchaseForm);
  const [formError, setFormError] = useState("");

  // Payment Form State
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer (NEFT)",
    referenceNumber: "",
    notes: "",
  });

  // Calculate live totals for the new purchase modal form
  const formCalculations = useMemo(() => {
    let taxable = 0;
    let tax = 0;
    (formData.items || []).forEach((item) => {
      const q = Number(item.qty) || 0;
      const r = Number(item.rate) || 0;
      const tr = Number(item.taxRate) || 0;
      const lineTaxable = q * r;
      const lineTax = (lineTaxable * tr) / 100;
      taxable += lineTaxable;
      tax += lineTax;
    });
    const grandTotal = taxable + tax;
    const paid = Number(formData.amountPaid) || 0;
    const balance = Math.max(0, grandTotal - paid);
    return {
      taxable: Number(taxable.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      paid: Number(paid.toFixed(2)),
      balance: Number(balance.toFixed(2)),
    };
  }, [formData.items, formData.amountPaid]);

  // Filtered purchases list
  const filteredPurchases = useMemo(() => {
    return (purchases || []).filter((p) => {
      // Status filter
      if (statusFilter !== "all" && p.paymentStatus !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "all") {
        const hasCategory = (p.items || []).some((it) => it.category === categoryFilter);
        if (!hasCategory) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSupplier = p.supplier?.name?.toLowerCase().includes(q);
        const matchesVoucher = p.purchaseNumber?.toLowerCase().includes(q);
        const matchesBillNo = p.supplierInvoiceNumber?.toLowerCase().includes(q);
        const matchesPhone = p.supplier?.phone?.includes(q);
        const matchesItem = (p.items || []).some((it) =>
          it.materialName?.toLowerCase().includes(q)
        );
        return matchesSupplier || matchesVoucher || matchesBillNo || matchesPhone || matchesItem;
      }
      return true;
    });
  }, [purchases, statusFilter, categoryFilter, searchQuery]);

  // Handle Item Row Changes in New Purchase Form
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, items: nextItems };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          materialName: "",
          category: "Steel Wire",
          qty: "",
          unit: "kg",
          rate: "",
          taxRate: "18",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  // Submit New Purchase Form
  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.supplierName.trim()) {
      setFormError("Please enter the supplier / vendor name.");
      return;
    }

    const validItems = formData.items.filter(
      (it) => it.materialName.trim() && Number(it.qty) > 0 && Number(it.rate) > 0
    );

    if (validItems.length === 0) {
      setFormError("Please enter at least one valid material item with quantity and rate.");
      return;
    }

    try {
      const purchasePayload = {
        supplierInvoiceNumber: (formData.supplierInvoiceNumber || "").trim(),
        purchaseDate: formData.purchaseDate,
        dueDate: (formData.dueDate || formData.purchaseDate),
        supplier: {
          name: formData.supplierName.trim(),
          contactPerson: (formData.contactPerson || "").trim(),
          phone: (formData.supplierPhone || "").trim(),
          email: (formData.supplierEmail || "").trim(),
          gstin: (formData.supplierGstin || "").trim(),
          address: (formData.supplierAddress || "").trim(),
          city: (formData.supplierCity || "").trim() || "Anantapur",
        },
        items: validItems.map((it) => ({
          materialName: it.materialName.trim(),
          category: it.category,
          qty: Number(it.qty),
          unit: it.unit || "kg",
          rate: Number(it.rate),
          taxRate: Number(it.taxRate) || 0,
        })),
        amountPaid: Number(formData.amountPaid) || 0,
        paymentMethod: formData.paymentMethod || "Bank Transfer (NEFT)",
        paymentReference: (formData.paymentReference || "").trim(),
        vehicleNumber: (formData.vehicleNumber || "").trim(),
        transporter: (formData.transporter || "").trim(),
        notes: (formData.notes || "").trim(),
      };

      await savePurchase(purchasePayload);
      setIsCreateModalOpen(false);
      setFormData(initialPurchaseForm);
    } catch (err) {
      setFormError(err.message || "Failed to save purchase voucher.");
    }
  };

  // Submit Outgoing Payment
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalPurchase) return;
    const amount = Number(paymentFormData.amount);
    if (!amount || amount <= 0) {
      showToast("Please enter a valid payment amount.", "error");
      return;
    }
    if (amount > paymentModalPurchase.balanceDue) {
      showToast(`Payment exceeds outstanding balance of ${formatINR(paymentModalPurchase.balanceDue)}.`, "error");
      return;
    }

    try {
      await recordPurchasePayment(paymentModalPurchase.id, {
        amount,
        paymentDate: paymentFormData.paymentDate,
        paymentMethod: paymentFormData.paymentMethod,
        referenceNumber: paymentFormData.referenceNumber.trim(),
        notes: paymentFormData.notes.trim(),
      });
      setPaymentModalPurchase(null);
      setPaymentFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Bank Transfer (NEFT)",
        referenceNumber: "",
        notes: "",
      });
    } catch (err) {
      // error toast handled in context
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportPurchaseLedgerCSV();
    const dateStr = new Date().toISOString().split("T")[0];
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ufw-purchase-ledger-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Purchase ledger downloaded as CSV.", "success");
  };

  return (
    <div className="space-y-5">
      {/* Purchase Ledger, Raw Material and Supply Section */}
      <div className="bg-[#FAF9F5] border border-[#E8E5DD] rounded-xl p-3 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0E1C2F] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Truck className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>Purchase Ledger, Raw Material and Supply</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-white font-bold">
              Active
            </span>
          </div>
        </div>
        <div className="text-[11px] text-[#667085] hidden md:block">
          Tracking factory raw material purchases, supplier GST vouchers, and outgoing procurement expenses
        </div>
      </div>

      {/* 1. Header Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-[#E8E5DD] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B45309]/10 text-[#B45309] flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0E1C2F]">
              Purchase Ledger, Raw Material and Supply
            </h2>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Track outgoing raw material purchases (GI wire, cement, barbed wire, angle iron), supplier payables, and factory procurement expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] text-xs font-semibold text-[#344054] transition-colors shadow-2xs"
            title="Download full purchase register spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setFormData(initialPurchaseForm);
              setFormError("");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#B45309] hover:bg-[#92400E] active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Purchase</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Outgoing Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Material Purchases */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#667085] tracking-wider font-bold">
              Total Purchases (Expense)
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-[#B45309] flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-[#0E1C2F] font-mono mt-1">
            {formatINR(purchaseSummary?.totalExpensesAmount || 0)}
          </div>
          <div className="text-[10px] text-[#667085] mt-0.5">
            Lifetime procurement value ({purchaseSummary?.totalPurchasesCount || 0} bills)
          </div>
        </div>

        {/* Total Outgoing Settled */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider font-bold">
              Outgoing Paid
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatINR(purchaseSummary?.totalExpensesPaid || 0)}
          </div>
          <div className="text-[10px] text-[#667085] mt-0.5">
            Verified cash, NEFT &amp; RTGS outflows
          </div>
        </div>

        {/* Outstanding Supplier Payables */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-red-700 tracking-wider font-bold">
              Supplier Payables
            </span>
            <div className="w-6 h-6 rounded-md bg-red-50 text-red-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-red-700 font-mono mt-1">
            {formatINR(purchaseSummary?.totalPendingPayables || 0)}
          </div>
          <div className="text-[10px] text-[#667085] mt-0.5">
            Balance owed to material suppliers
          </div>
        </div>

        {/* Total Raw Material Volume */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-indigo-700 tracking-wider font-bold">
              Material Volume
            </span>
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-indigo-900 font-mono mt-1">
            {Number(purchaseSummary?.totalMaterialQuantity || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
          </div>
          <div className="text-[10px] text-[#667085] mt-0.5">
            Total kg, bags &amp; posts received
          </div>
        </div>
      </div>

      {/* 3. Filters and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplier, item, bill #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Purchases" },
            { id: "paid", label: "Fully Settled" },
            { id: "partially_paid", label: "Partial" },
            { id: "pending", label: "Credit / Pending" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? "bg-[#0E1C2F] text-white shadow-2xs"
                  : "text-[#475467] hover:bg-[#F2EFE8] hover:text-[#0E1C2F]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Purchases Ledger Table */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF9F5] border-b border-[#E8E5DD] text-[#475467] font-semibold">
              <tr>
                <th className="py-3 px-3">Voucher # / Date</th>
                <th className="py-3 px-3">Supplier / Vendor</th>
                <th className="py-3 px-3">Materials Purchased</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">Total Expense</th>
                <th className="py-3 px-3 text-right">Paid Out</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DD] text-[#344054]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold">No purchase records found</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== "all"
                        ? "Try clearing your search or status filters."
                        : "Click 'Record New Purchase' to log supplier raw material expenses."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  const itemsCount = (purchase.items || []).length;
                  const firstItem = purchase.items?.[0];

                  return (
                    <tr key={purchase.id} className="hover:bg-[#FAF9F5] transition-colors">
                      {/* Voucher & Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#0E1C2F]">
                          {purchase.purchaseNumber}
                        </div>
                        <div className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#B45309]" />
                          <span>{purchase.purchaseDate}</span>
                        </div>
                        {purchase.supplierInvoiceNumber && (
                          <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                            Bill: {purchase.supplierInvoiceNumber}
                          </div>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#0E1C2F]">
                          {purchase.supplier?.name}
                        </div>
                        {purchase.supplier?.contactPerson && (
                          <div className="text-[10.5px] text-[#667085]">
                            Attn: {purchase.supplier.contactPerson}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          {purchase.supplier?.phone && <span>{purchase.supplier.phone}</span>}
                          {purchase.supplier?.city && <span>• {purchase.supplier.city}</span>}
                        </div>
                        {purchase.supplier?.gstin && (
                          <div className="font-mono text-[9.5px] text-emerald-700">
                            GSTIN: {purchase.supplier.gstin}
                          </div>
                        )}
                      </td>

                      {/* Materials Summary */}
                      <td className="py-3 px-3">
                        {firstItem ? (
                          <div>
                            <div className="font-medium text-[#0E1C2F] line-clamp-1">
                              {firstItem.qty} {firstItem.unit} {firstItem.materialName}
                            </div>
                            {itemsCount > 1 && (
                              <div className="text-[10px] text-[#B45309] font-semibold mt-0.5">
                                + {itemsCount - 1} more material items
                              </div>
                            )}
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9.5px] font-mono">
                              {firstItem.category}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Taxable */}
                      <td className="py-3 px-3 text-right font-mono text-[#475467]">
                        {formatINR(purchase.taxableAmount)}
                      </td>

                      {/* Total Expense */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                        {formatINR(purchase.totalAmount)}
                      </td>

                      {/* Paid Out */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                        {formatINR(purchase.amountPaid)}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={purchase.balanceDue > 0 ? "text-red-700" : "text-slate-400"}>
                          {formatINR(purchase.balanceDue)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            purchase.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : purchase.paymentStatus === "partially_paid"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {purchase.paymentStatus === "paid"
                            ? "Paid"
                            : purchase.paymentStatus === "partially_paid"
                            ? "Partial"
                            : "Pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Voucher */}
                          <button
                            onClick={() => setSelectedPurchaseForView(purchase)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="View Purchase Voucher"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Payment if balance due */}
                          {purchase.balanceDue > 0 && (
                            <button
                              onClick={() => {
                                setPaymentModalPurchase(purchase);
                                setPaymentFormData({
                                  amount: purchase.balanceDue,
                                  paymentDate: new Date().toISOString().split("T")[0],
                                  paymentMethod: "Bank Transfer (NEFT)",
                                  referenceNumber: "",
                                  notes: "",
                                });
                              }}
                              className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 transition-colors"
                              title="Record Supplier Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete purchase voucher ${purchase.purchaseNumber} (${purchase.supplier?.name})?`
                                )
                              ) {
                                deletePurchase(purchase.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-red-100 text-red-600 hover:text-red-900 transition-colors"
                            title="Delete Purchase Voucher"
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

      {/* 5. MODAL: Record New Purchase Voucher */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
            {/* Modal Header */}
            <div className="bg-[#0E1C2F] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1C314D] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B45309] flex items-center justify-center text-white">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Record New Material Purchase
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Log outgoing purchase bill, supplier details, raw materials &amp; payments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleCreatePurchase} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Supplier / Vendor Information */}
              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E8E5DD] space-y-3">
                <div className="text-xs font-bold text-[#0E1C2F] uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>1. Supplier / Vendor Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      Supplier / Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sri Balaji Steel & Wire Mills"
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. K. Venkatesh"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      Supplier Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 94402 77889"
                      value={formData.supplierPhone}
                      onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      Supplier GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 37AAGCS5512L1ZF"
                      value={formData.supplierGstin}
                      onChange={(e) => setFormData({ ...formData, supplierGstin: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs font-mono bg-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Anantapur / Bellary"
                      value={formData.supplierCity}
                      onChange={(e) => setFormData({ ...formData, supplierCity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Bill / Voucher Information */}
              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E8E5DD] space-y-3">
                <div className="text-xs font-bold text-[#0E1C2F] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>2. Bills &amp; Logistics Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                      Supplier Bill / Invoice # <span className="text-[#667085] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TI-2026/894"
                      value={formData.supplierInvoiceNumber}
                      onChange={(e) => setFormData({ ...formData, supplierInvoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Purchased Raw Materials (Dynamic Multi-Row) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#0E1C2F] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>3. Purchased Material Items</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#D0D5DD] hover:bg-[#F2EFE8] text-[11px] font-bold text-[#0E1C2F] transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#B45309]" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, idx) => {
                    const q = Number(item.qty) || 0;
                    const r = Number(item.rate) || 0;
                    const tr = Number(item.taxRate) || 0;
                    const lineTotal = (q * r) * (1 + tr / 100);

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-[#D0D5DD] shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs"
                      >
                        {/* Material Description */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-[#475467] mb-1">
                            Item {idx + 1} Name / Description <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 500 kg GI Wire 8 Gauge"
                            value={item.materialName}
                            onChange={(e) => handleItemChange(idx, "materialName", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs"
                          />
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-[#475467] mb-1">
                            Category
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                          >
                            <option value="Steel Wire">Steel Wire</option>
                            <option value="Barbed Wire">Barbed Wire</option>
                            <option value="Angle Iron & Pipes">Angle Iron &amp; Pipes</option>
                            <option value="Cement & Aggregates">Cement &amp; Aggregates</option>
                            <option value="Poles & Core Reinforcement">Poles &amp; Rebar</option>
                            <option value="Zinc & Passivation">Zinc &amp; Chemicals</option>
                            <option value="Hardware & Fasteners">Hardware &amp; Fasteners</option>
                            <option value="Other">Other Material</option>
                          </select>
                        </div>

                        {/* Qty & Unit */}
                        <div className="sm:col-span-2 grid grid-cols-2 gap-1">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#475467] mb-1">
                              Qty
                            </label>
                            <input
                              type="number"
                              required
                              step="any"
                              min="0"
                              placeholder="500"
                              value={item.qty}
                              onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-[#475467] mb-1">
                              Unit
                            </label>
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-full px-1 py-1.5 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                            >
                              <option value="kg">kg</option>
                              <option value="Tons">Tons</option>
                              <option value="Bags">Bags</option>
                              <option value="Nos">Nos</option>
                              <option value="Mtrs">Mtrs</option>
                              <option value="Coils">Coils</option>
                            </select>
                          </div>
                        </div>

                        {/* Rate */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-[#475467] mb-1">
                            Rate / Unit (₹)
                          </label>
                          <input
                            type="number"
                            required
                            step="any"
                            min="0"
                            placeholder="76"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs font-mono"
                          />
                        </div>

                        {/* GST % and Line Total */}
                        <div className="sm:col-span-2 flex items-center justify-between gap-1">
                          <div className="w-16">
                            <label className="block text-[10px] font-semibold text-[#475467] mb-1">
                              GST %
                            </label>
                            <select
                              value={item.taxRate}
                              onChange={(e) => handleItemChange(idx, "taxRate", e.target.value)}
                              className="w-full px-1 py-1.5 rounded-lg border border-[#D0D5DD] text-xs bg-white"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>

                          <div className="text-right flex-1 pr-1">
                            <div className="text-[10px] text-slate-500 font-mono">Total</div>
                            <div className="font-mono font-bold text-[#0E1C2F]">
                              {formatINR(lineTotal)}
                            </div>
                          </div>

                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Payment Outflow & Calculations */}
              <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E8E5DD] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#0E1C2F] uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    <span>4. Outgoing Payment Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs font-mono font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                        Payment Mode
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-2 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-[#B45309] text-xs bg-white"
                      >
                        <option value="Bank Transfer (NEFT)">Bank NEFT</option>
                        <option value="Bank Transfer (RTGS)">Bank RTGS</option>
                        <option value="UPI">UPI / QR</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit / Pending">Credit / Unpaid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right: Live Calculation Summary Box */}
                <div className="bg-white p-4 rounded-xl border border-[#D0D5DD] shadow-2xs flex flex-col justify-between space-y-2 text-xs">
                  <div className="text-xs font-bold text-[#0E1C2F] uppercase tracking-wider pb-2 border-b border-[#E8E5DD]">
                    Expense Calculation Summary
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between text-[#475467]">
                      <span>Taxable Value:</span>
                      <span className="font-bold text-[#0E1C2F]">{formatINR(formCalculations.taxable)}</span>
                    </div>

                    <div className="flex justify-between text-[#475467]">
                      <span>GST Taxes:</span>
                      <span className="font-bold text-[#0E1C2F]">{formatINR(formCalculations.tax)}</span>
                    </div>

                    <div className="pt-2 border-t border-[#E8E5DD] flex justify-between text-sm font-black text-[#0E1C2F]">
                      <span>Grand Total Expense:</span>
                      <span className="text-[#B45309]">{formatINR(formCalculations.grandTotal)}</span>
                    </div>

                    <div className="flex justify-between text-emerald-700 font-bold pt-1">
                      <span>Amount Paid Out:</span>
                      <span>{formatINR(formCalculations.paid)}</span>
                    </div>

                    <div className="flex justify-between text-red-700 font-bold">
                      <span>Pending Balance:</span>
                      <span>{formatINR(formCalculations.balance)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E5DD] text-[10px] text-slate-500">
                    Recorded under Umesh Fencing Works commercial procurement records.
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E5DD]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D0D5DD] text-xs font-semibold text-[#344054] hover:bg-[#F2EFE8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B45309] hover:bg-[#92400E] active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Record Purchase Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Record Supplier Payment */}
      {paymentModalPurchase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
            <div className="bg-[#0E1C2F] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1C314D]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Record Supplier Payment</h3>
              </div>
              <button
                onClick={() => setPaymentModalPurchase(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-[#FAF9F5] p-3 rounded-lg border border-[#E8E5DD] space-y-1">
                <div className="text-[10px] text-[#667085] uppercase font-mono">Supplier &amp; Voucher</div>
                <div className="font-bold text-[#0E1C2F]">{paymentModalPurchase.supplier?.name}</div>
                <div className="font-mono text-[11px] text-slate-500">
                  Voucher: {paymentModalPurchase.purchaseNumber}
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E8E5DD] font-mono">
                  <span className="text-[#667085]">Outstanding Balance:</span>
                  <span className="font-bold text-red-700">{formatINR(paymentModalPurchase.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="1"
                  max={paymentModalPurchase.balanceDue}
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentFormData.paymentMethod}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-[#D0D5DD] text-xs bg-white"
                  >
                    <option value="Bank Transfer (NEFT)">Bank NEFT</option>
                    <option value="Bank Transfer (RTGS)">Bank RTGS</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Reference / UTR / Cheque No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. UBIN9821092812"
                  value={paymentFormData.referenceNumber}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#344054] mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared via Georgepet bank account"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D0D5DD] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E5DD]">
                <button
                  type="button"
                  onClick={() => setPaymentModalPurchase(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D0D5DD] text-xs font-semibold text-[#344054]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Outgoing Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Purchase Voucher Preview */}
      {selectedPurchaseForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
            <div className="bg-[#0E1C2F] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1C314D]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B45309]" />
                <span className="font-bold text-sm">Purchase Voucher &amp; Material Receipt</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold">
                  {selectedPurchaseForView.purchaseNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-[#B45309] text-white text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedPurchaseForView(null)}
                  className="p-1 rounded text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              {/* Voucher Top Details */}
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#E8E5DD]">
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#667085] font-bold">Supplier Details</div>
                  <div className="font-bold text-sm text-[#0E1C2F] mt-0.5">{selectedPurchaseForView.supplier?.name}</div>
                  <div className="text-slate-600">{selectedPurchaseForView.supplier?.address || selectedPurchaseForView.supplier?.city}</div>
                  {selectedPurchaseForView.supplier?.phone && <div className="text-slate-500">Phone: {selectedPurchaseForView.supplier?.phone}</div>}
                  {selectedPurchaseForView.supplier?.gstin && <div className="font-mono text-emerald-800 font-bold mt-0.5">GSTIN: {selectedPurchaseForView.supplier?.gstin}</div>}
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] uppercase font-mono text-[#667085] font-bold">Voucher Metadata</div>
                  <div className="font-mono font-bold text-[#0E1C2F]">{selectedPurchaseForView.purchaseNumber}</div>
                  <div>Date: <span className="font-semibold">{selectedPurchaseForView.purchaseDate}</span></div>
                  {selectedPurchaseForView.supplierInvoiceNumber && (
                    <div>Supplier Bill: <span className="font-mono font-semibold">{selectedPurchaseForView.supplierInvoiceNumber}</span></div>
                  )}
                  {selectedPurchaseForView.vehicleNumber && (
                    <div>Vehicle: <span className="font-mono font-semibold">{selectedPurchaseForView.vehicleNumber}</span></div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF9F5] border-y border-[#E8E5DD] text-[#475467] font-bold">
                    <tr>
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2">Material / Item</th>
                      <th className="py-2 px-2 text-center">Category</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2 text-right">Rate</th>
                      <th className="py-2 px-2 text-right">GST</th>
                      <th className="py-2 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DD]">
                    {(selectedPurchaseForView.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2 font-semibold text-[#0E1C2F]">{it.materialName}</td>
                        <td className="py-2 px-2 text-center font-mono text-[10px] text-slate-500">{it.category}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">{it.qty} {it.unit}</td>
                        <td className="py-2 px-2 text-right font-mono">{formatINR(it.rate)}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">{it.taxRate}%</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-[#0E1C2F]">{formatINR(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="pt-3 border-t border-[#E8E5DD] flex justify-end">
                <div className="w-64 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount:</span>
                    <span>{formatINR(selectedPurchaseForView.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST Taxes:</span>
                    <span>{formatINR(selectedPurchaseForView.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#0E1C2F] pt-1 border-t border-[#E8E5DD]">
                    <span>Grand Total Expense:</span>
                    <span>{formatINR(selectedPurchaseForView.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Amount Paid:</span>
                    <span>{formatINR(selectedPurchaseForView.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-red-700 font-bold">
                    <span>Balance Due:</span>
                    <span>{formatINR(selectedPurchaseForView.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Outgoing Payment History */}
              {Array.isArray(selectedPurchaseForView.paymentHistory) && selectedPurchaseForView.paymentHistory.length > 0 && (
                <div className="pt-3 border-t border-[#E8E5DD]">
                  <div className="text-[11px] font-bold text-[#0E1C2F] uppercase mb-2">
                    Outgoing Payment History
                  </div>
                  <div className="space-y-1.5">
                    {selectedPurchaseForView.paymentHistory.map((ph, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#E8E5DD] flex items-center justify-between font-mono text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-emerald-800">{formatINR(ph.amount)}</span>
                          <span className="text-slate-500 mx-2">•</span>
                          <span className="text-slate-700">{ph.paymentMethod}</span>
                          {ph.referenceNumber && (
                            <span className="text-slate-500 text-[10px] ml-2">Ref: {ph.referenceNumber}</span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[10px]">{ph.paymentDate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
