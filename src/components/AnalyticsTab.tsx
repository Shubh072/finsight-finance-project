import React from "react";
import { 
  BarChart3, TrendingUp, Sparkles, AlertCircle, RefreshCw, Layers, Calendar, ArrowUpRight, Zap,
  TrendingDown, Activity, DollarSign, PieChart, LineChart, Percent, Briefcase, ShieldAlert,
  Calculator, AlertTriangle, Clock, Settings, Search, Filter, HelpCircle, Send, MessageSquare,
  MapPin, User, Grid, Flame, ShieldCheck, ArrowDownRight, ChevronRight, CheckCircle2, Award,
  Fingerprint, BookOpen, Scale, ArrowRight, Star, Settings2, Plus, Minus, Eye, X, Check,
  Bot, Volume2, VolumeX, RotateCcw, Shield, Target, Cpu
} from "lucide-react";
import { Expense, Holding, Goal, UserProfile } from "../types";
import { getCurrencySymbol, getCurrencyRate, formatCurrency } from "../utils/currency";
import { dispatchDynamicNotification } from "../utils/notifDispatcher";

interface AnalyticsTabProps {
  insights: any;
  isLoadingInsights: boolean;
  expenses?: Expense[];
  holdings?: Holding[];
  goals?: Goal[];
  budgets?: any[];
  userProfile?: UserProfile;
}

// Custom mock transactional ledger for category drill-downs
interface DrillTransaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  type: "fixed" | "discretionary" | "investment";
  anomaly: boolean;
}

const DRILLDOWN_LEDGER: Record<string, DrillTransaction[]> = {
  "Housing": [
    { id: "tx-h1", date: "2026-07-01", merchant: "Apex Property Lease", amount: 1850, type: "fixed", anomaly: false },
    { id: "tx-h2", date: "2026-07-05", merchant: "Metro Water & Power", amount: 145, type: "fixed", anomaly: false },
    { id: "tx-h3", date: "2026-07-12", merchant: "HomeDepot Garden Supply", amount: 210, type: "discretionary", anomaly: true }
  ],
  "Food": [
    { id: "tx-f1", date: "2026-07-10", merchant: "Whole Foods Market", amount: 285, type: "fixed", anomaly: false },
    { id: "tx-f2", date: "2026-07-11", merchant: "Sushi Supreme Dining", amount: 160, type: "discretionary", anomaly: true },
    { id: "tx-f3", date: "2026-07-15", merchant: "Corner Grocery Store", amount: 84, type: "fixed", anomaly: false },
    { id: "tx-f4", date: "2026-07-18", merchant: "Blue Bottle Coffee Ritual", amount: 45, type: "discretionary", anomaly: false }
  ],
  "Utilities": [
    { id: "tx-u1", date: "2026-07-02", merchant: "Comcast Xfinity Gigabit", amount: 110, type: "fixed", anomaly: false },
    { id: "tx-u2", date: "2026-07-08", merchant: "AT&T Family Mobility", amount: 180, type: "fixed", anomaly: false },
    { id: "tx-u3", date: "2026-07-15", merchant: "Amazon Web Services Hosting", amount: 320, type: "discretionary", anomaly: true }
  ],
  "Travel": [
    { id: "tx-t1", date: "2026-07-03", merchant: "Chevron Gas Station", amount: 65, type: "fixed", anomaly: false },
    { id: "tx-t2", date: "2026-07-09", merchant: "Amtrak Coastal Express", amount: 120, type: "discretionary", anomaly: false },
    { id: "tx-t3", date: "2026-07-14", merchant: "Uber Rideshare Transit", amount: 45, type: "discretionary", anomaly: false }
  ],
  "Entertainment": [
    { id: "tx-e1", date: "2026-07-04", merchant: "Steam Gaming Platform", amount: 59, type: "discretionary", anomaly: false },
    { id: "tx-e2", date: "2026-07-12", merchant: "AMC Multiplex Screen", amount: 32, type: "discretionary", anomaly: false },
    { id: "tx-e3", date: "2026-07-16", merchant: "SoundCloud Pro Annual", amount: 149, type: "discretionary", anomaly: true }
  ],
  "Other": [
    { id: "tx-o1", date: "2026-07-06", merchant: "CVS Pharmacy Prescription", amount: 35, type: "fixed", anomaly: false },
    { id: "tx-o2", date: "2026-07-15", merchant: "Gym Membership Premium", amount: 75, type: "fixed", anomaly: false },
    { id: "tx-o3", date: "2026-07-19", merchant: "The Wall Street Journal", amount: 28, type: "fixed", anomaly: false }
  ]
};

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  insights,
  isLoadingInsights,
  expenses = [],
  holdings = [],
  goals = [],
  budgets = [],
  userProfile
}) => {
  const currencySymbol = getCurrencySymbol(userProfile?.currency);
  const currencyRate = getCurrencyRate(userProfile?.currency);
  // Navigation for active analytics pages
  const [activePage, setActivePage] = React.useState<
    | "health"
    | "cashflow"
    | "income"
    | "expense"
    | "budget"
    | "investment"
    | "goals"
    | "networth"
    | "credit"
    | "tax"
  >("health");

  // User Interactive State Overrides (Sliders & What-If variables)
  const [savingsRateSlider, setSavingsRateSlider] = React.useState<number>(35); // as percentage
  const [riskPreference, setRiskPreference] = React.useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [creditCardBalance, setCreditCardBalance] = React.useState<number>(3250);
  const [creditLimit, setCreditLimit] = React.useState<number>(15000);
  const [estimatedAnnualSalary, setEstimatedAnnualSalary] = React.useState<number>(145000);
  const [expectedHikePercentage, setExpectedHikePercentage] = React.useState<number>(8);
  const [investmentYieldExpectation, setInvestmentYieldExpectation] = React.useState<number>(8.5);
  const [inflationRateExpectation, setInflationRateExpectation] = React.useState<number>(3.2);

  // Page 2 Cashflow Interactive State
  const [cashflowTimeframe, setCashflowTimeframe] = React.useState<"3M" | "6M" | "1Y">("6M");
  const [cashflowScenario, setCashflowScenario] = React.useState<"base" | "stagflation" | "austerity">("base");

  // Page 3 Income Secondary Streams
  const [secondaryInflows, setSecondaryInflows] = React.useState<Array<{ id: string; name: string; amount: number; frequency: string }>>([
    { id: "inc-1", name: "Equity Portfolio Dividends", amount: 420, frequency: "Monthly" },
    { id: "inc-2", name: "SaaS Side-gigs (Consulting)", amount: 1500, frequency: "Monthly" },
    { id: "inc-3", name: "High Yield Savings Interest", amount: 180, frequency: "Monthly" }
  ]);
  const [newInflowName, setNewInflowName] = React.useState("");
  const [newInflowAmount, setNewInflowAmount] = React.useState("");

  // Page 4 Drilldown Search & Custom Entries
  const [ledgerSearch, setLedgerSearch] = React.useState("");
  const [dynamicLedger, setDynamicLedger] = React.useState<Record<string, DrillTransaction[]>>(DRILLDOWN_LEDGER);
  const [newTxMerchant, setNewTxMerchant] = React.useState("");
  const [newTxAmount, setNewTxAmount] = React.useState("");
  const [newTxType, setNewTxType] = React.useState<"fixed" | "discretionary" | "investment">("discretionary");

  // Page 5 Budget Rebalancing
  const [appliedBudgetRebalances, setAppliedBudgetRebalances] = React.useState<string[]>([]);

  // Page 6 Investment Compounding
  const [monthlyDepositSlider, setMonthlyDepositSlider] = React.useState<number>(600);
  const [investmentView, setInvestmentView] = React.useState<"chart" | "table">("chart");

  // Page 8 Net Worth Custom Assets & Liabilities
  const [customAssets, setCustomAssets] = React.useState<Array<{ id: string; name: string; value: number }>>([
    { id: "ast-1", name: "Brokerage Portfolio Holdings", value: 120000 },
    { id: "ast-2", name: "High-Yield Cash Reserves", value: 45000 },
    { id: "ast-3", name: "Simulated Real Estate Equity", value: 165000 },
    { id: "ast-4", name: "Alternative Asset Vault", value: 10000 }
  ]);
  const [customLiabilities, setCustomLiabilities] = React.useState<Array<{ id: string; name: string; value: number }>>([
    { id: "lia-1", name: "Outstanding Real Estate Mortgage", value: 74000 },
    { id: "lia-2", name: "Unsubsidized Student Loans", value: 7750 }
  ]);
  const [newAssetName, setNewAssetName] = React.useState("");
  const [newAssetVal, setNewAssetVal] = React.useState("");
  const [newLiabName, setNewLiabName] = React.useState("");
  const [newLiabVal, setNewLiabVal] = React.useState("");

  // Page 9 Credit Payoff Strategy
  const [payoffStrategy, setPayoffStrategy] = React.useState<"avalanche" | "snowball">("avalanche");

  // Page 10 Tax Estimator
  const [filingStatus, setFilingStatus] = React.useState<"single" | "joint" | "head">("single");
  const [stateTaxLocation, setStateTaxLocation] = React.useState<"CA" | "NY" | "TX" | "FL" | "IL">("CA");
  const [preTaxDeduction, setPreTaxDeduction] = React.useState<number>(19500);

  // Security Report Modal Form
  const [newFraudMerchant, setNewFraudMerchant] = React.useState("");
  const [newFraudAmount, setNewFraudAmount] = React.useState("");

  // Toast feedback state
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: "success" | "info" | "warning" }[]>([]);
  const triggerToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = "toast_" + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Widget customizability config (Enabled/Disabled states for dashboard cards)
  const [visibleWidgets, setVisibleWidgets] = React.useState<Record<string, boolean>>({
    healthScore: true,
    riskDial: true,
    creditCardUtilizer: true,
    seasonalSpendingPattern: true,
    anomaliesOverview: true,
    anomalyFeed: true
  });
  const [showWidgetCustomizer, setShowWidgetCustomizer] = React.useState<boolean>(false);

  // Drill-down category active focus
  const [drilledCategory, setDrilledCategory] = React.useState<string | null>(null);

  // Smart Insights filter mode
  const [insightFilter, setInsightFilter] = React.useState<"all" | "anomaly" | "optimization" | "fraud">("all");

  // Dynamic user identity resolution (Strictly no hardcoded fallback name)
  const rawUserName = userProfile?.username || userProfile?.name || (userProfile as any)?.fullName || "User";
  const firstName = rawUserName.split(" ")[0];

  // AI Sovereign Coach Modes & State
  const [coachPersona, setCoachPersona] = React.useState<"balanced" | "defensive" | "growth">("balanced");
  const [isCoachThinking, setIsCoachThinking] = React.useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = React.useState<boolean>(false);

  interface CoachActionButton {
    label: string;
    actionType: "apply_savings" | "apply_tax" | "apply_budget" | "resolve_fraud" | "switch_avalanche";
  }

  interface CoachMsgItem {
    id: string;
    sender: "user" | "coach";
    text: string;
    timestamp: string;
    action?: CoachActionButton;
  }

  const [coachMessages, setCoachMessages] = React.useState<CoachMsgItem[]>([
    {
      id: "cm-1",
      sender: "coach",
      text: `Greetings ${firstName}! I am your AI Sovereign Financial Coach running in ${coachPersona.toUpperCase()} stance. I analyze live spend velocity, reserve liquidity, and yield strategy. How may I direct your portfolio today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [coachInput, setCoachInput] = React.useState<string>("");

  // Simulated Suspicious fraud activities data
  const [fraudEvents, setFraudEvents] = React.useState([
    { id: "fr-1", date: "2026-07-19", merchant: "Subway Shoreditch London", amount: 52.40, status: "pending", flag: "Suspicious Location Override" },
    { id: "fr-2", date: "2026-07-18", merchant: "AWS Cloud-Servers Dublin", amount: 1240.00, status: "flagged", flag: "Rapid Volume Anomaly" }
  ]);

  // Acknowledge anomaly feedback list
  const [resolvedAnomalies, setResolvedAnomalies] = React.useState<string[]>([]);

  // Static Cashflow timeline simulation
  const monthlyFlows = [
    { month: "Jan", inflows: 12500, outflows: 4500, savings: 8000 },
    { month: "Feb", inflows: 12500, outflows: 4300, savings: 8200 },
    { month: "Mar", inflows: 13200, outflows: 4800, savings: 8400 },
    { month: "Apr", inflows: 12500, outflows: 5200, savings: 7300 },
    { month: "May", inflows: 14000, outflows: 4900, savings: 9100 },
    { month: "Jun", inflows: 12500, outflows: 5800, savings: 6700 },
    { month: "Jul", inflows: 12500, outflows: 4700, savings: 7800 },
  ];

  // Spending Heatmap Grid (Density value between 0 and 10)
  const heatmapData = [
    { category: "Housing", values: [10, 0, 0, 0, 0, 0, 0] },
    { category: "Food", values: [3, 6, 4, 3, 7, 9, 8] },
    { category: "Utilities", values: [5, 1, 0, 0, 4, 0, 0] },
    { category: "Travel", values: [1, 2, 0, 2, 8, 10, 4] },
    { category: "Entertainment", values: [1, 3, 1, 4, 7, 10, 9] },
    { category: "Other", values: [4, 2, 5, 2, 3, 6, 4] },
  ];
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Compute calculated values based on user sliders
  const creditUtilizationRatio = Math.round((creditCardBalance / creditLimit) * 100);
  const creditUtilizationStatus = creditUtilizationRatio > 40 ? "critical" : creditUtilizationRatio > 25 ? "warning" : "optimal";

  // Dynamic Financial Health Score calculation taking real user state into account
  const totalExpensesAmount = expenses.filter(e => e.status !== "Flagged").reduce((sum, e) => sum + e.amount, 0);
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalGoalsTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const goalProgressRatio = totalGoalsTarget > 0 ? Math.min(1, totalGoalsSaved / totalGoalsTarget) : 0.6;
  const budgetHealthFactor = totalExpensesAmount > 0 ? Math.max(0, 25 - Math.floor(totalExpensesAmount / 300)) : 25;
  const portfolioHealthFactor = totalPortfolioValue > 0 ? Math.min(20, Math.floor(totalPortfolioValue / 1000)) : 15;

  const calculatedHealthScore = Math.min(100, Math.max(10, Math.round(
    (savingsRateSlider * 0.8) + 
    (Math.max(0, 100 - creditUtilizationRatio) * 0.25) + 
    budgetHealthFactor + 
    portfolioHealthFactor + 
    (goalProgressRatio * 15) +
    (riskPreference === "moderate" ? 10 : riskPreference === "conservative" ? 8 : 12)
  )));

  // Execute Coach Prompt with Real API & Fallback Intelligence Engine
  const executeCoachPrompt = async (text: string) => {
    if (!text.trim() || isCoachThinking) return;
    const userText = text.trim();
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMsg: CoachMsgItem = { id: "cm-usr-" + Date.now(), sender: "user", text: userText, timestamp: formattedTime };
    setCoachMessages(prev => [...prev, userMsg]);
    setIsCoachThinking(true);

    try {
      // API call to server-side Gemini endpoint
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `[Stance: ${coachPersona}] ${userText}` }],
          userProfile: { ...userProfile, username: rawUserName, name: userProfile?.name || rawUserName },
          expenses,
          holdings,
          goals,
          telemetry: {
            healthScore: calculatedHealthScore,
            savingsRate: savingsRateSlider,
            riskPreference,
            creditUtilizationRatio,
            estimatedAnnualSalary,
            payoffStrategy
          }
        })
      });

      const data = await res.json();
      let replyText = "";
      let actionBtn: CoachActionButton | undefined = undefined;

      if (res.ok && data.content && !data.content.includes("unable to process")) {
        replyText = data.content;
      } else {
        // Fallback Intelligence Engine for real financial context
        const q = userText.toLowerCase();

        if (q.includes("subscription") || q.includes("waste") || q.includes("prune") || q.includes("leak")) {
          replyText = `### 🧾 Outflow & Subscription Leak Audit\n\nHello ${firstName}, analyzing your transaction telemetry:\n- **Server Spikes**: AWS node ($320) detected as anomalous.\n- **Audio/Media**: SoundCloud ($149) duplicate subscription.\n- **Directive**: Consolidating cloud instances and streaming accounts will save an estimated **$469/yr**, boosting your monthly liquidity margin by **+3.8%**.`;
          actionBtn = { label: "⚡ Rebalance Discretionary Budgets", actionType: "apply_budget" };
        } else if (q.includes("tax") || q.includes("bracket") || q.includes("salary") || q.includes("hike")) {
          const taxable = Math.max(0, estimatedAnnualSalary - 14600);
          replyText = `### 🏛️ Tax Bracket Calibration\n\nFor your annual base of **$${estimatedAnnualSalary.toLocaleString()}** (@${rawUserName}):\n- Standard Deduction: **$14,600**\n- Estimated Taxable Base: **$${taxable.toLocaleString()}**\n- Marginal Federal Bracket: **24%**\n\n**Coach Action Plan**: Allocating $23,000 into traditional pre-tax retirement reduces your taxable income to **$${(taxable - 23000).toLocaleString()}**, instantly saving **~$5,520** in federal taxes!`;
          actionBtn = { label: "🏛️ Apply Pre-Tax Optimization", actionType: "apply_tax" };
        } else if (q.includes("credit") || q.includes("utilization") || q.includes("card") || q.includes("debt")) {
          replyText = `### 💳 Revolving Credit Debt Strategy\n\n${firstName}, your revolving credit utilization sits at **${creditUtilizationRatio}%** ($${creditCardBalance.toLocaleString()} / $${creditLimit.toLocaleString()}):\n- **Status**: ${creditUtilizationRatio > 40 ? "🚨 Critical Utilization" : creditUtilizationRatio > 25 ? "⚠️ Elevated Risk" : "✅ Health Tier Optimal"}\n- **Recommendation**: Execute the **Avalanche Debt Repayment Strategy** (prioritizing high-yield APR balances first) to bring utilization below **20%**.`;
          actionBtn = { label: "⚡ Activate Avalanche Payoff", actionType: "switch_avalanche" };
        } else if (q.includes("health") || q.includes("score") || q.includes("savings") || q.includes("boost")) {
          replyText = `### ⚡ Financial Health Telemetry\n\nYour current score is **${calculatedHealthScore}/100** under a **${savingsRateSlider}%** savings rate:\n- **Investment Base**: $${totalPortfolioValue.toLocaleString()}\n- **Goals Funded**: ${Math.round(goalProgressRatio * 100)}%\n\n**Directive**: Boosting your savings rate to **45%** advances your retirement compounding target by **1.8 years**.`;
          actionBtn = { label: "⚡ Apply 45% Savings Velocity", actionType: "apply_savings" };
        } else if (q.includes("fraud") || q.includes("recession") || q.includes("risk") || q.includes("security")) {
          replyText = `### 🛡️ Defensive Capital Shield\n\n${firstName}, operating in **${coachPersona.toUpperCase()}** stance:\n- **Unresolved Alerts**: ${fraudEvents.filter(f => f.status !== "resolved").length} flagged transactions.\n- **Emergency Runway**: Liquid capital covers **14.2 months** of essential fixed outflows under stress testing.`;
          actionBtn = { label: "🛡️ Resolve Security Flags", actionType: "resolve_fraud" };
        } else {
          replyText = `### 🎯 Sovereign Coach Briefing\n\nGreetings **${firstName}** (@${rawUserName})!\n- **Stance**: **${coachPersona.toUpperCase()}**\n- **Health Score**: **${calculatedHealthScore}/100**\n- **Savings Velocity**: **${savingsRateSlider}%**\n- **Credit Utilization**: **${creditUtilizationRatio}%**\n\nSelect a strategy query below or ask any specific question regarding your portfolio, debt, or tax plan.`;
        }
      }

      const coachMsg: CoachMsgItem = {
        id: "cm-coach-" + Date.now(),
        sender: "coach",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionBtn
      };

      setCoachMessages(prev => [...prev, coachMsg]);

      // Voice Coach Speech Synthesis
      if (isVoiceEnabled && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const cleanText = replyText.replace(/#|\*|`|\[|\]/g, "");
          const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 180));
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("Speech synthesis notice:", e);
        }
      }

    } catch (err) {
      console.error("Coach execution error:", err);
      setCoachMessages(prev => [...prev, {
        id: "cm-err-" + Date.now(),
        sender: "coach",
        text: `Network handshake delayed. Your local ledger parameters are fully operational, ${firstName}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsCoachThinking(false);
    }
  };

  const handleExecuteCoachAction = (actionType: string) => {
    if (actionType === "apply_savings") {
      handleApplyHealthOptimization();
    } else if (actionType === "apply_tax") {
      setPreTaxDeduction(23000);
      triggerToast("Tax strategy applied: $23,000 pre-tax deduction set!", "success");
    } else if (actionType === "apply_budget") {
      setAppliedBudgetRebalances(["Housing", "Food", "Entertainment"]);
      triggerToast("AI budget rebalancing applied!", "success");
    } else if (actionType === "resolve_fraud") {
      setFraudEvents(prev => prev.map(f => ({ ...f, status: "resolved" })));
      triggerToast("Security threat alerts resolved & cleared!", "success");
    } else if (actionType === "switch_avalanche") {
      setPayoffStrategy("avalanche");
      triggerToast("Credit debt strategy switched to Avalanche!", "success");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim()) return;
    executeCoachPrompt(coachInput);
    setCoachInput("");
  };

  const resolveFraud = (id: string) => {
    setFraudEvents(prev => prev.map(f => f.id === id ? { ...f, status: "resolved" } : f));
    dispatchDynamicNotification({
      id: `notif-fraud-res-${id}`,
      type: "security",
      title: "🛡️ Fraud Threat Alert Resolved",
      desc: "Flagged event marked verified & cleared in Security Shield.",
      priority: "medium",
      category: "Security & System",
      actionText: "Audit Security Logs",
      actionType: "secure"
    });
    triggerToast("Security threat resolved & logged", "success");
  };

  const handleReportFraudCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFraudMerchant.trim() || !newFraudAmount) return;
    const val = parseFloat(newFraudAmount);
    const newEvt = {
      id: "fr-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      merchant: newFraudMerchant.trim(),
      amount: val,
      status: "flagged",
      flag: "User Reported Suspicious Charge"
    };
    setFraudEvents([newEvt, ...fraudEvents]);
    setNewFraudMerchant("");
    setNewFraudAmount("");

    dispatchDynamicNotification({
      id: `notif-user-fraud-${newEvt.id}`,
      type: "security",
      title: `🚨 User Security Flag: ${newEvt.merchant}`,
      desc: `High priority report logged for ${val.toFixed(2)}. Temporary card hold active.`,
      priority: "high",
      category: "Security & System",
      actionText: "Review Card Security",
      actionType: "secure"
    });
    triggerToast(`Suspicious charge for ${newEvt.merchant} reported & flagged!`, "warning");
  };

  // 1. Health Optimization Handler
  const handleApplyHealthOptimization = () => {
    setSavingsRateSlider(45);
    setRiskPreference("moderate");
    dispatchDynamicNotification({
      id: `notif-health-opt-${Date.now()}`,
      type: "recommendation",
      title: "⚡ Financial Health Strategy Calibrated",
      desc: `Target savings rate optimized to 45%. Defensive liquidity buffer increased.`,
      priority: "high",
      category: "AI Strategic Insights",
      actionText: "View Health Score",
      actionType: "view"
    });
    triggerToast("Health score parameters recalibrated & optimized!", "success");
  };

  // 2. Secondary Income Stream Handlers
  const handleAddSecondaryInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInflowName.trim() || !newInflowAmount) return;
    const val = parseFloat(newInflowAmount);
    const newInc = {
      id: "inc-" + Date.now(),
      name: newInflowName.trim(),
      amount: val,
      frequency: "Monthly"
    };
    setSecondaryInflows([...secondaryInflows, newInc]);
    setNewInflowName("");
    setNewInflowAmount("");
    triggerToast(`Secondary stream "${newInc.name}" added (+${val}/mo)!`, "success");
  };

  const handleDeleteSecondaryInflow = (id: string) => {
    setSecondaryInflows(prev => prev.filter(i => i.id !== id));
    triggerToast("Inflow stream removed", "info");
  };

  // 3. Drilldown Category Ledger Handlers
  const handleAddDrilldownTx = (category: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxMerchant.trim() || !newTxAmount) return;
    const amt = parseFloat(newTxAmount);
    const newTx: DrillTransaction = {
      id: "tx-custom-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      merchant: newTxMerchant.trim(),
      amount: amt,
      type: newTxType,
      anomaly: amt > 250
    };
    const currentList = dynamicLedger[category] || [];
    setDynamicLedger({
      ...dynamicLedger,
      [category]: [newTx, ...currentList]
    });
    setNewTxMerchant("");
    setNewTxAmount("");

    if (newTx.anomaly) {
      dispatchDynamicNotification({
        id: `notif-tx-anomaly-${newTx.id}`,
        type: "budget",
        title: `⚠️ Spending Anomaly Detected: ${category}`,
        desc: `High variance charge of ${amt} logged for ${newTx.merchant}.`,
        priority: "medium",
        category: "Financial Status",
        actionText: "Inspect Ledger",
        actionType: "view"
      });
    }
    triggerToast(`Logged transaction ${amt} under ${category}`, "success");
  };

  const handleToggleAnomaly = (category: string, txId: string) => {
    const list = dynamicLedger[category] || [];
    const updated = list.map(tx => tx.id === txId ? { ...tx, anomaly: !tx.anomaly } : tx);
    setDynamicLedger({ ...dynamicLedger, [category]: updated });
    triggerToast("Anomaly flag status updated", "info");
  };

  // 4. Budget Rebalance Handlers
  const handleApplyBudgetRebalance = (label: string, adj: number) => {
    if (appliedBudgetRebalances.includes(label)) return;
    setAppliedBudgetRebalances([...appliedBudgetRebalances, label]);

    dispatchDynamicNotification({
      id: `notif-budget-reb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type: "budget",
      title: `📊 Budget Calibrated: ${label}`,
      desc: `Monthly limit adjusted by ${adj < 0 ? `-${Math.abs(adj)}` : `+${adj}`}.`,
      priority: "medium",
      category: "Financial Status",
      actionText: "View Budgets",
      actionType: "rebalance"
    });
    triggerToast(`Applied rebalancing to ${label}`, "success");
  };

  const handleApplyAllBudgetRebalances = () => {
    const allLabels = [
      "Food & Household Essentials",
      "Gas & Daily Commute Travel",
      "SaaS Software & App Licenses",
      "Emergency Liquid Savings Allocation"
    ];
    setAppliedBudgetRebalances(allLabels);

    dispatchDynamicNotification({
      id: `notif-budget-all-reb-${Date.now()}`,
      type: "budget",
      title: "🎯 Comprehensive AI Budget Rebalancing Applied",
      desc: "All recommended category limit adjustments applied to optimize cash surplus.",
      priority: "high",
      category: "AI Strategic Insights",
      actionText: "Review Budgets",
      actionType: "rebalance"
    });
    triggerToast("All AI budget rebalancing recommendations applied!", "success");
  };

  // 5. Net Worth Custom Assets & Liabilities Handlers
  const handleAddCustomAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetVal) return;
    const val = parseFloat(newAssetVal);
    const newAst = { id: "ast-" + Date.now(), name: newAssetName.trim(), value: val };
    setCustomAssets([...customAssets, newAst]);
    setNewAssetName("");
    setNewAssetVal("");
    triggerToast(`Asset "${newAst.name}" (${val.toLocaleString()}) added!`, "success");
  };

  const handleDeleteCustomAsset = (id: string) => {
    setCustomAssets(prev => prev.filter(a => a.id !== id));
    triggerToast("Asset removed from Net Worth", "info");
  };

  const handleAddCustomLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiabName.trim() || !newLiabVal) return;
    const val = parseFloat(newLiabVal);
    const newLia = { id: "lia-" + Date.now(), name: newLiabName.trim(), value: val };
    setCustomLiabilities([...customLiabilities, newLia]);
    setNewLiabName("");
    setNewLiabVal("");
    triggerToast(`Liability "${newLia.name}" (${val.toLocaleString()}) added!`, "warning");
  };

  const handleDeleteCustomLiability = (id: string) => {
    setCustomLiabilities(prev => prev.filter(l => l.id !== id));
    triggerToast("Liability removed", "info");
  };

  // 6. Tax Strategy Handler
  const handleApplyTaxStrategy = () => {
    dispatchDynamicNotification({
      id: `notif-tax-strat-${Date.now()}`,
      type: "tax",
      title: "🧾 Federal Pre-Tax Deduction Program Active",
      desc: `Pre-tax contribution set to ${preTaxDeduction.toLocaleString()}. Estimated federal tax reduction: ${Math.round(preTaxDeduction * 0.24).toLocaleString()}.`,
      priority: "high",
      category: "AI Strategic Insights",
      actionText: "Review Tax Strategy",
      actionType: "view"
    });
    triggerToast(`Tax strategy activated! Estimated annual tax savings: ${Math.round(preTaxDeduction * 0.24).toLocaleString()}`, "success");
  };

  const toggleWidget = (widgetId: string) => {
    setVisibleWidgets(prev => ({ ...prev, [widgetId]: !prev[widgetId] }));
  };

  return (
    <div id="advanced-analytics-tab-view" className="space-y-6 text-left">
      
      {/* 1. Master Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <span className="text-sky-400 text-xs font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            Sovereign Predictive Analytics Suite
          </span>
          <h2 className="text-2xl font-black text-white">Neural Financial Engine</h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Harness deep-learning prediction frameworks to project income curves, diagnose micro-anomaly leaks, customize credit optimization models, and map progressive tax thresholds.
          </p>
        </div>

        {/* Global Widget Customization trigger */}
        <div className="relative shrink-0 flex items-center gap-2">
          <button
            onClick={() => setShowWidgetCustomizer(!showWidgetCustomizer)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-sky-400" /> 
            Bespoke Widgets
          </button>
          
          {showWidgetCustomizer && (
            <div className="absolute right-0 top-11 bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl z-50 w-72 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Enable/Disable Widgets</span>
                <button onClick={() => setShowWidgetCustomizer(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(visibleWidgets).map(([key, isVisible]) => (
                  <label key={key} className="flex items-center justify-between text-xs text-slate-300 cursor-pointer select-none">
                    <span className="capitalize font-mono text-[10px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleWidget(key)}
                      className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Page Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-850 shadow-inner">
        {[
          { id: "health", label: "Health Index", icon: Activity, color: "text-emerald-400" },
          { id: "cashflow", label: "Cash Velocity", icon: RefreshCw, color: "text-sky-400" },
          { id: "income", label: "Income Pred", icon: TrendingUp, color: "text-indigo-400" },
          { id: "expense", label: "Expense Forecast", icon: BarChart3, color: "text-rose-400" },
          { id: "budget", label: "Budget Recom", icon: PieChart, color: "text-amber-400" },
          { id: "investment", label: "Invest Comp", icon: LineChart, color: "text-violet-400" },
          { id: "goals", label: "Goal Savings", icon: Award, color: "text-sky-300" },
          { id: "networth", label: "Net Assets", icon: Layers, color: "text-cyan-400" },
          { id: "credit", label: "Credit Shield", icon: Fingerprint, color: "text-pink-400" },
          { id: "tax", label: "Tax Estimator", icon: Scale, color: "text-teal-400" },
        ].map((page) => {
          const Icon = page.icon;
          const isActive = activePage === page.id;
          return (
            <button
              key={page.id}
              onClick={() => {
                setActivePage(page.id as any);
                setDrilledCategory(null);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white border border-slate-800 shadow-lg ring-1 ring-slate-800"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/30"
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${page.color}`} />
              <span className="text-[9px] font-mono font-bold tracking-tight text-center leading-tight truncate w-full">
                {page.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md pointer-events-auto flex items-center justify-between text-xs font-mono animate-in slide-in-from-bottom-3 duration-200 ${
                t.type === "warning"
                  ? "bg-rose-950/90 border-rose-500/30 text-rose-200"
                  : t.type === "info"
                  ? "bg-sky-950/90 border-sky-500/30 text-sky-200"
                  : "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-sky-400" />
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Primary Page Component Display & Interactive Side Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column (Dynamic Analytic Pages) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ==================================== */}
          {/* PAGE 1: FINANCIAL HEALTH & SCORING */}
          {activePage === "health" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Page 01 / Health Evaluation Matrix</span>
                  <h3 className="text-white font-bold text-lg">Financial Health & Scoring</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-black rounded">
                  Score Mode: Active
                </span>
              </div>

              {/* Dynamic Score widget (customizable) */}
              {visibleWidgets.healthScore && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl text-center flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">WIDGET // HEALTH</div>
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/80 animate-pulse"></div>
                      <span className="text-3xl font-black text-white">{calculatedHealthScore}</span>
                      <span className="text-[9px] text-slate-500 font-mono">/ 100</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 mt-3">Financial Health Score</h4>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5">Optimized Target</span>
                  </div>

                  {/* Slider Control for savings rate override */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">SIMULATE SAVINGS VELOCITY</span>
                      <h4 className="text-xs font-bold text-white mt-1">Savings Rate: {savingsRateSlider}%</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Increasing savings velocity directly improves defensive liquidity index parameters.
                      </p>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={savingsRateSlider}
                        onChange={(e) => setSavingsRateSlider(parseInt(e.target.value))}
                        className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                        <span>5% Min</span>
                        <span>80% Max</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Preference selector */}
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">AI RISK PREFERENCE TIER</span>
                      <h4 className="text-xs font-bold text-white mt-1 capitalize">{riskPreference} Strategy</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Aligns passive index multipliers and reserve cash asset ratio dynamically.
                      </p>
                    </div>
                    <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      {(["conservative", "moderate", "aggressive"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRiskPreference(r)}
                          className={`flex-1 py-1 text-[9px] font-mono font-bold capitalize rounded transition-all cursor-pointer ${
                            riskPreference === r
                              ? "bg-slate-950 text-sky-400 border border-slate-800/80 shadow"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Comprehensive breakdowns */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Consolidated Metrics Framework</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Debt-to-Income Index", rating: "Excellent", value: "12.4%", pct: 88, color: "bg-emerald-500" },
                    { label: "Emergency Reserve Strength", rating: "Optimal", value: "6.2 Months", pct: 100, color: "bg-emerald-500" },
                    { label: "Discretionary Burn Threshold", rating: "Moderate Variance", value: "24.8%", pct: 64, color: "bg-sky-500" },
                    { label: "Investment Compounding Power", rating: "Requires Boost", value: "Moderate", pct: 45, color: "bg-amber-500" },
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{metric.label}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{metric.value}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div style={{ width: `${metric.pct}%` }} className={`h-full ${metric.color}`}></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>Calibration: {metric.rating}</span>
                        <span>{metric.pct}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisory Box */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Sovereign Coach Directive</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      By adjusting your dynamic savings rate slider to <span className="text-sky-400 font-bold">{savingsRateSlider}%</span>, you could expedite your target retirement age compounding path by approximately <span className="text-emerald-400 font-bold">1.8 years</span>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleApplyHealthOptimization}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-[10px] rounded-lg transition-all shrink-0 cursor-pointer shadow-lg"
                >
                  Apply AI Optimization
                </button>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 2: CASH FLOW & FORECAST */}
          {activePage === "cashflow" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-sky-400 font-mono tracking-wider uppercase font-bold">Page 02 / Liquidity Stream Mapping</span>
                  <h3 className="text-white font-bold text-lg">Cash Flow Velocity & Predictions</h3>
                </div>
                
                {/* Timeframe selector */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  {(["3M", "6M", "1Y"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setCashflowTimeframe(tf)}
                      className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded transition-all cursor-pointer ${
                        cashflowTimeframe === tf
                          ? "bg-sky-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-850">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Simulated Macro Economic Scenario:</span>
                <div className="flex gap-1.5">
                  {[
                    { id: "base", label: "Base Rate" },
                    { id: "stagflation", label: "Stagflation (+15% Outflows)" },
                    { id: "austerity", label: "Discretionary Cut (-20% Outflows)" }
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setCashflowScenario(sc.id as any);
                        triggerToast(`Activated ${sc.label} scenario model`, "info");
                      }}
                      className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                        cashflowScenario === sc.id
                          ? "bg-slate-800 text-sky-400 border border-sky-500/30"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850"
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Bar Graph */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Actual & Simulated Outflows ({cashflowTimeframe})</span>
                  <div className="flex gap-3 text-[9px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-500 rounded-sm"></span> Inflows</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-sm"></span> Outflows</span>
                  </div>
                </div>

                <div className="h-56 flex items-end gap-3 pt-6 border-b border-slate-800 pb-3">
                  {monthlyFlows
                    .slice(cashflowTimeframe === "3M" ? -3 : cashflowTimeframe === "6M" ? -6 : 0)
                    .map((f, idx) => {
                      const outflowMultiplier = cashflowScenario === "stagflation" ? 1.15 : cashflowScenario === "austerity" ? 0.8 : 1.0;
                      const calculatedOutflow = Math.round(f.outflows * outflowMultiplier);
                      const maxVal = 16000;
                      const inHeight = (f.inflows / maxVal) * 100;
                      const outHeight = (calculatedOutflow / maxVal) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          <div className="w-full flex justify-center gap-1 items-end h-full">
                            <div style={{ height: `${inHeight}%` }} className="w-3 bg-sky-500 rounded-t-sm relative hover:opacity-80 transition-opacity">
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[8px] font-mono px-1.5 py-0.5 rounded text-white whitespace-nowrap z-30">
                                +${f.inflows.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ height: `${outHeight}%` }} className="w-3 bg-rose-500 rounded-t-sm relative hover:opacity-80 transition-opacity">
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[8px] font-mono px-1.5 py-0.5 rounded text-white whitespace-nowrap z-30">
                                -${calculatedOutflow.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 mt-2">{f.month}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Predictor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Consolidated Surplus Velocity</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Consolidated cash inflow averages <span className="text-emerald-400 font-bold">$12,850/mo</span> against scenario outflows of <span className="text-rose-400 font-bold">${Math.round(4942 * (cashflowScenario === "stagflation" ? 1.15 : cashflowScenario === "austerity" ? 0.8 : 1.0)).toLocaleString()}/mo</span>, yielding a residual net buffer of <span className="text-white font-bold">${Math.round(12850 - 4942 * (cashflowScenario === "stagflation" ? 1.15 : cashflowScenario === "austerity" ? 0.8 : 1.0)).toLocaleString()}/mo</span>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Next-Quarter Cash Forecast</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Under standard winter seasonal spikes, Q4 expenses are projected to expand by <span className="text-rose-400 font-bold">+8.4%</span>. Net surplus is predicted to contract slightly to <span className="text-white font-bold">$7,240/mo</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 3: INCOME ANALYSIS */}
          {activePage === "income" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase font-bold">Page 03 / Revenue Optimizers</span>
                  <h3 className="text-white font-bold text-lg">Income Stream Analysis & Projections</h3>
                </div>
                <span className="px-2.5 py-1 bg-indigo-950/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-black rounded">
                  Predictive Base: Active
                </span>
              </div>

              {/* Custom salary parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive Base Salary</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-bold">Annual Salary Base:</span>
                    <span className="text-xs text-sky-400 font-mono font-black">${estimatedAnnualSalary.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="350000"
                    step="5000"
                    value={estimatedAnnualSalary}
                    onChange={(e) => setEstimatedAnnualSalary(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Expected Hike / Promotion Pace</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-bold">Projected Hike:</span>
                    <span className="text-xs text-emerald-400 font-mono font-black">+{expectedHikePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.5"
                    value={expectedHikePercentage}
                    onChange={(e) => setExpectedHikePercentage(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Forecast calculations and prediction block */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 text-left">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-xs text-slate-300 font-black uppercase">Neural Income Prediction Model (5-Year Outlook)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Assuming your base salary of <span className="text-white font-bold">${estimatedAnnualSalary.toLocaleString()}</span> expands at an annual increment rate of <span className="text-indigo-400 font-bold">{expectedHikePercentage}%</span>, here are your predicted trajectory coordinates:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[1, 2, 3, 5].map((year) => {
                    const projectedVal = Math.round(estimatedAnnualSalary * Math.pow(1 + (expectedHikePercentage / 100), year));
                    return (
                      <div key={year} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-mono block">Year {year} ({2026 + year})</span>
                        <span className="text-xs font-mono font-bold text-white mt-1 block">
                          ${projectedVal.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-emerald-400 font-mono block mt-0.5">
                          +${(projectedVal - estimatedAnnualSalary).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Revenue Streams & Custom Form */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Secondary Inflow Streams</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Total Secondary: ${secondaryInflows.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}/mo
                  </span>
                </div>

                <div className="divide-y divide-slate-800/40 bg-slate-950/40 rounded-xl border border-slate-850 p-4 space-y-2.5">
                  {secondaryInflows.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs pt-2 first:pt-0">
                      <div>
                        <span className="text-slate-200 font-bold block">{item.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{item.frequency}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-mono font-bold">+${item.amount.toLocaleString()} / mo</span>
                        <button
                          onClick={() => handleDeleteSecondaryInflow(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add secondary stream form */}
                <form onSubmit={handleAddSecondaryInflow} className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Stream Name (e.g., Rental Yield)"
                    value={newInflowName}
                    onChange={(e) => setNewInflowName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Monthly Amount ($)"
                    value={newInflowAmount}
                    onChange={(e) => setNewInflowAmount(e.target.value)}
                    className="w-full sm:w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Stream
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 4: EXPENSE ANALYSIS & DRILL-DOWN */}
          {activePage === "expense" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-rose-400 font-mono tracking-wider uppercase font-bold">Page 04 / Micro-Disbursement Drilling</span>
                  <h3 className="text-white font-bold text-lg">Expense Analysis & Drill-down</h3>
                </div>
                <span className="px-2 py-0.5 bg-rose-950/20 text-rose-400 border border-rose-500/10 text-[9px] font-mono rounded">
                  Drill down enabled
                </span>
              </div>

              {/* Category Cards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Select Category to Drill Down Ledger</span>
                  {drilledCategory && (
                    <button
                      onClick={() => setDrilledCategory(null)}
                      className="text-[10px] font-mono text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Reset drill <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { cat: "Housing", base: 1995, color: "text-indigo-400" },
                    { cat: "Food", base: 574, color: "text-emerald-400" },
                    { cat: "Utilities", base: 610, color: "text-blue-400" },
                    { cat: "Travel", base: 230, color: "text-sky-400" },
                    { cat: "Entertainment", base: 240, color: "text-rose-400" },
                    { cat: "Other", base: 138, color: "text-slate-400" },
                  ].map((item) => {
                    const list = dynamicLedger[item.cat] || [];
                    const computedTotal = list.reduce((sum, tx) => sum + tx.amount, 0);
                    return (
                      <button
                        key={item.cat}
                        onClick={() => setDrilledCategory(item.cat)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          drilledCategory === item.cat
                            ? "bg-slate-950 border-sky-500/40 ring-1 ring-sky-500/20"
                            : "bg-slate-950/60 border-slate-850 hover:bg-slate-950 hover:border-slate-800"
                        }`}
                      >
                        <span className={`text-[9px] font-mono ${item.color} block`}>{item.cat}</span>
                        <span className="text-sm font-mono font-black text-white mt-1 block">
                          ${(computedTotal || item.base).toLocaleString()}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                          {list.length} Active transactions
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drill-down Results Block */}
              {drilledCategory && (
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4 transition-all animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-900">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-400" />
                      Detailed Ledger Drill: {drilledCategory}
                    </span>

                    {/* Search box for ledger */}
                    <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 w-full sm:w-48">
                      <Search className="w-3 h-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filter transactions..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-white focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(dynamicLedger[drilledCategory] || [])
                      .filter(tx => !ledgerSearch || tx.merchant.toLowerCase().includes(ledgerSearch.toLowerCase()))
                      .map((tx) => (
                        <div key={tx.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{tx.merchant}</span>
                              <button
                                onClick={() => handleToggleAnomaly(drilledCategory, tx.id)}
                                className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase transition-all cursor-pointer ${
                                  tx.anomaly
                                    ? "bg-rose-950 border border-rose-500/30 text-rose-400 animate-pulse"
                                    : "bg-slate-800 text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                {tx.anomaly ? "Anomaly Flagged" : "Normal"}
                              </button>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500">{tx.date} • Type: {tx.type}</span>
                          </div>
                          <span className="font-mono font-bold text-white">${tx.amount}</span>
                        </div>
                      ))}
                  </div>

                  {/* Add new transaction form to category */}
                  <form onSubmit={(e) => handleAddDrilldownTx(drilledCategory, e)} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-900">
                    <input
                      type="text"
                      required
                      placeholder="Merchant Name"
                      value={newTxMerchant}
                      onChange={(e) => setNewTxMerchant(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500/50"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Amount ($)"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      className="w-full sm:w-28 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                    />
                    <select
                      value={newTxType}
                      onChange={(e) => setNewTxType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="discretionary">Discretionary</option>
                      <option value="fixed">Fixed</option>
                      <option value="investment">Investment</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Log Entry
                    </button>
                  </form>
                </div>
              )}

              {/* Seasonal Spending Behavior Card */}
              {visibleWidgets.seasonalSpendingPattern && (
                <div className="p-4.5 bg-slate-950 border border-slate-850 rounded-2xl text-left space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      Seasonal Spending Cycles
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">High Confidence</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    AI models identified consistent seasonal surges in utility bills during <span className="text-sky-400">December</span> (winter heating) and discretionary gift-giving anomalies totaling <span className="text-rose-400">+$1,450</span> across late <span className="text-amber-400">November</span>. Rebalancing budget limits beforehand offsets seasonal strain.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 5: BUDGET ANALYSIS & SUGGESTIONS */}
          {activePage === "budget" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-amber-400 font-mono tracking-wider uppercase font-bold">Page 05 / Allocation Calibrations</span>
                  <h3 className="text-white font-bold text-lg">Predictive Budget Allocation Recommendations</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-950/20 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-black rounded">
                  Calibration Mode
                </span>
              </div>

              {/* Dynamic budget recommendations mapping */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">AI-Generated Budget Rebalancing (Next-Month Estimate)</span>

                <div className="space-y-3">
                  {[
                    { label: "Food & Household Essentials", currentLimit: 600, suggestedLimit: 520, reason: "Consistently low actual discretionary dining variance", adjustment: -80, progress: 62 },
                    { label: "Gas & Daily Commute Travel", currentLimit: 300, suggestedLimit: 250, reason: "Decline in physical workplace trips", adjustment: -50, progress: 45 },
                    { label: "SaaS Software & App Licenses", currentLimit: 150, suggestedLimit: 95, reason: "Dual dormant stream subscription detected", adjustment: -55, progress: 92 },
                    { label: "Emergency Liquid Savings Allocation", currentLimit: 2500, suggestedLimit: 2800, reason: "Surplus cash accumulation optimization", adjustment: 300, progress: 15 },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{item.label}</h4>
                          <span className={`text-[8px] font-mono font-black px-1 rounded ${
                            item.adjustment < 0 ? "bg-emerald-950 text-emerald-400" : "bg-sky-950 text-sky-400"
                          }`}>
                            {item.adjustment < 0 ? "Trim" : "Boost"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono">{item.reason}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 font-mono block">Current: ${item.currentLimit}</span>
                          <span className="text-xs font-bold text-white font-mono block">Suggested: ${item.suggestedLimit}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-mono font-black ${
                          item.adjustment < 0 ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/10" : "bg-sky-950/50 text-sky-400 border border-sky-500/10"
                        }`}>
                          {item.adjustment < 0 ? `-$${Math.abs(item.adjustment)}` : `+$${item.adjustment}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 6: INVESTMENT ANALYSIS */}
          {activePage === "investment" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-violet-400 font-mono tracking-wider uppercase font-bold">Page 06 / Passive Yield Growth</span>
                  <h3 className="text-white font-bold text-lg">Passive Investment Compound Forecast</h3>
                </div>
                <span className="px-2 py-0.5 bg-violet-950/20 text-violet-400 border border-violet-500/10 text-[9px] font-mono rounded">
                  Compound Interest Engine
                </span>
              </div>

              {/* Sliders for investment parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive Target Yield Return</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-bold">Annual Expected Rate:</span>
                    <span className="text-xs text-violet-400 font-mono font-black">{investmentYieldExpectation}% APY</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="18"
                    step="0.1"
                    value={investmentYieldExpectation}
                    onChange={(e) => setInvestmentYieldExpectation(parseFloat(e.target.value))}
                    className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Simulated Annual Inflation rate</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-bold">Projected Inflation Rate:</span>
                    <span className="text-xs text-amber-400 font-mono font-black">{inflationRateExpectation}% Rate</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.1"
                    value={inflationRateExpectation}
                    onChange={(e) => setInflationRateExpectation(parseFloat(e.target.value))}
                    className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Growth timeline projection chart */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Compounded Balance (Inflation-Adjusted Net Projection)</span>
                  <span className="text-[9px] font-mono text-slate-400">Principal base: $120,000</span>
                </div>

                <div className="h-44 flex items-end justify-between pt-6 border-b border-slate-800 pb-3 relative">
                  {/* SVG line */}
                  <svg className="absolute inset-x-0 bottom-3 h-28 w-full overflow-visible" preserveAspectRatio="none">
                    <path
                      d="M 0 90 Q 150 75 300 50 T 600 5"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.2)]"
                    />
                  </svg>

                  {/* Calculations */}
                  {[1, 3, 5, 10, 15].map((years) => {
                    const principal = 120000;
                    const netYield = (investmentYieldExpectation - inflationRateExpectation) / 100;
                    const finalBalance = Math.round(principal * Math.pow(1 + netYield, years));

                    return (
                      <div key={years} className="flex flex-col items-center z-10">
                        <span className="text-[9px] font-mono text-violet-400 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded-md mb-1.5">
                          ${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 border border-slate-900"></div>
                        <span className="text-[9px] text-slate-500 font-mono mt-2">{years} Years</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 7: SAVINGS GOALS ANALYSIS */}
          {activePage === "goals" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-sky-400 font-mono tracking-wider uppercase font-bold">Page 07 / Target Milestone Analytics</span>
                  <h3 className="text-white font-bold text-lg">Goal Progression Map & Savings Forecast</h3>
                </div>
                <span className="px-2.5 py-1 bg-sky-950/20 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-black rounded">
                  Goal Analytics Module
                </span>
              </div>

              {/* Goal-by-goal timeline list with milestones statistics */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Active Target Velocity Breakdown</span>

                <div className="space-y-3">
                  {[
                    { name: "New Home Downpayment", target: 80000, current: 45000, rate: 800, date: "Oct 2027", color: "bg-indigo-500" },
                    { name: "Retirement Compound Portfolio", target: 500000, current: 120000, rate: 1200, date: "Dec 2045", color: "bg-violet-500" },
                    { name: "Summer World Cruise", target: 15000, current: 4500, rate: 300, date: "Aug 2026", color: "bg-rose-500" },
                    { name: "Emergency Shield Reserve", target: 25000, current: 25000, rate: 0, date: "Completed", color: "bg-emerald-500" },
                  ].map((goal, idx) => {
                    const pct = Math.round((goal.current / goal.target) * 100);
                    return (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-white">{goal.name}</h4>
                            <span className="text-[9px] text-slate-500 font-mono">Savings Speed: ${goal.rate}/mo • Est Target: {goal.date}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-sky-400">{pct}%</span>
                        </div>

                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${pct}%` }} className={`h-full ${goal.color}`}></div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                          <span>Accumulated: ${goal.current.toLocaleString()}</span>
                          <span>Target: ${goal.target.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 8: NET WORTH & PORTFOLIO */}
          {activePage === "networth" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-bold">Page 08 / Wealth Balance Sheet</span>
                  <h3 className="text-white font-bold text-lg">Net Worth Matrix & Asset Allocation</h3>
                </div>
                <span className="px-2.5 py-1 bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-black rounded">
                  FY 2026 Balance Sheet
                </span>
              </div>

              {/* Assets vs Liabilities Breakdown cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Assets Column */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="text-emerald-400 w-4 h-4" /> Assets Portfolio
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400">$340,000</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { item: "Brokerage Investments", val: "$120,000" },
                      { item: "High-Yield Cash Reserves", val: "$45,000" },
                      { item: "Simulated Real Estate Equity", val: "$165,000" },
                      { item: "Alternative Asset Vault", val: "$10,000" },
                    ].map((asset, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{asset.item}</span>
                        <span className="text-white font-semibold">{asset.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities Column */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TrendingDown className="text-rose-400 w-4 h-4" /> Active Liabilities
                    </span>
                    <span className="text-xs font-mono font-black text-rose-400">$85,000</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { item: "Outstanding Real Estate Mortgage", val: "$74,000" },
                      { item: "Unsubsidized Student Loans", val: "$7,750" },
                      { item: "Consolidated Credit Card Debt", val: `$${creditCardBalance.toLocaleString()}` },
                    ].map((liab, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{liab.item}</span>
                        <span className="text-white font-semibold">{liab.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Total Balance Card */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">CONSOLIDATED LIQUID WEALTH</span>
                  <h4 className="text-lg font-black text-white mt-0.5">Net Worth: ${(340000 - 85000 - 3250 + creditCardBalance).toLocaleString()}</h4>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 text-xs font-mono font-bold rounded-md">
                  Positive Stream
                </span>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 9: CREDIT CARD & UTILIZATION */}
          {activePage === "credit" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-pink-400 font-mono tracking-wider uppercase font-bold">Page 09 / Credit Risk Optimizer</span>
                  <h3 className="text-white font-bold text-lg">Credit Shield & Utilization Analysis</h3>
                </div>
                <span className="px-2.5 py-1 bg-pink-950/20 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-black rounded">
                  Credit Score: 785
                </span>
              </div>

              {/* Interactive credit limits and current balance controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Simulate Card Balances</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-bold">Card Balance Sum:</span>
                    <span className="text-xs text-rose-400 font-mono font-black">${creditCardBalance.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="250"
                    value={creditCardBalance}
                    onChange={(e) => setCreditCardBalance(parseInt(e.target.value))}
                    className="w-full accent-pink-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive Combined Credit Limits</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-bold">Total Credit Limit:</span>
                    <span className="text-xs text-emerald-400 font-mono font-black">${creditLimit.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseInt(e.target.value))}
                    className="w-full accent-pink-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

              {/* Credit utilization visualizer (customizable widget) */}
              {visibleWidgets.creditCardUtilizer && (
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Dynamic Utilization Health Bar</span>
                    <span className={`text-[10px] font-mono font-black uppercase ${
                      creditUtilizationStatus === "critical" ? "text-rose-400 animate-pulse" :
                      creditUtilizationStatus === "warning" ? "text-amber-400" :
                      "text-emerald-400"
                    }`}>
                      {creditUtilizationRatio}% ({creditUtilizationStatus})
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, creditUtilizationRatio)}%` }}
                      className={`h-full ${
                        creditUtilizationStatus === "critical" ? "bg-rose-500 animate-pulse" :
                        creditUtilizationStatus === "warning" ? "bg-amber-500" :
                        "bg-emerald-500"
                      }`}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
                    <span>Optimal Limit: Below 30%</span>
                    <span>Critical Alert: Above 40%</span>
                  </div>
                </div>
              )}

              {/* Shield directives */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Credit Optimization Directive</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Your dynamic simulated utilization is currently <span className="text-white font-bold">{creditUtilizationRatio}%</span>. Keeping this ratio strictly below <span className="text-emerald-400 font-semibold">30%</span> signals high capital security levels to primary rating institutions, preserving maximum borrow capabilities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* PAGE 10: TAX BRACKETS & ESTIMATION */}
          {activePage === "tax" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase font-bold">Page 10 / Federal Tax Bracket Evaluator</span>
                  <h3 className="text-white font-bold text-lg">Tax Burden & Bracket Estimation</h3>
                </div>
                <span className="px-2.5 py-1 bg-teal-950/20 text-teal-400 border border-teal-500/20 text-[10px] font-mono font-black rounded">
                  Federal Tax Standard: Single Filer
                </span>
              </div>

              {/* Dynamic calculations for standard itemized tax deduction */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Simulated Federal Bracket Breakdown</span>

                {/* Computations */}
                {(() => {
                  const standardDeduction = 14600; // Single filer standard
                  const taxableIncome = Math.max(0, estimatedAnnualSalary - standardDeduction);
                  
                  // Simple progressive tax tier model for single filer
                  let calculatedTax = 0;
                  if (taxableIncome <= 11600) {
                    calculatedTax = taxableIncome * 0.10;
                  } else if (taxableIncome <= 47150) {
                    calculatedTax = (11600 * 0.10) + ((taxableIncome - 11600) * 0.12);
                  } else if (taxableIncome <= 100525) {
                    calculatedTax = (11600 * 0.10) + ((47150 - 11600) * 0.12) + ((taxableIncome - 47150) * 0.22);
                  } else if (taxableIncome <= 191950) {
                    calculatedTax = (11600 * 0.10) + ((47150 - 11600) * 0.12) + ((100525 - 47150) * 0.22) + ((taxableIncome - 100525) * 0.24);
                  } else {
                    calculatedTax = (11600 * 0.10) + ((47150 - 11600) * 0.12) + ((100525 - 47150) * 0.22) + ((191950 - 100525) * 0.24) + ((taxableIncome - 191950) * 0.32);
                  }

                  const effectiveTaxRate = taxableIncome > 0 ? Math.round((calculatedTax / estimatedAnnualSalary) * 100) : 0;

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-mono block">ESTIMATED TAXABLE SUM</span>
                          <span className="text-sm font-mono font-black text-white mt-0.5 block">${taxableIncome.toLocaleString()}</span>
                          <span className="text-[8px] text-slate-400 font-mono">After standard $14,600 ded.</span>
                        </div>

                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-mono block">FEDERAL INCOME TAX BURDEN</span>
                          <span className="text-sm font-mono font-black text-rose-400 mt-0.5 block">${Math.round(calculatedTax).toLocaleString()}</span>
                          <span className="text-[8px] text-slate-400 font-mono">Progressive brackets</span>
                        </div>

                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-mono block">EFFECTIVE LIQUID TAX RATE</span>
                          <span className="text-sm font-mono font-black text-sky-400 mt-0.5 block">{effectiveTaxRate}% Rate</span>
                          <span className="text-[8px] text-slate-400 font-mono">Against gross revenue base</span>
                        </div>
                      </div>

                      {/* Tax Tip */}
                      <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl text-left space-y-1">
                        <span className="text-[9px] font-mono text-teal-400 font-bold uppercase block">AI Deduction Opportunity Found!</span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Shifting up to <span className="text-white font-bold">$23,000</span> into traditional tax-advantaged employer retirement accounts avoids standard brackets entirely. This will reduce your federal tax liabilities by approximately <span className="text-emerald-400 font-bold">$5,520</span> instantly.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: AI Coach assistant, Smart Insights Feed & Fraud Detection Indicators */}
        <div className="space-y-6">
          
          {/* A. AI Conversational Coach */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                  <Bot className="w-4 h-4 text-sky-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs tracking-wide">AI Sovereign Coach Panel</h3>
                  <p className="text-[9px] font-mono text-slate-400">User Context: <span className="text-sky-400">@{rawUserName}</span></p>
                </div>
              </div>

              {/* Controls & Voice Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  title={isVoiceEnabled ? "Voice Feedback Enabled" : "Voice Feedback Muted"}
                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isVoiceEnabled 
                      ? "bg-sky-950 border-sky-500/30 text-sky-400" 
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCoachMessages([{
                    id: "cm-init-" + Date.now(),
                    sender: "coach",
                    text: `Thread reset. Standing by in **${coachPersona.toUpperCase()}** stance, ${firstName}. What is your next portfolio directive?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }])}
                  title="Reset Conversation Thread"
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Persona Stance Selector */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-950 border border-slate-850 rounded-xl">
              {(["balanced", "defensive", "growth"] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setCoachPersona(p);
                    triggerToast(`Coach Stance shifted to ${p.toUpperCase()} mode`, "info");
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                    coachPersona === p 
                      ? "bg-sky-600 text-white shadow" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {p === "balanced" ? "⚖️ Balanced" : p === "defensive" ? "🛡️ Defensive" : "🚀 Growth"}
                </button>
              ))}
            </div>

            {/* Live Telemetry Status Bar */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-850 rounded-xl font-mono text-[9px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Stream Active
              </span>
              <span>Health: <strong className="text-white">{calculatedHealthScore}/100</strong></span>
              <span>Util: <strong className={creditUtilizationRatio > 30 ? "text-rose-400" : "text-sky-400"}>{creditUtilizationRatio}%</strong></span>
            </div>

            {/* Scrollable Conversation Thread */}
            <div className="h-56 overflow-y-auto space-y-3 pr-1">
              {coachMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-[92%] text-xs space-y-2 ${
                    msg.sender === "coach"
                      ? "bg-slate-950 border border-slate-850 text-slate-300 mr-auto"
                      : "bg-sky-950/80 border border-sky-500/20 text-sky-100 ml-auto"
                  }`}
                >
                  {msg.sender === "coach" && (
                    <div className="flex items-center justify-between border-b border-slate-850 pb-1 text-[9px] font-mono text-sky-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        Sovereign AI Coach ({coachPersona})
                      </span>
                    </div>
                  )}

                  <div className="leading-relaxed whitespace-pre-line font-sans text-[11px]">
                    {msg.text}
                  </div>

                  {msg.action && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleExecuteCoachAction(msg.action!.actionType)}
                        className="w-full py-1.5 px-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-mono text-[10px] font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        {msg.action.label}
                      </button>
                    </div>
                  )}

                  <span className="text-[8px] font-mono text-slate-500 block text-right">{msg.timestamp}</span>
                </div>
              ))}

              {isCoachThinking && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl mr-auto max-w-[80%] space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-sky-400">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Analyzing live ledger telemetry & model state...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "💡 Subscription leaks", q: "Analyze my monthly subscription waste" },
                { label: "🏛️ Salary tax optimization", q: "How to optimize my tax bracket for my salary" },
                { label: `💳 Debt utilization (${creditUtilizationRatio}%)`, q: "Strategy to lower my credit utilization ratio" },
                { label: `⚡ Health score (${calculatedHealthScore})`, q: "How to boost my financial health score" },
                { label: "🛡️ Security check", q: "Run security and fraud alert audit" },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isCoachThinking}
                  onClick={() => executeCoachPrompt(btn.q)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[9px] font-mono text-slate-300 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder={`Ask Coach (@${rawUserName})...`}
                value={coachInput}
                disabled={isCoachThinking}
                onChange={(e) => setCoachInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
              />
              <button
                type="submit"
                disabled={isCoachThinking || !coachInput.trim()}
                className="p-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* B. Suspicious Fraud Alerts & Anomalies */}
          {visibleWidgets.anomalyFeed && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                  <h3 className="text-white font-bold text-xs">Security & Fraud Shield</h3>
                </div>
                <span className="px-1.5 py-0.5 bg-rose-950 text-[9px] text-rose-400 font-mono rounded">
                  {fraudEvents.filter(f => f.status !== "resolved").length} threat alerts
                </span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {fraudEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3 rounded-xl border space-y-2 text-xs ${
                      evt.status === "resolved"
                        ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-500 opacity-60"
                        : "bg-rose-950/10 border-rose-500/20 text-rose-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-rose-400 font-mono font-bold block uppercase">{evt.flag}</span>
                        <h4 className="text-white font-bold">{evt.merchant}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">{evt.date} • Base sum: ${evt.amount}</span>
                      </div>
                      
                      {evt.status !== "resolved" ? (
                        <button
                          onClick={() => resolveFraud(evt.id)}
                          className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-[8px] font-mono font-black text-white rounded cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Checked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. Smart Insights Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-white font-bold text-xs">Smart Insights Feed</h3>
              </div>
              
              {/* Filter pills */}
              <div className="flex gap-1">
                {(["all", "anomaly", "optimization"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInsightFilter(mode)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono capitalize cursor-pointer ${
                      insightFilter === mode
                        ? "bg-slate-950 text-sky-400 border border-slate-800"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { type: "anomaly", text: "AWS transaction spike of $320 detected. High variance compared to last 3 periods.", highlight: "AWS spike" },
                { type: "optimization", text: "Consolidating subscription streams would save $540/year. Direct towards High-Yield deposit.", highlight: "$540 savings" },
                { type: "optimization", text: "Interactive principal base compound return is estimated at +14% cumulative yield.", highlight: "+14% yield" },
              ]
                .filter(ins => insightFilter === "all" || ins.type === insightFilter)
                .map((ins, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] leading-relaxed text-slate-300">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${ins.type === "anomaly" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                      <span className="text-[9px] text-slate-500 font-mono capitalize">{ins.type} Alert</span>
                    </div>
                    {ins.text}
                  </div>
                ))}
            </div>
          </div>

          {/* D. Spending Heatmap density matrix widget */}
          {visibleWidgets.seasonalSpendingPattern && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-sky-400" />
                  Transaction Density Heatmap
                </span>
                <span className="text-[9px] font-mono text-slate-500">Day density</span>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-1 text-center text-[8px] font-mono text-slate-500 pb-1 border-b border-slate-800/40">
                  <div>Cat</div>
                  {daysOfWeek.map((d, idx) => (
                    <div key={idx}>{d[0]}</div>
                  ))}
                </div>

                <div className="space-y-1">
                  {heatmapData.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-8 gap-1 items-center">
                      <span className="text-[8px] text-slate-400 font-bold truncate text-left">{row.category[0] + row.category.slice(1,3)}</span>
                      {row.values.map((val, vIdx) => {
                        const opacity = val / 10;
                        const bg = val > 0 ? `rgba(14, 165, 233, ${Math.max(opacity, 0.15)})` : "rgba(30, 41, 59, 0.1)";
                        return (
                          <div
                            key={vIdx}
                            style={{ backgroundColor: bg }}
                            className="h-4 rounded border border-slate-800/40 hover:scale-110 cursor-pointer relative group flex items-center justify-center text-[7px] text-white"
                          >
                            {val > 0 ? val : ""}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

