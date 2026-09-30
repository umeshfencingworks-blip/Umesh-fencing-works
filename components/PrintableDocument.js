"use client";

import React from "react";
import { formatINR, isIntraStateTransaction } from "@/lib/calculations";
import { Phone, MapPin } from "lucide-react";

export default function PrintableDocument({
  doc,
  printRef,
  zoomLevel = 100,
  className = "",
  style = {},
  id = "printable-document",
}) {
  if (!doc) return null;

  const isInvoice = doc.documentType === "invoice";
  const customer = doc.customerSnapshot || {};
  const business = doc.businessSnapshot || {};
  const isIntraState = isIntraStateTransaction(customer.stateCode || "37");
  const totalQty = (doc.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  return (
    <div
      id={id}
      ref={printRef}
      className={`w-full max-w-[210mm] min-w-[320px] bg-white text-[#0F172A] p-4 sm:p-6 relative shadow-xl border-2 border-[#C28E3A] flex flex-col justify-between mx-auto ${className}`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        minHeight: "282mm",
        maxHeight: "285mm",
        boxSizing: "border-box",
        textRendering: "geometricPrecision",
        WebkitFontSmoothing: "subpixel-antialiased",
        MozOsxFontSmoothing: "grayscale",
        zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined,
        ...style,
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

      {/* Top Header Block */}
      <div>
        <div className="flex items-start justify-between pb-3 border-b-2 border-[#C28E3A]">
          {/* Left: Official Circular Logo & Business Details */}
          <div className="flex items-center gap-3.5">
            <div className="w-20 h-20 rounded-full border-2 border-[#C28E3A] p-0.5 overflow-hidden bg-white shrink-0 shadow-xs">
              <img
                src="/assets/umesh_logo.jpg"
                alt="Umesh Fencing Works"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Business Information */}
            <div className="space-y-0.5">
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A] leading-none">
                {business.name || "Umesh Fencing Works"}
              </h1>
              <div className="text-xs font-bold text-[#B45309] tracking-wide">
                {business.tagline || "Chainlink, Barbed Wire, Concrete Poles & Solar Fencing"}
              </div>
              <div className="text-[11.5px] font-mono text-[#0F172A] font-bold">
                <span>PAN No: <strong className="font-mono text-[#0F172A]">AMQPU6044G</strong></span>
                <span className="mx-2 text-[#C28E3A]">|</span>
                <span>GSTIN: <strong className="font-mono text-[#0F172A]">{business.gstin || "37AMQPU6044G1ZH"}</strong></span>
              </div>
              <div className="text-[11px] text-[#1E293B] flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#B45309]" />
                <span>{business.phone || "+91 94408 57111"}</span>
                <span className="mx-1 text-[#C28E3A]">•</span>
                <span>Proprietor: {business.proprietor || "C. Umesh"}</span>
              </div>
              <div className="text-[10.5px] text-[#334155] flex items-start gap-1 max-w-lg leading-tight font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5" />
                <span>{business.address || "Plot No 5 Ground Floor Door:2-1-164; Sy No133/7 Rachanapalle Ananthapuramu"}</span>
              </div>
            </div>
          </div>

          {/* Right: TAX INVOICE title & Original for Recipient box */}
          <div className="text-right flex flex-col items-end">
            <h2 className="text-xl font-black uppercase tracking-wider text-[#0F172A] leading-tight">
              {isInvoice ? "TAX INVOICE" : "RETAIL BILL"}
            </h2>
            <div className="mt-1 px-3 py-1 border-2 border-[#1E293B] text-[10px] font-black uppercase tracking-wider text-[#0F172A] rounded-xs bg-[#F8FAFC]">
              ORIGINAL FOR RECIPIENT
            </div>
          </div>
        </div>

        {/* Document Metadata Strip (5 equal columns) */}
        <div className="grid grid-cols-5 border-b-2 border-[#C28E3A] py-2.5 text-[11px] text-center bg-[#FDFBF7]">
          <div className="border-r border-[#CBD5E1] px-1">
            <div className="text-[#475569] font-bold uppercase text-[10px]">Invoice No.</div>
            <div className="font-mono font-black text-[#0F172A] text-[13px] mt-0.5">{doc.documentNumber}</div>
          </div>
          <div className="border-r border-[#CBD5E1] px-1">
            <div className="text-[#475569] font-bold uppercase text-[10px]">Invoice Date</div>
            <div className="font-bold text-[#0F172A] mt-0.5">{doc.issueDate}</div>
          </div>
          <div className="border-r border-[#CBD5E1] px-1">
            <div className="text-[#475569] font-bold uppercase text-[10px]">Due Date</div>
            <div className="font-bold text-[#0F172A] mt-0.5">{doc.dueDate || doc.issueDate}</div>
          </div>
          <div className="border-r border-[#CBD5E1] px-1">
            <div className="text-[#475569] font-bold uppercase text-[10px]">E-way Bill No.</div>
            <div className="font-mono font-bold text-[#0F172A] mt-0.5">{doc.ewayBillNumber || "—"}</div>
          </div>
          <div className="px-1">
            <div className="text-[#475569] font-bold uppercase text-[10px]">Vehicle No.</div>
            <div className="font-mono font-bold text-[#0F172A] mt-0.5">{doc.vehicleNumber || "—"}</div>
          </div>
        </div>

        {/* Bill To / Ship To Grid */}
        <div className="grid grid-cols-2 border-2 border-[#C28E3A] my-2 text-[11px] bg-white rounded-xs">
          {/* Bill To */}
          <div className="p-3 border-r-2 border-[#C28E3A] space-y-0.5">
            <div className="text-[11px] font-black uppercase text-[#B45309] tracking-wider mb-1 font-mono">
              Bill To:
            </div>
            <div className="font-black text-[#0F172A] text-[13px]">
              {customer.company || customer.name || "Counter Customer"}
            </div>
            {customer.name && customer.company && (
              <div className="text-[11px] text-[#334155] font-semibold">Attn: {customer.name}</div>
            )}
            <div className="text-[11px] text-[#334155] leading-snug">
              {customer.billingAddress || "Anantapur, Andhra Pradesh"}
            </div>
            <div className="text-[11px] pt-1">
              <span className="text-[#475569] font-medium">Place of Supply: </span>
              <strong className="text-[#0F172A] font-bold">{doc.placeOfSupply || "Andhra Pradesh (37)"}</strong>
            </div>
            {customer.gstin && (
              <div className="font-mono text-[11px]">
                <span className="text-[#475569]">GSTIN: </span>
                <strong className="text-[#0F172A] font-bold">{customer.gstin}</strong>
              </div>
            )}
          </div>

          {/* Ship To */}
          <div className="p-3 space-y-0.5">
            <div className="text-[11px] font-black uppercase text-[#B45309] tracking-wider mb-1 font-mono">
              Ship To:
            </div>
            <div className="font-black text-[#0F172A] text-[13px]">
              {customer.company || customer.name || "Counter Customer"}
            </div>
            <div className="text-[11px] text-[#334155] leading-snug">
              {customer.shippingAddress || customer.billingAddress || "Anantapur, Andhra Pradesh"}
            </div>
            <div className="text-[11px] pt-1">
              <span className="text-[#475569] font-medium">Delivery State: </span>
              <strong className="text-[#0F172A] font-bold">{customer.state || "Andhra Pradesh"} (Code: {customer.stateCode || "37"})</strong>
            </div>
            {customer.phone && (
              <div className="font-mono text-[11px]">
                <span className="text-[#475569]">Contact: </span>
                <strong className="text-[#0F172A] font-bold">{customer.phone}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-2.5">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-t-2 border-b-2 border-[#C28E3A] bg-[#FDFBF7] text-[#0F172A] font-black uppercase text-[10px]">
                <th className="py-2.5 px-2.5 text-center w-9">No</th>
                <th className="py-2.5 px-2.5">Items</th>
                <th className="py-2.5 px-2.5 text-center w-22">HSN No.</th>
                <th className="py-2.5 px-2.5 text-right w-18">Qty.</th>
                <th className="py-2.5 px-2.5 text-right w-20">Rate</th>
                <th className="py-2.5 px-2.5 text-right w-24">Tax</th>
                <th className="py-2.5 px-2.5 text-right w-26">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EA]">
              {(doc.items || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FDFBF7]">
                  <td className="py-2 px-2.5 text-center font-mono font-bold text-[#475569]">{idx + 1}</td>
                  <td className="py-2 px-2.5 font-bold text-[#0F172A] text-[11.5px]">{item.description}</td>
                  <td className="py-2 px-2.5 text-center font-mono text-[#334155] font-semibold">{item.hsn || "7314"}</td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-[#0F172A]">
                    {item.qty} {item.unit || ""}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold text-[#0F172A]">{formatINR(item.rate, false)}</td>
                  <td className="py-2 px-2.5 text-right font-mono">
                    <div className="font-semibold text-[#0F172A]">{formatINR(item.totalTax, false)}</div>
                    <div className="text-[9.5px] text-[#B45309] font-bold">({item.taxRate || 18}%)</div>
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-black text-[#0F172A]">
                    {formatINR(item.total, false)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Subtotal Banner Bar */}
            <tfoot>
              <tr className="border-t-2 border-b-2 border-[#C28E3A] bg-[#F5EEDC] text-[#0F172A] font-black font-mono text-[11px]">
                <td colSpan="3" className="py-2.5 px-2.5 font-bold uppercase tracking-wider">
                  SUBTOTAL
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono font-black">
                  {totalQty}
                </td>
                <td></td>
                <td className="py-2.5 px-2.5 text-right font-mono font-black">
                  {formatINR(doc.totalTax)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono font-black text-xs">
                  {formatINR(doc.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bottom Section: Dual Column (Terms & Bank on Left, Calculations & Total on Right) */}
      <div className="pt-3 border-t-2 border-[#C28E3A] mt-2">
        <div className="grid grid-cols-12 gap-3.5 text-[11px]">
          {/* Left (7 cols): Terms & Conditions + Bank Details */}
          <div className="col-span-7 space-y-2.5">
            {/* Terms */}
            <div className="space-y-1">
              <div className="text-[10.5px] font-black uppercase text-[#0F172A] tracking-wider">
                Terms &amp; Conditions
              </div>
              <div className="text-[10.5px] text-[#1E293B] leading-relaxed font-medium">
                1. Goods once sold will not be taken back or exchanged.
                <br />
                2. Interest @ 18% p.a. charged if payment not made within due date.
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-2.5 bg-[#FDFBF7] border-2 border-[#DDBB72] rounded-xs space-y-0.5">
              <div className="text-[10.5px] font-black uppercase text-[#0F172A] tracking-wider mb-1">
                Bank Details
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-[10.5px] leading-snug">
                <div>
                  Name: <strong className="text-[#0F172A] font-bold">{business.bank?.accountName || "UMESH FENCING WORKS"}</strong>
                </div>
                <div>
                  IFSC: <strong className="font-mono text-[#0F172A] font-bold">{business.bank?.ifsc || "UBIN0812854"}</strong>
                </div>
                <div>
                  Account No: <strong className="font-mono text-[#0F172A] font-bold">{business.bank?.accountNumber || "128511010000221"}</strong>
                </div>
                <div>
                  Bank Name: <strong className="text-[#0F172A] font-bold">{business.bank?.name || "Union Bank of India"}, Bukkarayasamudram</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right (5 cols): Taxable, GST, Total, Balance & Amount in Words */}
          <div className="col-span-5 space-y-1 text-right">
            <div className="flex justify-between text-[#334155] text-[11px]">
              <span>Taxable Amount:</span>
              <span className="font-mono font-bold text-[#0F172A]">{formatINR(doc.taxableAmount)}</span>
            </div>

            {isIntraState ? (
              <>
                <div className="flex justify-between text-[#334155] text-[11px]">
                  <span>CGST @9%:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">{formatINR(doc.cgst)}</span>
                </div>
                <div className="flex justify-between text-[#334155] text-[11px]">
                  <span>SGST @9%:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">{formatINR(doc.sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-[#334155] text-[11px]">
                <span>IGST @18%:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{formatINR(doc.igst)}</span>
              </div>
            )}

            {doc.roundOff !== 0 && (
              <div className="flex justify-between text-[#475569] text-[10.5px]">
                <span>Round Off:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{doc.roundOff > 0 ? `+${doc.roundOff}` : doc.roundOff}</span>
              </div>
            )}

            {/* Total Amount */}
            <div className="pt-2 border-t-2 border-[#C28E3A] flex justify-between items-center">
              <span className="text-xs font-black uppercase text-[#0F172A]">Total Amount</span>
              <span className="text-[15px] font-black font-mono text-[#0F172A]">{formatINR(doc.grandTotal)}</span>
            </div>

            {/* Received & Balance */}
            <div className="pt-1 border-t border-[#E2E6EA] space-y-0.5 text-[10.5px]">
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Received Amount:</span>
                <span className="font-mono">{formatINR(doc.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-[#991B1B] font-bold">
                <span>Balance:</span>
                <span className="font-mono font-black">{formatINR(doc.balanceDue)}</span>
              </div>
            </div>

            {/* Total Amount in Words */}
            <div className="pt-1.5 border-t border-[#C28E3A] text-left">
              <div className="text-[9.5px] font-bold text-[#475569] uppercase">Total Amount (in words)</div>
              <div className="font-bold text-[#0F172A] text-[10.5px] italic leading-tight">
                {doc.amountInWords || "Rupees Zero Only"}
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Signatory Footnote */}
        <div className="mt-3 pt-2.5 border-t-2 border-[#C28E3A] flex items-end justify-between text-[10.5px]">
          <div className="text-[#475569] text-[10px] font-medium">
            <span>Computer Generated Official Tax Invoice / Bill of Supply</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-[#0F172A] text-[10px] mb-6">
              For UMESH FENCING WORKS
            </div>
            <div className="text-[10px] font-bold text-[#0F172A] border-t border-[#0F172A] pt-0.5 inline-block min-w-[140px] text-center">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
