import React, { useState } from "react";
import {
  FileText,
  Download,
  X,
  Search,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Receipt,
  PieChart,
  RefreshCw,
  Target,
  Bot,
  Activity,
  FileSpreadsheet,
  Bell,
  Settings,
  HelpCircle,
  Code,
  Check,
  Printer,
  ExternalLink
} from "lucide-react";
import { generateFinSightDocumentationPDF } from "../utils/pdfGenerator";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureDetail {
  id: string;
  category: string;
  title: string;
  component: string;
  icon: any;
  purpose: string;
  useCases: string[];
  howToUse: string;
  technicalDetails: string;
}

const FEATURE_LIST: FeatureDetail[] = [
  {
    id: "dashboard",
    category: "Core Navigation",
    title: "1. Executive Command Center & Dashboard",
    component: "DashboardTab.tsx",
    icon: LayoutDashboard,
    purpose: "Provides a real-time high-level synthesis of your entire net worth, cashflow velocity, and immediate financial health.",
    useCases: [
      "View total calculated Net Worth (Assets minus Liabilities) updated in real-time.",
      "Monitor monthly cashflow (Income vs Expenses) with percentage growth metrics.",
      "Review the AI Financial Health Score (0-100 rating) with tailored improvement suggestions.",
      "Inspect upcoming auto-debit payments due within the next 7 to 14 days."
    ],
    howToUse: "Click 'Dashboard' in the left menu. Hover or click on KPI cards to expand detailed logs or jump to specific modules.",
    technicalDetails: "Calculated client-side from aggregated state arrays (expenses, holdings, goals) with instant reactive recalculation."
  },
  {
    id: "ledger",
    category: "Expense Suite",
    title: "2. Transaction Ledger & Expense Tracking",
    component: "ExpenseLedger.tsx / ExpensesTab.tsx",
    icon: Receipt,
    purpose: "Full-featured transaction ledger to log, search, filter, and organize all income and expenses.",
    useCases: [
      "Add new expense entries with category, merchant, tax-deductible flag, and payment method.",
      "Search transactions instantly by keyword, category, date range, or price amount.",
      "Filter by payment type (Credit, Debit, Cash, UPI, Bank Transfer) or tax status.",
      "Export custom filtered ledgers to CSV or Excel for tax filing."
    ],
    howToUse: "Go to 'Expenses' -> 'Ledger'. Click 'Add Expense' or use the quick search bar to find past transactions.",
    technicalDetails: "State persisted in localStorage ('finsight_expenses') and synced across all dashboard calculations."
  },
  {
    id: "scanner",
    category: "AI Automation",
    title: "3. AI Receipt & Invoice OCR Scanner",
    component: "ExpenseScanner.tsx",
    icon: Zap,
    purpose: "Eliminates manual data entry by extracting merchant, date, tax, line items, and total amount from receipt photos using AI.",
    useCases: [
      "Upload or drag & drop receipt images (PNG, JPG, WEBP).",
      "Automatic OCR parsing extracts store name, purchase date, total cost, and item category.",
      "One-click auto-add saves the parsed receipt directly into your main transaction ledger."
    ],
    howToUse: "Navigate to 'Expenses' -> 'OCR Scanner'. Drag your receipt image into the box, verify extracted data, and click 'Confirm & Save'.",
    technicalDetails: "Uses HTML5 Canvas preview & image analysis pipeline linked with Gemini GenAI vision recognition."
  },
  {
    id: "splitter",
    category: "Group Finance",
    title: "4. Group Expense & Bill Splitter",
    component: "ExpenseSplitter.tsx",
    icon: FileSpreadsheet,
    purpose: "Simplifies splitting bill costs among roommates, friends, travel groups, or team members.",
    useCases: [
      "Create group expense pools (e.g., 'Summer Beach Trip', 'Apartment Rent & Utilities').",
      "Specify equal or custom percentage/amount share per participant.",
      "Track settled vs outstanding member balances with shareable payment links."
    ],
    howToUse: "Go to 'Expenses' -> 'Group Splitter'. Enter total amount, list participants, assign split amounts, and copy the share link.",
    technicalDetails: "Calculates net balance settlement matrix to minimize the number of required peer-to-peer transfers."
  },
  {
    id: "timeline",
    category: "Cashflow Projections",
    title: "5. Expense Calendar & Cashflow Timeline",
    component: "ExpenseCalendarTimeline.tsx",
    icon: Activity,
    purpose: "Visualizes cash outflow trends across days of the month to spot high-burn spending spikes.",
    useCases: [
      "Interactive calendar heatmap highlighting high-spending vs low-spending days.",
      "Future auto-debit projections showing upcoming bill due dates.",
      "Daily average burn rate calculations."
    ],
    howToUse: "Navigate to 'Expenses' -> 'Calendar Timeline'. Click on any day to inspect transactions executed on that specific date.",
    technicalDetails: "Groups expenses dynamically by date keys and computes daily aggregated totals."
  },
  {
    id: "budgets",
    category: "Budgeting",
    title: "6. Smart Budgeting & Overrun Alerting",
    component: "BudgetsTab.tsx",
    icon: PieChart,
    purpose: "Prevents overspending by enforcing strict category-wise spending limits with multi-tier alerts.",
    useCases: [
      "Set monthly caps for Housing, Food, Utilities, Travel, Entertainment, and Shopping.",
      "Progress bar indicators show real-time percentage spent vs budget cap.",
      "Automatic threshold warnings at 80% caution, 90% critical, and 100%+ overrun."
    ],
    howToUse: "Open 'Budgets'. Click 'Add Budget' or edit existing limits. Adjust thresholds to receive early warning notifications.",
    technicalDetails: "Automatically cross-references spending against the current month's expenses per category."
  },
  {
    id: "portfolio",
    category: "Wealth Management",
    title: "7. Institutional Multi-Asset Portfolio Tracker",
    component: "PortfolioTab.tsx",
    icon: PieChart,
    purpose: "Tracks and analyzes wealth across 11 major asset classes with rebalancing suggestions.",
    useCases: [
      "Support for 11 Asset Classes: Equities, ETFs, Crypto, Mutual Funds, Real Estate REITs, Gold, Sovereign Bonds, NPS, Provident Fund, FDs, and Cash.",
      "Track unrealized/realized profit & loss, percentage yield, and estimated annual dividend income.",
      "Portfolio Rebalancing Tool: Recommends asset adjustments to match your risk tolerance profile."
    ],
    howToUse: "Select 'Portfolio' from the menu. Click 'Add Holding' to log an asset, or switch views to 'Allocation' to see pie charts.",
    technicalDetails: "Real-time performance formulas calculating market value, cost basis, gain/loss, and portfolio weight distribution."
  },
  {
    id: "recurring",
    category: "Subscription Audit",
    title: "8. Recurring Subscriptions & Bill Manager",
    component: "ExpenseRecurring.tsx",
    icon: RefreshCw,
    purpose: "Monitors active recurring subscriptions and bills to identify unwanted auto-renewals and duplicate charges.",
    useCases: [
      "Track subscriptions (Netflix, AWS, Gym, Spotify, Cloud Storage) with renewal countdowns.",
      "View total monthly and annual recurring commitment costs.",
      "AI Subscription Detector identifies unused or duplicate service charges."
    ],
    howToUse: "Go to 'Expenses' -> 'Recurring'. Add subscription profiles or review AI recommendations to cancel dormant services.",
    technicalDetails: "Calculates next renewal dates and filters transactions with recurring cadence tags."
  },
  {
    id: "goals",
    category: "Wealth Building",
    title: "9. Financial Goals & Milestone Engine",
    component: "GoalsTab.tsx",
    icon: Target,
    purpose: "Helps users plan and achieve major life financial goals like home purchase, emergency funds, or early retirement.",
    useCases: [
      "Set goal targets (Target Amount, Target Completion Date, Current Savings).",
      "Calculates required monthly contribution rate to meet targets on time.",
      "Link specific portfolio assets directly to specific wealth goals."
    ],
    howToUse: "Open 'Goals'. Click 'New Goal', specify target date & amount, and track progress with visual percentage rings.",
    technicalDetails: "Computes compound growth projections and monthly required savings based on remaining time horizon."
  },
  {
    id: "assistant",
    category: "AI Advisory",
    title: "10. FinSight AI Financial Assistant",
    component: "AssistantTab.tsx",
    icon: Bot,
    purpose: "24/7 intelligent conversational assistant powered by Google Gemini GenAI for personalized financial advice.",
    useCases: [
      "Ask questions in natural language: 'How can I optimize my monthly budget?' or 'What is my current savings rate?'",
      "Generate deep portfolio risk assessments and tax saving recommendations.",
      "Save conversational threads for future reference."
    ],
    howToUse: "Click 'AI Assistant' in the menu. Type your question or select one of the suggested quick prompts.",
    technicalDetails: "Integrates server-side Gemini 3.5 API calls with custom structured financial context prompts."
  },
  {
    id: "health",
    category: "Financial Wellness",
    title: "11. Holistic Financial Health Radar",
    component: "HealthTab.tsx",
    icon: Activity,
    purpose: "Calculates comprehensive financial health indicators beyond basic bank balances.",
    useCases: [
      "Credit Score Simulator (300-850 range).",
      "Debt-To-Income Ratio (DTI) and Emergency Fund Runway in months.",
      "Step-by-step financial wellness roadmap with prioritized tasks."
    ],
    howToUse: "Select 'Financial Health' to review your overall stability metrics and follow recommended improvement steps.",
    technicalDetails: "Algorithmic scoring model combining savings ratio, liquidity runway, debt ratio, and budget adherence."
  },
  {
    id: "reports",
    category: "Reporting & Tax",
    title: "12. Tax Estimator & Reports Center",
    component: "ReportsTab.tsx",
    icon: FileText,
    purpose: "Generates exportable financial statements and estimates annual tax liabilities.",
    useCases: [
      "Tax liability estimation with tax bracket breakdowns and deductible category alerts.",
      "Download financial statements in CSV, Excel, or PDF formats.",
      "Monthly financial health snapshot summary."
    ],
    howToUse: "Open 'Reports' tab. Select date range, choose desired export format, and click 'Download Report'.",
    technicalDetails: "Client-side file generation for CSV/Excel data and vector rendering for PDF reports."
  },
  {
    id: "notifications",
    category: "Alerts & Comms",
    title: "13. Smart Multi-Channel Notification Matrix",
    component: "NotificationsTab.tsx",
    icon: Bell,
    purpose: "Delivers timely alerts for budget overruns, security events, and goal progress across customizable channels.",
    useCases: [
      "Configure channel preferences: Push Notifications, Email, SMS, or In-App alerts.",
      "Enable 'Do Not Disturb' (DND) mode to suppress non-urgent alerts.",
      "Test notification delivery with the built-in alert emulator."
    ],
    howToUse: "Go to 'Notifications'. Toggle channel switches per notification category or activate Do Not Disturb mode.",
    technicalDetails: "Preferences saved in localStorage ('finsight_notif_channels') with real-time preference filtering."
  },
  {
    id: "enterprise",
    category: "Security & Preferences",
    title: "14. Enterprise Hub, Security & Session Controls",
    component: "EnterpriseHub.tsx / AuthPages.tsx / SettingsTab.tsx",
    icon: Settings,
    purpose: "Manages system customization, user authentication, 2FA security, and active session controls.",
    useCases: [
      "Toggle Dark Mode / Light Mode and select custom UI accent colors (Sky, Emerald, Rose, Amber, Indigo).",
      "Configure 2FA Dual-Factor OTP verification.",
      "Manage active sessions, inspect device/IP logs, and force logout unrecognized devices.",
      "Global keyboard shortcuts and command palette (Ctrl+K)."
    ],
    howToUse: "Access 'Settings' or 'Enterprise Hub'. Use command palette (Ctrl+K) for quick keyboard navigation.",
    technicalDetails: "Integrates Express session token validation with bcrypt security and customizable CSS theme vars."
  }
];

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const categories = ["All", ...Array.from(new Set(FEATURE_LIST.map((f) => f.category)))];

  const filteredFeatures = FEATURE_LIST.filter((f) => {
    const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.useCases.some((uc) => uc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.component.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      const pdf = generateFinSightDocumentationPDF();
      pdf.save("FinSight-System-Documentation.pdf");
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">FinSight System & Feature Manual</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                  v2.4 Official
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete documentation, feature purposing, and user instructions for all modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-lg ${
                downloadSuccess
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-sky-600 hover:bg-sky-500 border-sky-500/30 text-white shadow-sky-950/50"
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  PDF Downloaded!
                </>
              ) : isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Complete PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search features, modules, use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* QUICK LOCAL VS CODE RUN GUIDE BANNER */}
        <div className="mx-6 mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Code className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white">Run in VS Code:</strong> Run <code className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-mono">npm install</code> then <code className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-mono">npm run dev</code>. Opens at <code className="text-sky-400">http://localhost:3000</code>.
            </span>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="hidden sm:flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold transition-all cursor-pointer shrink-0 ml-3"
          >
            <Download className="w-3.5 h-3.5" />
            Get PDF Manual
          </button>
        </div>

        {/* FEATURE DETAILS CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredFeatures.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No features found matching "{searchTerm}".</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-2 text-xs text-sky-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFeatures.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="p-5 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all space-y-3"
                >
                  {/* Title Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Source Code: <code className="text-sky-300/80">{feat.component}</code>
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                      {feat.category}
                    </span>
                  </div>

                  {/* Purpose */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800/60 rounded-lg">
                    <span className="text-xs font-bold text-sky-400 block mb-0.5">
                      Primary Purpose & What It Is Used For:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{feat.purpose}</p>
                  </div>

                  {/* Key Use Cases */}
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Key Capabilities & Use Cases:
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {feat.useCases.map((uc, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{uc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* How To Use & Tech */}
                  <div className="pt-2 border-t border-slate-800/60 flex flex-col md:flex-row gap-3 text-xs">
                    <div className="flex-1">
                      <span className="font-semibold text-slate-300">How to Use: </span>
                      <span className="text-slate-400">{feat.howToUse}</span>
                    </div>
                    <div className="md:w-1/3 text-slate-500 font-mono text-[11px]">
                      <span className="text-slate-400 font-sans font-medium">Architecture: </span>
                      {feat.technicalDetails}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredFeatures.length}</strong> of {FEATURE_LIST.length} system features
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/api/download-documentation-pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Direct Server PDF Link
            </a>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF Manual
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
