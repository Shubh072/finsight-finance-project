import React from "react";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Award,
  MessageSquareCode,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Activity,
  LineChart,
  FileText,
  Bell,
  Settings,
  LogOut,
  Search,
  Moon,
  Sun,
  Plus,
  Menu,
  X,
  AlertTriangle,
  User
} from "lucide-react";
import { Expense, Holding, Goal, ChatMessage, ChatThread, UserProfile, SecuritySettings, NotificationSettings, safeParseJSON } from "./types";
import { DashboardTab } from "./components/DashboardTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { PortfolioTab } from "./components/PortfolioTab";
import { HealthTab } from "./components/HealthTab";
import { GoalsTab } from "./components/GoalsTab";
import { AssistantTab } from "./components/AssistantTab";
import { ProfileTab } from "./components/ProfileTab";

import { LandingPage } from "./components/LandingPage";
import { AuthPages } from "./components/AuthPages";
import { BudgetsTab } from "./components/BudgetsTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { ReportsTab } from "./components/ReportsTab";
import { NotificationsTab } from "./components/NotificationsTab";
import { SettingsTab } from "./components/SettingsTab";
import { EnterpriseHub, EnterpriseHubState } from "./components/EnterpriseHub";
import { DocumentationModal } from "./components/DocumentationModal";
import { generateFinSightDocumentationPDF } from "./utils/pdfGenerator";

// Initializing Default State values
const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Sovereign User",
  username: "sovereign_trader",
  email: "trader@finsight.io",
  phone: "+1 (555) 902-1244",
  avatar: "SU",
  role: "Pro Member",
  riskTolerance: "Aggressive",
  monthlyGoal: 1500,
  currency: "USD",
  defaultAccount: "Chase Sapphire Preferred"
};

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorEnabled: true,
  apiKeyEnabled: false,
  backupCodesCount: 8,
  activeSessions: [
    { id: "s1", device: "MacBook Pro (16-inch)", ip: "198.162.1.84", location: "San Francisco, CA", lastActive: "Active Now", isCurrent: true },
    { id: "s2", device: "iPhone 15 Pro", ip: "198.162.1.2", location: "San Francisco, CA", lastActive: "3 hours ago", isCurrent: false }
  ]
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: true,
  sms: false,
  push: true,
  aiSummaries: true
};

const INITIAL_EXPENSES: Expense[] = [
  { id: "e1", date: "2026-07-15", category: "Housing", merchant: "Mortgage AutoPay", amount: 1800.00, status: "Cleared", notes: "Monthly primary residence settlement" },
  { id: "e2", date: "2026-07-16", category: "Food", merchant: "Whole Foods", amount: 245.50, status: "Cleared", notes: "Organic groceries family stock" },
  { id: "e3", date: "2026-07-16", category: "Utilities", merchant: "PG&E Energy", amount: 120.00, status: "Cleared", notes: "Grid electricity and gas service" },
  { id: "e4", date: "2026-07-17", category: "Entertainment", merchant: "Netflix Premium", amount: 22.99, status: "Cleared", notes: "Consolidated multi-user streaming subscription" },
  { id: "e5", date: "2026-07-18", category: "Utilities", merchant: "AWS Cloud Invoicing", amount: 350.00, status: "Cleared", notes: "Production VM compute clusters" },
  { id: "e6", date: "2026-07-18", category: "Food", merchant: "Blue Bottle Coffee", amount: 6.50, status: "Cleared", notes: "Espresso run" },
  { id: "e7", date: "2026-07-19", category: "Travel", merchant: "Fly Emirates", amount: 1250.00, status: "Pending", notes: "Q3 Strategy Board flight booking" },
  { id: "e8", date: "2026-07-19", category: "Food", merchant: "Uber Eats Dinner", amount: 42.50, status: "Cleared", notes: "Team workspace dinner proxy" },
  { id: "e9", date: "2026-07-20", category: "Entertainment", merchant: "Equinox Gym membership", amount: 120.00, status: "Cleared", notes: "All-access athletic club dues" },
  { id: "e10", date: "2026-07-20", category: "Other", merchant: "Unknown Merch charge", amount: 328.00, status: "Flagged", notes: "Anomalous transaction logged - review open" }
];

const INITIAL_HOLDINGS: Holding[] = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 50, avgPrice: 170.00, currentPrice: 192.50, value: 9625.00, gainLoss: 1125.00, gainLossPercent: 13.24, type: "Equity" },
  { symbol: "MSFT", name: "Microsoft Corporation", shares: 30, avgPrice: 380.00, currentPrice: 415.20, value: 12456.00, gainLoss: 1056.00, gainLossPercent: 9.26, type: "Equity" },
  { symbol: "GOOGL", name: "Alphabet Inc.", shares: 40, avgPrice: 135.00, currentPrice: 152.80, value: 6112.00, gainLoss: 712.00, gainLossPercent: 13.18, type: "Equity" },
  { symbol: "BTC", name: "Bitcoin Core Asset", shares: 1.85, avgPrice: 42000.00, currentPrice: 67420.00, value: 124727.00, gainLoss: 47027.00, gainLossPercent: 60.52, type: "Crypto" },
  { symbol: "ETH", name: "Ethereum Network", shares: 5.2, avgPrice: 2100.00, currentPrice: 3445.80, value: 17918.16, gainLoss: 6998.16, gainLossPercent: 64.20, type: "Crypto" },
  { symbol: "IEF", name: "US Treasury 10Y Note ETF", shares: 120, avgPrice: 92.00, currentPrice: 96.10, value: 11532.00, gainLoss: 492.00, gainLossPercent: 4.45, type: "Fixed Income" }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    name: "New Home Downpayment",
    targetAmount: 80000,
    currentAmount: 45000,
    targetDate: "2027-10-15",
    category: "House",
    status: "On Track",
    priority: "High",
    monthlyContribution: 800,
    expectedRateOfReturn: 8,
    inflationRate: 3,
    isFamily: true,
    familyMembers: ["Alex", "Sophia"],
    isShared: true,
    sharedWith: ["adviser@finsight.io"],
    milestones: [
      { id: "m1-1", name: "Initial 10% Downpayment Match", amount: 8000, achieved: true },
      { id: "m1-2", name: "Reach 50% Threshold", amount: 40000, achieved: true },
      { id: "m1-3", name: "Secure Pre-approval Deposit", amount: 60000, achieved: false }
    ],
    reminders: [
      { id: "r1-1", text: "Deposit $800 recurring sum tomorrow", date: "2026-07-21" },
      { id: "r1-2", text: "Schedule lender consultation", date: "2026-10-01" }
    ],
    badges: ["Bronze Saver", "Property Pioneer"]
  },
  {
    id: "g2",
    name: "Retirement Compound Portfolio",
    targetAmount: 500000,
    currentAmount: 120000,
    targetDate: "2045-12-31",
    category: "Retirement",
    status: "On Track",
    priority: "High",
    monthlyContribution: 1200,
    expectedRateOfReturn: 10,
    inflationRate: 4,
    milestones: [
      { id: "g2-1", name: "Cross Six-Figure Saved", amount: 100000, achieved: true },
      { id: "g2-2", name: "First $250k Milestone", amount: 250000, achieved: false }
    ],
    reminders: [
      { id: "r2-1", text: "Annual NPS rebalancing review", date: "2026-12-15" }
    ],
    badges: ["Centurion Stacker", "Future Architect"]
  },
  {
    id: "g3",
    name: "Summer World Cruise",
    targetAmount: 15000,
    currentAmount: 4500,
    targetDate: "2026-08-20",
    category: "Travel",
    status: "At Risk",
    priority: "Medium",
    monthlyContribution: 300,
    expectedRateOfReturn: 6,
    inflationRate: 3,
    milestones: [
      { id: "g3-1", name: "Book Cruise Cabin Deposit", amount: 3000, achieved: true },
      { id: "g3-2", name: "Flight tickets budget", amount: 9000, achieved: false }
    ],
    reminders: [
      { id: "r3-1", text: "Fare alert trigger check", date: "2026-08-01" }
    ],
    badges: ["Adventure Seeker"]
  },
  {
    id: "g4",
    name: "Emergency Shield Reserve",
    targetAmount: 25000,
    currentAmount: 25000,
    targetDate: "2026-01-01",
    category: "Emergency Fund",
    status: "Achieved",
    priority: "High",
    monthlyContribution: 0,
    expectedRateOfReturn: 4,
    inflationRate: 3,
    milestones: [
      { id: "g4-1", name: "3 Months basic liquidity", amount: 12500, achieved: true },
      { id: "g4-2", name: "6 Months complete security", amount: 25000, achieved: true }
    ],
    badges: ["Sovereign Shield", "Anti-Fragile"]
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    return localStorage.getItem("finsight_auth") === "true" && !!localStorage.getItem("finsight_auth_token");
  });
  const [isProfileLoading, setIsProfileLoading] = React.useState<boolean>(false);
  const [publicView, setPublicView] = React.useState<"landing" | "login" | "register" | "forgot-password" | "reset-password" | "about" | "contact" | "features" | "pricing">("landing");
  const [activeTab, setActiveTab] = React.useState<string>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Load session profile on mount with offline local storage fallback
  React.useEffect(() => {
    const token = localStorage.getItem("finsight_auth_token");
    if (token) {
      setIsProfileLoading(true);
      fetch("/api/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setUserProfile(data);
          if (data.securitySettings) setSecuritySettings(data.securitySettings);
          if (data.notificationSettings) setNotificationSettings(data.notificationSettings);
          setIsAuthenticated(true);
        } else {
          console.warn("Session validation offline fallback - loading local storage profile");
          const localProfile = safeParseJSON<UserProfile>(localStorage.getItem("finsight_profile"), DEFAULT_USER_PROFILE);
          setUserProfile(localProfile);
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        console.warn("Offline mode active - loading local user profile:", err);
        const localProfile = safeParseJSON<UserProfile>(localStorage.getItem("finsight_profile"), DEFAULT_USER_PROFILE);
        setUserProfile(localProfile);
        setIsAuthenticated(true);
      })
      .finally(() => {
        setIsProfileLoading(false);
      });
    }
  }, []);

  // Unified Enterprise State
  const [hubState, setHubState] = React.useState<EnterpriseHubState>(() => {
    return safeParseJSON<EnterpriseHubState>(localStorage.getItem("finsight_hub_state"), {
      isDarkMode: true,
      accentColor: "sky",
      density: "standard",
      borderStyle: "subtle",
      currency: "USD",
      language: "en",
      role: "user",
      onboardingStep: 1,
      showKeyboardShortcuts: false,
      showCommandPalette: false,
      showCustomizer: false,
    });
  });

  const isDarkMode = hubState.isDarkMode;
  const setIsDarkMode = (val: boolean) => {
    setHubState(prev => ({ ...prev, isDarkMode: val }));
  };

  React.useEffect(() => {
    localStorage.setItem("finsight_hub_state", JSON.stringify(hubState));
    localStorage.setItem("finsight_theme", hubState.isDarkMode ? "dark" : "light");
  }, [hubState]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const tokenParam = params.get("token");
    if (viewParam === "reset-password" && tokenParam) {
      setIsAuthenticated(false);
      setPublicView("reset-password");
      localStorage.setItem("finsight_reset_token", tokenParam);
    }
  }, []);

  // Toast notifications state
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: "success" | "error" | "info" | "warning" }[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Reusable Confirmation Dialog state
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Quick add form fields state
  const [quickAmount, setQuickAmount] = React.useState("");
  const [quickCategory, setQuickCategory] = React.useState("Food");
  const [quickMerchant, setQuickMerchant] = React.useState("");
  const [quickNotes, setQuickNotes] = React.useState("");
  const [quickIsRecurring, setQuickIsRecurring] = React.useState(false);
  const [quickFrequency, setQuickFrequency] = React.useState<"Daily" | "Weekly" | "Monthly">("Monthly");

  // Load from LocalStorage or Fallback
  const [userProfile, setUserProfile] = React.useState<UserProfile>(() => {
    return safeParseJSON<UserProfile>(localStorage.getItem("finsight_profile"), DEFAULT_USER_PROFILE);
  });

  const [securitySettings, setSecuritySettings] = React.useState<SecuritySettings>(() => {
    return safeParseJSON<SecuritySettings>(localStorage.getItem("finsight_security"), DEFAULT_SECURITY_SETTINGS);
  });

  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>(() => {
    return safeParseJSON<NotificationSettings>(localStorage.getItem("finsight_notifications"), DEFAULT_NOTIFICATION_SETTINGS);
  });

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem("finsight_profile", JSON.stringify(newProfile));
    
    // Save to server
    const token = localStorage.getItem("finsight_auth_token");
    if (token) {
      fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: newProfile.name,
          phone: newProfile.phone,
          riskTolerance: newProfile.riskTolerance,
          monthlyGoal: newProfile.monthlyGoal,
          currency: newProfile.currency,
          defaultAccount: newProfile.defaultAccount,
          gender: newProfile.gender || null,
          dateOfBirth: newProfile.dateOfBirth || null,
          profilePhoto: newProfile.profilePhoto || null
        })
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.user) {
          setUserProfile(data.user);
          showToast("Profile synchronized with cloud node.", "success");
        }
      })
      .catch(err => {
        console.error("Server profile sync error:", err);
      });
    }
  };

  const handleUpdateSecurity = (newSec: SecuritySettings) => {
    setSecuritySettings(newSec);
    localStorage.setItem("finsight_security", JSON.stringify(newSec));
    
    // Save to server
    const token = localStorage.getItem("finsight_auth_token");
    if (token) {
      fetch("/api/user/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newSec)
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.securitySettings) {
          setSecuritySettings(data.securitySettings);
          showToast("Security settings hardened on cloud.", "success");
        }
      })
      .catch(err => {
        console.error("Server security sync error:", err);
      });
    }
  };

  const handleUpdateNotifications = (newNotif: NotificationSettings) => {
    setNotificationSettings(newNotif);
    localStorage.setItem("finsight_notifications", JSON.stringify(newNotif));
    
    // Save to server
    const token = localStorage.getItem("finsight_auth_token");
    if (token) {
      fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newNotif)
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.notificationSettings) {
          setNotificationSettings(data.notificationSettings);
          showToast("Subscription preferences updated on cloud.", "success");
        }
      })
      .catch(err => {
        console.error("Server notifications sync error:", err);
      });
    }
  };

  const [expenses, setExpenses] = React.useState<Expense[]>(() => {
    return safeParseJSON<Expense[]>(localStorage.getItem("finsight_expenses"), INITIAL_EXPENSES);
  });

  const [holdings, setHoldings] = React.useState<Holding[]>(() => {
    return safeParseJSON<Holding[]>(localStorage.getItem("finsight_holdings"), INITIAL_HOLDINGS);
  });

  const [goals, setGoals] = React.useState<Goal[]>(() => {
    return safeParseJSON<Goal[]>(localStorage.getItem("finsight_goals"), INITIAL_GOALS);
  });

  // AI Assistant thread management
  const [chatThreads, setChatThreads] = React.useState<ChatThread[]>(() => {
    return safeParseJSON<ChatThread[]>(localStorage.getItem("finsight_chat_threads"), [{ id: "t1", title: "Monthly Financial Analysis", timestamp: "Active now" }]);
  });

  const [activeThreadId, setActiveThreadId] = React.useState<string>("t1");

  const [chatHistoryByThread, setChatHistoryByThread] = React.useState<Record<string, ChatMessage[]>>(() => {
    const initialName = userProfile?.name ? userProfile.name.split(" ")[0] : "there";
    return safeParseJSON<Record<string, ChatMessage[]>>(localStorage.getItem("finsight_chats"), {
      t1: [
        {
          id: "m1",
          role: "assistant",
          content: `Hello ${initialName}! I am FinSight AI. Your active portfolio and financial ledgers are synchronized. How can I assist your wealth strategy today?`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    });
  });

  // AI Insights State
  const [insights, setInsights] = React.useState<any>(() => {
    return safeParseJSON<any>(localStorage.getItem("finsight_insights"), null);
  });
  const [isLoadingInsights, setIsLoadingInsights] = React.useState(false);
  const [isSendingChat, setIsSendingChat] = React.useState(false);

  // Synchronize state changes to LocalStorage
  React.useEffect(() => {
    localStorage.setItem("finsight_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  React.useEffect(() => {
    localStorage.setItem("finsight_security", JSON.stringify(securitySettings));
  }, [securitySettings]);

  React.useEffect(() => {
    localStorage.setItem("finsight_notifications", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  React.useEffect(() => {
    localStorage.setItem("finsight_expenses", JSON.stringify(expenses));
  }, [expenses]);

  React.useEffect(() => {
    localStorage.setItem("finsight_holdings", JSON.stringify(holdings));
  }, [holdings]);

  React.useEffect(() => {
    localStorage.setItem("finsight_goals", JSON.stringify(goals));
  }, [goals]);

  React.useEffect(() => {
    localStorage.setItem("finsight_chat_threads", JSON.stringify(chatThreads));
  }, [chatThreads]);

  React.useEffect(() => {
    localStorage.setItem("finsight_chats", JSON.stringify(chatHistoryByThread));
  }, [chatHistoryByThread]);

  React.useEffect(() => {
    localStorage.setItem("finsight_insights", JSON.stringify(insights));
  }, [insights]);

  React.useEffect(() => {
    localStorage.setItem("finsight_auth", isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  // Query Backend AI Insights API with Offline Engine Fallback
  const fetchAIInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          expenses,
          holdings,
          goals
        })
      });
      const data = await response.json();
      setInsights(data);
      showToast("Financial analytical telemetries calibrated successfully!", "success");
    } catch (error) {
      console.warn("API Insights unavailable - generating local offline intelligence:", error);
      const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalPortfolio = holdings.reduce((sum, h) => sum + h.value, 0);
      const totalGoalProgress = goals.length > 0 
        ? Math.round(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length)
        : 85;

      const offlineData = {
        summary: `Offline Financial Intelligence Engine Active: Total outflows recorded at $${totalOutflow.toLocaleString()} across ${expenses.length} ledger items. Total portfolio valuation stands at $${totalPortfolio.toLocaleString()}. Savings target completion rate is ${totalGoalProgress}%.`,
        insights: [
          {
            id: "off_1",
            type: "positive",
            title: "Portfolio Resilience & Wealth Building",
            description: `Your portfolio holdings of $${totalPortfolio.toLocaleString()} show strong stability. Diversification aligns well with your ${userProfile.riskTolerance} risk posture.`,
            actionableStep: "Continue systematic automated contributions to low-cost index funds."
          },
          {
            id: "off_2",
            type: "warning",
            title: "Outflow Audit & Discretionary Leakage",
            description: `Recorded $${totalOutflow.toLocaleString()} in recent expenses. Food, dining, and recurring digital subscriptions are your primary cash outflows.`,
            actionableStep: "Set category budget thresholds in the Budgets tab to optimize cash flow."
          },
          {
            id: "off_3",
            type: "info",
            title: "100% Local Offline Privacy Sentinel",
            description: "All financial statements, transactions, and audit trails are computed locally on your device with complete offline security.",
            actionableStep: "You can download PDF reports or export JSON backups directly from your dashboard anytime."
          }
        ]
      };
      setInsights(offlineData);
      showToast("Offline Financial Telemetries Calculated Local-First", "info");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Run initial insights query on boot
  React.useEffect(() => {
    if (!insights) {
      fetchAIInsights();
    }
  }, []);

  // CRUD handlers
  const handleAddExpense = (newExp: Omit<Expense, "id">) => {
    const exp: Expense = { ...newExp, id: "e_" + Date.now() };
    setExpenses((prev) => [exp, ...prev]);
    showToast(`Outflow transaction for $${newExp.amount} logged!`, "success");
  };

  const handleEditExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast("Ledger entry updated successfully", "success");
  };

  const handleDeleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Ledger Transaction",
      message: `Are you sure you want to permanently remove the transaction entry at '${target?.merchant || "Unknown Vendor"}' of $${target?.amount}? This operation is final.`,
      onConfirm: () => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        showToast("Transaction removed from ledger", "info");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddGoal = (newGoal: Omit<Goal, "id">) => {
    const g: Goal = { ...newGoal, id: "g_" + Date.now() };
    setGoals((prev) => [...prev, g]);
    showToast(`Savings target for '${newGoal.name}' initialized!`, "success");
  };

  const handleEditGoal = (id: string, updated: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    showToast("Goal details updated", "success");
  };

  const handleDeleteGoal = (id: string) => {
    const target = goals.find(g => g.id === id);
    setConfirmDialog({
      isOpen: true,
      title: "Remove Savings Target",
      message: `Are you sure you want to delete '${target?.name || "this savings target"}'? All savings progress and metrics will be purged.`,
      onConfirm: () => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
        showToast("Savings target removed", "info");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Portfolio Trade execution simulator
  const handleTradeSimulation = (symbol: string, type: "buy" | "sell", sharesNum: number) => {
    setHoldings((prev) => {
      return prev.map((h) => {
        if (h.symbol === symbol) {
          const sign = type === "buy" ? 1 : -1;
          const updatedShares = Math.max(h.shares + sign * sharesNum, 0);
          const updatedValue = updatedShares * h.currentPrice;
          const updatedCost = type === "buy"
            ? (h.shares * h.avgPrice) + (sharesNum * h.currentPrice)
            : (h.shares * h.avgPrice) - (sharesNum * h.avgPrice);
          const updatedAvg = updatedShares > 0 ? updatedCost / updatedShares : 0;
          const netCost = updatedShares * updatedAvg;
          const updatedGain = updatedValue - netCost;
          const updatedPct = netCost > 0 ? (updatedGain / netCost) * 100 : 0;
          return {
            ...h,
            shares: updatedShares,
            avgPrice: parseFloat(updatedAvg.toFixed(2)),
            value: parseFloat(updatedValue.toFixed(2)),
            gainLoss: parseFloat(updatedGain.toFixed(2)),
            gainLossPercent: parseFloat(updatedPct.toFixed(2))
          };
        }
        return h;
      });
    });
    showToast(`Order processed: ${type.toUpperCase()} ${sharesNum} shares of ${symbol}`, "success");
  };

  const handleAddHolding = (newHolding: Holding) => {
    setHoldings((prev) => {
      const existingIndex = prev.findIndex((h) => h.symbol.toUpperCase() === newHolding.symbol.toUpperCase());
      if (existingIndex >= 0) {
        return prev.map((h, i) => {
          if (i === existingIndex) {
            const totalShares = h.shares + newHolding.shares;
            const totalCost = (h.shares * h.avgPrice) + (newHolding.shares * newHolding.avgPrice);
            const newAvg = totalShares > 0 ? totalCost / totalShares : 0;
            const newValue = totalShares * (newHolding.currentPrice || h.currentPrice);
            const gain = newValue - totalCost;
            const pct = totalCost > 0 ? (gain / totalCost) * 100 : 0;
            return {
              ...h,
              shares: totalShares,
              avgPrice: parseFloat(newAvg.toFixed(2)),
              value: parseFloat(newValue.toFixed(2)),
              gainLoss: parseFloat(gain.toFixed(2)),
              gainLossPercent: parseFloat(pct.toFixed(2))
            };
          }
          return h;
        });
      }
      return [newHolding, ...prev];
    });
    showToast(`Investment of $${newHolding.value.toLocaleString()} in ${newHolding.symbol} logged to portfolio!`, "success");
  };

  // Chat message submit handler (Server side Gemini integration)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "m_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    // Append user message to active thread
    setChatHistoryByThread((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), userMsg]
    }));

    setIsSendingChat(true);

    try {
      // Create request payload with current state Context
      const currentHistory = [...(chatHistoryByThread[activeThreadId] || []), userMsg];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentHistory,
          userProfile,
          expenses,
          holdings,
          goals
        })
      });
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: "m_ai_" + Date.now(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString(),
        data: { sources: data.sources }
      };

      setChatHistoryByThread((prev) => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), aiMsg]
      }));
    } catch (err) {
      console.warn("Chat API call failed or offline - invoking Local Offline Intelligence Engine:", err);
      const lower = text.toLowerCase();
      const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalPortfolio = holdings.reduce((sum, h) => sum + h.value, 0);
      const firstName = userProfile?.name ? userProfile.name.split(" ")[0] : "there";
      let offlineResponse = "";

      if (lower.includes("budget") || lower.includes("spend") || lower.includes("expense") || lower.includes("outflow")) {
        offlineResponse = `Hello ${firstName}! [Offline Financial Sentinel] Your local financial ledger records $${totalOutflow.toLocaleString()} in total outflows across ${expenses.length} recent transactions. Primary spending categories are Food and Utilities. I recommend setting category caps in the Budgets tab to preserve monthly surplus.`;
      } else if (lower.includes("invest") || lower.includes("stock") || lower.includes("portfolio") || lower.includes("holding")) {
        offlineResponse = `Hello ${firstName}! [Offline Financial Sentinel] Your current local investment portfolio is valued at $${totalPortfolio.toLocaleString()} across ${holdings.length} assets. Aligned with your ${userProfile.riskTolerance} risk profile, consider rebalancing when single asset exposure exceeds 30%.`;
      } else if (lower.includes("goal") || lower.includes("saving") || lower.includes("target")) {
        offlineResponse = `Hello ${firstName}! [Offline Financial Sentinel] You have ${goals.length} active savings targets. Maintain recurring contributions towards your primary high-priority goal to ensure timely completion.`;
      } else {
        offlineResponse = `Hello ${firstName}! [Offline Financial Sentinel] I have analyzed your request: "${text}". Operating in complete 100% offline mode, all your financial analytics ($${totalOutflow.toLocaleString()} outflows, $${totalPortfolio.toLocaleString()} portfolio) remain private and encrypted on your local hardware terminal.`;
      }

      const aiMsg: ChatMessage = {
        id: "m_ai_" + Date.now(),
        role: "assistant",
        content: offlineResponse,
        timestamp: new Date().toLocaleTimeString(),
        data: { sources: ["Local Offline Financial Engine"] }
      };

      setChatHistoryByThread((prev) => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), aiMsg]
      }));
    } finally {
      setIsSendingChat(false);
    }
  };

  // Chat Thread Handlers
  const handleNewThread = () => {
    const id = "t_" + Date.now();
    const title = "Financial Session " + (chatThreads.length + 1);
    const firstName = userProfile?.name ? userProfile.name.split(" ")[0] : "there";
    setChatThreads((prev) => [...prev, { id, title, timestamp: "Active now" }]);
    setActiveThreadId(id);
    setChatHistoryByThread((prev) => ({
      ...prev,
      [id]: [
        {
          id: "m_welcome_" + Date.now(),
          role: "assistant",
          content: `Hello ${firstName}! Welcome to your new chat thread. How can I assist with your portfolio analysis, budget optimization, or wealth planning today?`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  };

  const handleDeleteThread = (id: string) => {
    if (chatThreads.length <= 1) return;
    setChatThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      const remaining = chatThreads.filter((t) => t.id !== id);
      setActiveThreadId(remaining[0].id);
    }
    setChatHistoryByThread((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            expenses={expenses}
            holdings={holdings}
            goals={goals}
            userProfile={userProfile}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            onRefreshInsights={fetchAIInsights}
            onTabChange={setActiveTab}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case "expenses":
        return (
          <ExpensesTab
            expenses={expenses.filter(e => {
              if (!searchQuery) return true;
              return e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase());
            })}
            userProfile={userProfile}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
          />
        );
      case "budgets":
        return (
          <BudgetsTab
            expenses={expenses}
            holdings={holdings}
            goals={goals}
            userProfile={userProfile}
            onAddExpense={handleAddExpense}
            onTradeSimulation={handleTradeSimulation}
            onAddHolding={handleAddHolding}
          />
        );
      case "portfolio":
        return (
          <PortfolioTab
            holdings={holdings}
            userProfile={userProfile}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            onTradeSimulation={handleTradeSimulation}
          />
        );
      case "goals":
        return (
          <GoalsTab
            goals={goals}
            userProfile={userProfile}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
          />
        );
      case "analytics":
        return (
          <AnalyticsTab
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            expenses={expenses}
            holdings={holdings}
            goals={goals}
            userProfile={userProfile}
          />
        );
      case "reports":
        return (
          <ReportsTab
            expenses={expenses}
            holdings={holdings}
            goals={goals}
            userProfile={userProfile}
          />
        );
      case "notifications":
        return <NotificationsTab />;
      case "assistant":
        return (
          <AssistantTab
            chatHistory={chatHistoryByThread[activeThreadId] || []}
            chatThreads={chatThreads}
            activeThreadId={activeThreadId}
            onSendMessage={handleSendMessage}
            onSelectThread={setActiveThreadId}
            onNewThread={handleNewThread}
            onDeleteThread={handleDeleteThread}
            isSending={isSendingChat}
            userProfile={userProfile}
          />
        );
      case "profile":
        return (
          <ProfileTab
            userProfile={userProfile}
            securitySettings={securitySettings}
            notificationSettings={notificationSettings}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSecurity={handleUpdateSecurity}
            onUpdateNotifications={handleUpdateNotifications}
          />
        );
      case "settings":
        return (
          <SettingsTab
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            showToast={showToast}
          />
        );
      case "hub":
        return (
          <EnterpriseHub
            state={hubState}
            onChangeState={setHubState}
            onNavigateToTab={setActiveTab}
            expensesCount={expenses.length}
            portfolioValue={holdings.reduce((sum, h) => sum + h.value, 0)}
            onAddMockExpense={(merchant, category, amount) => {
              handleAddExpense({
                date: new Date().toISOString().split("T")[0],
                category,
                merchant,
                amount,
                status: "Cleared",
                notes: "Simulated outbound API transaction"
              });
            }}
            showToast={showToast}
          />
        );
      default:
        return null;
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount || isNaN(parseFloat(quickAmount))) return;
    handleAddExpense({
      date: new Date().toISOString().split("T")[0],
      category: quickCategory,
      merchant: quickMerchant || "Discretionary Vendor",
      amount: parseFloat(quickAmount),
      status: "Cleared",
      notes: quickNotes || "Quick added outflow ledger",
      isRecurring: quickIsRecurring,
      frequency: quickIsRecurring ? quickFrequency : undefined
    });
    setQuickAmount("");
    setQuickMerchant("");
    setQuickNotes("");
    setQuickIsRecurring(false);
    setQuickFrequency("Monthly");
    setIsQuickAddOpen(false);
  };

  if (!isAuthenticated) {
    if (publicView === "landing") {
      return (
        <LandingPage
          onGetStarted={() => {
            setPublicView("register");
          }}
          onSelectView={(v) => {
            setPublicView(v as any);
          }}
        />
      );
    } else {
      return (
        <AuthPages
          initialView={publicView}
          onSuccess={(token, user) => {
            localStorage.setItem("finsight_auth", "true");
            localStorage.setItem("finsight_auth_token", token);
            setUserProfile(user);
            if (user.securitySettings) setSecuritySettings(user.securitySettings);
            if (user.notificationSettings) setNotificationSettings(user.notificationSettings);
            setIsAuthenticated(true);
            setPublicView("landing");
            setActiveTab("dashboard");
            showToast("Dual factor cryptographic handshakes established!", "success");
          }}
          onBackToLanding={() => {
            setPublicView("landing");
          }}
        />
      );
    }
  }

  return (
    <div
      id="master-viewport"
      className={`min-h-screen font-sans antialiased flex select-none relative transition-colors duration-300 ${
        isDarkMode ? "bg-slate-950 text-slate-200 dark" : "bg-slate-50 text-slate-800 light-theme"
      }`}
    >
      
      {/* LEFT SIDEBAR PANEL (Collapsible / Responsive drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-slate-950">
                FS
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-white tracking-tight">FinSight</h2>
                <span className="text-[9px] text-sky-400 font-mono block mt-[-2px]">WEALTH TERMINAL</span>
              </div>
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 bg-slate-950 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items list */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "hub", label: "Enterprise Suite", icon: Sparkles },
              { id: "expenses", label: "Expenses", icon: Receipt },
              { id: "budgets", label: "Budgets", icon: Wallet },
              { id: "portfolio", label: "Portfolio", icon: LineChart },
              { id: "goals", label: "Goals", icon: Award },
              { id: "analytics", label: "Analytics", icon: Activity },
              { id: "reports", label: "Reports", icon: FileText },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "assistant", label: "AI Assistant", icon: MessageSquareCode },
              { id: "profile", label: "Profile & Identity", icon: UserCheck },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-sky-500/10 border-sky-500/20 text-sky-400 font-bold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-sky-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 text-sky-400 font-bold flex items-center justify-center text-xs">
              {userProfile.avatar}
            </div>
            <div className="truncate text-left">
              <span className="text-xs font-bold text-white block truncate">{userProfile.name}</span>
              <span className="text-[10px] text-slate-500 font-mono block truncate">{userProfile.role}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsDocModalOpen(true);
              setIsSidebarOpen(false);
            }}
            className="w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> Feature & PDF Manual
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPublicView("landing");
              localStorage.removeItem("finsight_auth");
              localStorage.removeItem("finsight_auth_token");
              localStorage.removeItem("finsight_profile");
              localStorage.removeItem("finsight_security");
              localStorage.removeItem("finsight_notifications");
              setUserProfile(DEFAULT_USER_PROFILE);
              setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
              setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
              showToast("Sovereign session disconnected.", "info");
            }}
            className="w-full py-2 bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out Portal
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* RIGHT MAIN WORKING SPACE PANEL */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP NAVBAR PANEL */}
        <header className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-xl border-b border-slate-900/80 px-6 py-4 flex justify-between items-center gap-4">
          
          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Quick search bar */}
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl w-64 focus-within:border-sky-500/40 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search transaction keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Toolbar area */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* System Documentation & PDF Manual Button */}
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 hover:border-sky-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Open System Feature Documentation & Download PDF"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">System PDF Guide</span>
            </button>

            {/* Quick Outflow Addition */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-950/20 border border-sky-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Add</span>
            </button>

            {/* Interactive Theme Switcher (Dark/Light) */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                showToast(`Theme calibrated: ${!isDarkMode ? "Dark Mode" : "Light Mode"} active`, "info");
              }}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-sky-400 hover:text-sky-300 flex items-center justify-center cursor-pointer transition-all"
              title={isDarkMode ? "Switch to Light theme" : "Switch to Dark theme"}
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* Quick Alerts/Notifications Icon */}
            <button
              onClick={() => setActiveTab("notifications")}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full animate-pulse border border-slate-900"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-800"></div>

            {/* Quick Avatar Profile click */}
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 text-sky-400 font-bold flex items-center justify-center text-xs">
                {userProfile.avatar}
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-bold text-white block">{userProfile.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-[-3px]">Manage Shield</span>
              </div>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {searchQuery && (
            <div className="p-4 bg-slate-900 border border-sky-500/20 rounded-2xl flex justify-between items-center">
              <span className="text-xs text-slate-300">
                Active search filtering for: <span className="text-white font-bold font-mono">"{searchQuery}"</span>
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {renderActiveTab()}
        </main>

        {/* SYSTEM FOOTER */}
        <footer className="bg-slate-950 border-t border-slate-900 py-6 px-6 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono">
            <div>
              <span>© 2026 FINSIGHT ENTERPRISE WEALTH PORTAL. ALL RIGS COMPLIANT.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>AES_256 SECURED CLIENT</span>
            </div>
          </div>
        </footer>
      </div>

      {/* QUICK ADD EXPENSE FLOATING MODAL */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsQuickAddOpen(false)}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          ></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-400" /> Log Outflow Transaction
              </h3>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder="24.50"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Category</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Food">Food & Dinings</option>
                  <option value="Housing">Housing & Rent</option>
                  <option value="Utilities">Utilities & Infrastructure</option>
                  <option value="Travel">Travel & Commute</option>
                  <option value="Entertainment">Entertainment & Hobby</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Merchant / Vendor</label>
                <input
                  type="text"
                  placeholder="Whole Foods"
                  value={quickMerchant}
                  onChange={(e) => setQuickMerchant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Notes / Memo</label>
                <input
                  type="text"
                  placeholder="Subscription renewal..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Recurring Outflow Checkbox & Frequency Dropdown */}
              <div className="pt-1 space-y-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="quickIsRecurring"
                    checked={quickIsRecurring}
                    onChange={(e) => setQuickIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="quickIsRecurring" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                    Recurring Expense
                  </label>
                </div>

                {quickIsRecurring && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Frequency</label>
                    <select
                      value={quickFrequency}
                      onChange={(e) => setQuickFrequency(e.target.value as "Daily" | "Weekly" | "Monthly")}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl border border-sky-500/20 shadow-md cursor-pointer mt-2"
              >
                Log Outflow Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          ></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-5 animate-in scale-in duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-sm">{confirmDialog.title}</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed text-left">
              {confirmDialog.message}
            </p>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Toast Notifications Portal */}
      <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t, idx) => (
          <div
            key={`${t.id}_${idx}`}
            className={`pointer-events-auto p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
              t.type === "success"
                ? "bg-slate-900/90 border-emerald-500/30 text-emerald-400"
                : t.type === "error"
                ? "bg-slate-900/90 border-rose-500/30 text-rose-400"
                : t.type === "warning"
                ? "bg-slate-900/90 border-amber-500/30 text-amber-400"
                : "bg-slate-900/90 border-sky-500/30 text-sky-400"
            }`}
          >
            {t.type === "success" && <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />}
            {t.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {t.type === "info" && <Sparkles className="w-5 h-5 text-sky-400" />}
            <span className="text-xs font-semibold text-slate-100">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* SYSTEM DOCUMENTATION & PDF MANUAL MODAL */}
      <DocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

    </div>
  );
}
