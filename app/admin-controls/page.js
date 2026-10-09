"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import BusinessSnapshot from "@/components/BusinessSnapshot";
import PurchaseLedger from "@/components/PurchaseLedger";
import ScrapAndMaterials from "@/components/ScrapAndMaterials";
import { formatINR, BUSINESS_DETAILS } from "@/lib/calculations";
import {
  zeroOutPortalEntries,
  voidDocument,
  deleteDocument,
  deletePayment,
  deleteCustomer,
  exportFinancialReportCSV,
  exportFinancialReportXML,
  downloadFile,
} from "@/lib/db";
import {
  ShieldAlert,
  Lock,
  Unlock,
  BookOpen,
  DollarSign,
  TrendingUp,
  Truck,
  Boxes,
  FileText,
  Receipt,
  Users,
  Percent,
  AlertTriangle,
  History,
  FileSpreadsheet,
  FileCode,
  LayoutDashboard,
  CheckCircle,
  Eye,
  CreditCard,
  Ban,
  Printer,
  Search,
  Trash2,
  AlertOctagon,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";

function AdminControlsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const {
    currentPath,
    navigate,
    isAdminAuthenticated,
    adminUser,
    adminAuthLoading,
    adminAuthError,
    unauthorizedEmailAttempt,
    dismissUnauthorizedModal,
    primaryAdminEmail,
    loginWithGoogle,
    logoutAdmin,
    authorizedAdminEmails,
    firebaseConsoleUrl,
    metrics,
    documents,
    payments,
    customersWithStats,
    auditLogs,
    ledger,
    purchases,
    purchaseSummary,
    materials,
    inventorySummary,
    openPreview,
    openPaymentModal,
    openCustomerProfile,
    showToast,
  } = useUI();

  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/admin-controls?tab=${newTab}`);
  };
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");

  // Customer Invoices & Bills Lookup States
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
  const [customerDocFilter, setCustomerDocFilter] = useState("all");
  const [customerListSearch, setCustomerListSearch] = useState("");

  // Zero-Out Portal Entries Modal & Security States
  const [showZeroOutModal, setShowZeroOutModal] = useState(false);
  const [zeroOutKeyInput, setZeroOutKeyInput] = useState("");
  const [wipeCustomers, setWipeCustomers] = useState(false);
  const [zeroOutLoading, setZeroOutLoading] = useState(false);
  const [zeroOutError, setZeroOutError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const customerIdParam = searchParams.get("customerId");

  // Sync tab with query param or currentPath
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
      return;
    }
    if (currentPath) {
      if (currentPath.includes("tab=")) {
        const match = currentPath.match(/tab=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          setActiveTab(match[1]);
          return;
        }
      }
      if (currentPath.startsWith("/ledger")) {
        setActiveTab("financial-ledger");
      } else if (currentPath.startsWith("/purchase-ledger") || currentPath.startsWith("/purchases")) {
        setActiveTab("purchase-ledger");
      } else if (
        currentPath.startsWith("/scrap-materials") ||
        currentPath.startsWith("/materials-scrap") ||
        currentPath.startsWith("/materials") ||
        currentPath.startsWith("/scrap")
      ) {
        setActiveTab("scrap-materials");
      } else if (currentPath.startsWith("/payments")) {
        setActiveTab("payments");
      } else if (currentPath.startsWith("/business-snapshot")) {
        setActiveTab("snapshot");
      }
    }
  }, [tabParam, currentPath]);

  // Robust matching helper to associate invoices & bills with a customer
  const docMatchesCustomer = (doc, cust) => {
    if (!doc || !cust) return false;
    // Don't match solely on generic "WALK-IN" IDs unless phone or name actually matches
    if (doc.customerId && cust.id && doc.customerId !== "WALK-IN" && cust.id !== "WALK-IN" && doc.customerId === cust.id) return true;
    if (doc.customerSnapshot?.id && cust.id && doc.customerSnapshot.id !== "WALK-IN" && cust.id !== "WALK-IN" && doc.customerSnapshot.id === cust.id) return true;

    const custGstin = (cust.gstin || "").trim().toUpperCase();
    const docGstin = (doc.customerSnapshot?.gstin || "").trim().toUpperCase();
    if (custGstin && docGstin && custGstin !== "UNREGISTERED" && custGstin === docGstin) return true;

    const custPhone = (cust.phone || "").replace(/\D/g, "");
    const docPhone = (doc.customerSnapshot?.phone || "").replace(/\D/g, "");
    if (custPhone && docPhone && custPhone.length >= 10 && custPhone === docPhone) return true;

    const cName = (cust.company || cust.name || "").trim().toLowerCase();
    const dName = (doc.customerSnapshot?.company || doc.customerSnapshot?.name || "").trim().toLowerCase();
    if (cName && dName && cName === dName) return true;

    return false;
  };

  // All selectable customers combining master registry and all walk-in/counter parties
  const allSelectableCustomers = useMemo(() => {
    const map = new Map();

    // 1. Registered customers from master registry (loaded from Firestore customers collection)
    (customersWithStats || []).forEach((c) => {
      if (c && c.id) {
        map.set(c.id, { ...c });
      }
    });

    // 2. Also harvest walk-in or counter customers found in documents
    (documents || []).forEach((d) => {
      const snap = d.customerSnapshot;
      if (!snap) return;
      const name = (snap.company || snap.name || "").trim();
      const phone = (snap.phone || "").replace(/\D/g, "");
      if (!name && !phone) return;

      const alreadyExists = Array.from(map.values()).some((c) => docMatchesCustomer(d, c));
      if (!alreadyExists) {
        const uniqueId = d.customerId && d.customerId !== "WALK-IN"
          ? d.customerId
          : phone && phone.length >= 10
          ? `CUST-${phone.slice(-6)}`
          : `WALK-${(name || "CUST").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${d.id}`;

        map.set(uniqueId, {
          id: uniqueId,
          name: snap.name || name || "Customer",
          company: snap.company || name || "",
          phone: snap.phone || "",
          email: snap.email || "",
          gstin: snap.gstin || "Unregistered",
          address: snap.billingAddress || snap.address || "",
          stateCode: snap.stateCode || "37",
          isWalkInRecord: true,
          totalInvoices: d.documentType === "invoice" ? 1 : 0,
          totalBills: d.documentType === "bill" ? 1 : 0,
          lifetimeRevenue: Number(d.grandTotal) || 0,
          totalPaid: Number(d.totalPaid) || 0,
          totalOutstanding: Number(d.balanceDue) || 0,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const nameA = (a.company || a.name || "").toLowerCase();
      const nameB = (b.company || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [customersWithStats, documents]);

  // Pre-select customer if customerIdParam provided in query
  useEffect(() => {
    if (customerIdParam && allSelectableCustomers.length > 0 && !selectedCustomerForHistory) {
      const found = allSelectableCustomers.find((c) => c.id === customerIdParam);
      if (found) setSelectedCustomerForHistory(found);
    }
  }, [customerIdParam, allSelectableCustomers, selectedCustomerForHistory]);

  // Live filter for customer search query
  const filteredCustomerSearchResults = useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase();
    if (!q) return allSelectableCustomers;
    return allSelectableCustomers.filter((c) => {
      const company = (c.company || "").toLowerCase();
      const name = (c.name || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      const gstin = (c.gstin || "").toLowerCase();
      return company.includes(q) || name.includes(q) || phone.includes(q) || gstin.includes(q);
    });
  }, [allSelectableCustomers, customerSearchQuery]);

  // Selected customer's documents (both invoices and bills)
  const selectedCustomerDocs = useMemo(() => {
    if (!selectedCustomerForHistory) return [];
    return (documents || []).filter((d) => docMatchesCustomer(d, selectedCustomerForHistory));
  }, [selectedCustomerForHistory, documents]);

  // Filtered documents by document type or unpaid status
  const filteredSelectedCustomerDocs = useMemo(() => {
    return selectedCustomerDocs.filter((d) => {
      if (customerDocFilter === "invoices") return d.documentType === "invoice";
      if (customerDocFilter === "bills") return d.documentType === "bill";
      if (customerDocFilter === "unpaid") return Number(d.balanceDue) > 0 && d.status !== "void";
      return true;
    });
  }, [selectedCustomerDocs, customerDocFilter]);

  // Selected customer's payment receipts
  const selectedCustomerPayments = useMemo(() => {
    if (!selectedCustomerForHistory) return [];
    const cust = selectedCustomerForHistory;
    const docIds = new Set(selectedCustomerDocs.map((d) => d.id));
    const docNums = new Set(selectedCustomerDocs.map((d) => d.documentNumber));

    return (payments || []).filter(
      (p) =>
        (p.customerId && p.customerId === cust.id) ||
        (p.documentId && docIds.has(p.documentId)) ||
        (p.documentNumber && docNums.has(p.documentNumber)) ||
        (p.customerName && (p.customerName.toLowerCase() === (cust.company || cust.name || "").toLowerCase()))
    );
  }, [selectedCustomerForHistory, selectedCustomerDocs, payments]);

  // Aggregate statistics for selected customer
  const customerStats = useMemo(() => {
    if (!selectedCustomerForHistory) return { invoiceCount: 0, billCount: 0, totalBilled: 0, totalPaid: 0, balanceDue: 0, invoiceTotal: 0, billTotal: 0 };
    let invoiceCount = 0;
    let billCount = 0;
    let invoiceTotal = 0;
    let billTotal = 0;
    let totalBilled = 0;
    let totalPaid = 0;
    let balanceDue = 0;

    selectedCustomerDocs.forEach((d) => {
      if (d.status === "void") return;
      const g = Number(d.grandTotal) || 0;
      const p = Number(d.totalPaid) || 0;
      const b = Number(d.balanceDue) || 0;

      totalBilled += g;
      totalPaid += p;
      balanceDue += b;

      if (d.documentType === "invoice") {
        invoiceCount++;
        invoiceTotal += g;
      } else {
        billCount++;
        billTotal += g;
      }
    });

    return {
      invoiceCount,
      billCount,
      invoiceTotal,
      billTotal,
      totalBilled,
      totalPaid,
      balanceDue,
    };
  }, [selectedCustomerForHistory, selectedCustomerDocs]);

  // Aggregate grand totals for Financial Ledger (Debit, Credit, Net Outstanding)
  const ledgerTotals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    (ledger || []).forEach((entry) => {
      totalDebit = Number((totalDebit + (Number(entry.debit) || 0)).toFixed(2));
      totalCredit = Number((totalCredit + (Number(entry.credit) || 0)).toFixed(2));
    });
    const netOutstanding = Math.max(0, Number((totalDebit - totalCredit).toFixed(2)));
    return { totalDebit, totalCredit, netOutstanding };
  }, [ledger]);

  // Export customer statement as .csv
  const handleExportCustomerStatementCSV = (cust, docs, pays) => {
    const rows = [];
    rows.push(["UMESH FENCING WORKS - STATEMENT OF ACCOUNT"]);
    rows.push([`Customer: ${cust.company ? `${cust.company} (${cust.name})` : cust.name}`]);
    rows.push([`GSTIN: ${cust.gstin || "Unregistered"}`, `Phone: ${cust.phone || "N/A"}`]);
    rows.push([`Address: ${cust.address || "N/A"}`]);
    rows.push([`Generated On: ${new Date().toLocaleString()}`]);
    rows.push([]);
    rows.push(["--- BILLS & INVOICES REGISTER ---"]);
    rows.push(["Type", "Document #", "Issue Date", "Due Date", "Taxable Value (INR)", "Tax (INR)", "Grand Total (INR)", "Paid (INR)", "Balance Due (INR)", "Status"]);
    docs.forEach((d) => {
      rows.push([
        d.documentType === "invoice" ? "GST Tax Invoice" : "Retail Counter Bill",
        d.documentNumber,
        d.issueDate,
        d.dueDate || "N/A",
        d.taxableAmount || 0,
        d.totalTax || 0,
        d.grandTotal || 0,
        d.totalPaid || 0,
        d.balanceDue || 0,
        d.paymentStatus || d.status,
      ]);
    });
    rows.push([]);
    rows.push(["--- PAYMENT RECEIPTS LEDGER ---"]);
    rows.push(["Receipt #", "Date", "Document #", "Payment Mode", "Reference / UTR", "Amount Received (INR)"]);
    pays.forEach((p) => {
      rows.push([
        p.id,
        p.paymentDate,
        p.documentNumber || "N/A",
        p.paymentMethod || "N/A",
        p.referenceNumber || "N/A",
        p.amount || 0,
      ]);
    });

    const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const safeName = (cust.company || cust.name || "customer").replace(/[^a-zA-Z0-9]/g, "_");
    downloadFile(csvContent, `customer-statement-${safeName}-${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8");
    showToast(`Statement exported as .csv for ${cust.company || cust.name}`, "success");
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleZeroOutSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (zeroOutKeyInput.trim() !== "admin123") {
      setZeroOutError("Authorization Failed: Invalid Admin Portal Key. Confirmation aborted.");
      return;
    }
    setZeroOutError("");
    setZeroOutLoading(true);
    try {
      const res = await zeroOutPortalEntries({
        adminKey: zeroOutKeyInput.trim(),
        wipeCustomers,
      });
      showToast(res.message || "All portal entries have been completely zeroed out to ₹0.00!", "success");
      setShowZeroOutModal(false);
      setZeroOutKeyInput("");
      setWipeCustomers(false);
    } catch (err) {
      console.error("Zero-out error:", err);
      setZeroOutError(err.message || "Failed to zero out portal entries.");
      showToast(err.message || "Error executing zero out.", "error");
    } finally {
      setZeroOutLoading(false);
    }
  };

  // If Loading Auth Status
  if (adminAuthLoading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-xs font-mono font-semibold text-[#0E1C2F]">
          Verifying Admin Credentials...
        </div>
      </div>
    );
  }

  // If Not Authenticated: Show Firebase Google Auth Gate & Access Denied Popup
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        {/* ACCESS DENIED POPUP MODAL */}
        {unauthorizedEmailAttempt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border-2 border-red-500 shadow-2xl max-w-md w-full p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-500 mx-auto flex items-center justify-center text-red-600 shadow-sm">
                <Ban className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-red-950 font-serif">
                  Access Denied
                </h2>
                <p className="text-sm font-bold text-red-600">
                  You don&apos;t have access to this page.
                </p>
                <p className="text-xs text-[#5A6A80] pt-1">
                  Signed in as: <strong className="text-[#0E1C2F] font-mono break-all">{unauthorizedEmailAttempt}</strong>
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Restricted Administrator Access</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Only the proprietor account (<strong>umeshfencingworks@gmail.com</strong>) has access to the Umesh Fencing Works management command room.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    dismissUnauthorizedModal();
                    handleGoogleSignIn();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In with Authorized Email</span>
                </button>
                <button
                  type="button"
                  onClick={dismissUnauthorizedModal}
                  className="py-2.5 px-4 rounded-xl bg-[#F2EFE8] hover:bg-[#E8E5DD] text-[#344054] text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login Card */}
        <div className="bg-white rounded-2xl border-2 border-[#0E1C2F] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 text-center relative">
          <div className="w-16 h-16 rounded-full bg-[#0E1C2F] border-2 border-[#B45309] mx-auto flex items-center justify-center text-[#FDE68A] shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-[#0E1C2F] font-serif">
              Admin Command Room
            </h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              Protected executive management area for Umesh Fencing Works.
            </p>
          </div>

          {/* Diagnostic Setup Alert if auth/configuration-not-found occurred */}
          {adminAuthError?.code === "auth/configuration-not-found" && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Firebase Auth Setup Required</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                Google Sign-In is not enabled yet in your Firebase Project (<code>umesh-fencing-works</code>).
              </p>
              <div className="text-[11px] text-amber-950 space-y-1 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                  Quick 1-Minute Activation:
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Open Firebase Console via the button below</li>
                  <li>Click <strong>&quot;Get started&quot;</strong> in Authentication</li>
                  <li>Under <strong>Sign-in method</strong>, enable <strong>Google</strong> &amp; Save</li>
                </ol>
              </div>
              <a
                href={firebaseConsoleUrl || "https://console.firebase.google.com/project/umesh-fencing-works/authentication/providers"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-colors"
              >
                <span>Enable Google Auth in Firebase Console</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Sole Login Method: Google Authentication */}
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#F8F9FA] text-[#0E1C2F] border-2 border-[#DCD7CD] hover:border-[#0E1C2F] text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 group cursor-pointer"
            >
              {/* Google Official G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? "Connecting to Google..." : "Sign In with Google"}</span>
            </button>

            <div className="bg-[#FBF9F5] border border-[#E8E5DD] rounded-xl p-3 text-[11px] text-[#5A6A80] text-left space-y-1.5">
              <div className="font-bold text-[#0E1C2F] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Authorized Administrator Account:</span>
              </div>
              <div className="text-[11px] font-mono text-[#B45309] font-bold break-all bg-white px-2 py-1 rounded border border-[#E8E5DD]">
                {primaryAdminEmail || "umeshfencingworks@gmail.com"}
              </div>
              <div className="text-[10px] text-[#667085] leading-snug">
                Protected proprietor console. Only the authorized Google administrator account can sign in.
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#667085] pt-3 border-t border-[#E8E5DD] flex items-center justify-center gap-1.5 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Firebase Google Authentication • Protected Portal</span>
          </div>
        </div>
      </div>
    );
  }

  // Admin Navigation Tabs List
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "customer-lookup", label: "Customer Invoices & Bills", icon: Search, highlight: true },
    { id: "financial-ledger", label: "Financial Ledger", icon: BookOpen, highlight: true },
    { id: "purchase-ledger", label: "Purchase Ledger", icon: Truck, highlight: true, badge: "RAW MATERIALS" },
    { id: "scrap-materials", label: "Scrap & Materials", icon: Boxes, highlight: true, badge: "STOCK & SCRAP" },
    { id: "payments", label: "Payments", icon: DollarSign, highlight: true },
    { id: "snapshot", label: "Business Snapshot", icon: TrendingUp, highlight: true },
    { id: "invoices", label: "Invoices Archive", icon: FileText },
    { id: "bills", label: "Bills Archive", icon: Receipt },
    { id: "customers", label: "Customers Balance", icon: Users },
    { id: "gst", label: "GST Taxes", icon: Percent },
    { id: "reports", label: "Overdue Accounts", icon: AlertTriangle },
    { id: "activity", label: "Audit Logs", icon: History },
    { id: "system", label: "Financial Reports", icon: FileSpreadsheet, highlight: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0E1C2F] text-white p-4 sm:p-5 rounded-xl border border-[#1C314D] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#14243B] border border-[#B45309] flex items-center justify-center text-[#FDE68A]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-serif">Admin Command Room</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Session Authenticated
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Proprietor: {BUSINESS_DETAILS.proprietor} • GSTIN: {BUSINESS_DETAILS.gstin}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => {
              const csv = exportFinancialReportCSV();
              const dateStr = new Date().toISOString().split("T")[0];
              downloadFile(csv, `ufw-financial-report-${dateStr}.csv`, "text/csv;charset=utf-8");
              showToast("Financial report downloaded as .csv", "success");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#102A1A] hover:bg-[#163D25] text-xs font-semibold text-emerald-300 border border-emerald-700/60 transition-colors"
            title="Download full financial report spreadsheet (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              const xml = exportFinancialReportXML();
              const dateStr = new Date().toISOString().split("T")[0];
              downloadFile(xml, `ufw-financial-report-${dateStr}.xml`, "application/xml;charset=utf-8");
              showToast("Accounting ledger downloaded as .xml", "success");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1C314D] hover:bg-[#284166] text-xs font-semibold text-white border border-[#2d466b] transition-colors"
            title="Download structured accounting ledger (.xml)"
          >
            <FileCode className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>Export XML</span>
          </button>
          <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
            {adminUser?.photoURL && (
              <img
                src={adminUser.photoURL}
                alt={adminUser.displayName || "Admin"}
                className="w-7 h-7 rounded-full border border-[#FDE68A] object-cover"
              />
            )}
            <div className="hidden md:block text-left">
              <div className="text-[11px] font-bold text-white leading-none">
                {adminUser?.displayName || "Administrator"}
              </div>
              <div className="text-[9px] font-mono text-emerald-300 leading-none mt-0.5">
                {adminUser?.email || "umeshfencingworks@gmail.com"}
              </div>
            </div>
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors ml-1"
              title="Sign Out of Admin Session"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="bg-white p-1.5 rounded-xl border border-[#E8E5DD] shadow-2xs overflow-x-auto no-print scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? tab.danger
                      ? "bg-red-700 text-white shadow-xs"
                      : "bg-[#0E1C2F] text-white shadow-xs"
                    : tab.danger
                    ? "text-red-700 hover:bg-red-50 hover:text-red-900 border border-red-200"
                    : tab.id === "purchase-ledger"
                    ? "text-[#B45309] bg-amber-50/80 hover:bg-amber-100 border border-amber-300/80 shadow-2xs"
                    : tab.highlight
                    ? "text-[#B45309] hover:bg-[#FEF3C7]/40"
                    : "text-[#374151] hover:bg-[#F2EFE8] hover:text-[#0E1C2F]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? (tab.danger ? "text-white" : "text-[#FDE68A]") : tab.danger ? "text-red-600" : tab.id === "purchase-ledger" ? "text-[#B45309]" : ""}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    isCurrent ? "bg-[#B45309] text-white" : "bg-amber-200 text-amber-900"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#667085] font-mono block">
                Total Turnover Billed
              </span>
              <span className="text-2xl font-black text-[#0E1C2F] font-sans mt-1 block">
                {formatINR(metrics.totalRevenue)}
              </span>
              <div className="text-[11px] text-[#475467] mt-1 pt-1 border-t border-[#E8E5DD]">
                {metrics.invoiceCount} Invoices • {metrics.billCount} Retail Bills
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-emerald-800 font-mono block">
                Total Inflow Collected
              </span>
              <span className="text-2xl font-black text-emerald-700 font-sans mt-1 block">
                {formatINR(metrics.totalPaid)}
              </span>
              <div className="text-[11px] text-emerald-800 mt-1 pt-1 border-t border-[#E8E5DD]">
                {metrics.collectionRate}% Recovery Efficiency
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#991B1B] font-mono block">
                Current Outstanding
              </span>
              <span className="text-2xl font-black text-[#991B1B] font-sans mt-1 block">
                {formatINR(metrics.totalOutstanding)}
              </span>
              <div className="text-[11px] text-[#991B1B] mt-1 pt-1 border-t border-[#E8E5DD]">
                {metrics.overdueCount} Accounts Overdue
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#667085] font-mono block">
                Audit Journal Entries
              </span>
              <span className="text-2xl font-black text-[#0E1C2F] font-sans mt-1 block">
                {ledger.length}
              </span>
              <div className="text-[11px] text-[#475467] mt-1 pt-1 border-t border-[#E8E5DD]">
                {auditLogs.length} Security &amp; Activity Logs
              </div>
            </div>
          </div>

          {/* Raw Material Purchases & Outgoing Expenses Overview Widget */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B45309] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E1C2F]">Raw Material Purchase Ledger</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-[#B45309] font-bold">
                    {purchases?.length || 0} Bills Logged
                  </span>
                </div>
                <div className="text-xs text-[#667085] mt-0.5">
                  Total Purchases: <strong className="text-[#0E1C2F] font-mono">{formatINR(purchaseSummary?.totalExpensesAmount || 0)}</strong> • Outgoing Paid: <strong className="text-emerald-700 font-mono">{formatINR(purchaseSummary?.totalExpensesPaid || 0)}</strong> • Supplier Payables: <strong className="text-red-700 font-mono">{formatINR(purchaseSummary?.totalPendingPayables || 0)}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleTabChange("purchase-ledger")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#DCD7CD] hover:bg-[#F2EFE8] text-xs font-bold text-[#0E1C2F] transition-colors shrink-0"
            >
              <span>Open Purchase Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B45309]" />
            </button>
          </div>

          {/* Scrap and Materials Bought Overview Widget */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0E1C2F]">Scrap &amp; Materials Bought</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {inventorySummary?.totalMaterialsCount || 0} Materials
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-[#B45309] font-bold">
                    {inventorySummary?.totalScrapEntriesCount || 0} Scrap Logs
                  </span>
                </div>
                <div className="text-xs text-[#667085] mt-0.5">
                  Total Bought: <strong className="text-[#0E1C2F] font-mono">{(inventorySummary?.totalBoughtQty || 0).toLocaleString()}</strong> • Sold Out: <strong className="text-purple-700 font-mono">-{(inventorySummary?.totalSoldQty || 0).toLocaleString()}</strong> • Scrap: <strong className="text-[#B45309] font-mono">-{(inventorySummary?.totalScrapQty || 0).toLocaleString()}</strong> • In-Stock: <strong className="text-emerald-700 font-mono">{(inventorySummary?.totalInStockQty || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleTabChange("scrap-materials")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#14243B] text-xs font-bold text-white transition-colors shrink-0 shadow-xs"
            >
              <span>Manage Scrap &amp; Stock</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FDE68A]" />
            </button>
          </div>

          {/* Quick Access: Customer History & Ledger Spotlight */}
          <div className="bg-gradient-to-r from-[#0E1C2F] to-[#1C314D] rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-[#1C314D]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#FDE68A]" />
                <h3 className="text-sm font-bold font-serif">Customer Invoices &amp; Bills Inspector</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-[#FDE68A] font-bold border border-amber-500/30">
                  New Admin Tool
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Quickly search for any commercial client or retail walk-in customer to inspect all their past GST tax invoices, retail bills, item breakdowns, and payment collection receipts in one unified view.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("customer-lookup")}
              className="px-4 py-2 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              <span>Search Customer Records</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FDE68A]" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
              Recent Audit &amp; System Events
            </h2>
            <div className="divide-y divide-[#E8E5DD] text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-[#EFECE4] text-[#0E1C2F]">
                      {log.action}
                    </span>
                    <span className="text-[#182230]">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-[#667085] font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER INVOICES & BILLS LOOKUP TAB */}
      {activeTab === "customer-lookup" && (
        <div className="space-y-6">
          {/* Search & Selection Card */}
          <div className="bg-white p-5 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[#0E1C2F] flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#B45309]" />
                  <span>Customer Invoices &amp; Bills Archive</span>
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Search for any customer or business to immediately view all associated GST tax invoices, retail counter bills, and payment records.
                </p>
              </div>

              {/* Quick Dropdown Picker */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#667085] font-medium whitespace-nowrap">Choose Client:</label>
                <select
                  value={selectedCustomerForHistory?.id || ""}
                  onChange={(e) => {
                    const custId = e.target.value;
                    const found = allSelectableCustomers.find((c) => c.id === custId) || null;
                    setSelectedCustomerForHistory(found);
                  }}
                  className="px-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-lg text-xs font-semibold text-[#0E1C2F] focus:border-[#0E1C2F] outline-hidden w-full sm:max-w-xs truncate"
                >
                  <option value="">-- Select Registered Client ({allSelectableCustomers.length}) --</option>
                  {allSelectableCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} (${c.name})` : c.name} {c.gstin && c.gstin !== "Unregistered" ? `• GSTIN: ${c.gstin}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search customer by company name, contact person, mobile number, GSTIN, or city..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#F7F5F0] border border-[#DCD7CD] focus:border-[#0E1C2F] focus:bg-white rounded-lg text-xs font-medium outline-hidden transition-all text-[#0E1C2F]"
              />
              {customerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCustomerSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[#667085] hover:text-[#0E1C2F] p-0.5 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Result Matches (if typing query) */}
            {customerSearchQuery && (
              <div className="pt-2 border-t border-[#E8E5DD] space-y-2">
                <div className="text-[11px] font-mono text-[#667085] flex items-center justify-between">
                  <span>Search Matches ({filteredCustomerSearchResults.length} found):</span>
                  <span className="text-[10px] text-[#B45309]">Click any customer to inspect all their bills and invoices</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {filteredCustomerSearchResults.length === 0 ? (
                    <div className="col-span-full py-4 text-center text-xs text-[#667085]">
                      No customers found matching &quot;{customerSearchQuery}&quot;. Try searching with a different name or phone number.
                    </div>
                  ) : (
                    filteredCustomerSearchResults.map((cust) => {
                      const isSelected = selectedCustomerForHistory?.id === cust.id;
                      const custDocs = documents.filter((d) => docMatchesCustomer(d, cust));
                      const invCount = custDocs.filter((d) => d.documentType === "invoice").length;
                      const billCount = custDocs.filter((d) => d.documentType === "bill").length;
                      const outstanding = custDocs.reduce((sum, d) => (d.status !== "void" ? sum + (Number(d.balanceDue) || 0) : sum), 0);

                      return (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomerForHistory(cust);
                            setCustomerSearchQuery("");
                          }}
                          className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#0E1C2F] text-white border-[#0E1C2F] shadow-sm"
                              : "bg-[#FBF9F5] border-[#E8E5DD] hover:border-[#B45309] hover:bg-white"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs truncate">
                              {cust.company || cust.name}
                            </div>
                            {cust.company && cust.name && cust.company !== cust.name && (
                              <div className={`text-[10px] truncate ${isSelected ? "text-slate-300" : "text-[#667085]"}`}>
                                Contact: {cust.name}
                              </div>
                            )}
                            <div className={`text-[10px] font-mono mt-1 ${isSelected ? "text-[#FDE68A]" : "text-[#B45309]"}`}>
                              GSTIN: {cust.gstin || "Unregistered"} {cust.phone ? `• ${cust.phone}` : ""}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between text-[10px]">
                            <span className={isSelected ? "text-slate-200" : "text-[#475467]"}>
                              {invCount} Invoices • {billCount} Bills
                            </span>
                            <span className={`font-mono font-bold ${isSelected ? "text-white" : outstanding > 0 ? "text-[#991B1B]" : "text-emerald-700"}`}>
                              {outstanding > 0 ? `Due: ${formatINR(outstanding)}` : "Settled"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* If a customer is selected: Display their complete billing record */}
          {selectedCustomerForHistory ? (
            <div id="printable-customer-statement" className="space-y-6">
              {/* Customer Header & Meta Card */}
              <div className="bg-[#0E1C2F] text-white p-5 rounded-xl border border-[#1C314D] shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#14243B] border-2 border-[#B45309] flex items-center justify-center text-[#FDE68A] shrink-0 mt-0.5">
                      <Building className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-lg font-bold font-serif leading-tight">
                          {selectedCustomerForHistory.company || selectedCustomerForHistory.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102A1A] text-emerald-300 font-bold border border-emerald-700/60">
                          Active Customer File
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                        {selectedCustomerForHistory.name && selectedCustomerForHistory.company && selectedCustomerForHistory.company !== selectedCustomerForHistory.name && (
                          <span>Contact: <strong className="text-white">{selectedCustomerForHistory.name}</strong></span>
                        )}
                        {selectedCustomerForHistory.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-[#FDE68A]" />
                            <span>{selectedCustomerForHistory.phone}</span>
                          </span>
                        )}
                        {selectedCustomerForHistory.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#FDE68A]" />
                            <span>{selectedCustomerForHistory.email}</span>
                          </span>
                        )}
                        <span className="font-mono">
                          GSTIN: <strong className="text-[#FDE68A]">{selectedCustomerForHistory.gstin || "Unregistered"}</strong>
                        </span>
                        {selectedCustomerForHistory.address && (
                          <span className="flex items-center gap-1 truncate max-w-sm">
                            <MapPin className="w-3 h-3 text-[#FDE68A] shrink-0" />
                            <span className="truncate">{selectedCustomerForHistory.address}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center flex-wrap gap-2 no-print">
                    <button
                      onClick={() => handleExportCustomerStatementCSV(selectedCustomerForHistory, selectedCustomerDocs, selectedCustomerPayments)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102A1A] hover:bg-[#163D25] text-xs font-semibold text-emerald-300 border border-emerald-700/60 transition-colors shadow-2xs"
                      title="Download customer statement spreadsheet (.csv)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Statement (.csv)</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors shadow-2xs"
                      title="Print or Save statement as PDF (.pdf)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Statement (.pdf)</span>
                    </button>
                    <button
                      onClick={() => openCustomerProfile(selectedCustomerForHistory)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profile 360°</span>
                    </button>
                    <button
                      onClick={() => setSelectedCustomerForHistory(null)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                      title="Clear Selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Financial Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#667085] font-mono block">
                    GST Commercial Tax Invoices
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-[#0E1C2F] font-sans">
                      {customerStats.invoiceCount} Invoices
                    </span>
                    <span className="text-xs font-mono font-bold text-[#475467]">
                      {formatINR(customerStats.invoiceTotal)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085] pt-1 border-t border-[#E8E5DD]">
                    B2B commercial dispatches
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#667085] font-mono block">
                    Retail Counter Bills
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-[#0E1C2F] font-sans">
                      {customerStats.billCount} Bills
                    </span>
                    <span className="text-xs font-mono font-bold text-[#475467]">
                      {formatINR(customerStats.billTotal)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085] pt-1 border-t border-[#E8E5DD]">
                    Counter &amp; walk-in point-of-sale
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 font-mono block">
                    Total Inflow Collected
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-emerald-700 font-sans">
                      {formatINR(customerStats.totalPaid)}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {customerStats.totalBilled > 0 ? `${((customerStats.totalPaid / customerStats.totalBilled) * 100).toFixed(0)}%` : "100%"}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800 pt-1 border-t border-[#E8E5DD]">
                    {selectedCustomerPayments.length} payment receipts verified
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#991B1B] font-mono block">
                    Outstanding Balance Due
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-[#991B1B] font-sans">
                      {formatINR(customerStats.balanceDue)}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      customerStats.balanceDue > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {customerStats.balanceDue > 0 ? "Pending Payment" : "Zero Balance"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#991B1B] pt-1 border-t border-[#E8E5DD]">
                    {customerStats.balanceDue > 0 ? "Requires collection follow-up" : "All accounts clear"}
                  </div>
                </div>
              </div>

              {/* Documents Table Section */}
              <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden space-y-3 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E8E5DD]">
                  <div>
                    <h4 className="text-sm font-bold text-[#0E1C2F] font-serif flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#B45309]" />
                      <span>All Bills &amp; Invoices for this Customer ({selectedCustomerDocs.length})</span>
                    </h4>
                    <p className="text-[11px] text-[#667085]">
                      Complete chronological register of invoices and bills issued to {selectedCustomerForHistory.company || selectedCustomerForHistory.name}.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs no-print">
                    <button
                      type="button"
                      onClick={() => setCustomerDocFilter("all")}
                      className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                        customerDocFilter === "all" ? "bg-[#0E1C2F] text-white" : "bg-[#F7F5F0] text-[#475467] hover:bg-[#EFECE4]"
                      }`}
                    >
                      All ({selectedCustomerDocs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerDocFilter("invoices")}
                      className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                        customerDocFilter === "invoices" ? "bg-[#0E1C2F] text-white" : "bg-[#F7F5F0] text-[#475467] hover:bg-[#EFECE4]"
                      }`}
                    >
                      Invoices ({customerStats.invoiceCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerDocFilter("bills")}
                      className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                        customerDocFilter === "bills" ? "bg-[#0E1C2F] text-white" : "bg-[#F7F5F0] text-[#475467] hover:bg-[#EFECE4]"
                      }`}
                    >
                      Bills ({customerStats.billCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerDocFilter("unpaid")}
                      className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                        customerDocFilter === "unpaid" ? "bg-[#991B1B] text-white" : "bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]"
                      }`}
                    >
                      Unpaid / Due
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Document #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Items Summary</th>
                        <th className="py-2.5 px-3 text-right">Taxable</th>
                        <th className="py-2.5 px-3 text-right">Tax</th>
                        <th className="py-2.5 px-3 text-right">Grand Total</th>
                        <th className="py-2.5 px-3 text-right">Balance Due</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DD]">
                      {filteredSelectedCustomerDocs.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center py-8 text-xs text-[#667085]">
                            No documents found for this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredSelectedCustomerDocs.map((doc) => {
                          const isVoid = doc.status === "void";
                          const isInvoice = doc.documentType === "invoice";
                          const itemsDesc = (doc.items || []).map((it) => `${it.description || "Item"} (${it.qty || 1} ${it.unit || "Nos"})`).join(", ");

                          return (
                            <tr
                              key={doc.id}
                              className={`hover:bg-[#FBF9F5] transition-colors ${isVoid ? "opacity-50 bg-[#F7F5F0]" : ""}`}
                            >
                              <td className="py-3 px-3">
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                  isInvoice
                                    ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                                    : "bg-amber-50 text-[#B45309] border border-amber-200"
                                }`}>
                                  {isInvoice ? "GST Invoice" : "Retail Bill"}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-[#0E1C2F]">
                                {doc.documentNumber}
                              </td>
                              <td className="py-3 px-3 text-[#475467] font-mono whitespace-nowrap">
                                <div>{doc.issueDate}</div>
                                {doc.dueDate && (
                                  <div className="text-[10px] text-[#667085]">Due: {doc.dueDate}</div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-[#475467] max-w-xs truncate" title={itemsDesc}>
                                {itemsDesc || "Standard Fencing Materials"}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[#475467]">
                                {formatINR(doc.taxableAmount)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[#475467]">
                                {formatINR(doc.totalTax)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                                {formatINR(doc.grandTotal)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-[#991B1B]">
                                {doc.balanceDue > 0 ? formatINR(doc.balanceDue) : "₹0.00"}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                    isVoid
                                      ? "bg-slate-200 text-slate-700"
                                      : doc.paymentStatus === "paid"
                                      ? "bg-[#DCFCE7] text-[#166534]"
                                      : doc.paymentStatus === "partially_paid"
                                      ? "bg-[#FEF3C7] text-[#854D0E]"
                                      : "bg-[#FEE2E2] text-[#991B1B]"
                                  }`}
                                >
                                  {doc.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right no-print">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openPreview(doc)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold transition-all shadow-2xs"
                                    title="Download / Print Invoice (.pdf)"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#FDE68A]" />
                                    <span>Print / PDF</span>
                                  </button>
                                  {!isVoid && doc.balanceDue > 0 && (
                                    <button
                                      onClick={() => openPaymentModal(doc)}
                                      className="p-1.5 rounded text-emerald-700 hover:bg-emerald-50 transition-colors"
                                      title="Collect Payment"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Receipts Ledger */}
              <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden space-y-3 p-4">
                <div>
                  <h4 className="text-sm font-bold text-[#0E1C2F] font-serif flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>Payments Received from this Customer ({selectedCustomerPayments.length})</span>
                  </h4>
                  <p className="text-[11px] text-[#667085]">
                    Receipts and settlements credited toward invoices and bills for {selectedCustomerForHistory.company || selectedCustomerForHistory.name}.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                    <thead>
                      <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px]">
                        <th className="py-2.5 px-3">Receipt ID</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Against Document #</th>
                        <th className="py-2.5 px-3">Payment Method</th>
                        <th className="py-2.5 px-3">Reference / UTR #</th>
                        <th className="py-2.5 px-3 text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DD]">
                      {selectedCustomerPayments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-xs text-[#667085]">
                            No payment receipts on record for this customer yet.
                          </td>
                        </tr>
                      ) : (
                        selectedCustomerPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FBF9F5]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">{p.id}</td>
                            <td className="py-2.5 px-3 font-mono text-[#667085]">{p.paymentDate}</td>
                            <td className="py-2.5 px-3 font-mono text-[#B45309] font-bold">{p.documentNumber || "N/A"}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#182230]">{p.paymentMethod}</td>
                            <td className="py-2.5 px-3 font-mono text-[#475467]">{p.referenceNumber || "Verified at Desk"}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              {formatINR(p.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* If No Customer is Selected: Show Quick-Pick Cards */
            <div className="bg-white p-6 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-4">
              <div className="text-center max-w-xl mx-auto py-4 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#F7F5F0] border border-[#DCD7CD] flex items-center justify-center text-[#0E1C2F] mx-auto shadow-2xs">
                  <Users className="w-6 h-6 text-[#B45309]" />
                </div>
                <h3 className="text-base font-bold text-[#0E1C2F] font-serif">
                  Select or Search Any Customer Above
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Search for a commercial client or retail walk-in customer above to reveal all of their historical GST tax invoices, counter bills, item line breakdowns, and payment collection receipts in one place.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E5DD]">
                <div className="text-xs font-bold text-[#182230] uppercase tracking-wider font-mono mb-3">
                  Registered Customers Directory ({allSelectableCustomers.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allSelectableCustomers.map((cust) => {
                    const custDocs = documents.filter((d) => docMatchesCustomer(d, cust));
                    const invCount = custDocs.filter((d) => d.documentType === "invoice").length;
                    const billCount = custDocs.filter((d) => d.documentType === "bill").length;
                    const outstanding = custDocs.reduce((sum, d) => (d.status !== "void" ? sum + (Number(d.balanceDue) || 0) : sum), 0);

                    return (
                      <div
                        key={cust.id}
                        className="p-4 bg-[#FBF9F5] border border-[#E8E5DD] rounded-xl hover:border-[#B45309] hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-[#0E1C2F] leading-tight">
                            {cust.company || cust.name}
                          </div>
                          {cust.company && cust.name && cust.company !== cust.name && (
                            <div className="text-xs text-[#667085]">
                              Contact: {cust.name}
                            </div>
                          )}
                          <div className="text-[11px] font-mono text-[#B45309]">
                            GSTIN: {cust.gstin || "Unregistered"} {cust.phone ? `• ${cust.phone}` : ""}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E8E5DD] flex items-center justify-between">
                          <div className="text-[11px]">
                            <span className="font-semibold text-[#0E1C2F]">{invCount} Invoices</span>
                            <span className="text-[#667085]"> • </span>
                            <span className="font-semibold text-[#0E1C2F]">{billCount} Bills</span>
                            {outstanding > 0 ? (
                              <div className="font-mono font-bold text-[#991B1B] text-[10px]">
                                Due: {formatINR(outstanding)}
                              </div>
                            ) : (
                              <div className="font-mono text-emerald-700 text-[10px] font-semibold">
                                Settled
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedCustomerForHistory(cust)}
                            className="px-3 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#14243B] text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3 text-[#FDE68A]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. FINANCIAL LEDGER TAB */}
      {activeTab === "financial-ledger" && (
        <div className="space-y-4">
          {/* Dual Ledger Switcher: Sales Ledger vs Purchase Ledger */}
          <div className="bg-[#FAF9F5] border border-[#E8E5DD] rounded-xl p-3 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-[#0E1C2F] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Sales Ledger (Invoices & Retail Bills)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("purchase-ledger")}
                className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#B45309] border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
              >
                <Truck className="w-3.5 h-3.5 text-[#B45309] group-hover:scale-110 transition-transform" />
                <span>Purchase Ledger (Raw Materials & Suppliers)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#B45309] text-white font-bold">
                  {purchases?.length || 0} Bills
                </span>
                <ArrowRight className="w-3 h-3 text-[#B45309]" />
              </button>
            </div>
            <div className="text-[11px] text-[#667085] hidden md:block">
              Switch to track factory raw material procurement, supplier GST bills &amp; outgoing expenses
            </div>
          </div>

          {/* Financial Ledger Summary Metric Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#667085] tracking-wider font-bold">
                Total Invoiced / Billed (Debit)
              </div>
              <div className="text-lg font-black text-[#0E1C2F] font-mono mt-1">
                {formatINR(ledgerTotals.totalDebit)}
              </div>
              <div className="text-[10px] text-[#667085] mt-0.5">
                Total commercial & retail goods supplied
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider font-bold">
                Total Payments Received (Credit)
              </div>
              <div className="text-lg font-black text-emerald-700 font-mono mt-1">
                {formatINR(ledgerTotals.totalCredit)}
              </div>
              <div className="text-[10px] text-[#667085] mt-0.5">
                Total verified bank, cash & UPI inflows
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#B45309] tracking-wider font-bold">
                Net Outstanding Receivable
              </div>
              <div className={`text-lg font-black font-mono mt-1 ${ledgerTotals.netOutstanding > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {formatINR(ledgerTotals.netOutstanding)}
              </div>
              <div className="text-[10px] text-[#667085] mt-0.5">
                {ledgerTotals.netOutstanding > 0 ? "Uncollected customer balance" : "Fully settled ledger • ₹0.00 due"}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ledger party, reference..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs font-medium"
              />
            </div>
            <div className="text-xs text-[#667085] font-mono">
              Journal Entries: <span className="font-bold text-[#0E1C2F]">{ledger.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Entry Type</th>
                    <th className="py-2.5 px-3">Reference #</th>
                    <th className="py-2.5 px-3">Party Account / Client</th>
                    <th className="py-2.5 px-3 text-right">Debit (Receivable ₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Inflow ₹)</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DD]">
                  {ledger
                    .filter((e) =>
                      e.partyName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                      e.referenceNumber.toLowerCase().includes(ledgerSearch.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#FBF9F5]">
                        <td className="py-2.5 px-3 font-mono text-[#475467]">{item.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#182230]">
                          {item.entityType}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">
                          {item.referenceNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#182230]">{item.partyName}</div>
                          {item.notes && <div className="text-[10px] text-[#667085]">{item.notes}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                          {item.debit > 0 ? formatINR(item.debit) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {item.credit > 0 ? formatINR(item.credit) : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-[#475467]">
                          {item.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.docRef && (
                            <button
                              onClick={() => openPreview(item.docRef)}
                              className="p-1 text-[#0E1C2F] hover:bg-[#EFECE4] rounded"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
                {ledger.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#0E1C2F] text-white font-mono font-bold text-xs border-t-2 border-[#B45309]">
                      <td colSpan="4" className="py-3 px-3 uppercase text-[10px] tracking-wider text-[#FDE68A]">
                        Financial Ledger Grand Totals ({ledger.length} Entries)
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300 font-mono">
                        {formatINR(ledgerTotals.totalDebit)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-mono">
                        {formatINR(ledgerTotals.totalCredit)}
                      </td>
                      <td colSpan="2" className="py-3 px-3 text-right text-[11px] font-mono text-slate-300">
                        Balance Due: <span className="text-[#FDE68A] font-bold">{formatINR(ledgerTotals.netOutstanding)}</span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>

              {ledger.length === 0 && (
                <div className="py-12 px-4 text-center space-y-2">
                  <BookOpen className="w-8 h-8 text-[#98A2B3] mx-auto opacity-40" />
                  <p className="text-xs font-semibold text-[#475467]">Financial Ledger is clean and balanced at ₹0.00</p>
                  <p className="text-[11px] text-[#667085]">Every GST tax invoice, retail bill, and payment receipt recorded will appear here with zero discrepancy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2.5 PURCHASE & MATERIAL EXPENSES LEDGER TAB */}
      {activeTab === "purchase-ledger" && <PurchaseLedger />}

      {/* 2.6 SCRAP AND MATERIALS BOUGHT TAB */}
      {activeTab === "scrap-materials" && <ScrapAndMaterials />}

      {/* 3. PAYMENTS & COLLECTIONS TAB */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search UTR, receipt, customer..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs"
              />
            </div>
            <div className="text-xs text-emerald-800 font-mono font-bold">
              Total Receipts: {formatINR(payments.reduce((s, p) => s + (p.amount || 0), 0))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#166534] text-white font-mono uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Receipt ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Against Document #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Collected (₹)</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">UTR / Reference No.</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DD]">
                  {payments
                    .filter((p) =>
                      (p.customerName || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
                      (p.referenceNumber || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
                      (p.documentNumber || "").toLowerCase().includes(paymentSearch.toLowerCase())
                    )
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#FBF9F5]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">{p.id}</td>
                        <td className="py-2.5 px-3 font-mono text-[#475467]">{p.paymentDate}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#B45309]">
                          {p.documentNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#182230]">
                          {p.customerName || "Customer"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatINR(p.amount)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#475467]">
                          {p.referenceNumber || "Verified at Counter"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeletePayment(p)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. BUSINESS SNAPSHOT TAB */}
      {activeTab === "snapshot" && <BusinessSnapshot />}

      {/* 5. INVOICES ARCHIVE TAB */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px]">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {documents
                  .filter((d) => d.documentType === "invoice")
                  .map((d) => (
                    <tr key={d.id} className={d.status === "void" ? "opacity-50" : ""}>
                      <td className="py-2.5 px-3 font-mono font-bold">{d.documentNumber}</td>
                      <td className="py-2.5 px-3 font-medium">
                        {d.customerSnapshot?.company || d.customerSnapshot?.name}
                      </td>
                      <td className="py-2.5 px-3 text-[#667085]">{d.issueDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(d.grandTotal)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#991B1B]">
                        {formatINR(d.balanceDue)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-[#FEF3C7] text-[#854D0E]">
                          {d.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPreview(d)}
                            className="p-1 text-[#0E1C2F] hover:bg-[#EFECE4] rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteDoc(d)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. BILLS ARCHIVE TAB */}
      {activeTab === "bills" && (
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-[#1C314D] text-white font-mono uppercase text-[9px]">
                  <th className="py-2.5 px-3">Bill #</th>
                  <th className="py-2.5 px-3">Counter Buyer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 text-center">Mode</th>
                  <th className="py-2.5 px-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {documents
                  .filter((d) => d.documentType === "bill")
                  .map((b) => (
                    <tr key={b.id} className={b.status === "void" ? "opacity-50" : ""}>
                      <td className="py-2.5 px-3 font-mono font-bold">{b.documentNumber}</td>
                      <td className="py-2.5 px-3">{b.customerSnapshot?.name || "Counter Customer"}</td>
                      <td className="py-2.5 px-3 text-[#667085]">{b.issueDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{formatINR(b.grandTotal)}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-800">
                        {b.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPreview(b)}
                            className="p-1 text-[#0E1C2F] hover:bg-[#EFECE4] rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteDoc(b)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. CUSTOMERS TAB */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {/* Customers Search & Header Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E5DD] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter customers by company, name, phone, GSTIN..."
                value={customerListSearch}
                onChange={(e) => setCustomerListSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F7F5F0] border border-[#DCD7CD] rounded-md text-xs focus:outline-hidden focus:border-[#0E1C2F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#667085] text-xs">
                Total registered clients: <strong>{customersWithStats.length}</strong>
              </span>
              <button
                onClick={() => handleTabChange("customer-lookup")}
                className="px-3 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Search Customer Invoices &amp; Bills</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px]">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">GSTIN</th>
                    <th className="py-2.5 px-3 text-right">Lifetime Billed</th>
                    <th className="py-2.5 px-3 text-right">Total Paid</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DD]">
                  {customersWithStats
                    .filter((c) => {
                      const q = customerListSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        (c.company || "").toLowerCase().includes(q) ||
                        (c.name || "").toLowerCase().includes(q) ||
                        (c.phone || "").toLowerCase().includes(q) ||
                        (c.gstin || "").toLowerCase().includes(q)
                      );
                    })
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-[#FBF9F5] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#182230]">{c.company || c.name}</div>
                          {c.company && c.name && c.company !== c.name && (
                            <div className="text-[10px] text-[#667085]">Contact: {c.name}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#667085]">{c.gstin || "Unregistered"}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E1C2F]">{formatINR(c.lifetimeRevenue)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatINR(c.totalPaid)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#991B1B]">
                          {formatINR(c.totalOutstanding)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCustomerForHistory(c);
                                handleTabChange("customer-lookup");
                              }}
                              className="px-2.5 py-1 rounded bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                              title="Inspect all invoices, bills, and payments for this customer"
                            >
                              <FileText className="w-3 h-3 text-[#FDE68A]" />
                              <span>Invoices &amp; Bills</span>
                            </button>
                            <button
                              onClick={() => openCustomerProfile(c)}
                              className="px-2.5 py-1 rounded bg-[#EFECE4] hover:bg-[#DCD7CD] text-xs font-semibold text-[#0E1C2F] transition-colors"
                            >
                              Profile 360°
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. GST TAXES TAB */}
      {activeTab === "gst" && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
            GST Output Tax Ledger Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] text-[#667085] block uppercase">CGST Collected (9%):</span>
              <span className="text-xl font-bold text-[#0E1C2F] mt-1 block">
                {formatINR(documents.reduce((s, d) => s + (d.cgst || 0), 0))}
              </span>
            </div>
            <div className="p-4 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] text-[#667085] block uppercase">SGST Collected (9%):</span>
              <span className="text-xl font-bold text-[#0E1C2F] mt-1 block">
                {formatINR(documents.reduce((s, d) => s + (d.sgst || 0), 0))}
              </span>
            </div>
            <div className="p-4 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] text-[#667085] block uppercase">IGST Collected (18%):</span>
              <span className="text-xl font-bold text-[#0E1C2F] mt-1 block">
                {formatINR(documents.reduce((s, d) => s + (d.igst || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 9. OVERDUE ACCOUNTS TAB */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[#991B1B]">
            Delinquent &amp; Pending Receivables (Accounts Overdue)
          </h2>
          <div className="divide-y divide-[#E8E5DD] text-xs">
            {documents
              .filter((d) => d.balanceDue > 0)
              .map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#182230]">
                      {d.customerSnapshot?.company || d.customerSnapshot?.name}
                    </div>
                    <div className="text-[11px] text-[#667085] font-mono">
                      Invoice: {d.documentNumber} • Due Date: {d.dueDate || "Immediate"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#991B1B]">
                      {formatINR(d.balanceDue)}
                    </span>
                    <button
                      onClick={() => openPaymentModal(d)}
                      className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                    >
                      Collect Payment
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 10. AUDIT LOGS TAB */}
      {activeTab === "activity" && (
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#0E1C2F] text-white font-mono uppercase text-[9px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity #</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FBF9F5]">
                    <td className="py-2.5 px-3 font-mono text-[#667085]">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0E1C2F]">{l.action}</td>
                    <td className="py-2.5 px-3 font-mono text-[#B45309]">{l.entityNumber}</td>
                    <td className="py-2.5 px-3 text-[#182230]">{l.details}</td>
                    <td className="py-2.5 px-3 text-[#667085]">{l.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. FINANCIAL REPORTS TAB */}
      {activeTab === "system" && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-6 text-xs">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
              Financial Reports &amp; Accounting Exports
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Official Umesh Fencing Works financial documentation and ledger exports in .csv, .xml, and .pdf formats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CSV Financial Export */}
            <div className="p-5 bg-[#FBF9F5] border border-[#E8E5DD] rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#EAE6DF] flex items-center justify-center text-[#0E1C2F]">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <span className="font-bold text-[#0E1C2F] text-sm block">Financial Spreadsheet (.csv)</span>
                <p className="text-[#667085] text-[11px] leading-relaxed">
                  Comprehensive tabular sheet with all tax invoices, retail counter bills, collection receipts, GST breakouts, and customer receivables. Ideal for Excel and Sheets.
                </p>
              </div>
              <button
                onClick={() => {
                  const csv = exportFinancialReportCSV();
                  const dateStr = new Date().toISOString().split("T")[0];
                  downloadFile(csv, `ufw-financial-report-${dateStr}.csv`, "text/csv;charset=utf-8");
                  showToast("Financial report exported as .csv", "success");
                }}
                className="w-full py-2.5 px-4 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Report (.csv)</span>
              </button>
            </div>

            {/* XML Accounting Ledger */}
            <div className="p-5 bg-[#FBF9F5] border border-[#E8E5DD] rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#EAE6DF] flex items-center justify-center text-[#0E1C2F]">
                  <FileCode className="w-5 h-5 text-[#B45309]" />
                </div>
                <span className="font-bold text-[#0E1C2F] text-sm block">Accounting Ledger (.xml)</span>
                <p className="text-[#667085] text-[11px] leading-relaxed">
                  Structured XML document containing enterprise company metadata, transaction records, itemized bill entries, payment vouchers, and customer balances.
                </p>
              </div>
              <button
                onClick={() => {
                  const xml = exportFinancialReportXML();
                  const dateStr = new Date().toISOString().split("T")[0];
                  downloadFile(xml, `ufw-financial-report-${dateStr}.xml`, "application/xml;charset=utf-8");
                  showToast("Accounting ledger exported as .xml", "success");
                }}
                className="w-full py-2.5 px-4 rounded-md bg-[#1C314D] hover:bg-[#284166] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <FileCode className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Export Ledger (.xml)</span>
              </button>
            </div>

            {/* PDF Financial Snapshot */}
            <div className="p-5 bg-[#FBF9F5] border border-[#E8E5DD] rounded-xl flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#EAE6DF] flex items-center justify-center text-[#0E1C2F]">
                  <Printer className="w-5 h-5 text-[#0E1C2F]" />
                </div>
                <span className="font-bold text-[#0E1C2F] text-sm block">Financial Snapshot (.pdf)</span>
                <p className="text-[#667085] text-[11px] leading-relaxed">
                  Official printable executive turnover summary, GST tax collected, unpaid receivables, and payment methods breakdown. Ready to print or save as PDF.
                </p>
              </div>
              <button
                onClick={() => {
                  handleTabChange("snapshot");
                  setTimeout(() => {
                    if (typeof window !== "undefined") window.print();
                  }, 400);
                }}
                className="w-full py-2.5 px-4 rounded-md bg-white border border-[#DCD7CD] hover:bg-[#EFECE4] text-[#0E1C2F] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF (.pdf)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminControlsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-[#667085] font-mono">
          Loading Admin Command Center...
        </div>
      }
    >
      <AdminControlsContent />
    </Suspense>
  );
}
