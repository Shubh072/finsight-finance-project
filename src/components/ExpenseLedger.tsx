import React from "react";
import { Search, Filter, Trash2, Edit2, AlertCircle, CheckCircle2, Clock, X, FileText, ChevronRight, Download, MoreHorizontal, ArrowUpDown, ShieldAlert, Check, Wifi, WifiOff } from "lucide-react";
import { Expense } from "../types";

interface ExpenseLedgerProps {
  expenses: Expense[];
  onEditExpense: (id: string, updated: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const ExpenseLedger: React.FC<ExpenseLedgerProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  showToast,
}) => {
  // Filters state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedStatus, setSelectedStatus] = React.useState("All");
  const [selectedPayment, setSelectedPayment] = React.useState("All");
  const [onlyOffline, setOnlyOffline] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState("All");

  // Selection state for Bulk Actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  
  // Sorting state
  const [sortField, setSortField] = React.useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  // Detail Modal State
  const [activeDetailsExpense, setActiveDetailsExpense] = React.useState<Expense | null>(null);
  const [approverNotesInput, setApproverNotesInput] = React.useState("");

  // Categories list derived from expenses
  const categories = ["Housing", "Food", "Utilities", "Entertainment", "Travel", "Other"];
  const paymentMethods = ["All", "Visa Debit (*4491)", "Chase Sapphire", "AMEX Corp Business", "Cash", "Crypto", "Split Account Pool"];
  
  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    expenses.forEach((e) => e.tags?.forEach((t) => tags.add(t)));
    return ["All", ...Array.from(tags)];
  }, [expenses]);

  // Filter & Sort Logic
  const filteredExpenses = React.useMemo(() => {
    return expenses
      .filter((e) => {
        const matchesSearch = e.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const amount = e.amount;
        const matchesMinAmount = !minAmount || amount >= parseFloat(minAmount);
        const matchesMaxAmount = !maxAmount || amount <= parseFloat(maxAmount);

        const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
        const matchesStatus = selectedStatus === "All" || e.status === selectedStatus;
        const matchesPayment = selectedPayment === "All" || e.paymentMethod === selectedPayment;
        const matchesOffline = !onlyOffline || e.isOffline;
        const matchesTag = selectedTag === "All" || e.tags?.includes(selectedTag);

        return matchesSearch && matchesMinAmount && matchesMaxAmount && matchesCategory && matchesStatus && matchesPayment && matchesOffline && matchesTag;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "desc" 
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
          return sortDirection === "desc" ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [expenses, searchTerm, minAmount, maxAmount, selectedCategory, selectedStatus, selectedPayment, onlyOffline, selectedTag, sortField, sortDirection]);

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map((e) => e.id));
    }
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => onDeleteExpense(id));
    setSelectedIds([]);
    showToast("Bulk deleted selected transaction profiles", "success");
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      onEditExpense(id, { approvalStatus: "Approved" });
    });
    setSelectedIds([]);
    showToast("Bulk approved selected workflow streams", "success");
  };

  const handleBulkExportJSON = () => {
    const items = expenses.filter((e) => selectedIds.includes(e.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `finsight_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported JSON stream successfully!", "success");
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // State transitions: Draft -> Submitted -> Pending Approval -> Approved -> Cleared
  const handleTransitionWorkflow = (newStatus: Expense["approvalStatus"]) => {
    if (!activeDetailsExpense) return;
    onEditExpense(activeDetailsExpense.id, {
      approvalStatus: newStatus,
      approver: "Alex Rivera (Lead Auditor)",
      approverNotes: approverNotesInput || activeDetailsExpense.approverNotes
    });
    setActiveDetailsExpense({
      ...activeDetailsExpense,
      approvalStatus: newStatus,
      approverNotes: approverNotesInput || activeDetailsExpense.approverNotes
    });
    setApproverNotesInput("");
    showToast(`Workflow status updated to ${newStatus}`, "success");
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Advanced Filters Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-sm">Advanced Search Filters</h3>
            <span className="px-2 py-0.5 bg-slate-950 text-slate-400 text-[10px] font-mono rounded-full border border-slate-850">
              {filteredExpenses.length} Records found
            </span>
          </div>
          
          <button
            onClick={() => {
              setSearchTerm("");
              setMinAmount("");
              setMaxAmount("");
              setSelectedCategory("All");
              setSelectedStatus("All");
              setSelectedPayment("All");
              setOnlyOffline(false);
              setSelectedTag("All");
            }}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Clear All Filter Vectors
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Text query */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search merchant, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Compliance States</option>
            <option value="Cleared">Cleared</option>
            <option value="Pending">Pending</option>
            <option value="Flagged">Flagged</option>
          </select>

          {/* Tags list */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Tag Handles</option>
            {allTags.filter(t => t !== "All").map((tag) => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>

        {/* Row 2 Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-800/40">
          
          {/* Min Max */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min Amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
            <span className="text-slate-500 font-mono text-xs">-</span>
            <input
              type="number"
              placeholder="Max Amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Payment Account */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Payment Accounts</option>
            {paymentMethods.filter(p => p !== "All").map((pay) => (
              <option key={pay} value={pay}>{pay}</option>
            ))}
          </select>

          {/* Offline Entry Switch */}
          <button
            onClick={() => setOnlyOffline(!onlyOffline)}
            className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              onlyOffline
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {onlyOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" /> Offline Entries Only
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Show All Network Syncs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bulk Actions Floating Bar (Only if selectedIds > 0) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-sky-950/20 border-2 border-sky-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs">
              {selectedIds.length}
            </span>
            <span className="text-white text-xs font-semibold">Transactions selected for batch management</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Mark Approved
            </button>
            <button
              onClick={handleBulkExportJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Export JSON
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Batch Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transaction Table ledger list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="pb-3 py-4 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort("date")}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="pb-3 py-4 font-medium">Merchant / Desc</th>
                <th className="pb-3 py-4 font-medium">Category</th>
                <th className="pb-3 py-4 font-medium text-right cursor-pointer hover:text-white" onClick={() => toggleSort("amount")}>
                  <div className="flex items-center gap-1 justify-end">Amount <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="pb-3 py-4 font-medium text-center">Compliance</th>
                <th className="pb-3 py-4 font-medium text-center">Workflow</th>
                <th className="pb-3 py-4 font-medium text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-mono text-xs">
                    No matching ledger profiles found. Adjust search query vectors.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => {
                  const isChecked = selectedIds.includes(e.id);
                  return (
                    <tr key={e.id} className={`hover:bg-slate-800/30 transition-colors ${isChecked ? "bg-sky-950/10" : ""}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(e.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 font-mono text-slate-400">{e.date}</td>
                      <td className="py-3.5">
                        <div className="max-w-xs">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {e.merchant}
                            {e.isOffline && (
                              <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-500 text-[8px] rounded font-mono font-bold border border-amber-500/10">OFFLINE</span>
                            )}
                          </p>
                          {e.notes && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{e.notes}</p>}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono rounded">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-white">
                        ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          e.status === "Cleared"
                            ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20"
                            : e.status === "Pending"
                            ? "text-sky-400 bg-sky-950/30 border-sky-500/20"
                            : "text-rose-400 bg-rose-950/30 border-rose-500/20"
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          e.approvalStatus === "Cleared"
                            ? "text-emerald-400 bg-emerald-950/10"
                            : e.approvalStatus === "Approved"
                            ? "text-sky-400 bg-sky-950/10"
                            : "text-amber-500 bg-amber-950/10"
                        }`}>
                          {e.approvalStatus || "Cleared"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveDetailsExpense(e)}
                            className="px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 text-[10px] font-bold text-sky-400 rounded transition-all cursor-pointer"
                          >
                            Audit Workflow
                          </button>
                          <button
                            onClick={() => onDeleteExpense(e.id)}
                            className="p-1 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Audit Workflow Details Modal */}
      {activeDetailsExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl space-y-6">
            
            <button
              onClick={() => setActiveDetailsExpense(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="text-[10px] font-mono font-black text-sky-400 tracking-widest uppercase">Compliance Audit Trail</span>
              <h3 className="text-lg font-black text-white mt-1">Transaction Details: {activeDetailsExpense.merchant}</h3>
              <p className="text-slate-400 text-xs">Full accountability ledger verification timeline and approval states.</p>
            </div>

            {/* Core Metadata Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Total Weight</span>
                <p className="text-sm font-mono font-bold text-white mt-0.5">${activeDetailsExpense.amount}</p>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Date Block</span>
                <p className="text-sm font-mono font-bold text-white mt-0.5">{activeDetailsExpense.date}</p>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Compliance State</span>
                <p className="text-sm font-bold text-white mt-0.5">{activeDetailsExpense.status}</p>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Payment Channel</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{activeDetailsExpense.paymentMethod || "Corporate Cash"}</p>
              </div>
            </div>

            {/* Workflow Approval States Tracker */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Workflow State Sequence</p>
              
              {/* Timeline Horizontal visualization */}
              <div className="flex items-center justify-between relative py-2">
                <div className="absolute inset-x-0 h-1 bg-slate-800 top-1/2 -translate-y-1/2 z-0"></div>
                
                {/* Steps mapping */}
                {([
                  { key: "Draft", label: "Draft Form" },
                  { key: "Submitted", label: "Submitted" },
                  { key: "Pending", label: "Under Review" },
                  { key: "Approved", label: "Approved" },
                  { key: "Cleared", label: "Cleared & Settled" }
                ] as const).map((step, idx) => {
                  const currentStatus = activeDetailsExpense.approvalStatus || "Cleared";
                  const states = ["Draft", "Submitted", "Pending", "Approved", "Cleared"];
                  const currentIndex = states.indexOf(currentStatus);
                  const isCompleted = idx <= currentIndex;
                  const isActive = step.key === currentStatus;

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                        isActive
                          ? "bg-sky-500 text-slate-950 ring-4 ring-sky-950"
                          : isCompleted
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`text-[10px] mt-2 font-mono ${isActive ? "text-sky-400 font-bold" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Logs & Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Simulated Audit Event Logs */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Audit Events Log</span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 h-36 overflow-y-auto space-y-2 text-[10px] font-mono text-slate-400">
                  <p className="text-slate-500">2026-07-20 10:42 AM - Outflow transaction declared via network sync.</p>
                  <p className="text-emerald-400">2026-07-20 10:43 AM - AI Receipt OCR mapping validation successful.</p>
                  <p className="text-slate-500">2026-07-20 11:15 AM - Metadata matching compliance check passed.</p>
                  {activeDetailsExpense.approverNotes && (
                    <p className="text-purple-400">2026-07-20 11:22 AM - Auditor Comment added: "{activeDetailsExpense.approverNotes}"</p>
                  )}
                </div>
              </div>

              {/* Right Column: Approver Decision box */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Auditor Resolution Controls</span>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">Audit notes or rejection remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Provide compliance check notes..."
                    value={approverNotesInput}
                    onChange={(e) => setApproverNotesInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTransitionWorkflow("Approved")}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleTransitionWorkflow("Rejected")}
                    className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Reject Flag
                  </button>
                </div>
              </div>

            </div>

            {/* Attachment Display */}
            {activeDetailsExpense.notes && (
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Linked Invoice:</span>
                <span className="text-sky-400 underline cursor-pointer hover:text-sky-300">receipt_attachment_img.png</span>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800/60">
              <button
                onClick={() => setActiveDetailsExpense(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
