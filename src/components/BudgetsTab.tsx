import React from "react";
import {
  Wallet,
  Plus,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Trash2,
  PieChart,
  CheckCircle,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  Sliders,
  ShieldCheck,
  Zap,
  Building2,
  Coins,
  LineChart,
  Layers,
  ShoppingBag,
  ArrowRight,
  Edit3,
  Scissors,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { Expense, Holding, Goal, UserProfile, safeParseJSON } from "../types";
import { getCurrencySymbol, getCurrencyRate, formatCurrency } from "../utils/currency";

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  alertThreshold: number; // percentage (e.g. 80 for 80%)
}

interface InvestmentTarget {
  id: string;
  assetClass: string; // Equity, ETF, Crypto, Gold, Fixed Deposit, Bonds
  symbol: string;
  targetAmount: number;
  investedAmount: number;
}

interface BudgetsTabProps {
  expenses: Expense[];
  holdings?: Holding[];
  goals?: Goal[];
  userProfile?: UserProfile;
  onAddExpense?: (exp: Omit<Expense, "id">) => void;
  onTradeSimulation?: (symbol: string, type: "buy" | "sell", sharesNum: number) => void;
  onAddHolding?: (holding: Holding) => void;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  expenses,
  holdings = [],
  goals = [],
  userProfile,
  onAddExpense,
  onTradeSimulation,
  onAddHolding
}) => {
  const currencySymbol = getCurrencySymbol(userProfile?.currency);
  const currencyRate = getCurrencyRate(userProfile?.currency);

  // Master Capital Budget Configuration ($10,000 default or user stored)
  const [masterBudget, setMasterBudget] = React.useState<number>(() => {
    return safeParseJSON<number>(localStorage.getItem("finsight_master_budget"), 10000);
  });

  const [spendingRatio, setSpendingRatio] = React.useState<number>(() => {
    return safeParseJSON<number>(localStorage.getItem("finsight_spending_ratio"), 50);
  });

  const [investingRatio, setInvestingRatio] = React.useState<number>(() => {
    return safeParseJSON<number>(localStorage.getItem("finsight_investing_ratio"), 35);
  });

  const [savingsRatio, setSavingsRatio] = React.useState<number>(() => {
    return safeParseJSON<number>(localStorage.getItem("finsight_savings_ratio"), 15);
  });

  // Active view section tab: "overview" | "spending" | "investing" | "deductions" | "allocator"
  const [activeSection, setActiveSection] = React.useState<"overview" | "spending" | "investing" | "deductions" | "allocator">("overview");

  // State for Edit Monthly Budget Modal
  const [showEditMonthlyModal, setShowEditMonthlyModal] = React.useState(false);
  const [monthlyInputVal, setMonthlyInputVal] = React.useState<string>(masterBudget.toString());
  const [editSpendingRatio, setEditSpendingRatio] = React.useState<number>(spendingRatio);
  const [editInvestingRatio, setEditInvestingRatio] = React.useState<number>(investingRatio);
  const [editSavingsRatio, setEditSavingsRatio] = React.useState<number>(savingsRatio);

  // Deductions tab search & filter state
  const [deductionsFilter, setDeductionsFilter] = React.useState<"all" | "expenses" | "investments" | "goals">("all");
  const [deductionsSearch, setDeductionsSearch] = React.useState("");

  // Category Spending Budgets
  const [budgets, setBudgets] = React.useState<Budget[]>(() => {
    return safeParseJSON<Budget[]>(localStorage.getItem("finsight_budgets"), [
      { id: "b1", category: "Housing", limit: 2000, spent: 1800, alertThreshold: 90 },
      { id: "b2", category: "Food", limit: 600, spent: 294.50, alertThreshold: 80 },
      { id: "b3", category: "Utilities", limit: 500, spent: 470, alertThreshold: 85 },
      { id: "b4", category: "Entertainment", limit: 300, spent: 142.99, alertThreshold: 75 },
      { id: "b5", category: "Travel", limit: 1500, spent: 1250, alertThreshold: 80 }
    ]);
  });

  // Investment Allocation Targets
  const [investmentTargets, setInvestmentTargets] = React.useState<InvestmentTarget[]>(() => {
    return safeParseJSON<InvestmentTarget[]>(localStorage.getItem("finsight_investment_targets"), [
      { id: "it1", assetClass: "Equity", symbol: "AAPL", targetAmount: 1500, investedAmount: 1200 },
      { id: "it2", assetClass: "ETF", symbol: "VOO", targetAmount: 1000, investedAmount: 850 },
      { id: "it3", assetClass: "Crypto", symbol: "BTC", targetAmount: 500, investedAmount: 420 },
      { id: "it4", assetClass: "Gold", symbol: "GOLD", targetAmount: 300, investedAmount: 300 },
      { id: "it5", assetClass: "Fixed Deposit", symbol: "FD-7PCT", targetAmount: 200, investedAmount: 200 }
    ]);
  });

  // Keep spent synced with actual expenses array
  React.useEffect(() => {
    setBudgets((prev) => {
      const updated = prev.map((b) => {
        const spentForCategory = expenses
          .filter((e) => e.category.toLowerCase() === b.category.toLowerCase() && e.status !== "Flagged")
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          ...b,
          spent: parseFloat(spentForCategory.toFixed(2))
        };
      });
      localStorage.setItem("finsight_budgets", JSON.stringify(updated));
      return updated;
    });
  }, [expenses]);

  // Keep invested amount synced with actual holdings
  React.useEffect(() => {
    if (holdings.length > 0) {
      setInvestmentTargets((prev) => {
        const updated = prev.map((it) => {
          const matchHolding = holdings.find((h) => h.symbol.toUpperCase() === it.symbol.toUpperCase());
          if (matchHolding) {
            return {
              ...it,
              investedAmount: matchHolding.value
            };
          }
          return it;
        });
        localStorage.setItem("finsight_investment_targets", JSON.stringify(updated));
        return updated;
      });
    }
  }, [holdings]);

  // Save ratios & master budget to local storage
  const handleSaveRatios = (newMaster: number, sRatio: number, iRatio: number, savRatio: number) => {
    setMasterBudget(newMaster);
    setSpendingRatio(sRatio);
    setInvestingRatio(iRatio);
    setSavingsRatio(savRatio);
    localStorage.setItem("finsight_master_budget", JSON.stringify(newMaster));
    localStorage.setItem("finsight_spending_ratio", JSON.stringify(sRatio));
    localStorage.setItem("finsight_investing_ratio", JSON.stringify(iRatio));
    localStorage.setItem("finsight_savings_ratio", JSON.stringify(savRatio));
  };

  // Spend Action Modal state
  const [showSpendModal, setShowSpendModal] = React.useState(false);
  const [spendCategory, setSpendCategory] = React.useState("Food");
  const [spendMerchant, setSpendMerchant] = React.useState("");
  const [spendAmount, setSpendAmount] = React.useState("");
  const [spendNotes, setSpendNotes] = React.useState("");

  // Invest Action Modal state
  const [showInvestModal, setShowInvestModal] = React.useState(false);
  const [investSymbol, setInvestSymbol] = React.useState("AAPL");
  const [investName, setInvestName] = React.useState("Apple Inc.");
  const [investType, setInvestType] = React.useState<"Equity" | "Crypto" | "Fixed Income" | "Gold" | "Cash">("Equity");
  const [investAmount, setInvestAmount] = React.useState("");
  const [investShares, setInvestShares] = React.useState("1");

  // Create Category Budget form state
  const [showAddBudgetForm, setShowAddBudgetForm] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("Food");
  const [newLimit, setNewLimit] = React.useState("");
  const [newAlert, setNewAlert] = React.useState("80");

  // Computed Master Metrics & Outflow Deductions
  const totalSpendingPoolCap = (masterBudget * spendingRatio) / 100;
  const totalInvestingPoolCap = (masterBudget * investingRatio) / 100;
  const totalSavingsPoolCap = (masterBudget * savingsRatio) / 100;

  const totalSpentOutflow = expenses
    .filter((e) => e.status !== "Flagged")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalInvestedPortfolio = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalSavedGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // ALL CUT FROM BUDGET TOTAL
  const totalDeductedFromBudget = totalSpentOutflow + totalInvestedPortfolio + totalSavedGoals;
  const netRemainingMasterBudget = masterBudget - totalDeductedFromBudget;
  const totalBudgetUtilizationPct = masterBudget > 0 ? Math.round((totalDeductedFromBudget / masterBudget) * 100) : 0;

  const remainingSpendingBudget = Math.max(totalSpendingPoolCap - totalSpentOutflow, 0);
  const remainingInvestingBudget = Math.max(totalInvestingPoolCap - totalInvestedPortfolio, 0);
  const totalUnallocatedMasterBudget = Math.max(
    masterBudget - totalSpentOutflow - totalInvestedPortfolio,
    0
  );

  const spendingUtilizationPct = totalSpendingPoolCap > 0 ? Math.round((totalSpentOutflow / totalSpendingPoolCap) * 100) : 0;
  const investingUtilizationPct = totalInvestingPoolCap > 0 ? Math.round((totalInvestedPortfolio / totalInvestingPoolCap) * 100) : 0;

  // Unified Deduction Items List (Expenses, Investments, Goals)
  const allDeductionItems = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      type: "Expense" | "Investment" | "Goal";
      date: string;
      category: string;
    }> = [];

    // Add Expenses
    expenses.forEach((e) => {
      if (e.status !== "Flagged") {
        list.push({
          id: e.id,
          title: e.merchant,
          subtitle: e.notes || `${e.category} Outflow`,
          amount: e.amount,
          type: "Expense",
          date: e.date,
          category: e.category
        });
      }
    });

    // Add Portfolio Investments
    holdings.forEach((h) => {
      list.push({
        id: `h_${h.symbol}`,
        title: `${h.name} (${h.symbol})`,
        subtitle: `${h.type} Capital Allocation`,
        amount: h.value,
        type: "Investment",
        date: new Date().toISOString().split("T")[0],
        category: "Portfolio Investment"
      });
    });

    // Add Savings / Goal allocations
    goals.forEach((g) => {
      if (g.currentAmount > 0) {
        list.push({
          id: g.id,
          title: g.name,
          subtitle: `Savings Goal Target: $${g.targetAmount.toLocaleString()}`,
          amount: g.currentAmount,
          type: "Goal",
          date: g.deadline || new Date().toISOString().split("T")[0],
          category: g.category || "Savings Reserve"
        });
      }
    });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, holdings, goals]);

  // Filtered Deductions List
  const filteredDeductions = React.useMemo(() => {
    return allDeductionItems.filter((item) => {
      const matchesFilter =
        deductionsFilter === "all" ||
        (deductionsFilter === "expenses" && item.type === "Expense") ||
        (deductionsFilter === "investments" && item.type === "Investment") ||
        (deductionsFilter === "goals" && item.type === "Goal");

      const matchesSearch =
        !deductionsSearch ||
        item.title.toLowerCase().includes(deductionsSearch.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(deductionsSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(deductionsSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [allDeductionItems, deductionsFilter, deductionsSearch]);

  // Save Monthly Budget Handler
  const handleSaveMonthlyBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(monthlyInputVal);
    if (!newBudget || newBudget < 0) return;

    handleSaveRatios(newBudget, editSpendingRatio, editInvestingRatio, editSavingsRatio);
    setShowEditMonthlyModal(false);
  };

  // Quick Preset Selection in Modal
  const applyBudgetPreset = (val: number) => {
    setMonthlyInputVal(val.toString());
  };

  // Direct Spend submit handler
  const handleExecuteSpend = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(spendAmount);
    if (!amt || amt <= 0 || !spendMerchant) return;

    if (onAddExpense) {
      onAddExpense({
        date: new Date().toISOString().split("T")[0],
        category: spendCategory,
        merchant: spendMerchant,
        amount: amt,
        status: "Cleared",
        notes: spendNotes || `Paid directly from ${spendCategory} budget pool`
      });
    }

    setSpendMerchant("");
    setSpendAmount("");
    setSpendNotes("");
    setShowSpendModal(false);
  };

  // Direct Invest submit handler
  const handleExecuteInvest = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmt = parseFloat(investAmount);
    const sharesNum = parseFloat(investShares) || 1;
    if (!totalAmt || totalAmt <= 0) return;

    const unitPrice = totalAmt / sharesNum;

    if (onAddHolding) {
      onAddHolding({
        symbol: investSymbol.toUpperCase(),
        name: investName || `${investSymbol.toUpperCase()} Asset`,
        shares: sharesNum,
        avgPrice: parseFloat(unitPrice.toFixed(2)),
        currentPrice: parseFloat(unitPrice.toFixed(2)),
        value: parseFloat(totalAmt.toFixed(2)),
        gainLoss: 0,
        gainLossPercent: 0,
        type: investType
      });
    } else if (onTradeSimulation) {
      onTradeSimulation(investSymbol.toUpperCase(), "buy", sharesNum);
    }

    setInvestAmount("");
    setInvestShares("1");
    setShowInvestModal(false);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimit || parseFloat(newLimit) <= 0) return;

    const spentForCategory = expenses
      .filter((e) => e.category.toLowerCase() === newCategory.toLowerCase() && e.status !== "Flagged")
      .reduce((sum, e) => sum + e.amount, 0);

    const budget: Budget = {
      id: "b_" + Date.now(),
      category: newCategory,
      limit: parseFloat(newLimit),
      spent: parseFloat(spentForCategory.toFixed(2)),
      alertThreshold: parseInt(newAlert)
    };

    const updated = [...budgets, budget];
    setBudgets(updated);
    localStorage.setItem("finsight_budgets", JSON.stringify(updated));

    setNewLimit("");
    setShowAddBudgetForm(false);
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    localStorage.setItem("finsight_budgets", JSON.stringify(updated));
  };

  return (
    <div id="budgets-tab-view" className="space-y-6">
      {/* Top Banner & Master Capital Controller */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-bold font-mono rounded-full border border-sky-500/20">
                CAPITAL ALLOCATOR & BUDGET ENGINE
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono rounded-full border border-emerald-500/20">
                100% REAL-TIME DEDUCTION ENGINE
              </span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Monthly Budget: <span className="text-sky-400">{formatCurrency(masterBudget, currencySymbol, currencyRate)}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setMonthlyInputVal(masterBudget.toString());
                  setEditSpendingRatio(spendingRatio);
                  setEditInvestingRatio(investingRatio);
                  setEditSavingsRatio(savingsRatio);
                  setShowEditMonthlyModal(true);
                }}
                className="px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold font-mono rounded-xl cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Set Budget</span>
              </button>
            </div>

            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Set your monthly budget limit. All <strong className="text-rose-400">Expenses ({formatCurrency(totalSpentOutflow, currencySymbol, currencyRate)})</strong>, <strong className="text-emerald-400">Investments ({formatCurrency(totalInvestedPortfolio, currencySymbol, currencyRate)})</strong>, and <strong className="text-sky-400">Savings Goals ({formatCurrency(totalSavedGoals, currencySymbol, currencyRate)})</strong> are cut directly from your total monthly budget pool.
            </p>
          </div>

          {/* Quick Action Spending, Investing & Budget Setter Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setMonthlyInputVal(masterBudget.toString());
                setShowEditMonthlyModal(true);
              }}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-950/40 cursor-pointer transition-all hover:scale-105"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span>Set Monthly Budget</span>
            </button>

            <button
              onClick={() => setShowSpendModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Log Spending</span>
            </button>

            <button
              onClick={() => setShowInvestModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all hover:scale-105"
            >
              <LineChart className="w-4 h-4 text-white" />
              <span>Log Investment</span>
            </button>
          </div>
        </div>

        {/* Combined Budget Deduction Summary Bar & Gauges */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-rose-400" /> Total Budget Deducted:
              </span>
              <span className="text-white font-black text-sm">
                {formatCurrency(totalDeductedFromBudget, currencySymbol, currencyRate)}
              </span>
              <span className="text-slate-500">
                ({totalBudgetUtilizationPct}% of {formatCurrency(masterBudget, currencySymbol, currencyRate)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Net Remaining Budget:</span>
              <span className={`font-bold text-sm ${netRemainingMasterBudget >= 0 ? "text-emerald-400" : "text-rose-400 animate-pulse"}`}>
                {formatCurrency(netRemainingMasterBudget, currencySymbol, currencyRate)}
              </span>
            </div>
          </div>

          {/* Segmented Combined Outflow Visual Bar */}
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 flex">
            {/* Expenses Cut Segment */}
            <div
              className="h-full bg-rose-500 transition-all duration-500 relative group cursor-pointer"
              style={{ width: `${Math.min(masterBudget > 0 ? (totalSpentOutflow / masterBudget) * 100 : 0, 100)}%` }}
              title={`Expenses: ${formatCurrency(totalSpentOutflow, currencySymbol, currencyRate)}`}
            ></div>

            {/* Investments Cut Segment */}
            <div
              className="h-full bg-emerald-500 transition-all duration-500 relative group cursor-pointer"
              style={{ width: `${Math.min(masterBudget > 0 ? (totalInvestedPortfolio / masterBudget) * 100 : 0, 100)}%` }}
              title={`Investments: ${formatCurrency(totalInvestedPortfolio, currencySymbol, currencyRate)}`}
            ></div>

            {/* Savings Goal Segment */}
            <div
              className="h-full bg-sky-500 transition-all duration-500 relative group cursor-pointer"
              style={{ width: `${Math.min(masterBudget > 0 ? (totalSavedGoals / masterBudget) * 100 : 0, 100)}%` }}
              title={`Savings: ${formatCurrency(totalSavedGoals, currencySymbol, currencyRate)}`}
            ></div>
          </div>

          {/* Legend row */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-3 pt-1">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Expenses Cut ({formatCurrency(totalSpentOutflow, currencySymbol, currencyRate)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Investments Cut ({formatCurrency(totalInvestedPortfolio, currencySymbol, currencyRate)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                Savings Goals Cut ({formatCurrency(totalSavedGoals, currencySymbol, currencyRate)})
              </span>
            </div>
            <span className="text-slate-500">
              {allDeductionItems.length} Total Outflows Deducted
            </span>
          </div>

          {/* Master Budget Pool Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Total Spending Allocation */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 font-bold text-rose-400">
                  <ShoppingBag className="w-3.5 h-3.5" /> SPENDING ALLOCATION ({spendingRatio}%)
                </span>
                <span>{formatCurrency(totalSpentOutflow, currencySymbol, currencyRate)} / {formatCurrency(totalSpendingPoolCap, currencySymbol, currencyRate)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-mono font-bold text-white">{formatCurrency(totalSpentOutflow, currencySymbol, currencyRate)}</span>
                <span className={`text-xs font-mono font-semibold ${remainingSpendingBudget > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(remainingSpendingBudget, currencySymbol, currencyRate)} left
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    spendingUtilizationPct > 90 ? "bg-rose-500" : spendingUtilizationPct > 75 ? "bg-amber-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${Math.min(spendingUtilizationPct, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Total Investment Allocation */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <LineChart className="w-3.5 h-3.5" /> INVESTMENT ALLOCATION ({investingRatio}%)
                </span>
                <span>{formatCurrency(totalInvestedPortfolio, currencySymbol, currencyRate)} / {formatCurrency(totalInvestingPoolCap, currencySymbol, currencyRate)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-mono font-bold text-white">{formatCurrency(totalInvestedPortfolio, currencySymbol, currencyRate)}</span>
                <span className={`text-xs font-mono font-semibold ${remainingInvestingBudget > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {formatCurrency(remainingInvestingBudget, currencySymbol, currencyRate)} left
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(investingUtilizationPct, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Total Savings Reserve */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 font-bold text-sky-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> SAVINGS RESERVE ({savingsRatio}%)
                </span>
                <span>{formatCurrency(totalSavedGoals, currencySymbol, currencyRate)} / {formatCurrency(totalSavingsPoolCap, currencySymbol, currencyRate)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-mono font-bold text-white">{formatCurrency(totalSavedGoals, currencySymbol, currencyRate)}</span>
                <span className="text-xs font-mono text-sky-400 font-semibold">
                  {formatCurrency(totalSavingsPoolCap, currencySymbol, currencyRate)} target
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      totalSavingsPoolCap > 0 ? (totalSavedGoals / totalSavingsPoolCap) * 100 : 0,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Free Unallocated Capital */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Coins className="w-3.5 h-3.5" /> FREE CAPITAL POOL
                </span>
                <span>AVAILABLE</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-mono font-bold text-amber-400">
                  {formatCurrency(totalUnallocatedMasterBudget, currencySymbol, currencyRate)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Ready to assign</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                <span>Unassigned Balance:</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(totalUnallocatedMasterBudget, currencySymbol, currencyRate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveSection("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === "overview"
              ? "bg-sky-600 text-white shadow-md shadow-sky-950/50"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Layers className="w-4 h-4" /> Budget Summary
        </button>

        <button
          onClick={() => setActiveSection("deductions")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === "deductions"
              ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Scissors className="w-4 h-4" /> All Cut From Budget ({allDeductionItems.length})
        </button>

        <button
          onClick={() => setActiveSection("spending")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === "spending"
              ? "bg-rose-600 text-white shadow-md shadow-rose-950/50"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Category Spending ({budgets.length})
        </button>

        <button
          onClick={() => setActiveSection("investing")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === "investing"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
          }`}
        >
          <LineChart className="w-4 h-4" /> Investment Targets ({investmentTargets.length})
        </button>

        <button
          onClick={() => setActiveSection("allocator")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === "allocator"
              ? "bg-slate-700 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
          }`}
        >
          <Sliders className="w-4 h-4" /> Master Allocator
        </button>
      </div>

      {/* EDIT MONTHLY BUDGET MODAL */}
      {showEditMonthlyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-sky-500/30 p-6 rounded-2xl max-w-xl w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Set Monthly Budget Amount</h3>
                  <p className="text-slate-400 text-xs">Define your custom monthly budget limit to track all deductions.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditMonthlyModal(false)}
                className="text-slate-500 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMonthlyBudget} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Your Custom Monthly Budget Limit ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sky-400 font-mono font-bold text-lg">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="50"
                    required
                    value={monthlyInputVal}
                    onChange={(e) => setMonthlyInputVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xl font-mono font-black text-white focus:outline-none focus:border-sky-500/60"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Quick Presets</span>
                <div className="flex flex-wrap gap-2">
                  {[2500, 5000, 7500, 10000, 15000, 20000, 30000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyBudgetPreset(preset)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                        parseFloat(monthlyInputVal) === preset
                          ? "bg-sky-500 text-white border-sky-400"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      {formatCurrency(preset, currencySymbol, currencyRate)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratio Split Configuration */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <span className="text-xs font-bold text-white block font-mono">
                  Budget Allocation Ratios (Target Pools)
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-rose-400 font-mono font-bold block">Spending ({editSpendingRatio}%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editSpendingRatio}
                      onChange={(e) => setEditSpendingRatio(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {formatCurrency(((parseFloat(monthlyInputVal) || 0) * editSpendingRatio) / 100, currencySymbol, currencyRate)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-400 font-mono font-bold block">Investing ({editInvestingRatio}%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editInvestingRatio}
                      onChange={(e) => setEditInvestingRatio(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {formatCurrency(((parseFloat(monthlyInputVal) || 0) * editInvestingRatio) / 100, currencySymbol, currencyRate)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-sky-400 font-mono font-bold block">Savings ({editSavingsRatio}%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editSavingsRatio}
                      onChange={(e) => setEditSavingsRatio(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {formatCurrency(((parseFloat(monthlyInputVal) || 0) * editSavingsRatio) / 100, currencySymbol, currencyRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Impact Preview */}
              <div className="p-3.5 bg-sky-950/20 border border-sky-500/20 rounded-xl space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Outflows Currently Logged:</span>
                  <span className="text-white font-bold">{formatCurrency(totalDeductedFromBudget, currencySymbol, currencyRate)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-sky-500/20">
                  <span className="text-slate-300">New Net Available Balance:</span>
                  <span className={`font-bold ${((parseFloat(monthlyInputVal) || 0) - totalDeductedFromBudget) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency((parseFloat(monthlyInputVal) || 0) - totalDeductedFromBudget, currencySymbol, currencyRate)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditMonthlyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Save Monthly Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPEND FROM BUDGET MODAL */}
      {showSpendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Spend From Budget</h3>
                  <p className="text-slate-400 text-xs">Deduct funds directly from your allocated category budget.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSpendModal(false)}
                className="text-slate-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSpend} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Select Category</label>
                <select
                  value={spendCategory}
                  onChange={(e) => setSpendCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Housing">Housing & Utilities</option>
                  <option value="Utilities">Bills & Utilities</option>
                  <option value="Travel">Travel & Transport</option>
                  <option value="Entertainment">Entertainment & Leisure</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Vendor / Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Foods Market, Netflix, Amazon"
                  value={spendMerchant}
                  onChange={(e) => setSpendMerchant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Spending Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 font-mono text-base font-bold text-rose-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Transaction Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly grocery stock up"
                  value={spendNotes}
                  onChange={(e) => setSpendNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              {/* Live Budget Check Indicator */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Category Available Budget:</span>
                  <span className="text-emerald-400 font-bold">
                    ${(
                      (budgets.find((b) => b.category.toLowerCase() === spendCategory.toLowerCase())?.limit || 1000) -
                      (budgets.find((b) => b.category.toLowerCase() === spendCategory.toLowerCase())?.spent || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                {spendAmount && (
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-850">
                    <span className="text-slate-400">Post-Spending Remaining:</span>
                    <span className="text-sky-400 font-bold">
                      $
                      {Math.max(
                        (budgets.find((b) => b.category.toLowerCase() === spendCategory.toLowerCase())?.limit || 1000) -
                          (budgets.find((b) => b.category.toLowerCase() === spendCategory.toLowerCase())?.spent || 0) -
                          (parseFloat(spendAmount) || 0),
                        0
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSpendModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm & Deduct Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVEST FROM BUDGET MODAL */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Invest From Budget</h3>
                  <p className="text-slate-400 text-xs">Deploy capital directly into portfolio holdings from your investment budget.</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvestModal(false)}
                className="text-slate-500 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteInvest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Asset Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AAPL, VOO, BTC"
                    value={investSymbol}
                    onChange={(e) => setInvestSymbol(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Asset Type</label>
                  <select
                    value={investType}
                    onChange={(e) => setInvestType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Equity">Stock / Equity</option>
                    <option value="ETF">Index / ETF</option>
                    <option value="Crypto">Crypto Currency</option>
                    <option value="Gold">Gold / Metals</option>
                    <option value="Fixed Income">Fixed Deposit / Bond</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vanguard S&P 500 ETF"
                  value={investName}
                  onChange={(e) => setInvestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Total Investment ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1000.00"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Shares / Units</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1"
                    value={investShares}
                    onChange={(e) => setInvestShares(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Live Investment Budget Check */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Remaining Investment Budget Pool:</span>
                  <span className="text-emerald-400 font-bold">${remainingInvestingBudget.toLocaleString()}</span>
                </div>
                {investAmount && (
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-850">
                    <span className="text-slate-400">Post-Investment Allocation Left:</span>
                    <span className="text-sky-400 font-bold">
                      ${Math.max(remainingInvestingBudget - (parseFloat(investAmount) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Execute & Add to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 1: OVERVIEW TAB */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending vs Investing Flow Overview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-base flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-sky-400" /> Capital Flow & Budget Utilization
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Comparing real-time outflows and investments against monthly target caps.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Category Budgets Summary Row */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-rose-400" /> Spending Categories Total
                      </span>
                      <span className="text-rose-400 font-bold">${totalSpentOutflow.toLocaleString()} spent</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(spendingUtilizationPct, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>Cap: ${totalSpendingPoolCap.toLocaleString()}</span>
                      <span>{spendingUtilizationPct}% Used</span>
                    </div>
                  </div>

                  {/* Portfolio Investments Summary Row */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <LineChart className="w-4 h-4 text-emerald-400" /> Investments Total
                      </span>
                      <span className="text-emerald-400 font-bold">${totalInvestedPortfolio.toLocaleString()} invested</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(investingUtilizationPct, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>Target: ${totalInvestingPoolCap.toLocaleString()}</span>
                      <span>{investingUtilizationPct}% Deployed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Spending Threshold Cards */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-sky-400" /> Active Category Spending Caps
                  </h3>
                  <button
                    onClick={() => setShowAddBudgetForm(!showAddBudgetForm)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                {showAddBudgetForm && (
                  <form onSubmit={handleCreateBudget} className="p-4 bg-slate-900 border border-sky-500/30 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="Food">Food</option>
                        <option value="Housing">Housing</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Travel">Travel</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono">Monthly Limit ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="500"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono">Alert %</label>
                      <select
                        value={newAlert}
                        onChange={(e) => setNewAlert(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="75">75%</option>
                        <option value="80">80%</option>
                        <option value="90">90%</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer">
                        Add Limit
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {budgets.map((b) => {
                    const utilPercent = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
                    const isBreached = b.spent >= b.limit;

                    return (
                      <div
                        key={b.id}
                        className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 relative hover:border-slate-700 transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-white block">{b.category}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Alert: {b.alertThreshold}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSpendCategory(b.category);
                                setShowSpendModal(true);
                              }}
                              className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded cursor-pointer transition-all"
                            >
                              + Spend
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(b.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300 font-semibold">${b.spent} spent</span>
                            <span className="text-slate-500">limit: ${b.limit}</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isBreached ? "bg-rose-500" : utilPercent >= b.alertThreshold ? "bg-amber-500" : "bg-sky-500"
                              }`}
                              style={{ width: `${Math.min(utilPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Financial Rules & Guidance */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Smart Budget Allocation Formula
                </h3>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-sky-400 font-bold block text-[11px]">50/30/20 Golden Ratio</span>
                    <p className="text-[11px] text-slate-400">
                      Allocate 50% for necessities (Housing, Food), 30% for investments, and 20% for emergency cash reserves.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-bold block text-[11px]">Direct Investment Rule</span>
                    <p className="text-[11px] text-slate-400">
                      When spending stays below limit, automatically route the monthly surplus into index funds or gold.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">DIRECT ACTIONS</span>
                <button
                  onClick={() => setShowSpendModal(true)}
                  className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-rose-400" /> Log Spending From Budget
                </button>
                <button
                  onClick={() => setShowInvestModal(true)}
                  className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LineChart className="w-4 h-4 text-emerald-400" /> Log Investment From Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORY SPENDING */}
      {activeSection === "spending" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Category Spending Thresholds</h3>
              <p className="text-slate-400 text-xs">Manage individual limits and log expenses directly against each category pool.</p>
            </div>
            <button
              onClick={() => setShowSpendModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Spend From Budget
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const utilPercent = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
              const remaining = Math.max(b.limit - b.spent, 0);

              return (
                <div key={b.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-bold text-white block">{b.category}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Alert Threshold: {b.alertThreshold}%</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${remaining > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                      ${remaining} Left
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">${b.spent} Spent</span>
                      <span className="text-slate-500">Cap: ${b.limit}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                      <div
                        className={`h-full rounded-full ${utilPercent > 90 ? "bg-rose-500" : "bg-sky-500"}`}
                        style={{ width: `${Math.min(utilPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSpendCategory(b.category);
                      setShowSpendModal(true);
                    }}
                    className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-400" /> Spend in {b.category}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: INVESTMENT TARGETS */}
      {activeSection === "investing" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Investment Allocation Targets</h3>
              <p className="text-slate-400 text-xs">Deploy capital directly into equities, ETFs, crypto, gold, or fixed deposits.</p>
            </div>
            <button
              onClick={() => setShowInvestModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Invest From Budget
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentTargets.map((it) => {
              const utilPct = it.targetAmount > 0 ? Math.round((it.investedAmount / it.targetAmount) * 100) : 0;

              return (
                <div key={it.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400 block">{it.assetClass}</span>
                      <h4 className="text-base font-bold text-white">{it.symbol}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded border border-emerald-500/20">
                      {utilPct}% Target
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">${it.investedAmount.toLocaleString()} Invested</span>
                      <span className="text-slate-500">Target: ${it.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(utilPct, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setInvestSymbol(it.symbol);
                      setShowInvestModal(true);
                    }}
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LineChart className="w-3.5 h-3.5 text-emerald-400" /> Invest in {it.symbol}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: ALL CUT FROM BUDGET DEDUCTIONS LEDGER */}
      {activeSection === "deductions" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-purple-400" /> All Cut From Monthly Budget
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Complete real-time breakdown of expenses, portfolio investments, and savings targets deducted from your master monthly budget.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMonthlyInputVal(masterBudget.toString());
                    setShowEditMonthlyModal(true);
                  }}
                  className="px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Adjust Monthly Budget ({formatCurrency(masterBudget, currencySymbol, currencyRate)})
                </button>
              </div>
            </div>

            {/* Deductions Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Master Monthly Budget</span>
                <div className="text-xl font-mono font-black text-sky-400">
                  {formatCurrency(masterBudget, currencySymbol, currencyRate)}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Total pool set for this cycle</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Total Cut / Outflows</span>
                <div className="text-xl font-mono font-black text-rose-400">
                  {formatCurrency(totalDeductedFromBudget, currencySymbol, currencyRate)}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">{totalBudgetUtilizationPct}% of monthly budget consumed</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Net Budget Remaining</span>
                <div className={`text-xl font-mono font-black ${netRemainingMasterBudget >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(netRemainingMasterBudget, currencySymbol, currencyRate)}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Available unspent capital</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {/* Type Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <button
                  onClick={() => setDeductionsFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    deductionsFilter === "all"
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  All Cut ({allDeductionItems.length})
                </button>
                <button
                  onClick={() => setDeductionsFilter("expenses")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    deductionsFilter === "expenses"
                      ? "bg-rose-600 text-white border-rose-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  Expenses ({expenses.filter((e) => e.status !== "Flagged").length})
                </button>
                <button
                  onClick={() => setDeductionsFilter("investments")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    deductionsFilter === "investments"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  Investments ({holdings.length})
                </button>
                <button
                  onClick={() => setDeductionsFilter("goals")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    deductionsFilter === "goals"
                      ? "bg-sky-600 text-white border-sky-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  Savings Goals ({goals.filter((g) => g.currentAmount > 0).length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search deductions..."
                  value={deductionsSearch}
                  onChange={(e) => setDeductionsSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Deductions Ledger Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Item / Merchant</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono">
                  {filteredDeductions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">
                        No deductions match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDeductions.map((item) => {
                      const isExp = item.type === "Expense";
                      const isInv = item.type === "Investment";

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                isExp
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : isInv
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-white block">{item.title}</span>
                            <span className="text-[10px] text-slate-500">{item.subtitle}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{item.category}</td>
                          <td className="px-4 py-3 text-slate-400">{item.date}</td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-bold ${
                                isExp ? "text-rose-400" : isInv ? "text-emerald-400" : "text-sky-400"
                              }`}
                            >
                              -{formatCurrency(item.amount, currencySymbol, currencyRate)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: MASTER ALLOCATOR CONFIGURATION */}
      {activeSection === "allocator" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" /> Master Capital Allocation Rules
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Adjust your total monthly capital budget and slider ratios for Spending, Investing, and Emergency Savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Total Monthly Master Budget ($)</label>
              <input
                type="number"
                value={masterBudget}
                onChange={(e) => setMasterBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Spending Ratio (%)</label>
              <input
                type="number"
                value={spendingRatio}
                onChange={(e) => setSpendingRatio(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-rose-400 focus:outline-none focus:border-rose-500/50"
              />
              <span className="text-[10px] text-slate-500 block font-mono">
                Pool Cap: ${((masterBudget * spendingRatio) / 100).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Investing Ratio (%)</label>
              <input
                type="number"
                value={investingRatio}
                onChange={(e) => setInvestingRatio(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 block font-mono">
                Pool Target: ${((masterBudget * investingRatio) / 100).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                handleSaveRatios(masterBudget, spendingRatio, investingRatio, 100 - spendingRatio - investingRatio);
                alert("Master Budget & Ratios updated successfully!");
                setActiveSection("overview");
              }}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Save Capital Allocation Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
