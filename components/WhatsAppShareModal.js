"use client";

import React, { useState, useRef } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR } from "@/lib/calculations";
import {
  generateWhatsAppMessage,
  sanitizeWhatsAppPhone,
  canSharePdfFile,
  generatePdfFromFileElement,
  triggerFileDownload,
} from "@/lib/pdfGenerator";
import PrintableDocument from "./PrintableDocument";
import { X, Download, AlertTriangle, Loader2 } from "lucide-react";

export function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function WhatsAppShareModal() {
  const { isWhatsAppModalOpen, closeWhatsAppModal, whatsAppDocument, showToast } = useUI();
  const renderRef = useRef(null);

  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const [cachedPdfFile, setCachedPdfFile] = useState(null);

  if (!isWhatsAppModalOpen || !whatsAppDocument) return null;

  const doc = whatsAppDocument;
  const isInvoice = doc.documentType === "invoice";
  const customerName =
    doc.customerSnapshot?.company ||
    doc.customerSnapshot?.name ||
    (isInvoice ? "Invoice Customer" : "Counter Customer");
  const rawPhone = doc.customerSnapshot?.phone || "";
  const sanitizedPhone = sanitizeWhatsAppPhone(rawPhone);
  const hasPhone = Boolean(sanitizedPhone);
  const formattedAmount = formatINR(doc.grandTotal);
  const filename = `${doc.documentNumber || "UFW-DOC"}.pdf`;

  const handleShare = async () => {
    if (isPreparing) return;
    setIsPreparing(true);
    setErrorMessage(null);

    try {
      let fileToShare = cachedPdfFile;
      if (!fileToShare) {
        const { file } = await generatePdfFromFileElement(renderRef.current, filename);
        fileToShare = file;
        setCachedPdfFile(file);
      }

      const whatsappMessage = generateWhatsAppMessage(doc);

      if (canSharePdfFile(fileToShare)) {
        try {
          await navigator.share({
            files: [fileToShare],
            text: whatsappMessage,
            title: filename,
          });
          // Shared cleanly via native share sheet
          closeWhatsAppModal();
        } catch (shareErr) {
          if (shareErr.name === "AbortError") {
            // User cancelled the native share sheet - do NOT show error (Requirement 14)
            setIsPreparing(false);
            return;
          }
          console.warn("[Web Share File Error]:", shareErr);
          setShowFallback(true);
        }
      } else {
        // Device/browser does not support native file sharing
        setShowFallback(true);
      }
    } catch (err) {
      console.error("[PDF Generation Error]:", err);
      setErrorMessage("Unable to prepare the PDF for sharing. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleDownloadOnly = async () => {
    if (isPreparing) return;
    setIsPreparing(true);
    setErrorMessage(null);

    try {
      let fileToDownload = cachedPdfFile;
      if (!fileToDownload) {
        const { file } = await generatePdfFromFileElement(renderRef.current, filename);
        fileToDownload = file;
        setCachedPdfFile(file);
      }
      triggerFileDownload(fileToDownload, filename);
      showToast(`Downloaded ${filename}`, "info");
    } catch (err) {
      console.error("[Download Error]:", err);
      setErrorMessage("Unable to prepare the PDF for sharing. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleOpenWhatsAppChat = () => {
    const whatsappMessage = generateWhatsAppMessage(doc);
    const encoded = encodeURIComponent(whatsappMessage);
    const url = sanitizedPhone
      ? `https://wa.me/${sanitizedPhone}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto border border-[#E8E5DD]">
        {/* Header */}
        <div className="bg-[#0E1C2F] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1C314D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <WhatsAppIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">
                {isInvoice ? "Share Invoice via WhatsApp" : "Share Bill via WhatsApp"}
              </h2>
            </div>
          </div>
          <button
            onClick={closeWhatsAppModal}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Document Summary Card */}
          <div className="bg-[#FDFBF7] border border-[#E8E5DD] rounded-lg p-3.5 space-y-2.5">
            <div className="flex justify-between items-center py-0.5 border-b border-[#EFECE4]">
              <span className="text-[#667085] font-medium">Customer:</span>
              <span className="font-bold text-[#0E1C2F] max-w-[220px] truncate text-right">
                {customerName}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-[#EFECE4]">
              <span className="text-[#667085] font-medium">Phone:</span>
              <span className="font-mono font-semibold text-[#0E1C2F]">
                {hasPhone ? (
                  rawPhone
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-sans">
                    Not available
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-[#EFECE4]">
              <span className="text-[#667085] font-medium">Document:</span>
              <span className="font-mono font-bold text-[#0E1C2F] px-1.5 py-0.5 rounded bg-white border border-[#E8E5DD]">
                {doc.documentNumber}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-[#667085] font-medium">Amount:</span>
              <span className="font-mono font-black text-[#0E1C2F] text-sm">
                {formattedAmount}
              </span>
            </div>
          </div>

          {/* Missing Phone Number Alert */}
          {!hasPhone && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11.5px] leading-tight">
                <span className="font-bold block">Customer phone number is not available.</span>
                <span>You can download the PDF to share or save it manually.</span>
              </div>
            </div>
          )}

          {/* Browser Unsupported File Sharing Fallback View */}
          {showFallback && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 space-y-1.5">
              <div className="font-bold text-[12px] flex items-center gap-1.5 text-blue-900">
                <span>Your browser doesn't support direct PDF sharing.</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-snug">
                You can open WhatsApp to send the message details, and download the official PDF to manually attach it in the chat.
              </p>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[11.5px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F8F9FA] px-4 sm:px-5 py-3 border-t border-[#E8E5DD] flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={closeWhatsAppModal}
            disabled={isPreparing}
            className="px-3.5 py-2 rounded-md border border-[#DCD7CD] bg-white text-[#475467] font-semibold hover:bg-[#F2EFE8] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {!hasPhone ? (
            /* Fallback when customer has no phone number */
            <button
              type="button"
              onClick={handleDownloadOnly}
              disabled={isPreparing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white font-bold shadow-sm transition-all disabled:opacity-70"
            >
              {isPreparing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          ) : showFallback ? (
            /* Fallback options when native file sharing is unsupported */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadOnly}
                disabled={isPreparing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#DCD7CD] bg-white hover:bg-slate-50 text-[#0E1C2F] font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isPreparing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppChat}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Open WhatsApp</span>
              </button>
            </div>
          ) : (
            /* Primary Native Web Share Action */
            <button
              type="button"
              onClick={handleShare}
              disabled={isPreparing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPreparing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Hidden Offscreen Render Target for 100% Identical A4 PDF Output */}
      <div
        ref={renderRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "794px",
          minHeight: "1122px",
          background: "#ffffff",
          zIndex: -9999,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <PrintableDocument doc={doc} id="whatsapp-pdf-render-doc" />
      </div>
    </div>
  );
}
