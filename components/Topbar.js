"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";
import {
  FileText,
  Receipt,
  ShieldCheck,
  Layers,
  Lock,
  Unlock,
  Plus,
  Phone,
  Menu,
  X,
  Home,
  LayoutDashboard,
  Users,
  Search,
  BookOpen,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Award,
  Truck,
  Boxes,
} from "lucide-react";

export default function Topbar() {
  const {
    currentPath,
    navigate,
    openCreateInvoice,
    openCreateBill,
    isAdminAuthenticated,
    logoutAdmin,
  } = useUI();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = (currentPath || "/").split("?")[0];
  const isLanding = pathname === "/" || pathname === "";

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const adminSuiteItems = [
    { label: "Operational Desk", href: "/dashboard", icon: LayoutDashboard },
    { label: "GST Tax Invoices", href: "/invoices", icon: FileText, badge: "B2B" },
    { label: "Retail & Counter Bills", href: "/bills", icon: Receipt, badge: "POS" },
    { label: "Customer Registry", href: "/customers", icon: Users },
    { label: "Admin Command", href: "/admin-controls", icon: ShieldAlert },
    { label: "Financial Ledger", href: "/admin-controls?tab=financial-ledger", tab: "financial-ledger", icon: BookOpen },
    { label: "Purchase Ledger", href: "/admin-controls?tab=purchase-ledger", tab: "purchase-ledger", icon: Truck, badge: "EXPENSES" },
    { label: "Scrap & Materials", href: "/admin-controls?tab=scrap-materials", tab: "scrap-materials", icon: Boxes, badge: "STOCK" },
    { label: "Customer Invoices/Bills", href: "/admin-controls?tab=customer-lookup", tab: "customer-lookup", icon: Search },
    { label: "Payment Inflows", href: "/admin-controls?tab=payments", tab: "payments", icon: DollarSign },
    { label: "Executive Snapshot", href: "/admin-controls?tab=snapshot", tab: "snapshot", icon: TrendingUp },
  ];

  return (
    <>
      <header className="no-print h-[64px] bg-white border-b border-[#E8E5DD] px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#C28E3A] overflow-hidden bg-white shrink-0 shadow-xs transition-transform group-hover:scale-105">
              <img src="/assets/umesh_logo.jpg" alt="Umesh Fencing Works" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-bold text-[#0E1C2F] text-xs sm:text-[15px] leading-tight flex items-center gap-1 sm:gap-1.5 font-sans">
                <span className="whitespace-nowrap">Umesh Fencing Works</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-semibold shrink-0">
                  AP-37
                </span>
              </div>
              <div className="hidden sm:block text-[11px] text-[#5A6A80] leading-none mt-0.5 truncate max-w-[190px] md:max-w-[260px] lg:max-w-none">
                {isLanding
                  ? "Manufacturer of Chainlink, Barbed Wire & Concrete Poles"
                  : "Invoice & Billing Ledger • C. Umesh"}
              </div>
            </div>
          </Link>

          {/* Status Badge (desktop) */}
          {isLanding ? (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-medium border border-[#FDE68A] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse"></span>
              <span>Direct Manufacturer • Factory Rates</span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-medium border border-[#BBF7D0] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span>Secure Local Financial Ledger • Active</span>
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Mobile/Tablet Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {!isAdminAuthenticated ? (
            /* Unauthenticated Visitor Topbar (Public Only) */
            <>
              {/* Desktop & Tablet Navigation Links */}
              <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-xs font-semibold text-[#475467] mr-1 lg:mr-2">
                <a href="#products" className="hover:text-[#0E1C2F] transition-colors py-1">
                  Products
                </a>
                <a href="#specifications" className="hover:text-[#0E1C2F] transition-colors py-1">
                  <span className="hidden lg:inline">Specifications</span>
                  <span className="lg:hidden">Specs</span>
                </a>
                <a href="#about" className="hidden lg:inline hover:text-[#0E1C2F] transition-colors py-1">
                  Why Us
                </a>
                <a href="#contact" className="hover:text-[#0E1C2F] transition-colors py-1">
                  Contact
                </a>
              </nav>

              {/* Direct Factory Call CTA - The persistent action on mobile, tablet & desktop */}
              <a
                href="tel:+919440857111"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#1A3254] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                title="Call Umesh Fencing Works Factory Direct"
              >
                <Phone className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span className="text-xs font-semibold">Call</span>
                <span className="hidden sm:inline font-mono text-[11px]">+91 94408 57111</span>
              </a>

              {/* Get Quote CTA */}
              <a
                href="#contact"
                className="hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <span>Get Quote</span>
              </a>

              {/* Admin Sign In Button - Shown on desktop (>=1024px); on mobile and tablet housed in hamburger drawer */}
              <Link
                href="/admin-controls"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#1A3254] text-[#FDE68A] text-xs font-bold transition-all shadow-xs border border-[#B45309]"
                title="Sign in with authorized Google account"
              >
                <Lock className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Admin Sign In</span>
              </Link>

              {/* Mobile & Tablet Menu Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg text-[#0E1C2F] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            /* Authenticated Admin Management Suite Topbar */
            <>
              {isLanding && (
                <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-[#475467] mr-1">
                  <a href="#products" className="hover:text-[#0E1C2F] transition-colors">
                    Products
                  </a>
                  <a href="#specifications" className="hover:text-[#0E1C2F] transition-colors">
                    Specifications
                  </a>
                  <a href="#contact" className="hover:text-[#0E1C2F] transition-colors">
                    Contact
                  </a>
                </nav>
              )}

              {/* Direct Factory Call CTA on mobile */}
              <a
                href="tel:+919440857111"
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1C2F] hover:bg-[#1A3254] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                title="Call Umesh Fencing Works Factory Direct"
              >
                <Phone className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span className="text-xs font-semibold">Call</span>
              </a>

              {/* Quick Administrative Creation Actions - Accessible on tablets (md) and desktops (lg) */}
              <button
                onClick={openCreateBill}
                className="hidden md:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#FBF9F5] hover:bg-[#F2EFE8] text-[#1C314D] border border-[#DCD7CD] text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                title="Create Instant Counter Retail Bill"
              >
                <Receipt className="w-3.5 h-3.5 text-[#B45309]" />
                <span className="hidden lg:inline">+ Retail Bill</span>
                <span className="lg:hidden">+ Bill</span>
              </button>

              <button
                onClick={openCreateInvoice}
                className="hidden md:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-semibold shadow-xs transition-colors border border-[#08121F] shrink-0 cursor-pointer"
                title="Create GST Tax Invoice (B2B)"
              >
                <FileText className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span className="hidden lg:inline">+ Tax Invoice</span>
                <span className="lg:hidden">+ Invoice</span>
              </button>

              <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[#E8E5DD]">
                <Link
                  href="/admin-controls"
                  prefetch={true}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#E6ECF5] text-[#0E1C2F] hover:bg-[#D4E0F0] text-xs font-semibold transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="text-[11px] text-[#991B1B] hover:underline px-1 py-0.5 cursor-pointer font-bold"
                  title="Sign Out of Admin Session"
                >
                  Sign Out
                </button>
              </div>

              {/* Mobile & Tablet Drawer Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg text-[#0E1C2F] hover:bg-[#F2EFE8] transition-colors cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile & Tablet Navigation Drawer / Off-Canvas Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col no-print animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E8E5DD] flex items-center justify-between bg-[#0E1C2F] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-[#C28E3A] overflow-hidden bg-white shrink-0">
                  <img src="/assets/umesh_logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Umesh Fencing Works</div>
                  <div className="text-[10px] text-[#FDE68A] font-mono">Anantapur, AP-37</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
              {!isAdminAuthenticated ? (
                /* Unauthenticated Mobile Visitor Menu (Public Only) */
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
                    Explore Solutions
                  </div>
                  <nav className="space-y-1">
                    <a
                      href="#products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#344054] hover:bg-[#F4F5F7] hover:text-[#0E1C2F]"
                    >
                      <Layers className="w-4 h-4 text-[#B45309]" />
                      <span>Products &amp; Mesh</span>
                    </a>
                    <a
                      href="#specifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#344054] hover:bg-[#F4F5F7] hover:text-[#0E1C2F]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#B45309]" />
                      <span>Specifications Matrix</span>
                    </a>
                    <a
                      href="#about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#344054] hover:bg-[#F4F5F7] hover:text-[#0E1C2F]"
                    >
                      <Award className="w-4 h-4 text-[#B45309]" />
                      <span>Why Choose Us</span>
                    </a>
                    <a
                      href="#contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#344054] hover:bg-[#F4F5F7] hover:text-[#0E1C2F]"
                    >
                      <Phone className="w-4 h-4 text-[#B45309]" />
                      <span>Contact &amp; Factory Quote</span>
                    </a>
                  </nav>

                  <div className="pt-2 border-t border-[#E8E5DD] space-y-2">
                    <a
                      href="tel:+919440857111"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#0E1C2F] text-white text-xs font-bold shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FDE68A]" />
                      <span>Call Factory: 94408 57111</span>
                    </a>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/admin-controls");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#F7F5F0] hover:bg-[#EFECE4] text-[#0E1C2F] border border-[#DCD7CD] text-xs font-semibold cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Admin Sign In (Google Auth)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated Admin Management Suite: All Features Gated & Unified */
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] px-2 mb-2 font-mono flex items-center justify-between">
                      <span>Admin Management Portal</span>
                      <span className="text-[9px] text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-100">
                        Authenticated
                      </span>
                    </div>
                    <nav className="space-y-1">
                      {adminSuiteItems.map((item) => {
                        const Icon = item.icon;
                        const active =
                          pathname === item.href ||
                          (item.tab && pathname === "/admin-controls" && (currentPath || "").includes(`tab=${item.tab}`));
                        return (
                          <button
                            key={item.href}
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              navigate(item.href);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                              active
                                ? item.danger
                                  ? "bg-red-700 text-white shadow-xs"
                                  : "bg-[#0E1C2F] text-white shadow-xs"
                                : item.danger
                                ? "text-red-700 hover:bg-red-50"
                                : "text-[#344054] hover:bg-[#F4F5F7]"
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
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Public Landing Link */}
                  <div className="pt-2 border-t border-[#E8E5DD]">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#5A6A80] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                    >
                      <Home className="w-4 h-4 text-[#667085]" />
                      <span>View Public Landing Portal</span>
                    </button>
                  </div>

                  {/* Quick Creation Buttons */}
                  <div className="pt-2 border-t border-[#E8E5DD] space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openCreateBill();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FBF9F5] hover:bg-[#F2EFE8] text-[#1C314D] border border-[#DCD7CD] text-xs font-bold cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>+ Rapid Counter Bill</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openCreateInvoice();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-bold cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#FDE68A]" />
                      <span>+ GST Tax Invoice</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E8E5DD] bg-[#F8F9FA] space-y-2 text-xs">
              <div className="text-[11px] font-bold text-[#0E1C2F]">GSTIN: 37AMQPU6044G1ZH</div>
              <div className="text-[10px] text-[#667085]">Proprietor: C. Umesh • State 37</div>
              {isAdminAuthenticated && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutAdmin();
                  }}
                  className="w-full text-center text-xs text-red-700 font-bold hover:underline pt-1"
                >
                  Sign Out Admin Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

