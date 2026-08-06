import React from "react";
import { CURRENCIES, getCurrencySymbol, getCurrencyRate } from "../utils/currency";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Shield,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Activity,
  Search,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  Send,
  CheckCircle2,
  ChevronDown,
  Check,
  Trash2,
  Edit3,
  X,
  Filter,
  Palette,
  Layers,
  HelpCircle,
  Star,
  Pin,
  Sliders,
  Play,
  Plus,
  CreditCard,
  DollarSign,
  Maximize2,
  Minimize2,
  Terminal,
  Flame,
  Info,
  Printer,
  Share2,
  FileSpreadsheet,
  Keyboard,
  Grid,
  Clock,
  RotateCcw
} from "lucide-react";
import { Expense, Holding, Goal, UserProfile } from "../types";
import { generateFinancialReportPDF } from "../utils/pdfGenerator";

interface DashboardTabProps {
  expenses: Expense[];
  holdings: Holding[];
  goals: Goal[];
  userProfile: UserProfile;
  insights: any;
  isLoadingInsights: boolean;
  onRefreshInsights: () => void;
  onTabChange: (tab: string) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

// Interactive Theme Configs
type ThemeName = "obsidian" | "sovereign" | "emerald" | "navy";

interface ThemeColors {
  primary: string;
  bg: string;
  border: string;
  glow: string;
  accent: string;
  badge: string;
  text: string;
}

const THEME_MAP: Record<ThemeName, ThemeColors> = {
  obsidian: {
    primary: "text-sky-400",
    bg: "bg-slate-900",
    border: "border-slate-800",
    glow: "bg-sky-500/5",
    accent: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    badge: "text-sky-400 bg-sky-950/40 border border-sky-500/20",
    text: "text-slate-100"
  },
  sovereign: {
    primary: "text-amber-400",
    bg: "bg-stone-900",
    border: "border-stone-800",
    glow: "bg-amber-500/5",
    accent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badge: "text-amber-400 bg-amber-950/40 border border-amber-500/20",
    text: "text-stone-100"
  },
  emerald: {
    primary: "text-emerald-400",
    bg: "bg-slate-950",
    border: "border-emerald-950",
    glow: "bg-emerald-500/5",
    accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badge: "text-emerald-400 bg-emerald-950/40 border border-emerald-500/20",
    text: "text-slate-100"
  },
  navy: {
    primary: "text-indigo-400",
    bg: "bg-slate-900",
    border: "border-indigo-950",
    glow: "bg-indigo-500/5",
    accent: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    badge: "text-indigo-400 bg-indigo-950/40 border border-indigo-500/20",
    text: "text-slate-100"
  }
};

interface WidgetOrder {
  id: string;
  title: string;
  width: "compact" | "wide" | "full";
  pinned: boolean;
  isFavorite: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  expenses,
  holdings,
  goals,
  userProfile,
  insights,
  isLoadingInsights,
  onRefreshInsights,
  onTabChange,
  onUpdateProfile
}) => {
  // 1. Dashboard Themes & Styling
  const [activeTheme, setActiveTheme] = React.useState<ThemeName>("obsidian");
  const theme = THEME_MAP[activeTheme];

  // 2. Command Palette (Ctrl+K) State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [commandQuery, setCommandQuery] = React.useState("");

  // 3. Currency Selector for Executive Summary
  const currency = userProfile?.currency || "USD";
  const activeCurrencySymbol = getCurrencySymbol(currency);
  const activeCurrencyRate = getCurrencyRate(currency);

  const handleSelectCurrency = (newCode: string) => {
    if (onUpdateProfile) {
      onUpdateProfile({ currency: newCode });
    }
  };

  // 4. Personalization State (Widget visibility, width sizes, order, pins, favorites)
  const defaultVisibleWidgets: Record<string, boolean> = {
    welcomeCard: true,
    quickActions: true,
    financialSummary: true,
    chartsSection: true,
    recentActivity: true,
    reportsBuilder: true
  };

  const defaultWidgetRegistry: WidgetOrder[] = [
    { id: "welcomeCard", title: "Welcome Executive Card", width: "full", pinned: true, isFavorite: true },
    { id: "quickActions", title: "Corporate Quick Actions", width: "full", pinned: false, isFavorite: false },
    { id: "financialSummary", title: "Bento Financial Summary", width: "full", pinned: true, isFavorite: true },
    { id: "chartsSection", title: "Executive Analytical Charts", width: "full", pinned: false, isFavorite: false },
    { id: "recentActivity", title: "Real-time Auditing & Bills", width: "full", pinned: false, isFavorite: false },
    { id: "reportsBuilder", title: "Corporate Report Generation & Exports", width: "full", pinned: false, isFavorite: false }
  ];

  const [visibleWidgets, setVisibleWidgets] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("finsight_visible_widgets");
      return saved ? JSON.parse(saved) : defaultVisibleWidgets;
    } catch {
      return defaultVisibleWidgets;
    }
  });

  const [widgetRegistry, setWidgetRegistry] = React.useState<WidgetOrder[]>(() => {
    try {
      const saved = localStorage.getItem("finsight_widget_registry");
      return saved ? JSON.parse(saved) : defaultWidgetRegistry;
    } catch {
      return defaultWidgetRegistry;
    }
  });

  // Sync personalization to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("finsight_visible_widgets", JSON.stringify(visibleWidgets));
    } catch {}
  }, [visibleWidgets]);

  React.useEffect(() => {
    try {
      localStorage.setItem("finsight_widget_registry", JSON.stringify(widgetRegistry));
    } catch {}
  }, [widgetRegistry]);

  // Reset Visibility Matrix Defaults helper
  const handleResetVisibilityMatrix = () => {
    setVisibleWidgets(defaultVisibleWidgets);
    setWidgetRegistry(defaultWidgetRegistry);
    triggerToast("Dashboard Visibility Matrix restored to corporate default profile!");
  };

  // Local expenses state for real-time ledger auditing and status toggles
  const [localExpenses, setLocalExpenses] = React.useState<Expense[]>(expenses);

  React.useEffect(() => {
    setLocalExpenses(expenses);
  }, [expenses]);

  // 5. Interactive Bills State (with ability to settle bills)
  const [upcomingBills, setUpcomingBills] = React.useState([
    { id: "bill-1", name: "PG&E Energy Grid AutoPay", date: "2026-07-24", amount: 120.0, category: "Utilities", settled: false },
    { id: "bill-2", name: "Mortgage Primary Residence Settlement", date: "2026-08-01", amount: 1800.0, category: "Housing", settled: false },
    { id: "bill-3", name: "Equinox Athletic Club Dues", date: "2026-08-03", amount: 120.0, category: "Entertainment", settled: false },
    { id: "bill-4", name: "Netflix Premium Family Stream", date: "2026-08-05", amount: 22.99, category: "Entertainment", settled: false }
  ]);

  // 6. Recent Transactions Search and Real-Time Ledger Filter State
  const [transactionQuery, setTransactionQuery] = React.useState("");
  const [transactionFilter, setTransactionFilter] = React.useState<"All" | "Cleared" | "Pending" | "Flagged">("All");
  const [transactionCategoryFilter, setTransactionCategoryFilter] = React.useState<string>("All Categories");
  const [transactionSortOrder, setTransactionSortOrder] = React.useState<"newest" | "highest" | "lowest">("newest");

  // 7. Notification / Alert Feed
  const [notifications, setNotifications] = React.useState([
    { id: "n-1", type: "warning", message: "Anomalous $328 CVS merchant activity logged. Review open.", time: "10m ago" },
    { id: "n-2", type: "success", message: "Automated cash re-routing complete. Yield optimized +1.4%.", time: "2h ago" },
    { id: "n-3", type: "info", message: "Q3 corporate portfolio performance statement generated.", time: "1d ago" }
  ]);

  // 8. Custom Reports Builder state & Parameter Matrix Directives
  const [activeReportTab, setActiveReportTab] = React.useState<"monthly" | "quarterly" | "yearly" | "expense" | "investment" | "goal" | "tax">("monthly");
  const [customReportTitle, setCustomReportTitle] = React.useState("Sovereign Executive Briefing");
  const [reportIncludeLedger, setReportIncludeLedger] = React.useState(true);
  const [reportIncludeNetWorth, setReportIncludeNetWorth] = React.useState(true);
  const [reportIncludePredictions, setReportIncludePredictions] = React.useState(true);
  const [reportIncludeTax, setReportIncludeTax] = React.useState(true);
  const [reportIncludeHoldings, setReportIncludeHoldings] = React.useState(true);
  const [reportIncludeGoals, setReportIncludeGoals] = React.useState(true);
  const [reportIncludeSignatures, setReportIncludeSignatures] = React.useState(true);

  // 9. Toast notification trigger
  const [localToast, setLocalToast] = React.useState<{ show: boolean; message: string; type: "success" | "info" } | null>(null);

  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setLocalToast({ show: true, message, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  // Listen for Ctrl+K key binding
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute stats dynamically from real props data
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  const totalExpensesValue = expenses.reduce((sum, e) => (e.status !== "Flagged" ? sum + e.amount : sum), 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Simulated Net Worth
  const baseNetWorth = totalHoldingsValue + totalGoalsSaved - totalExpensesValue * 0.1;
  const netWorthConverted = baseNetWorth * activeCurrencyRate;
  const formattedNetWorth = netWorthConverted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const convertedIncome = 12500 * activeCurrencyRate;
  const convertedExpenses = totalExpensesValue * activeCurrencyRate;
  const convertedSavings = (12500 - totalExpensesValue) * activeCurrencyRate;

  // Settle Bill handler
  const settleBill = (billId: string, amount: number, name: string) => {
    setUpcomingBills((prev) => prev.map((b) => (b.id === billId ? { ...b, settled: true } : b)));
    triggerToast(`Capital settlement initiated for: ${name} ($${amount})`);
  };

  // Time-based greeting helper
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return { text: "Good Morning", icon: "🌅", timeLabel: "Morning Session" };
    } else if (currentHour >= 12 && currentHour < 17) {
      return { text: "Good Afternoon", icon: "☀️", timeLabel: "Midday Session" };
    } else if (currentHour >= 17 && currentHour < 22) {
      return { text: "Good Evening", icon: "🌆", timeLabel: "Evening Session" };
    } else {
      return { text: "Good Night", icon: "🌙", timeLabel: "Late Night Session" };
    }
  };

  // Custom export real triggers with parameter matrix options
  const handleExport = (format: "PDF" | "Excel" | "CSV" | "Print" | "Share") => {
    const filename = `${customReportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}`;
    if (format === "PDF") {
      const pdf = generateFinancialReportPDF(activeReportTab, customReportTitle, {
        includeLedger: reportIncludeLedger,
        includeNetWorth: reportIncludeNetWorth,
        includePredictions: reportIncludePredictions,
        includeTax: reportIncludeTax,
        includeHoldings: reportIncludeHoldings,
        includeGoals: reportIncludeGoals,
        includeSignatures: reportIncludeSignatures,
        currencySymbol: activeCurrencySymbol,
        currencyRate: activeCurrencyRate,
        expenses,
        holdings,
        goals,
        userProfile
      });
      pdf.save(`${filename}.pdf`);
      triggerToast(`PDF Report Compiled & Downloaded: "${customReportTitle}"`);
    } else if (format === "CSV" || format === "Excel") {
      const userName = userProfile?.username || userProfile?.name || "Executive User";
      let csvLines: string[] = [
        `"Report Title","${customReportTitle}"`,
        `"User","${userName}"`,
        `"Report Profile","${activeReportTab.toUpperCase()}"`,
        `"Currency","${activeCurrencySymbol}"`,
        `"Generated Date","${new Date().toISOString().split('T')[0]}"`,
        ""
      ];

      if (reportIncludeLedger) {
        csvLines.push("--- TRANSACTION LEDGER ---");
        csvLines.push("Category,Merchant,Amount,Date,Status,Notes");
        expenses.forEach(e => {
          csvLines.push(`"${e.category}","${e.merchant}",${(e.amount * activeCurrencyRate).toFixed(2)},"${e.date}","${e.status}","${e.notes || ''}"`);
        });
        csvLines.push("");
      }

      if (reportIncludeHoldings) {
        csvLines.push("--- PORTFOLIO HOLDINGS ---");
        csvLines.push("Symbol,Asset Name,Category,Shares,Current Price,Valuation");
        holdings.forEach(h => {
          csvLines.push(`"${h.symbol}","${h.name}","${h.category}",${h.shares},${(h.currentPrice * activeCurrencyRate).toFixed(2)},${(h.shares * h.currentPrice * activeCurrencyRate).toFixed(2)}`);
        });
        csvLines.push("");
      }

      if (reportIncludeGoals) {
        csvLines.push("--- MILESTONE WEALTH GOALS ---");
        csvLines.push("Goal Title,Category,Target Amount,Current Saved,Progress Ratio");
        goals.forEach(g => {
          csvLines.push(`"${g.title}","${g.category}",${(g.targetAmount * activeCurrencyRate).toFixed(2)},${(g.currentAmount * activeCurrencyRate).toFixed(2)},"${Math.round((g.currentAmount / g.targetAmount) * 100)}%"`);
        });
        csvLines.push("");
      }

      if (reportIncludeTax) {
        csvLines.push("--- TAX ESTIMATOR MATRIX ---");
        csvLines.push("Gross Taxable Salary,Standard Deduction,Estimated Federal Tax,Effective Rate");
        csvLines.push(`"${(150000 * activeCurrencyRate).toFixed(2)}","${(14600 * activeCurrencyRate).toFixed(2)}","${(28500 * activeCurrencyRate).toFixed(2)}","19.0%"`);
        csvLines.push("");
      }

      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.${format === 'Excel' ? 'csv' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast(`${format} Ledger Package Compiled & Downloaded successfully!`);
    } else if (format === "Print") {
      window.print();
    } else if (format === "Share") {
      if (navigator.share) {
        navigator.share({
          title: customReportTitle,
          text: `FinSight Financial Report: ${customReportTitle}`,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        triggerToast("Report link copied to clipboard!");
      }
    }
  };

  // Command execution
  const executeCommand = (action: () => void, message: string) => {
    action();
    setIsCommandPaletteOpen(false);
    triggerToast(message);
    setCommandQuery("");
  };

  // Real-Time Filtered transactions for quick overview
  const uniqueLedgerCategories = Array.from(new Set(localExpenses.map((e) => e.category)));

  const filteredTransactions = localExpenses
    .filter((e) => {
      const matchesSearch =
        e.merchant.toLowerCase().includes(transactionQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(transactionQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(transactionQuery.toLowerCase()));
      const matchesStatus = transactionFilter === "All" || e.status === transactionFilter;
      const matchesCategory =
        transactionCategoryFilter === "All Categories" || e.category === transactionCategoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (transactionSortOrder === "highest") return b.amount - a.amount;
      if (transactionSortOrder === "lowest") return a.amount - b.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const filteredTransactionsTotal = filteredTransactions.reduce((sum, e) => sum + e.amount, 0);

  // Hotkey commands list
  const systemCommands = [
    {
      name: "Switch to Obsidian Dark theme",
      category: "Theme",
      shortcut: "Alt + 1",
      action: () => setActiveTheme("obsidian"),
      message: "Theme updated to Obsidian Dark"
    },
    {
      name: "Switch to Sovereign Gold theme",
      category: "Theme",
      shortcut: "Alt + 2",
      action: () => setActiveTheme("sovereign"),
      message: "Theme updated to Sovereign Gold"
    },
    {
      name: "Switch to Emerald Velvet theme",
      category: "Theme",
      shortcut: "Alt + 3",
      action: () => setActiveTheme("emerald"),
      message: "Theme updated to Emerald Velvet"
    },
    {
      name: "Switch to Classic Navy theme",
      category: "Theme",
      shortcut: "Alt + 4",
      action: () => setActiveTheme("navy"),
      message: "Theme updated to Classic Navy"
    },
    {
      name: "Settle all due invoices & bills",
      category: "Invoices",
      shortcut: "Ctrl + S",
      action: () => {
        setUpcomingBills((prev) => prev.map((b) => ({ ...b, settled: true })));
      },
      message: "All pending upcoming bills settled!"
    },
    {
      name: "Re-run AI Portfolio Audit",
      category: "Audits",
      shortcut: "Ctrl + R",
      action: () => onRefreshInsights(),
      message: "Neural audit refreshed!"
    },
    {
      name: "Convert dashboard currency to EUR (€)",
      category: "Currency",
      shortcut: "Shift + E",
      action: () => handleSelectCurrency("EUR"),
      message: "Dashboard values calibrated to EUR (€)"
    },
    {
      name: "Convert dashboard currency to USD ($)",
      category: "Currency",
      shortcut: "Shift + U",
      action: () => handleSelectCurrency("USD"),
      message: "Dashboard values calibrated to USD ($)"
    },
    {
      name: "Convert dashboard currency to GBP (£)",
      category: "Currency",
      shortcut: "Shift + G",
      action: () => handleSelectCurrency("GBP"),
      message: "Dashboard values calibrated to GBP (£)"
    },
    {
      name: "Convert dashboard currency to INR (₹)",
      category: "Currency",
      shortcut: "Shift + I",
      action: () => handleSelectCurrency("INR"),
      message: "Dashboard values calibrated to INR (₹)"
    },
    {
      name: "Generate Executive CSV Ledger File",
      category: "Reports",
      shortcut: "Shift + D",
      action: () => handleExport("CSV"),
      message: "Exporting ledger CSV..."
    }
  ];

  const filteredCommands = systemCommands.filter((cmd) =>
    cmd.name.toLowerCase().includes(commandQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(commandQuery.toLowerCase())
  );

  // Widget management utilities
  const moveWidget = (index: number, direction: "up" | "down") => {
    const updated = [...widgetRegistry];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      setWidgetRegistry(updated);
      triggerToast("Dashboard widget order prioritized");
    }
  };

  const togglePin = (id: string) => {
    setWidgetRegistry((prev) =>
      prev.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w))
    );
    triggerToast("Widget pin priority updated");
  };

  const toggleFavorite = (id: string) => {
    setWidgetRegistry((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isFavorite: !w.isFavorite } : w))
    );
    triggerToast("Widget favoritism logged");
  };

  const cycleWidgetWidth = (id: string) => {
    setWidgetRegistry((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextWidth: "compact" | "wide" | "full" =
            w.width === "compact" ? "wide" : w.width === "wide" ? "full" : "compact";
          return { ...w, width: nextWidth };
        }
        return w;
      })
    );
    triggerToast("Widget grid dimensions modified");
  };

  return (
    <div id="premium-executive-dashboard" className={`space-y-6 text-left ${theme.text}`}>
      {/* LOCAL TOAST SYSTEM */}
      {localToast?.show && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-slate-950 border border-slate-800 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-xs font-mono">{localToast.message}</span>
        </div>
      )}

      {/* COMMAND PALETTE WINDOW (Ctrl + K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          <div
            onClick={() => setIsCommandPaletteOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          ></div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search commands, themes, reports, currencies... (Ctrl+K to close)"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-slate-500 font-mono"
              />
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] text-slate-400 rounded-lg font-mono">
                ESC
              </span>
            </div>

            <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-800/40 p-2">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => executeCommand(cmd.action, cmd.message)}
                    className="w-full text-left p-3 hover:bg-slate-850/60 transition-colors rounded-xl flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 bg-slate-950 text-slate-500 text-[8px] font-mono rounded uppercase">
                        {cmd.category}
                      </span>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {cmd.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      {cmd.shortcut}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No execution protocols found for "{commandQuery}". Try typing "theme" or "currency".
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-850 text-[10px] text-slate-500 font-mono flex justify-between items-center px-4">
              <span>Finsight Executive Command Palette</span>
              <span className="flex items-center gap-1">
                <Keyboard className="w-3 h-3 text-slate-400" /> Select with mouse or use shortcuts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER CONTROLS (Theme Switcher, Currency & Palette Trigger) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850 shadow-inner">
        <div className="flex items-center gap-2">
          <Palette className={`w-4 h-4 ${theme.primary}`} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Corporate Theme Presets:
          </span>
          <div className="flex gap-1">
            {(["obsidian", "sovereign", "emerald", "navy"] as const).map((tName) => (
              <button
                key={tName}
                onClick={() => {
                  setActiveTheme(tName);
                  triggerToast(`Active Theme updated to ${tName.toUpperCase()}`);
                }}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold capitalize rounded-md border cursor-pointer transition-all ${
                  activeTheme === tName
                    ? "bg-slate-900 border-slate-700 text-white shadow-lg"
                    : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300"
                }`}
              >
                {tName}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Command Palette Trigger Badge */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-[10px] font-mono hover:text-white transition-all cursor-pointer"
          >
            <Keyboard className={`w-3.5 h-3.5 ${theme.primary}`} />
            <span>Command Palette</span>
            <span className="px-1 bg-slate-950 border border-slate-800 text-[8px] text-slate-400 rounded">
              Ctrl+K
            </span>
          </button>

          {/* Currency Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-[280px]">
            {["USD", "EUR", "GBP", "INR", "JPY", "CAD"].map((cur) => (
              <button
                key={cur}
                onClick={() => {
                  handleSelectCurrency(cur);
                  triggerToast(`Executive currency switched to ${cur}`);
                }}
                className={`px-2 py-0.5 text-[9px] font-mono font-black rounded cursor-pointer whitespace-nowrap ${
                  currency === cur ? "bg-slate-950 text-sky-400 border border-sky-500/30" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER DYNAMIC CUSTOMIZABLE WIDGETS */}
      {widgetRegistry.map((widget, index) => {
        const isVisible = visibleWidgets[widget.id];
        if (!isVisible) return null;

        // Visual enhancement wrappers for Pinned or Favorited statuses
        const isPinned = widget.pinned;
        const isFav = widget.isFavorite;

        const widgetClasses = `bg-slate-900 border ${
          isPinned ? "border-amber-500/20 shadow-amber-500/5 ring-1 ring-amber-500/10" : theme.border
        } rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 ${
          widget.width === "compact"
            ? "lg:col-span-1"
            : widget.width === "wide"
            ? "lg:col-span-2"
            : "lg:col-span-3"
        }`;

        return (
          <div key={widget.id} className={widgetClasses}>
            {/* BACKGROUND GLOW */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${theme.glow} rounded-full blur-3xl pointer-events-none`}></div>

            {/* WIDGET EXECUTIVE TOP CONTROL BAR */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 mb-6 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] ${theme.primary} uppercase tracking-wider font-bold`}>
                  {isPinned && "⚡ [PINNED] "} {widget.title}
                </span>
                {isFav && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                {/* favorite */}
                <button
                  onClick={() => toggleFavorite(widget.id)}
                  title="Favorite panel"
                  className={`p-1 rounded-lg hover:bg-slate-800/80 transition-colors ${
                    isFav ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                {/* pin */}
                <button
                  onClick={() => togglePin(widget.id)}
                  title="Pin widget to top"
                  className={`p-1 rounded-lg hover:bg-slate-800/80 transition-colors ${
                    isPinned ? "text-sky-400 animate-pulse" : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                {/* change width */}
                <button
                  onClick={() => cycleWidgetWidth(widget.id)}
                  title="Cycle widget column dimensions"
                  className="p-1 rounded-lg hover:bg-slate-800/80 hover:text-white transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                {/* order up */}
                <button
                  disabled={index === 0}
                  onClick={() => moveWidget(index, "up")}
                  title="Move Up"
                  className="p-1 rounded-lg hover:bg-slate-800/80 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  ▲
                </button>
                {/* order down */}
                <button
                  disabled={index === widgetRegistry.length - 1}
                  onClick={() => moveWidget(index, "down")}
                  title="Move Down"
                  className="p-1 rounded-lg hover:bg-slate-800/80 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  ▼
                </button>
                {/* hide */}
                <button
                  onClick={() => {
                    setVisibleWidgets((prev) => ({ ...prev, [widget.id]: false }));
                    triggerToast(`Widget "${widget.title}" minimized. Access customization bar to restore.`);
                  }}
                  title="Minimize Panel"
                  className="p-1 rounded-lg hover:bg-slate-800/80 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* WIDGET CONTENT RENDERING */}

            {/* 1. Welcome Card Content */}
            {widget.id === "welcomeCard" && (() => {
              const greeting = getTimeBasedGreeting();
              const now = new Date();
              const dateStr = now.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 text-[9px] font-mono rounded font-semibold">
                        MANAGING PARTNER ACCESS
                      </span>
                      <span className="px-2.5 py-0.5 bg-sky-950/40 text-sky-400 border border-sky-500/25 text-[9px] font-mono rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {greeting.timeLabel} • {timeStr}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {dateStr}
                      </span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                      <span>{greeting.text}, {userProfile.name}</span>
                      <span className="text-2xl" role="img" aria-label="greeting icon">{greeting.icon}</span>
                    </h1>
                    <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
                      Welcome to your luxury corporate command desk. FinSight neural kernels have completed their daily pre-market auditing sweeps. Your consolidated portfolio valuation expanded by <span className="text-emerald-400 font-bold">+4.2%</span> over the past 72-hour settlement cycle.
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1 font-mono text-[10px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>AI ORACLE V2: ONLINE</span>
                    </div>
                    <span>SESSION TOKEN: FINSIGHT_8054</span>
                    <span>TIME: {timeStr} ({dateStr})</span>
                  </div>
                </div>
              );
            })()}

            {/* 2. Quick Actions Content */}
            {widget.id === "quickActions" && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  {
                    name: "Re-run AI Audit",
                    icon: RefreshCw,
                    action: () => {
                      onRefreshInsights();
                      triggerToast("Regenerating portfolio metrics via Gemini engine");
                    },
                    color: "text-sky-400"
                  },
                  {
                    name: "Settle Due Bills",
                    icon: CreditCard,
                    action: () => {
                      setUpcomingBills((prev) => prev.map((b) => ({ ...b, settled: true })));
                      triggerToast("Automated clearing settlement processed.");
                    },
                    color: "text-emerald-400"
                  },
                  {
                    name: "Export CSV Ledger",
                    icon: FileSpreadsheet,
                    action: () => handleExport("CSV"),
                    color: "text-amber-400"
                  },
                  {
                    name: "Rebalance Assets",
                    icon: Sliders,
                    action: () => {
                      triggerToast("Recalibrating high-yield compound targets. Dynamic weight changes completed.");
                    },
                    color: "text-indigo-400"
                  },
                  {
                    name: "Generate Briefing",
                    icon: FileText,
                    action: () => {
                      triggerToast(`Briefing generated for: "${customReportTitle}"`);
                    },
                    color: "text-pink-400"
                  },
                  {
                    name: "Reset All Panels",
                    icon: Grid,
                    action: () => {
                      setVisibleWidgets({
                        welcomeCard: true,
                        quickActions: true,
                        financialSummary: true,
                        chartsSection: true,
                        recentActivity: true,
                        reportsBuilder: true
                      });
                      triggerToast("All minimized dashboard panels restored.");
                    },
                    color: "text-teal-400"
                  }
                ].map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={i}
                      onClick={act.action}
                      className="p-4 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 group transition-all cursor-pointer"
                    >
                      <div className={`p-2 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform ${act.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 font-mono tracking-tight leading-tight group-hover:text-white">
                        {act.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Financial Summary Content */}
            {widget.id === "financialSummary" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* INCOME CARD */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs">Simulated Monthly Income</p>
                      <h2 className="text-2xl font-mono font-bold text-white mt-1.5">
                        {activeCurrencySymbol}{convertedIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </h2>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[10px] text-slate-500 font-mono">Standard Salary Flow</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center">
                      +8.4% predicted <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* EXPENSES CARD */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs">Monthly Expense Outflows</p>
                      <h2 className="text-2xl font-mono font-bold text-rose-400 mt-1.5">
                        {activeCurrencySymbol}{convertedExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </h2>
                    </div>
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[10px] text-slate-500 font-mono">Cleared & Pending Invoices</span>
                    <span className="text-xs text-rose-400 font-mono font-semibold flex items-center">
                      -2.1% lower burn <ArrowDownRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* SAVINGS CARD */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs">Simulated Reserve Savings</p>
                      <h2 className="text-2xl font-mono font-bold text-sky-400 mt-1.5">
                        {activeCurrencySymbol}{convertedSavings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </h2>
                    </div>
                    <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Award className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[10px] text-slate-500 font-mono">Accumulated Capital Pool</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center">
                      65.2% rate <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>

                {/* NET WORTH CARD */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-xs font-bold">Executive Net Worth</p>
                      <h2 className="text-2xl font-mono font-black text-white mt-1.5">
                        {activeCurrencySymbol}{formattedNetWorth}
                      </h2>
                    </div>
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                      <Shield className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                    <span className="text-[10px] text-slate-500 font-mono">Aggregated Asset Valuation</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center">
                      +11.8% YoY <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Executive Analytical Charts */}
            {widget.id === "chartsSection" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CASH FLOW VELOCITY & HEALTH CIRCULAR GAUGE */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Financial Health Score</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">92nd percentile</span>
                  </div>

                  <div className="flex justify-center py-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* SVG Gauge circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="58" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="10" fill="transparent" />
                        <circle
                          cx="72"
                          cy="72"
                          r="58"
                          stroke="url(#grad-theme)"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 58}
                          strokeDashoffset={2 * Math.PI * 58 * (1 - (insights?.dashboard?.score || 84) / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                        <defs>
                          <linearGradient id="grad-theme" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-4xl font-mono font-black text-white">{insights?.dashboard?.score || 84}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">/ 100</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Continuous evaluation indicates a highly optimal savings velocity. Low debt-to-income limits place you in our top executive premium bracket.
                  </p>
                </div>

                {/* MONTHLY CASH FLOW COMPACT VISUAL BAR */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Cash Flow Velocity</span>
                    <span className="text-[9px] text-slate-500 font-mono">Jan - Jul Trajectory</span>
                  </div>

                  {/* SVG Compact Bar Graph */}
                  <div className="h-32 flex items-end justify-between gap-2 pt-6">
                    {[
                      { month: "Jan", in: 12500, out: 4500 },
                      { month: "Feb", in: 12500, out: 4300 },
                      { month: "Mar", in: 13200, out: 4800 },
                      { month: "Apr", in: 12500, out: 5200 },
                      { month: "May", in: 14000, out: 4900 },
                      { month: "Jun", in: 12500, out: 5800 },
                      { month: "Jul", in: 12500, out: 3125 }
                    ].map((f, i) => {
                      const maxVal = 15000;
                      const inPct = (f.in / maxVal) * 100;
                      const outPct = (f.out / maxVal) * 100;

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          <div className="w-full flex justify-center gap-0.5 items-end h-full">
                            {/* Inflow bar */}
                            <div
                              style={{ height: `${inPct}%` }}
                              className="w-2.5 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-sm transition-colors relative"
                            >
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950 text-white text-[8px] font-mono p-1 rounded z-30 whitespace-nowrap">
                                +${f.in.toLocaleString()}
                              </span>
                            </div>
                            {/* Outflow bar */}
                            <div
                              style={{ height: `${outPct}%` }}
                              className="w-2.5 bg-rose-500/80 hover:bg-rose-400 rounded-t-sm transition-colors relative"
                            >
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950 text-white text-[8px] font-mono p-1 rounded z-30 whitespace-nowrap">
                                -${f.out.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-2 font-mono">{f.month}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Inflows
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span> Outflows
                    </span>
                  </div>
                </div>

                {/* PORTFOLIO ASSET ALLOCATION */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Asset Allocations</span>
                    <span className="text-xs text-sky-400 font-mono font-bold">6 Positions</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {[
                      { name: "Crypto Assets (BTC & ETH)", val: 142645, pct: 81, color: "bg-amber-500" },
                      { name: "Equities (AAPL, MSFT, GOOGL)", val: 28193, pct: 16, color: "bg-sky-500" },
                      { name: "Fixed Income (US Treasury Note)", val: 11532, pct: 3, color: "bg-indigo-500" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300 font-medium truncate max-w-[180px]">{item.name}</span>
                          <span className="text-slate-400 font-mono font-bold">
                            {activeCurrencySymbol}
                            {(item.val * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({item.pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onTabChange("portfolio")}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-[10px] font-mono border border-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Audit Securities Portfolio <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 5. Real-time Auditing & Bills */}
            {widget.id === "recentActivity" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: UPCOMING CORPORATE INVOICES & RECURRING BILLS */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 lg:col-span-1">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      Upcoming Bills
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Capital Settle</span>
                  </div>

                  <div className="space-y-3">
                    {upcomingBills.map((bill) => (
                      <div key={bill.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-850/80 flex items-center justify-between text-xs transition-all hover:bg-slate-900">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{bill.name}</span>
                          </div>
                          <p className="text-[9px] font-mono text-slate-500">Due {bill.date} • {bill.category}</p>
                        </div>

                        <div>
                          {bill.settled ? (
                            <span className="px-2.5 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold rounded-lg flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Cleared
                            </span>
                          ) : (
                            <button
                              onClick={() => settleBill(bill.id, bill.amount, bill.name)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[9px] font-mono font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Settle Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MIDDLE: REAL-TIME LEDGER SEARCH & FILTERING */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        Real-time Ledger Filter
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 text-slate-400 font-mono text-[9px] rounded-full border border-slate-800">
                        {filteredTransactions.length} of {expenses.length} logs
                      </span>
                    </div>

                    {/* Status Filter controls */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        {(["All", "Cleared", "Pending", "Flagged"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setTransactionFilter(status)}
                            className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded cursor-pointer transition-all ${
                              transactionFilter === status ? "bg-slate-950 text-sky-400 shadow-sm" : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      {(transactionQuery || transactionFilter !== "All" || transactionCategoryFilter !== "All Categories") && (
                        <button
                          onClick={() => {
                            setTransactionQuery("");
                            setTransactionFilter("All");
                            setTransactionCategoryFilter("All Categories");
                          }}
                          className="px-2 py-1 text-[9px] font-mono text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-500/20 rounded-lg cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search, Category & Sort Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    {/* Search Bar */}
                    <div className="sm:col-span-6 p-2 bg-slate-900 border border-slate-850 rounded-xl flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search recent capital transactions, vendors, notes..."
                        value={transactionQuery}
                        onChange={(e) => setTransactionQuery(e.target.value)}
                        className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600 font-mono"
                      />
                      {transactionQuery && (
                        <button onClick={() => setTransactionQuery("")} className="text-slate-500 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={transactionCategoryFilter}
                        onChange={(e) => setTransactionCategoryFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 text-slate-300 text-[10px] font-mono rounded-xl p-2 focus:outline-none cursor-pointer"
                      >
                        <option value="All Categories">All Categories</option>
                        {uniqueLedgerCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="sm:col-span-3">
                      <select
                        value={transactionSortOrder}
                        onChange={(e) => setTransactionSortOrder(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-850 text-slate-300 text-[10px] font-mono rounded-xl p-2 focus:outline-none cursor-pointer"
                      >
                        <option value="newest">Newest Date</option>
                        <option value="highest">Highest Value</option>
                        <option value="lowest">Lowest Value</option>
                      </select>
                    </div>
                  </div>

                  {/* Filtered Total Bar */}
                  <div className="flex justify-between items-center px-3 py-1.5 bg-slate-900/60 border border-slate-850 rounded-lg text-[10px] font-mono">
                    <span className="text-slate-400">Audited Ledger Volume:</span>
                    <span className="text-emerald-400 font-bold">
                      {activeCurrencySymbol}
                      {(filteredTransactionsTotal * activeCurrencyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Transaction display ledger */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`p-3 bg-slate-900/40 rounded-xl border ${
                          tx.status === "Flagged"
                            ? "border-rose-500/20 bg-rose-950/5 hover:border-rose-500/40"
                            : "border-slate-850 hover:border-slate-800"
                        } flex justify-between items-center text-xs transition-colors`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{tx.merchant}</span>
                            <button
                              title="Click to toggle transaction status"
                              onClick={() => {
                                const nextStatus = tx.status === "Cleared" ? "Pending" : tx.status === "Pending" ? "Flagged" : "Cleared";
                                setLocalExpenses((prev) => prev.map((item) => item.id === tx.id ? { ...item, status: nextStatus } : item));
                                triggerToast(`Transaction "${tx.merchant}" status updated to ${nextStatus}`);
                              }}
                              className={`text-[8px] font-mono px-1 rounded uppercase font-bold cursor-pointer transition-transform hover:scale-105 ${
                                tx.status === "Cleared"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                                  : tx.status === "Pending"
                                  ? "bg-sky-950 text-sky-400 border border-sky-500/20"
                                  : "bg-rose-950 text-rose-400 border border-rose-500/20 animate-pulse"
                              }`}
                            >
                              {tx.status}
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {tx.date} • {tx.category} {tx.notes ? `• ${tx.notes}` : ""}
                          </p>
                        </div>
                        <span className="font-mono font-black text-slate-200">
                          {activeCurrencySymbol}
                          {(tx.amount * activeCurrencyRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-500 font-mono">
                        No transactions found matching active filter parameters.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 6. Corporate Report Generation & Exports */}
            {widget.id === "reportsBuilder" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* REPORT TYPE SELECTOR (Tabs) */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3 lg:col-span-1 text-left">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Executive Template Profiles</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "monthly", label: "Monthly Performance", desc: "Detailed 30-day capital ledger audit" },
                      { id: "quarterly", label: "Quarterly Board Presentation", desc: "Tax brackets and multi-asset compliance" },
                      { id: "yearly", label: "Annual Fiscal Retrospective", desc: "S&P benchmark comparisons" },
                      { id: "expense", label: "Detailed Expense Audit", desc: "Burn rates & vendor outliers" },
                      { id: "investment", label: "Securities Investment Analysis", desc: "Portfolio compound simulations" },
                      { id: "goal", label: "Milestone Goals Summary", desc: "Retirement downpayment logs" },
                      { id: "tax", label: "Pre-audit Tax Estimator", desc: "Effective threshold projections" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveReportTab(tab.id as any);
                          triggerToast(`Report template profile switched to ${tab.label}`);
                        }}
                        className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                          activeReportTab === tab.id
                            ? "bg-slate-900 border-slate-700 text-white shadow-sm"
                            : "bg-slate-950/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                        }`}
                      >
                        <span className="text-xs font-bold block">{tab.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{tab.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUSTOM REPORT BUILDER FORM & EXPORT MATRIX */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-5 lg:col-span-2 flex flex-col justify-between">
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-sky-400" />
                        Custom Report Parameter Matrix
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                        {activeReportTab.toUpperCase()} PROFILE ACTIVE
                      </span>
                    </div>

                    {/* LIVE EXECUTIVE REPORT PROFILE PREVIEW BOX */}
                    <div className="p-3 bg-slate-900/80 border border-sky-500/20 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-sky-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Profile Briefing KPI Snapshot:
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">Live Computed Metrics</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        {activeReportTab === "monthly" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Monthly Spent</span>
                              <span className="font-mono font-bold text-slate-200">{activeCurrencySymbol}{(totalExpensesValue * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Net Surplus</span>
                              <span className="font-mono font-bold text-emerald-400">{activeCurrencySymbol}{((12500 - totalExpensesValue) * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Cleared Invoices</span>
                              <span className="font-mono font-bold text-sky-400">{expenses.filter(e => e.status === "Cleared").length} Items</span>
                            </div>
                          </>
                        )}
                        {activeReportTab === "quarterly" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Q3 Burn Rate</span>
                              <span className="font-mono font-bold text-slate-200">{activeCurrencySymbol}{(totalExpensesValue * 3 * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Tax Allocation</span>
                              <span className="font-mono font-bold text-amber-400">{activeCurrencySymbol}{(28500 * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Quarter Variance</span>
                              <span className="font-mono font-bold text-emerald-400">-4.2% Below Cap</span>
                            </div>
                          </>
                        )}
                        {activeReportTab === "yearly" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Annual Net Worth</span>
                              <span className="font-mono font-bold text-slate-200">{activeCurrencySymbol}{(176258 * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">YoY Growth</span>
                              <span className="font-mono font-bold text-emerald-400">+18.4% YoY</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">S&P Delta</span>
                              <span className="font-mono font-bold text-sky-400">+5.2% Outperform</span>
                            </div>
                          </>
                        )}
                        {activeReportTab === "expense" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Audited Logged</span>
                              <span className="font-mono font-bold text-slate-200">{expenses.length} Records</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Top Vendor Outflow</span>
                              <span className="font-mono font-bold text-slate-200">Mortgage AutoPay</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Flagged Anomalies</span>
                              <span className="font-mono font-bold text-rose-400">{expenses.filter(e => e.status === "Flagged").length} Items</span>
                            </div>
                          </>
                        )}
                        {activeReportTab === "investment" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Portfolio Valuation</span>
                              <span className="font-mono font-bold text-slate-200">{activeCurrencySymbol}{(totalHoldingsValue * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Top Asset Class</span>
                              <span className="font-mono font-bold text-sky-400">Crypto (71%)</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Total Return</span>
                              <span className="font-mono font-bold text-emerald-400">+48.2% Unrealized</span>
                            </div>
                          </>
                        )}
                        {activeReportTab === "goal" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Active Goals</span>
                              <span className="font-mono font-bold text-slate-200">{goals.length} Milestones</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Saved Accumulated</span>
                              <span className="font-mono font-bold text-emerald-400">{activeCurrencySymbol}{(goals.reduce((sum, g) => sum + g.currentAmount, 0) * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Avg Target Completion</span>
                              <span className="font-mono font-bold text-sky-400">
                                {Math.round(goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount) * 100, 0) / (goals.length || 1))}%
                              </span>
                            </div>
                          </>
                        )}
                        {activeReportTab === "tax" && (
                          <>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Gross Taxable Base</span>
                              <span className="font-mono font-bold text-slate-200">{activeCurrencySymbol}{(150000 * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Qualified Deductions</span>
                              <span className="font-mono font-bold text-emerald-400">{activeCurrencySymbol}{(14200 * activeCurrencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 block">Effective Tax Rate</span>
                              <span className="font-mono font-bold text-amber-400">19.0% Est.</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 font-mono uppercase">Executive Document Title</label>
                        <input
                          type="text"
                          value={customReportTitle}
                          onChange={(e) => setCustomReportTitle(e.target.value)}
                          placeholder="Report Title..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Compilation Parameter Matrix Directives</span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reportIncludeLedger}
                              onChange={(e) => setReportIncludeLedger(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">Ledger Log</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reportIncludeNetWorth}
                              onChange={(e) => setReportIncludeNetWorth(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">Net Wealth</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reportIncludePredictions}
                              onChange={(e) => setReportIncludePredictions(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">AI Forecast</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reportIncludeTax}
                              onChange={(e) => setReportIncludeTax(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">Tax Matrix</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reportIncludeHoldings}
                              onChange={(e) => setReportIncludeHoldings(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">Holdings</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reportIncludeGoals}
                              onChange={(e) => setReportIncludeGoals(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">Milestones</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer select-none sm:col-span-2">
                            <input
                              type="checkbox"
                              checked={reportIncludeSignatures}
                              onChange={(e) => setReportIncludeSignatures(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] font-mono text-slate-300">Executive Partner Sign-off Line</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXPORT OPTIONS BAR */}
                  <div className="pt-4 border-t border-slate-900 space-y-3 text-left">
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">Select Export Protocol</span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { label: "PDF", icon: FileText, action: () => handleExport("PDF") },
                        { label: "Excel", icon: FileSpreadsheet, action: () => handleExport("Excel") },
                        { label: "CSV", icon: Download, action: () => handleExport("CSV") },
                        { label: "Print", icon: Printer, action: () => handleExport("Print") },
                        { label: "Share", icon: Share2, action: () => handleExport("Share") }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={item.action}
                            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono border border-slate-800 transition-all cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5 text-sky-400" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        );
      })}

      {/* DASHBOARD CUSTOMIZER CONTROL BAR */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Sliders className={`w-5 h-5 ${theme.primary}`} />
            <h3 className="text-white font-bold text-sm">Dashboard Personalized Visibility Matrix</h3>
          </div>
          <button
            onClick={handleResetVisibilityMatrix}
            className="self-start sm:self-auto px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 text-[10px] font-mono border border-slate-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>Reset Matrix Defaults</span>
          </button>
        </div>
        <p className="text-slate-400 text-xs">
          Executive users can customize their home view dashboard workspace dynamically. Use checkboxes below to configure which bento widgets are rendered above. All selections persist automatically.
        </p>

        {/* Check if all widgets are turned off */}
        {Object.values(visibleWidgets).every((v) => !v) && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex justify-between items-center text-xs text-amber-200">
            <span>All dashboard widgets are currently hidden from view.</span>
            <button
              onClick={() => {
                setVisibleWidgets(defaultVisibleWidgets);
                triggerToast("All widgets restored to active view!");
              }}
              className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold font-mono text-[10px] rounded-lg cursor-pointer hover:bg-amber-400"
            >
              Restore All
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {Object.entries(visibleWidgets).map(([key, isVisible]) => {
            const labelMap: Record<string, string> = {
              welcomeCard: "Welcome Greeting",
              quickActions: "Quick Actions Grid",
              financialSummary: "Bento Summary Cards",
              chartsSection: "Analytical Gauges & Charts",
              recentActivity: "Ledger Search & Bills",
              reportsBuilder: "Report Builders & Exports"
            };

            return (
              <label
                key={key}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between text-left ${
                  isVisible
                    ? "bg-slate-950 border-slate-850 text-white shadow-sm"
                    : "bg-slate-950/30 border-transparent text-slate-600 hover:text-slate-400"
                }`}
              >
                <span className="text-[10px] font-mono tracking-tight font-bold pr-2">
                  {labelMap[key] || key}
                </span>
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => {
                    setVisibleWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
                    triggerToast(`Widget "${labelMap[key] || key}" visibility updated`);
                  }}
                  className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                />
              </label>
            );
          })}
        </div>
      </div>

    </div>
  );
};
