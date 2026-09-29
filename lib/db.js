import { BUSINESS_DETAILS, calculateDocumentTotals, formatSequenceNumber, AP_STATE_CODE, formatINR } from "./calculations";
import {
  syncDocumentToFirestore,
  deleteDocumentFromFirestore,
  syncCustomerToFirestore,
  deleteCustomerFromFirestore,
  syncPaymentToFirestore,
  deletePaymentFromFirestore,
  syncAuditLogToFirestore,
  seedFirestoreWithDemoData,
} from "./firebase";

const DB_NAME = "ufw_next_business_db";
const DB_VERSION = 1;
const STORAGE_PREFIX = "ufw_v1_";

// Initial Seed Dataset
export const INITIAL_SEED_DATA = {
  customers: [
    {
      id: "CUST-001",
      name: "B. Ramesh Babu",
      company: "Sri Balaji Agro Farms & Infrastructure",
      phone: "+91 98490 12345",
      email: "balajiagro.atp@gmail.com",
      gstin: "37AAACB4512C1Z8",
      billingAddress: "Plot No. 14, Industrial Estate, Bellary Road, Anantapur",
      shippingAddress: "Farm Site Phase 2, Bukkarayasamudram Mandal, Anantapur",
      state: "Andhra Pradesh",
      stateCode: "37",
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "CUST-002",
      name: "S. K. Kulkarni",
      company: "Deccan Solar Energy Projects Pvt Ltd",
      phone: "+91 99801 87654",
      email: "procurement@deccansolar.in",
      gstin: "29AAACD9876D1Z2",
      billingAddress: "4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka",
      shippingAddress: "Solar Substation Campus, Dharmavaram Highway, AP",
      state: "Karnataka",
      stateCode: "29",
      createdAt: "2026-09-05T11:30:00.000Z",
      updatedAt: "2026-09-05T11:30:00.000Z",
    },
    {
      id: "CUST-003",
      name: "M. Somasekhar Reddy",
      company: "Rayalaseema Stone Crushers & Quarries",
      phone: "+91 94411 55667",
      email: "rayalaseemastone@outlook.com",
      gstin: "37BCDE1234F1Z3",
      billingAddress: "NH-44 Bypass, Gooty Road, Anantapur",
      shippingAddress: "Quarry Zone 3, Near HLC Canal, Anantapur",
      state: "Andhra Pradesh",
      stateCode: "37",
      createdAt: "2026-09-12T09:15:00.000Z",
      updatedAt: "2026-09-12T09:15:00.000Z",
    },
  ],
  documents: [
    {
      id: "DOC-INV-0001",
      documentType: "invoice",
      documentNumber: "UFW-INV-0001",
      customerId: "CUST-001",
      customerSnapshot: {
        id: "CUST-001",
        name: "B. Ramesh Babu",
        company: "Sri Balaji Agro Farms & Infrastructure",
        phone: "+91 98490 12345",
        email: "balajiagro.atp@gmail.com",
        gstin: "37AAACB4512C1Z8",
        billingAddress: "Plot No. 14, Industrial Estate, Bellary Road, Anantapur",
        shippingAddress: "Farm Site Phase 2, Bukkarayasamudram Mandal, Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      businessSnapshot: BUSINESS_DETAILS,
      items: [
        {
          itemIndex: 1,
          description: "Heavy Duty GI Chainlink Fencing (3-inch x 8 Gauge)",
          hsn: "7314",
          qty: 600,
          unit: "Mtrs",
          rate: 160,
          discount: 2000,
          taxRate: 18,
          taxableValue: 94000,
          cgst: 8460,
          sgst: 8460,
          igst: 0,
          totalTax: 16920,
          total: 110920,
        },
        {
          itemIndex: 2,
          description: "Galvanized High Tensile Angle Iron Posts (6.5 ft)",
          hsn: "7308",
          qty: 70,
          unit: "Nos",
          rate: 420,
          discount: 500,
          taxRate: 18,
          taxableValue: 28900,
          cgst: 2601,
          sgst: 2601,
          igst: 0,
          totalTax: 5202,
          total: 34102,
        },
      ],
      subtotal: 125400,
      totalDiscount: 2500,
      taxableAmount: 122900,
      cgst: 11061,
      sgst: 11061,
      igst: 0,
      totalTax: 22122,
      roundOff: -0.02,
      grandTotal: 145022,
      amountInWords: "Rupees One Lakh Forty-Five Thousand Twenty-Two Only",
      totalPaid: 100000,
      balanceDue: 45022,
      paymentStatus: "partially_paid",
      status: "active",
      issueDate: "2026-09-02",
      dueDate: "2026-09-17",
      paymentMethod: "Bank Transfer",
      placeOfSupply: "Andhra Pradesh (37)",
      vehicleNumber: "AP 02 TC 8812",
      ewayBillNumber: "341890217645",
      notes: "Material dispatched with inspection certificate. 1-year galvanization warranty.",
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-02T11:00:00.000Z",
    },
    {
      id: "DOC-INV-0002",
      documentType: "invoice",
      documentNumber: "UFW-INV-0002",
      customerId: "CUST-002",
      customerSnapshot: {
        id: "CUST-002",
        name: "S. K. Kulkarni",
        company: "Deccan Solar Energy Projects Pvt Ltd",
        phone: "+91 99801 87654",
        email: "procurement@deccansolar.in",
        gstin: "29AAACD9876D1Z2",
        billingAddress: "4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka",
        shippingAddress: "Solar Substation Campus, Dharmavaram Highway, AP",
        state: "Karnataka",
        stateCode: "29",
      },
      businessSnapshot: BUSINESS_DETAILS,
      items: [
        {
          itemIndex: 1,
          description: "High-Tensile Solar Perimeter Barbed Wire (2.5mm Hot Dip)",
          hsn: "7313",
          qty: 1200,
          unit: "Mtrs",
          rate: 140,
          discount: 5000,
          taxRate: 18,
          taxableValue: 163000,
          cgst: 0,
          sgst: 0,
          igst: 29340,
          totalTax: 29340,
          total: 192340,
        },
        {
          itemIndex: 2,
          description: "Heavy Industrial Security Razor Spike Coils",
          hsn: "7314",
          qty: 40,
          unit: "Nos",
          rate: 1850,
          discount: 0,
          taxRate: 18,
          taxableValue: 74000,
          cgst: 0,
          sgst: 0,
          igst: 13320,
          totalTax: 13320,
          total: 87320,
        },
      ],
      subtotal: 242000,
      totalDiscount: 5000,
      taxableAmount: 237000,
      cgst: 0,
      sgst: 0,
      igst: 42660,
      totalTax: 42660,
      roundOff: 0,
      grandTotal: 279660,
      amountInWords: "Rupees Two Lakh Seventy-Nine Thousand Six Hundred Sixty Only",
      totalPaid: 279660,
      balanceDue: 0,
      paymentStatus: "paid",
      status: "active",
      issueDate: "2026-09-08",
      dueDate: "2026-09-23",
      paymentMethod: "RTGS",
      placeOfSupply: "Karnataka (29)",
      vehicleNumber: "KA 01 MG 4421",
      ewayBillNumber: "389104882190",
      notes: "Full advance settlement via RTGS. Materials approved by Solar Tech Lead.",
      createdAt: "2026-09-08T14:20:00.000Z",
      updatedAt: "2026-09-08T14:20:00.000Z",
    },
    {
      id: "DOC-INV-0003",
      documentType: "invoice",
      documentNumber: "UFW-INV-0003",
      customerId: "CUST-003",
      customerSnapshot: {
        id: "CUST-003",
        name: "M. Somasekhar Reddy",
        company: "Rayalaseema Stone Crushers & Quarries",
        phone: "+91 94411 55667",
        email: "rayalaseemastone@outlook.com",
        gstin: "37BCDE1234F1Z3",
        billingAddress: "NH-44 Bypass, Gooty Road, Anantapur",
        shippingAddress: "Quarry Zone 3, Near HLC Canal, Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      businessSnapshot: BUSINESS_DETAILS,
      items: [
        {
          itemIndex: 1,
          description: "Heavy Galvanized Barbed Wire (12x14 Gauge 2-Ply)",
          hsn: "7313",
          qty: 500,
          unit: "Kg",
          rate: 110,
          discount: 1000,
          taxRate: 18,
          taxableValue: 54000,
          cgst: 4860,
          sgst: 4860,
          igst: 0,
          totalTax: 9720,
          total: 63720,
        },
        {
          itemIndex: 2,
          description: "Prestressed Concrete Fencing Poles (7 ft x 4x4 inch)",
          hsn: "6810",
          qty: 80,
          unit: "Nos",
          rate: 350,
          discount: 0,
          taxRate: 18,
          taxableValue: 28000,
          cgst: 2520,
          sgst: 2520,
          igst: 0,
          totalTax: 5040,
          total: 33040,
        },
      ],
      subtotal: 83000,
      totalDiscount: 1000,
      taxableAmount: 82000,
      cgst: 7380,
      sgst: 7380,
      igst: 0,
      totalTax: 14760,
      roundOff: 0,
      grandTotal: 96760,
      amountInWords: "Rupees Ninety-Six Thousand Seven Hundred Sixty Only",
      totalPaid: 0,
      balanceDue: 96760,
      paymentStatus: "unpaid",
      status: "active",
      issueDate: "2026-09-14",
      dueDate: "2026-09-29",
      paymentMethod: "Credit",
      placeOfSupply: "Andhra Pradesh (37)",
      vehicleNumber: "AP 02 Z 9910",
      ewayBillNumber: "392019481102",
      notes: "Payment due within 15 days of material delivery at crusher site.",
      createdAt: "2026-09-14T16:00:00.000Z",
      updatedAt: "2026-09-14T16:00:00.000Z",
    },
    // Sample Retail Bills
    {
      id: "DOC-BILL-0001",
      documentType: "bill",
      documentNumber: "UFW-BILL-0001",
      customerId: "WALK-IN",
      customerSnapshot: {
        id: "WALK-IN",
        name: "Ramesh Naidu (Farmer)",
        company: "Direct Farm Purchase",
        phone: "+91 97011 44552",
        email: "",
        gstin: "",
        billingAddress: "Bukkarayasamudram Village, Anantapur",
        shippingAddress: "Bukkarayasamudram Village, Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      businessSnapshot: BUSINESS_DETAILS,
      items: [
        {
          itemIndex: 1,
          description: "Barbed Wire 12x14g Heavy Roll (40kg bundle)",
          hsn: "7313",
          qty: 2,
          unit: "Bundles",
          rate: 3800,
          discount: 200,
          taxRate: 18,
          taxableValue: 7400,
          cgst: 666,
          sgst: 666,
          igst: 0,
          totalTax: 1332,
          total: 8732,
        },
      ],
      subtotal: 7600,
      totalDiscount: 200,
      taxableAmount: 7400,
      cgst: 666,
      sgst: 666,
      igst: 0,
      totalTax: 1332,
      roundOff: 0,
      grandTotal: 8732,
      amountInWords: "Rupees Eight Thousand Seven Hundred Thirty-Two Only",
      totalPaid: 8732,
      balanceDue: 0,
      paymentStatus: "paid",
      status: "active",
      issueDate: "2026-09-15",
      dueDate: "2026-09-15",
      paymentMethod: "Cash",
      placeOfSupply: "Andhra Pradesh (37)",
      vehicleNumber: "Auto AP 02 V 1290",
      notes: "Cash counter delivery. Full cash received at counter.",
      createdAt: "2026-09-15T09:30:00.000Z",
      updatedAt: "2026-09-15T09:30:00.000Z",
    },
    {
      id: "DOC-BILL-0002",
      documentType: "bill",
      documentNumber: "UFW-BILL-0002",
      customerId: "WALK-IN",
      customerSnapshot: {
        id: "WALK-IN",
        name: "Venkat Reddy Orchard",
        company: "Venkat Pomegranate Farm",
        phone: "+91 94902 33119",
        email: "",
        gstin: "",
        billingAddress: "Kudair Road, Anantapur",
        shippingAddress: "Kudair Road, Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      businessSnapshot: BUSINESS_DETAILS,
      items: [
        {
          itemIndex: 1,
          description: "GI Chainlink Mesh 4ft Roll (50 Meters)",
          hsn: "7314",
          qty: 2,
          unit: "Rolls",
          rate: 7000,
          discount: 500,
          taxRate: 18,
          taxableValue: 13500,
          cgst: 1215,
          sgst: 1215,
          igst: 0,
          totalTax: 2430,
          total: 15930,
        },
      ],
      subtotal: 14000,
      totalDiscount: 500,
      taxableAmount: 13500,
      cgst: 1215,
      sgst: 1215,
      igst: 0,
      totalTax: 2430,
      roundOff: 0,
      grandTotal: 15930,
      amountInWords: "Rupees Fifteen Thousand Nine Hundred Thirty Only",
      totalPaid: 15930,
      balanceDue: 0,
      paymentStatus: "paid",
      status: "active",
      issueDate: "2026-09-18",
      dueDate: "2026-09-18",
      paymentMethod: "UPI",
      placeOfSupply: "Andhra Pradesh (37)",
      notes: "Settled via PhonePe UPI at factory counter.",
      createdAt: "2026-09-18T12:00:00.000Z",
      updatedAt: "2026-09-18T12:00:00.000Z",
    },
    {
      id: "DOC-BILL-0003",
      documentType: "bill",
      documentNumber: "UFW-BILL-0003",
      customerId: "WALK-IN",
      customerSnapshot: {
        id: "WALK-IN",
        name: "Anjaneyulu",
        company: "Site Construction Works",
        phone: "+91 91218 77650",
        email: "",
        gstin: "",
        billingAddress: "Rapthadu, Anantapur",
        shippingAddress: "Rapthadu, Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      businessSnapshot: BUSINESS_DETAILS,
      items: [
        {
          itemIndex: 1,
          description: "Concrete Boundary Posts (6 ft)",
          hsn: "6810",
          qty: 25,
          unit: "Nos",
          rate: 320,
          discount: 200,
          taxRate: 18,
          taxableValue: 7800,
          cgst: 702,
          sgst: 702,
          igst: 0,
          totalTax: 1404,
          total: 9204,
        },
      ],
      subtotal: 8000,
      totalDiscount: 200,
      taxableAmount: 7800,
      cgst: 702,
      sgst: 702,
      igst: 0,
      totalTax: 1404,
      roundOff: 0,
      grandTotal: 9204,
      amountInWords: "Rupees Nine Thousand Two Hundred Four Only",
      totalPaid: 9204,
      balanceDue: 0,
      paymentStatus: "paid",
      status: "active",
      issueDate: "2026-09-20",
      dueDate: "2026-09-20",
      paymentMethod: "UPI",
      placeOfSupply: "Andhra Pradesh (37)",
      notes: "Immediate counter pickup on tractor trolley.",
      createdAt: "2026-09-20T15:45:00.000Z",
      updatedAt: "2026-09-20T15:45:00.000Z",
    },
  ],
  payments: [
    {
      id: "PAY-001",
      documentId: "DOC-INV-0001",
      documentNumber: "UFW-INV-0001",
      documentType: "invoice",
      customerId: "CUST-001",
      customerName: "Sri Balaji Agro Farms & Infrastructure",
      amount: 100000,
      paymentDate: "2026-09-03",
      paymentMethod: "Bank Transfer",
      referenceNumber: "UBIN2026090123445",
      notes: "Part payment credited into Union Bank A/C",
      createdAt: "2026-09-03T11:30:00.000Z",
    },
    {
      id: "PAY-002",
      documentId: "DOC-INV-0002",
      documentNumber: "UFW-INV-0002",
      documentType: "invoice",
      customerId: "CUST-002",
      customerName: "Deccan Solar Energy Projects Pvt Ltd",
      amount: 279660,
      paymentDate: "2026-09-08",
      paymentMethod: "RTGS",
      referenceNumber: "HDFC2026091098761",
      notes: "Full settlement prior to trailer dispatch",
      createdAt: "2026-09-08T15:00:00.000Z",
    },
    {
      id: "PAY-003",
      documentId: "DOC-BILL-0002",
      documentNumber: "UFW-BILL-0002",
      documentType: "bill",
      customerId: "WALK-IN",
      customerName: "Venkat Reddy Orchard",
      amount: 15930,
      paymentDate: "2026-09-18",
      paymentMethod: "UPI",
      referenceNumber: "UPI/628911029410",
      notes: "Counter QR scan payment received",
      createdAt: "2026-09-18T12:05:00.000Z",
    },
  ],
  counters: {
    invoices: { id: "invoices", current: 3, prefix: "UFW-INV", updatedAt: "2026-09-14T16:00:00.000Z" },
    bills: { id: "bills", current: 3, prefix: "UFW-BILL", updatedAt: "2026-09-20T15:45:00.000Z" },
  },
  auditLogs: [
    {
      id: "AUD-001",
      timestamp: "2026-09-01T10:00:00.000Z",
      action: "CUSTOMER_CREATED",
      entityType: "customer",
      entityId: "CUST-001",
      entityNumber: "CUST-001",
      details: "Customer Sri Balaji Agro Farms registered with GSTIN 37AAACB4512C1Z8",
      user: "Admin (B. Umesh)",
    },
    {
      id: "AUD-002",
      timestamp: "2026-09-02T11:00:00.000Z",
      action: "INVOICE_GENERATED",
      entityType: "document",
      entityId: "DOC-INV-0001",
      entityNumber: "UFW-INV-0001",
      details: "Tax invoice generated for ₹1,45,022.00 (Customer: Sri Balaji Agro Farms)",
      user: "Admin (B. Umesh)",
    },
    {
      id: "AUD-003",
      timestamp: "2026-09-03T11:30:00.000Z",
      action: "PAYMENT_RECORDED",
      entityType: "payment",
      entityId: "PAY-001",
      entityNumber: "UFW-INV-0001",
      details: "Payment of ₹1,00,000 received via Bank Transfer (Ref: UBIN2026090123445)",
      user: "Admin (B. Umesh)",
    },
  ],
};

// In-Memory Storage Cache for 0ms reads
let memoryCache = {
  customers: [...INITIAL_SEED_DATA.customers],
  documents: [...INITIAL_SEED_DATA.documents],
  payments: [...INITIAL_SEED_DATA.payments],
  counters: { ...INITIAL_SEED_DATA.counters },
  auditLogs: [...INITIAL_SEED_DATA.auditLogs],
};

let isInitialized = false;

// Event listeners for reactive UI updates
const subscribers = new Set();
export function subscribeToDb(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error("Subscriber notification error:", err);
    }
  });
}

// Browser LocalStorage helpers
export function saveToLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + "documents", JSON.stringify(memoryCache.documents));
    localStorage.setItem(STORAGE_PREFIX + "customers", JSON.stringify(memoryCache.customers));
    localStorage.setItem(STORAGE_PREFIX + "payments", JSON.stringify(memoryCache.payments));
    localStorage.setItem(STORAGE_PREFIX + "counters", JSON.stringify(memoryCache.counters));
    localStorage.setItem(STORAGE_PREFIX + "auditLogs", JSON.stringify(memoryCache.auditLogs));
  } catch (err) {
    console.warn("[Local Storage] Error writing to localStorage:", err);
  }
}

export function loadFromLocalStorage() {
  if (typeof window === "undefined") return false;
  try {
    const rawDocs = localStorage.getItem(STORAGE_PREFIX + "documents");
    const rawCust = localStorage.getItem(STORAGE_PREFIX + "customers");
    const rawPay = localStorage.getItem(STORAGE_PREFIX + "payments");
    const rawCount = localStorage.getItem(STORAGE_PREFIX + "counters");
    const rawAudit = localStorage.getItem(STORAGE_PREFIX + "auditLogs");

    let loaded = false;
    if (rawDocs !== null) {
      try {
        const parsed = JSON.parse(rawDocs);
        if (Array.isArray(parsed)) {
          memoryCache.documents = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    if (rawCust !== null) {
      try {
        const parsed = JSON.parse(rawCust);
        if (Array.isArray(parsed)) {
          memoryCache.customers = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    if (rawPay !== null) {
      try {
        const parsed = JSON.parse(rawPay);
        if (Array.isArray(parsed)) {
          memoryCache.payments = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    if (rawCount !== null) {
      try {
        const parsed = JSON.parse(rawCount);
        if (parsed && typeof parsed === "object") {
          memoryCache.counters = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    if (rawAudit !== null) {
      try {
        const parsed = JSON.parse(rawAudit);
        if (Array.isArray(parsed)) {
          memoryCache.auditLogs = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    return loaded;
  } catch (err) {
    console.warn("[Local Storage] Error reading from localStorage:", err);
  }
  return false;
}

// Hydrate immediately on module evaluation in client
if (typeof window !== "undefined") {
  loadFromLocalStorage();
}

// Browser IndexedDB helpers
export async function openIndexedDB() {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const idb = e.target.result;
        ["customers", "documents", "payments", "counters", "auditLogs"].forEach((store) => {
          if (!idb.objectStoreNames.contains(store)) {
            idb.createObjectStore(store, { keyPath: "id" });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function persistToIndexedDB(storeName, items) {
  if (typeof window === "undefined") return;
  try {
    const idb = await openIndexedDB();
    if (!idb) return;
    const tx = idb.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    const arr = Array.isArray(items) ? items : Object.values(items);
    arr.forEach((it) => {
      if (it && it.id) store.put(it);
    });
  } catch (err) {
    // Non-fatal fallback
  }
}

export async function loadFromIndexedDB(idb) {
  if (!idb) return false;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(["customers", "documents", "payments", "counters", "auditLogs"], "readonly");
      const docReq = tx.objectStore("documents").getAll();
      const custReq = tx.objectStore("customers").getAll();
      const payReq = tx.objectStore("payments").getAll();
      const countReq = tx.objectStore("counters").getAll();
      const auditReq = tx.objectStore("auditLogs").getAll();

      tx.oncomplete = () => {
        if (docReq.result && docReq.result.length > 0) {
          memoryCache.documents = docReq.result;
        }
        if (custReq.result && custReq.result.length > 0) {
          memoryCache.customers = custReq.result;
        }
        if (payReq.result && payReq.result.length > 0) {
          memoryCache.payments = payReq.result;
        }
        if (countReq.result && countReq.result.length > 0) {
          const cMap = {};
          countReq.result.forEach((c) => {
            if (c && c.id) cMap[c.id] = c;
          });
          memoryCache.counters = { ...memoryCache.counters, ...cMap };
        }
        if (auditReq.result && auditReq.result.length > 0) {
          memoryCache.auditLogs = auditReq.result;
        }
        saveToLocalStorage();
        resolve(true);
      };
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// Initialize Database on client startup with instant local load
export async function initializeDatabase() {
  if (typeof window === "undefined") return;

  // 1. Instant local restore (0ms response, works offline)
  loadFromLocalStorage();

  // 2. Check IndexedDB if localStorage was empty
  try {
    const idb = await openIndexedDB();
    if (idb && memoryCache.documents.length === 0) {
      await loadFromIndexedDB(idb);
    }
  } catch (e) {
    // Non-fatal
  }

  // 3. If fresh install and not intentionally zeroed out, seed initial business records
  if (
    typeof window !== "undefined" &&
    memoryCache.documents.length === 0 &&
    localStorage.getItem(STORAGE_PREFIX + "zeroed") !== "true"
  ) {
    memoryCache = {
      customers: [...INITIAL_SEED_DATA.customers],
      documents: [...INITIAL_SEED_DATA.documents],
      payments: [...INITIAL_SEED_DATA.payments],
      counters: { ...INITIAL_SEED_DATA.counters },
      auditLogs: [...INITIAL_SEED_DATA.auditLogs],
    };
    saveToLocalStorage();
    persistToIndexedDB("documents", memoryCache.documents);
    persistToIndexedDB("customers", memoryCache.customers);
    persistToIndexedDB("payments", memoryCache.payments);
    persistToIndexedDB("counters", Object.values(memoryCache.counters));
    persistToIndexedDB("auditLogs", memoryCache.auditLogs);
  }

  isInitialized = true;
  notifySubscribers();
}

export async function seedInitialDataset() {
  memoryCache = {
    customers: [...INITIAL_SEED_DATA.customers],
    documents: [...INITIAL_SEED_DATA.documents],
    payments: [...INITIAL_SEED_DATA.payments],
    counters: { ...INITIAL_SEED_DATA.counters },
    auditLogs: [...INITIAL_SEED_DATA.auditLogs],
  };
  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("customers", memoryCache.customers);
  persistToIndexedDB("payments", memoryCache.payments);
  persistToIndexedDB("counters", Object.values(memoryCache.counters));
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);
  notifySubscribers();
  return { success: true };
}

// ==========================================
// SYNCHRONOUS GETTERS (0ms reads)
// ==========================================

export function getDocumentsSync(typeFilter = null) {
  if (!typeFilter) return [...memoryCache.documents];
  return memoryCache.documents.filter((d) => d.documentType === typeFilter);
}

export function getDocumentByIdSync(id) {
  if (!id) return null;
  return memoryCache.documents.find((d) => d.id === id || d.documentNumber === id) || null;
}

export function getCustomersSync() {
  return [...memoryCache.customers];
}

export function getCustomerByIdSync(id) {
  if (!id) return null;
  return memoryCache.customers.find((c) => c.id === id) || null;
}

export function getCustomersWithStatsSync() {
  const custMap = {};
  memoryCache.customers.forEach((c) => {
    custMap[c.id] = {
      ...c,
      totalInvoices: 0,
      totalBills: 0,
      lifetimeRevenue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      lastOrderDate: null,
    };
  });

  memoryCache.documents.forEach((doc) => {
    if (doc.status === "void") return;
    const cid = doc.customerId;
    if (custMap[cid]) {
      if (doc.documentType === "invoice") custMap[cid].totalInvoices++;
      if (doc.documentType === "bill") custMap[cid].totalBills++;
      custMap[cid].lifetimeRevenue += Number(doc.grandTotal) || 0;
      custMap[cid].totalPaid += Number(doc.totalPaid) || 0;
      custMap[cid].totalOutstanding += Number(doc.balanceDue) || 0;
      if (!custMap[cid].lastOrderDate || doc.issueDate > custMap[cid].lastOrderDate) {
        custMap[cid].lastOrderDate = doc.issueDate;
      }
    }
  });

  return Object.values(custMap);
}

export function getAllPaymentsSync() {
  return [...memoryCache.payments];
}

export function getPaymentsByDocumentIdSync(documentId) {
  return memoryCache.payments.filter((p) => p.documentId === documentId);
}

export function getAuditLogsSync() {
  return [...memoryCache.auditLogs];
}

export function getUnifiedFinancialLedgerSync() {
  const entries = [];

  memoryCache.documents.forEach((doc) => {
    if (doc.status === "void") return;
    entries.push({
      id: `LED-DOC-${doc.id}`,
      date: doc.issueDate,
      timestamp: doc.createdAt,
      entityType: doc.documentType === "invoice" ? "GST Tax Invoice" : "Retail Counter Bill",
      referenceNumber: doc.documentNumber,
      partyName: doc.customerSnapshot?.company || doc.customerSnapshot?.name || "Counter Customer",
      partyId: doc.customerId,
      debit: Number(doc.grandTotal) || 0,
      credit: 0,
      paymentMethod: doc.paymentMethod || "Invoice Credit",
      notes: `${doc.documentType === "invoice" ? "B2B Dispatch" : "Retail Sale"} • GSTIN: ${doc.customerSnapshot?.gstin || "Unregistered"}`,
      docRef: doc,
    });
  });

  memoryCache.payments.forEach((pay) => {
    entries.push({
      id: `LED-PAY-${pay.id}`,
      date: pay.paymentDate,
      timestamp: pay.createdAt,
      entityType: "Payment Inflow",
      referenceNumber: pay.documentNumber || pay.id,
      partyName: pay.customerName || "Customer",
      partyId: pay.customerId,
      debit: 0,
      credit: Number(pay.amount) || 0,
      paymentMethod: pay.paymentMethod || "Direct Settlement",
      notes: `Receipt #${pay.id} • UTR/Ref: ${pay.referenceNumber || "Verified at Desk"}`,
      payRef: pay,
    });
  });

  entries.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
  return entries;
}

export function getDashboardMetricsSync() {
  const activeDocs = memoryCache.documents.filter((d) => d.status !== "void");

  let totalRevenue = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let totalTax = 0;
  let invoiceCount = 0;
  let billCount = 0;
  let overdueCount = 0;

  const today = new Date().toISOString().split("T")[0];

  activeDocs.forEach((d) => {
    const grand = Number(d.grandTotal) || 0;
    const paid = Number(d.totalPaid) || 0;
    const bal = Number(d.balanceDue) || 0;
    const tax = Number(d.totalTax) || 0;

    totalRevenue += grand;
    totalPaid += paid;
    totalOutstanding += bal;
    totalTax += tax;

    if (d.documentType === "invoice") invoiceCount++;
    if (d.documentType === "bill") billCount++;

    if (bal > 0 && d.dueDate && d.dueDate < today) {
      overdueCount++;
    }
  });

  const collectionRate = totalRevenue > 0 ? Number(((totalPaid / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    totalRevenue,
    totalPaid,
    totalOutstanding,
    totalTax,
    invoiceCount,
    billCount,
    overdueCount,
    collectionRate,
  };
}

export async function getNextDocumentNumber(type) {
  const isInvoice = type === "invoice";
  const counterKey = isInvoice ? "invoices" : "bills";
  const prefix = isInvoice ? "UFW-INV" : "UFW-BILL";
  const current = memoryCache.counters[counterKey]?.current || 0;
  return formatSequenceNumber(prefix, current + 1);
}

// ==========================================
// WRITE OPERATIONS (Instant Local Persistence)
// ==========================================

export async function saveDocument(docData) {
  const isInvoice = docData.documentType === "invoice";
  const counterKey = isInvoice ? "invoices" : "bills";
  const prefix = isInvoice ? "UFW-INV" : "UFW-BILL";

  let docNumber = docData.documentNumber;
  if (!docNumber) {
    const nextSeq = (memoryCache.counters[counterKey]?.current || 0) + 1;
    docNumber = formatSequenceNumber(prefix, nextSeq);
    memoryCache.counters[counterKey] = {
      id: counterKey,
      current: nextSeq,
      prefix,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const match = docNumber.match(/\d+$/);
    if (match) {
      const numVal = parseInt(match[0], 10);
      if (numVal > (memoryCache.counters[counterKey]?.current || 0)) {
        memoryCache.counters[counterKey] = {
          id: counterKey,
          current: numVal,
          prefix,
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }

  const id = docData.id || `DOC-${prefix.replace("UFW-", "")}-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newDoc = {
    ...docData,
    id,
    documentNumber: docNumber,
    businessSnapshot: docData.businessSnapshot || BUSINESS_DETAILS,
    status: docData.status || "active",
    createdAt: docData.createdAt || now,
    updatedAt: now,
  };

  // 1. Add to documents memory cache
  const existingIdx = memoryCache.documents.findIndex((d) => d.id === id);
  if (existingIdx >= 0) {
    memoryCache.documents[existingIdx] = newDoc;
  } else {
    memoryCache.documents.unshift(newDoc);
  }

  // 2. Create audit log
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: isInvoice ? "INVOICE_GENERATED" : "BILL_GENERATED",
    entityType: "document",
    entityId: id,
    entityNumber: docNumber,
    details: `${isInvoice ? "Tax Invoice" : "Retail Bill"} ${docNumber} saved for ₹${newDoc.grandTotal} (${newDoc.customerSnapshot?.name || "Customer"})`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  // 3. If initial payment was made during creation
  let pay = null;
  if (Number(docData.initialPaymentAmount) > 0) {
    const payId = `PAY-${Date.now().toString().slice(-6)}`;
    pay = {
      id: payId,
      documentId: id,
      documentNumber: docNumber,
      documentType: docData.documentType,
      customerId: newDoc.customerId,
      customerName: newDoc.customerSnapshot?.company || newDoc.customerSnapshot?.name || "Counter Customer",
      amount: Number(docData.initialPaymentAmount),
      paymentDate: newDoc.issueDate,
      paymentMethod: docData.paymentMethod || "Cash",
      referenceNumber: docData.paymentReference || "Direct Point-of-Sale Settlement",
      notes: "Settlement on document creation",
      createdAt: now,
    };
    memoryCache.payments.unshift(pay);
  }

  // 4. Instantly persist to browser storage & notify UI (guarantees 0ms response, never gets stuck)
  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("counters", Object.values(memoryCache.counters));
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);
  if (pay) {
    persistToIndexedDB("payments", memoryCache.payments);
  }

  // 5. Asynchronously sync to Cloud Firestore in background
  syncDocumentToFirestore(newDoc).catch((e) => console.warn("[Firestore] Doc sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Audit sync err:", e));
  if (pay) {
    syncPaymentToFirestore(pay).catch((e) => console.warn("[Firestore] Payment sync err:", e));
  }

  notifySubscribers();
  return newDoc;
}

export async function voidDocument(id, reason = "Voided by administrator") {
  const docObj = memoryCache.documents.find((d) => d.id === id);
  if (!docObj) return null;

  docObj.status = "void";
  docObj.paymentStatus = "void";
  docObj.balanceDue = 0;
  docObj.updatedAt = new Date().toISOString();

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    action: "DOCUMENT_VOIDED",
    entityType: "document",
    entityId: docObj.id,
    entityNumber: docObj.documentNumber,
    details: `Authorized VOID on ${docObj.documentNumber}. Reason: ${reason}`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync void status to Cloud Firestore
  syncDocumentToFirestore(docObj).catch((e) => console.warn("[Firestore] Void doc sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Void audit sync err:", e));

  notifySubscribers();

  return docObj;
}

export async function deleteDocument(id) {
  const docIdx = memoryCache.documents.findIndex((d) => d.id === id);
  if (docIdx === -1) return null;

  const deletedDoc = memoryCache.documents[docIdx];
  memoryCache.documents.splice(docIdx, 1);

  // Remove associated payments
  memoryCache.payments = memoryCache.payments.filter((p) => p.documentId !== id);

  const now = new Date().toISOString();
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "DOCUMENT_DELETED",
    entityType: "document",
    entityId: id,
    entityNumber: deletedDoc.documentNumber,
    details: `Document ${deletedDoc.documentNumber} (${deletedDoc.documentType}) permanently deleted by Admin.`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("payments", memoryCache.payments);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync deletion to Cloud Firestore
  deleteDocumentFromFirestore(id).catch((e) => console.warn("[Firestore] Delete doc sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Delete audit sync err:", e));

  notifySubscribers();

  return deletedDoc;
}

export async function deletePayment(payId) {
  const payIdx = memoryCache.payments.findIndex((p) => p.id === payId);
  if (payIdx === -1) return null;

  const deletedPay = memoryCache.payments[payIdx];
  memoryCache.payments.splice(payIdx, 1);

  // Re-adjust document balance
  const docObj = memoryCache.documents.find((d) => d.id === deletedPay.documentId);
  if (docObj) {
    const currentPaid = Number(docObj.totalPaid) || 0;
    const revertedPaid = Math.max(0, currentPaid - deletedPay.amount);
    const newBalance = Math.max(0, Number(docObj.grandTotal) - revertedPaid);
    docObj.totalPaid = revertedPaid;
    docObj.balanceDue = newBalance;
    docObj.paymentStatus = newBalance === 0 ? "paid" : revertedPaid > 0 ? "partially_paid" : "unpaid";
    docObj.updatedAt = new Date().toISOString();
  }

  const now = new Date().toISOString();
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "PAYMENT_DELETED",
    entityType: "payment",
    entityId: payId,
    entityNumber: deletedPay.documentNumber || payId,
    details: `Payment receipt ${payId} (₹${deletedPay.amount}) deleted. Document balance updated.`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("payments", memoryCache.payments);
  if (docObj) persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync deletion to Cloud Firestore
  deletePaymentFromFirestore(payId).catch((e) => console.warn("[Firestore] Delete payment sync err:", e));
  if (docObj) syncDocumentToFirestore(docObj).catch((e) => console.warn("[Firestore] Doc balance sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Delete pay audit sync err:", e));

  notifySubscribers();

  return deletedPay;
}

export async function deleteCustomer(custId) {
  const custIdx = memoryCache.customers.findIndex((c) => c.id === custId);
  if (custIdx === -1) return null;

  const deletedCust = memoryCache.customers[custIdx];
  memoryCache.customers.splice(custIdx, 1);

  const now = new Date().toISOString();
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "CUSTOMER_DELETED",
    entityType: "customer",
    entityId: custId,
    entityNumber: custId,
    details: `Customer ${deletedCust.company || deletedCust.name} deleted from customer directory.`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("customers", memoryCache.customers);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync customer deletion to Cloud Firestore
  deleteCustomerFromFirestore(custId).catch((e) => console.warn("[Firestore] Delete customer sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Delete cust audit sync err:", e));

  notifySubscribers();

  return deletedCust;
}

export async function saveCustomer(custData) {
  const id = custData.id || `CUST-${Date.now().toString().slice(-5)}`;
  const now = new Date().toISOString();

  const customer = {
    ...custData,
    id,
    createdAt: custData.createdAt || now,
    updatedAt: now,
  };

  const existingIdx = memoryCache.customers.findIndex((c) => c.id === id);
  if (existingIdx >= 0) {
    memoryCache.customers[existingIdx] = customer;
  } else {
    memoryCache.customers.unshift(customer);
  }

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: existingIdx >= 0 ? "CUSTOMER_UPDATED" : "CUSTOMER_CREATED",
    entityType: "customer",
    entityId: id,
    entityNumber: id,
    details: `Customer ${customer.company || customer.name} (GSTIN: ${customer.gstin || "None"}) ${existingIdx >= 0 ? "updated" : "registered"}`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("customers", memoryCache.customers);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync customer to Cloud Firestore
  syncCustomerToFirestore(customer).catch((e) => console.warn("[Firestore] Customer sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Customer audit sync err:", e));

  notifySubscribers();

  return customer;
}

export async function recordPayment(paymentData) {
  const docObj = memoryCache.documents.find((d) => d.id === paymentData.documentId);
  const now = new Date().toISOString();
  const payId = `PAY-${Date.now().toString().slice(-6)}`;
  const amount = Number(paymentData.amount) || 0;

  const payment = {
    id: payId,
    documentId: paymentData.documentId,
    documentNumber: docObj ? docObj.documentNumber : paymentData.documentNumber,
    documentType: docObj ? docObj.documentType : "invoice",
    customerId: docObj ? docObj.customerId : paymentData.customerId,
    customerName: docObj ? (docObj.customerSnapshot?.company || docObj.customerSnapshot?.name) : paymentData.customerName,
    amount,
    paymentDate: paymentData.paymentDate || now.split("T")[0],
    paymentMethod: paymentData.paymentMethod || "UPI",
    referenceNumber: paymentData.referenceNumber || "",
    notes: paymentData.notes || "",
    createdAt: now,
  };

  memoryCache.payments.unshift(payment);

  if (docObj) {
    const newPaid = Number((Number(docObj.totalPaid || 0) + amount).toFixed(2));
    const newBalance = Math.max(0, Number((Number(docObj.grandTotal || 0) - newPaid).toFixed(2)));
    docObj.totalPaid = newPaid;
    docObj.balanceDue = newBalance;
    docObj.paymentStatus = newBalance <= 0 ? "paid" : "partially_paid";
    docObj.updatedAt = now;
  }

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "PAYMENT_RECORDED",
    entityType: "payment",
    entityId: payId,
    entityNumber: docObj ? docObj.documentNumber : "DIRECT",
    details: `Payment of ₹${amount} received via ${payment.paymentMethod} (Ref: ${payment.referenceNumber || "N/A"})`,
    user: "Admin (B. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("payments", memoryCache.payments);
  if (docObj) persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync payment and updated document to Cloud Firestore
  syncPaymentToFirestore(payment).catch((e) => console.warn("[Firestore] Payment sync err:", e));
  if (docObj) syncDocumentToFirestore(docObj).catch((e) => console.warn("[Firestore] Doc payment sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Payment audit sync err:", e));

  notifySubscribers();

  return { payment, document: docObj };
}

/**
 * ZERO OUT PORTAL ENTRIES (Admin Key Required)
 * Wipes local browser storage (memory, localStorage, IndexedDB) to start fresh.
 */
export async function zeroOutPortalEntries({ adminKey, wipeCustomers = false } = {}) {
  if (adminKey !== "admin123") {
    throw new Error("Authorization Failed: Invalid Admin Portal Key.");
  }

  // 1. Zero out local in-memory records
  memoryCache.documents = [];
  memoryCache.payments = [];
  memoryCache.counters = {
    invoices: { id: "invoices", current: 0, prefix: "UFW-INV", updatedAt: new Date().toISOString() },
    bills: { id: "bills", current: 0, prefix: "UFW-BILL", updatedAt: new Date().toISOString() },
  };

  if (wipeCustomers) {
    memoryCache.customers = [];
  }

  const purgeLog = {
    id: `AUD-PURGE-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "PORTAL_ENTRIES_ZEROED",
    entityType: "system",
    entityId: "PORTAL-LOCAL",
    entityNumber: "ZERO-OUT",
    details: `Local portal entries zeroed out by Admin authorization. ${wipeCustomers ? "Customer registry cleared." : "Customer contacts preserved."}`,
    user: "Admin (B. Umesh)",
  };

  memoryCache.auditLogs = [purgeLog];

  // Mark zeroed in localStorage so auto-seed does not re-populate on reload
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PREFIX + "zeroed", "true");
  }

  saveToLocalStorage();

  try {
    const idb = await openIndexedDB();
    if (idb) {
      const storesToClear = ["documents", "payments", "counters", "auditLogs"];
      if (wipeCustomers) storesToClear.push("customers");

      const tx = idb.transaction(storesToClear, "readwrite");
      tx.objectStore("documents").clear();
      tx.objectStore("payments").clear();
      tx.objectStore("counters").clear();
      tx.objectStore("auditLogs").clear();
      if (wipeCustomers) {
        tx.objectStore("customers").clear();
      }

      Object.values(memoryCache.counters).forEach((cnt) => tx.objectStore("counters").put(cnt));
      tx.objectStore("auditLogs").put(purgeLog);
    }
  } catch (err) {
    console.warn("IndexedDB zero-out warning:", err);
  }

  notifySubscribers();

  return {
    success: true,
    message: "Local portal entries have been completely zeroed out.",
  };
}

// ==========================================
// FINANCIAL REPORT EXPORTERS (.csv, .xml, .pdf)
// ==========================================

export function downloadFile(content, filename, mimeType) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * EXPORT FINANCIAL REPORT AS CSV (.csv)
 * Formats full financial ledger, invoices, retail bills, payments, and customer accounts.
 */
export function exportFinancialReportCSV() {
  const now = new Date();
  const metrics = getDashboardMetricsSync();
  const docs = memoryCache.documents || [];
  const pays = memoryCache.payments || [];
  const custStats = getCustomersWithStatsSync();

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [];

  // Title & Metadata
  lines.push("UMESH FENCING WORKS — OFFICIAL FINANCIAL & AUDIT LEDGER REPORT");
  lines.push(`Generated On,${escapeCSV(now.toLocaleString())}`);
  lines.push(`Proprietor,${escapeCSV(BUSINESS_DETAILS.proprietor)}`);
  lines.push(`GSTIN,${escapeCSV(BUSINESS_DETAILS.gstin)}`);
  lines.push(`Jurisdiction,${escapeCSV("Anantapur (Andhra Pradesh, State 37)")}`);
  lines.push("");

  // Executive Summary
  lines.push("EXECUTIVE FINANCIAL SUMMARY");
  lines.push(`Total Turnover Billed (INR),${metrics.totalRevenue}`);
  lines.push(`Total Collections Received (INR),${metrics.totalPaid}`);
  lines.push(`Current Outstanding Balance (INR),${metrics.totalOutstanding}`);
  lines.push(`Recovery Efficiency (%),${metrics.collectionRate}%`);
  lines.push(`Total Invoices Count,${metrics.invoiceCount}`);
  lines.push(`Total Retail Counter Bills Count,${metrics.billCount}`);
  lines.push(`Overdue Accounts Count,${metrics.overdueCount}`);
  lines.push("");

  // Commercial Documents Register (Invoices & Retail Bills)
  lines.push("COMMERCIAL DOCUMENTS & BILLING REGISTER");
  lines.push([
    "Document Number",
    "Type",
    "Issue Date",
    "Due Date",
    "Customer / Billed Party",
    "GSTIN",
    "State Code",
    "Taxable Amount (INR)",
    "CGST (INR)",
    "SGST (INR)",
    "IGST (INR)",
    "Total Tax (INR)",
    "Grand Total (INR)",
    "Total Paid (INR)",
    "Balance Due (INR)",
    "Payment Status",
    "Payment Mode",
    "E-Way Bill #",
    "Vehicle #",
    "Status",
  ].map(escapeCSV).join(","));

  docs.forEach((d) => {
    lines.push([
      d.documentNumber || "",
      d.documentType === "invoice" ? "GST Tax Invoice" : "Retail Counter Bill",
      d.issueDate || "",
      d.dueDate || "",
      d.customerSnapshot?.company || d.customerSnapshot?.name || "Counter Customer",
      d.customerSnapshot?.gstin || "Unregistered",
      d.customerSnapshot?.stateCode || "37",
      Number(d.taxableAmount || 0).toFixed(2),
      Number(d.cgst || 0).toFixed(2),
      Number(d.sgst || 0).toFixed(2),
      Number(d.igst || 0).toFixed(2),
      Number(d.totalTax || 0).toFixed(2),
      Number(d.grandTotal || 0).toFixed(2),
      Number(d.totalPaid || 0).toFixed(2),
      Number(d.balanceDue || 0).toFixed(2),
      d.paymentStatus || "unpaid",
      d.paymentMethod || "Cash",
      d.ewayBillNumber || "N/A",
      d.vehicleNumber || "N/A",
      d.status || "active",
    ].map(escapeCSV).join(","));
  });

  lines.push("");

  // Payment Collections Register
  lines.push("PAYMENT COLLECTIONS & RECEIPTS REGISTER");
  lines.push([
    "Receipt ID",
    "Payment Date",
    "Against Document #",
    "Document Type",
    "Customer",
    "Amount (INR)",
    "Payment Method",
    "Reference / UTR #",
    "Notes",
  ].map(escapeCSV).join(","));

  pays.forEach((p) => {
    lines.push([
      p.id || "",
      p.paymentDate || "",
      p.documentNumber || "",
      p.documentType || "",
      p.customerName || "",
      Number(p.amount || 0).toFixed(2),
      p.paymentMethod || "",
      p.referenceNumber || "",
      p.notes || "",
    ].map(escapeCSV).join(","));
  });

  lines.push("");

  // Customer Ledger Accounts
  lines.push("CUSTOMER MASTER REGISTRY & BALANCES");
  lines.push([
    "Customer ID",
    "Name",
    "Company / Trade Name",
    "Phone",
    "GSTIN",
    "State",
    "Lifetime Billed (INR)",
    "Total Paid (INR)",
    "Current Outstanding (INR)",
    "Total Invoices",
    "Total Bills",
  ].map(escapeCSV).join(","));

  custStats.forEach((c) => {
    lines.push([
      c.id || "",
      c.name || "",
      c.company || "",
      c.phone || "",
      c.gstin || "Unregistered",
      c.state || "Andhra Pradesh",
      Number(c.lifetimeRevenue || 0).toFixed(2),
      Number(c.totalPaid || 0).toFixed(2),
      Number(c.totalOutstanding || 0).toFixed(2),
      c.totalInvoices || 0,
      c.totalBills || 0,
    ].map(escapeCSV).join(","));
  });

  return lines.join("\r\n");
}

/**
 * EXPORT FINANCIAL REPORT AS XML (.xml)
 * Structured XML format for accounting and ERP systems.
 */
export function exportFinancialReportXML() {
  const now = new Date();
  const metrics = getDashboardMetricsSync();
  const docs = memoryCache.documents || [];
  const pays = memoryCache.payments || [];
  const custStats = getCustomersWithStatsSync();

  const escapeXML = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<FinancialReport generatedAt="${escapeXML(now.toISOString())}">\n`;

  // Organization Details
  xml += `  <Organization>\n`;
  xml += `    <Name>${escapeXML(BUSINESS_DETAILS.name)}</Name>\n`;
  xml += `    <LegalName>${escapeXML(BUSINESS_DETAILS.legalName)}</LegalName>\n`;
  xml += `    <Proprietor>${escapeXML(BUSINESS_DETAILS.proprietor)}</Proprietor>\n`;
  xml += `    <GSTIN>${escapeXML(BUSINESS_DETAILS.gstin)}</GSTIN>\n`;
  xml += `    <PAN>${escapeXML(BUSINESS_DETAILS.pan)}</PAN>\n`;
  xml += `    <State>${escapeXML(BUSINESS_DETAILS.state)}</State>\n`;
  xml += `    <StateCode>${escapeXML(BUSINESS_DETAILS.stateCode)}</StateCode>\n`;
  xml += `    <Address>${escapeXML(BUSINESS_DETAILS.address)}</Address>\n`;
  xml += `    <Phone>${escapeXML(BUSINESS_DETAILS.phone)}</Phone>\n`;
  xml += `    <Email>${escapeXML(BUSINESS_DETAILS.email)}</Email>\n`;
  xml += `  </Organization>\n`;

  // Financial Summary
  xml += `  <ExecutiveSummary>\n`;
  xml += `    <TotalTurnoverBilled currency="INR">${metrics.totalRevenue}</TotalTurnoverBilled>\n`;
  xml += `    <TotalCollectionsInflow currency="INR">${metrics.totalPaid}</TotalCollectionsInflow>\n`;
  xml += `    <CurrentOutstandingReceivables currency="INR">${metrics.totalOutstanding}</CurrentOutstandingReceivables>\n`;
  xml += `    <RecoveryEfficiencyPercent>${metrics.collectionRate}</RecoveryEfficiencyPercent>\n`;
  xml += `    <TotalInvoicesCount>${metrics.invoiceCount}</TotalInvoicesCount>\n`;
  xml += `    <TotalRetailBillsCount>${metrics.billCount}</TotalRetailBillsCount>\n`;
  xml += `    <OverdueAccountsCount>${metrics.overdueCount}</OverdueAccountsCount>\n`;
  xml += `  </ExecutiveSummary>\n`;

  // Documents
  xml += `  <Documents totalCount="${docs.length}">\n`;
  docs.forEach((d) => {
    xml += `    <Document id="${escapeXML(d.id)}" type="${escapeXML(d.documentType)}">\n`;
    xml += `      <DocumentNumber>${escapeXML(d.documentNumber)}</DocumentNumber>\n`;
    xml += `      <IssueDate>${escapeXML(d.issueDate)}</IssueDate>\n`;
    xml += `      <DueDate>${escapeXML(d.dueDate || "")}</DueDate>\n`;
    xml += `      <Status>${escapeXML(d.status)}</Status>\n`;
    xml += `      <PaymentStatus>${escapeXML(d.paymentStatus)}</PaymentStatus>\n`;
    xml += `      <PaymentMethod>${escapeXML(d.paymentMethod || "")}</PaymentMethod>\n`;
    xml += `      <Customer>\n`;
    xml += `        <Name>${escapeXML(d.customerSnapshot?.name || "")}</Name>\n`;
    xml += `        <Company>${escapeXML(d.customerSnapshot?.company || "")}</Company>\n`;
    xml += `        <GSTIN>${escapeXML(d.customerSnapshot?.gstin || "")}</GSTIN>\n`;
    xml += `        <StateCode>${escapeXML(d.customerSnapshot?.stateCode || "")}</StateCode>\n`;
    xml += `      </Customer>\n`;
    xml += `      <TaxSummary>\n`;
    xml += `        <TaxableAmount currency="INR">${Number(d.taxableAmount || 0).toFixed(2)}</TaxableAmount>\n`;
    xml += `        <CGST currency="INR">${Number(d.cgst || 0).toFixed(2)}</CGST>\n`;
    xml += `        <SGST currency="INR">${Number(d.sgst || 0).toFixed(2)}</SGST>\n`;
    xml += `        <IGST currency="INR">${Number(d.igst || 0).toFixed(2)}</IGST>\n`;
    xml += `        <TotalTax currency="INR">${Number(d.totalTax || 0).toFixed(2)}</TotalTax>\n`;
    xml += `      </TaxSummary>\n`;
    xml += `      <Financials>\n`;
    xml += `        <GrandTotal currency="INR">${Number(d.grandTotal || 0).toFixed(2)}</GrandTotal>\n`;
    xml += `        <TotalPaid currency="INR">${Number(d.totalPaid || 0).toFixed(2)}</TotalPaid>\n`;
    xml += `        <BalanceDue currency="INR">${Number(d.balanceDue || 0).toFixed(2)}</BalanceDue>\n`;
    xml += `      </Financials>\n`;
    if (d.items && d.items.length > 0) {
      xml += `      <LineItems count="${d.items.length}">\n`;
      d.items.forEach((it, idx) => {
        xml += `        <Item index="${idx + 1}">\n`;
        xml += `          <Description>${escapeXML(it.description || "")}</Description>\n`;
        xml += `          <HSN>${escapeXML(it.hsn || "")}</HSN>\n`;
        xml += `          <Quantity unit="${escapeXML(it.unit || "")}">${it.qty || 0}</Quantity>\n`;
        xml += `          <Rate currency="INR">${it.rate || 0}</Rate>\n`;
        xml += `          <Discount currency="INR">${it.discount || 0}</Discount>\n`;
        xml += `          <TaxRate percent="${it.taxRate || 0}">${it.taxRate || 0}</TaxRate>\n`;
        xml += `          <TaxableValue currency="INR">${it.taxableValue || 0}</TaxableValue>\n`;
        xml += `          <Total currency="INR">${it.total || 0}</Total>\n`;
        xml += `        </Item>\n`;
      });
      xml += `      </LineItems>\n`;
    }
    xml += `    </Document>\n`;
  });
  xml += `  </Documents>\n`;

  // Payment Receipts
  xml += `  <PaymentReceipts totalCount="${pays.length}">\n`;
  pays.forEach((p) => {
    xml += `    <PaymentReceipt id="${escapeXML(p.id)}">\n`;
    xml += `      <PaymentDate>${escapeXML(p.paymentDate)}</PaymentDate>\n`;
    xml += `      <AgainstDocument>${escapeXML(p.documentNumber)}</AgainstDocument>\n`;
    xml += `      <CustomerName>${escapeXML(p.customerName)}</CustomerName>\n`;
    xml += `      <Amount currency="INR">${Number(p.amount || 0).toFixed(2)}</Amount>\n`;
    xml += `      <PaymentMethod>${escapeXML(p.paymentMethod)}</PaymentMethod>\n`;
    xml += `      <ReferenceNumber>${escapeXML(p.referenceNumber || "")}</ReferenceNumber>\n`;
    xml += `      <Notes>${escapeXML(p.notes || "")}</Notes>\n`;
    xml += `    </PaymentReceipt>\n`;
  });
  xml += `  </PaymentReceipts>\n`;

  // Customer Balances
  xml += `  <CustomerAccounts totalCount="${custStats.length}">\n`;
  custStats.forEach((c) => {
    xml += `    <CustomerAccount id="${escapeXML(c.id)}">\n`;
    xml += `      <Name>${escapeXML(c.name)}</Name>\n`;
    xml += `      <Company>${escapeXML(c.company || "")}</Company>\n`;
    xml += `      <Phone>${escapeXML(c.phone || "")}</Phone>\n`;
    xml += `      <GSTIN>${escapeXML(c.gstin || "")}</GSTIN>\n`;
    xml += `      <State>${escapeXML(c.state || "Andhra Pradesh")}</State>\n`;
    xml += `      <LifetimeRevenue currency="INR">${Number(c.lifetimeRevenue || 0).toFixed(2)}</LifetimeRevenue>\n`;
    xml += `      <TotalPaid currency="INR">${Number(c.totalPaid || 0).toFixed(2)}</TotalPaid>\n`;
    xml += `      <OutstandingReceivable currency="INR">${Number(c.totalOutstanding || 0).toFixed(2)}</OutstandingReceivable>\n`;
    xml += `      <InvoiceCount>${c.totalInvoices || 0}</InvoiceCount>\n`;
    xml += `      <BillCount>${c.totalBills || 0}</BillCount>\n`;
    xml += `    </CustomerAccount>\n`;
  });
  xml += `  </CustomerAccounts>\n`;

  xml += `</FinancialReport>\n`;
  return xml;
}

/**
 * Pushes all currently loaded local records to Cloud Firestore
 */
export async function pushAllToFirestore() {
  return await seedFirestoreWithDemoData({
    customers: memoryCache.customers,
    documents: memoryCache.documents,
    payments: memoryCache.payments,
    auditLogs: memoryCache.auditLogs,
  });
}

/**
 * Seeds Cloud Firestore with 8–10 realistic, fully-traceable initial dummy business entries
 */
export async function seedFirestoreDummyEntries() {
  return await seedFirestoreWithDemoData(INITIAL_SEED_DATA);
}

