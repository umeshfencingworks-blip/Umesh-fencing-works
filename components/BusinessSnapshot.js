"use client";

import React, { useState, useMemo } from "react";
import { useUI } from "@/context/UIContext";
import { formatINR, BUSINESS_DETAILS } from "@/lib/calculations";
import { exportFinancialReportCSV, exportFinancialReportXML, downloadFile } from "@/lib/db";
import {
  TrendingUp,
  Printer,
  Calendar,
  DollarSign,
  PieChart,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

export default function BusinessSnapshot() {
  const { documents, payments, customersWithStats, showToast } = useUI();
  const [dateFilter, setDateFilter] = useState("all");

  const handleExportCSV = () => {
    try {
      const csvData = exportFinancialReportCSV();
      const dateStr = new Date().toISOString().split("T")[0];
      downloadFile(csvData, `ufw-financial-report-${dateStr}.csv`, "text/csv;charset=utf-8");
      if (showToast) showToast("Financial Report downloaded as .csv", "success");
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to export CSV report", "error");
    }
  };

  const handleExportXML = () => {
    try {
      const xmlData = exportFinancialReportXML();
      const dateStr = new Date().toISOString().split("T")[0];
      downloadFile(xmlData, `ufw-financial-report-${dateStr}.xml`, "application/xml;charset=utf-8");
      if (showToast) showToast("Financial Report downloaded as .xml", "success");
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to export XML report", "error");
    }
  };

  const filteredDocs = useMemo(() => {
    if (dateFilter === "all") return documents.filter((d) => d.status !== "void");
    const now = new Date();
    const cutoff = new Date();
    if (dateFilter === "30days") {
      cutoff.setDate(now.getDate() - 30);
    } else if (dateFilter === "quarter") {
      cutoff.setDate(now.getDate() - 90);
    }
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return documents.filter((d) => d.status !== "void" && d.issueDate >= cutoffStr);
  }, [documents, dateFilter]);

  // Aggregate metrics
  const stats = useMemo(() => {
    let b2bTotal = 0;
    let b2cTotal = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    filteredDocs.forEach((d) => {
      const grand = Number(d.grandTotal) || 0;
      const taxable = Number(d.taxableAmount) || 0;
      const cg = Number(d.cgst) || 0;
      const sg = Number(d.sgst) || 0;
      const ig = Number(d.igst) || 0;
      const paid = Number(d.totalPaid) || 0;
      const bal = Number(d.balanceDue) || 0;

      if (d.documentType === "invoice") {
        b2bTotal += grand;
      } else {
        b2cTotal += grand;
      }

      totalTaxable += taxable;
      totalCgst += cg;
      totalSgst += sg;
      totalIgst += ig;
      totalPaid += paid;
      totalOutstanding += bal;
    });

    const totalTurnover = b2bTotal + b2cTotal;
    const totalTax = totalCgst + totalSgst + totalIgst;
    const collectionRate = totalTurnover > 0 ? ((totalPaid / totalTurnover) * 100).toFixed(1) : 0;

    return {
      b2bTotal,
      b2cTotal,
      totalTurnover,
      totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      totalPaid,
      totalOutstanding,
      collectionRate,
    };
  }, [filteredDocs]);

  // Aging Analysis
  const aging = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    let currentDue = 0; // <= 15 days
    let midDue = 0;     // 16 - 30 days
    let severeDue = 0;  // > 30 days

    filteredDocs.forEach((d) => {
      if (d.balanceDue <= 0 || !d.dueDate) return;
      const daysDiff = Math.floor((new Date(today) - new Date(d.dueDate)) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 0) {
        currentDue += d.balanceDue;
      } else if (daysDiff <= 15) {
        currentDue += d.balanceDue;
      } else if (daysDiff <= 30) {
        midDue += d.balanceDue;
      } else {
        severeDue += d.balanceDue;
      }
    });

    return { currentDue, midDue, severeDue };
  }, [filteredDocs]);

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-[#E8E5DD] no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#0E1C2F] font-serif">
              Executive Business Snapshot &amp; Financial Audit
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] font-bold">
              Confidential
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Turnover classification, GST output tax liability, and customer receivables aging for {BUSINESS_DETAILS.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#DCD7CD] rounded-md text-xs font-medium"
          >
            <option value="all">All-Time Cumulative</option>
            <option value="30days">Last 30 Days</option>
            <option value="quarter">Last Quarter (90 Days)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold shadow-xs transition-colors"
            title="Export complete financial report as spreadsheet (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#BBF7D0]" />
            <span>Export CSV (.csv)</span>
          </button>

          <button
            onClick={handleExportXML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold shadow-xs transition-colors"
            title="Export structured accounting ledger as XML (.xml)"
          >
            <FileCode className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>Export XML (.xml)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0E1C2F] hover:bg-[#14243B] text-white text-xs font-semibold shadow-xs transition-colors"
            title="Print or Save official financial report as PDF (.pdf)"
          >
            <Printer className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>Save as PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Snapshot Document Area */}
      <div className="space-y-6">
        {/* Core Revenue Triad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
              Total Gross Turnover Billed
            </div>
            <div className="text-2xl font-black text-[#0E1C2F] font-sans">
              {formatINR(stats.totalTurnover)}
            </div>
            <div className="text-xs text-[#475467] pt-2 border-t border-[#E8E5DD] flex justify-between font-mono">
              <span>B2B Tax Invoices:</span>
              <span className="font-bold">{formatINR(stats.b2bTotal)}</span>
            </div>
            <div className="text-xs text-[#475467] flex justify-between font-mono">
              <span>Retail POS Bills:</span>
              <span className="font-bold">{formatINR(stats.b2cTotal)}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Total Payments Collected
            </div>
            <div className="text-2xl font-black text-emerald-700 font-sans">
              {formatINR(stats.totalPaid)}
            </div>
            <div className="text-xs text-[#475467] pt-2 border-t border-[#E8E5DD] flex justify-between">
              <span>Collection Recovery Rate:</span>
              <span className="font-mono font-bold text-emerald-800">{stats.collectionRate}%</span>
            </div>
            <div className="text-xs text-[#475467] flex justify-between">
              <span>Settled Document Share:</span>
              <span className="font-mono font-bold">
                {filteredDocs.filter((d) => d.paymentStatus === "paid").length} of {filteredDocs.length} Docs
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E8E5DD] shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] font-mono">
              Outstanding Book Receivables
            </div>
            <div className="text-2xl font-black text-[#991B1B] font-sans">
              {formatINR(stats.totalOutstanding)}
            </div>
            <div className="text-xs text-[#475467] pt-2 border-t border-[#E8E5DD] flex justify-between">
              <span>Pending Inflow Value:</span>
              <span className="font-mono font-bold text-[#991B1B]">
                {((stats.totalOutstanding / (stats.totalTurnover || 1)) * 100).toFixed(1)}% of sales
              </span>
            </div>
            <div className="text-xs text-[#475467] flex justify-between">
              <span>Active Debtors:</span>
              <span className="font-mono font-bold">
                {customersWithStats.filter((c) => c.totalOutstanding > 0).length} Commercial Accounts
              </span>
            </div>
          </div>
        </div>

        {/* GST Output Tax Liability Section */}
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B45309]" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
                GST Output Tax Liability Summary (State Code 37)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#667085]">
              GSTIN: {BUSINESS_DETAILS.gstin}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] font-bold text-[#667085] uppercase block font-mono">
                Taxable Base Value
              </span>
              <span className="text-base font-extrabold text-[#0E1C2F] font-mono block mt-1">
                {formatINR(stats.totalTaxable)}
              </span>
            </div>

            <div className="p-3 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] font-bold text-[#667085] uppercase block font-mono">
                Central GST (CGST 9%)
              </span>
              <span className="text-base font-extrabold text-[#0E1C2F] font-mono block mt-1">
                {formatINR(stats.totalCgst)}
              </span>
            </div>

            <div className="p-3 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] font-bold text-[#667085] uppercase block font-mono">
                State GST (SGST 9%)
              </span>
              <span className="text-base font-extrabold text-[#0E1C2F] font-mono block mt-1">
                {formatINR(stats.totalSgst)}
              </span>
            </div>

            <div className="p-3 bg-[#FBF9F5] border border-[#E8E5DD] rounded-lg">
              <span className="text-[10px] font-bold text-[#667085] uppercase block font-mono">
                Integrated GST (IGST 18%)
              </span>
              <span className="text-base font-extrabold text-[#0E1C2F] font-mono block mt-1">
                {formatINR(stats.totalIgst)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#0E1C2F] text-white rounded-lg flex items-center justify-between text-xs font-mono">
            <span>Total Consolidated GST Output Payable:</span>
            <span className="text-base font-bold text-[#FDE68A]">{formatINR(stats.totalTax)}</span>
          </div>
        </div>

        {/* Customer Aging & Receivables Schedule */}
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#991B1B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
                Accounts Receivable Aging Distribution
              </h3>
            </div>
            <span className="text-xs text-[#667085]">Terms: 18% p.a. on overdue</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-emerald-800 font-mono block">
                Current Due (0 - 15 Days)
              </span>
              <span className="text-lg font-black text-emerald-900 font-mono block mt-1">
                {formatINR(aging.currentDue)}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block">Within permissible credit limit</span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-amber-800 font-mono block">
                Moderate Due (16 - 30 Days)
              </span>
              <span className="text-lg font-black text-amber-900 font-mono block mt-1">
                {formatINR(aging.midDue)}
              </span>
              <span className="text-[10px] text-amber-700 mt-1 block">Follow-up reminder initiated</span>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-red-800 font-mono block">
                Severely Overdue (&gt; 30 Days)
              </span>
              <span className="text-lg font-black text-red-900 font-mono block mt-1">
                {formatINR(aging.severeDue)}
              </span>
              <span className="text-[10px] text-red-700 mt-1 block">High collection priority</span>
            </div>
          </div>
        </div>

        {/* Customer Commercial Volume Ranking */}
        <div className="bg-white rounded-xl border border-[#E8E5DD] shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0E1C2F]" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1C2F]">
                Commercial Client Account Standings
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#FBF9F5] text-[#667085] font-mono uppercase text-[9px] border-b border-[#E8E5DD]">
                  <th className="py-2 px-3">Client / Company</th>
                  <th className="py-2 px-3">GSTIN</th>
                  <th className="py-2 px-3 text-right">Lifetime Volume</th>
                  <th className="py-2 px-3 text-right">Total Inflow</th>
                  <th className="py-2 px-3 text-right">Outstanding</th>
                  <th className="py-2 px-3 text-center">Recovery %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DD]">
                {customersWithStats.map((c) => {
                  const rate = c.lifetimeRevenue > 0 ? ((c.totalPaid / c.lifetimeRevenue) * 100).toFixed(0) : 100;
                  return (
                    <tr key={c.id} className="hover:bg-[#FBF9F5]">
                      <td className="py-2.5 px-3 font-bold text-[#182230]">
                        {c.company || c.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#667085]">
                        {c.gstin || "Unregistered"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E1C2F]">
                        {formatINR(c.lifetimeRevenue)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatINR(c.totalPaid)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#991B1B]">
                        {formatINR(c.totalOutstanding)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#EFECE4] text-[#0E1C2F] font-bold">
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
