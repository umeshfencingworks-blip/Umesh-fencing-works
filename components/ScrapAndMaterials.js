"use client";

import React, { useState, useMemo } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import { downloadFile } from "@/lib/db";
import {
  Boxes,
  Plus,
  Search,
  FileSpreadsheet,
  Trash2,
  Eye,
  Recycle,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  X,
  Edit2,
  Info,
  ShoppingCart,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function ScrapAndMaterials() {
  const {
    materials,
    scrapEntries,
    inventorySummary,
    saveMaterial,
    addMaterialStock,
    deleteMaterial,
    saveScrapEntry,
    deleteScrapEntry,
    exportMaterialsAndScrapCSV,
    showToast,
    openPreview,
    documents,
  } = useUI();

  // Active view tab: "materials" or "scrap"
  const [activeTab, setActiveTab] = useState("materials");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals state
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [isQuickRestockOpen, setIsQuickRestockOpen] = useState(false);
  const [restockTargetMaterial, setRestockTargetMaterial] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockNotes, setRestockNotes] = useState("");

  const [isRecordScrapOpen, setIsRecordScrapOpen] = useState(false);
  const [scrapTargetMaterialId, setScrapTargetMaterialId] = useState("");
  const [scrapQty, setScrapQty] = useState("");
  const [scrapDate, setScrapDate] = useState(new Date().toISOString().split("T")[0]);
  const [scrapReason, setScrapReason] = useState("Cutting waste / trim end pieces");
  const [scrapNotes, setScrapNotes] = useState("");

  const [inspectedSalesMaterial, setInspectedSalesMaterial] = useState(null);

  // Form state for Add/Edit Material
  const [materialForm, setMaterialForm] = useState({
    name: "",
    code: "",
    category: "Steel & Iron Wire",
    unit: "kg",
    boughtQty: "",
    unitCost: "",
    minStockAlert: "10",
    notes: "",
  });

  const categories = useMemo(() => {
    const set = new Set();
    (materials || []).forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return (materials || []).filter((m) => {
      const matchesSearch =
        (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || m.stockStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || m.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [materials, searchQuery, statusFilter, categoryFilter]);

  // Filtered scrap entries
  const filteredScrap = useMemo(() => {
    return (scrapEntries || []).filter((s) => {
      return (
        (s.materialName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [scrapEntries, searchQuery]);

  // Open Add Material
  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setMaterialForm({
      name: "",
      code: "",
      category: "Steel & Iron Wire",
      unit: "kg",
      boughtQty: "",
      unitCost: "",
      minStockAlert: "10",
      notes: "",
    });
    setIsAddMaterialOpen(true);
  };

  // Open Edit Material
  const handleOpenEdit = (mat) => {
    setEditingMaterial(mat);
    setMaterialForm({
      name: mat.name || "",
      code: mat.code || "",
      category: mat.category || "Steel & Iron Wire",
      unit: mat.unit || "kg",
      boughtQty: mat.boughtQty !== undefined ? String(mat.boughtQty) : "",
      unitCost: mat.unitCost !== undefined ? String(mat.unitCost) : "",
      minStockAlert: mat.minStockAlert !== undefined ? String(mat.minStockAlert) : "10",
      notes: mat.notes || "",
    });
    setIsAddMaterialOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.name.trim()) {
      showToast("Please enter a material name", "error");
      return;
    }

    try {
      await saveMaterial({
        ...(editingMaterial ? { id: editingMaterial.id } : {}),
        name: materialForm.name.trim(),
        code: materialForm.code.trim(),
        category: materialForm.category,
        unit: materialForm.unit,
        boughtQty: Number(materialForm.boughtQty) || 0,
        unitCost: Number(materialForm.unitCost) || 0,
        minStockAlert: Number(materialForm.minStockAlert) || 5,
        notes: materialForm.notes.trim(),
      });
      setIsAddMaterialOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to save material", "error");
    }
  };

  // Open Quick Restock
  const handleOpenRestock = (mat) => {
    setRestockTargetMaterial(mat);
    setRestockQty("");
    setRestockNotes("");
    setIsQuickRestockOpen(true);
  };

  // Submit Restock
  const handleSubmitRestock = async (e) => {
    e.preventDefault();
    if (!restockTargetMaterial) return;
    const qty = Number(restockQty);
    if (!qty || qty <= 0) {
      showToast("Please enter a valid quantity greater than zero", "error");
      return;
    }

    try {
      await addMaterialStock(restockTargetMaterial.id, qty, restockNotes.trim());
      setIsQuickRestockOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to add stock", "error");
    }
  };

  // Open Record Scrap
  const handleOpenRecordScrap = (preselectedMat = null) => {
    if (preselectedMat) {
      setScrapTargetMaterialId(preselectedMat.id);
    } else if (materials && materials.length > 0 && !scrapTargetMaterialId) {
      setScrapTargetMaterialId(materials[0].id);
    }
    setScrapQty("");
    setScrapDate(new Date().toISOString().split("T")[0]);
    setScrapReason("Cutting waste / trim end pieces");
    setScrapNotes("");
    setIsRecordScrapOpen(true);
  };

  // Submit Record Scrap
  const handleSubmitScrap = async (e) => {
    e.preventDefault();
    const qty = Number(scrapQty);
    if (!qty || qty <= 0) {
      showToast("Please enter a valid scrap quantity greater than zero", "error");
      return;
    }
    if (!scrapTargetMaterialId) {
      showToast("Please choose a material", "error");
      return;
    }

    try {
      await saveScrapEntry({
        materialId: scrapTargetMaterialId,
        qty,
        date: scrapDate,
        reason: scrapReason,
        notes: scrapNotes.trim(),
      });
      setIsRecordScrapOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to log scrap", "error");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const csv = exportMaterialsAndScrapCSV();
      const dateStr = new Date().toISOString().split("T")[0];
      downloadFile(csv, `ufw-materials-and-scrap-${dateStr}.csv`, "text/csv;charset=utf-8");
      showToast("Materials & scrap register downloaded as .csv", "success");
    } catch (err) {
      showToast("Failed to export CSV: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E5DD] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0E1C2F] text-[#FDE68A] flex items-center justify-center shadow-xs shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-serif text-[#0E1C2F]">
                Scrap &amp; Materials Bought
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Live Stock Sync
              </span>
            </div>
            <p className="text-xs text-[#5A6A80] mt-0.5">
              Track raw materials bought into stock, live sales deductions from invoices &amp; bills, scrap wastage logs, and net available inventory.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F2EFE8] text-[#0E1C2F] border border-[#DCD7CD] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Download full materials and scrap spreadsheet (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenRecordScrap()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#B45309] border border-amber-300 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Record scrap or production wastage"
          >
            <Recycle className="w-4 h-4 text-[#B45309]" />
            <span>Record Scrap</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FDE68A]" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Bought */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#667085] font-bold">
              Materials Bought
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0E1C2F] font-mono">
              {inventorySummary.totalBoughtQty.toLocaleString()}
            </span>
            <span className="text-xs text-[#667085] font-semibold">units</span>
          </div>
          <div className="text-[11px] text-[#5A6A80] mt-1 pt-1.5 border-t border-[#E8E5DD] flex items-center justify-between">
            <span>{inventorySummary.totalMaterialsCount} catalog items</span>
            <span className="font-mono font-bold text-[#0E1C2F]">Total Purchased</span>
          </div>
        </div>

        {/* Sold Deducted */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
              Sales Deducted
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700 font-mono">
              -{inventorySummary.totalSoldQty.toLocaleString()}
            </span>
            <span className="text-xs text-[#667085] font-semibold">units</span>
          </div>
          <div className="text-[11px] text-[#5A6A80] mt-1 pt-1.5 border-t border-[#E8E5DD] flex items-center justify-between">
            <span>Invoices &amp; Bills sales</span>
            <span className="text-purple-700 font-bold">Auto-Deducted</span>
          </div>
        </div>

        {/* Scrap / Wastage */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#B45309] font-bold">
              Scrap &amp; Wastage
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#B45309] flex items-center justify-center">
              <Recycle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#B45309] font-mono">
              {inventorySummary.totalScrapQty.toLocaleString()}
            </span>
            <span className="text-xs text-[#667085] font-semibold">units</span>
          </div>
          <div className="text-[11px] text-[#5A6A80] mt-1 pt-1.5 border-t border-[#E8E5DD] flex items-center justify-between">
            <span>{inventorySummary.totalScrapEntriesCount} wastage entries</span>
            <span className="text-[#B45309] font-bold">Logged Scrap</span>
          </div>
        </div>

        {/* Live In-Stock */}
        <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
              Available In-Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {inventorySummary.totalInStockQty.toLocaleString()}
            </span>
            <span className="text-xs text-[#667085] font-semibold">units</span>
          </div>
          <div className="text-[11px] text-emerald-900 mt-1 pt-1.5 border-t border-[#E8E5DD] flex items-center justify-between">
            <span>Valuation: {formatINR(inventorySummary.totalInventoryValue)}</span>
            <span className="font-bold text-emerald-700">Net Remaining</span>
          </div>
        </div>
      </div>

      {/* 3. Workflow Banner with User's Exact Formula Example */}
      <div className="bg-[#FAF9F5] border border-[#E8E5DD] rounded-xl p-3.5 sm:p-4 text-xs text-[#0E1C2F] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#0E1C2F] flex items-center gap-2">
              <span>Automatic Stock Calculation Formula</span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E8E5DD] text-[#B45309]">
                In-Stock = Bought − Sold (Invoices/Bills) − Scrap
              </span>
            </div>
            <p className="text-[11px] text-[#5A6A80] leading-relaxed">
              <strong>Example:</strong> Suppose you bought <strong>100 kg</strong> of Iron Wire. When you generate an invoice selling <strong>50 kg</strong>, it is immediately deducted from the 100 kg. If <strong>1 kg</strong> is wasted during processing, log it into Scrap. The remaining <strong>49 kg</strong> remains available in stock!
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
            {inventorySummary.inStockItemsCount} In Stock
          </span>
          {inventorySummary.lowStockItemsCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-[11px]">
              {inventorySummary.lowStockItemsCount} Low Stock
            </span>
          )}
          {inventorySummary.outOfStockItemsCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-900 font-mono font-bold text-[11px]">
              {inventorySummary.outOfStockItemsCount} Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-[#F2EFE8] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "materials"
                  ? "bg-white text-[#0E1C2F] shadow-xs"
                  : "text-[#5A6A80] hover:text-[#0E1C2F]"
              }`}
            >
              <Boxes className="w-4 h-4 text-[#B45309]" />
              <span>Materials &amp; Current Stock</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8E5DD] font-bold">
                {materials.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("scrap")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "scrap"
                  ? "bg-white text-[#0E1C2F] shadow-xs"
                  : "text-[#5A6A80] hover:text-[#0E1C2F]"
              }`}
            >
              <Recycle className="w-4 h-4 text-[#B45309]" />
              <span>Scrap Register (Wastage)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8E5DD] font-bold">
                {scrapEntries.length}
              </span>
            </button>
          </div>

          {/* Quick Filters */}
          {activeTab === "materials" && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-semibold text-[#0E1C2F]"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock Alert</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-semibold text-[#0E1C2F]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              activeTab === "materials"
                ? "Search materials by name, code, category (e.g. Iron Wire, Barbed, 6ft Post)..."
                : "Search scrap records by material, waste reason or notes..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-lg text-xs font-medium text-[#0E1C2F] focus:border-[#0E1C2F] outline-hidden"
          />
        </div>
      </div>

      {/* 5. TAB 1: MATERIALS & CURRENT STOCK TABLE */}
      {activeTab === "materials" && (
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-3.5">Material &amp; Code</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Bought Qty</th>
                  <th className="py-3 px-3 text-right">Sold Qty (Sales)</th>
                  <th className="py-3 px-3 text-right">Scrap (Waste)</th>
                  <th className="py-3 px-3.5 text-right font-bold text-[#FDE68A]">In-Stock Available</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Unit Rate</th>
                  <th className="py-3 px-3 text-right">Valuation</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-12 text-xs text-[#667085]">
                      <Boxes className="w-8 h-8 text-[#98A2B3] mx-auto opacity-40 mb-2" />
                      <p className="font-semibold text-[#0E1C2F]">No materials found</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        Add a new material or clear your search filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => {
                    const valuation = Number(mat.inStock || 0) * Number(mat.unitCost || 0);

                    return (
                      <tr key={mat.id} className="hover:bg-[#FAF9F5] transition-colors">
                        {/* Name & Code */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-[#0E1C2F] font-sans">
                            {mat.name}
                          </div>
                          <div className="text-[10px] text-[#667085] font-mono flex items-center gap-1.5 mt-0.5">
                            {mat.code && (
                              <span className="px-1.5 py-0.2 bg-[#F2EFE8] rounded text-[#0E1C2F] font-bold">
                                {mat.code}
                              </span>
                            )}
                            <span>{mat.notes || "Standard stock"}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#344054] text-[10px] font-semibold">
                            {mat.category || "General"}
                          </span>
                        </td>

                        {/* Bought Qty */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                          {mat.boughtQty} <span className="text-[10px] text-[#667085] font-normal">{mat.unit}</span>
                        </td>

                        {/* Sold Qty */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-mono font-bold text-purple-700">
                              {mat.soldQty > 0 ? `-${mat.soldQty}` : "0"} {mat.unit}
                            </span>
                            {mat.salesDeductions && mat.salesDeductions.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setInspectedSalesMaterial(mat)}
                                className="p-1 rounded hover:bg-purple-100 text-purple-700 transition-colors"
                                title="Inspect which invoices & bills deducted this stock"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Scrap Qty */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-[#B45309]">
                            {mat.scrapQty > 0 ? `-${mat.scrapQty}` : "0"} {mat.unit}
                          </span>
                        </td>

                        {/* In-Stock Available */}
                        <td className="py-3 px-3.5 text-right bg-[#FBF9F5]/70">
                          <span className={`font-mono text-sm font-black ${
                            mat.stockStatus === "out_of_stock"
                              ? "text-red-700"
                              : mat.stockStatus === "low_stock"
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}>
                            {mat.inStock} {mat.unit}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center">
                          {mat.stockStatus === "in_stock" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>In Stock</span>
                            </span>
                          )}
                          {mat.stockStatus === "low_stock" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Low Stock</span>
                            </span>
                          )}
                          {mat.stockStatus === "out_of_stock" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                              <span>Out of Stock</span>
                            </span>
                          )}
                        </td>

                        {/* Unit Rate */}
                        <td className="py-3 px-3 text-right font-mono text-[#5A6A80]">
                          {formatINR(mat.unitCost)}
                        </td>

                        {/* Valuation */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                          {formatINR(valuation)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenRestock(mat)}
                              className="px-2 py-1 rounded bg-[#0E1C2F] hover:bg-[#14243B] text-white text-[10px] font-bold transition-colors cursor-pointer"
                              title="Add more bought quantity into stock"
                            >
                              + Restock
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRecordScrap(mat)}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-[#B45309] border border-amber-200 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Record scrap / wastage for this material"
                            >
                              Scrap
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(mat)}
                              className="p-1 rounded text-[#5A6A80] hover:text-[#0E1C2F] hover:bg-[#F2EFE8] transition-colors"
                              title="Edit material"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete material "${mat.name}"?`)) {
                                  deleteMaterial(mat.id);
                                }
                              }}
                              className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                              title="Delete material"
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
      )}

      {/* 6. TAB 2: SCRAP & WASTAGE REGISTER TABLE */}
      {activeTab === "scrap" && (
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-3.5">Log ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3.5">Material Name</th>
                  <th className="py-3 px-3 text-right">Scrap / Wasted Qty</th>
                  <th className="py-3 px-3">Wastage Reason / Stage</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {filteredScrap.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-xs text-[#667085]">
                      <Recycle className="w-8 h-8 text-[#98A2B3] mx-auto opacity-40 mb-2" />
                      <p className="font-semibold text-[#0E1C2F]">No scrap or wastage logs found</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        Click &quot;Record Scrap&quot; to log factory cut-offs, defects, or damaged spools.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredScrap.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-[#0E1C2F]">
                        {s.id}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#5A6A80]">
                        {s.date}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-[#0E1C2F]">
                        {s.materialName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#B45309]">
                        {s.qty} {s.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
                          {s.reason}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#5A6A80]">
                        {s.notes || "—"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete scrap record ${s.id}? This will restore ${s.qty} ${s.unit} back into material stock.`)) {
                              deleteScrapEntry(s.id);
                            }
                          }}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Delete Log
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT MATERIAL                             */}
      {/* ======================================================== */}
      {isAddMaterialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DCD7CD] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0E1C2F] text-[#FDE68A] flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0E1C2F] font-serif">
                    {editingMaterial ? "Edit Material Stock Details" : "Add Material / Piece Bought"}
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Enter purchased raw material specifications &amp; stock parameters
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMaterialOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:bg-[#F2EFE8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Material / Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hot-Dip Galvanized Iron Wire (8 Gauge / 4.0mm)"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-medium focus:border-[#0E1C2F] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Material Code / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IRON-8G"
                    value={materialForm.code}
                    onChange={(e) => setMaterialForm({ ...materialForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-mono uppercase focus:border-[#0E1C2F] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Category
                  </label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-medium focus:border-[#0E1C2F] outline-hidden"
                  >
                    <option value="Steel & Iron Wire">Steel &amp; Iron Wire</option>
                    <option value="Barbed Wire">Barbed Wire</option>
                    <option value="Concrete Poles">Concrete Poles</option>
                    <option value="Chainlink Mesh">Chainlink Mesh</option>
                    <option value="Cement & Aggregates">Cement &amp; Aggregates</option>
                    <option value="Hardware & Fittings">Hardware &amp; Fittings</option>
                    <option value="General Materials">General Materials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-medium focus:border-[#0E1C2F] outline-hidden"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="Nos">Nos (Pieces)</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Mtrs">Mtrs (Meters)</option>
                    <option value="Bags">Bags</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Bought Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 100"
                    value={materialForm.boughtQty}
                    onChange={(e) => setMaterialForm({ ...materialForm, boughtQty: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-mono font-bold focus:border-[#0E1C2F] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 76"
                    value={materialForm.unitCost}
                    onChange={(e) => setMaterialForm({ ...materialForm, unitCost: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-mono focus:border-[#0E1C2F] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 10"
                  value={materialForm.minStockAlert}
                  onChange={(e) => setMaterialForm({ ...materialForm, minStockAlert: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-mono focus:border-[#0E1C2F] outline-hidden"
                />
                <span className="text-[10px] text-[#667085] mt-0.5 block">
                  Triggers yellow &quot;Low Stock&quot; indicator when in-stock falls below this level.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Notes / Supplier Reference
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Wire coils batch for chainlink weaving plant..."
                  value={materialForm.notes}
                  onChange={(e) => setMaterialForm({ ...materialForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs focus:border-[#0E1C2F] outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E5DD]">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2EFE8] hover:bg-[#E8E5DD] text-[#344054] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingMaterial ? "Update Material" : "Save Material to Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: QUICK RESTOCK (ADD BOUGHT STOCK)                 */}
      {/* ======================================================== */}
      {isQuickRestockOpen && restockTargetMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DCD7CD] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
              <div>
                <h3 className="text-sm font-bold text-[#0E1C2F] font-serif">
                  Restock / Add Stock
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Increment bought quantity for <strong>{restockTargetMaterial.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickRestockOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:bg-[#F2EFE8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRestock} className="space-y-3.5 text-xs">
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E5DD] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#667085] uppercase font-mono font-bold block">Current In-Stock</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {restockTargetMaterial.inStock} {restockTargetMaterial.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#667085] uppercase font-mono font-bold block">Total Bought So Far</span>
                  <span className="text-sm font-bold text-[#0E1C2F] font-mono">
                    {restockTargetMaterial.boughtQty} {restockTargetMaterial.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Additional Quantity Bought ({restockTargetMaterial.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder={`e.g. 50 ${restockTargetMaterial.unit}`}
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-sm font-mono font-bold text-[#0E1C2F] focus:border-[#0E1C2F] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Batch Note / Supplier Delivery Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received from Supplier Truck AP-02"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs focus:border-[#0E1C2F] outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E5DD]">
                <button
                  type="button"
                  onClick={() => setIsQuickRestockOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2EFE8] hover:bg-[#E8E5DD] text-[#344054] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#FDE68A]" />
                  <span>Confirm Restock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RECORD SCRAP / PRODUCTION WASTAGE               */}
      {/* ======================================================== */}
      {isRecordScrapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DCD7CD] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#B45309] flex items-center justify-center">
                  <Recycle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0E1C2F] font-serif">
                    Record Scrap &amp; Material Wastage
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Log wasted material to automatically deduct from stock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordScrapOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:bg-[#F2EFE8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitScrap} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Select Material <span className="text-red-500">*</span>
                </label>
                <select
                  value={scrapTargetMaterialId}
                  onChange={(e) => setScrapTargetMaterialId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-semibold text-[#0E1C2F] focus:border-[#0E1C2F] outline-hidden"
                >
                  <option value="">-- Choose Material to Deduct Scrap --</option>
                  {(materials || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (In-Stock: {m.inStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Wasted / Scrap Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1"
                    value={scrapQty}
                    onChange={(e) => setScrapQty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-mono font-bold text-[#B45309] focus:border-[#0E1C2F] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0E1C2F] mb-1">
                    Date of Wastage
                  </label>
                  <input
                    type="date"
                    required
                    value={scrapDate}
                    onChange={(e) => setScrapDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-mono focus:border-[#0E1C2F] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Reason / Wastage Stage
                </label>
                <select
                  value={scrapReason}
                  onChange={(e) => setScrapReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs font-medium focus:border-[#0E1C2F] outline-hidden"
                >
                  <option value="Cutting waste / trim end pieces">Cutting waste / trim end pieces</option>
                  <option value="Weaving machine setup trim">Weaving machine setup trim</option>
                  <option value="Bending defect / deformed wire">Bending defect / deformed wire</option>
                  <option value="Damaged wire spool during winding">Damaged wire spool during winding</option>
                  <option value="Corrosion / surface rust damage">Corrosion / surface rust damage</option>
                  <option value="Damaged during forklift / yard unloading">Damaged during forklift / yard unloading</option>
                  <option value="Defective concrete post cracking">Defective concrete post cracking</option>
                  <option value="General factory production loss">General factory production loss</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0E1C2F] mb-1">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 kg cutoff end piece stored in factory scrap bin"
                  value={scrapNotes}
                  onChange={(e) => setScrapNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DCD7CD] rounded-lg text-xs focus:border-[#0E1C2F] outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E5DD]">
                <button
                  type="button"
                  onClick={() => setIsRecordScrapOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2EFE8] hover:bg-[#E8E5DD] text-[#344054] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B45309] hover:bg-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Recycle className="w-4 h-4 text-white" />
                  <span>Log Scrap Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: INSPECT SALES DEDUCTIONS                         */}
      {/* ======================================================== */}
      {inspectedSalesMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DCD7CD] shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E1C2F] font-serif">
                    Sales Deductions for {inspectedSalesMaterial.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                    Total Sold: {inspectedSalesMaterial.soldQty} {inspectedSalesMaterial.unit}
                  </span>
                </div>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  The following customer GST invoices and retail counter bills automatically deducted stock:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSalesMaterial(null)}
                className="p-1 rounded-lg text-[#667085] hover:bg-[#F2EFE8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px]">
                    <th className="py-2.5 px-3">Document #</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Sold Qty</th>
                    <th className="py-2.5 px-3 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DD]">
                  {inspectedSalesMaterial.salesDeductions?.map((sd, i) => (
                    <tr key={i} className="hover:bg-[#FAF9F5]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">
                        {sd.documentNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          sd.documentType === "invoice" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"
                        }`}>
                          {sd.documentType?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#5A6A80]">
                        {sd.issueDate}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#182230]">
                        {sd.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">
                        {sd.qty} {sd.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const fullDoc = (documents || []).find((d) => d.id === sd.documentId);
                            if (fullDoc) openPreview(fullDoc);
                          }}
                          className="px-2 py-1 rounded bg-[#0E1C2F] text-white text-[10px] font-bold hover:bg-[#14243B]"
                        >
                          View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#E8E5DD] flex items-center justify-between">
              <div className="text-[11px] text-[#667085]">
                Deductions update automatically whenever invoices/bills are added, edited, or voided.
              </div>
              <button
                type="button"
                onClick={() => setInspectedSalesMaterial(null)}
                className="px-4 py-2 rounded-xl bg-[#0E1C2F] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
