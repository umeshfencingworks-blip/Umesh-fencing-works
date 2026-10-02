"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import {
  Printer,
  X,
  CreditCard,
  ZoomIn,
  ZoomOut,
  Scan,
} from "lucide-react";
import PrintableDocument from "./PrintableDocument";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export default function DocumentPreviewModal() {
  const { isPreviewModalOpen, closePreview, previewDocument, openPaymentModal } = useUI();
  const printRef = useRef(null);
  const containerRef = useRef(null);

  // Responsive scale states
  const [containerWidth, setContainerWidth] = useState(0);
  const [scaleMode, setScaleMode] = useState("auto"); // "auto" (fit screen width) or number like 100, 75, 125
  const [measuredDocHeight, setMeasuredDocHeight] = useState(1070);

  // Continuous high-precision measurement on open, resize, orientation change
  useEffect(() => {
    if (!isPreviewModalOpen || !previewDocument) return;

    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      } else if (typeof window !== "undefined") {
        setContainerWidth(window.innerWidth);
      }

      if (printRef.current) {
        const h = printRef.current.offsetHeight || printRef.current.scrollHeight;
        if (h && h > 600) {
          setMeasuredDocHeight(h);
        }
      }
    };

    measure();
    const t1 = setTimeout(measure, 40);
    const t2 = setTimeout(measure, 150);

    let ro = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(containerRef.current);
    }

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [isPreviewModalOpen, previewDocument]);

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

  const handlePrint = () => {
    document.body.classList.add("modal-preview-active");
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 80);
    });
  };

  // Determine available width: 16px padding on mobile (<640px), 32px on tablets, 48px on desktop
  const isMobile = containerWidth > 0 ? containerWidth < 640 : (typeof window !== "undefined" && window.innerWidth < 640);
  const pad = isMobile ? 16 : containerWidth < 1024 ? 32 : 48;
  const currentViewportWidth = containerWidth > 0 ? containerWidth : (typeof window !== "undefined" ? window.innerWidth : 390);
  const availableWidth = Math.max(260, currentViewportWidth - pad);

  // Auto fit scale: scale down so 794px fits inside available width (capped at 1.0 max so it doesn't over-stretch)
  const fitScale = Math.min(1.0, Math.max(0.32, Number((availableWidth / A4_WIDTH).toFixed(3))));

  const effectiveScale =
    scaleMode === "auto"
      ? fitScale
      : typeof scaleMode === "number"
      ? scaleMode / 100
      : fitScale;

  const docHeight = measuredDocHeight || 1070;

  const handleZoomIn = () => {
    const current = Math.round(effectiveScale * 100);
    setScaleMode(Math.min(current + 15, 160));
  };

  const handleZoomOut = () => {
    const current = Math.round(effectiveScale * 100);
    setScaleMode(Math.max(current - 15, 35));
  };

  const handleFitScreen = () => setScaleMode("auto");
  const handleActualSize = () => setScaleMode(100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 md:p-5 modal-backdrop-overlay">
      <div className="relative w-full max-w-5xl bg-[#0E1C2F] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[94vh] max-h-[100dvh] sm:max-h-[96vh] my-auto">
        {/* Modal Header Bar (Hidden in Print) */}
        <div className="no-print bg-[#0E1C2F] text-white px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#1C314D] shrink-0 space-y-2">
          {/* Row 1: Document title, number pill, status, and Close button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-sm tracking-wide font-sans text-white">
                {isInvoice ? "Tax Invoice Preview (GST A4)" : "Retail Counter Bill Preview (A4)"}
              </span>
              <span className="font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-bold">
                {doc.documentNumber}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
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

            <button
              onClick={closePreview}
              className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Close Preview (Esc)"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 2: Responsive Action Buttons & iOS/Mobile-Friendly Zoom Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-white/10">
            {/* Zoom & Fit Control Pills */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 text-xs text-slate-200 border border-white/15">
              <button
                type="button"
                onClick={handleFitScreen}
                title="Fit to Screen Width (Mobile Optimized)"
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  scaleMode === "auto"
                    ? "bg-[#B45309] text-white shadow-xs"
                    : "hover:bg-white/15 text-slate-300"
                }`}
              >
                <Scan className="w-3 h-3" />
                <span>Fit</span>
              </button>
              <button
                type="button"
                onClick={handleActualSize}
                title="100% Actual Size"
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  scaleMode === 100
                    ? "bg-[#B45309] text-white shadow-xs"
                    : "hover:bg-white/15 text-slate-300"
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 hover:text-white hover:bg-white/15 rounded transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-amber-300/90 px-1 font-semibold min-w-[32px] text-center">
                {Math.round(effectiveScale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 hover:text-white hover:bg-white/15 rounded transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print & Payment Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {doc.balanceDue > 0 && (
                <button
                  onClick={() => {
                    closePreview();
                    openPaymentModal(doc);
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Collect Payment</span>
                  <span className="xs:hidden">Collect</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#B45309] to-[#D97706] hover:from-[#92400E] hover:to-[#B45309] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Document Canvas Viewport (Ultra-Responsive on iPhone, iPad, Android & Desktop) */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 md:p-6 bg-[#CBD5E1] flex flex-col items-center justify-start modal-scroll-container touch-pan-x touch-pan-y"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Scaled Bounds Slot: Exactly matches scaled width & height, providing zero-clipping centered flow */}
          <div
            className="scaled-viewport-slot my-auto mx-auto transition-all duration-150 relative shrink-0"
            style={{
              width: `${Math.round(A4_WIDTH * effectiveScale)}px`,
              height: `${Math.round(docHeight * effectiveScale)}px`,
            }}
          >
            {/* The 794px Document Canvas: Maintains exact 794px A4 layout, scaled via top-left origin */}
            <div
              className="screen-preview-wrapper shadow-2xl rounded-xs"
              style={{
                width: `${A4_WIDTH}px`,
                minWidth: `${A4_WIDTH}px`,
                maxWidth: `${A4_WIDTH}px`,
                position: "absolute",
                top: 0,
                left: 0,
                transform: `scale(${effectiveScale})`,
                transformOrigin: "top left",
              }}
            >
              <PrintableDocument doc={doc} printRef={printRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
