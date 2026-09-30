"use client";

import React, { useRef, useEffect, useState } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR, isIntraStateTransaction } from "@/lib/calculations";
import { Printer, X, CreditCard, Phone, MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import PrintableDocument from "./PrintableDocument";

export default function DocumentPreviewModal() {
  const { isPreviewModalOpen, closePreview, previewDocument, openPaymentModal } = useUI();
  const printRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Synchronize modal-preview-active on body for clean print media isolation
  useEffect(() => {
    if (isPreviewModalOpen && previewDocument) {
      document.body.classList.add("modal-preview-active");
      return () => {
        document.body.classList.remove("modal-preview-active");
      };
    } else {
      document.body.classList.remove("modal-preview-active");
    }
  }, [isPreviewModalOpen, previewDocument]);

  if (!isPreviewModalOpen || !previewDocument) return null;

  const doc = previewDocument;
  const isInvoice = doc.documentType === "invoice";
  const customer = doc.customerSnapshot || {};
  const business = doc.businessSnapshot || {};
  const isIntraState = isIntraStateTransaction(customer.stateCode || "37");

  const handlePrint = () => {
    document.body.classList.add("modal-preview-active");
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 60);
    });
  };

  const totalQty = (doc.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 85));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-2 sm:p-4 modal-backdrop-overlay">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Modal Controls Bar (Hidden in print) */}
        <div className="no-print bg-[#0E1C2F] text-white px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#1C314D]">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-xs sm:text-sm tracking-wide font-sans">
              {isInvoice ? "Tax Invoice Preview (GST A4)" : "Retail Counter Bill Preview (A4 POS)"}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold">
              {doc.documentNumber}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                doc.paymentStatus === "paid"
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : doc.paymentStatus === "partially_paid"
                  ? "bg-[#FEF3C7] text-[#854D0E]"
                  : "bg-[#FEE2E2] text-[#991B1B]"
              }`}
            >
              {doc.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Clarity Zoom Controls */}
            <div className="flex items-center bg-white/10 rounded-md border border-white/20 p-0.5 text-xs text-slate-200">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 hover:text-white hover:bg-white/15 rounded transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom to 100%"
                className="px-1.5 py-0.5 font-mono text-[11px] font-semibold hover:text-white"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In (High Clarity)"
                className="p-1 hover:text-white hover:bg-white/15 rounded transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {doc.balanceDue > 0 && (
              <button
                onClick={() => {
                  closePreview();
                  openPaymentModal(doc);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collect Payment</span>
                <span className="sm:hidden text-[11px]">Collect</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={closePreview}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container on Screen */}
        <div className="overflow-y-auto overflow-x-auto p-2 sm:p-6 bg-[#E9ECEF] flex justify-start sm:justify-center modal-scroll-container">
          {/* Printable Document Root (Clamped strictly to A4 with Razor-Sharp Clarity) */}
          <PrintableDocument doc={doc} printRef={printRef} zoomLevel={zoomLevel} />
        </div>
      </div>
    </div>
  );
}
