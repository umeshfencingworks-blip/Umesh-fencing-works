# Umesh Fencing Works — Invoice & Billing Ledger

A modern, production-grade business operating system purpose-built for **Umesh Fencing Works** (Proprietor: C. Umesh, Anantapur, Andhra Pradesh).

Built with **Next.js App Router**, **React**, **Tailwind CSS**, **Local-First Zero-Latency Engine (IndexedDB + In-Memory Caching)**, and **Cloud Firestore**.

---

## 🏢 Business Identity & Legal Details

- **Business Name:** Umesh Fencing Works
- **Subtitle / Tagline:** Invoice & Billing Ledger (Chainlink, Barbed Wire, Concrete Poles & Solar Fencing)
- **Proprietor:** C. Umesh
- **GSTIN:** `37AMQPU6044G1ZH` (Andhra Pradesh — State Code `37`)
- **Facility Address:** Survey No. 87/9, Near HLC Canal, Bukkarayasamudram, Anantapur, Andhra Pradesh - 515701
- **Official Remittance Account:**
  - **Bank:** Union Bank of India
  - **Account Name:** Umesh fencing works
  - **Account Number:** `128511010000221`
  - **IFSC Code:** `UBIN0812854`
  - **Branch:** Georgepet (Anantapur)

---

## ✨ Features

### Billing & Invoicing
- **GST Tax Invoices (B2B):** auto CGST+SGST (9%+9%) for Andhra Pradesh, IGST (18%) for inter-state, GSTIN state-code detection.
- **Retail & Counter Bills (POS):** fast cash/UPI bills for farmers and local contractors.
- Automatic numbering (`UFW-INV-xxxx`, `UFW-BILL-xxxx`), round-off, amount in words (`Rupees ... Only`).
- Print-ready A4 preview with bank details, terms and signatory; PDF download.
- **WhatsApp sharing** of invoices/bills.
- Void or delete documents with audit trail.

### Customers & Payments
- **Customer Registry** with GSTIN validation and a 360° customer profile (history, balances).
- **Record payments** against invoices/bills; outstanding balance tracking.
- Payment inflows register.

### Admin Command Center (`/admin-controls`)
- **Financial Ledger** — unified receivables ledger.
- **Purchase Ledger** — supplier purchases, purchase payments, expenses.
- **Scrap & Materials** — stock catalog, restocking, stock sales, scrap/wastage register.
- **Customer Lookup**, **Payment Inflows**, **Executive Snapshot** (business KPIs), **GST Taxes** summary.
- **Exports:** financial report (CSV/XML), purchase ledger CSV, materials & scrap CSV.

### Dashboard
- Operational Desk with receivables metrics, recent documents and quick actions.

### Security
- Google Sign-In restricted to `umeshfencingworks@gmail.com`.
- Admin area additionally gated by access key.
- Firestore rules allow read/write only for the signed-in admin.

### Data & Sync
- **Local-first:** instant reads from memory, localStorage and IndexedDB; works offline.
- **Cloud Firestore real-time sync** across all devices after sign-in.
- First sign-in on a device uploads any local-only records to the cloud.
- Manual "Push Local Data to Cloud" option.

---

## 🗺️ Routes

| Route | Description |
|---|---|
| `/` | Landing page and sign-in |
| `/dashboard` | Operational Desk |
| `/invoices`, `/invoices/create` | GST Tax Invoices |
| `/bills`, `/bills/create` | Retail & Counter Bills |
| `/customers` | Customer Registry |
| `/admin-controls` | Admin Command Center (tabs listed above) |
| `/ledger`, `/payments`, `/business-snapshot`, `/purchases`, `/purchase-ledger`, `/scrap-materials` | Redirect into the matching Admin tab |

---

## ☁️ Firebase Setup

- Firestore database ID is **`default`** (not `(default)`).
- Publish `firestore.rules` in Firebase Console → Firestore → `default` → Rules.
- Enable Google sign-in under Authentication → Sign-in method.
- Config can be overridden via `NEXT_PUBLIC_FIREBASE_*` env vars (see `.env.example`).

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
- [System Architecture & Database Specification (ARCHITECTURE.md)](ARCHITECTURE.md)

