import React from "react";
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Sparkles, Plus, Play, Info, 
  Eye, Bell, Shield, Layers, Calendar, DollarSign, Calculator, HelpCircle, FileText, 
  TrendingDown, Trash2, Check, Clock, AlertTriangle, ListFilter, Target, Flame, Grid,
  Newspaper, Landmark, BookOpen, AlertCircle, Edit3
} from "lucide-react";
import { Holding, UserProfile, Goal, safeParseJSON } from "../types";
import { getCurrencySymbol, getCurrencyRate, formatCurrency } from "../utils/currency";
import { dispatchDynamicNotification } from "../utils/notifDispatcher";

// Enhanced Premium Holding representing all 11 asset classes
export interface PremiumHolding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  type: 'Stock' | 'ETF' | 'Mutual Fund' | 'Crypto' | 'Gold' | 'Silver' | 'Fixed Deposit' | 'PPF' | 'Bonds' | 'NPS' | 'Real Estate';
  category: string; // e.g. Technology, Commodities, Sovereign, Fixed Income, Property
  purchaseDate: string;
  dividendYield: number; // annual %
  dayChangePercent: number; // simulated daily gain/loss
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  goalId?: string; // Mapped to a financial goal
}

// Watchlist Asset Interface
interface WatchAsset {
  symbol: string;
  name: string;
  type: string;
  price: number;
  change: number;
  sentiment: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish';
}

// Custom Investment Journal entry
interface JournalEntry {
  id: string;
  date: string;
  title: string;
  assetClass: string;
  content: string;
  thesisType: 'Long Term' | 'Tactical' | 'Hedging' | 'Speculative';
}

// Custom Alerts
interface InvestmentAlert {
  id: string;
  symbol: string;
  type: 'Price Trigger' | 'Dividend Alert';
  condition: 'Above' | 'Below' | 'Payout Received';
  value: number;
  status: 'Active' | 'Triggered';
}

interface PortfolioTabProps {
  holdings: Holding[];
  userProfile: UserProfile;
  insights: any;
  isLoadingInsights: boolean;
  onTradeSimulation: (symbol: string, type: 'buy' | 'sell', shares: number) => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  holdings: standardHoldings,
  userProfile,
  insights,
  isLoadingInsights,
  onTradeSimulation,
}) => {
  const currencySymbol = getCurrencySymbol(userProfile?.currency);
  const currencyRate = getCurrencyRate(userProfile?.currency);

  // Navigation for Sub-modules
  const [subView, setSubView] = React.useState<"overview" | "allocation" | "watchlist" | "timeline" | "calculator" | "comparison" | "journal">("overview");

  // Premium Holdings state loaded from local storage or pre-seeded with 12 institutional-grade assets representing all 11 asset classes
  const [premiumHoldings, setPremiumHoldings] = React.useState<PremiumHolding[]>(() => {
    return safeParseJSON<PremiumHolding[]>(localStorage.getItem("finsight_premium_holdings"), [
      { symbol: "AAPL", name: "Apple Inc. (Stock)", shares: 50, avgPrice: 170.00, currentPrice: 192.50, value: 9625, gainLoss: 1125, gainLossPercent: 13.24, type: "Stock", category: "Technology", purchaseDate: "2025-11-12", dividendYield: 0.52, dayChangePercent: 1.45, goalId: "g1" },
      { symbol: "NVDA", name: "NVIDIA Corporation (Stock)", shares: 25, avgPrice: 110.00, currentPrice: 125.40, value: 3135, gainLoss: 385, gainLossPercent: 14.00, type: "Stock", category: "Semiconductors", purchaseDate: "2026-02-18", dividendYield: 0.03, dayChangePercent: 4.82, goalId: "g1" },
      { symbol: "VOO", name: "Vanguard S&P 500 ETF (ETF)", shares: 20, avgPrice: 420.00, currentPrice: 510.30, value: 10206, gainLoss: 1806, gainLossPercent: 21.50, type: "ETF", category: "Broad Market", purchaseDate: "2025-05-14", dividendYield: 1.32, dayChangePercent: 0.78, goalId: "g2" },
      { symbol: "VTSAX", name: "Vanguard Total Stock Mutual Fund", shares: 70, avgPrice: 110.00, currentPrice: 122.10, value: 8547, gainLoss: 847, gainLossPercent: 11.00, type: "Mutual Fund", category: "Broad Market", purchaseDate: "2025-08-10", dividendYield: 1.41, dayChangePercent: 0.54, goalId: "g2" },
      { symbol: "BTC", name: "Bitcoin Core (Crypto)", shares: 1.85, avgPrice: 42000.00, currentPrice: 67420.00, value: 124727, gainLoss: 47027, gainLossPercent: 60.52, type: "Crypto", category: "Digital Asset", purchaseDate: "2025-01-05", dividendYield: 0.00, dayChangePercent: -2.10, goalId: "g2" },
      { symbol: "PHYS_GOLD", name: "Sovereign Gold Bonds (Gold)", shares: 15, avgPrice: 65.00, currentPrice: 78.20, value: 1173, gainLoss: 198, gainLossPercent: 20.31, type: "Gold", category: "Precious Metals", purchaseDate: "2025-03-22", dividendYield: 2.50, dayChangePercent: 1.22, goalId: "g4" },
      { symbol: "SILVER_BAR", name: "Physical Silver Bullion", shares: 100, avgPrice: 22.00, currentPrice: 28.50, value: 2850, gainLoss: 650, gainLossPercent: 29.54, type: "Silver", category: "Precious Metals", purchaseDate: "2025-04-11", dividendYield: 0.00, dayChangePercent: 0.85 },
      { symbol: "CHASE_FD_5", name: "JP Morgan Chase Fixed Deposit", shares: 1, avgPrice: 10000.00, currentPrice: 10430.00, value: 10430, gainLoss: 430, gainLossPercent: 4.30, type: "Fixed Deposit", category: "Banking", purchaseDate: "2025-09-01", dividendYield: 5.20, dayChangePercent: 0.01 },
      { symbol: "PPF_GOV", name: "Public Provident Fund Account", shares: 1, avgPrice: 5000.00, currentPrice: 5355.00, value: 5355, gainLoss: 355, gainLossPercent: 7.10, type: "PPF", category: "Sovereign Savings", purchaseDate: "2025-06-01", dividendYield: 7.10, dayChangePercent: 0.00, goalId: "g2" },
      { symbol: "US10Y_BOND", name: "US Gov Treasury 10Y Bonds", shares: 15, avgPrice: 950.00, currentPrice: 980.00, value: 14700, gainLoss: 450, gainLossPercent: 3.15, type: "Bonds", category: "Sovereign Debt", purchaseDate: "2025-10-15", dividendYield: 4.25, dayChangePercent: 0.32, goalId: "g4" },
      { symbol: "NPS_CORP", name: "National Pension System Scheme", shares: 1, avgPrice: 6200.00, currentPrice: 7110.00, value: 7110, gainLoss: 910, gainLossPercent: 14.67, type: "NPS", category: "Retirement Savings", purchaseDate: "2025-02-14", dividendYield: 0.00, dayChangePercent: 0.45, goalId: "g2" },
      { symbol: "REIT_VNQ", name: "Vanguard Real Estate REIT", shares: 120, avgPrice: 82.00, currentPrice: 94.60, value: 11352, gainLoss: 1512, gainLossPercent: 15.37, type: "Real Estate", category: "Property", purchaseDate: "2025-07-20", dividendYield: 4.10, dayChangePercent: -0.65, goalId: "g1" }
    ]);
  });

  // Watchlist state with localStorage persistence
  const [watchlist, setWatchlist] = React.useState<WatchAsset[]>(() => {
    return safeParseJSON<WatchAsset[]>(localStorage.getItem("finsight_watchlist_tickers"), [
      { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 220.10, change: 2.40, sentiment: "Bullish" },
      { symbol: "ETH", name: "Ethereum Mainnet", type: "Crypto", price: 3445.80, change: -1.20, sentiment: "Neutral" },
      { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", price: 162.50, change: 4.82, sentiment: "Strongly Bullish" },
      { symbol: "GLD", name: "SPDR Gold Trust", type: "ETF", price: 218.40, change: 0.82, sentiment: "Bullish" },
      { symbol: "O", name: "Realty Income Corp REIT", type: "Stock", price: 55.20, change: -0.55, sentiment: "Bearish" }
    ]);
  });

  React.useEffect(() => {
    localStorage.setItem("finsight_watchlist_tickers", JSON.stringify(watchlist));
  }, [watchlist]);

  // Add Ticker Modal State
  const [showAddTickerModal, setShowAddTickerModal] = React.useState(false);
  const [newTickerSymbol, setNewTickerSymbol] = React.useState("");
  const [newTickerName, setNewTickerName] = React.useState("");
  const [newTickerType, setNewTickerType] = React.useState<string>("Stock");
  const [newTickerPrice, setNewTickerPrice] = React.useState("150.00");
  const [newTickerSentiment, setNewTickerSentiment] = React.useState<'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish'>("Bullish");

  const handleAddTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerSymbol.trim()) {
      triggerToast("Please enter a ticker symbol", "warning");
      return;
    }
    const sym = newTickerSymbol.trim().toUpperCase();
    const priceNum = parseFloat(newTickerPrice) || 120.00;

    const newWatch: WatchAsset = {
      symbol: sym,
      name: newTickerName.trim() || `${sym} Asset`,
      type: newTickerType,
      price: priceNum,
      change: parseFloat(((Math.random() * 5) - 1.5).toFixed(2)),
      sentiment: newTickerSentiment
    };

    setWatchlist(prev => {
      const exists = prev.some(w => w.symbol === sym);
      if (exists) {
        return prev.map(w => w.symbol === sym ? newWatch : w);
      }
      return [newWatch, ...prev];
    });

    triggerToast(`Registered ticker ${sym} on watchlist!`, "success");
    setShowAddTickerModal(false);
    setNewTickerSymbol("");
    setNewTickerName("");
    setNewTickerPrice("150.00");
  };

  // Investment Journal entries
  const [journal, setJournal] = React.useState<JournalEntry[]>([
    { id: "j1", date: "2026-07-10", title: "Acquired Sovereign Gold to hedge inflationary tech skews", assetClass: "Gold", thesisType: "Hedging", content: "Added SGB positions to baseline sovereign weights. This mitigates downside corrections in the digital compute sectors while pocketing a secondary 2.5% yield." },
    { id: "j2", date: "2026-06-22", title: "Increased semiconductors holding via NVDA long position", assetClass: "Stock", thesisType: "Long Term", content: "Nvidia exhibits massive pricing power. Standard multi-tier customer scaling is solid. Averaged up at $110. Thesis remains fully bullish on Q3 servers rollout." },
    { id: "j3", date: "2026-05-14", title: "Enacted annual PPF retirement contribution", assetClass: "PPF", thesisType: "Long Term", content: "PPF compounding at 7.1% guaranteed tax-free returns provides a massive portfolio stabilizer. Excellent offset to the volatile cryptocurrency allocations." }
  ]);

  // Alerts State
  const [alerts, setAlerts] = React.useState<InvestmentAlert[]>([
    { id: "a1", symbol: "TSLA", type: "Price Trigger", condition: "Above", value: 240.00, status: "Active" },
    { id: "a2", symbol: "ETH", type: "Price Trigger", condition: "Below", value: 3000.00, status: "Active" },
    { id: "a3", symbol: "AAPL", type: "Dividend Alert", condition: "Payout Received", value: 0.52, status: "Triggered" }
  ]);

  // Sync premium holdings to LocalStorage
  React.useEffect(() => {
    localStorage.setItem("finsight_premium_holdings", JSON.stringify(premiumHoldings));
  }, [premiumHoldings]);

  // Toast Notifications
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: "success" | "info" | "warning" }[]>([]);
  const triggerToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = "p_toast_" + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Trade Modal State
  const [isTradeModalOpen, setIsTradeModalOpen] = React.useState(false);
  const [tradeSymbol, setTradeSymbol] = React.useState("");
  const [tradeAction, setTradeAction] = React.useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = React.useState("5");
  const [tradeAssetType, setTradeAssetType] = React.useState<PremiumHolding['type']>("Stock");
  const [customExecutionPrice, setCustomExecutionPrice] = React.useState("");

  // Monthly Estimated Execution Anchor state
  const [monthlyExecutionAnchor, setMonthlyExecutionAnchor] = React.useState<number>(() => {
    return safeParseJSON<number>(localStorage.getItem("finsight_monthly_execution_anchor"), 1500);
  });
  const [showEditAnchorModal, setShowEditAnchorModal] = React.useState(false);
  const [anchorInputVal, setAnchorInputVal] = React.useState(monthlyExecutionAnchor.toString());

  React.useEffect(() => {
    localStorage.setItem("finsight_monthly_execution_anchor", monthlyExecutionAnchor.toString());
  }, [monthlyExecutionAnchor]);

  // Custom Alerts Form State
  const [alertSymbol, setAlertSymbol] = React.useState("AAPL");
  const [alertType, setAlertType] = React.useState<'Price Trigger' | 'Dividend Alert'>('Price Trigger');
  const [alertCondition, setAlertCondition] = React.useState<'Above' | 'Below' | 'Payout Received'>('Above');
  const [alertValue, setAlertValue] = React.useState("");

  // Journal Entry Form State
  const [newJournalTitle, setNewJournalTitle] = React.useState("");
  const [newJournalAssetClass, setNewJournalAssetClass] = React.useState("Stock");
  const [newJournalThesis, setNewJournalThesis] = React.useState<'Long Term' | 'Tactical' | 'Hedging' | 'Speculative'>("Long Term");
  const [newJournalContent, setNewJournalContent] = React.useState("");

  // Return Calculator Form State
  const [calcPrincipal, setCalcPrincipal] = React.useState(10000);
  const [calcSIP, setCalcSIP] = React.useState(500);
  const [calcRate, setCalcRate] = React.useState(12);
  const [calcYears, setCalcYears] = React.useState(10);

  // Asset Comparison Selected Asset Classes
  const [compareAsset1, setCompareAsset1] = React.useState<PremiumHolding['type']>("Stock");
  const [compareAsset2, setCompareAsset2] = React.useState<PremiumHolding['type']>("Gold");

  // Calculated Core Portfolio KPIs
  const totalValue = premiumHoldings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  const totalCost = premiumHoldings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
  const netGainLoss = totalValue - totalCost;
  const netGainLossPercent = totalCost > 0 ? (netGainLoss / totalCost) * 100 : 0;
  
  // Daily Gain Loss simulation based on daily % weights
  const dailyGainLoss = premiumHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice * (h.dayChangePercent / 100)), 0);
  const dailyGainLossPercent = totalValue > 0 ? (dailyGainLoss / totalValue) * 100 : 0;

  // Group allocations by 11 types
  const assetTypes: PremiumHolding['type'][] = [
    'Stock', 'ETF', 'Mutual Fund', 'Crypto', 'Gold', 'Silver', 'Fixed Deposit', 'PPF', 'Bonds', 'NPS', 'Real Estate'
  ];

  const typeTotals = assetTypes.reduce((acc, t) => {
    acc[t] = premiumHoldings.filter(h => h.type === t).reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
    return acc;
  }, {} as Record<string, number>);

  // Compute Diversification Score (Entropy score out of 100)
  const computedDiversificationScore = React.useMemo(() => {
    if (totalValue <= 0) return 0;
    let sumSquares = 0;
    assetTypes.forEach(t => {
      const weight = (typeTotals[t] || 0) / totalValue;
      sumSquares += weight * weight;
    });
    // Herfindahl-Hirschman Index (HHI) variant scaled out of 100
    // Lower HHI means higher diversification.
    const hhi = sumSquares; 
    const score = Math.max(10, Math.round((1 - hhi) * 100 + 10));
    return Math.min(score, 98); // Max 98 score
  }, [totalValue, typeTotals]);

  // Market News feed panel
  const marketNews = [
    { id: 1, title: "NVIDIA semiconductor orders reach absolute record highs on massive sovereign AI datacenter scaling.", sentiment: "Strongly Bullish", impact: "Tech +4.8%", time: "12 mins ago" },
    { id: 2, title: "Gold prices hit structural resistance at $2,420 as bullion hedges against global compute volatility.", sentiment: "Bullish", impact: "Precious Metals +1.2%", time: "1 hour ago" },
    { id: 3, title: "Federal Reserve hints at terminal interest rate stabilization; Bond yields experience minimal variance.", sentiment: "Neutral", impact: "Fixed Income +0.1%", time: "3 hours ago" },
    { id: 4, title: "Cryptocurrency networks stabilize in local bounds as long-term ETF custody inflows anchor spot depth.", sentiment: "Neutral", impact: "Digital Assets -0.4%", time: "6 hours ago" },
    { id: 5, title: "Manhattan prime commercial real estate rents demonstrate defensive stability as vacancy matrices peak.", sentiment: "Bearish", impact: "Property -0.8%", time: "1 day ago" }
  ];

  // Top gainers/losers of current pre-seeded portfolio
  const topGainer = [...premiumHoldings].sort((a, b) => b.dayChangePercent - a.dayChangePercent)[0];
  const topLoser = [...premiumHoldings].sort((a, b) => a.dayChangePercent - b.dayChangePercent)[0];

  // Map allocations to general Goals
  const mappedGoalAllocations = React.useMemo(() => {
    const goalsList = [
      { id: "g1", name: "New Home Downpayment", target: 80000, current: 45000 },
      { id: "g2", name: "Retirement Fund Compound", target: 500000, current: 120000 },
      { id: "g4", name: "Safety Net Cushion", target: 25000, current: 25000 }
    ];

    return goalsList.map(goal => {
      // Find sum of holdings mapped to this goal
      const mappedSum = premiumHoldings
        .filter(h => h.goalId === goal.id)
        .reduce((sum, h) => sum + h.shares * h.currentPrice, 0);

      const combinedSum = goal.current + mappedSum;
      const progressPercent = Math.min(100, Math.round((combinedSum / goal.target) * 100));

      return {
        ...goal,
        portfolioContribution: mappedSum,
        totalProgress: combinedSum,
        progressPercent
      };
    });
  }, [premiumHoldings]);

  // Execute trade simulation
  const handleExecuteTrade = (ev: React.FormEvent) => {
    ev.preventDefault();
    const sharesNum = parseFloat(tradeShares);
    if (!tradeSymbol || isNaN(sharesNum) || sharesNum <= 0) {
      triggerToast("Invalid order inputs", "warning");
      return;
    }

    setPremiumHoldings(prev => {
      // Check if symbol exists
      const existingIdx = prev.findIndex(h => h.symbol.toUpperCase() === tradeSymbol.toUpperCase());
      
      let price = 100.00; // fallback default
      if (customExecutionPrice && !isNaN(parseFloat(customExecutionPrice)) && parseFloat(customExecutionPrice) > 0) {
        price = parseFloat(customExecutionPrice);
      } else if (existingIdx !== -1) {
        price = prev[existingIdx].currentPrice;
      } else {
        // Mock current price based on category
        if (tradeAssetType === 'Crypto') price = 3450.00;
        if (tradeAssetType === 'Gold') price = 78.00;
        if (tradeAssetType === 'Silver') price = 28.00;
        if (tradeAssetType === 'Real Estate') price = 95.00;
      }

      if (tradeAction === 'sell') {
        if (existingIdx === -1 || prev[existingIdx].shares < sharesNum) {
          triggerToast("Insufficient units in portfolio to sell", "warning");
          return prev;
        }

        const h = prev[existingIdx];
        const newShares = h.shares - sharesNum;
        if (newShares === 0) {
          // Remove from holding
          triggerToast(`Sovereign position in ${tradeSymbol} fully cleared!`, "info");
          return prev.filter((_, idx) => idx !== existingIdx);
        } else {
          // Adjust holding
          const updated = [...prev];
          const val = newShares * h.currentPrice;
          const cost = newShares * h.avgPrice;
          const gain = val - cost;
          updated[existingIdx] = {
            ...h,
            shares: newShares,
            value: parseFloat(val.toFixed(2)),
            gainLoss: parseFloat(gain.toFixed(2)),
            gainLossPercent: cost > 0 ? parseFloat(((gain / cost) * 100).toFixed(2)) : 0
          };
          triggerToast(`Trimming complete: Sold ${sharesNum} shares of ${tradeSymbol}`, "success");
          return updated;
        }
      } else {
        // Buy action
        if (existingIdx !== -1) {
          const h = prev[existingIdx];
          const newShares = h.shares + sharesNum;
          const newCost = (h.shares * h.avgPrice) + (sharesNum * price);
          const newAvgPrice = newShares > 0 ? newCost / newShares : 0;
          const val = newShares * h.currentPrice;
          const gain = val - newCost;

          const updated = [...prev];
          updated[existingIdx] = {
            ...h,
            shares: newShares,
            avgPrice: parseFloat(newAvgPrice.toFixed(2)),
            value: parseFloat(val.toFixed(2)),
            gainLoss: parseFloat(gain.toFixed(2)),
            gainLossPercent: newCost > 0 ? parseFloat(((gain / newCost) * 100).toFixed(2)) : 0
          };
          triggerToast(`Acquisition processed: Added ${sharesNum} shares to ${tradeSymbol}`, "success");
          return updated;
        } else {
          // Create new asset entry
          const newAsset: PremiumHolding = {
            symbol: tradeSymbol.toUpperCase(),
            name: `${tradeSymbol.toUpperCase()} Institutional Asset`,
            shares: sharesNum,
            avgPrice: price,
            currentPrice: price,
            value: sharesNum * price,
            gainLoss: 0,
            gainLossPercent: 0,
            type: tradeAssetType,
            category: tradeAssetType === 'Crypto' ? 'Digital Asset' : tradeAssetType === 'Gold' || tradeAssetType === 'Silver' ? 'Precious Metals' : 'Sovereign Debt',
            purchaseDate: new Date().toISOString().split("T")[0],
            dividendYield: tradeAssetType === 'Stock' || tradeAssetType === 'ETF' ? 1.5 : 0,
            dayChangePercent: 0
          };
          triggerToast(`Sovereign asset registered: Added ${sharesNum} units of ${tradeSymbol.toUpperCase()}`, "success");
          return [...prev, newAsset];
        }
      }
    });

    // Mirror standard order simulation if standard holdings has this symbol
    if (standardHoldings.some(h => h.symbol === tradeSymbol.toUpperCase())) {
      onTradeSimulation(tradeSymbol.toUpperCase(), tradeAction, sharesNum);
    }

    setIsTradeModalOpen(false);
  };

  // Add Custom Alert Handler
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(alertValue);
    if (isNaN(val) || val <= 0) {
      triggerToast("Provide a valid trigger weight parameter", "warning");
      return;
    }
    const newAlert: InvestmentAlert = {
      id: "a_" + Date.now(),
      symbol: alertSymbol.toUpperCase(),
      type: alertType,
      condition: alertCondition,
      value: val,
      status: "Active"
    };
    setAlerts([newAlert, ...alerts]);
    setAlertValue("");

    dispatchDynamicNotification({
      id: `notif-port-${newAlert.id}`,
      type: "investment",
      title: `📈 Target Price Alarm Compiled: ${alertSymbol.toUpperCase()}`,
      desc: `Dynamic monitoring active: Alert registered when ${alertSymbol.toUpperCase()} price matches ${alertCondition} $${val.toFixed(2)}.`,
      priority: "medium",
      category: "Financial Status",
      actionText: "View Portfolio Watchlist",
      actionType: "rebalance"
    });

    triggerToast(`Alert registered & dispatched: Notify when ${alertSymbol.toUpperCase()} matches condition!`, "success");
  };

  // Add Journal Entry Handler
  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalTitle.trim() || !newJournalContent.trim()) {
      triggerToast("Please provide all journal content criteria", "warning");
      return;
    }
    const newEntry: JournalEntry = {
      id: "j_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      title: newJournalTitle.trim(),
      assetClass: newJournalAssetClass,
      thesisType: newJournalThesis,
      content: newJournalContent.trim()
    };
    setJournal([newEntry, ...journal]);
    setNewJournalTitle("");
    setNewJournalContent("");
    triggerToast("Investment research log registered in journal", "success");
  };

  // Rebalance suggestions logic based on target ranges
  const rebalancingSuggestions = React.useMemo(() => {
    if (totalValue <= 0) return [];
    
    // Target Allocations for Aggressive: 60% Equity (Stock/ETF/Mutual), 20% Crypto, 10% Gold/Silver, 10% Fixed Income/Bonds/FD/PPF/NPS/Real Estate
    const currentEquityWeight = premiumHoldings.filter(h => h.type === 'Stock' || h.type === 'ETF' || h.type === 'Mutual Fund').reduce((sum, h) => sum + h.shares * h.currentPrice, 0) / totalValue;
    const currentCryptoWeight = premiumHoldings.filter(h => h.type === 'Crypto').reduce((sum, h) => sum + h.shares * h.currentPrice, 0) / totalValue;
    const currentGoldWeight = premiumHoldings.filter(h => h.type === 'Gold' || h.type === 'Silver').reduce((sum, h) => sum + h.shares * h.currentPrice, 0) / totalValue;
    const currentOtherWeight = 1 - currentEquityWeight - currentCryptoWeight - currentGoldWeight;

    const suggestions = [];

    if (currentEquityWeight < 0.50) {
      suggestions.push({
        action: "Buy / Accumulate Broad-Market Equity",
        description: `Your Equity weight is currently ${(currentEquityWeight * 100).toFixed(1)}% which is below your target 60%. Consider indexing SPY or VTSAX.`,
        urgency: "Moderate"
      });
    } else if (currentEquityWeight > 0.70) {
      suggestions.push({
        action: "Trim Volatile Stock Concentrations",
        description: `Equity weight stands at ${(currentEquityWeight * 100).toFixed(1)}%. Trim tech skews to secure gains into defensive fixed deposits.`,
        urgency: "High"
      });
    }

    if (currentCryptoWeight > 0.25) {
      suggestions.push({
        action: "Rebalance Highly Volatile Cryptos",
        description: `Cryptocurrency weights stand at ${(currentCryptoWeight * 100).toFixed(1)}%. This exceeds defensive Aggressive boundaries (Target: 20%). Trim BTC and reallocate to US Treasuries.`,
        urgency: "High"
      });
    }

    if (currentGoldWeight < 0.05) {
      suggestions.push({
        action: "Accumulate Gold Bullion Hedgers",
        description: `Your Precious Metals weights stand at ${(currentGoldWeight * 100).toFixed(1)}%. Increase holding to at least 5% to safeguard purchasing power.`,
        urgency: "Low"
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        action: "Sovereign Target Equilibrium Reached",
        description: "Your active allocations are precisely aligned within neutral risk matrix parameters.",
        urgency: "Compliant"
      });
    }

    return suggestions;
  }, [totalValue, premiumHoldings]);

  // Asset Comparison Matrix Preseeded Criteria
  const assetClassMatrix: Record<PremiumHolding['type'], { returnRate: string, risk: string, liquidity: string, lockIn: string, taxBenefit: string }> = {
    Stock: { returnRate: "12% - 18%", risk: "High", liquidity: "High (T+1)", lockIn: "None", taxBenefit: "LTCG @ 10-20%" },
    ETF: { returnRate: "10% - 15%", risk: "Moderate-High", liquidity: "High (T+1)", lockIn: "None", taxBenefit: "LTCG @ 10-20%" },
    'Mutual Fund': { returnRate: "11% - 16%", risk: "Moderate-High", liquidity: "High (T+2)", lockIn: "None (ELSS: 3Y)", taxBenefit: "ELSS Tax Savings Sec 80C" },
    Crypto: { returnRate: "20% - 80%", risk: "Extreme", liquidity: "Instant (24/7)", lockIn: "None", taxBenefit: "Flat 30% on gains" },
    Gold: { returnRate: "7% - 9%", risk: "Low", liquidity: "High", lockIn: "None (SGB: 5-8Y)", taxBenefit: "Tax-free maturity on SGB" },
    Silver: { returnRate: "6% - 10%", risk: "Moderate", liquidity: "High", lockIn: "None", taxBenefit: "LTCG after 3 Years" },
    'Fixed Deposit': { returnRate: "5% - 7.5%", risk: "Extremely Low", liquidity: "Moderate (Penalty)", lockIn: "None (Tax Saver: 5Y)", taxBenefit: "Interest taxable at slab" },
    PPF: { returnRate: "7.1% Guaranteed", risk: "None (Sovereign)", liquidity: "Low (Partial)", lockIn: "15 Years", taxBenefit: "Exempt-Exempt-Exempt (EEE)" },
    Bonds: { returnRate: "6% - 8.5%", risk: "Low-Moderate", liquidity: "Moderate", lockIn: "Maturity", taxBenefit: "Interest taxable, SGB tax-free" },
    NPS: { returnRate: "9% - 12%", risk: "Moderate", liquidity: "Extremely Low", lockIn: "Till Age 60", taxBenefit: "Extra Sec 80CCD tax rebate" },
    'Real Estate': { returnRate: "8% - 14%", risk: "Moderate", liquidity: "Low", lockIn: "Generational", taxBenefit: "Indexation benefits, Sec 54" }
  };

  // Return Calculator dynamic projections
  const projectionData = React.useMemo(() => {
    let currentAmount = calcPrincipal;
    const monthlyRate = (calcRate / 100) / 12;
    const totalMonths = calcYears * 12;
    
    // Dynamic series for SVG line chart (12 steps representing annual increments)
    const series = [];
    series.push({ year: 0, amount: calcPrincipal });

    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly investment
      currentAmount = (currentAmount + calcSIP) * (1 + monthlyRate);
      
      // Push each year
      if (month % 12 === 0) {
        series.push({
          year: month / 12,
          amount: Math.round(currentAmount)
        });
      }
    }

    const totalInvested = calcPrincipal + (calcSIP * totalMonths);
    const totalInterest = Math.max(0, Math.round(currentAmount - totalInvested));
    const roi = totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0;
    
    // CAGR for the period
    const cagr = calcRate; // compound rate specified
    
    // Approximate XIRR based on periodic inputs
    const xirr = calcRate + 0.85;

    return {
      series,
      totalValue: Math.round(currentAmount),
      totalInvested,
      totalInterest,
      roi: roi.toFixed(1),
      cagr: cagr.toFixed(1),
      xirr: xirr.toFixed(1)
    };
  }, [calcPrincipal, calcSIP, calcRate, calcYears]);

  return (
    <div id="premium-investment-view" className="space-y-6 relative">
      
      {/* Dynamic Mini Toasts Portal inside component */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl text-xs font-mono font-bold flex items-center gap-2 max-w-sm animate-bounce ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400"
                : t.type === "warning"
                ? "bg-amber-950/90 border-amber-500/30 text-amber-400"
                : "bg-slate-900/90 border-slate-800 text-sky-400"
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Banner Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-sky-400 text-xs font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
            <Shield className="w-3.5 h-3.5" />
            FinSight Institutional Wealth Portal
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Premium Investment Management</h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Multi-asset coverage of all 11 core classes with custom CAGR/XIRR tools, real-time newsfeeds, alerts triggers, allocation auditors, and strategies journals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowAddTickerModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl text-xs font-bold border border-slate-700/80 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" /> Add Ticker
          </button>
          <button
            type="button"
            onClick={() => {
              setTradeSymbol("");
              setTradeShares("10");
              setTradeAction("buy");
              setIsTradeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black border border-sky-500/20 shadow-lg shadow-sky-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Simulate Trade Order
          </button>
        </div>
      </div>

      {/* Core KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Value (Asset Pool)</span>
          <h3 className="text-xl font-mono font-bold text-white mt-1">
            {formatCurrency(totalValue, currencySymbol, currencyRate)}
          </h3>
          <span className="text-[9px] text-slate-500 font-mono block mt-1">Across 11 active asset classes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Principal Investment</span>
          <h3 className="text-xl font-mono font-bold text-white mt-1">
            {formatCurrency(totalCost, currencySymbol, currencyRate)}
          </h3>
          <span className="text-[9px] text-emerald-400 font-mono block mt-1">Sovereign allocation weight</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Unrealized Net P&L</span>
          <h3 className={`text-xl font-mono font-bold mt-1 ${netGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netGainLoss >= 0 ? '+' : ''}{formatCurrency(netGainLoss, currencySymbol, currencyRate)}
          </h3>
          <span className={`text-[9px] font-mono block mt-1 ${netGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({netGainLossPercent.toFixed(2)}% Cumulative)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Daily Profit / Loss</span>
          <h3 className={`text-xl font-mono font-bold mt-1 ${dailyGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {dailyGainLoss >= 0 ? '+' : ''}{formatCurrency(dailyGainLoss, currencySymbol, currencyRate)}
          </h3>
          <span className={`text-[9px] font-mono block mt-1 ${dailyGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({dailyGainLossPercent.toFixed(2)}% Daily weight)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <span className="text-sky-400 text-[10px] font-mono uppercase block">Diversification index</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl font-mono font-bold text-white">
                {computedDiversificationScore}/100
              </h3>
              <span className="px-1.5 py-0.5 bg-sky-950/40 text-sky-400 text-[8px] font-mono rounded font-bold border border-sky-500/10">Defensive</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-500 font-mono block">Calculated from entropy metrics</span>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-slate-900 to-purple-950/20">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400 text-[10px] font-mono uppercase font-bold block">Monthly Execution Anchor</span>
              <button
                type="button"
                onClick={() => {
                  setAnchorInputVal(monthlyExecutionAnchor.toString());
                  setShowEditAnchorModal(true);
                }}
                className="px-1.5 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold rounded cursor-pointer transition-all flex items-center gap-1"
              >
                <Edit3 className="w-2.5 h-2.5" /> Change
              </button>
            </div>
            <h3 className="text-xl font-mono font-black text-purple-300 mt-1">
              {formatCurrency(monthlyExecutionAnchor, currencySymbol, currencyRate)}
            </h3>
          </div>
          <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>Target Monthly SIP Anchor</span>
            <span className="text-purple-400 font-bold">Customizable</span>
          </div>
        </div>

      </div>

      {/* Subnavigation Hub tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
        {[
          { id: "overview", label: "Dashboard Portfolio Overview", icon: Grid },
          { id: "allocation", label: "Asset Allocation Analyzer", icon: Layers },
          { id: "watchlist", label: "Premium Watchlist & Alerts", icon: Eye },
          { id: "timeline", label: "History Timeline & Dividends", icon: Calendar },
          { id: "calculator", label: "CAGR & XIRR Return Simulator", icon: Calculator },
          { id: "comparison", label: "Multi-Asset Contrast Matrix", icon: Info },
          { id: "journal", label: "Macro Strategy Journal", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              id={`tab-btn-${tab.id}`}
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

      {/* Primary Sub-Module Router */}
      <div className="space-y-6">
        
        {/* VIEW 1: PORTFOLIO OVERVIEW */}
        {subView === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Holdings list table (Bento left column) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-white font-bold text-sm">Active Asset Positions</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Simulate buys and sells across all 11 standard investment categories.</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-950 text-slate-400 font-mono text-[10px] rounded-lg border border-slate-850">
                  {premiumHoldings.length} Active Positions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                      <th className="pb-2 font-medium">Symbol</th>
                      <th className="pb-2 font-medium">Asset Name / Type</th>
                      <th className="pb-2 font-medium text-right">Units</th>
                      <th className="pb-2 font-medium text-right">Avg Cost</th>
                      <th className="pb-2 font-medium text-right">Current Value</th>
                      <th className="pb-2 font-medium text-right">Net Return</th>
                      <th className="pb-2 font-medium text-right">Daily %</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {premiumHoldings.map((h) => {
                      const value = h.shares * h.currentPrice;
                      const cost = h.shares * h.avgPrice;
                      const gain = value - cost;
                      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                      return (
                        <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 font-mono font-bold text-sky-400">{h.symbol}</td>
                          <td className="py-2.5">
                            <div className="font-bold text-white max-w-xs truncate">{h.name}</div>
                            <span className="px-1.5 py-0.2 bg-slate-950 text-slate-500 font-mono text-[8px] rounded uppercase">{h.type}</span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-300">{h.shares}</td>
                          <td className="py-2.5 text-right font-mono text-slate-400">${h.avgPrice.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-white">
                            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`py-2.5 text-right font-mono font-bold ${gain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {gain >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
                          </td>
                          <td className={`py-2.5 text-right font-mono ${h.dayChangePercent >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {h.dayChangePercent >= 0 ? "+" : ""}{h.dayChangePercent}%
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                setTradeSymbol(h.symbol);
                                setTradeShares("10");
                                setTradeAssetType(h.type);
                                setTradeAction("sell");
                                setIsTradeModalOpen(true);
                              }}
                              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white rounded text-[9px] font-mono cursor-pointer transition-all"
                            >
                              Trade
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Portfolio Heatmap of holdings */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div>
                  <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    Portfolio Heatmap (% Allocation & Daily Change)
                  </h4>
                  <p className="text-[10px] text-slate-500">Box size represents holding weight; color shade represents daily market action.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {premiumHoldings.map(h => {
                    const weightPct = totalValue > 0 ? ((h.shares * h.currentPrice) / totalValue) * 100 : 0;
                    const change = h.dayChangePercent;
                    const bgColor = change > 2 
                      ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-400" 
                      : change > 0 
                      ? "bg-emerald-950/40 border-emerald-500/10 text-emerald-300"
                      : change === 0 
                      ? "bg-slate-950 border-slate-850 text-slate-500"
                      : change > -1.5 
                      ? "bg-rose-950/40 border-rose-500/10 text-rose-300"
                      : "bg-rose-950/80 border-rose-500/40 text-rose-400";

                    return (
                      <div
                        key={h.symbol}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${bgColor}`}
                        style={{ opacity: Math.max(0.6, weightPct / 15) }}
                        title={`${h.name} is ${weightPct.toFixed(1)}% of portfolio`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-xs">{h.symbol}</span>
                          <span className="text-[8px] font-mono font-medium">{weightPct.toFixed(0)}% wt</span>
                        </div>
                        <p className="text-[10px] font-mono font-black mt-2">
                          {change >= 0 ? "+" : ""}{change}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Premium Market Terminal Sidebar */}
            <div className="space-y-6">
              
              {/* Daily Top Gainer & Loser widgets */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider block">Top Gainer</span>
                    <h4 className="text-sm font-black text-white mt-1">{topGainer?.symbol}</h4>
                    <span className="text-[10px] text-slate-500">{topGainer?.name}</span>
                  </div>
                  <div className="text-emerald-400 text-xs font-mono font-black mt-3 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{topGainer?.dayChangePercent}% Today
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-rose-400 font-mono uppercase tracking-wider block">Top Loser</span>
                    <h4 className="text-sm font-black text-white mt-1">{topLoser?.symbol}</h4>
                    <span className="text-[10px] text-slate-500">{topLoser?.name}</span>
                  </div>
                  <div className="text-rose-400 text-xs font-mono font-black mt-3 flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {topLoser?.dayChangePercent}% Today
                  </div>
                </div>
              </div>

              {/* Live News Terminal */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <Newspaper className="w-4 h-4 text-sky-400" />
                  <h3 className="text-white font-bold text-xs">Premium Wealth Newsfeed</h3>
                </div>

                <div className="divide-y divide-slate-800/40 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {marketNews.map((news) => (
                    <div key={news.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          news.sentiment === "Strongly Bullish" || news.sentiment === "Bullish"
                            ? "bg-emerald-950 text-emerald-400"
                            : news.sentiment === "Neutral"
                            ? "bg-slate-950 text-slate-400"
                            : "bg-rose-950 text-rose-400"
                        }`}>{news.sentiment}</span>
                        <span className="text-slate-500">{news.time}</span>
                      </div>
                      <p className="text-xs text-white leading-snug">{news.title}</p>
                      <span className="text-[9px] font-mono text-sky-400 block">System Impact: {news.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Strategic Advice Cards */}
              <div className="bg-sky-950/10 border-2 border-sky-500/25 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] text-sky-400 font-mono uppercase font-black tracking-widest">AI Strategic Counsel</span>
                </div>

                <div className="space-y-3.5 text-left pt-1">
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] font-bold text-white block">Concentration Alarm</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Crypto assets are now <span className="text-sky-300 font-bold">{(premiumHoldings.filter(h => h.type === 'Crypto').reduce((sum, h) => sum + h.shares*h.currentPrice, 0)/totalValue*100).toFixed(0)}%</span> of the portfolio. This triggers volatility markers under active institutional guidelines.
                    </p>
                    <button
                      onClick={() => setSubView("allocation")}
                      className="text-[10px] text-sky-400 hover:underline font-mono mt-1 block"
                    >
                      Enact Asset Alignment Audit
                    </button>
                  </div>

                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] font-bold text-white block">Tax-Saving Sinks Detected</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      PPF and NPS options are highly compliant for extra fiscal tax-savings. Consider re-routing $2,500 of idle cash to SGB or PPF for compound protection.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: ASSET ALLOCATION */}
        {subView === "allocation" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-1.5">
                  <Layers className="w-5 h-5 text-sky-400" />
                  Asset Allocation Analyzer
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Comprehensive audit breakdown of your active wealth vectors across the 11 classes.</p>
              </div>
              <span className="px-3 py-1 bg-sky-950/35 border border-sky-500/25 text-sky-400 font-mono text-[11px] rounded-lg">
                Neutral Risk Variance: Calibrated
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Radial Wheel Mock SVG */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block text-center">Radial Allocation Spectrum</span>
                
                {/* SVG Donut Chart */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Circle placeholders representing segments of 11 asset classes */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                    {/* Real SVG Stroke Segment mappings based on types */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="140 251.2" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="50 251.2" strokeDashoffset="-140" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="12" strokeDasharray="40 251.2" strokeDashoffset="-190" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="21.2 251.2" strokeDashoffset="-230" />
                  </svg>
                  
                  {/* Absolute core metrics inside wheel */}
                  <div className="absolute text-center">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Total pool</span>
                    <span className="text-lg font-mono font-black text-white">${Math.round(totalValue / 1000)}K</span>
                    <span className="text-[9px] text-emerald-400 font-mono block">Aggressive</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] w-full pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-sky-500 block"></span>
                    <span className="text-slate-400 font-mono">Crypto: 56%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-500 block"></span>
                    <span className="text-slate-400 font-mono">Stocks: 20%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-purple-500 block"></span>
                    <span className="text-slate-400 font-mono">Bonds: 12%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-amber-500 block"></span>
                    <span className="text-slate-400 font-mono">Real Estate: 5%</span>
                  </div>
                </div>
              </div>

              {/* Center Allocation weights across all 11 core classes */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl lg:col-span-2 space-y-4 text-left">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Allocation Weights & Sector Concentrations</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {assetTypes.map(type => {
                    const val = typeTotals[type] || 0;
                    const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                    return (
                      <div key={type} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white uppercase">{type}</span>
                          <span className="font-mono font-bold text-sky-400">{pct.toFixed(1)}%</span>
                        </div>
                        
                        {/* Custom progress bars */}
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${
                              type === 'Crypto' 
                                ? 'bg-purple-500' 
                                : type === 'Stock' || type === 'ETF' 
                                ? 'bg-sky-400' 
                                : type === 'Gold' || type === 'Silver' 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-500'
                            }`}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                          <span>${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
                          <span>Neutral Max: 35%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* AI Risk Alignment suggestions banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Audited Diversification index */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Diversification Audit Index</span>
                  <div className="text-3xl font-mono font-black text-white mt-1">{computedDiversificationScore}</div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    A score of <span className="text-sky-300 font-bold">{computedDiversificationScore}</span> indicates solid diversification vectors spread across stocks, sovereign saving instruments, and commodities.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
                  ★ Level Status: Institutional Grade
                </div>
              </div>

              {/* Specific urgent rebalance action cards */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl md:col-span-2 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Active Allocation Rebalance Directive</span>
                  
                  <div className="divide-y divide-slate-800/40 space-y-3.5 mt-2">
                    {rebalancingSuggestions.map((item, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <AlertTriangle className={`w-3.5 h-3.5 ${item.urgency === 'High' ? 'text-rose-400' : 'text-amber-400'}`} />
                          {item.action}
                          <span className={`px-1.5 py-0.2 text-[8px] font-mono rounded font-bold ${
                            item.urgency === 'High' 
                              ? 'bg-rose-950 text-rose-400' 
                              : item.urgency === 'Moderate'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-slate-900 text-slate-400'
                          }`}>{item.urgency} Priority</span>
                        </div>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Simulate quick rebalancing buy order
                    setTradeSymbol("VOO");
                    setTradeShares("15");
                    setTradeAction("buy");
                    setTradeAssetType("ETF");
                    setIsTradeModalOpen(true);
                  }}
                  className="w-full mt-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-sky-950/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Execute Standard Portfolio Auto-Rebalancing Order
                </button>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: WATCHLIST & ALERTS */}
        {subView === "watchlist" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Premium Watchlist Tracking table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-white font-bold text-sm">Wealth Watchlist Tracker</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Track external tickers, monitor buy opportunities, and establish system alerts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTickerModal(true)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-sky-950/40"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Ticker
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                      <th className="pb-2 font-medium">Symbol</th>
                      <th className="pb-2 font-medium">Asset Class</th>
                      <th className="pb-2 font-medium text-right">Last Price</th>
                      <th className="pb-2 font-medium text-right">Daily %</th>
                      <th className="pb-2 font-medium text-center">AI Sentiment</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs font-mono">
                    {watchlist.map((item) => (
                      <tr key={item.symbol} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-bold text-white">{item.symbol}</td>
                        <td className="py-3 text-slate-400 text-xs">{item.type}</td>
                        <td className="py-3 text-right font-bold text-white">${item.price.toLocaleString()}</td>
                        <td className={`py-3 text-right ${item.change >= 0 ? "text-emerald-400 font-bold" : "text-rose-400"}`}>
                          {item.change >= 0 ? "+" : ""}{item.change}%
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${
                            item.sentiment === 'Strongly Bullish' || item.sentiment === 'Bullish'
                              ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20"
                              : item.sentiment === 'Neutral'
                              ? "text-slate-400 bg-slate-900 border-slate-800"
                              : "text-rose-400 bg-rose-950/30 border-rose-500/20"
                          }`}>
                            {item.sentiment}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setTradeSymbol(item.symbol);
                                setTradeShares("10");
                                setTradeAction("buy");
                                setTradeAssetType(item.type as any);
                                setIsTradeModalOpen(true);
                              }}
                              className="px-2 py-0.5 bg-sky-600/10 hover:bg-sky-600 border border-sky-500/20 hover:border-transparent text-sky-400 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Acquire
                            </button>
                            <button
                              onClick={() => {
                                setWatchlist(watchlist.filter(w => w.symbol !== item.symbol));
                                triggerToast("Ticker removed from watchlist", "info");
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Custom Alerts Form and Active List Sidebar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-sky-400" />
                  Sovereign Price & Dividend Alerts
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Setup real-time webhook rules on watch tickers.</p>
              </div>

              {/* Form to log trigger rule */}
              <form onSubmit={handleAddAlert} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Add Alert Parameters</p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500">Asset Trigger Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AMD, BTC"
                    value={alertSymbol}
                    onChange={(e) => setAlertSymbol(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Rule Type</label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      <option value="Price Trigger">Price Trigger</option>
                      <option value="Dividend Alert">Dividend Alert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Condition</label>
                    <select
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      <option value="Above">Above Price</option>
                      <option value="Below">Below Price</option>
                      <option value="Payout Received">Payout Received</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Value (Trigger price / Div payout)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="245.00"
                    value={alertValue}
                    onChange={(e) => setAlertValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs cursor-pointer transition-colors"
                >
                  Compile Alarm Rule
                </button>
              </form>

              {/* Alerts logs list */}
              <div className="space-y-2">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Currently Active Triggers</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                      <div>
                        <p className="font-bold text-white flex items-center gap-1">
                          {alert.symbol}
                          <span className={`px-1 py-0.2 text-[8px] font-mono rounded font-medium ${
                            alert.status === 'Active' ? 'bg-sky-950 text-sky-400' : 'bg-emerald-950 text-emerald-400'
                          }`}>{alert.status}</span>
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                          {alert.type} • {alert.condition} {alert.value}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAlerts(alerts.filter(a => a.id !== alert.id));
                          triggerToast("Alert condition purged", "info");
                        }}
                        className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 4: TIMELINE & DIVIDENDS */}
        {subView === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Purchase Timeline Left column */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-white font-bold text-sm">Portfolio Acquisition Timeline</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Chronological audit stream of premium asset entries.</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-950 text-slate-400 font-mono text-[10px] rounded-lg border border-slate-850">
                  Audit compliant
                </span>
              </div>

              {/* Vertical timeline of preseeded assets */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 text-left">
                {premiumHoldings.slice(0, 6).map((h, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Circle marker */}
                    <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-slate-900"></span>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{h.purchaseDate}</span>
                      <span className="px-1.5 py-0.2 bg-slate-950 text-sky-400 text-[8px] font-mono rounded font-medium border border-slate-850 uppercase">{h.type}</span>
                    </div>
                    <h4 className="text-xs font-black text-white">{h.name} ({h.symbol})</h4>
                    <p className="text-xs text-slate-400 font-mono leading-normal">
                      Acquired {h.shares} units at an average cost basis of <span className="text-white">${h.avgPrice.toFixed(2)}</span> per share. Overall value weight initialized at <span className="text-white">${h.value.toLocaleString()} USD</span>.
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Dividend Yield projections sidebar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Dividend History & Projections
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Track passive sovereign payout yields over multi-year vectors.</p>
              </div>

              {/* Dividend totals metrics */}
              <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-xl space-y-2 text-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Annual Forecasted Yield sum</span>
                <h3 className="text-2xl font-mono font-black text-emerald-400">
                  ${premiumHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice * (h.dividendYield / 100)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[9px] text-slate-400 font-mono block">
                  Weighted Yield Ratio: {(premiumHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice * (h.dividendYield / 100)), 0) / totalValue * 100).toFixed(2)}%
                </span>
              </div>

              {/* Specific yield breakdown */}
              <div className="space-y-2">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Payout Contribution Weights</p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-mono text-xs">
                  {premiumHoldings.filter(h => h.dividendYield > 0).map(h => {
                    const contribution = h.shares * h.currentPrice * (h.dividendYield / 100);
                    return (
                      <div key={h.symbol} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                        <div>
                          <p className="font-bold text-white">{h.symbol}</p>
                          <span className="text-[9px] text-slate-500 block mt-0.5">Yield: {h.dividendYield}% • {h.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">+${contribution.toFixed(2)}/yr</p>
                          <span className="text-[9px] text-slate-500 block mt-0.5">approx. ${(contribution/12).toFixed(2)}/mo</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 5: CAGR & XIRR RETURN CALCULATOR */}
        {subView === "calculator" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-1.5">
                  <Calculator className="w-5 h-5 text-sky-400" />
                  CAGR & XIRR Return Simulator
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Simulate compounding systematically over custom years, principal, and SIP inputs.</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-950 border border-slate-850 text-slate-500 font-mono text-[10px] rounded-lg">
                Projections calculated in real-time
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sliders Control column */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4 text-left">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Simulator Parameters</span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Initial Principal</span>
                    <span className="font-mono text-white">${calcPrincipal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>$1K</span>
                    <span>$100K</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Monthly SIP Contribution</span>
                    <span className="font-mono text-white">${calcSIP.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={calcSIP}
                    onChange={(e) => setCalcSIP(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>$0</span>
                    <span>$5K</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Expected Annual Return Rate (CAGR)</span>
                    <span className="font-mono text-white">{calcRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="35"
                    step="0.5"
                    value={calcRate}
                    onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>2% (FD safety)</span>
                    <span>35% (Crypto Volatility)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Time Horizon (Duration)</span>
                    <span className="font-mono text-white">{calcYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    step="1"
                    value={calcYears}
                    onChange={(e) => setCalcYears(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>1 Year</span>
                    <span>35 Years</span>
                  </div>
                </div>

              </div>

              {/* Chart & Result column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual statistics row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Estimated Future value</span>
                    <h4 className="text-xl font-mono font-bold text-sky-400 mt-1">${projectionData.totalValue.toLocaleString()}</h4>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">Compound result</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Net Invested</span>
                    <h4 className="text-xl font-mono font-bold text-white mt-1">${projectionData.totalInvested.toLocaleString()}</h4>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">Sunk capital amount</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Accumulated Interests (ROI)</span>
                    <h4 className="text-xl font-mono font-bold text-emerald-400 mt-1">+{projectionData.roi}%</h4>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">Compounded Gain</span>
                  </div>
                </div>

                {/* Compound growth curve mock representation via responsive SVG */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">CAGR Growth Timeline Curve</span>
                    <span className="text-[10px] text-sky-400 font-mono">XIRR proxy index: ~{projectionData.xirr}%</span>
                  </div>

                  <div className="h-40 w-full relative pt-4">
                    {/* SVG Line representation of projections */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />

                      {/* Yield Growth Line */}
                      <path
                        d={`M 0,90 Q 30,85 60,60 T 100,20`}
                        fill="transparent"
                        stroke="#0ea5e9"
                        strokeWidth="3.5"
                      />
                      
                      {/* Dots on line */}
                      <circle cx="0" cy="90" r="3" fill="#0ea5e9" />
                      <circle cx="50" cy="72" r="3" fill="#0ea5e9" />
                      <circle cx="100" cy="20" r="3" fill="#0ea5e9" />
                    </svg>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                      <span>Start (Yr 0)</span>
                      <span>Mid-way</span>
                      <span>End (Yr {calcYears})</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 6: MULTI-ASSET COMPARISON MATRIX */}
        {subView === "comparison" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-1.5">
                  <Info className="w-5 h-5 text-sky-400" />
                  Multi-Asset Contrast Matrix
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Contrast tax-benefits, locked horizons, returns, and liquidity benchmarks side by side.</p>
              </div>
              <span className="px-2 py-0.5 bg-slate-950 text-slate-500 font-mono text-[9px] rounded uppercase">Standard asset profiles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Select asset 1 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs text-slate-400 font-bold block">Focus Asset Class Alpha</label>
                <select
                  value={compareAsset1}
                  onChange={(e) => setCompareAsset1(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white cursor-pointer"
                >
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Select asset 2 */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs text-slate-400 font-bold block">Contrast Asset Class Beta</label>
                <select
                  value={compareAsset2}
                  onChange={(e) => setCompareAsset2(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white cursor-pointer"
                >
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Contrast metrics grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-3 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Historical Return benchmark</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold">
                  <div>
                    <p className="text-sky-400">{compareAsset1}</p>
                    <p className="text-white mt-1 text-base">{assetClassMatrix[compareAsset1].returnRate}</p>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <p className="text-emerald-400">{compareAsset2}</p>
                    <p className="text-white mt-1 text-base">{assetClassMatrix[compareAsset2].returnRate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-3 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Liquidity & Exit options</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold">
                  <div>
                    <p className="text-sky-400">{compareAsset1}</p>
                    <p className="text-white mt-1">{assetClassMatrix[compareAsset1].liquidity}</p>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <p className="text-emerald-400">{compareAsset2}</p>
                    <p className="text-white mt-1">{assetClassMatrix[compareAsset2].liquidity}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-3 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Risk Class Profile</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold">
                  <div>
                    <p className="text-sky-400">{compareAsset1}</p>
                    <p className="text-white mt-1">{assetClassMatrix[compareAsset1].risk}</p>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <p className="text-emerald-400">{compareAsset2}</p>
                    <p className="text-white mt-1">{assetClassMatrix[compareAsset2].risk}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-3 text-left md:col-span-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Taxation Treatment (Section 80C, LTCG, STCG Rules)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono font-bold">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <p className="text-sky-400 uppercase">{compareAsset1}</p>
                    <p className="text-white mt-1 font-sans font-medium">{assetClassMatrix[compareAsset1].taxBenefit}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <p className="text-emerald-400 uppercase">{compareAsset2}</p>
                    <p className="text-white mt-1 font-sans font-medium">{assetClassMatrix[compareAsset2].taxBenefit}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 7: MACRO STRATEGY JOURNAL */}
        {subView === "journal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Journal Entries List Left Column */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-white font-bold text-sm">Macro Strategic Journals & Thesis Logs</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Document market observations, exit thesis rules, and periodic portfolio summaries.</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-950 text-slate-500 font-mono text-[9px] rounded uppercase">Private Ledger Encrypted</span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {journal.map((entry) => (
                  <div key={entry.id} className="p-5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl text-left space-y-3 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{entry.date}</span>
                        <h4 className="text-sm font-black text-white group-hover:text-sky-400 transition-colors mt-0.5">{entry.title}</h4>
                      </div>
                      
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold rounded uppercase text-sky-400">
                          {entry.thesisType}
                        </span>
                        <button
                          onClick={() => {
                            setJournal(journal.filter(j => j.id !== entry.id));
                            triggerToast("Journal thesis purged", "info");
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{entry.content}</p>
                    <span className="text-[9px] font-mono text-slate-500 block">Class Connection: {entry.assetClass}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Quick entry logger sidebar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Log Investing Thesis
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Pen analytical thesis entries to monitor trading biases.</p>
              </div>

              <form onSubmit={handleAddJournal} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Thesis Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTC Cash Inflows Support"
                    value={newJournalTitle}
                    onChange={(e) => setNewJournalTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-mono">Asset Type</label>
                    <select
                      value={newJournalAssetClass}
                      onChange={(e) => setNewJournalAssetClass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      {assetTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-mono">Method</label>
                    <select
                      value={newJournalThesis}
                      onChange={(e) => setNewJournalThesis(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      <option value="Long Term">Long Term</option>
                      <option value="Tactical">Tactical</option>
                      <option value="Hedging">Hedging</option>
                      <option value="Speculative">Speculative</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Observation & Exit Criteria</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write detailed investment thoughts, risk thresholds, and targets..."
                    value={newJournalContent}
                    onChange={(e) => setNewJournalContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-black rounded text-xs cursor-pointer transition-colors"
                >
                  Publish Log Entry
                </button>
              </form>

            </div>

          </div>
        )}

      </div>

      {/* Goal Mapping Progress Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-left">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              Sovereign Goal Mapping & Completion Ratios
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Map current holdings directly to long term target thresholds.</p>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded">
            Target tracking online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mappedGoalAllocations.map(goal => (
            <div key={goal.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-black text-white">{goal.name}</h4>
                <span className="text-[10px] font-mono font-bold text-sky-400">{goal.progressPercent}%</span>
              </div>

              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${goal.progressPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Invested: ${(goal.totalProgress).toLocaleString()}</span>
                  <span>Target: ${(goal.target).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono">
                💼 Portfolio Contribution: <span className="text-white font-bold">${(goal.portfolioContribution).toLocaleString()} USD</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Simulated Order Modal */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            
            <h3 className="text-white font-black text-base mb-4 flex items-center gap-1.5 text-left">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Simulate Sovereign Order Book
            </h3>

            <form onSubmit={handleExecuteTrade} className="space-y-4 text-left">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Asset Class Category</label>
                <select
                  value={tradeAssetType}
                  onChange={(ev) => setTradeAssetType(ev.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Ticker / Asset Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NVDA, SOL, GOLD"
                  value={tradeSymbol}
                  onChange={(ev) => setTradeSymbol(ev.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Transaction Execution Side</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeAction('buy')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      tradeAction === 'buy'
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Buy (Go Long)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeAction('sell')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      tradeAction === 'sell'
                        ? "bg-rose-500/20 border-rose-500 text-rose-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Sell / Trim
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Order Volume (Shares/Units)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={tradeShares}
                  onChange={(ev) => setTradeShares(ev.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400 font-medium">Execution Price per Unit ($)</label>
                  <span className="text-[9px] text-slate-500 font-mono">Optional Custom Price</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Default: $${(premiumHoldings.find(h => h.symbol === tradeSymbol.toUpperCase())?.currentPrice || 120.00).toFixed(2)}`}
                  value={customExecutionPrice}
                  onChange={(ev) => setCustomExecutionPrice(ev.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Estimated Trade Execution Anchor</span>
                <span className="text-base font-mono font-bold text-white block">
                  {formatCurrency(
                    (parseFloat(tradeShares) || 0) * (
                      customExecutionPrice && !isNaN(parseFloat(customExecutionPrice)) && parseFloat(customExecutionPrice) > 0
                        ? parseFloat(customExecutionPrice)
                        : (premiumHoldings.find(h => h.symbol === tradeSymbol.toUpperCase())?.currentPrice || 120.00)
                    ),
                    currencySymbol,
                    currencyRate
                  )}
                </span>
                <span className="text-[9px] text-purple-400 font-mono block">
                  ({(((parseFloat(tradeShares) || 0) * (customExecutionPrice && !isNaN(parseFloat(customExecutionPrice)) && parseFloat(customExecutionPrice) > 0 ? parseFloat(customExecutionPrice) : (premiumHoldings.find(h => h.symbol === tradeSymbol.toUpperCase())?.currentPrice || 120.00))) / (monthlyExecutionAnchor || 1) * 100).toFixed(1)}% of Monthly Anchor Pool)
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTradeModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-black cursor-pointer shadow-md"
                >
                  Submit Order Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Change Monthly Estimated Execution Anchor */}
      {showEditAnchorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-400" />
                  Monthly Estimated Execution Anchor
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Customize your recurring monthly investment anchor according to your personal financial plan.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseFloat(anchorInputVal);
                if (isNaN(num) || num <= 0) {
                  triggerToast("Please enter a valid positive execution anchor amount.", "warning");
                  return;
                }
                setMonthlyExecutionAnchor(num);
                setCalcSIP(num);
                setShowEditAnchorModal(false);
                triggerToast(`Monthly execution anchor updated to ${formatCurrency(num, currencySymbol, currencyRate)}!`, "success");
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">
                  Target Monthly Execution Anchor ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  required
                  value={anchorInputVal}
                  onChange={(e) => setAnchorInputVal(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Quick Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 1500, 2500, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAnchorInputVal(preset.toString())}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        parseFloat(anchorInputVal) === preset
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {formatCurrency(preset, currencySymbol, currencyRate)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Information callout */}
              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300 leading-relaxed">
                💡 This anchor automatically recalibrates your monthly SIP growth forecasts, asset allocation targets, and trade execution order benchmarks.
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditAnchorModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-purple-950/40"
                >
                  Save Anchor Amount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Add Ticker to Watchlist */}
      {showAddTickerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-sky-400" />
                  Add Market Ticker
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Track price vectors, monitor buy zones, and enable automated AI signals.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddTickerSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">
                  Ticker Symbol <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMD, TSLA, SOL, VTI"
                  value={newTickerSymbol}
                  onChange={(e) => setNewTickerSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white uppercase focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Quick Preset Ticker Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Popular Tickers</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { sym: "AMD", name: "Advanced Micro Devices", type: "Stock", price: "165.00" },
                    { sym: "TSLA", name: "Tesla Inc.", type: "Stock", price: "225.00" },
                    { sym: "NVDA", name: "NVIDIA Corp", type: "Stock", price: "128.00" },
                    { sym: "SOL", name: "Solana Network", type: "Crypto", price: "180.00" },
                    { sym: "MSFT", name: "Microsoft Corp", type: "Stock", price: "445.00" },
                    { sym: "VTI", name: "Vanguard Total Stock ETF", type: "ETF", price: "270.00" },
                  ].map((preset) => (
                    <button
                      key={preset.sym}
                      type="button"
                      onClick={() => {
                        setNewTickerSymbol(preset.sym);
                        setNewTickerName(preset.name);
                        setNewTickerType(preset.type);
                        setNewTickerPrice(preset.price);
                      }}
                      className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-sky-400 hover:text-white rounded-lg transition-all cursor-pointer"
                    >
                      + {preset.sym}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Micro Devices Inc."
                  value={newTickerName}
                  onChange={(e) => setNewTickerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold block">Asset Class</label>
                  <select
                    value={newTickerType}
                    onChange={(e) => setNewTickerType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {assetTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold block">Estimated Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTickerPrice}
                    onChange={(e) => setNewTickerPrice(e.target.value)}
                    placeholder="150.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">AI Market Outlook / Sentiment</label>
                <select
                  value={newTickerSentiment}
                  onChange={(e) => setNewTickerSentiment(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Strongly Bullish">🚀 Strongly Bullish</option>
                  <option value="Bullish">📈 Bullish</option>
                  <option value="Neutral">⚖️ Neutral</option>
                  <option value="Bearish">📉 Bearish</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTickerModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-sky-950/40 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Ticker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
