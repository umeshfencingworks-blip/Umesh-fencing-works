# Umesh Fencing Works — Comprehensive System Architecture & Database Specification

> **Document Version:** 2.0.0  
> **Target Audience:** System Architects, Developers, Database Administrators, and Business Auditors  
> **Proprietor:** B. Umesh  
> **Facility:** Survey No. 87/9, Near HLC Canal, Bukkarayasamudram, Anantapur, Andhra Pradesh - 515701  
> **GSTIN:** `37AMQPU6044G1ZH` | **PAN:** `AMQPU6044G` | **State Code:** `37` (Andhra Pradesh)  

---

## 1. Executive Summary & Purpose

**Umesh Fencing Works** operates a mission-critical billing, inventory tracking, and financial ledger platform designed for commercial fence manufacturing, government infrastructure supply, solar power plant boundaries, agricultural fencing, and walk-in counter sales across Andhra Pradesh, Karnataka, and Telangana.

This document serves as the **authoritative architectural reference and database specification**. It explains the application architecture, client-side zero-latency engine, dual-tier persistence design (**Local SQLite Core** and **Cloud Firestore Mirror**), relational and document schemas, and the **guaranteed 2-to-5-year multi-dimensional traceability framework**.

---

## 2. High-Level System Architecture

The application is structured into four decoupled, resilient layers:

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION & UI LAYER                                 |
|  - Next.js 15 App Router (`app/`)                                                 |
|  - Reactive Modular Views (`components/views/`)                                   |
|  - Classical A4 Print Engine (`components/DocumentPreviewModal.js`)               |
|  - Admin Command Room (`app/admin-controls/page.js`)                              |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        STATE & REACTIVITY CONTEXT LAYER                           |
|  - `context/UIContext.js` (Global Application Provider)                           |
|  - Event-Driven Pub/Sub Subscription Model (`subscribeToDb`)                      |
|  - Zero-Latency In-Memory View Hydration (0ms render time)                        |
|  - Firebase Google Authentication Gatekeeper with Admin Email Whitelist           |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     CALCULATION & BUSINESS LOGIC ENGINE                           |
|  - `lib/calculations.js` (AP Intra-State CGST 9% + SGST 9% & Inter-State IGST 18%)|
|  - Automated 2-Digit GSTIN State Code Extraction (State 37 detection)             |
|  - Indian Rupee Currency Word Converter (`Rupees ... Only`)                       |
|  - Round-off Adjustment & Sequence Counter Generators                             |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                      DUAL-TIER PERSISTENCE STORAGE LAYER                          |
|                                                                                   |
|  [ PRIMARY LOCAL STORE: SQLite / IndexedDB ]    [ CLOUD SYNC: Firebase Firestore ]|
|  - Normalized Relational Tables                 - Cloud-Mirrored Collections      |
|  - Full ACID Transactional Integrity            - Multi-Device Disaster Recovery  |
|  - Instant Offline Access (0ms latency)         - Long-Term Historical Querying   |
|  - In-Memory Mirror Cache (`memoryCache`)       - Real-Time Admin Access          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Storage Strategy: The Hybrid Dual-Store Model

To balance **zero-latency point-of-sale speed** with **long-term historical auditability**, the platform utilizes a dual-tier storage strategy:

### 3.1 Primary Tier: Local Relational Store (SQLite / IndexedDB)
- **Role**: Primary operational database for all point-of-sale desks and administrative views.
- **Engine**: SQLite / browser IndexedDB (`ufw_next_business_db`) backed by a synchronous memory cache (`memoryCache`).
- **Characteristics**:
  - **Zero Network Latency (0ms)**: Billing desks can generate invoices and print receipts even during internet outages.
  - **Relational Integrity**: Strict foreign key constraints link items and payments to specific documents and customers.
  - **Instant Hydration**: Loaded synchronously into memory on browser evaluation before React renders the first frame.

### 3.2 Secondary Tier: Remote Cloud Mirror (Firebase Cloud Firestore)
- **Role**: Cloud backup, archival snapshot, and disaster-recovery replication.
- **Engine**: Cloud Firestore NoSQL document store.
- **Characteristics**:
  - **Append-Safe**: Whenever an invoice, bill, payment, or customer record is saved, a mirror payload is written to Firestore.
  - **Self-Contained Snapshots**: Firestore documents contain embedded snapshots of the customer details and line items, ensuring historical immutability even if master records change years later.
  - **Two-Year Auditability**: An auditor or tax official opening Firestore years later can query by customer, date, or vehicle number with zero dependencies on local device state.

---

## 4. Multi-Year Traceability Guarantee

A foundational requirement of the Umesh Fencing Works system is **complete, unbreakable traceability**. If an auditor opens the database 2 to 5 years from now for any specific client, the following 6 questions can be answered instantly:

1. **WHO** bought the material?
   - Frozen historical identity (Company, Proprietor, GSTIN, PAN, Phone, Delivery Address, State Code).
2. **WHAT** exact products were supplied?
   - Exact description, gauge, mesh size, pole height, coil diameter, and HSN code.
3. **HOW MANY** units were taken?
   - Exact quantity and metric unit (`Mtrs`, `Nos`, `Kg`, `Running Mtrs`).
4. **AT WHAT PRICE & TAX RATE**?
   - Unit rate, line discount, taxable value, CGST (9%), SGST (9%), or IGST (18%), and grand total.
5. **WHEN & HOW** was it dispatched?
   - Timestamp, issue date, due date, place of supply, delivery vehicle registration number (`vehicleNumber`), and E-Way Bill number (`ewayBillNumber`).
6. **HOW & WHEN** was it paid for?
   - Chronological payment receipt history, payment mode (Cash, UPI, NEFT, RTGS), bank reference/UTR number, credited amount, and remaining balance due.

---

## 5. Database Schema Specifications

### 5.1 Primary Relational Schema (SQLite DDL)

The relational schema normalizes entities into 5 tables connected by foreign keys:

```sql
-- ============================================================================
-- 1. CUSTOMERS MASTER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,                       -- e.g. 'CUST-001' or mobile '9440285110'
    company TEXT,                              -- Business / Commercial Entity Name
    name TEXT NOT NULL,                        -- Contact Person / Proprietor Name
    phone TEXT,                                -- Primary Phone / WhatsApp Number
    email TEXT,                                -- Official Remittance / Billing Email
    gstin TEXT,                                -- 15-character GST Identification Number
    state_code TEXT DEFAULT '37',              -- 2-digit State Code (AP: 37, KA: 29, TS: 36)
    state_name TEXT DEFAULT 'Andhra Pradesh',  -- State / Territory Name
    address TEXT,                              -- Complete Physical / Site Address
    pan TEXT,                                  -- 10-character Permanent Account Number
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_gstin ON customers(gstin);

-- ============================================================================
-- 2. DOCUMENTS TABLE (GST Tax Invoices & Retail Counter Bills Header)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,                       -- e.g. 'DOC-INV-0001', 'DOC-BILL-0001'
    document_number TEXT UNIQUE NOT NULL,      -- e.g. 'UFW-INV-0001', 'UFW-BILL-0001'
    document_type TEXT NOT NULL CHECK(document_type IN ('invoice', 'bill')),
    issue_date DATE NOT NULL,                  -- YYYY-MM-DD
    due_date DATE,                             -- Payment settlement deadline
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'void')),
    void_reason TEXT,                          -- Reason if voided by admin
    payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('paid', 'partially_paid', 'unpaid', 'void')),
    
    -- Customer Identity & Immutable Historical Snapshot
    customer_id TEXT,                          -- Links to customers.id (nullable for walk-ins)
    customer_snapshot TEXT NOT NULL,           -- JSON frozen copy of customer details at issue time
    
    -- Transport, Supply & Logistics Tracking
    place_of_supply TEXT,                      -- e.g. 'Andhra Pradesh (37)'
    vehicle_number TEXT,                       -- Delivery vehicle / tractor registration (e.g. 'AP 02 TC 8812')
    eway_bill_number TEXT,                     -- Official 12-digit GST E-Way Bill Number
    payment_method TEXT,                       -- Initial payment terms (e.g. 'Bank Transfer', 'UPI', 'Cash')
    notes TEXT,                                -- Delivery instructions or jurisdictional terms
    
    -- Commercial Financials & Taxes
    subtotal REAL NOT NULL DEFAULT 0,          -- Sum of (qty * rate) across all items
    total_discount REAL DEFAULT 0,             -- Total discount deducted
    taxable_amount REAL NOT NULL DEFAULT 0,    -- Pre-tax assessment value
    cgst REAL DEFAULT 0,                       -- Central GST (9% for AP intra-state)
    sgst REAL DEFAULT 0,                       -- State GST (9% for AP intra-state)
    igst REAL DEFAULT 0,                       -- Integrated GST (18% for inter-state)
    total_tax REAL NOT NULL DEFAULT 0,         -- Total tax liability (cgst + sgst + igst)
    round_off REAL DEFAULT 0,                  -- Mathematical round-off to nearest rupee
    grand_total REAL NOT NULL DEFAULT 0,       -- Final payable turnover amount
    amount_in_words TEXT,                      -- Formal text representation
    
    -- Payment Settlement Balances
    total_paid REAL DEFAULT 0,                 -- Cumulative collections credited
    balance_due REAL DEFAULT 0,                -- Remaining outstanding balance
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_issue_date ON documents(issue_date);
CREATE INDEX IF NOT EXISTS idx_documents_doc_number ON documents(document_number);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- ============================================================================
-- 3. DOCUMENT ITEMS TABLE (Item-by-Item Product Traceability)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,                 -- Links to documents.id
    item_index INTEGER NOT NULL,               -- Sequence position on invoice (1, 2, 3...)
    description TEXT NOT NULL,                 -- Complete product name & specification
    hsn TEXT,                                  -- GST Harmonized System of Nomenclature code
    qty REAL NOT NULL,                         -- Quantity supplied
    unit TEXT NOT NULL,                        -- Measurement unit ('Mtrs', 'Nos', 'Kg', etc.)
    rate REAL NOT NULL,                        -- Unit selling rate (INR)
    discount REAL DEFAULT 0,                   -- Item-level discount
    taxable_value REAL NOT NULL,               -- Taxable value after discount
    tax_rate REAL DEFAULT 18,                  -- Total GST rate percentage (18%)
    cgst REAL DEFAULT 0,                       -- CGST amount (9%)
    sgst REAL DEFAULT 0,                       -- SGST amount (9%)
    igst REAL DEFAULT 0,                       -- IGST amount (18% if inter-state)
    total_tax REAL DEFAULT 0,                  -- CGST + SGST or IGST
    total REAL NOT NULL,                       -- Line grand total inclusive of tax
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_document_id ON document_items(document_id);
CREATE INDEX IF NOT EXISTS idx_items_hsn ON document_items(hsn);

-- ============================================================================
-- 4. PAYMENTS LEDGER TABLE (Receipts & Inflows)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,                       -- e.g. 'PAY-001', 'PAY-172750'
    document_id TEXT NOT NULL,                 -- Associated document ID
    document_number TEXT NOT NULL,             -- Associated document sequence number
    document_type TEXT NOT NULL,               -- 'invoice' or 'bill'
    customer_id TEXT,                          -- Customer ID
    customer_name TEXT,                        -- Name of paying party
    amount REAL NOT NULL,                      -- Amount received (INR)
    payment_date DATE NOT NULL,                -- Payment realization date (YYYY-MM-DD)
    payment_method TEXT NOT NULL,              -- 'Bank Transfer', 'RTGS', 'NEFT', 'UPI', 'Cash'
    reference_number TEXT,                     -- Bank UTR, UPI transaction ID, or Cheque number
    notes TEXT,                                -- Desk remarks or depositing bank details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(document_id) REFERENCES documents(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================================================
-- 5. NUMBERING COUNTERS TABLE (Atomic Invoice & Bill Sequences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY,                       -- 'invoices' or 'bills'
    prefix TEXT NOT NULL,                      -- 'UFW-INV' or 'UFW-BILL'
    current_number INTEGER NOT NULL DEFAULT 0, -- Auto-incrementing integer (e.g. 1 -> 0001)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. AUDIT LOGS TABLE (Chronological Activity Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,                       -- e.g. 'AUD-001'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,                      -- 'INVOICE_GENERATED', 'BILL_GENERATED', 'PAYMENT_RECORDED', 'DOCUMENT_VOIDED'
    entity_type TEXT NOT NULL,                 -- 'document', 'customer', 'payment'
    entity_id TEXT NOT NULL,                   -- Target ID
    entity_number TEXT,                        -- Target document or receipt number
    details TEXT NOT NULL,                     -- Human-readable narrative description
    user TEXT NOT NULL                         -- Authorized user (e.g. 'Admin (B. Umesh)')
);
```

---

### 5.2 Firebase Cloud Firestore Collections Schema

In Cloud Firestore, the data is structured into **3 core collections**. Document sub-items are embedded directly into the document to ensure **single-read retrieval** and **atomic snapshots**:

#### Collection 1: `customers`
- **Path**: `customers/{customerId}`
- **Fields**:
  - `id` *(string)*: Unique customer code (`CUST-001`).
  - `company` *(string)*: Registered trade or company name.
  - `name` *(string)*: Individual proprietor or procurement officer name.
  - `phone` *(string)*: Contact number.
  - `email` *(string)*: Contact email.
  - `gstin` *(string)*: 15-character GSTIN.
  - `stateCode` *(string)*: 2-digit GST state code (Default: `"37"`).
  - `stateName` *(string)*: Full state name (`"Andhra Pradesh"`).
  - `address` *(string)*: Billing and registered dispatch address.
  - `pan` *(string)*: Permanent Account Number.
  - `createdAt` *(timestamp / ISO string)*.
  - `updatedAt` *(timestamp / ISO string)*.

#### Collection 2: `documents`
- **Path**: `documents/{documentId}`
- **Fields**:
  - `id` *(string)*: Document identifier (`DOC-INV-0001`).
  - `documentNumber` *(string)*: Human-readable serial (`UFW-INV-0001` or `UFW-BILL-0001`).
  - `documentType` *(string)*: `"invoice"` (Commercial GST B2B) or `"bill"` (Point-of-Sale Counter B2C).
  - `issueDate` *(string)*: `YYYY-MM-DD`.
  - `dueDate` *(string)*: `YYYY-MM-DD`.
  - `status` *(string)*: `"active"` or `"void"`.
  - `paymentStatus` *(string)*: `"paid"`, `"partially_paid"`, `"unpaid"`, or `"void"`.
  - `customerId` *(string)*: Referenced customer ID.
  - `customerSnapshot` *(map)*: **Frozen immutable identity**:
    - `name`, `company`, `phone`, `gstin`, `address`, `stateCode`.
  - `placeOfSupply` *(string)*: Place of supply (e.g., `"Andhra Pradesh (37)"`).
  - `vehicleNumber` *(string)*: Vehicle registration number (e.g., `"AP 02 TC 8812"`).
  - `ewayBillNumber` *(string)*: E-Way bill number (e.g., `"241890214589"`).
  - `paymentMethod` *(string)*: Designated payment method (`"Bank Transfer"`, `"Cash"`, `"UPI"`).
  - `notes` *(string)*: Delivery terms and legal notices.
  - `items` *(array of maps)*: **Complete product itemization**:
    - `itemIndex` *(number)*: Sequence number.
    - `description` *(string)*: Detailed material description.
    - `hsn` *(string)*: 4-to-8 digit HSN code.
    - `qty` *(number)*: Supplied volume.
    - `unit` *(string)*: Unit of measure (`Mtrs`, `Nos`, `Kg`).
    - `rate` *(number)*: Price per unit.
    - `discount` *(number)*: Discount applied.
    - `taxableValue` *(number)*: Taxable base amount.
    - `taxRate` *(number)*: Tax percentage (e.g., `18`).
    - `cgst` *(number)*: Central GST amount.
    - `sgst` *(number)*: State GST amount.
    - `igst` *(number)*: Integrated GST amount.
    - `totalTax` *(number)*: CGST + SGST or IGST.
    - `total` *(number)*: Grand line total.
  - `subtotal` *(number)*: Pre-discount item subtotal.
  - `totalDiscount` *(number)*: Cumulative discount.
  - `taxableAmount` *(number)*: Total taxable valuation.
  - `cgst` *(number)*: Total CGST (9%).
  - `sgst` *(number)*: Total SGST (9%).
  - `igst` *(number)*: Total IGST (18%).
  - `totalTax` *(number)*: Combined tax liability.
  - `roundOff` *(number)*: Fraction adjustment.
  - `grandTotal` *(number)*: Final invoice amount.
  - `amountInWords` *(string)*: Amount spelled out in words.
  - `totalPaid` *(number)*: Amount received.
  - `balanceDue` *(number)*: Pending balance.
  - `createdAt` *(ISO timestamp)*.
  - `updatedAt` *(ISO timestamp)*.

#### Collection 3: `payments`
- **Path**: `payments/{paymentId}`
- **Fields**:
  - `id` *(string)*: Receipt reference code (`PAY-001`).
  - `documentId` *(string)*: Associated document (`DOC-INV-0001`).
  - `documentNumber` *(string)*: Associated document number (`UFW-INV-0001`).
  - `documentType` *(string)*: `"invoice"` or `"bill"`.
  - `customerId` *(string)*: Payer customer ID.
  - `customerName` *(string)*: Payer name.
  - `amount` *(number)*: Remitted amount (INR).
  - `paymentDate` *(string)*: Payment date (`YYYY-MM-DD`).
  - `paymentMethod` *(string)*: `"Bank Transfer"`, `"RTGS"`, `"NEFT"`, `"UPI"`, `"Cash"`.
  - `referenceNumber` *(string)*: Bank UTR, UPI transaction ID, or Cheque number.
  - `notes` *(string)*: Desk remarks.
  - `createdAt` *(ISO timestamp)*.

---

## 6. Business Product Catalog & HSN Code Directory

The system uses standard HSN classification codes in compliance with the Central Board of Indirect Taxes and Customs (CBIC):

| Standard Product Line Description | HSN Code | Standard Metric Unit | Default GST Rate | Tax Breakdown (Intra-AP) |
|---|---|---|---|---|
| **Heavy Duty GI Chainlink Fencing** (3" x 8 Gauge, 6 ft Height) | `7314` | Meters (`Mtrs`) | **18%** | CGST 9% + SGST 9% |
| **High-Tensile Solar Perimeter Barbed Wire** (2.5mm) | `7313` | Meters (`Mtrs`) | **18%** | CGST 9% + SGST 9% |
| **Heavy Galvanized Barbed Wire** (12x14 Gauge 2-Ply) | `7313` | Kilograms (`Kg`) | **18%** | CGST 9% + SGST 9% |
| **Prestressed Concrete Fencing Poles** (7 ft x 4x4 inch) | `6810` | Numbers (`Nos`) | **18%** | CGST 9% + SGST 9% |
| **Galvanized High Tensile Angle Iron Posts** (6.5 ft) | `7308` | Numbers (`Nos`) | **18%** | CGST 9% + SGST 9% |
| **Security Concertina Razor Wire Coils** (450mm / 600mm) | `7314` | Numbers (`Nos`) | **18%** | CGST 9% + SGST 9% |
| **GI Binding & Tension Straining Wire** (16 Gauge) | `7217` | Kilograms (`Kg`) | **18%** | CGST 9% + SGST 9% |
| **Site Erection, Post Embedding & Alignment Charges** | `9954` | Running Meters | **18%** | CGST 9% + SGST 9% |

---

## 7. Mathematical & GST Calculation Engine (`lib/calculations.js`)

All calculations follow Indian GST statutory rounding standards:

```javascript
// Intra-State vs Inter-State Logic
const isIntraState = customerStateCode === '37'; // Andhra Pradesh = 37

let cgstRate = 0, sgstRate = 0, igstRate = 0;
if (isIntraState) {
  cgstRate = 9;  // 9% Central GST
  sgstRate = 9;  // 9% State GST
  igstRate = 0;
} else {
  cgstRate = 0;
  sgstRate = 0;
  igstRate = 18; // 18% Integrated GST
}

// Line Item Values
const lineSubtotal = quantity * rate;
const lineTaxable = Math.max(0, lineSubtotal - discount);
const cgst = isIntraState ? (lineTaxable * 0.09) : 0;
const sgst = isIntraState ? (lineTaxable * 0.09) : 0;
const igst = !isIntraState ? (lineTaxable * 0.18) : 0;
const lineTotal = lineTaxable + cgst + sgst + igst;
```

---

## 8. Export Standards & Output Formats

Per strict business requirements, all data outputs conform to designated format specifications:

| Output Type | Allowed Formats | Forbidden Formats | Implementation File |
|---|---|---|---|
| **Commercial Tax Invoices & Counter Bills** | **`.pdf` ONLY** | `.html`, `.json` | [`components/DocumentPreviewModal.js`](file:///c:/Users/ADITYA/OneDrive/Desktop/CODE/UFW/components/DocumentPreviewModal.js) |
| **Financial Turnover Reports & Spreadsheets** | **`.csv` ONLY** | `.json` | [`lib/db.js`](file:///c:/Users/ADITYA/OneDrive/Desktop/CODE/UFW/lib/db.js) (`exportFinancialReportCSV`) |
| **Structured Accounting General Ledger** | **`.xml` ONLY** | `.json` | [`lib/db.js`](file:///c:/Users/ADITYA/OneDrive/Desktop/CODE/UFW/lib/db.js) (`exportFinancialReportXML`) |
| **Executive Business Snapshot & Turnovers** | **`.pdf` ONLY** | `.html`, `.json` | [`components/BusinessSnapshot.js`](file:///c:/Users/ADITYA/OneDrive/Desktop/CODE/UFW/components/BusinessSnapshot.js) |
| **Customer Statement of Account** | **`.csv` & `.pdf`** | `.json`, `.html` | [`app/admin-controls/page.js`](file:///c:/Users/ADITYA/OneDrive/Desktop/CODE/UFW/app/admin-controls/page.js) |

---

## 9. Security, Access Controls & Admin Command Room

Access to financial data is protected by an administrative security gate:

- **Admin Access Key**: Protected by executive key (`admin123`).
- **Protected Paths**:
  - Direct routes `/ledger`, `/payments`, and `/business-snapshot` automatically redirect to `/admin-controls` with active session verification.
- **Admin Customer Document Inspector (`customer-lookup`)**:
  - Provides instant multi-attribute lookup for any client or farmer.
  - Automatically correlates both GST Tax Invoices and Point-of-Sale Counter Bills into a single customer statement.
  - Displays lifetime billed turnover, total payments credited, pending receivables, and item line breakdowns.
- **Controlled Danger Zone**:
  - Administrative authorization required to zero out local test entries.
  - Sequence counters can be reset back to `UFW-INV-0001` and `UFW-BILL-0001` with optional customer preservation.

---

## 10. Operational Runbook & Disaster Recovery

### 10.1 Daily Operation
1. Bill generation occurs at the point-of-sale desk (`/invoices` or `/bills`).
2. Documents are immediately stored in the local memory cache and written to `localStorage` and `IndexedDB`.
3. Documents print directly to standard A4 paper or save as PDF via the preview modal.

### 10.2 Database Archival & Migration
- To export a complete financial archive for Microsoft Excel, use the **Export CSV** tool in Admin Controls.
- To export an accounting XML archive for enterprise accounting software, use the **Export XML** tool in Admin Controls.
- To inspect client accounts across multiple fiscal years, use the **Customer Invoices & Bills Inspector** in Admin Controls.
