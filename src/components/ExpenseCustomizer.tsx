import React from "react";
import { Plus, Check, Settings, Trash2, Shield, Globe, Landmark, Map, RefreshCw } from "lucide-react";

interface ExpenseCustomizerProps {
  categories: { name: string; color: string; icon: string }[];
  onAddCategory: (cat: { name: string; color: string; icon: string }) => void;
  onRemoveCategory: (name: string) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const ExpenseCustomizer: React.FC<ExpenseCustomizerProps> = ({
  categories,
  onAddCategory,
  onRemoveCategory,
  showToast,
}) => {
  // New Category form state
  const [newCatName, setNewCatName] = React.useState("");
  const [newCatColor, setNewCatColor] = React.useState("emerald");
  const [newCatIcon, setNewCatIcon] = React.useState("Layers");

  // Merchant configurations
  const [merchants, setMerchants] = React.useState<{ name: string; defaultCategory: string; country: string; suspicious: boolean }[]>([
    { name: "Whole Foods Market", defaultCategory: "Food", country: "United States", suspicious: false },
    { name: "PG&E Energy Utilities", defaultCategory: "Utilities", country: "United States", suspicious: false },
    { name: "Fly Emirates Booking", defaultCategory: "Travel", country: "United Arab Emirates", suspicious: false },
    { name: "AWS Cloud Invoicing", defaultCategory: "Utilities", country: "Ireland", suspicious: false },
    { name: "Equinox Gym Membership", defaultCategory: "Entertainment", country: "United States", suspicious: false },
    { name: "Unknown Merch charge", defaultCategory: "Other", country: "Lithuania", suspicious: true }
  ]);
  const [newMerchantName, setNewMerchantName] = React.useState("");
  const [newMerchantCategory, setNewMerchantCategory] = React.useState("Food");

  // Travel exchange rates state
  const [exchangeRates, setExchangeRates] = React.useState<{ currency: string; symbol: string; rate: number; active: boolean }[]>([
    { currency: "EUR (Euro Zone)", symbol: "€", rate: 1.09, active: true },
    { currency: "GBP (Great British Pound)", symbol: "£", rate: 1.28, active: true },
    { currency: "JPY (Japanese Yen)", symbol: "¥", rate: 0.0064, active: true },
    { currency: "AUD (Australian Dollar)", symbol: "A$", rate: 0.67, active: false }
  ]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (categories.some((c) => c.name.toLowerCase() === newCatName.toLowerCase().trim())) {
      showToast("Category name already exists", "warning");
      return;
    }
    onAddCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: newCatIcon
    });
    setNewCatName("");
    showToast(`Custom category '${newCatName}' compiled successfully!`, "success");
  };

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantName.trim()) return;
    setMerchants([...merchants, {
      name: newMerchantName.trim(),
      defaultCategory: newMerchantCategory,
      country: "United States",
      suspicious: false
    }]);
    setNewMerchantName("");
    showToast(`Merchant configuration for '${newMerchantName}' registered!`, "success");
  };

  const toggleSuspiciousMerchant = (name: string) => {
    setMerchants(merchants.map((m) => m.name === name ? { ...m, suspicious: !m.suspicious } : m));
    showToast("Merchant risk profile updated", "info");
  };

  const toggleExchangeRateActive = (currency: string) => {
    setExchangeRates(exchangeRates.map((r) => r.currency === currency ? { ...r, active: !r.active } : r));
    showToast("Active travel currency toggled", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Category Management Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-400" />
            Category & Icon Manager
          </h3>
          <p className="text-slate-400 text-xs mt-1">Configure structural metadata tags and define custom colors for financial categorizations.</p>
        </div>

        {/* Categories List */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Currently Active Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <div key={c.name} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-${c.color}-500`}></span>
                  <span className="text-xs font-bold text-white">{c.name}</span>
                </div>
                {categories.length > 4 && (
                  <button
                    onClick={() => onRemoveCategory(c.name)}
                    className="p-1 hover:bg-rose-900/10 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleCreateCategory} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Add Custom Corporate Category</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Marketing"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium">Color Scheme</label>
              <select
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="emerald">Emerald Green</option>
                <option value="sky">Sky Blue</option>
                <option value="rose">Rose Red</option>
                <option value="purple">Purple Indigo</option>
                <option value="amber">Amber Yellow</option>
                <option value="orange">Orange Citrus</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Compile Category
          </button>
        </form>
      </div>

      {/* Merchant Risk Management Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-rose-400" />
            Merchant Risk Profiles & Audits
          </h3>
          <p className="text-slate-400 text-xs mt-1">Audit merchant relationships, default mapping categories, and trigger compliance alerts.</p>
        </div>

        {/* Merchants List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {merchants.map((m) => (
            <div key={m.name} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-850">
              <div>
                <p className="text-xs font-bold text-white">{m.name}</p>
                <span className="text-[9px] font-mono text-slate-500">{m.defaultCategory} • {m.country}</span>
              </div>
              <button
                onClick={() => toggleSuspiciousMerchant(m.name)}
                className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  m.suspicious
                    ? "bg-rose-950/30 text-rose-400 border border-rose-500/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {m.suspicious ? "⚠️ Suspicious" : "Trustworthy"}
              </button>
            </div>
          ))}
        </div>

        {/* Quick Add Merchant */}
        <form onSubmit={handleCreateMerchant} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Log new merchant standard..."
            value={newMerchantName}
            onChange={(e) => setNewMerchantName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Register
          </button>
        </form>
      </div>

      {/* Travel Currency Convert Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-400" />
              Travel Mode: Global Invoicing rates
            </h3>
            <p className="text-slate-400 text-xs mt-1">Convert foreign bills to primary account ledger weights using live conversion anchors.</p>
          </div>
          <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono rounded-full">Primary: USD ($)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {exchangeRates.map((r) => (
            <div
              key={r.currency}
              onClick={() => toggleExchangeRateActive(r.currency)}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                r.active
                  ? "bg-sky-950/20 border-sky-500/30 text-sky-400"
                  : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800"
              }`}
            >
              {r.active && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-sky-400"></span>}
              <span className="text-[10px] font-mono uppercase block text-slate-500">Currency Rate</span>
              <h4 className="text-sm font-black text-white mt-1">{r.currency}</h4>
              <p className="text-lg font-mono font-bold mt-2 text-sky-400">
                1 {r.symbol} = {r.rate} USD
              </p>
              <span className="text-[9px] font-mono text-slate-500 block mt-1">
                {r.active ? "Enabled in Travel Mode" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
