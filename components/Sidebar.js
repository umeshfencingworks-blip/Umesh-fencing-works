"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  ShieldAlert,
  BookOpen,
  DollarSign,
  TrendingUp,
  Trash2,
  Search,
} from "lucide-react";
import { useUI } from "@/context/UIContext";

export default function Sidebar() {
  const { currentPath, isAdminAuthenticated, adminUser, logoutAdmin } = useUI();
  const pathname = (currentPath || "/").split("?")[0];

  const adminSuiteItems = [
    { label: "Operational Desk", href: "/dashboard", icon: LayoutDashboard },
    { label: "GST Tax Invoices", href: "/invoices", icon: FileText, badge: "B2B" },
    { label: "Retail & Counter Bills", href: "/bills", icon: Receipt, badge: "POS" },
    { label: "Customer Registry", href: "/customers", icon: Users },
    { label: "Admin Command", href: "/admin-controls", icon: ShieldAlert },
    { label: "Financial Ledger", href: "/admin-controls?tab=financial-ledger", tab: "financial-ledger", icon: BookOpen },
    { label: "Customer Lookup", href: "/admin-controls?tab=customer-lookup", tab: "customer-lookup", icon: Search },
    { label: "Payment Inflows", href: "/admin-controls?tab=payments", tab: "payments", icon: DollarSign },
    { label: "Executive Snapshot", href: "/admin-controls?tab=snapshot", tab: "snapshot", icon: TrendingUp },
    { label: "Zero Out Entries", href: "/admin-controls?tab=danger-zone", tab: "danger-zone", icon: Trash2, danger: true },
  ];

  const isItemActive = (item) => {
    if (item.tab) {
      return pathname === "/admin-controls" && (currentPath || "").includes(`tab=${item.tab}`);
    }
    if (item.href === "/admin-controls") {
      return pathname === "/admin-controls" && !(currentPath || "").includes("tab=");
    }
    return pathname === item.href;
  };

  return (
    <aside className="app-sidebar no-print w-60 min-w-[240px] bg-[#FFFFFF] border-r border-[#E2E6EA] flex flex-col justify-between hidden lg:flex h-[calc(100vh-64px)] sticky top-[64px] select-none">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Navigation Group: Unified Admin Suite */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] px-3 mb-2 font-mono flex items-center justify-between">
            <span>Admin Management Suite</span>
            <span className="text-[9px] text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-100">
              Active
            </span>
          </div>
          <nav className="space-y-1">
            {adminSuiteItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-75 ${
                    active
                      ? item.danger
                        ? "bg-red-700 text-white shadow-xs"
                        : "bg-[#0E1C2F] text-white shadow-xs"
                      : item.danger
                      ? "text-red-700 hover:bg-red-50 hover:text-red-900"
                      : "text-[#344054] hover:bg-[#F4F5F7] hover:text-[#0E1C2F]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? (item.danger ? "text-white" : "text-[#FDE68A]") : item.danger ? "text-red-600" : "text-[#B45309]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        active ? "bg-[#1C314D] text-[#FEF3C7]" : "bg-[#E9ECEF] text-[#667085]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Public Landing Link */}
        <div className="pt-2 border-t border-[#E8E5DD]">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#5A6A80] hover:bg-[#F4F5F7] hover:text-[#0E1C2F] transition-colors"
          >
            <Home className="w-4 h-4 text-[#667085]" />
            <span>Public Landing Portal</span>
          </Link>
        </div>
      </div>

      {/* Sidebar Footer: Authenticated Admin Session Card */}
      <div className="p-4 border-t border-[#E2E6EA] bg-[#F8F9FA] space-y-2">
        <div className="text-[11px] font-bold text-[#0E1C2F] leading-tight flex items-center justify-between">
          <span>Administrator</span>
          <span className="text-[9px] text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-100 font-mono">
            Google Auth
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#5A6A80] truncate">
          {adminUser?.email || "umeshfencingworks@gmail.com"}
        </div>
        <button
          onClick={logoutAdmin}
          className="w-full mt-1 py-1 px-2 rounded bg-white hover:bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold text-center cursor-pointer transition-colors shadow-2xs"
        >
          Sign Out Admin
        </button>
      </div>
    </aside>
  );
}
