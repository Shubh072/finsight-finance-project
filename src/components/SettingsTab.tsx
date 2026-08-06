import React from "react";
import { Sliders, RefreshCw, Eye, EyeOff, Check, Copy, Key, Globe, ShieldAlert, Sparkles, Database } from "lucide-react";
import { UserProfile } from "../types";
import { CURRENCIES } from "../utils/currency";

interface SettingsTabProps {
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  showToast?: (message: string, type?: "success" | "info" | "warning") => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userProfile,
  onUpdateProfile,
  showToast,
}) => {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  const [language, setLanguage] = React.useState("en");
  const currentCurrency = userProfile?.currency || "USD";
  const [savedBadge, setSavedBadge] = React.useState(false);
  const [privacyMode, setPrivacyMode] = React.useState(false);

  const handleCurrencyChange = (newCurrency: string) => {
    if (onUpdateProfile) {
      onUpdateProfile({ currency: newCurrency });
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2500);
      if (showToast) {
        showToast(`Default currency updated to ${newCurrency} (${CURRENCIES[newCurrency]?.symbol || "$"})`, "success");
      }
    }
  };

  // API integrations
  const [apiKey, setApiKey] = React.useState("fs_sk_prod_9a72b8d002f1a63b9281");
  const [showKey, setShowKey] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Connected accounts simulation
  const [connectedFeeds, setConnectedFeeds] = React.useState([
    { name: "Plaid Bank Feeds", connected: true, status: "Active synchronization" },
    { name: "Stripe Ledger Sync", connected: true, status: "Active webhook stream" },
    { name: "Coinbase API Ledger", connected: false, status: "Feeds inactive" },
    { name: "Kite Zerodha Portfolio", connected: false, status: "Feeds inactive" },
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenKey = () => {
    const chars = "abcdef0123456789";
    let token = "fs_sk_prod_";
    for (let i = 0; i < 20; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(token);
  };

  const toggleFeed = (index: number) => {
    setConnectedFeeds(prev =>
      prev.map((f, i) =>
        i === index
          ? { ...f, connected: !f.connected, status: !f.connected ? "Active synchronization" : "Feeds inactive" }
          : f
      )
    );
  };

  return (
    <div id="settings-tab-view" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-sky-400 text-xs font-mono tracking-widest uppercase">Platform Core</span>
          <h2 className="text-xl font-bold text-white mt-1">System Settings & Feed API</h2>
          <p className="text-slate-400 text-xs mt-1">
            Calibrate core terminal configurations, manage webhooks, and toggle database connections.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Settings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" /> General Terminal Parameters
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Default Platform Currency</label>
                {savedBadge && (
                  <span className="text-[10px] text-emerald-400 font-bold font-mono flex items-center gap-1 animate-pulse">
                    <Check className="w-3 h-3" /> Saved & Persisted
                  </span>
                )}
              </div>
              <select
                value={currentCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono font-medium cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">System Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="de">Deutsch (DE)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Interface Theme Preset</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`py-2 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                    theme === "dark"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Cosmic Dark
                </button>
                <button
                  type="button"
                  disabled
                  className="py-2 rounded-lg text-xs font-bold border bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed"
                >
                  Light Mode (Pro members only)
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800/60">
              <div>
                <h4 className="text-xs font-bold text-white">Aggressive Privacy Shield</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Encrypts ledger values from standard browser cache</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={(e) => setPrivacyMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* API & Webhooks integrations */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-400" /> Developer API Credentials
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Active Master Secret Key</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <input
                  type={showKey ? "text" : "password"}
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer relative"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleRegenKey}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[9px] text-slate-500 leading-normal block mt-1">
                Provide this master token to sync Finsight analytics with third-party automation tools like Zapier or Retool.
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Connected API Accounts</label>

              <div className="space-y-2">
                {connectedFeeds.map((feed, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-slate-500" />
                        {feed.name}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{feed.status}</p>
                    </div>

                    <button
                      onClick={() => toggleFeed(idx)}
                      className={`px-3 py-1 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                        feed.connected
                          ? "bg-sky-500/10 border-sky-500 text-sky-400 hover:bg-sky-500/20"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {feed.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OFFLINE LOCAL STORAGE DATA BACKUP & RESTORE */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline Local Engine
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Local Data Backup & Snapshot Migration</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Since FinSight operates 100% offline local-first, all your financial records stay strictly inside your browser's local database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => {
              const exportData = {
                version: "1.0-offline",
                timestamp: new Date().toISOString(),
                profile: JSON.parse(localStorage.getItem("finsight_profile") || "{}"),
                expenses: JSON.parse(localStorage.getItem("finsight_expenses") || "[]"),
                budgets: JSON.parse(localStorage.getItem("finsight_budgets") || "[]"),
                holdings: JSON.parse(localStorage.getItem("finsight_holdings") || "[]"),
                goals: JSON.parse(localStorage.getItem("finsight_goals") || "[]"),
                notifications: JSON.parse(localStorage.getItem("finsight_notifications") || "[]"),
                chats: JSON.parse(localStorage.getItem("finsight_chats") || "{}")
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `finsight_offline_backup_${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left space-y-2 group transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Export Complete Offline Backup (.json)
              </span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Download your complete offline database snapshot including transactions, holdings, budgets, and settings.
            </p>
          </button>

          <label
            htmlFor="offline-backup-restore-input"
            className="p-4 bg-slate-950 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left space-y-2 group transition-all cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                Import Offline Snapshot (.json)
              </span>
              <RefreshCw className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Restore previously saved offline backups directly into your browser's local storage.
            </p>
            <input
              id="offline-backup-restore-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const data = JSON.parse(ev.target?.result as string);
                      if (data.profile) localStorage.setItem("finsight_profile", JSON.stringify(data.profile));
                      if (data.expenses) localStorage.setItem("finsight_expenses", JSON.stringify(data.expenses));
                      if (data.budgets) localStorage.setItem("finsight_budgets", JSON.stringify(data.budgets));
                      if (data.holdings) localStorage.setItem("finsight_holdings", JSON.stringify(data.holdings));
                      if (data.goals) localStorage.setItem("finsight_goals", JSON.stringify(data.goals));
                      if (data.notifications) localStorage.setItem("finsight_notifications", JSON.stringify(data.notifications));
                      if (data.chats) localStorage.setItem("finsight_chats", JSON.stringify(data.chats));
                      alert("Offline backup imported successfully! The page will now reload.");
                      window.location.reload();
                    } catch (err) {
                      alert("Invalid backup JSON file.");
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
