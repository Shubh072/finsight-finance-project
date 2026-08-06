import React from "react";
import { Sparkles, Calendar, Plus, RefreshCw, AlertCircle, ArrowUpRight, Check, Trash2, Zap, HelpCircle } from "lucide-react";
import { Expense, safeParseJSON } from "../types";

interface ExpenseRecurringProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export interface SubscriptionProfile {
  id: string;
  name: string;
  amount: number;
  interval: "Monthly" | "Annual";
  category: string;
  nextRenewal: string;
  paymentMethod: string;
  status: "Active" | "Paused" | "Suspicious";
}

export const ExpenseRecurring: React.FC<ExpenseRecurringProps> = ({ expenses, onAddExpense, showToast }) => {
  const [activeTab, setActiveTab] = React.useState<"active" | "suggestions">("active");
  const [isScanning, setIsScanning] = React.useState(false);

  // Managed active subscriptions inside local state
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionProfile[]>(() => {
    return safeParseJSON<SubscriptionProfile[]>(localStorage.getItem("finsight_recurring_profiles"), [
      { id: "s1", name: "Netflix Premium", amount: 22.99, interval: "Monthly", category: "Entertainment", nextRenewal: "2026-08-17", paymentMethod: "Chase Sapphire Debit", status: "Active" },
      { id: "s2", name: "AWS Cloud Infrastructure", amount: 350.00, interval: "Monthly", category: "Utilities", nextRenewal: "2026-08-18", paymentMethod: "AMEX Corp Business", status: "Active" },
      { id: "s3", name: "Equinox Gym Membership", amount: 120.00, interval: "Monthly", category: "Entertainment", nextRenewal: "2026-08-20", paymentMethod: "Visa Premium Credit", status: "Active" },
      { id: "s4", name: "Heroku Server Fleet", amount: 75.00, interval: "Monthly", category: "Utilities", nextRenewal: "2026-08-22", paymentMethod: "Visa Premium Credit", status: "Paused" }
    ]);
  });

  // Suggested candidates found by detection scanning
  const [scanSuggestions, setScanSuggestions] = React.useState<Omit<SubscriptionProfile, "id">[]>([]);

  React.useEffect(() => {
    localStorage.setItem("finsight_recurring_profiles", JSON.stringify(subscriptions));
  }, [subscriptions]);

  const handleScanForSubscriptions = () => {
    setIsScanning(true);
    setScanSuggestions([]);

    setTimeout(() => {
      // Analyze transaction ledger names/categories for monthly subscription matches
      const recurringKeywords = ["netflix", "aws", "gym", "slack", "adobe", "spotify", "google", "apple", "subscription", "autopay", "premium", "membership"];
      const detected: Omit<SubscriptionProfile, "id">[] = [];

      // Simulated detection algorithm based on real-time transaction ledger patterns
      expenses.forEach((e) => {
        const lowerMerchant = e.merchant.toLowerCase();
        const matchesKeyword = recurringKeywords.some((kw) => lowerMerchant.includes(kw));
        
        // Check duplicates or matches
        if (matchesKeyword && !subscriptions.some((sub) => sub.name.toLowerCase().includes(lowerMerchant))) {
          if (!detected.some((d) => d.name.toLowerCase().includes(lowerMerchant))) {
            detected.push({
              name: e.merchant,
              amount: e.amount,
              interval: "Monthly",
              category: e.category,
              nextRenewal: "2026-08-25",
              paymentMethod: e.paymentMethod || "Corporate Card",
              status: "Suspicious" // Requires validation
            });
          }
        }
      });

      // Fallback preset suggestions if ledger is empty of candidates
      if (detected.length === 0) {
        detected.push(
          { name: "Adobe Creative Cloud", amount: 54.99, interval: "Monthly", category: "Other", nextRenewal: "2026-08-04", paymentMethod: "Chase Visa (*1010)", status: "Active" },
          { name: "Google Workspace Admin Suite", amount: 18.00, interval: "Monthly", category: "Utilities", nextRenewal: "2026-08-11", paymentMethod: "Chase Visa (*1010)", status: "Active" }
        );
      }

      setScanSuggestions(detected);
      setIsScanning(false);
      setActiveTab("suggestions");
      showToast("Subscription pattern scanner complete!", "success");
    }, 1500);
  };

  const handleApproveSubscription = (s: Omit<SubscriptionProfile, "id">) => {
    const newSub: SubscriptionProfile = {
      ...s,
      id: "sub_" + Date.now(),
      status: "Active"
    };
    setSubscriptions([...subscriptions, newSub]);
    setScanSuggestions(scanSuggestions.filter((item) => item.name !== s.name));
    showToast(`Subscription profile for '${s.name}' registered!`, "success");
  };

  const handleRemoveSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
    showToast("Subscription profile removed", "info");
  };

  const handleTogglePause = (id: string) => {
    setSubscriptions(subscriptions.map((s) => s.id === id ? { ...s, status: s.status === "Active" ? "Paused" : "Active" } : s));
    showToast("Subscription status updated", "success");
  };

  const totalMonthlySaaS = subscriptions
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + (s.interval === "Monthly" ? s.amount : s.amount / 12), 0);

  return (
    <div className="space-y-6">
      
      {/* SaaS Forecasting Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs">Active SaaS Subscription Count</p>
          <h2 className="text-3xl font-mono font-bold text-white mt-1">
            {subscriptions.filter((s) => s.status === "Active").length} Active
          </h2>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
            {subscriptions.filter((s) => s.status === "Paused").length} currently paused
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs">Monthly SaaS Burn Rate</p>
          <h2 className="text-3xl font-mono font-bold text-sky-400 mt-1">
            ${totalMonthlySaaS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
            Annual Projection: ${(totalMonthlySaaS * 12).toLocaleString()} USD
          </span>
        </div>

        {/* AI Auto Subscription Scanner Box */}
        <div className="bg-purple-950/10 border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-purple-400 font-semibold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pattern Anomaly Detection
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              AI scans transaction histories to surface ghost subscriptions, double billings, or orphan service fees.
            </p>
          </div>
          <button
            onClick={handleScanForSubscriptions}
            disabled={isScanning}
            className="w-full mt-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-950/40"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Scanning Transaction Matrix...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Run AI Pattern Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Card View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        {/* Sub Navigation */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Registered Subscriptions ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "suggestions"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Scanning Discoveries ({scanSuggestions.length})
            </button>
          </div>
        </div>

        {/* Tab Content 1: Active List */}
        {activeTab === "active" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="pb-3 font-medium">Service Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Cycle Cost</th>
                  <th className="pb-3 font-medium text-center">Interval</th>
                  <th className="pb-3 font-medium">Renewal Date</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-white text-xs">{sub.name}</td>
                    <td className="py-3 text-xs text-slate-400">{sub.category}</td>
                    <td className="py-3 text-right text-xs font-mono font-bold text-white">${sub.amount}</td>
                    <td className="py-3 text-center text-[10px] font-mono text-slate-500 uppercase">{sub.interval}</td>
                    <td className="py-3 text-xs font-mono text-slate-400">{sub.nextRenewal}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        sub.status === "Active"
                          ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20"
                          : "text-amber-400 bg-amber-950/30 border-amber-500/20"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleTogglePause(sub.id)}
                          className="px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
                        >
                          {sub.status === "Active" ? "Pause" : "Resume"}
                        </button>
                        <button
                          onClick={() => handleRemoveSubscription(sub.id)}
                          className="p-1 hover:bg-rose-900/15 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab Content 2: Scanning Suggestions */
          <div className="space-y-4">
            {scanSuggestions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-700 mx-auto" />
                <p>No subscription candidates discovered yet.</p>
                <button
                  onClick={handleScanForSubscriptions}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-mono uppercase cursor-pointer"
                >
                  Initiate Audit Scan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanSuggestions.map((s, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-850 hover:border-purple-500/30 rounded-xl flex items-start justify-between transition-all group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white group-hover:text-purple-400 transition-colors">{s.name}</h4>
                        <span className="px-1.5 py-0.2 bg-purple-950/40 text-purple-400 text-[8px] font-mono rounded">AI Identified</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Found in history • {s.category} • renewal approx: {s.nextRenewal}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-white font-mono font-bold">${s.amount}/mo</span>
                        <span className="text-[10px] text-slate-500 font-mono">via {s.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-right">
                      <button
                        onClick={() => handleApproveSubscription(s)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Register Subscription
                      </button>
                      <button
                        onClick={() => setScanSuggestions(scanSuggestions.filter((item) => item.name !== s.name))}
                        className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
