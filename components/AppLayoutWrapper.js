"use client";

import React from "react";
import dynamic from "next/dynamic";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useUI } from "@/context/UIContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// Code-split modals so they don't bloat the root layout chunk
const CreateInvoiceModal = dynamic(() => import("./CreateInvoiceModal"), { ssr: false });
const CreateBillModal = dynamic(() => import("./CreateBillModal"), { ssr: false });
const CustomerModal = dynamic(() => import("./CustomerModal"), { ssr: false });
const RecordPaymentModal = dynamic(() => import("./RecordPaymentModal"), { ssr: false });
const DocumentPreviewModal = dynamic(() => import("./DocumentPreviewModal"), { ssr: false });
const CustomerProfileModal = dynamic(() => import("./CustomerProfileModal"), { ssr: false });

import LandingPage from "./LandingPage";
const DashboardView = dynamic(() => import("./views/DashboardView"), { ssr: false });
const InvoicesView = dynamic(() => import("./views/InvoicesView"), { ssr: false });
const BillsView = dynamic(() => import("./views/BillsView"), { ssr: false });
const CustomersView = dynamic(() => import("./views/CustomersView"), { ssr: false });
const AdminControlsPage = dynamic(() => import("@/app/admin-controls/page"), { ssr: false });

export default function AppLayoutWrapper({ children }) {
  const {
    currentPath,
    navigate,
    isAdminAuthenticated,
    toasts,
    removeToast,
    isInvoiceModalOpen,
    isBillModalOpen,
    isCustomerModalOpen,
    isPaymentModalOpen,
    isPreviewModalOpen,
    isCustomerProfileOpen,
  } = useUI();
  const pathname = (currentPath || "/").split("?")[0];
  const isLandingPage = pathname === "/" || pathname === "";

  // Ultra-Fast Zero-Latency Navigation Interceptor (eliminates 1-2s delay)
  const handleContainerClick = (e) => {
    const anchor = e.target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (
      !href ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      anchor.getAttribute("target") === "_blank" ||
      anchor.getAttribute("download") !== null ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    navigate(href);
  };

  // Determine active view based on client route for instantaneous (0ms) view switching
  let activeContent = children;
  if (pathname === "/" || pathname === "") {
    activeContent = <LandingPage />;
  } else if (!isAdminAuthenticated) {
    // 100% GATED: ALL internal operations, desks, invoices, bills, and customers require authorized Google login
    activeContent = <AdminControlsPage />;
  } else if (pathname === "/dashboard") {
    activeContent = <DashboardView />;
  } else if (pathname === "/invoices") {
    activeContent = <InvoicesView autoOpenCreate={false} />;
  } else if (pathname === "/bills") {
    activeContent = <BillsView autoOpenCreate={false} />;
  } else if (pathname === "/customers") {
    activeContent = <CustomersView />;
  } else if (
    pathname === "/admin-controls" ||
    pathname === "/ledger" ||
    pathname === "/payments" ||
    pathname === "/business-snapshot"
  ) {
    activeContent = <AdminControlsPage />;
  }

  return (
    <div
      onClick={handleContainerClick}
      className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-[#FEF3C7] selection:text-[#B45309]"
    >
      {/* Topbar */}
      <Topbar />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex w-full">
        {!isLandingPage && isAdminAuthenticated && <Sidebar />}

        <main className={`flex-1 overflow-x-hidden ${isLandingPage ? "w-full" : "p-3 sm:p-5 lg:p-8"}`}>
          {/* Zero-delay instant display (no server recompile lag or unmounting lag) */}
          <div className="h-full">
            {activeContent}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-60 space-y-2 max-w-[calc(100vw-1.5rem)] sm:max-w-sm w-full no-print pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg shadow-lg border text-xs font-medium ${
              toast.type === "success"
                ? "bg-white border-emerald-500 text-emerald-900 shadow-emerald-500/10"
                : toast.type === "error"
                ? "bg-white border-red-500 text-red-900 shadow-red-500/10"
                : "bg-white border-[#0E1C2F] text-[#0E1C2F]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Global Interactive Modals (Loaded dynamically on-demand only when authenticated) */}
      {isAdminAuthenticated && isInvoiceModalOpen && <CreateInvoiceModal />}
      {isAdminAuthenticated && isBillModalOpen && <CreateBillModal />}
      {isAdminAuthenticated && isCustomerModalOpen && <CustomerModal />}
      {isAdminAuthenticated && isPaymentModalOpen && <RecordPaymentModal />}
      {isAdminAuthenticated && isPreviewModalOpen && <DocumentPreviewModal />}
      {isAdminAuthenticated && isCustomerProfileOpen && <CustomerProfileModal />}
    </div>
  );
}
