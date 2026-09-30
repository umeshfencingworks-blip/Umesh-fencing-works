"use client";

import { formatINR } from "@/lib/calculations";

/**
 * Generate dynamic WhatsApp message per Specification Section 5
 * Strictly dynamic, no hardcoding.
 */
export function generateWhatsAppMessage(doc) {
  if (!doc) return "";
  const isInvoice = doc.documentType === "invoice";
  const customerName =
    doc.customerSnapshot?.company ||
    doc.customerSnapshot?.name ||
    "Customer";
  const docNumber = doc.documentNumber || "";
  const totalAmount = formatINR(doc.grandTotal);

  if (isInvoice) {
    return `Hello ${customerName},

Please find your Invoice ${docNumber} from Umesh Fencing Works.

Total Amount: ${totalAmount}

Thank you.`;
  } else {
    return `Hello ${customerName},

Please find your Bill ${docNumber} from Umesh Fencing Works.

Total Amount: ${totalAmount}

Thank you.`;
  }
}

/**
 * Clean phone number into international WhatsApp format (defaulting to India country code 91)
 */
export function sanitizeWhatsAppPhone(phone) {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits || digits.length < 10) return null;

  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  return digits;
}

/**
 * Checks whether the browser/device supports native file sharing via Web Share API
 */
export function canSharePdfFile(file) {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }
  if (typeof navigator.canShare === "function") {
    try {
      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Generates an identical A4 PDF File object from a DOM element using html2canvas & jsPDF.
 * Lazy-loads libraries on-demand so initial page bundles remain lightweight.
 */
export async function generatePdfFromFileElement(domElement, filename = "document.pdf") {
  if (!domElement) {
    throw new Error("Target DOM element not found for PDF generation.");
  }

  // Ensure all images (logos, flourishes) inside the DOM are loaded
  const images = Array.from(domElement.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 800); // safety fallback timeout
      });
    })
  );

  // Lazy load dependencies
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Capture element to canvas at scale 2 for crisp 192 DPI print quality
  const canvas = await html2canvas(domElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: 794,
    windowWidth: 794,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.96);

  // Initialize jsPDF with standard A4 dimensions (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

  const blob = pdf.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });

  return { blob, file };
}

/**
 * Triggers a browser download of a File or Blob
 */
export function triggerFileDownload(fileOrBlob, filename = "document.pdf") {
  if (typeof window === "undefined" || !fileOrBlob) return;
  const url = URL.createObjectURL(fileOrBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
