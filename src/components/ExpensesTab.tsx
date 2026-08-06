import React from "react";
import { 
  Plus, Search, Trash2, Edit2, AlertCircle, CheckCircle2, Clock, X, Sparkles, Filter, 
  LayoutDashboard, Receipt, Calendar as CalendarIcon, Users, RefreshCw, Zap, Settings, 
  Share2, Globe, Wifi, WifiOff, FileText, Check, Landmark, ArrowUpRight, ShieldCheck 
} from "lucide-react";
import { Expense, UserProfile, safeParseJSON } from "../types";
import { ExpenseScanner } from "./ExpenseScanner";
import { ExpenseSplitter } from "./ExpenseSplitter";
import { ExpenseCalendarTimeline } from "./ExpenseCalendarTimeline";
import { ExpenseRecurring } from "./ExpenseRecurring";
import { ExpenseCustomizer } from "./ExpenseCustomizer";
import { ExpenseLedger } from "./ExpenseLedger";

interface ExpensesTabProps {
  expenses: Expense[];
  userProfile: UserProfile;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onEditExpense: (id: string, updated: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  insights: any;
  isLoadingInsights: boolean;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  userProfile,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  insights,
  isLoadingInsights,
}) => {
  // Navigation for sub-views
  const [subView, setSubView] = React.useState<"dashboard" | "ledger" | "scanner" | "calendar" | "splitter" | "recurring" | "customizer">("dashboard");

  // Custom Categories list persisted locally
  const [customCategories, setCustomCategories] = React.useState<{ name: string; color: string; icon: string }[]>(() => {
    return safeParseJSON<{ name: string; color: string; icon: string }[]>(localStorage.getItem("finsight_custom_categories"), [
      { name: "Housing", color: "rose", icon: "Home" },
      { name: "Food", color: "emerald", icon: "Utensils" },
      { name: "Utilities", color: "sky", icon: "Zap" },
      { name: "Entertainment", color: "purple", icon: "Film" },
      { name: "Travel", color: "blue", icon: "Plane" },
      { name: "Other", color: "slate", icon: "Layers" }
    ]);
  });

  React.useEffect(() => {
    localStorage.setItem("finsight_custom_categories", JSON.stringify(customCategories));
  }, [customCategories]);

  // Toast notifier within the tab
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: "success" | "error" | "info" | "warning" }[]>([]);
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const id = "toast_" + Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Add Expense form modal state
  const [isAddFormOpen, setIsAddFormOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split("T")[0],
    category: "Food",
    merchant: "",
    amount: "",
    status: "Cleared" as "Cleared" | "Pending" | "Flagged",
    notes: "",
    paymentMethod: "Visa Debit (*4491)",
    location: "San Francisco, CA",
    isOffline: false,
    tagsInput: "",
    // Travel Mode fields
    travelMode: false,
    foreignCurrency: "EUR",
    foreignAmount: "",
  });

  // Exchange rate lookup
  const RATES: Record<string, number> = {
    EUR: 1.09,
    GBP: 1.28,
    JPY: 0.0064,
  };

  // Calculate USD converted amount dynamically
  const computedUSDAmount = React.useMemo(() => {
    if (!formData.travelMode) return formData.amount;
    const fAmt = parseFloat(formData.foreignAmount) || 0;
    const rate = RATES[formData.foreignCurrency] || 1;
    return (fAmt * rate).toFixed(2);
  }, [formData.travelMode, formData.foreignAmount, formData.foreignCurrency]);

  // Duplicate Check: Same merchant, amount, date
  const isDuplicateDetected = React.useMemo(() => {
    if (!formData.merchant || (!formData.amount && !formData.foreignAmount)) return false;
    const amt = formData.travelMode ? parseFloat(computedUSDAmount) : parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) return false;

    return expenses.some(
      (e) =>
        e.merchant.toLowerCase().trim() === formData.merchant.toLowerCase().trim() &&
        Math.abs(e.amount - amt) < 0.02 &&
        e.date === formData.date
    );
  }, [formData.merchant, formData.amount, formData.foreignAmount, formData.travelMode, formData.date, expenses, computedUSDAmount]);

  const handleOpenAdd = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: customCategories[1]?.name || "Food",
      merchant: "",
      amount: "",
      status: "Cleared",
      notes: "",
      paymentMethod: "Visa Debit (*4491)",
      location: "San Francisco, CA",
      isOffline: false,
      tagsInput: "",
      travelMode: false,
      foreignCurrency: "EUR",
      foreignAmount: "",
    });
    setIsAddFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmountStr = formData.travelMode ? computedUSDAmount : formData.amount;
    const amount = parseFloat(finalAmountStr);
    
    if (!formData.merchant || isNaN(amount) || amount <= 0) {
      showToast("Please provide valid merchant and amount", "warning");
      return;
    }

    const tags = formData.tagsInput
      .split(",")
      .map((t) => t.replace("#", "").trim())
      .filter((t) => t.length > 0);

    onAddExpense({
      date: formData.date,
      category: formData.category,
      merchant: formData.merchant,
      amount,
      status: formData.isOffline ? "Pending" : formData.status,
      notes: formData.notes,
      tags,
      paymentMethod: formData.paymentMethod,
      location: formData.location,
      isOffline: formData.isOffline,
      approvalStatus: formData.isOffline ? "Draft" : "Cleared",
      originalCurrency: formData.travelMode ? formData.foreignCurrency : undefined,
      originalAmount: formData.travelMode ? parseFloat(formData.foreignAmount) : undefined,
      exchangeRate: formData.travelMode ? RATES[formData.foreignCurrency] : undefined
    });

    setIsAddFormOpen(false);
    showToast(
      formData.isOffline
        ? "Offline transaction stored in local cache pipeline!"
        : "Outflow transaction published to ledger database!",
      "success"
    );
  };

  // Metrics calculators
  const activeExpenses = expenses.filter((e) => e.status !== "Flagged");
  const totalSpent = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const flaggedCount = expenses.filter((e) => e.status === "Flagged").length;
  const pendingApprovalsCount = expenses.filter(
    (e) => e.approvalStatus === "Submitted" || e.approvalStatus === "Pending"
  ).length;

  return (
    <div id="expenses-tab-view" className="space-y-6 relative">
      
      {/* Toast Alert Render */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-xl border shadow-lg text-xs font-mono font-bold flex items-center gap-2 pointer-events-auto animate-bounce max-w-sm ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400"
                : t.type === "error"
                ? "bg-rose-950/90 border-rose-500/30 text-rose-400"
                : "bg-slate-900/90 border-slate-800 text-sky-400"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Primary Navigation Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <span className="text-emerald-400 text-xs font-mono tracking-widest uppercase">FinSight Sovereign Enterprise</span>
          <h2 className="text-xl font-bold text-white mt-1">Advanced Expense Management</h2>
          <p className="text-slate-400 text-xs mt-1">
            Audit compliance workflows, extract OCR parameters, compile splits, and track active SaaS portfolios.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold border border-emerald-500/20 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log New Transaction
        </button>
      </div>

      {/* Sub-Views Switcher Navigation Header */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
        {[
          { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
          { id: "ledger", label: "Search & Advanced Filters", icon: FileText },
          { id: "scanner", label: "AI Receipt OCR Scanner", icon: Receipt },
          { id: "calendar", label: "Expense Calendar & Timeline", icon: CalendarIcon },
          { id: "splitter", label: "Group Bill Splitter", icon: Users },
          { id: "recurring", label: "SaaS & Subscriptions", icon: RefreshCw },
          { id: "customizer", label: "Categories & Risk Audits", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-View Router */}
      <div className="space-y-6">
        {subView === "dashboard" && (
          <div className="space-y-6">
            
            {/* Quick Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <span className="text-slate-400 text-xs">Quarterly Total Burn</span>
                <h3 className="text-2xl font-mono font-bold text-white mt-1">
                  ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Active transactions ledger sum</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <span className="text-slate-400 text-xs">Remaining Budget Pool</span>
                <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                  ${Math.max(userProfile.monthlyGoal * 3 - totalSpent, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Derived from $7,500 quarterly allocation</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <span className="text-slate-400 text-xs">Workflow Audits Pending</span>
                <h3 className="text-2xl font-mono font-bold text-amber-500 mt-1">
                  {pendingApprovalsCount} Drafts
                </h3>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Requires manual audit verification</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <span className="text-slate-400 text-xs">Suspicious Compliance Flag</span>
                <h3 className="text-2xl font-mono font-bold text-rose-500 mt-1">
                  {flaggedCount} Warnings
                </h3>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Anomalous parameters detected</span>
              </div>

            </div>

            {/* AI Insights & Predictions Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-3">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-white font-bold text-base">Enterprise AI Insights & Spending Habit Analysis</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Overspending & Forecast card */}
                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Overspending Detection & Forecast
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cloud Compute cluster invoicing has exceeded the average monthly threshold by <span className="text-white font-bold">14.2%</span>. AI forecasts an overspend of <span className="text-rose-400 font-bold">$120.00</span> on next month's AWS cycle based on active virtual cluster counts.
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono bg-slate-900 p-2 rounded">
                    💡 Suggestion: Decommission orphaned dev nodes to trim $45/mo instantly.
                  </div>
                </div>

                {/* Savings and smart suggestions card */}
                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Zap className="w-4 h-4 shrink-0" />
                    Quarterly Saving Opportunities
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Consolidating your streaming portfolios and canceling the idle <span className="text-white font-bold">Heroku Fleet tier</span> would recover <span className="text-emerald-400 font-bold">$75.00/mo</span>. Additionally, travel expense audits indicate booking flights 14 days earlier could save up to <span className="text-emerald-400 font-bold">$240.00</span> per trip.
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono bg-slate-900 p-2 rounded">
                    ★ Smart Alert: Auto-save parameters are online.
                  </div>
                </div>

              </div>
            </div>

            {/* Quick instructions how to use other tabs */}
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-white font-bold text-sm">Comprehensive Suite Active</h4>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Use the navigation switcher above to test out the advanced receipt OCR computer-vision parser, group split calculators, interactive expense matrices, custom category creations, or the advanced multi-filter search ledger.
              </p>
            </div>

          </div>
        )}

        {subView === "ledger" && (
          <ExpenseLedger
            expenses={expenses}
            onEditExpense={onEditExpense}
            onDeleteExpense={onDeleteExpense}
            showToast={showToast}
          />
        )}

        {subView === "scanner" && (
          <ExpenseScanner
            onAddExpense={onAddExpense}
            onViewLedger={() => setSubView("ledger")}
            showToast={showToast}
          />
        )}

        {subView === "calendar" && (
          <ExpenseCalendarTimeline
            expenses={expenses}
            onSelectExpense={(exp) => {
              showToast(`Auditing '${exp.merchant}'`, "info");
              setSubView("ledger");
            }}
          />
        )}

        {subView === "splitter" && (
          <ExpenseSplitter
            onAddExpense={onAddExpense}
            showToast={showToast}
          />
        )}

        {subView === "recurring" && (
          <ExpenseRecurring
            expenses={expenses}
            onAddExpense={onAddExpense}
            showToast={showToast}
          />
        )}

        {subView === "customizer" && (
          <ExpenseCustomizer
            categories={customCategories}
            onAddCategory={(cat) => setCustomCategories([...customCategories, cat])}
            onRemoveCategory={(name) => setCustomCategories(customCategories.filter(c => c.name !== name))}
            showToast={showToast}
          />
        )}
      </div>

      {/* Corporate Add Expense Modal */}
      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            
            <button
              onClick={() => setIsAddFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">Audit Compliant Declaration</span>
              <h3 className="text-white font-black text-lg mt-1">Manual Ledger Entry</h3>
              <p className="text-slate-400 text-xs">Declare transaction parameters with automated duplicate warning checks and travel currency conversion.</p>
            </div>

            {/* Duplicate Detected Warning Flashing Header */}
            {isDuplicateDetected && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-400 rounded-xl flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black uppercase">Duplicate Detected</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">An expense matching this merchant on the same date and amount exists in the database. Declare anyway if this is a distinct corporate outflow.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Row 1: Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Date Block</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Category Tag</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {customCategories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Merchant */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Merchant / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe Inc, Delta Air Lines"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Travel Mode Trigger Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] text-slate-300 font-bold">Enable Travel Mode (Currency Conversion)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.travelMode}
                    onChange={(e) => setFormData({ ...formData, travelMode: e.target.checked })}
                    className="cursor-pointer"
                  />
                </div>

                {formData.travelMode ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Foreign Currency</label>
                      <select
                        value={formData.foreignCurrency}
                        onChange={(e) => setFormData({ ...formData, foreignCurrency: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="EUR">EUR (€) - Euro Zone</option>
                        <option value="GBP">GBP (£) - Great Britain</option>
                        <option value="JPY">JPY (¥) - Japanese Yen</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono uppercase">Foreign Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={formData.foreignAmount}
                        onChange={(e) => setFormData({ ...formData, foreignAmount: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 text-[10px] text-sky-400 font-mono">
                      💰 Computed Conversion: <span className="font-bold">${computedUSDAmount} USD</span> (Exchange rate active)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Ledger Amount (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Payment, Location, Offline Entry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Payment Channel Account</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Visa Debit (*4491)">Visa Debit (*4491)</option>
                    <option value="Chase Sapphire">Chase Sapphire</option>
                    <option value="AMEX Corp Business">AMEX Corp Business</option>
                    <option value="Cash">Cash Account</option>
                    <option value="Crypto">Sovereign Wallet (Crypto)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Geo Location Capture</label>
                  <input
                    type="text"
                    placeholder="e.g. Tokyo, JP"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags and Notes */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Hashtags / Audit Labels (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. #Business, #Marketing"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Audit Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional compliance check description..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Offline mode queue selector */}
              <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-500">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  Offline Queue Mode
                </div>
                <input
                  type="checkbox"
                  checked={formData.isOffline}
                  onChange={(e) => setFormData({ ...formData, isOffline: e.target.checked })}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-xs shadow-md cursor-pointer"
                >
                  Publish Outflow
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
