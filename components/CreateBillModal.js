"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUI } from "@/context/UIContext";
import {
  calculateDocumentTotals,
  formatINR,
  AP_STATE_CODE,
  INDIAN_STATES,
} from "@/lib/calculations";
import { saveDocument, getNextDocumentNumber } from "@/lib/db";
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Zap,
  CheckCircle,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";

const QUICK_COUNTER_ITEMS = [
  { description: "Hot-Dip Galvanized Iron Wire (8 Gauge / 4.0mm)", hsn: "7217", unit: "Kg", rate: 110 },
  { description: "Barbed Wire 12x14g Heavy Roll (40kg bundle)", hsn: "7313", unit: "Bundles", rate: 3800 },
  { description: "GI Chainlink Mesh 4ft Roll (50 Meters)", hsn: "7314", unit: "Rolls", rate: 7000 },
  { description: "Concrete Boundary Posts (6 ft)", hsn: "6810", unit: "Nos", rate: 320 },
  { description: "Concrete Corner Strut Support Post (7 ft)", hsn: "6810", unit: "Nos", rate: 450 },
  { description: "GI Binding Wire Coil (10 Kg)", hsn: "7217", unit: "Kg", rate: 95 },
  { description: "Galvanized Tension Wire Straining Wire", hsn: "7217", unit: "Kg", rate: 105 },
];

export default function CreateBillModal() {
  const { isBillModalOpen, closeCreateBill, openPreview, showToast, materials } = useUI();

  const [docNumber, setDocNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("Local Counter Sale, Anantapur");
  const [placeOfSupply, setPlaceOfSupply] = useState("Andhra Pradesh");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    {
      description: "Barbed Wire 12x14g Heavy Roll (40kg bundle)",
      hsn: "7313",
      qty: 2,
      unit: "Bundles",
      rate: 3800,
      discount: 0,
      taxRate: 18,
    },
  ]);

  useEffect(() => {
    if (isBillModalOpen) {
      getNextDocumentNumber("bill").then((num) => setDocNumber(num));
    }
  }, [isBillModalOpen]);

  const billStateCode = useMemo(() => {
    const match = (placeOfSupply || "").match(/\((\d{2})\)/);
    if (match) return match[1];
    const found = INDIAN_STATES.find((st) => st.name.toLowerCase() === (placeOfSupply || "").trim().toLowerCase());
    return found ? found.code : AP_STATE_CODE;
  }, [placeOfSupply]);

  const totals = useMemo(() => {
    return calculateDocumentTotals(items, billStateCode);
  }, [items, billStateCode]);

  if (!isBillModalOpen) return null;

  const handleAddItem = (preset = null, fromMaterial = null) => {
    if (fromMaterial) {
      let normalizedUnit = fromMaterial.unit || "Kg";
      const uLower = (fromMaterial.unit || "").toLowerCase();
      if (uLower === "kg" || uLower === "kgs") normalizedUnit = "Kg";
      else if (uLower === "mtrs" || uLower === "m" || uLower === "meters") normalizedUnit = "Mtrs";
      else if (uLower === "nos" || uLower === "pcs" || uLower === "pieces") normalizedUnit = "Nos";
      else if (uLower === "rolls" || uLower === "roll") normalizedUnit = "Rolls";
      else if (uLower === "bundles" || uLower === "bundle") normalizedUnit = "Bundles";
      else if (uLower === "bags" || uLower === "bag") normalizedUnit = "Bags";
      else if (uLower === "ton" || uLower === "tons") normalizedUnit = "Ton";

      let inferredHsn = fromMaterial.hsn || "7314";
      const nameLower = (fromMaterial.name || "").toLowerCase();
      if (nameLower.includes("barbed wire")) inferredHsn = "7313";
      else if (nameLower.includes("chainlink")) inferredHsn = "7314";
      else if (nameLower.includes("pole") || nameLower.includes("concrete") || nameLower.includes("post")) inferredHsn = "6810";
      else if (nameLower.includes("binding") || nameLower.includes("straining") || nameLower.includes("gi wire")) inferredHsn = "7217";
      else if (nameLower.includes("angle") || nameLower.includes("pipe")) inferredHsn = "7308";

      setItems((prev) => [
        ...prev,
        {
          materialId: fromMaterial.id,
          description: fromMaterial.name,
          hsn: inferredHsn,
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
          hsn: "7313",
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

    let normalizedUnit = mat.unit || "Kg";
    const uLower = (mat.unit || "").toLowerCase();
    if (uLower === "kg" || uLower === "kgs") normalizedUnit = "Kg";
    else if (uLower === "mtrs" || uLower === "m" || uLower === "meters") normalizedUnit = "Mtrs";
    else if (uLower === "nos" || uLower === "pcs" || uLower === "pieces") normalizedUnit = "Nos";
    else if (uLower === "rolls" || uLower === "roll") normalizedUnit = "Rolls";
    else if (uLower === "bundles" || uLower === "bundle") normalizedUnit = "Bundles";
    else if (uLower === "bags" || uLower === "bag") normalizedUnit = "Bags";
    else if (uLower === "ton" || uLower === "tons") normalizedUnit = "Ton";

    let inferredHsn = mat.hsn || "7314";
    const nameLower = (mat.name || "").toLowerCase();
    if (nameLower.includes("barbed wire")) inferredHsn = "7313";
    else if (nameLower.includes("chainlink")) inferredHsn = "7314";
    else if (nameLower.includes("pole") || nameLower.includes("concrete") || nameLower.includes("post")) inferredHsn = "6810";
    else if (nameLower.includes("binding") || nameLower.includes("straining") || nameLower.includes("gi wire")) inferredHsn = "7217";
    else if (nameLower.includes("angle") || nameLower.includes("pipe")) inferredHsn = "7308";

    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index] || {};
      copy[index] = {
        ...cur,
        materialId: mat.id,
        description: mat.name,
        hsn: inferredHsn,
        unit: normalizedUnit,
        rate: Number(mat.unitCost) > 0 ? Number(mat.unitCost) : cur.rate,
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

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (items.some((it) => !it.description || Number(it.qty) <= 0 || Number(it.rate) <= 0)) {
      showToast("Please ensure all bill items have a description, quantity, and rate.", "error");
      return;
    }

    setIsSubmitting(true);

    const counterCustomer = {
      id: "WALK-IN",
      name: customerName.trim() || "Walk-In Counter Customer",
      company: customerName.trim() || "Retail Farm Purchase",
      phone: customerPhone.trim(),
      email: "",
      gstin: "",
      billingAddress: customerAddress,
      shippingAddress: customerAddress,
      state: placeOfSupply.split(" (")[0] || "Andhra Pradesh",
      stateCode: billStateCode,
    };

    const payload = {
      documentType: "bill",
      documentNumber: docNumber,
      customerId: "WALK-IN",
      customerSnapshot: counterCustomer,
      items: totals.items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      taxableAmount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: 0,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountInWords: totals.amountInWords,
      totalPaid: totals.grandTotal, // Counter bills are collected immediately
      balanceDue: 0,
      paymentStatus: "paid",
      status: "active",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      paymentMethod: paymentMode,
      placeOfSupply,
      vehicleNumber: (vehicleNumber || "").trim(),
      ewayBillNumber: (ewayBillNumber || "").trim(),
      evaBillNumber: (ewayBillNumber || "").trim(),
      notes: "Point of Sale counter settlement. Cash/UPI verified.",
      initialPaymentAmount: totals.grandTotal,
      paymentReference: paymentReference || `${paymentMode} Counter Settlement`,
    };

    try {
      const savedDoc = await saveDocument(payload);
      showToast(`Counter Bill ${savedDoc.documentNumber} generated & settled!`, "success");
      closeCreateBill();
      openPreview(savedDoc);
    } catch (err) {
      console.error(err);
      showToast("Failed to save bill. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-2 sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header */}
        <div className="bg-[#B45309] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#92400E] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#FEF3C7]" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">Rapid Retail &amp; Counter Bill (Point-of-Sale)</h2>
              <div className="text-[11px] text-amber-100">
                Sequence: <span className="font-mono text-white font-bold">{docNumber || "Assigning..."}</span> • Instant Settlement
              </div>
            </div>
          </div>
          <button
            onClick={closeCreateBill}
            className="p-1.5 rounded text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveBill} className="overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-5 bg-[#FBF9F5]">
          {/* Customer / Walk-In Strip */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs">
            <div className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono mb-2">
              Buyer / Counter Customer Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Customer Name / Farm</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Naidu (Farmer)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0]"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 97011 44552"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">State / Place of Supply</label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-sans font-medium text-[#182230] focus:ring-1 focus:ring-[#8E2800] focus:border-[#8E2800]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">Vehicle No.</label>
                <input
                  type="text"
                  placeholder="e.g. AP 02 TC 8812"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">EVA / E-Way Bill No.</label>
                <input
                  type="text"
                  placeholder="e.g. 341890217645 (EVA)"
                  value={ewayBillNumber}
                  onChange={(e) => setEwayBillNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded bg-[#F7F5F0] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Item Picker Chips */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#667085] uppercase font-mono">Counter Favorites:</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_COUNTER_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className="px-2.5 py-1 bg-white hover:bg-[#F2EFE8] text-[#1C314D] border border-[#DCD7CD] rounded-full text-[11px] font-medium transition-colors shadow-2xs"
                >
                  + {item.description.split("(")[0]} ({formatINR(item.rate)})
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#1C314D] text-white font-mono uppercase text-[10px]">
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 w-16 text-right">Qty</th>
                    <th className="p-2 w-16 text-center">Unit</th>
                    <th className="p-2 w-20 text-right">Rate (₹)</th>
                    <th className="p-2 w-16 text-right">Disc</th>
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
                            list={`bill-mat-list-${idx}`}
                            placeholder="Type description or pick from dropdown below..."
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
                          <datalist id={`bill-mat-list-${idx}`}>
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
                              <option value="">▼ Select from Stock Inventory ({materials.length} items)...</option>
                              {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} [{m.category || "Stock"}] — In-Stock: {m.inStock} {m.unit} {m.unitCost ? `(₹${m.unitCost})` : ""}
                                </option>
                              ))}
                            </select>
                          )}
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
                            <option value="Bundles">Bundles</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Nos">Nos</option>
                            <option value="Mtrs">Mtrs</option>
                            <option value="Bags">Bags</option>
                            <option value="Ton">Ton</option>
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
                    <option value="">+ Add Direct from Stock Inventory ({materials.length} items)...</option>
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

          {/* Payment Method Selector & Grand Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Immediate POS Payment Option */}
            <div className="bg-white p-4 rounded-lg border border-[#E8E5DD] shadow-xs space-y-3">
              <label className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono block">
                Counter Payment Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("Cash")}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMode === "Cash"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-800 font-bold"
                      : "border-[#DCD7CD] hover:bg-[#FBF9F5] text-[#344054]"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">Cash Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode("UPI")}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMode === "UPI"
                      ? "bg-blue-50 border-blue-600 text-blue-800 font-bold"
                      : "border-[#DCD7CD] hover:bg-[#FBF9F5] text-[#344054]"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode("Bank Transfer")}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMode === "Bank Transfer"
                      ? "bg-amber-50 border-amber-600 text-amber-800 font-bold"
                      : "border-[#DCD7CD] hover:bg-[#FBF9F5] text-[#344054]"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span className="text-xs">Bank Transfer</span>
                </button>
              </div>

              {paymentMode === "UPI" && (
                <div>
                  <label className="text-[10px] font-bold text-[#667085] uppercase block mb-1">
                    UPI Transaction UTR / Ref (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI/3289011928"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#DCD7CD] rounded text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Quick Bill Totals Summary */}
            <div className="bg-[#0E1C2F] text-white p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>{formatINR(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>{formatINR(totals.totalTax)}</span>
                </div>
                {totals.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Round Off:</span>
                    <span>{totals.roundOff}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#FDE68A] tracking-wider block">
                    Amount Received:
                  </span>
                  <span className="text-2xl font-black font-sans text-white">{formatINR(totals.grandTotal)}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase">
                  Fully Settled
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#E8E5DD]">
            <button
              type="button"
              onClick={closeCreateBill}
              className="w-full sm:w-auto px-4 py-2.5 rounded-md border border-[#DCD7CD] bg-white text-[#344054] text-xs font-semibold hover:bg-[#F2EFE8] text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#B45309] hover:bg-[#92400E] disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className={`w-4 h-4 text-white ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Generating Counter Bill..." : "Generate Counter Bill & Print"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
