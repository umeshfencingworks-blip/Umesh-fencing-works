import { BUSINESS_DETAILS, calculateDocumentTotals, formatSequenceNumber, AP_STATE_CODE, formatINR } from "./calculations";
import {
  syncDocumentToFirestore,
  deleteDocumentFromFirestore,
  syncCustomerToFirestore,
  deleteCustomerFromFirestore,
  syncPaymentToFirestore,
  deletePaymentFromFirestore,
  syncPurchaseToFirestore,
  deletePurchaseFromFirestore,
  syncMaterialToFirestore,
  deleteMaterialFromFirestore,
  syncScrapEntryToFirestore,
  deleteScrapEntryFromFirestore,
  syncAuditLogToFirestore,
  seedFirestoreWithDemoData,
  clearFirestorePortalEntries,
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
    {
      id: "PAY-004",
      documentId: "DOC-BILL-0001",
      documentNumber: "UFW-BILL-0001",
      documentType: "bill",
      customerId: "WALK-IN",
      customerName: "Ramesh Naidu (Farmer)",
      amount: 8732,
      paymentDate: "2026-09-15",
      paymentMethod: "Cash",
      referenceNumber: "CASH-COUNTER-001",
      notes: "Full cash received at counter on delivery",
      createdAt: "2026-09-15T09:30:00.000Z",
    },
    {
      id: "PAY-005",
      documentId: "DOC-BILL-0003",
      documentNumber: "UFW-BILL-0003",
      documentType: "bill",
      customerId: "WALK-IN",
      customerName: "G. Obulesu Farm",
      amount: 9204,
      paymentDate: "2026-09-20",
      paymentMethod: "UPI",
      referenceNumber: "UPI/710928419204",
      notes: "Counter UPI QR payment settled",
      createdAt: "2026-09-20T15:45:00.000Z",
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
      user: "Admin (C. Umesh)",
    },
    {
      id: "AUD-002",
      timestamp: "2026-09-02T11:00:00.000Z",
      action: "INVOICE_GENERATED",
      entityType: "document",
      entityId: "DOC-INV-0001",
      entityNumber: "UFW-INV-0001",
      details: "Tax invoice generated for ₹1,45,022.00 (Customer: Sri Balaji Agro Farms)",
      user: "Admin (C. Umesh)",
    },
    {
      id: "AUD-003",
      timestamp: "2026-09-03T11:30:00.000Z",
      action: "PAYMENT_RECORDED",
      entityType: "payment",
      entityId: "PAY-001",
      entityNumber: "UFW-INV-0001",
      details: "Payment of ₹1,00,000 received via Bank Transfer (Ref: UBIN2026090123445)",
      user: "Admin (C. Umesh)",
    },
  ],
  purchases: [
    {
      id: "PUR-001",
      purchaseNumber: "UFW-PUR-0001",
      supplierInvoiceNumber: "TI-2026/894",
      purchaseDate: "2026-09-02",
      dueDate: "2026-09-17",
      supplier: {
        id: "SUP-001",
        name: "Sri Balaji Steel & Wire Industries",
        contactPerson: "K. Venkatesh",
        phone: "+91 94402 77889",
        email: "balaji.wiremills@gmail.com",
        gstin: "37AAGCS5512L1ZF",
        address: "Plot 12, Industrial Development Area, Bellary Road, Anantapur",
        city: "Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      items: [
        {
          itemIndex: 1,
          materialName: "Hot-Dip Galvanized Iron Wire (8 Gauge / 4.0mm)",
          category: "Steel Wire",
          qty: 500,
          unit: "kg",
          rate: 76,
          taxRate: 18,
          taxableAmount: 38000,
          taxAmount: 6840,
          total: 44840,
        },
      ],
      taxableAmount: 38000,
      cgst: 3420,
      sgst: 3420,
      igst: 0,
      totalTax: 6840,
      totalAmount: 44840,
      amountPaid: 44840,
      balanceDue: 0,
      paymentStatus: "paid",
      paymentMethod: "Bank Transfer (NEFT)",
      paymentHistory: [
        {
          id: "PPAY-001",
          amount: 44840,
          paymentDate: "2026-09-03",
          paymentMethod: "Bank Transfer (NEFT)",
          referenceNumber: "NEFT/UBIN/88192410",
          notes: "Settled in full via Union Bank Georgepet account",
          createdAt: "2026-09-03T11:00:00.000Z",
        },
      ],
      vehicleNumber: "AP 02 TE 6432",
      transporter: "Self Transport / Local Mini Lorry",
      notes: "High zinc coating 100 GSM batch for chainlink weaving plant",
      createdAt: "2026-09-02T10:30:00.000Z",
      updatedAt: "2026-09-03T11:00:00.000Z",
    },
    {
      id: "PUR-002",
      purchaseNumber: "UFW-PUR-0002",
      supplierInvoiceNumber: "DTC/9024",
      purchaseDate: "2026-09-10",
      dueDate: "2026-09-25",
      supplier: {
        id: "SUP-002",
        name: "Deccan Steel & Alloys Corp",
        contactPerson: "R. Chenna Kesava",
        phone: "+91 98480 33112",
        email: "deccanalloys.ap@outlook.com",
        gstin: "37AAKCD4119M1ZV",
        address: "Sy No. 44, Gooty Bypass Industrial Corridor, Anantapur",
        city: "Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      items: [
        {
          itemIndex: 1,
          materialName: "High-Tensile Galvanized Barbed Wire Coils (12x14 Gauge)",
          category: "Barbed Wire",
          qty: 1200,
          unit: "kg",
          rate: 74,
          taxRate: 18,
          taxableAmount: 88800,
          taxAmount: 15984,
          total: 104784,
        },
        {
          itemIndex: 2,
          materialName: "Galvanized High Tensile Wire (10 Gauge)",
          category: "Steel Wire",
          qty: 300,
          unit: "kg",
          rate: 78,
          taxRate: 18,
          taxableAmount: 23400,
          taxAmount: 4212,
          total: 27612,
        },
      ],
      taxableAmount: 112200,
      cgst: 10098,
      sgst: 10098,
      igst: 0,
      totalTax: 20196,
      totalAmount: 132396,
      amountPaid: 80000,
      balanceDue: 52396,
      paymentStatus: "partially_paid",
      paymentMethod: "Bank Transfer (RTGS)",
      paymentHistory: [
        {
          id: "PPAY-002",
          amount: 80000,
          paymentDate: "2026-09-12",
          paymentMethod: "Bank Transfer (RTGS)",
          referenceNumber: "RTGS/UBIN/99241028",
          notes: "Advance payment of ₹80,000 on delivery",
          createdAt: "2026-09-12T14:20:00.000Z",
        },
      ],
      vehicleNumber: "AP 04 Y 8109",
      transporter: "Deccan Logistics Fleet",
      notes: "Barbed wire raw coils received and inspected at factory",
      createdAt: "2026-09-10T11:15:00.000Z",
      updatedAt: "2026-09-12T14:20:00.000Z",
    },
    {
      id: "PUR-003",
      purchaseNumber: "UFW-PUR-0003",
      supplierInvoiceNumber: "ACB-7741",
      purchaseDate: "2026-09-16",
      dueDate: "2026-10-01",
      supplier: {
        id: "SUP-003",
        name: "Anantha Cements & Building Supplies",
        contactPerson: "N. Surendra Babu",
        phone: "+91 94412 88201",
        email: "ananthacement@yahoo.in",
        gstin: "37AALPN9021R1ZK",
        address: "Near Old Checkpost, Bukkarayasamudram Road, Anantapur",
        city: "Anantapur",
        state: "Andhra Pradesh",
        stateCode: "37",
      },
      items: [
        {
          itemIndex: 1,
          materialName: "Ultratech 53 Grade OPC Cement (For Precast Poles)",
          category: "Cement & Aggregates",
          qty: 90,
          unit: "Bags",
          rate: 375,
          taxRate: 28,
          taxableAmount: 33750,
          taxAmount: 9450,
          total: 43200,
        },
        {
          itemIndex: 2,
          materialName: "High Yield Rebar Wire (4mm Coils for Pole Core)",
          category: "Poles & Core Reinforcement",
          qty: 250,
          unit: "kg",
          rate: 68,
          taxRate: 18,
          taxableAmount: 17000,
          taxAmount: 3060,
          total: 20060,
        },
      ],
      taxableAmount: 50750,
      cgst: 6255,
      sgst: 6255,
      igst: 0,
      totalTax: 12510,
      totalAmount: 63260,
      amountPaid: 0,
      balanceDue: 63260,
      paymentStatus: "pending",
      paymentMethod: "Credit / 15 Days",
      paymentHistory: [],
      vehicleNumber: "AP 02 U 4110",
      transporter: "Supplier Truck Direct Delivery",
      notes: "Batch for 8ft & 9ft vibrated concrete fence posts production",
      createdAt: "2026-09-16T09:40:00.000Z",
      updatedAt: "2026-09-16T09:40:00.000Z",
    },
  ],
  materials: [
    {
      id: "MAT-001",
      name: "Hot-Dip Galvanized Iron Wire (8 Gauge / 4.0mm)",
      code: "IRON-8G",
      category: "Steel & Iron Wire",
      unit: "kg",
      boughtQty: 100,
      unitCost: 76,
      minStockAlert: 10,
      notes: "High zinc coating raw wire for chainlink weaving plant",
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "MAT-002",
      name: "Galvanized Barbed Wire (12x14 Gauge 2-Ply)",
      code: "BARBED-12G",
      category: "Barbed Wire",
      unit: "kg",
      boughtQty: 1500,
      unitCost: 74,
      minStockAlert: 150,
      notes: "High-tensile solar & farm perimeter fencing coils",
      createdAt: "2026-09-02T10:00:00.000Z",
      updatedAt: "2026-09-02T10:00:00.000Z",
    },
    {
      id: "MAT-003",
      name: "Concrete Boundary Posts (6 ft)",
      code: "POST-6FT",
      category: "Concrete Poles",
      unit: "Nos",
      boughtQty: 200,
      unitCost: 260,
      minStockAlert: 25,
      notes: "Precast vibrated cured RCC posts with wire tie eyelets",
      createdAt: "2026-09-05T11:00:00.000Z",
      updatedAt: "2026-09-05T11:00:00.000Z",
    },
    {
      id: "MAT-004",
      name: "GI Chainlink Mesh 4ft Roll (50 Meters)",
      code: "MESH-4FT",
      category: "Chainlink Mesh",
      unit: "Rolls",
      boughtQty: 50,
      unitCost: 5800,
      minStockAlert: 5,
      notes: "Galvanized diamond perimeter mesh rolls",
      createdAt: "2026-09-10T12:00:00.000Z",
      updatedAt: "2026-09-10T12:00:00.000Z",
    },
  ],
  scrapEntries: [
    {
      id: "SCRAP-001",
      materialId: "MAT-001",
      materialName: "Hot-Dip Galvanized Iron Wire (8 Gauge / 4.0mm)",
      qty: 1,
      unit: "kg",
      date: "2026-09-15",
      reason: "Cutting ends & coil trim wastage",
      notes: "Trim scrap from weaving machine setup",
      createdAt: "2026-09-15T16:00:00.000Z",
    },
    {
      id: "SCRAP-002",
      materialId: "MAT-003",
      materialName: "Concrete Boundary Posts (6 ft)",
      qty: 2,
      unit: "Nos",
      date: "2026-09-18",
      reason: "Damaged during yard unloading",
      notes: "Cracked corner during forklift stacking",
      createdAt: "2026-09-18T14:30:00.000Z",
    },
  ],
};

// In-Memory Storage Cache for 0ms reads (Clean Zero-State by default; no unsolicited random dummy entries)
let memoryCache = {
  customers: [],
  documents: [],
  payments: [],
  purchases: [],
  materials: [],
  scrapEntries: [],
  counters: {
    invoices: { id: "invoices", current: 0, prefix: "UFW-INV", updatedAt: new Date().toISOString() },
    bills: { id: "bills", current: 0, prefix: "UFW-BILL", updatedAt: new Date().toISOString() },
    purchases: { id: "purchases", current: 3, prefix: "UFW-PUR", updatedAt: new Date().toISOString() },
  },
  auditLogs: [],
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
    localStorage.setItem(STORAGE_PREFIX + "purchases", JSON.stringify(memoryCache.purchases || []));
    localStorage.setItem(STORAGE_PREFIX + "materials", JSON.stringify(memoryCache.materials || []));
    localStorage.setItem(STORAGE_PREFIX + "scrapEntries", JSON.stringify(memoryCache.scrapEntries || []));
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
    const rawPurchases = localStorage.getItem(STORAGE_PREFIX + "purchases");
    const rawMaterials = localStorage.getItem(STORAGE_PREFIX + "materials");
    const rawScrap = localStorage.getItem(STORAGE_PREFIX + "scrapEntries");
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
    if (rawPurchases !== null) {
      try {
        const parsed = JSON.parse(rawPurchases);
        if (Array.isArray(parsed)) {
          memoryCache.purchases = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    if (rawMaterials !== null) {
      try {
        const parsed = JSON.parse(rawMaterials);
        if (Array.isArray(parsed)) {
          memoryCache.materials = parsed;
          loaded = true;
        }
      } catch (e) {}
    }
    if (rawScrap !== null) {
      try {
        const parsed = JSON.parse(rawScrap);
        if (Array.isArray(parsed)) {
          memoryCache.scrapEntries = parsed;
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
        ["customers", "documents", "payments", "purchases", "materials", "scrapEntries", "counters", "auditLogs"].forEach((store) => {
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
      const tx = idb.transaction(["customers", "documents", "payments", "purchases", "materials", "scrapEntries", "counters", "auditLogs"], "readonly");
      const docReq = tx.objectStore("documents").getAll();
      const custReq = tx.objectStore("customers").getAll();
      const payReq = tx.objectStore("payments").getAll();
      const purReq = tx.objectStore("purchases").getAll();
      const matReq = tx.objectStore("materials").getAll();
      const scrapReq = tx.objectStore("scrapEntries").getAll();
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
        if (purReq.result && purReq.result.length > 0) {
          memoryCache.purchases = purReq.result;
        }
        if (matReq.result && matReq.result.length > 0) {
          memoryCache.materials = matReq.result;
        }
        if (scrapReq.result && scrapReq.result.length > 0) {
          memoryCache.scrapEntries = scrapReq.result;
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

  // 3. Auto-seed purchases if empty and not explicitly zeroed out
  if (
    (!memoryCache.purchases || memoryCache.purchases.length === 0) &&
    typeof window !== "undefined" &&
    localStorage.getItem(STORAGE_PREFIX + "zeroed") !== "true"
  ) {
    memoryCache.purchases = [...(INITIAL_SEED_DATA.purchases || [])];
    saveToLocalStorage();
  }

  // 4. Auto-seed materials & scrapEntries if empty and not explicitly zeroed out
  if (
    (!memoryCache.materials || memoryCache.materials.length === 0) &&
    typeof window !== "undefined" &&
    localStorage.getItem(STORAGE_PREFIX + "zeroed") !== "true"
  ) {
    memoryCache.materials = [...(INITIAL_SEED_DATA.materials || [])];
    memoryCache.scrapEntries = [...(INITIAL_SEED_DATA.scrapEntries || [])];
    saveToLocalStorage();
  }

  isInitialized = true;
  notifySubscribers();

  // 5. Smoothly sync existing purchases and materials to Firebase in background (0 latency for user)
  if (typeof window !== "undefined") {
    setTimeout(() => {
      try {
        (memoryCache.purchases || []).forEach((pur) => {
          syncPurchaseToFirestore(pur).catch(() => {});
        });
        const matsWithStock = getMaterialsWithStockSync();
        matsWithStock.forEach((mat) => {
          syncMaterialToFirestore({
            ...mat,
            stockSales: mat.salesDeductions || [],
          }).catch(() => {});
        });
      } catch (_) {}
    }, 1500);
  }
}

export async function seedInitialDataset() {
  memoryCache = {
    customers: [...INITIAL_SEED_DATA.customers],
    documents: [...INITIAL_SEED_DATA.documents],
    payments: [...INITIAL_SEED_DATA.payments],
    purchases: [...(INITIAL_SEED_DATA.purchases || [])],
    materials: [...(INITIAL_SEED_DATA.materials || [])],
    scrapEntries: [...(INITIAL_SEED_DATA.scrapEntries || [])],
    counters: { ...INITIAL_SEED_DATA.counters },
    auditLogs: [...INITIAL_SEED_DATA.auditLogs],
  };
  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("customers", memoryCache.customers);
  persistToIndexedDB("payments", memoryCache.payments);
  persistToIndexedDB("purchases", memoryCache.purchases);
  persistToIndexedDB("materials", memoryCache.materials);
  persistToIndexedDB("scrapEntries", memoryCache.scrapEntries);
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
    const docDebit = Number((Number(doc.grandTotal) || 0).toFixed(2));
    entries.push({
      id: `LED-DOC-${doc.id}`,
      date: doc.issueDate,
      timestamp: doc.createdAt,
      entityType: doc.documentType === "invoice" ? "GST Tax Invoice" : "Retail Counter Bill",
      referenceNumber: doc.documentNumber,
      partyName: doc.customerSnapshot?.company || doc.customerSnapshot?.name || "Counter Customer",
      partyId: doc.customerId,
      debit: docDebit,
      credit: 0,
      paymentMethod: doc.paymentMethod || "Invoice Credit",
      notes: `${doc.documentType === "invoice" ? "B2B Dispatch" : "Retail Sale"} • GSTIN: ${doc.customerSnapshot?.gstin || "Unregistered"}`,
      docRef: doc,
    });
  });

  memoryCache.payments.forEach((pay) => {
    const payCredit = Number((Number(pay.amount) || 0).toFixed(2));
    entries.push({
      id: `LED-PAY-${pay.id}`,
      date: pay.paymentDate,
      timestamp: pay.createdAt,
      entityType: "Payment Inflow",
      referenceNumber: pay.documentNumber || pay.id,
      partyName: pay.customerName || "Customer",
      partyId: pay.customerId,
      debit: 0,
      credit: payCredit,
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
    const grand = Number((Number(d.grandTotal) || 0).toFixed(2));
    const paid = Number((Number(d.totalPaid) || 0).toFixed(2));
    const bal = Number((Number(d.balanceDue) || 0).toFixed(2));
    const tax = Number((Number(d.totalTax) || 0).toFixed(2));

    totalRevenue = Number((totalRevenue + grand).toFixed(2));
    totalPaid = Number((totalPaid + paid).toFixed(2));
    totalOutstanding = Number((totalOutstanding + bal).toFixed(2));
    totalTax = Number((totalTax + tax).toFixed(2));

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
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  // 3. If initial payment was made during creation (or full counter payment)
  let pay = null;
  const initialPayAmount = Number(
    docData.initialPaymentAmount ||
    (docData.documentType === "bill" || docData.paymentStatus === "paid" ? docData.totalPaid : 0) ||
    0
  );

  if (initialPayAmount > 0) {
    const payId = `PAY-${Date.now().toString().slice(-6)}`;
    pay = {
      id: payId,
      documentId: id,
      documentNumber: docNumber,
      documentType: docData.documentType,
      customerId: newDoc.customerId,
      customerName: newDoc.customerSnapshot?.company || newDoc.customerSnapshot?.name || "Counter Customer",
      amount: Number(initialPayAmount.toFixed(2)),
      paymentDate: newDoc.issueDate,
      paymentMethod: docData.paymentMethod || "Cash",
      referenceNumber: docData.paymentReference || "Direct Point-of-Sale Settlement",
      notes: "Settlement on document creation",
      createdAt: now,
    };
    memoryCache.payments.unshift(pay);
  }

  const grandTotalNum = Number((Number(newDoc.grandTotal) || 0).toFixed(2));
  const paidNum = pay ? pay.amount : Number((Number(newDoc.totalPaid) || 0).toFixed(2));
  const balNum = Math.max(0, Number((grandTotalNum - paidNum).toFixed(2)));
  newDoc.grandTotal = grandTotalNum;
  newDoc.totalPaid = paidNum;
  newDoc.balanceDue = balNum;
  newDoc.paymentStatus = balNum <= 0 ? "paid" : paidNum > 0 ? "partially_paid" : "unpaid";

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

  // 6. Smoothly sync materials with updated stock & stock sales (as invoice/bill sales change in-stock)
  try {
    const updatedMats = getMaterialsWithStockSync();
    updatedMats.forEach((mat) => {
      syncMaterialToFirestore({
        ...mat,
        stockSales: mat.salesDeductions || [],
      }).catch((e) => console.warn("[Firestore] Material stock sales sync on doc create:", e));
    });
  } catch (_) {}

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
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync void status to Cloud Firestore
  syncDocumentToFirestore(docObj).catch((e) => console.warn("[Firestore] Void doc sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Void audit sync err:", e));

  // Sync materials with restored stock & updated stock sales to Firebase
  try {
    const updatedMats = getMaterialsWithStockSync();
    updatedMats.forEach((mat) => {
      syncMaterialToFirestore({
        ...mat,
        stockSales: mat.salesDeductions || [],
      }).catch((e) => console.warn("[Firestore] Material stock sales sync on doc void:", e));
    });
  } catch (_) {}

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
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("documents", memoryCache.documents);
  persistToIndexedDB("payments", memoryCache.payments);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync deletion to Cloud Firestore
  deleteDocumentFromFirestore(id).catch((e) => console.warn("[Firestore] Delete doc sync err:", e));
  syncAuditLogToFirestore(audit).catch((e) => console.warn("[Firestore] Delete audit sync err:", e));

  // Sync materials with restored stock & updated stock sales to Firebase
  try {
    const updatedMats = getMaterialsWithStockSync();
    updatedMats.forEach((mat) => {
      syncMaterialToFirestore({
        ...mat,
        stockSales: mat.salesDeductions || [],
      }).catch((e) => console.warn("[Firestore] Material stock sales sync on doc delete:", e));
    });
  } catch (_) {}

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
    user: "Admin (C. Umesh)",
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
    user: "Admin (C. Umesh)",
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
    user: "Admin (C. Umesh)",
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
  const amount = Number((Number(paymentData.amount) || 0).toFixed(2));

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
    user: "Admin (C. Umesh)",
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
  memoryCache.purchases = [];
  memoryCache.materials = [];
  memoryCache.scrapEntries = [];
  memoryCache.counters = {
    invoices: { id: "invoices", current: 0, prefix: "UFW-INV", updatedAt: new Date().toISOString() },
    bills: { id: "bills", current: 0, prefix: "UFW-BILL", updatedAt: new Date().toISOString() },
    purchases: { id: "purchases", current: 0, prefix: "UFW-PUR", updatedAt: new Date().toISOString() },
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
    user: "Admin (C. Umesh)",
  };

  memoryCache.auditLogs = [purgeLog];

  // Mark zeroed in localStorage so auto-seed does not re-populate on reload
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PREFIX + "zeroed", "true");
    localStorage.setItem(STORAGE_PREFIX + "documents", JSON.stringify([]));
    localStorage.setItem(STORAGE_PREFIX + "payments", JSON.stringify([]));
    localStorage.setItem(STORAGE_PREFIX + "purchases", JSON.stringify([]));
    localStorage.setItem(STORAGE_PREFIX + "materials", JSON.stringify([]));
    localStorage.setItem(STORAGE_PREFIX + "scrapEntries", JSON.stringify([]));
    localStorage.setItem(STORAGE_PREFIX + "counters", JSON.stringify(memoryCache.counters));
    localStorage.setItem(STORAGE_PREFIX + "auditLogs", JSON.stringify(memoryCache.auditLogs));
    if (wipeCustomers) {
      localStorage.setItem(STORAGE_PREFIX + "customers", JSON.stringify([]));
    }
  }

  saveToLocalStorage();

  try {
    const idb = await openIndexedDB();
    if (idb) {
      const storesToClear = ["documents", "payments", "purchases", "materials", "scrapEntries", "counters", "auditLogs"];
      if (wipeCustomers) storesToClear.push("customers");

      const tx = idb.transaction(storesToClear, "readwrite");
      tx.objectStore("documents").clear();
      tx.objectStore("payments").clear();
      tx.objectStore("purchases").clear();
      tx.objectStore("materials").clear();
      tx.objectStore("scrapEntries").clear();
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

  // Clear Cloud Firestore records asynchronously so old dummy records never sync back
  clearFirestorePortalEntries({ wipeCustomers }).catch((err) => {
    console.warn("[Firestore] Error clearing Firestore during zero-out:", err);
  });

  notifySubscribers();

  return {
    success: true,
    message: `All portal entries have been completely zeroed out to ₹0.00! ${wipeCustomers ? "Customer registry cleared." : "Customer registry preserved."}`,
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

// ==========================================
// PURCHASE LEDGER OPERATIONS
// ==========================================

export function getAllPurchasesSync() {
  return [...(memoryCache.purchases || [])];
}

export function getPurchaseById(purchaseId) {
  if (!purchaseId) return null;
  return (memoryCache.purchases || []).find((p) => p.id === purchaseId) || null;
}

export async function savePurchase(purchaseData) {
  const now = new Date().toISOString();
  const isNew = !purchaseData.id || !memoryCache.purchases.some((p) => p.id === purchaseData.id);

  let purchaseId = purchaseData.id;
  let purchaseNumber = purchaseData.purchaseNumber;

  if (isNew) {
    if (!memoryCache.counters.purchases) {
      memoryCache.counters.purchases = { id: "purchases", current: 3, prefix: "UFW-PUR", updatedAt: now };
    }
    const nextSeq = (memoryCache.counters.purchases.current || 0) + 1;
    memoryCache.counters.purchases.current = nextSeq;
    memoryCache.counters.purchases.updatedAt = now;

    purchaseId = purchaseId || `PUR-${Date.now().toString().slice(-6)}`;
    purchaseNumber = purchaseNumber || formatSequenceNumber(memoryCache.counters.purchases.prefix || "UFW-PUR", nextSeq, 4);
  }

  // Calculate items line by line
  const rawItems = Array.isArray(purchaseData.items) ? purchaseData.items : [];
  let calcTaxable = 0;
  let calcTax = 0;

  const calculatedItems = rawItems.map((item, idx) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const lineTaxable = Number((qty * rate).toFixed(2));
    const lineTax = Number(((lineTaxable * taxRate) / 100).toFixed(2));
    const lineTotal = Number((lineTaxable + lineTax).toFixed(2));

    calcTaxable += lineTaxable;
    calcTax += lineTax;

    return {
      itemIndex: idx + 1,
      materialName: item.materialName || "Raw Material",
      category: item.category || "General Materials",
      qty,
      unit: item.unit || "kg",
      rate,
      taxRate,
      taxableAmount: lineTaxable,
      taxAmount: lineTax,
      total: lineTotal,
    };
  });

  const taxableAmount = Number(calcTaxable.toFixed(2));
  const totalTax = Number(calcTax.toFixed(2));
  const totalAmount = Number((taxableAmount + totalTax).toFixed(2));

  // Determine payments & balance
  const amountPaid = Number((Number(purchaseData.amountPaid) || 0).toFixed(2));
  const balanceDue = Math.max(0, Number((totalAmount - amountPaid).toFixed(2)));

  let paymentStatus = "pending";
  if (balanceDue <= 0 && totalAmount > 0) {
    paymentStatus = "paid";
  } else if (amountPaid > 0 && balanceDue > 0) {
    paymentStatus = "partially_paid";
  }

  const existing = !isNew ? memoryCache.purchases.find((p) => p.id === purchaseId) : null;
  const paymentHistory = existing?.paymentHistory ? [...existing.paymentHistory] : [];

  // If a new payment amount is specified on creation and not yet logged in history
  if (isNew && amountPaid > 0 && paymentHistory.length === 0) {
    paymentHistory.push({
      id: `PPAY-${Date.now().toString().slice(-6)}`,
      amount: amountPaid,
      paymentDate: purchaseData.purchaseDate || now.split("T")[0],
      paymentMethod: purchaseData.paymentMethod || "Bank Transfer",
      referenceNumber: purchaseData.paymentReference || "",
      notes: "Initial payment recorded with purchase voucher",
      createdAt: now,
    });
  }

  const purchaseRecord = {
    id: purchaseId,
    purchaseNumber,
    supplierInvoiceNumber: purchaseData.supplierInvoiceNumber || "",
    purchaseDate: purchaseData.purchaseDate || now.split("T")[0],
    dueDate: purchaseData.dueDate || purchaseData.purchaseDate || now.split("T")[0],
    supplier: {
      id: purchaseData.supplier?.id || `SUP-${Date.now().toString().slice(-4)}`,
      name: purchaseData.supplier?.name || "Unknown Supplier",
      contactPerson: purchaseData.supplier?.contactPerson || "",
      phone: purchaseData.supplier?.phone || "",
      email: purchaseData.supplier?.email || "",
      gstin: purchaseData.supplier?.gstin || "",
      address: purchaseData.supplier?.address || "",
      city: purchaseData.supplier?.city || "Anantapur",
      state: purchaseData.supplier?.state || "Andhra Pradesh",
      stateCode: purchaseData.supplier?.stateCode || "37",
    },
    items: calculatedItems,
    taxableAmount,
    cgst: Number((totalTax / 2).toFixed(2)),
    sgst: Number((totalTax / 2).toFixed(2)),
    igst: 0,
    totalTax,
    totalAmount,
    amountPaid,
    balanceDue,
    paymentStatus,
    paymentMethod: purchaseData.paymentMethod || "Bank Transfer",
    paymentHistory,
    vehicleNumber: purchaseData.vehicleNumber || "",
    transporter: purchaseData.transporter || "",
    notes: purchaseData.notes || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (isNew) {
    memoryCache.purchases.unshift(purchaseRecord);
  } else {
    const idx = memoryCache.purchases.findIndex((p) => p.id === purchaseId);
    if (idx !== -1) {
      memoryCache.purchases[idx] = purchaseRecord;
    } else {
      memoryCache.purchases.unshift(purchaseRecord);
    }
  }

  // Log Audit Entry
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: isNew ? "PURCHASE_RECORDED" : "PURCHASE_UPDATED",
    entityType: "purchase",
    entityId: purchaseRecord.id,
    entityNumber: purchaseRecord.purchaseNumber,
    details: `${isNew ? "New purchase voucher" : "Updated purchase"} recorded for ${formatINR(totalAmount)} from ${purchaseRecord.supplier?.name} (${calculatedItems.length} items)`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("purchases", memoryCache.purchases);
  persistToIndexedDB("counters", Object.values(memoryCache.counters));
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Sync to Cloud Firestore
  syncPurchaseToFirestore(purchaseRecord).catch((err) =>
    console.warn("[Firestore] Non-blocking purchase sync:", err)
  );

  notifySubscribers();
  return purchaseRecord;
}

export async function recordPurchasePayment(purchaseId, paymentData) {
  const purchase = (memoryCache.purchases || []).find((p) => p.id === purchaseId);
  if (!purchase) {
    throw new Error("Purchase record not found.");
  }

  const now = new Date().toISOString();
  const payAmount = Number((Number(paymentData.amount) || 0).toFixed(2));
  if (payAmount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const currentPaid = Number(purchase.amountPaid || 0);
  const newAmountPaid = Number((currentPaid + payAmount).toFixed(2));
  const newBalance = Math.max(0, Number((Number(purchase.totalAmount || 0) - newAmountPaid).toFixed(2)));

  purchase.amountPaid = newAmountPaid;
  purchase.balanceDue = newBalance;
  purchase.paymentStatus = newBalance <= 0 ? "paid" : "partially_paid";
  purchase.updatedAt = now;

  const paymentEntry = {
    id: `PPAY-${Date.now().toString().slice(-6)}`,
    amount: payAmount,
    paymentDate: paymentData.paymentDate || now.split("T")[0],
    paymentMethod: paymentData.paymentMethod || "Bank Transfer",
    referenceNumber: paymentData.referenceNumber || "",
    notes: paymentData.notes || "",
    createdAt: now,
  };

  if (!Array.isArray(purchase.paymentHistory)) {
    purchase.paymentHistory = [];
  }
  purchase.paymentHistory.unshift(paymentEntry);

  // Audit Log
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "PURCHASE_PAYMENT_RECORDED",
    entityType: "purchase_payment",
    entityId: paymentEntry.id,
    entityNumber: purchase.purchaseNumber,
    details: `Outgoing payment of ${formatINR(payAmount)} made to ${purchase.supplier?.name} via ${paymentEntry.paymentMethod} (Ref: ${paymentEntry.referenceNumber || "N/A"})`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("purchases", memoryCache.purchases);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  syncPurchaseToFirestore(purchase).catch((err) =>
    console.warn("[Firestore] Non-blocking purchase payment sync:", err)
  );

  notifySubscribers();
  return { purchase, payment: paymentEntry };
}

export async function deletePurchase(purchaseId) {
  const idx = (memoryCache.purchases || []).findIndex((p) => p.id === purchaseId);
  if (idx === -1) return false;

  const deleted = memoryCache.purchases.splice(idx, 1)[0];
  const now = new Date().toISOString();

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "PURCHASE_DELETED",
    entityType: "purchase",
    entityId: purchaseId,
    entityNumber: deleted.purchaseNumber,
    details: `Deleted purchase voucher ${deleted.purchaseNumber} (${deleted.supplier?.name}) of ${formatINR(deleted.totalAmount)}`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("purchases", memoryCache.purchases);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  deletePurchaseFromFirestore(purchaseId).catch((err) =>
    console.warn("[Firestore] Non-blocking purchase delete:", err)
  );

  notifySubscribers();
  return true;
}

export function getPurchaseSummary() {
  const purchases = memoryCache.purchases || [];
  let totalExpensesAmount = 0;
  let totalExpensesPaid = 0;
  let totalPendingPayables = 0;
  let totalQty = 0;
  const categoriesMap = {};

  purchases.forEach((p) => {
    totalExpensesAmount += Number(p.totalAmount || 0);
    totalExpensesPaid += Number(p.amountPaid || 0);
    totalPendingPayables += Number(p.balanceDue || 0);

    (p.items || []).forEach((item) => {
      totalQty += Number(item.qty || 0);
      const cat = item.category || "General";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (Number(item.total) || 0);
    });
  });

  return {
    totalPurchasesCount: purchases.length,
    totalExpensesAmount: Number(totalExpensesAmount.toFixed(2)),
    totalExpensesPaid: Number(totalExpensesPaid.toFixed(2)),
    totalPendingPayables: Number(totalPendingPayables.toFixed(2)),
    totalMaterialQuantity: totalQty,
    byCategory: categoriesMap,
  };
}

export function exportPurchaseLedgerCSV() {
  const purchases = memoryCache.purchases || [];
  const headers = [
    "Purchase Number",
    "Supplier Bill No",
    "Date",
    "Supplier Name",
    "Contact Person",
    "Phone",
    "GSTIN",
    "Location",
    "Materials Summary",
    "Taxable Amount (INR)",
    "GST Tax (INR)",
    "Grand Total (INR)",
    "Amount Paid (INR)",
    "Balance Due (INR)",
    "Payment Status",
    "Payment Method",
    "Vehicle No",
    "Notes",
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = purchases.map((p) => {
    const materialsStr = (p.items || [])
      .map((it) => `${it.qty} ${it.unit} ${it.materialName}`)
      .join(" | ");

    return [
      escapeCSV(p.purchaseNumber),
      escapeCSV(p.supplierInvoiceNumber),
      escapeCSV(p.purchaseDate),
      escapeCSV(p.supplier?.name),
      escapeCSV(p.supplier?.contactPerson),
      escapeCSV(p.supplier?.phone),
      escapeCSV(p.supplier?.gstin),
      escapeCSV(p.supplier?.city || p.supplier?.address),
      escapeCSV(materialsStr),
      escapeCSV(Number(p.taxableAmount || 0).toFixed(2)),
      escapeCSV(Number(p.totalTax || 0).toFixed(2)),
      escapeCSV(Number(p.totalAmount || 0).toFixed(2)),
      escapeCSV(Number(p.amountPaid || 0).toFixed(2)),
      escapeCSV(Number(p.balanceDue || 0).toFixed(2)),
      escapeCSV(p.paymentStatus?.toUpperCase()),
      escapeCSV(p.paymentMethod),
      escapeCSV(p.vehicleNumber),
      escapeCSV(p.notes),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Pushes all currently loaded local records to Cloud Firestore
 */
export async function pushAllToFirestore() {
  const materialsWithStock = getMaterialsWithStockSync().map((m) => ({
    ...m,
    stockSales: m.salesDeductions || [],
  }));

  return await seedFirestoreWithDemoData({
    customers: memoryCache.customers,
    documents: memoryCache.documents,
    payments: memoryCache.payments,
    auditLogs: memoryCache.auditLogs,
    purchases: memoryCache.purchases || [],
    materials: materialsWithStock,
    scrapEntries: memoryCache.scrapEntries || [],
  });
}

/**
 * Seeds Cloud Firestore with 8–10 realistic, fully-traceable initial dummy business entries
 */
export async function seedFirestoreDummyEntries() {
  return await seedFirestoreWithDemoData(INITIAL_SEED_DATA);
}

// ==========================================
// SCRAP AND MATERIALS BOUGHT OPERATIONS
// ==========================================

/**
 * Synchronously retrieves all materials with live stock calculations:
 * InStock = boughtQty - soldQty - scrapQty
 * Automatically deducts from active invoices/bills and logged scrap entries.
 */
export function getMaterialsWithStockSync() {
  const materials = memoryCache.materials || [];
  const scrapEntries = memoryCache.scrapEntries || [];
  const activeDocs = (memoryCache.documents || []).filter((d) => d.status !== "void");

  return materials.map((mat) => {
    // 1. Calculate cumulative scrap logged for this material
    const matScrapList = scrapEntries.filter(
      (s) =>
        s.materialId === mat.id ||
        (s.materialName && s.materialName.toLowerCase() === (mat.name || "").toLowerCase())
    );
    const scrapQty = Number(
      matScrapList.reduce((sum, s) => sum + (Number(s.qty) || 0), 0).toFixed(3)
    );

    // 2. Calculate sold quantity auto-deducted from active invoices and bills
    const salesDeductions = [];
    let soldQty = 0;

    const matKeywords = (mat.name || "")
      .toLowerCase()
      .replace(/[()\/,.-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["gauge", "hot", "dip", "heavy", "with", "inch", "grade", "for"].includes(w));

    activeDocs.forEach((doc) => {
      (doc.items || []).forEach((item) => {
        let isMatch = false;

        if (item.materialId && item.materialId === mat.id) {
          isMatch = true;
        } else if (mat.code && item.description && item.description.toLowerCase().includes(mat.code.toLowerCase())) {
          isMatch = true;
        } else if (item.description && mat.name) {
          const itemDescLower = item.description.toLowerCase();
          const matNameLower = mat.name.toLowerCase();

          // Full substring check
          if (itemDescLower.includes(matNameLower) || matNameLower.includes(itemDescLower)) {
            isMatch = true;
          } else {
            // Keyword matching: if at least 2 distinct keywords match (or 1 if single keyword)
            const matchCount = matKeywords.filter((kw) => itemDescLower.includes(kw)).length;
            if (matchCount >= 2 || (matKeywords.length === 1 && matchCount === 1)) {
              isMatch = true;
            }
          }
        }

        if (isMatch) {
          const q = Number(item.qty) || 0;
          soldQty += q;
          salesDeductions.push({
            documentId: doc.id,
            documentNumber: doc.documentNumber,
            documentType: doc.documentType,
            customerName: doc.customerSnapshot?.company || doc.customerSnapshot?.name || "Customer",
            issueDate: doc.issueDate,
            qty: q,
            unit: item.unit || mat.unit,
            rate: item.rate,
            total: item.total,
          });
        }
      });
    });

    soldQty = Number(soldQty.toFixed(3));
    const boughtQty = Number((Number(mat.boughtQty) || 0).toFixed(3));
    const inStock = Math.max(0, Number((boughtQty - soldQty - scrapQty).toFixed(3)));

    const minAlert = Number(mat.minStockAlert) || 5;
    let stockStatus = "in_stock";
    if (inStock <= 0) {
      stockStatus = "out_of_stock";
    } else if (inStock <= minAlert) {
      stockStatus = "low_stock";
    }

    return {
      ...mat,
      boughtQty,
      soldQty,
      scrapQty,
      inStock,
      stockStatus,
      salesDeductions,
      scrapEntries: matScrapList,
    };
  });
}

/**
 * Synchronously retrieves all scrap log entries (newest first)
 */
export function getScrapEntriesSync() {
  return [...(memoryCache.scrapEntries || [])].sort((a, b) => {
    return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0);
  });
}

/**
 * Creates or updates a material item in the catalog
 */
export async function saveMaterial(materialData) {
  const now = new Date().toISOString();
  const id = materialData.id || `MAT-${Date.now().toString().slice(-6)}`;
  const isNew = !materialData.id || !(memoryCache.materials || []).some((m) => m.id === materialData.id);

  const materialRecord = {
    id,
    name: materialData.name || "Raw Material",
    code: materialData.code || "",
    category: materialData.category || "General Materials",
    unit: materialData.unit || "kg",
    boughtQty: Number((Number(materialData.boughtQty) || 0).toFixed(3)),
    unitCost: Number((Number(materialData.unitCost) || 0).toFixed(2)),
    minStockAlert: Number((Number(materialData.minStockAlert) || 5).toFixed(2)),
    notes: materialData.notes || "",
    createdAt: materialData.createdAt || now,
    updatedAt: now,
  };

  if (!Array.isArray(memoryCache.materials)) {
    memoryCache.materials = [];
  }

  if (isNew) {
    memoryCache.materials.unshift(materialRecord);
  } else {
    const idx = memoryCache.materials.findIndex((m) => m.id === id);
    if (idx >= 0) {
      memoryCache.materials[idx] = materialRecord;
    } else {
      memoryCache.materials.unshift(materialRecord);
    }
  }

  // Audit Log
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: isNew ? "MATERIAL_CREATED" : "MATERIAL_UPDATED",
    entityType: "material",
    entityId: id,
    entityNumber: materialRecord.name,
    details: `${isNew ? "Registered new material" : "Updated material"} "${materialRecord.name}" (Bought: ${materialRecord.boughtQty} ${materialRecord.unit})`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("materials", memoryCache.materials);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Compute live stock, stock sales, and sync full record to Cloud Firestore
  const enriched = getMaterialsWithStockSync().find((m) => m.id === id) || materialRecord;
  syncMaterialToFirestore({
    ...enriched,
    stockSales: enriched.salesDeductions || [],
  }).catch((err) =>
    console.warn("[Firestore] Non-blocking material sync:", err)
  );

  notifySubscribers();
  return materialRecord;
}

/**
 * Quickly increments bought quantity / restocks an existing material
 */
export async function addMaterialStock(materialId, additionalQty, notes = "") {
  const mat = (memoryCache.materials || []).find((m) => m.id === materialId);
  if (!mat) throw new Error("Material not found");

  const qtyToAdd = Number(additionalQty) || 0;
  if (qtyToAdd <= 0) throw new Error("Please specify a valid quantity to add");

  const now = new Date().toISOString();
  mat.boughtQty = Number((Number(mat.boughtQty || 0) + qtyToAdd).toFixed(3));
  mat.updatedAt = now;
  if (notes) {
    mat.notes = (mat.notes ? mat.notes + " | " : "") + notes;
  }

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "MATERIAL_STOCK_ADDED",
    entityType: "material",
    entityId: mat.id,
    entityNumber: mat.name,
    details: `Added ${qtyToAdd} ${mat.unit} into stock for "${mat.name}". New cumulative bought: ${mat.boughtQty} ${mat.unit}`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("materials", memoryCache.materials);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  // Compute live stock, stock sales, and sync full restocked record to Cloud Firestore
  const enriched = getMaterialsWithStockSync().find((m) => m.id === materialId) || mat;
  syncMaterialToFirestore({
    ...enriched,
    stockSales: enriched.salesDeductions || [],
  }).catch((err) =>
    console.warn("[Firestore] Non-blocking material restock sync:", err)
  );

  notifySubscribers();
  return mat;
}

/**
 * Deletes a material from stock catalog
 */
export async function deleteMaterial(materialId) {
  const idx = (memoryCache.materials || []).findIndex((m) => m.id === materialId);
  if (idx === -1) return false;

  const deleted = memoryCache.materials.splice(idx, 1)[0];
  const now = new Date().toISOString();

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "MATERIAL_DELETED",
    entityType: "material",
    entityId: materialId,
    entityNumber: deleted.name,
    details: `Deleted material "${deleted.name}" (${deleted.boughtQty} ${deleted.unit})`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("materials", memoryCache.materials);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  deleteMaterialFromFirestore(materialId).catch((err) =>
    console.warn("[Firestore] Non-blocking material delete:", err)
  );

  notifySubscribers();
  return true;
}

/**
 * Records an entry in the Scrap / Wastage register
 */
export async function saveScrapEntry(scrapData) {
  const now = new Date().toISOString();
  const id = scrapData.id || `SCRAP-${Date.now().toString().slice(-6)}`;
  const qty = Number((Number(scrapData.qty) || 0).toFixed(3));
  if (qty <= 0) throw new Error("Scrap quantity must be greater than zero");

  // Lookup material details if available
  const mat = (memoryCache.materials || []).find((m) => m.id === scrapData.materialId);
  const materialName = mat ? mat.name : (scrapData.materialName || "Raw Material");
  const unit = mat ? mat.unit : (scrapData.unit || "kg");

  const scrapRecord = {
    id,
    materialId: scrapData.materialId || "",
    materialName,
    qty,
    unit,
    date: scrapData.date || now.split("T")[0],
    reason: scrapData.reason || "Cutting / Trimming Wastage",
    notes: scrapData.notes || "",
    createdAt: scrapData.createdAt || now,
  };

  if (!Array.isArray(memoryCache.scrapEntries)) {
    memoryCache.scrapEntries = [];
  }

  memoryCache.scrapEntries.unshift(scrapRecord);

  // Audit Log
  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "SCRAP_RECORDED",
    entityType: "scrap",
    entityId: id,
    entityNumber: materialName,
    details: `Logged ${qty} ${unit} scrap/wastage for "${materialName}" (Reason: ${scrapRecord.reason})`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("scrapEntries", memoryCache.scrapEntries);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  syncScrapEntryToFirestore(scrapRecord).catch((err) =>
    console.warn("[Firestore] Non-blocking scrap sync:", err)
  );

  // Also re-sync the affected material to Firestore with its updated inStock & scrapQty
  try {
    const affectedMat = getMaterialsWithStockSync().find(
      (m) => m.id === scrapRecord.materialId || (m.name && m.name.toLowerCase() === scrapRecord.materialName?.toLowerCase())
    );
    if (affectedMat) {
      syncMaterialToFirestore({
        ...affectedMat,
        stockSales: affectedMat.salesDeductions || [],
      }).catch((e) => console.warn("[Firestore] Material sync on scrap save:", e));
    }
  } catch (_) {}

  notifySubscribers();
  return scrapRecord;
}

/**
 * Deletes a scrap log entry
 */
export async function deleteScrapEntry(scrapId) {
  const idx = (memoryCache.scrapEntries || []).findIndex((s) => s.id === scrapId);
  if (idx === -1) return false;

  const deleted = memoryCache.scrapEntries.splice(idx, 1)[0];
  const now = new Date().toISOString();

  const audit = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    action: "SCRAP_DELETED",
    entityType: "scrap",
    entityId: scrapId,
    entityNumber: deleted.materialName,
    details: `Deleted scrap record ${deleted.id} (${deleted.qty} ${deleted.unit} of ${deleted.materialName})`,
    user: "Admin (C. Umesh)",
  };
  memoryCache.auditLogs.unshift(audit);

  saveToLocalStorage();
  persistToIndexedDB("scrapEntries", memoryCache.scrapEntries);
  persistToIndexedDB("auditLogs", memoryCache.auditLogs);

  deleteScrapEntryFromFirestore(scrapId).catch((err) =>
    console.warn("[Firestore] Non-blocking scrap delete:", err)
  );

  // Also re-sync the affected material to Firestore with its restored inStock
  try {
    const affectedMat = getMaterialsWithStockSync().find(
      (m) => m.id === deleted.materialId || (m.name && m.name.toLowerCase() === deleted.materialName?.toLowerCase())
    );
    if (affectedMat) {
      syncMaterialToFirestore({
        ...affectedMat,
        stockSales: affectedMat.salesDeductions || [],
      }).catch((e) => console.warn("[Firestore] Material sync on scrap delete:", e));
    }
  } catch (_) {}

  notifySubscribers();
  return true;
}

/**
 * Calculates summary metrics for Scrap & Materials
 */
export function getInventoryAndScrapSummary() {
  const materialsWithStock = getMaterialsWithStockSync();
  const scrapEntries = memoryCache.scrapEntries || [];

  let totalBoughtQty = 0;
  let totalSoldQty = 0;
  let totalScrapQty = 0;
  let totalInStockQty = 0;
  let totalInventoryValue = 0;
  let inStockItemsCount = 0;
  let lowStockItemsCount = 0;
  let outOfStockItemsCount = 0;

  materialsWithStock.forEach((m) => {
    totalBoughtQty += Number(m.boughtQty || 0);
    totalSoldQty += Number(m.soldQty || 0);
    totalScrapQty += Number(m.scrapQty || 0);
    totalInStockQty += Number(m.inStock || 0);
    totalInventoryValue += Number(m.inStock || 0) * Number(m.unitCost || 0);

    if (m.stockStatus === "out_of_stock") {
      outOfStockItemsCount++;
    } else if (m.stockStatus === "low_stock") {
      lowStockItemsCount++;
    } else {
      inStockItemsCount++;
    }
  });

  return {
    totalMaterialsCount: materialsWithStock.length,
    totalBoughtQty: Number(totalBoughtQty.toFixed(2)),
    totalSoldQty: Number(totalSoldQty.toFixed(2)),
    totalScrapQty: Number(totalScrapQty.toFixed(2)),
    totalInStockQty: Number(totalInStockQty.toFixed(2)),
    totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
    inStockItemsCount,
    lowStockItemsCount,
    outOfStockItemsCount,
    totalScrapEntriesCount: scrapEntries.length,
  };
}

/**
 * Exports materials inventory and scrap logs as downloadable CSV
 */
export function exportMaterialsAndScrapCSV() {
  const materialsWithStock = getMaterialsWithStockSync();
  const scrapEntries = getScrapEntriesSync();

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [];

  // Section 1: Materials & Stock Inventory
  lines.push("UMESH FENCING WORKS — MATERIALS BOUGHT & CURRENT STOCK INVENTORY");
  lines.push(`Generated On,${escapeCSV(new Date().toLocaleString())}`);
  lines.push("");
  lines.push([
    "Material ID",
    "Material / Piece Name",
    "Code",
    "Category",
    "Unit",
    "Bought Qty",
    "Sold Qty (Invoices/Bills)",
    "Scrap Qty (Wastage)",
    "Available In-Stock",
    "Unit Cost (INR)",
    "Stock Valuation (INR)",
    "Stock Status",
    "Notes",
  ].map(escapeCSV).join(","));

  materialsWithStock.forEach((m) => {
    const val = Number(m.inStock || 0) * Number(m.unitCost || 0);
    lines.push([
      escapeCSV(m.id),
      escapeCSV(m.name),
      escapeCSV(m.code),
      escapeCSV(m.category),
      escapeCSV(m.unit),
      escapeCSV(m.boughtQty),
      escapeCSV(m.soldQty),
      escapeCSV(m.scrapQty),
      escapeCSV(m.inStock),
      escapeCSV(Number(m.unitCost || 0).toFixed(2)),
      escapeCSV(val.toFixed(2)),
      escapeCSV(m.stockStatus?.toUpperCase()),
      escapeCSV(m.notes),
    ].join(","));
  });

  lines.push("");
  lines.push("");

  // Section 2: Scrap & Wastage Register
  lines.push("UMESH FENCING WORKS — SCRAP & PRODUCTION WASTAGE REGISTER");
  lines.push([
    "Scrap Log ID",
    "Date",
    "Material Name",
    "Wasted Qty",
    "Unit",
    "Wastage Reason / Stage",
    "Notes",
  ].map(escapeCSV).join(","));

  scrapEntries.forEach((s) => {
    lines.push([
      escapeCSV(s.id),
      escapeCSV(s.date),
      escapeCSV(s.materialName),
      escapeCSV(s.qty),
      escapeCSV(s.unit),
      escapeCSV(s.reason),
      escapeCSV(s.notes),
    ].join(","));
  });

  return lines.join("\n");
}

