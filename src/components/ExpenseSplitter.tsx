import React from "react";
import { Plus, Trash2, Users, DollarSign, Calculator, ArrowRight, Share2 } from "lucide-react";
import { Expense } from "../types";

interface ExpenseSplitterProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({ onAddExpense, showToast }) => {
  const [billName, setBillName] = React.useState("");
  const [billAmount, setBillAmount] = React.useState("");
  const [splitMethod, setSplitMethod] = React.useState<"equal" | "percentage" | "exact">("equal");
  
  // Group members
  const [members, setMembers] = React.useState<string[]>([
    "Alex Rivera (You)",
    "Chloe Chen",
    "Marcus Vance",
    "Sarah Jenkins"
  ]);
  const [newMemberName, setNewMemberName] = React.useState("");

  // Shares/proportions state
  const [customProportions, setCustomProportions] = React.useState<Record<string, string>>({});

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    if (members.includes(newMemberName.trim())) {
      showToast("Member is already in the split pool", "warning");
      return;
    }
    setMembers([...members, newMemberName.trim()]);
    setNewMemberName("");
    showToast("Added new split member", "success");
  };

  const handleRemoveMember = (name: string) => {
    if (members.length <= 2) {
      showToast("Split bills require at least 2 members", "warning");
      return;
    }
    setMembers(members.filter((m) => m !== name));
    showToast("Removed member from split", "info");
  };

  // Calculates the split array
  const calculateSplits = () => {
    const amount = parseFloat(billAmount) || 0;
    if (amount <= 0 || members.length === 0) return [];

    if (splitMethod === "equal") {
      const share = amount / members.length;
      return members.map((m) => ({
        name: m,
        share: parseFloat(share.toFixed(2)),
        detail: `Equal share: 1/${members.length}`
      }));
    } else if (splitMethod === "percentage") {
      // Normalise percentages or fall back to equal
      let totalPct = 0;
      const pctMap = members.reduce((acc, m) => {
        const val = parseFloat(customProportions[m]) || 0;
        acc[m] = val;
        totalPct += val;
        return acc;
      }, {} as Record<string, number>);

      return members.map((m) => {
        const pct = pctMap[m] || (totalPct === 0 ? 100 / members.length : 0);
        const share = (pct / 100) * amount;
        return ({
          name: m,
          share: parseFloat(share.toFixed(2)),
          detail: `${pct.toFixed(0)}% proportion`
        });
      });
    } else {
      // Exact cash shares
      let totalExact = 0;
      const exactMap = members.reduce((acc, m) => {
        const val = parseFloat(customProportions[m]) || 0;
        acc[m] = val;
        totalExact += val;
        return acc;
      }, {} as Record<string, number>);

      return members.map((m) => {
        const share = exactMap[m] || 0;
        return ({
          name: m,
          share: parseFloat(share.toFixed(2)),
          detail: `Custom exact amount`
        });
      });
    }
  };

  const computedSplits = calculateSplits();
  const totalAllocated = computedSplits.reduce((sum, item) => sum + item.share, 0);
  const remainingToAllocate = parseFloat((parseFloat(billAmount || "0") - totalAllocated).toFixed(2));

  const handlePostSplitExpense = () => {
    const amount = parseFloat(billAmount) || 0;
    if (!billName || amount <= 0) {
      showToast("Provide a valid bill name and total amount first", "warning");
      return;
    }

    if (splitMethod !== "equal" && remainingToAllocate !== 0) {
      showToast(`Unequal split totals must equal the total bill of $${amount}. Currently off by $${remainingToAllocate}`, "error");
      return;
    }

    // Capture Alex's share as the primary expense, store group details inside splitWith metadata
    const alexShare = computedSplits.find((s) => s.name.includes("Alex Rivera"))?.share || (amount / members.length);
    const splitWithMeta = computedSplits
      .filter((s) => !s.name.includes("Alex Rivera"))
      .map((s) => ({
        name: s.name,
        share: s.share,
        paid: false
      }));

    onAddExpense({
      date: new Date().toISOString().split("T")[0],
      category: "Food",
      merchant: `Bill Split: ${billName}`,
      amount: alexShare,
      status: "Cleared",
      notes: `Bill splitting project: Total Bill $${amount}. Remaining members split with.`,
      tags: ["Split-Bill", "Social"],
      paymentMethod: "Split Account Pool",
      location: "San Francisco, CA",
      approvalStatus: "Cleared",
      splitWith: splitWithMeta
    });

    showToast(`Bill '${billName}' posted to ledger. Your share: $${alexShare}`, "success");
    // Reset form
    setBillName("");
    setBillAmount("");
    setCustomProportions({});
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">Multi-User Bill Splitter</h3>
          <p className="text-slate-400 text-xs">Coordinate joint checks, travel costs, or office lunches across group members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bill Metadata Forms */}
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">1. Bill Parameters</p>
          
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Split Description</label>
            <input
              type="text"
              placeholder="e.g. Chipotle Business Lunch"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Total Bill Amount (USD)</label>
            <div className="relative">
              <span className="text-slate-500 text-xs absolute left-3 top-2.5">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Split Methodology</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
              {(["equal", "percentage", "exact"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setSplitMethod(method);
                    setCustomProportions({});
                  }}
                  className={`py-1 rounded-md text-[10px] font-bold font-mono uppercase transition-colors cursor-pointer ${
                    splitMethod === method
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Management List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">2. Group Members</p>
            <span className="text-[10px] text-slate-500 font-mono">{members.length} participating</span>
          </div>

          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              type="text"
              placeholder="Add colleague's name..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {members.map((m) => (
              <div key={m} className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-300 font-medium truncate">{m}</span>
                <div className="flex items-center gap-3">
                  {splitMethod === "percentage" && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="%"
                        value={customProportions[m] || ""}
                        onChange={(e) => setCustomProportions({ ...customProportions, [m]: e.target.value })}
                        className="w-10 bg-slate-900 border border-slate-800 rounded px-1 text-center text-xs font-mono text-emerald-400 focus:outline-none"
                      />
                      <span className="text-[10px] font-mono text-slate-500">%</span>
                    </div>
                  )}

                  {splitMethod === "exact" && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={customProportions[m] || ""}
                        onChange={(e) => setCustomProportions({ ...customProportions, [m]: e.target.value })}
                        className="w-14 bg-slate-900 border border-slate-800 rounded px-1.5 text-center text-xs font-mono text-emerald-400 focus:outline-none"
                      />
                    </div>
                  )}

                  {!m.includes("Alex Rivera") && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m)}
                      className="p-1 hover:bg-rose-900/10 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Settlement Matrix */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-850 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80 mb-3">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                Computed Settlements
              </p>
              {parseFloat(billAmount || "0") > 0 && (
                <span className={`text-[10px] font-mono ${remainingToAllocate === 0 ? "text-emerald-400" : "text-amber-500"}`}>
                  {remainingToAllocate === 0 ? "Balanced ✓" : `Unbalanced: $${remainingToAllocate}`}
                </span>
              )}
            </div>

            {parseFloat(billAmount || "0") <= 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center">
                <Users className="w-6 h-6 text-slate-700 mb-2" />
                <p className="text-[10px] text-slate-500 font-mono">Awaiting bill details to compute settlement proportions</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {computedSplits.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <span className="text-[9px] font-mono text-slate-500">{item.detail}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-400">${item.share.toLocaleString()}</p>
                      {item.name.includes("Alex") ? (
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900 px-1 py-0.5 rounded border border-slate-800">Your Share</span>
                      ) : (
                        <span className="text-[8px] font-mono text-slate-500 uppercase">owes you</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Allocated:</span>
              <span className="font-bold text-white">${totalAllocated.toLocaleString()}</span>
            </div>
            
            <button
              onClick={handlePostSplitExpense}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Post Split To Ledger
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
