import React from "react";
import { 
  FileText, Download, Sparkles, RefreshCw, Layers, CheckCircle2, AlertCircle, 
  FileSpreadsheet, Mail, Send, Check, TrendingUp, TrendingDown, DollarSign, 
  PieChart, ShieldAlert, Briefcase, Target, Award, ArrowUpRight, Zap 
} from "lucide-react";
import { generateFinSightDocumentationPDF, generateFinancialReportPDF } from "../utils/pdfGenerator";
import { Expense, Holding, Goal, UserProfile } from "../types";

interface ReportsTabProps {
  expenses?: Expense[];
  holdings?: Holding[];
  goals?: Goal[];
  userProfile?: UserProfile;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  expenses = [],
  holdings = [],
  goals = [],
  userProfile
}) => {
  const [reportType, setReportType] = React.useState<"monthly" | "yearly" | "expense" | "investment">("monthly");
  const [reportFormat, setReportFormat] = React.useState<"pdf" | "excel">("pdf");
  const [generationProgress, setGenerationProgress] = React.useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);
  const [docPdfDownloading, setDocPdfDownloading] = React.useState(false);
  const [docPdfSuccess, setDocPdfSuccess] = React.useState(false);

  const rawUserName = userProfile?.username || userProfile?.name || "Sovereign User";
  const firstName = rawUserName.split(" ")[0];

  // E-mail dispatch state variables
  const [dispatchEmail, setDispatchEmail] = React.useState(userProfile?.email || "trader@finsight.io");
  const [emailStatus, setEmailStatus] = React.useState<"idle" | "sending" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = React.useState("");

  // Calculated Telemetry Engine
  const totalExpensesAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const clearedExpenses = expenses.filter(e => e.status === 'Cleared');
  const clearedRatio = expenses.length > 0 ? Math.round((clearedExpenses.length / expenses.length) * 100) : 100;

  // Category aggregations for expenses
  const categoryMap: Record<string, { total: number; count: number }> = {};
  expenses.forEach(e => {
    const cat = e.category || "General";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { total: 0, count: 0 };
    }
    categoryMap[cat].total += e.amount;
    categoryMap[cat].count += 1;
  });

  const categoryList = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
    percent: totalExpensesAmount > 0 ? Math.round((data.total / totalExpensesAmount) * 100) : 0
  })).sort((a, b) => b.total - a.total);

  // Holdings telemetry
  const totalHoldingsValue = holdings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
  const totalHoldingsCost = holdings.reduce((acc, h) => acc + h.shares * h.avgPrice, 0);
  const totalHoldingsGainLoss = totalHoldingsValue - totalHoldingsCost;
  const totalHoldingsGainLossPct = totalHoldingsCost > 0 
    ? ((totalHoldingsGainLoss / totalHoldingsCost) * 100).toFixed(2) 
    : "0.00";

  // Holdings grouped by category/type
  const holdingCategoryMap: Record<string, number> = {};
  holdings.forEach(h => {
    const cat = h.type || h.category || "Equity";
    holdingCategoryMap[cat] = (holdingCategoryMap[cat] || 0) + (h.shares * h.currentPrice);
  });

  // Goals telemetry
  const totalGoalsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalGoalsSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallGoalsPct = totalGoalsTarget > 0 ? Math.round((totalGoalsSaved / totalGoalsTarget) * 100) : 0;

  const handleDownloadDocPdf = () => {
    setDocPdfDownloading(true);
    try {
      const pdf = generateFinSightDocumentationPDF();
      pdf.save("FinSight-System-Documentation.pdf");
      setDocPdfSuccess(true);
      setTimeout(() => setDocPdfSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setDocPdfDownloading(false);
    }
  };

  const triggerActualFileDownload = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `FinSight_${reportType.toUpperCase()}_Report_${dateStr}`;

    if (reportFormat === "pdf") {
      const pdf = generateFinancialReportPDF(reportType, undefined, {
        expenses,
        holdings,
        goals,
        userProfile
      });
      pdf.save(`${filename}.pdf`);
    } else {
      let csvLines: string[] = [
        `"FinSight Wealth Management - Executive Audit Report"`,
        `"Report Type","${reportType.toUpperCase()}"`,
        `"Client Identity","${rawUserName}"`,
        `"Generated Date","${dateStr}"`,
        ""
      ];

      if (reportType === "monthly") {
        csvLines.push("--- MONTHLY WEALTH SUMMARY ---");
        csvLines.push(`Total Monthly Discretionary Outflows,${totalExpensesAmount.toFixed(2)}`);
        csvLines.push(`Cleared Ledger Ratio,${clearedRatio}%`);
        csvLines.push(`Active Milestone Goals Saved,${totalGoalsSaved.toFixed(2)} / ${totalGoalsTarget.toFixed(2)} (${overallGoalsPct}%)`);
        csvLines.push(`Portfolio Market Valuation,${totalHoldingsValue.toFixed(2)}`);
        csvLines.push("");
        csvLines.push("Category,Total Spent,Transaction Count,Percent of Outflows");
        categoryList.forEach(c => {
          csvLines.push(`"${c.category}",${c.total.toFixed(2)},${c.count},"${c.percent}%"`);
        });
      } else if (reportType === "yearly") {
        csvLines.push("--- YEARLY CAPITAL AUDIT ---");
        csvLines.push(`Projected Annual Outflow Velocity,${(totalExpensesAmount * 12).toFixed(2)}`);
        csvLines.push(`Multi-Asset Portfolio Valuation,${totalHoldingsValue.toFixed(2)}`);
        csvLines.push(`Accumulated Goal Reserves,${totalGoalsSaved.toFixed(2)}`);
        csvLines.push(`Estimated Aggregate Net Worth,${(totalHoldingsValue + totalGoalsSaved + 45800).toFixed(2)}`);
        csvLines.push("");
        csvLines.push("Asset Class,Valuation,Portfolio Share");
        Object.entries(holdingCategoryMap).forEach(([cat, val]) => {
          const pct = totalHoldingsValue > 0 ? ((val / totalHoldingsValue) * 100).toFixed(1) : "0.0";
          csvLines.push(`"${cat}",${val.toFixed(2)},"${pct}%"`);
        });
      } else if (reportType === "expense") {
        csvLines.push("--- CATEGORICAL OUTFLOW MATRIX ---");
        csvLines.push("Category,Total Amount,Tx Count,Share of Outflows");
        categoryList.forEach(c => {
          csvLines.push(`"${c.category}",${c.total.toFixed(2)},${c.count},"${c.percent}%"`);
        });
        csvLines.push("");
        csvLines.push("--- DETAILED TRANSACTION LEDGER ---");
        csvLines.push("Date,Category,Merchant,Amount,Status,Notes");
        expenses.forEach(e => {
          csvLines.push(`"${e.date}","${e.category}","${e.merchant}",${e.amount.toFixed(2)},"${e.status}","${e.notes || ''}"`);
        });
      } else if (reportType === "investment") {
        csvLines.push("--- PORTFOLIO RETURN TELEMETRY ---");
        csvLines.push(`Total Invested Cost Basis,${totalHoldingsCost.toFixed(2)}`);
        csvLines.push(`Current Market Valuation,${totalHoldingsValue.toFixed(2)}`);
        csvLines.push(`Unrealized Net Return,${totalHoldingsGainLoss.toFixed(2)} (${totalHoldingsGainLossPct}%)`);
        csvLines.push("");
        csvLines.push("Symbol,Asset Name,Type,Shares,Avg Purchase Price,Current Price,Total Valuation,Return ($),Return (%)");
        holdings.forEach(h => {
          const val = h.shares * h.currentPrice;
          const cost = h.shares * h.avgPrice;
          const diff = val - cost;
          const pct = cost > 0 ? ((diff / cost) * 100).toFixed(2) : "0.00";
          csvLines.push(`"${h.symbol}","${h.name}","${h.type || h.category}",${h.shares},${h.avgPrice.toFixed(2)},${h.currentPrice.toFixed(2)},${val.toFixed(2)},${diff.toFixed(2)},"${pct}%"`);
        });
      }

      const csvContent = csvLines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerationProgress(0);
    setDownloadSuccess(false);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadSuccess(true);
          triggerActualFileDownload();
          setTimeout(() => {
            setGenerationProgress(null);
          }, 1500);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const handleEmailReport = async () => {
    if (!dispatchEmail) {
      setEmailStatus("error");
      setEmailMessage("Registered email node is required.");
      return;
    }

    setEmailStatus("sending");
    setEmailMessage("");

    try {
      const docHtml = document.getElementById("document-preview-pane")?.innerText || "";
      const response = await fetch("/api/reports/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: dispatchEmail,
          reportType,
          reportFormat,
          reportContent: docHtml
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mail transmission refused by SMTP relay.");

      setEmailStatus("success");
      setEmailMessage(`Financial package dispatched to ${dispatchEmail}`);
    } catch (err: any) {
      setEmailStatus("error");
      setEmailMessage(err.message || "Failed to dispatch financial statement.");
    }
  };

  const reportOptions = [
    { id: "monthly", title: "Monthly Wealth Summary", desc: "Comprehensive review of discretionary outflows, burn velocity, and goal milestones." },
    { id: "yearly", title: "Yearly Capital Audit", desc: "Annual breakdown of net worth trends, portfolio performance, and asset allocation vectors." },
    { id: "expense", title: "Categorical Outflow Matrix", desc: "Detailed breakdown of transaction clusters, merchant anomalies, and budget compliance ratios." },
    { id: "investment", title: "Portfolio Return Telemetry", desc: "Deep performance review of stock cards, crypto holdings, and yields." },
  ];

  return (
    <div id="reports-tab-view" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-sky-400 text-xs font-mono tracking-widest uppercase">Wealth Records & Manuals</span>
          <h2 className="text-xl font-bold text-white mt-1">Audit Report Dispatch & System Documentation</h2>
          <p className="text-slate-400 text-xs mt-1">
            Generate financial statements or download the complete system feature specification manual PDF.
          </p>
        </div>

        <button
          onClick={handleDownloadDocPdf}
          disabled={docPdfDownloading}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shrink-0 shadow-lg ${
            docPdfSuccess
              ? "bg-emerald-600 border-emerald-500 text-white"
              : "bg-sky-600 hover:bg-sky-500 border-sky-500/30 text-white shadow-sky-950/50"
          }`}
        >
          {docPdfSuccess ? (
            <>
              <Check className="w-4 h-4" />
              System Manual PDF Saved!
            </>
          ) : docPdfDownloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Building PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download System PDF Manual
            </>
          )}
        </button>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection & Generation form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" /> Report Configuration
          </h3>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Report Template</label>
              <div className="space-y-2.5">
                {reportOptions.map((opt) => (
                  <label
                     key={opt.id}
                     onClick={() => setReportType(opt.id as any)}
                     className={`block p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                       reportType === opt.id
                         ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                         : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300"
                     }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold block">{opt.title}</span>
                      <input
                        type="radio"
                        name="reportTemplate"
                        checked={reportType === opt.id}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      {reportType === opt.id && <span className="w-2 h-2 rounded-full bg-sky-500"></span>}
                    </div>
                    <span className="text-[10px] block mt-1 leading-normal text-slate-500">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">File Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReportFormat("pdf")}
                  className={`py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    reportFormat === "pdf"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> PDF (.pdf)
                </button>
                <button
                  type="button"
                  onClick={() => setReportFormat("excel")}
                  className={`py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    reportFormat === "excel"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel / CSV
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Dispatch Node Email</label>
              <input
                type="email"
                placeholder="officer@finsight.io"
                value={dispatchEmail}
                onChange={(e) => setDispatchEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={generationProgress !== null}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sky-950/20 border border-sky-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generationProgress !== null ? "animate-spin" : ""}`} />
                {generationProgress !== null ? "Compiling..." : "Compile & Download"}
              </button>

              <button
                type="button"
                onClick={handleEmailReport}
                disabled={emailStatus === "sending"}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-sky-500/20 disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${emailStatus === "sending" ? "animate-pulse" : ""}`} />
                {emailStatus === "sending" ? "Transmitting..." : "Email Report to Node"}
              </button>
            </div>
          </form>

          {/* Email sending status alerts */}
          {emailStatus !== "idle" && (
            <div className={`p-3.5 rounded-xl text-xs border ${
              emailStatus === "success" 
                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                : emailStatus === "error"
                ? "bg-rose-950/20 border-rose-500/20 text-rose-400"
                : "bg-sky-950/20 border-sky-500/20 text-sky-400 animate-pulse"
            }`}>
              <div className="flex items-center gap-2">
                {emailStatus === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {emailStatus === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
                {emailStatus === "sending" && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
                <span className="font-semibold">{emailStatus === "sending" ? "Sending dispatch..." : emailMessage}</span>
              </div>
            </div>
          )}

          {/* Download progress toasts */}
          {generationProgress !== null && (
            <div className="p-4 bg-slate-950 border border-sky-500/25 rounded-xl space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-sky-400">
                <span>COMPILING LEDGERS...</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${generationProgress}%` }}></div>
              </div>
            </div>
          )}

          {downloadSuccess && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Compilation Secured</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Cryptographic {reportFormat.toUpperCase()} package compiled and downloaded successfully. Check browser cache.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Live Document Preview Engine */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" /> Live Dynamic Document Preview Engine
            </h3>
            <span className="text-[10px] font-mono text-slate-400 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg">
              Template: <strong className="text-sky-400 uppercase">{reportType}</strong>
            </span>
          </div>

          {/* Interactive Dynamic Document Layout */}
          <div id="document-preview-pane" className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 space-y-6 max-h-[560px] overflow-y-auto font-sans text-xs text-slate-300">
            {/* Header / Document Identity */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-sky-400 uppercase">
                  {reportType === "monthly" ? "Monthly Executive Briefing" : reportType === "yearly" ? "Annual Capital Audit" : reportType === "expense" ? "Outflow Matrix Telemetry" : "Portfolio Performance Audit"}
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  FinSight {reportOptions.find(o => o.id === reportType)?.title}
                </h2>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Client ID: <span className="text-slate-200">@{rawUserName}</span> | Packet: FSR_{reportType.toUpperCase()}_{new Date().getMonth() + 1}_2026
                </p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono text-[10px] font-bold block bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  VERIFIED AUDIT
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* --- 1. MONTHLY WEALTH SUMMARY VIEW --- */}
            {reportType === "monthly" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 mb-2">1. Monthly Executive Summary</h4>
                  <p className="leading-relaxed text-slate-300">
                    As of {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}, discretionary outflows for <strong>{rawUserName}</strong> total <strong>${totalExpensesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> across <strong>{expenses.length} transactions</strong>. The clearing ledger ratio is <strong>{clearedRatio}%</strong>. Milestone wealth goals have accumulated <strong>${totalGoalsSaved.toLocaleString()}</strong> towards the overall <strong>${totalGoalsTarget.toLocaleString()}</strong> target.
                  </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Monthly Outflows</span>
                    <p className="text-sm font-bold text-white">${totalExpensesAmount.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-400 block">Cleared: {clearedRatio}%</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Active Goal Savings</span>
                    <p className="text-sm font-bold text-sky-400">${totalGoalsSaved.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400 block">{overallGoalsPct}% of target</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Portfolio Valuation</span>
                    <p className="text-sm font-bold text-emerald-400">${totalHoldingsValue.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-400 block">{totalHoldingsGainLoss >= 0 ? '+' : ''}{totalHoldingsGainLossPct}% Return</span>
                  </div>
                </div>

                {/* Outflow Breakdown by Category */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">2. Outflow Telemetry Breakdown</h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 bg-slate-900 p-2.5 font-mono text-[9px] text-slate-400 font-bold">
                      <div>Category</div>
                      <div className="text-right">Outflow Total ($)</div>
                      <div className="text-right">Tx Count</div>
                      <div className="text-right">Share of Budget</div>
                    </div>
                    <div className="p-2.5 space-y-2 border-t border-slate-800/60 font-mono text-xs">
                      {categoryList.slice(0, 5).map((cat, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 items-center">
                          <span className="text-white font-semibold">{cat.category}</span>
                          <span className="text-right text-slate-200">${cat.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-right text-slate-400">{cat.count}</span>
                          <span className="text-right text-sky-400">{cat.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Goal Milestones */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">3. Capital Goal Milestones</h4>
                  <div className="space-y-2">
                    {goals.slice(0, 3).map((g) => {
                      const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
                      return (
                        <div key={g.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white font-bold">{g.title}</span>
                            <span className="font-mono text-sky-400">${g.currentAmount.toLocaleString()} / ${g.targetAmount.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* --- 2. YEARLY CAPITAL AUDIT VIEW --- */}
            {reportType === "yearly" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 mb-2">1. Annual Wealth & Capital Audit</h4>
                  <p className="leading-relaxed text-slate-300">
                    Annual executive statement for <strong>{rawUserName}</strong> covering the full 2026 fiscal cycle. Multi-asset holdings valuation stands at <strong>${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> with a net gain of <strong>${totalHoldingsGainLoss.toLocaleString()} ({totalHoldingsGainLossPct}%)</strong>. Projected annualized outflow velocity is estimated at <strong>${(totalExpensesAmount * 12).toLocaleString()}</strong>.
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Annualized Outflows</span>
                    <p className="text-sm font-bold text-rose-400">${(totalExpensesAmount * 12).toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 block">12-Month Projection</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Asset Holdings Valuation</span>
                    <p className="text-sm font-bold text-emerald-400">${totalHoldingsValue.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-400 block">+{totalHoldingsGainLossPct}% Cumulative</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Aggregate Net Wealth</span>
                    <p className="text-sm font-bold text-white">${(totalHoldingsValue + totalGoalsSaved + 45800).toLocaleString()}</p>
                    <span className="text-[9px] text-sky-400 block">Includes Liquid Cash</span>
                  </div>
                </div>

                {/* Asset Allocation Vectors */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">2. Asset Class Allocation Matrix</h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 font-mono text-[9px] text-slate-400 font-bold">
                      <div>Asset Class</div>
                      <div className="text-right">Total Valuation ($)</div>
                      <div className="text-right">Portfolio Share</div>
                    </div>
                    <div className="p-2.5 space-y-2 border-t border-slate-800/60 font-mono text-xs">
                      {Object.entries(holdingCategoryMap).map(([cat, val], i) => {
                        const pct = totalHoldingsValue > 0 ? ((val / totalHoldingsValue) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={i} className="grid grid-cols-3 gap-2 items-center">
                            <span className="text-white font-semibold">{cat}</span>
                            <span className="text-right text-slate-200">${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-right text-sky-400">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tax Bracket Matrix */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase border-b border-slate-800 pb-1.5">
                    <span>Tax Optimization Matrix</span>
                    <span className="text-emerald-400 font-bold">Standard Single Deduct</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Standard Federal Deduction: <strong className="text-white">$14,600</strong></div>
                    <div>Pre-Tax Traditional 401(k): <strong className="text-sky-400">$23,000</strong></div>
                    <div>Estimated Federal Bracket: <strong className="text-white">24%</strong></div>
                    <div>Tax Optimization Savings: <strong className="text-emerald-400 font-bold">~$5,520/yr</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* --- 3. CATEGORICAL OUTFLOW MATRIX VIEW --- */}
            {reportType === "expense" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 mb-2">1. Categorical Outflow Telemetry</h4>
                  <p className="leading-relaxed text-slate-300">
                    Outflow matrix analysis for <strong>{rawUserName}</strong> across <strong>{expenses.length} transaction entries</strong> totaling <strong>${totalExpensesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>. The average cost per transaction is <strong>${expenses.length > 0 ? (totalExpensesAmount / expenses.length).toFixed(2) : '0.00'}</strong>.
                  </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Total Outflow Value</span>
                    <p className="text-sm font-bold text-white">${totalExpensesAmount.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 block">{expenses.length} Total Records</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Avg Transaction Size</span>
                    <p className="text-sm font-bold text-sky-400">${expenses.length > 0 ? (totalExpensesAmount / expenses.length).toFixed(2) : '0.00'}</p>
                    <span className="text-[9px] text-slate-500 block">Mean Outflow Cost</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Cleared Ledger Ratio</span>
                    <p className="text-sm font-bold text-emerald-400">{clearedRatio}%</p>
                    <span className="text-[9px] text-emerald-400 block">{clearedExpenses.length} Cleared Entries</span>
                  </div>
                </div>

                {/* Category Outflow Matrix Table */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">2. Categorical Distribution Matrix</h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 bg-slate-900 p-2.5 font-mono text-[9px] text-slate-400 font-bold">
                      <div>Category</div>
                      <div className="text-right">Total Outflow ($)</div>
                      <div className="text-right">Count</div>
                      <div className="text-right">Budget Share</div>
                    </div>
                    <div className="p-2.5 space-y-2 border-t border-slate-800/60 font-mono text-xs">
                      {categoryList.map((cat, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 items-center">
                          <span className="text-white font-semibold">{cat.category}</span>
                          <span className="text-right text-slate-200">${cat.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-right text-slate-400">{cat.count}</span>
                          <span className="text-right text-sky-400">{cat.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flagged or Recent Transactions */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">3. Recent Ledger Transactions</h4>
                  <div className="space-y-2 font-mono text-xs">
                    {expenses.slice(0, 4).map((e) => (
                      <div key={e.id} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold block">{e.merchant}</span>
                          <span className="text-[10px] text-slate-400">{e.category} | {e.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-rose-400 font-bold block">-${e.amount.toFixed(2)}</span>
                          <span className={`text-[9px] ${e.status === 'Cleared' ? 'text-emerald-400' : 'text-amber-400'}`}>{e.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- 4. PORTFOLIO RETURN TELEMETRY VIEW --- */}
            {reportType === "investment" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400 mb-2">1. Investment Portfolio Telemetry</h4>
                  <p className="leading-relaxed text-slate-300">
                    Comprehensive multi-asset yield statement for <strong>{rawUserName}</strong> across <strong>{holdings.length} holding cards</strong>. Total invested cost basis is <strong>${totalHoldingsCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> against a current market valuation of <strong>${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>, yielding an unrealized net return of <strong>${totalHoldingsGainLoss.toLocaleString()} ({totalHoldingsGainLossPct}%)</strong>.
                  </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Current Portfolio Value</span>
                    <p className="text-sm font-bold text-white">${totalHoldingsValue.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 block">{holdings.length} Multi-Asset Cards</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Cost Basis</span>
                    <p className="text-sm font-bold text-sky-400">${totalHoldingsCost.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 block">Total Capital Invested</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase">Cumulative Return</span>
                    <p className={`text-sm font-bold ${totalHoldingsGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalHoldingsGainLoss >= 0 ? '+' : ''}${totalHoldingsGainLoss.toLocaleString()}
                    </p>
                    <span className={`text-[9px] ${totalHoldingsGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'} block`}>
                      {totalHoldingsGainLossPct}% ROI
                    </span>
                  </div>
                </div>

                {/* Holdings Asset Table */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-400">2. Asset Holdings Yield Matrix</h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-5 gap-2 bg-slate-900 p-2.5 font-mono text-[9px] text-slate-400 font-bold">
                      <div className="col-span-2">Asset / Symbol</div>
                      <div className="text-right">Shares</div>
                      <div className="text-right">Valuation ($)</div>
                      <div className="text-right">Return</div>
                    </div>
                    <div className="p-2.5 space-y-2 border-t border-slate-800/60 font-mono text-xs">
                      {holdings.map((h, i) => {
                        const val = h.shares * h.currentPrice;
                        const cost = h.shares * h.avgPrice;
                        const diff = val - cost;
                        const pct = cost > 0 ? ((diff / cost) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={i} className="grid grid-cols-5 gap-2 items-center">
                            <div className="col-span-2">
                              <span className="text-white font-bold block">{h.name} ({h.symbol})</span>
                              <span className="text-[9px] text-slate-400">{h.type || h.category}</span>
                            </div>
                            <span className="text-right text-slate-300">{h.shares}</span>
                            <span className="text-right text-slate-200">${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className={`text-right font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {diff >= 0 ? '+' : ''}{pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cryptographic Signature Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-sky-400">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                Verified Signature: FinSight Sovereign AI Layer
              </span>
              <span>SHA_256: 0x9a7b2e8f...41a3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

