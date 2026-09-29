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
  const { currentPath, isAdminAuthenticated } = useUI();
  const pathname = (currentPath || "/").split("?")[0];

  const navItems = [
    {
      label: "Landing Portal",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: "Operational Desk",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "GST Tax Invoices",
      href: "/invoices",
      icon: FileText,
      badge: "B2B",
    },
    {
      label: "Retail & Counter Bills",
      href: "/bills",
      icon: Receipt,
      badge: "POS",
    },
    {
      label: "Customer Registry",
      href: "/customers",
      icon: Users,
    },
  ];

  const adminNavItems = [
    {
      label: "Admin Command",
      href: "/admin-controls",
      icon: ShieldAlert,
      badge: isAdminAuthenticated ? "Unlocked" : "Google Auth",
      badgeColor: isAdminAuthenticated ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF3C7] text-[#854D0E]",
    },
    {
      label: "Customer Invoices/Bills",
      href: "/admin-controls?tab=customer-lookup",
      icon: Search,
      sub: true,
    },
    {
      label: "Financial Ledger",
      href: "/admin-controls?tab=financial-ledger",
      icon: BookOpen,
      sub: true,
    },
    {
      label: "Payment Inflows",
      href: "/admin-controls?tab=payments",
      icon: DollarSign,
      sub: true,
    },
    {
      label: "Executive Snapshot",
      href: "/admin-controls?tab=snapshot",
      icon: TrendingUp,
      sub: true,
    },
    {
      label: "Zero Out Entries",
      href: "/admin-controls?tab=danger-zone",
      icon: Trash2,
      sub: true,
      danger: true,
    },
  ];

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href;
  };

  const isAdminItemActive = (item) => {
    if (item.sub) {
      const tab = item.href.split("tab=")[1];
      return pathname === "/admin-controls" && (currentPath || "").includes(`tab=${tab}`);
    }
    return pathname === "/admin-controls" && !(currentPath || "").includes("tab=");
  };

  return (
    <aside className="app-sidebar no-print w-60 min-w-[240px] bg-[#FFFFFF] border-r border-[#E2E6EA] flex flex-col justify-between hidden md:flex h-[calc(100vh-64px)] sticky top-[64px] select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation Group: Operations */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] px-3 mb-2 font-mono">
            Commercial Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-75 ${
                    active
                      ? "bg-[#0E1C2F] text-white shadow-xs"
                      : "text-[#344054] hover:bg-[#F4F5F7] hover:text-[#0E1C2F]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-[#FDE68A]" : "text-[#667085]"}`} />
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

        {/* Navigation Group: Protected Admin Controls */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] px-3 mb-2 font-mono flex items-center justify-between">
            <span>Admin Control Room</span>
            <span className="text-[9px] text-[#854D0E] font-normal">Gated</span>
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const active = isAdminItemActive(item);
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
                  } ${item.sub ? "pl-7 text-[11px]" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${active ? (item.danger ? "text-white" : "text-[#FDE68A]") : item.danger ? "text-red-600" : item.sub ? "text-[#B45309]" : "text-[#667085]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.badgeColor || "bg-[#E9ECEF] text-[#667085]"
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
      </div>

      {/* Sidebar Footer: Business Summary Card */}
      <div className="p-4 border-t border-[#E2E6EA] bg-[#F8F9FA]">
        <div className="text-[11px] font-bold text-[#0E1C2F] leading-tight">
          GSTIN: 37AMQPU6044G1ZH
        </div>
        <div className="text-[10px] text-[#667085] mt-0.5">
          Andhra Pradesh • State Code 37
        </div>
        <div className="mt-2 pt-2 border-t border-[#E2E6EA] flex items-center justify-between text-[10px] text-[#667085]">
          <span>Proprietor: B. Umesh</span>
          <span className="text-emerald-700 font-semibold">Active</span>
        </div>
      </div>
    </aside>
  );
}
