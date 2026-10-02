"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUI } from "@/context/UIContext";
import {
  calculateDocumentTotals,
  formatINR,
  extractStateCode,
  AP_STATE_CODE,
  INDIAN_STATES,
} from "@/lib/calculations";
import { saveDocument, getNextDocumentNumber } from "@/lib/db";
import {
  X,
  Plus,
  Trash2,
  FileText,
  UserPlus,
  CreditCard,
  Building,
  CheckCircle,
  Truck,
} from "lucide-react";

const COMMON_ITEMS = [
  { description: "Heavy Duty GI Chainlink Fencing (3-inch x 8 Gauge)", hsn: "7314", unit: "Mtrs", rate: 160 },
  { description: "Hot-Dip Galvanized Iron Wire (8 Gauge / 4.0mm)", hsn: "7217", unit: "Kg", rate: 110 },
  { description: "High-Tensile Solar Perimeter Barbed Wire (2.5mm)", hsn: "7313", unit: "Mtrs", rate: 140 },
  { description: "Heavy Galvanized Barbed Wire (12x14 Gauge 2-Ply)", hsn: "7313", unit: "Kg", rate: 110 },
  { description: "Prestressed Concrete Fencing Poles (7 ft x 4x4 inch)", hsn: "6810", unit: "Nos", rate: 350 },
  { description: "Galvanized High Tensile Angle Iron Posts (6.5 ft)", hsn: "7308", unit: "Nos", rate: 420 },
  { description: "Security Concertina Razor Wire Coils (450mm)", hsn: "7314", unit: "Nos", rate: 1850 },
  { description: "GI Binding & Tension Straining Wire (16 Gauge)", hsn: "7217", unit: "Kg", rate: 95 },
  { description: "Site Erection, Post Embedding & Alignment Charges", hsn: "9954", unit: "Running Mtrs", rate: 45 },
];

export default function CreateInvoiceModal() {
  const {
    isInvoiceModalOpen,
    closeCreateInvoice,
    customers,
    materials,
    openCustomerModal,
    openPreview,
    showToast,
  } = useUI();

  const [docNumber, setDocNumber] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [placeOfSupply, setPlaceOfSupply] = useState("Andhra Pradesh");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("Payment strictly within due date.");

  // Initial Payment options
  const [recordInitialPayment, setRecordInitialPayment] = useState(false);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState("");
  const [initialPaymentMethod, setInitialPaymentMethod] = useState("Bank Transfer");
  const [initialPaymentRef, setInitialPaymentRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Items List
  const [items, setItems] = useState([
    {
      description: "Heavy Duty GI Chainlink Fencing (3-inch x 8 Gauge)",
      hsn: "7314",
      qty: 100,
      unit: "Mtrs",
      rate: 160,
      discount: 0,
      taxRate: 18,
    },
  ]);

  // Load next document sequence on open
  useEffect(() => {
    if (isInvoiceModalOpen) {
      getNextDocumentNumber("invoice").then((num) => setDocNumber(num));
      if (customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(customers[0].id);
      }
    }
  }, [isInvoiceModalOpen, customers]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Automatically sync Place of Supply when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const sName = selectedCustomer.state || "Andhra Pradesh";
      setPlaceOfSupply(sName);
    }
  }, [selectedCustomer]);

  const customerStateCode = useMemo(() => {
    if (placeOfSupply) {
      const match = placeOfSupply.match(/\((\d{2})\)/);
      if (match) return match[1];
      const found = INDIAN_STATES.find((s) => s.name.toLowerCase() === placeOfSupply.trim().toLowerCase());
      if (found) return found.code;
    }
    return selectedCustomer
      ? selectedCustomer.stateCode || extractStateCode(selectedCustomer.gstin)
      : AP_STATE_CODE;
  }, [placeOfSupply, selectedCustomer]);

  // Live Calculations
  const totals = useMemo(() => {
    return calculateDocumentTotals(items, customerStateCode);
  }, [items, customerStateCode]);

  if (!isInvoiceModalOpen) return null;

  const handleAddItem = (preset = null, fromMaterial = null) => {
    if (fromMaterial) {
      let normalizedUnit = "Kg";
      const uLower = (fromMaterial.unit || "").toLowerCase();
      if (uLower === "kg" || uLower === "kgs") normalizedUnit = "Kg";
      else if (uLower === "mtrs" || uLower === "m" || uLower === "meters") normalizedUnit = "Mtrs";
      else if (uLower === "nos" || uLower === "pcs" || uLower === "pieces") normalizedUnit = "Nos";
      else if (uLower === "rolls" || uLower === "roll") normalizedUnit = "Rolls";
      else if (uLower === "bundles" || uLower === "bundle") normalizedUnit = "Bundles";
      else if (uLower === "bags" || uLower === "bag") normalizedUnit = "Bags";
      else if (uLower === "ton") normalizedUnit = "Ton";

      setItems((prev) => [
        ...prev,
        {
          materialId: fromMaterial.id,
          description: fromMaterial.name,
          hsn: "7314",
          qty: 1,
          unit: normalizedUnit,
          rate: Number(fromMaterial.unitCost) || 0,
          discount: 0,
          taxRate: 18,
        },
      ]);
      return;
    }

    if (preset) {
      setItems((prev) => [
        ...prev,
        {
          description: preset.description,
          hsn: preset.hsn,
          qty: 1,
          unit: preset.unit,
          rate: preset.rate,
          discount: 0,
          taxRate: 18,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          materialId: "",
          description: "",
          hsn: "7314",
          qty: 1,
          unit: "Kg",
          rate: 0,
          discount: 0,
          taxRate: 18,
        },
      ]);
    }
  };

  const handleSelectMaterialForRow = (index, materialId) => {
    if (!materialId) {
      handleUpdateItem(index, "materialId", "");
      return;
    }
    const mat = (materials || []).find((m) => m.id === materialId);
    if (!mat) return;

    let normalizedUnit = "Kg";
    const uLower = (mat.unit || "").toLowerCase();
    if (uLower === "kg" || uLower === "kgs") normalizedUnit = "Kg";
    else if (uLower === "mtrs" || uLower === "m" || uLower === "meters") normalizedUnit = "Mtrs";
    else if (uLower === "nos" || uLower === "pcs" || uLower === "pieces") normalizedUnit = "Nos";
    else if (uLower === "rolls" || uLower === "roll") normalizedUnit = "Rolls";
    else if (uLower === "bundles" || uLower === "bundle") normalizedUnit = "Bundles";
    else if (uLower === "bags" || uLower === "bag") normalizedUnit = "Bags";
    else if (uLower === "ton") normalizedUnit = "Ton";

    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index] || {};
      copy[index] = {
        ...cur,
        materialId: mat.id,
        description: mat.name,
        unit: normalizedUnit,
        rate: cur.rate > 0 ? cur.rate : (Number(mat.unitCost) || 0),
      };
      return copy;
    });
  };

  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedCustomer) {
      showToast("Please select a customer for this GST Invoice.", "error");
      return;
    }

    if (items.some((it) => !it.description || Number(it.qty) <= 0 || Number(it.rate) <= 0)) {
      showToast("Please ensure all line items have a valid description, quantity, and rate.", "error");
      return;
    }

    setIsSubmitting(true);

    const initPay = recordInitialPayment ? Number(initialPaymentAmount) || 0 : 0;
    const balanceDue = Math.max(0, totals.grandTotal - initPay);
    let paymentStatus = "unpaid";
    if (initPay >= totals.grandTotal) {
      paymentStatus = "paid";
    } else if (initPay > 0) {
      paymentStatus = "partially_paid";
    }

    const payload = {
      documentType: "invoice",
      documentNumber: docNumber,
      customerId: selectedCustomer.id,
      customerSnapshot: { ...selectedCustomer },
      items: totals.items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountInWords: totals.amountInWords,
      totalPaid: initPay,
      balanceDue,
      paymentStatus,
      status: "active",
      issueDate,
      dueDate,
      paymentMethod,
      placeOfSupply,
      vehicleNumber,
      ewayBillNumber,
      notes,
      initialPaymentAmount: initPay,
      paymentReference: initialPaymentRef,
    };

    try {
      const savedDoc = await saveDocument(payload);
      showToast(`Tax Invoice ${savedDoc.documentNumber} generated successfully!`, "success");
      closeCreateInvoice();
      openPreview(savedDoc);
    } catch (err) {
      console.error(err);
      showToast("Failed to save invoice. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-2 sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header */}
        <div className="bg-[#0E1C2F] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#1C314D]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1C314D] border border-[#B45309] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#FDE68A]" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">Create GST Commercial Tax Invoice</h2>
              <div className="text-[11px] text-[#98A2B3]">
                Sequence: <span className="font-mono text-[#FDE68A] font-semibold">{docNumber || "Auto-assigning..."}</span> • AP Intra/Inter-state engine
              </div>
            </div>
          </div>
          <button
            onClick={closeCreateInvoice}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveInvoice} className="overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 bg-[#FBF9F5]">
          {/* Section 1: Customer Selection & Quick Add */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono flex items-center gap-2">
                <Building className="w-4 h-4 text-[#B45309]" />
                <span>1. Select B2B Client / Commercial Customer</span>
              </label>
              <button
                type="button"
                onClick={() => openCustomerModal()}
                className="flex items-center gap-1.5 text-xs text-[#B45309] hover:text-[#92400E] font-semibold hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-sm text-[#182230] font-medium focus:outline-hidden focus:border-[#0E1C2F]"
                >
                  <option value="">-- Choose Commercial Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} (${c.name})` : c.name} — GSTIN: {c.gstin || "Unregistered"} (State: {c.stateCode || "37"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Filter customer name..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs text-[#182230]"
                />
              </div>
            </div>

            {selectedCustomer && (
              <div className="bg-[#F7F5F0] p-3 rounded border border-[#E8E5DD] text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase font-mono">Billed Party:</span>
                  <span className="font-bold text-[#0E1C2F]">{selectedCustomer.company || selectedCustomer.name}</span>
                  <div className="text-[11px] text-[#475467]">{selectedCustomer.billingAddress}</div>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase font-mono">GST Details:</span>
                  <span className="font-mono font-bold text-[#0E1C2F]">
                    {selectedCustomer.gstin || "Unregistered"}
                  </span>
                  <div className="text-[11px]">
                    State: {selectedCustomer.state} (Code: {customerStateCode})
                  </div>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px] uppercase font-mono">Tax Treatment:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] inline-block ${
                      totals.isIntraState
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : "bg-[#FEF3C7] text-[#854D0E]"
                    }`}
                  >
                    {totals.isIntraState
                      ? "Intra-State: CGST (9%) + SGST (9%)"
                      : "Inter-State: IGST (18%)"}
                  </span>
                  <div className="text-[11px] text-[#667085] mt-0.5">Phone: {selectedCustomer.phone || "N/A"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Document Metadata */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs">
            <div className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B45309]" />
              <span>2. Invoice Dates &amp; Transport Logistics</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0]"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Place of Supply</label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] text-xs font-semibold text-[#0E1C2F]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Vehicle No.</label>
                <input
                  type="text"
                  placeholder="AP 02 TC 8812"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">E-Way Bill No.</label>
                <input
                  type="text"
                  placeholder="341890217645"
                  value={ewayBillNumber}
                  onChange={(e) => setEwayBillNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0]"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit (15 Days)">Credit (15 Days)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Line Items */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono">
                3. Line Items &amp; GST Goods
              </label>
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-[#667085] text-[10px] font-mono">Quick Add:</span>
                {COMMON_ITEMS.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddItem(item)}
                    className="px-2 py-0.5 bg-[#F7F5F0] hover:bg-[#EFECE4] text-[#1C314D] border border-[#DCD7CD] rounded text-[10px] whitespace-nowrap"
                  >
                    + {item.description.split(" ")[0]} {item.description.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[10px]">
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 w-18 text-center">HSN</th>
                    <th className="p-2 w-16 text-right">Qty</th>
                    <th className="p-2 w-16 text-center">Unit</th>
                    <th className="p-2 w-20 text-right">Rate (₹)</th>
                    <th className="p-2 w-18 text-right">Disc (₹)</th>
                    <th className="p-2 w-16 text-center">GST%</th>
                    <th className="p-2 w-24 text-right">Total (₹)</th>
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DD]">
                  {items.map((it, idx) => {
                    const rowTaxable = Math.max(0, it.qty * it.rate - it.discount);
                    const rowTax = (rowTaxable * it.taxRate) / 100;
                    const rowTotal = rowTaxable + rowTax;
                    return (
                      <tr key={idx} className="hover:bg-[#FBF9F5]">
                        <td className="p-2 text-center font-mono font-bold">{idx + 1}</td>
                        <td className="p-2 space-y-1">
                          <input
                            type="text"
                            list={`inv-mat-list-${idx}`}
                            placeholder="Type description or select from dropdown below..."
                            value={it.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateItem(idx, "description", val);
                              const matched = (materials || []).find((m) => m.name.toLowerCase() === val.trim().toLowerCase());
                              if (matched) {
                                handleSelectMaterialForRow(idx, matched.id);
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-[#DCD7CD] rounded text-xs bg-white font-medium focus:outline-hidden focus:border-[#0E1C2F]"
                            required
                          />
                          <datalist id={`inv-mat-list-${idx}`}>
                            {(materials || []).map((m) => (
                              <option key={m.id} value={m.name}>
                                In-Stock: {m.inStock} {m.unit} • ₹{m.unitCost || 0}
                              </option>
                            ))}
                          </datalist>

                          {materials && materials.length > 0 && (
                            <select
                              value={it.materialId || ""}
                              onChange={(e) => handleSelectMaterialForRow(idx, e.target.value)}
                              className="w-full px-1.5 py-0.5 border border-[#E8E5DD] rounded text-[11px] bg-[#FAF9F5] text-[#344054] hover:border-[#0E1C2F] cursor-pointer"
                            >
                              <option value="">▼ Or select from Scrap &amp; Materials ({materials.length})...</option>
                              {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} — In-Stock: {m.inStock} {m.unit} {m.unitCost ? `(₹${m.unitCost})` : ""}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={it.hsn}
                            onChange={(e) => handleUpdateItem(idx, "hsn", e.target.value)}
                            className="w-full px-1.5 py-1 border border-[#DCD7CD] rounded text-center text-xs font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={it.qty}
                            onChange={(e) => handleUpdateItem(idx, "qty", parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 border border-[#DCD7CD] rounded text-right text-xs font-mono font-bold"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={it.unit}
                            onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                            className="w-full px-1 py-1 border border-[#DCD7CD] rounded text-xs text-center"
                          >
                            <option value="Kg">Kg</option>
                            <option value="Mtrs">Mtrs</option>
                            <option value="Nos">Nos</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Bundles">Bundles</option>
                            <option value="Bags">Bags</option>
                            <option value="Ton">Ton</option>
                            <option value="L.S.">L.S.</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.rate}
                            onChange={(e) => handleUpdateItem(idx, "rate", parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 border border-[#DCD7CD] rounded text-right text-xs font-mono"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.discount}
                            onChange={(e) => handleUpdateItem(idx, "discount", parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 border border-[#DCD7CD] rounded text-right text-xs font-mono text-red-700"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={it.taxRate}
                            onChange={(e) => handleUpdateItem(idx, "taxRate", parseFloat(e.target.value) || 18)}
                            className="w-full px-1 py-1 border border-[#DCD7CD] rounded text-xs text-center font-bold text-[#B45309]"
                          >
                            <option value="18">18%</option>
                            <option value="12">12%</option>
                            <option value="5">5%</option>
                            <option value="0">0%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-[#0E1C2F]">
                          {formatINR(rowTotal, false)}
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5F0] hover:bg-[#EFECE4] text-[#182230] border border-[#DCD7CD] rounded text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Line Item</span>
              </button>

              {materials && materials.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#667085] font-mono">Stock Picker:</span>
                  <select
                    value=""
                    onChange={(e) => {
                      const matId = e.target.value;
                      if (!matId) return;
                      const chosen = materials.find((m) => m.id === matId);
                      if (chosen) handleAddItem(null, chosen);
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#B45309] border border-amber-300 rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    <option value="">+ Add Direct from Stock Materials...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        + {m.name} (Stock: {m.inStock} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Totals & Immediate Payment Settlement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Optional Advance / Settlement */}
            <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B45309]" />
                  <span>Immediate Payment Settlement</span>
                </label>
                <input
                  type="checkbox"
                  id="recordInitial"
                  checked={recordInitialPayment}
                  onChange={(e) => {
                    setRecordInitialPayment(e.target.checked);
                    if (e.target.checked && !initialPaymentAmount) {
                      setInitialPaymentAmount(totals.grandTotal);
                    }
                  }}
                  className="w-4 h-4 rounded text-[#0E1C2F]"
                />
              </div>

              {recordInitialPayment ? (
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-[#166534] uppercase block mb-1">
                      Received Amount (₹)
                    </label>
                    <input
                      type="number"
                      max={totals.grandTotal}
                      value={initialPaymentAmount}
                      onChange={(e) => setInitialPaymentAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#BBF7D0] rounded bg-white font-mono font-bold text-sm text-[#166534]"
                      placeholder={`Max: ${totals.grandTotal}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#166534] uppercase block mb-1">Method</label>
                      <select
                        value={initialPaymentMethod}
                        onChange={(e) => setInitialPaymentMethod(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#BBF7D0] rounded bg-white"
                      >
                        <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                        <option value="UPI">UPI / QR Code</option>
                        <option value="Cash">Cash Counter</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#166534] uppercase block mb-1">UTR / Ref No.</label>
                      <input
                        type="text"
                        placeholder="e.g. UBIN2026..."
                        value={initialPaymentRef}
                        onChange={(e) => setInitialPaymentRef(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#BBF7D0] rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#667085] italic p-3 bg-[#F7F5F0] rounded">
                  No payment recorded at creation. Document status will be set to &quot;Unpaid&quot;.
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Notes / Instructions</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded text-xs bg-[#F7F5F0]"
                ></textarea>
              </div>
            </div>

            {/* Right: Totals Box */}
            <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#667085]">
                <span>Items Subtotal:</span>
                <span>{formatINR(totals.subtotal)}</span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-red-700">
                  <span>Total Discount:</span>
                  <span>-{formatINR(totals.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#182230] pt-1 border-t border-[#E8E5DD]">
                <span>Taxable Amount:</span>
                <span>{formatINR(totals.taxableAmount)}</span>
              </div>

              {totals.isIntraState ? (
                <>
                  <div className="flex justify-between text-[#475467] text-[11px]">
                    <span>CGST (9%):</span>
                    <span>{formatINR(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-[#475467] text-[11px]">
                    <span>SGST (9%):</span>
                    <span>{formatINR(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-[#475467] text-[11px]">
                  <span>IGST (18%):</span>
                  <span>{formatINR(totals.igst)}</span>
                </div>
              )}

              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-[#667085] text-[10px]">
                  <span>Round Off:</span>
                  <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t-2 border-[#0E1C2F] text-sm font-black text-[#0E1C2F]">
                <span>Grand Total:</span>
                <span className="text-base font-sans font-extrabold">{formatINR(totals.grandTotal)}</span>
              </div>

              <div className="text-[10px] text-[#667085] font-sans italic border-t border-[#E8E5DD] pt-1">
                {totals.amountInWords}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#E8E5DD]">
            <button
              type="button"
              onClick={closeCreateInvoice}
              className="w-full sm:w-auto px-4 py-2.5 rounded-md border border-[#DCD7CD] bg-white text-[#344054] text-xs font-semibold hover:bg-[#F2EFE8] text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className={`w-4 h-4 text-[#FDE68A] ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Generating Tax Invoice..." : "Generate Tax Invoice & Preview"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
