"use client";

import React, { useRef, useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR, isIntraStateTransaction } from "@/lib/calculations";
import { Printer, X, CreditCard, Phone, MapPin } from "lucide-react";

export default function DocumentPreviewModal() {
  const { isPreviewModalOpen, closePreview, previewDocument, openPaymentModal } = useUI();
  const printRef = useRef(null);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-2 sm:p-4 modal-backdrop-overlay">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
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
          {/* Printable Document Root (Clamped strictly to A4, Reference from Image 2) */}
          <div
            id="printable-document"
            ref={printRef}
            className="w-full max-w-[210mm] min-w-[300px] bg-white text-[#0E1C2F] p-4 sm:p-6 relative shadow-lg border-2 border-[#C28E3A] flex flex-col justify-between mx-auto"
            style={{
              fontFamily: "'Baloo Bhai 2', sans-serif",
              minHeight: "282mm",
              maxHeight: "285mm",
              boxSizing: "border-box",
            }}
          >
            {/* Classical Golden Corner Flourishes */}
            <div className="filigree-corner top-1.5 left-1.5" style={{ transform: "rotate(0deg)" }}>
              <img src="/assets/corner_flourish.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="filigree-corner top-1.5 right-1.5" style={{ transform: "rotate(90deg)" }}>
              <img src="/assets/corner_flourish.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="filigree-corner bottom-1.5 left-1.5" style={{ transform: "rotate(270deg)" }}>
              <img src="/assets/corner_flourish.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="filigree-corner bottom-1.5 right-1.5" style={{ transform: "rotate(180deg)" }}>
              <img src="/assets/corner_flourish.svg" alt="" className="w-full h-full object-contain" />
            </div>

            {/* Top Header Block (Radar Industries Reference Layout) */}
            <div>
              <div className="flex items-start justify-between pb-3 border-b-2 border-[#C28E3A]">
                {/* Left: Official Circular Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-full border-2 border-[#C28E3A] p-0.5 overflow-hidden bg-white shrink-0 shadow-xs">
                    <img
                      src="/assets/umesh_logo.jpg"
                      alt="Umesh Fencing Works"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Business Information */}
                  <div className="space-y-0.5">
                    <h1 className="text-2xl font-extrabold uppercase tracking-tight text-[#0E1C2F] leading-none">
                      {business.name || "Umesh Fencing Works"}
                    </h1>
                    <div className="text-[11px] font-semibold text-[#B45309] tracking-wide">
                      {business.tagline || "Chainlink, Barbed Wire, Concrete Poles & Solar Fencing"}
                    </div>
                    <div className="text-[11px] font-mono text-[#0E1C2F] font-bold">
                      <span>PAN No: <strong className="font-mono text-[#0E1C2F]">AMQPU6044G</strong></span>
                      <span className="mx-2 text-[#C28E3A]">|</span>
                      <span>GSTIN: <strong className="font-mono text-[#0E1C2F]">{business.gstin || "37AMQPU6044G1ZH"}</strong></span>
                    </div>
                    <div className="text-[10px] text-[#475467] flex items-center gap-1 font-semibold">
                      <Phone className="w-3 h-3 text-[#B45309]" />
                      <span>{business.phone || "+91 94402 85110"}</span>
                      <span className="mx-1 text-[#C28E3A]">•</span>
                      <span>Proprietor: {business.proprietor || "B. Umesh"}</span>
                    </div>
                    <div className="text-[9.5px] text-[#475467] flex items-start gap-1 max-w-lg leading-tight">
                      <MapPin className="w-3 h-3 text-[#B45309] shrink-0 mt-0.5" />
                      <span>{business.address || "Survey No. 87/9, Near HLC Canal, Bukkarayasamudram, Anantapur, Andhra Pradesh - 515701"}</span>
                    </div>
                  </div>
                </div>

                {/* Right: TAX INVOICE title & Original for Recipient box */}
                <div className="text-right flex flex-col items-end">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#0E1C2F] leading-tight">
                    {isInvoice ? "TAX INVOICE" : "RETAIL BILL"}
                  </h2>
                  <div className="mt-1 px-2.5 py-0.5 border border-[#475467] text-[9px] font-bold uppercase tracking-wider text-[#475467] rounded-xs">
                    ORIGINAL FOR RECIPIENT
                  </div>
                </div>
              </div>

              {/* Document Metadata Strip (5 equal columns) */}
              <div className="grid grid-cols-5 border-b border-[#C28E3A] py-2 text-[10px] text-center bg-[#FDFBF7]">
                <div className="border-r border-[#E2E6EA] px-1">
                  <div className="text-[#667085] font-bold uppercase text-[9px]">Invoice No.</div>
                  <div className="font-mono font-black text-[#0E1C2F] text-xs mt-0.5">{doc.documentNumber}</div>
                </div>
                <div className="border-r border-[#E2E6EA] px-1">
                  <div className="text-[#667085] font-bold uppercase text-[9px]">Invoice Date</div>
                  <div className="font-semibold text-[#0E1C2F] mt-0.5">{doc.issueDate}</div>
                </div>
                <div className="border-r border-[#E2E6EA] px-1">
                  <div className="text-[#667085] font-bold uppercase text-[9px]">Due Date</div>
                  <div className="font-semibold text-[#0E1C2F] mt-0.5">{doc.dueDate || doc.issueDate}</div>
                </div>
                <div className="border-r border-[#E2E6EA] px-1">
                  <div className="text-[#667085] font-bold uppercase text-[9px]">E-way Bill No.</div>
                  <div className="font-mono font-bold text-[#0E1C2F] mt-0.5">{doc.ewayBillNumber || "—"}</div>
                </div>
                <div className="px-1">
                  <div className="text-[#667085] font-bold uppercase text-[9px]">Vehicle No.</div>
                  <div className="font-mono font-bold text-[#0E1C2F] mt-0.5">{doc.vehicleNumber || "—"}</div>
                </div>
              </div>

              {/* Bill To / Ship To Grid */}
              <div className="grid grid-cols-2 border border-[#C28E3A] my-2 text-[10px] bg-white rounded-xs">
                {/* Bill To */}
                <div className="p-2.5 border-r border-[#C28E3A] space-y-0.5">
                  <div className="text-[10px] font-black uppercase text-[#B45309] tracking-wider mb-1 font-mono">
                    Bill To:
                  </div>
                  <div className="font-black text-[#0E1C2F] text-xs">
                    {customer.company || customer.name || "Counter Customer"}
                  </div>
                  {customer.name && customer.company && (
                    <div className="text-[10px] text-[#475467]">Attn: {customer.name}</div>
                  )}
                  <div className="text-[10px] text-[#344054]">
                    {customer.billingAddress || "Anantapur, Andhra Pradesh"}
                  </div>
                  <div className="text-[10px] pt-1">
                    <span className="text-[#667085]">Place of Supply: </span>
                    <strong className="text-[#0E1C2F]">{doc.placeOfSupply || "Andhra Pradesh (37)"}</strong>
                  </div>
                  {customer.gstin && (
                    <div className="font-mono text-[10px]">
                      <span className="text-[#667085]">GSTIN: </span>
                      <strong className="text-[#0E1C2F]">{customer.gstin}</strong>
                    </div>
                  )}
                </div>

                {/* Ship To */}
                <div className="p-2.5 space-y-0.5">
                  <div className="text-[10px] font-black uppercase text-[#B45309] tracking-wider mb-1 font-mono">
                    Ship To:
                  </div>
                  <div className="font-black text-[#0E1C2F] text-xs">
                    {customer.company || customer.name || "Counter Customer"}
                  </div>
                  <div className="text-[10px] text-[#344054]">
                    {customer.shippingAddress || customer.billingAddress || "Anantapur, Andhra Pradesh"}
                  </div>
                  <div className="text-[10px] pt-1">
                    <span className="text-[#667085]">Delivery State: </span>
                    <strong className="text-[#0E1C2F]">{customer.state || "Andhra Pradesh"} (Code: {customer.stateCode || "37"})</strong>
                  </div>
                  {customer.phone && (
                    <div className="font-mono text-[10px]">
                      <span className="text-[#667085]">Contact: </span>
                      <strong className="text-[#0E1C2F]">{customer.phone}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table (Matching Reference Layout) */}
              <div className="mt-2">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-t border-b border-[#C28E3A] bg-[#FDFBF7] text-[#0E1C2F] font-bold uppercase text-[9px]">
                      <th className="py-2 px-2 text-center w-8">No</th>
                      <th className="py-2 px-2">Items</th>
                      <th className="py-2 px-2 text-center w-20">HSN No.</th>
                      <th className="py-2 px-2 text-right w-16">Qty.</th>
                      <th className="py-2 px-2 text-right w-18">Rate</th>
                      <th className="py-2 px-2 text-right w-24">Tax</th>
                      <th className="py-2 px-2 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6EA]">
                    {(doc.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FDFBF7]">
                        <td className="py-2 px-2 text-center font-mono font-bold text-[#667085]">{idx + 1}</td>
                        <td className="py-2 px-2 font-bold text-[#0E1C2F]">{item.description}</td>
                        <td className="py-2 px-2 text-center font-mono text-[#475467]">{item.hsn || "7314"}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-[#0E1C2F]">
                          {item.qty} {item.unit || ""}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">{formatINR(item.rate, false)}</td>
                        <td className="py-2 px-2 text-right font-mono">
                          <div>{formatINR(item.totalTax, false)}</div>
                          <div className="text-[8.5px] text-[#B45309]">({item.taxRate || 18}%)</div>
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-black text-[#0E1C2F]">
                          {formatINR(item.total, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Subtotal Banner Bar (Identical to Image 2 Reference) */}
                  <tfoot>
                    <tr className="border-t-2 border-b-2 border-[#C28E3A] bg-[#F5EEDC] text-[#0E1C2F] font-black font-mono text-[10px]">
                      <td colSpan="3" className="py-2 px-2 font-bold uppercase tracking-wider">
                        SUBTOTAL
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-black">
                        {totalQty}
                      </td>
                      <td></td>
                      <td className="py-2 px-2 text-right font-mono font-black">
                        {formatINR(doc.totalTax)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-black text-xs">
                        {formatINR(doc.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bottom Section: Dual Column (Terms & Bank on Left, Calculations & Total on Right) */}
            <div className="pt-3 border-t-2 border-[#C28E3A] mt-2">
              <div className="grid grid-cols-12 gap-3 text-[10px]">
                {/* Left (7 cols): Terms & Conditions + Bank Details */}
                <div className="col-span-7 space-y-2">
                  {/* Terms */}
                  <div className="space-y-0.5">
                    <div className="text-[9.5px] font-black uppercase text-[#0E1C2F] tracking-wider">
                      Terms &amp; Conditions
                    </div>
                    <div className="text-[9px] text-[#475467] leading-relaxed">
                      1. 7 YEARS RUST FREE WARRANTY AND 15 YEARS BREAKFREE WARRANTY APPLICABLE ON MICON 100-120 GSM PRODUCTS.
                      <br />
                      2. Goods once sold will not be taken back or exchanged.
                      <br />
                      3. Interest @ 18% p.a. charged if payment not made within due date.
                      <br />
                      4. All disputes subject to Anantapur jurisdiction only.
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="p-2 bg-[#FDFBF7] border border-[#DDBB72] rounded-xs space-y-0.5">
                    <div className="text-[9.5px] font-black uppercase text-[#0E1C2F] tracking-wider mb-1">
                      Bank Details
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 text-[9.5px] leading-tight">
                      <div>
                        Name: <strong className="text-[#0E1C2F]">{business.bank?.accountName || "UMESH FENCING WORKS"}</strong>
                      </div>
                      <div>
                        IFSC: <strong className="font-mono text-[#0E1C2F]">{business.bank?.ifsc || "UBIN0812854"}</strong>
                      </div>
                      <div>
                        Account No: <strong className="font-mono text-[#0E1C2F]">{business.bank?.accountNumber || "128511010000221"}</strong>
                      </div>
                      <div>
                        Bank Name: <strong className="text-[#0E1C2F]">{business.bank?.name || "Union Bank of India"}, Bukkarayasamudram</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right (5 cols): Taxable, GST, Total, Balance & Amount in Words */}
                <div className="col-span-5 space-y-1 text-right">
                  <div className="flex justify-between text-[#475467] text-[10px]">
                    <span>Taxable Amount:</span>
                    <span className="font-mono font-bold text-[#0E1C2F]">{formatINR(doc.taxableAmount)}</span>
                  </div>

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between text-[#475467] text-[10px]">
                        <span>CGST @9%:</span>
                        <span className="font-mono">{formatINR(doc.cgst)}</span>
                      </div>
                      <div className="flex justify-between text-[#475467] text-[10px]">
                        <span>SGST @9%:</span>
                        <span className="font-mono">{formatINR(doc.sgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-[#475467] text-[10px]">
                      <span>IGST @18%:</span>
                      <span className="font-mono">{formatINR(doc.igst)}</span>
                    </div>
                  )}

                  {doc.roundOff !== 0 && (
                    <div className="flex justify-between text-[#667085] text-[9px]">
                      <span>Round Off:</span>
                      <span className="font-mono">{doc.roundOff > 0 ? `+${doc.roundOff}` : doc.roundOff}</span>
                    </div>
                  )}

                  {/* Total Amount (Large & Bold like Reference) */}
                  <div className="pt-1.5 border-t-2 border-[#C28E3A] flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-[#0E1C2F]">Total Amount</span>
                    <span className="text-sm font-black font-mono text-[#0E1C2F]">{formatINR(doc.grandTotal)}</span>
                  </div>

                  {/* Received & Balance */}
                  <div className="pt-1 border-t border-[#E2E6EA] space-y-0.5 text-[9.5px]">
                    <div className="flex justify-between text-emerald-800">
                      <span>Received Amount:</span>
                      <span className="font-mono font-bold">{formatINR(doc.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-[#991B1B]">
                      <span>Balance:</span>
                      <span className="font-mono font-black">{formatINR(doc.balanceDue)}</span>
                    </div>
                  </div>

                  {/* Total Amount in Words */}
                  <div className="pt-1 border-t border-[#C28E3A] text-left">
                    <div className="text-[9px] font-bold text-[#667085] uppercase">Total Amount (in words)</div>
                    <div className="font-bold text-[#0E1C2F] text-[9.5px] italic leading-tight">
                      {doc.amountInWords || "Rupees Zero Only"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory Footnote */}
              <div className="mt-3 pt-2 border-t border-[#C28E3A] flex items-end justify-between text-[9.5px]">
                <div className="text-[#667085] text-[9px]">
                  <span>Subject to Anantapur Jurisdiction • Computer Generated Official Tax Invoice</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#0E1C2F] text-[9.5px] mb-6">
                    For UMESH FENCING WORKS
                  </div>
                  <div className="text-[9px] font-semibold text-[#475467] border-t border-[#0E1C2F] pt-0.5 inline-block min-w-[130px] text-center">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
