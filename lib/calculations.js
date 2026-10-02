/**
 * Umesh Fencing Works - Mathematical & GST Logic
 * State Code: 37 (Andhra Pradesh)
 */

export const AP_STATE_CODE = "37";
export const AP_STATE_NAME = "Andhra Pradesh";

/**
 * Extracts state code from a GSTIN string.
 * GSTIN format: 2 digits (state code) + 10 chars PAN + 1 entity num + 1 'Z' + 1 check digit.
 * e.g., 37AMQPU6044G1ZH -> 37
 */
export function extractStateCode(gstin) {
  if (!gstin || typeof gstin !== "string") return AP_STATE_CODE;
  const clean = gstin.trim().toUpperCase();
  if (clean.length >= 2 && /^\d{2}/.test(clean)) {
    return clean.substring(0, 2);
  }
  return AP_STATE_CODE;
}

/**
 * Determine if intra-state transaction for Andhra Pradesh (State 37)
 */
export function isIntraStateTransaction(customerStateCode) {
  if (!customerStateCode) return true;
  return String(customerStateCode).trim() === AP_STATE_CODE;
}

/**
 * Calculate totals for line items and document
 * @param {Array} items - List of items with { description, hsn, qty, unit, rate, discount, taxRate }
 * @param {string} customerStateCode - Customer's 2-digit state code
 */
export function calculateDocumentTotals(items = [], customerStateCode = AP_STATE_CODE) {
  const isIntraState = isIntraStateTransaction(customerStateCode);

  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const processedItems = items.map((item, index) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0; // e.g. 18 for 18%

    const rawTotal = Number((qty * rate).toFixed(2));
    const itemTaxable = Math.max(0, Number((rawTotal - discount).toFixed(2)));

    let itemCgst = 0;
    let itemSgst = 0;
    let itemIgst = 0;

    if (isIntraState) {
      itemCgst = Number(((itemTaxable * taxRate) / 200).toFixed(2));
      itemSgst = Number(((itemTaxable * taxRate) / 200).toFixed(2));
      itemIgst = 0;
    } else {
      itemCgst = 0;
      itemSgst = 0;
      itemIgst = Number(((itemTaxable * taxRate) / 100).toFixed(2));
    }

    const itemTotalTax = Number((itemCgst + itemSgst + itemIgst).toFixed(2));
    const itemTotal = Number((itemTaxable + itemTotalTax).toFixed(2));

    subtotal = Number((subtotal + rawTotal).toFixed(2));
    totalDiscount = Number((totalDiscount + discount).toFixed(2));
    taxableAmount = Number((taxableAmount + itemTaxable).toFixed(2));
    cgst = Number((cgst + itemCgst).toFixed(2));
    sgst = Number((sgst + itemSgst).toFixed(2));
    igst = Number((igst + itemIgst).toFixed(2));

    return {
      itemIndex: index + 1,
      description: item.description || "",
      hsn: item.hsn || "7314", // default HSN for fencing chain link / wire
      qty,
      unit: item.unit || "Mtrs",
      rate,
      discount,
      taxRate,
      taxableValue: Number(itemTaxable.toFixed(2)),
      cgst: itemCgst,
      sgst: itemSgst,
      igst: itemIgst,
      totalTax: itemTotalTax,
      total: itemTotal,
    };
  });

  const totalTax = Number((cgst + sgst + igst).toFixed(2));
  const exactTotal = Number((taxableAmount + totalTax).toFixed(2));
  const grandTotal = Math.round(exactTotal);
  const roundOff = Number((grandTotal - exactTotal).toFixed(2));

  return {
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    totalTax,
    roundOff,
    grandTotal,
    amountInWords: numberToIndianWords(grandTotal),
    isIntraState,
  };
}

/**
 * Format currency in Indian Numbering System: ₹ 1,45,200.00
 */
export function formatINR(val, includeSymbol = true) {
  const num = Number(val) || 0;
  const normalizedNum = Math.abs(num) < 0.00001 ? 0 : num;
  const formatted = normalizedNum.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Convert number to words according to Indian currency numbering system.
 * (Crore, Lakh, Thousand, Hundred)
 */
export function numberToIndianWords(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return "Rupees Zero Only";
  if (n < 0) return "Minus " + numberToIndianWords(Math.abs(n));

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertTwoDigits(val) {
    if (val < 20) return units[val];
    const ten = Math.floor(val / 10);
    const unit = val % 10;
    return tens[ten] + (unit !== 0 ? " " + units[unit] : "");
  }

  function convertThreeDigits(val) {
    const hundred = Math.floor(val / 100);
    const remainder = val % 100;
    let str = "";
    if (hundred > 0) {
      str += units[hundred] + " Hundred";
      if (remainder > 0) str += " and ";
    }
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str;
  }

  let words = "";

  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = rem;

  if (crore > 0) {
    words += convertTwoDigits(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    words += convertThreeDigits(hundred) + " ";
  }

  return "Rupees " + words.trim() + " Only";
}

/**
 * Format document sequence number
 * @param {string} prefix 'UFW-INV' or 'UFW-BILL'
 * @param {number} seq 1, 2, ...
 */
export function formatSequenceNumber(prefix, seq) {
  const padded = String(seq).padStart(4, "0");
  return `${prefix}-${padded}`;
}

/**
 * Complete official GST State Directory of India (States & Union Territories)
 */
export const INDIAN_STATES = [
  { code: "37", name: "Andhra Pradesh" },
  { code: "29", name: "Karnataka" },
  { code: "36", name: "Telangana" },
  { code: "33", name: "Tamil Nadu" },
  { code: "32", name: "Kerala" },
  { code: "27", name: "Maharashtra" },
  { code: "30", name: "Goa" },
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "31", name: "Lakshadweep" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

/**
 * Standard business identity constants
 */
export const BUSINESS_DETAILS = {
  name: "Umesh Fencing Works",
  tagline: "Invoice & Billing Ledger (Chainlink, Barbed Wire, Concrete Poles & Solar Fencing)",
  proprietor: "C. Umesh",
  gstin: "37AMQPU6044G1ZH",
  state: "Andhra Pradesh",
  stateCode: "37",
  address: "Plot No 5 Ground Floor Door:2-1-164; Sy No133/7 Rachanapalle Ananthapuramu",
  phone: "+91 94408 57111",
  email: "umeshfencingworks@gmail.com",
  bank: {
    name: "Union Bank of India",
    accountName: "Umesh fencing works",
    accountNumber: "128511010000221",
    ifsc: "UBIN0812854",
    branch: "Georgepet",
  },
  terms: [
    "Goods once sold will not be taken back or exchanged.",
    "Interest @ 18% p.a. will be charged if payment is not made within the due date.",
  ],
};
