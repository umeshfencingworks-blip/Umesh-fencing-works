# Umesh Fencing Works — Invoice & Billing Ledger

A modern, production-grade business operating system purpose-built for **Umesh Fencing Works** (Proprietor: B. Umesh, Anantapur, Andhra Pradesh).

Built with **Next.js App Router**, **React**, **Tailwind CSS**, **Local-First Zero-Latency Engine (IndexedDB + In-Memory Caching)**, and **Cloud Firestore**.

---

## 🏢 Business Identity & Legal Details

- **Business Name:** Umesh Fencing Works
- **Subtitle / Tagline:** Invoice & Billing Ledger (Chainlink, Barbed Wire, Concrete Poles & Solar Fencing)
- **Proprietor:** B. Umesh
- **GSTIN:** `37AMQPU6044G1ZH` (Andhra Pradesh — State Code `37`)
- **Facility Address:** Survey No. 87/9, Near HLC Canal, Bukkarayasamudram, Anantapur, Andhra Pradesh - 515701
- **Official Remittance Account:**
  - **Bank:** Union Bank of India
  - **Account Name:** Umesh fencing works
  - **Account Number:** `128511010000221`
  - **IFSC Code:** `UBIN0812854`
  - **Branch:** Bukkarayasamudram (Anantapur)

---

## ⚡ Key Architectural Highlights

1. **Zero-Latency Local-First Engine (`lib/db.js`)**:
   - Synchronous 0ms reads via in-memory caching and IndexedDB (`ufw_next_business_db`).
   - Seamless background cloud synchronization with Cloud Firestore.
   - Initial Seed Dataset pre-loaded with commercial customers, tax invoices, counter bills, and audit logs.
   - One-Click **"Push Local Data to Cloud Firestore"** batch synchronization button.
   - Portable **JSON Export/Import** for full offline backup and instant multi-device restoration.

2. **Full Andhra Pradesh GST Mathematical Engine (`lib/calculations.js`)**:
   - Intra-state (AP State 37): **CGST (9%) + SGST (9%)** separation.
   - Inter-state (e.g., Karnataka 29, Telangana 36): **IGST (18%)**.
   - Automatic GSTIN 2-digit state code extraction.
   - Round-off calculations and Indian numbering words generation (`Rupees ... Only`).
   - Atomic sequence numbering: `UFW-INV-xxxx` and `UFW-BILL-xxxx`.

3. **Strict A4 Single-Page Guarantee (`components/DocumentPreviewModal.js`)**:
   - Clamped to `285mm` max height with `@media print` zero-overflow guarantee.
   - Classical ornate security borders with decorative corner flourishes.
   - Complete legal terms, official bank account remittance details, and authorized signatory.

4. **Protected Financial Controls (`/admin-controls`)**:
   - Gated by administrative access key: `admin123`.
   - Protects confidential financial ledgers, payment inflow tracking, and executive business snapshots from public view.
   - Automatic redirects from `/ledger`, `/payments`, and `/business-snapshot` to the gated Admin Command Center.

5. **Smooth 200ms GPU-Accelerated Route Transitions**:
   - Lightweight CSS animation (`routeEnter`) running on the GPU without blocking render pipelines.

---

## 🗺️ Application Routing Structure

| Route | Description |
|---|---|
| `/` | **Landing Portal** with verified business credentials, feature cards, and compliance highlights. |
| `/dashboard` | **Operational Desk** with receivables metrics, recent dispatches, and quick actions. |
| `/invoices` | **GST Tax Invoices** (B2B register, tax calculation, balance tracking, print preview). |
| `/invoices/create` | Instant subroute launcher for the Tax Invoice creator modal. |
| `/bills` | **Retail & Counter Bills** (POS desk for cash/UPI counter sales with farmers and local contractors). |
| `/bills/create` | Instant subroute launcher for the Counter Bill creator modal. |
| `/customers` | **Customer Registry** with GSTIN validation, commercial standing, and Profile 360°. |
| `/admin-controls` | **Admin Command Center** (Key: `admin123`) containing the Financial Ledger, Payments & Collections, Business Snapshot, GST Taxes, and Cloud Sync tools. |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

Default local address: `http://localhost:3000`
Admin Access Key: `admin123`

---

## 📖 System Architecture & Database Documentation

For in-depth architectural details, SQLite DDL schemas, Cloud Firestore collection definitions, and the 2-year auditability framework, refer to:
- [System Architecture & Database Specification (ARCHITECTURE.md)](file:///c:/Users/ADITYA/OneDrive/Desktop/CODE/UFW/ARCHITECTURE.md)

