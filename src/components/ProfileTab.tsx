import React from "react";
import { User, Shield, Bell, Eye, Database, Key, CheckCircle, RefreshCw, Smartphone, Laptop, Trash2, Camera, Upload, Check } from "lucide-react";
import { UserProfile, SecuritySettings, NotificationSettings } from "../types";
import { CURRENCIES } from "../utils/currency";

interface ProfileTabProps {
  userProfile: UserProfile;
  securitySettings: SecuritySettings;
  notificationSettings: NotificationSettings;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateSecurity: (updated: Partial<SecuritySettings>) => void;
  onUpdateNotifications: (updated: Partial<NotificationSettings>) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userProfile,
  securitySettings,
  notificationSettings,
  onUpdateProfile,
  onUpdateSecurity,
  onUpdateNotifications,
}) => {
  const [apiKeyVisible, setApiKeyVisible] = React.useState(false);
  const [mockApiKey, setMockApiKey] = React.useState("fs_live_7a8d29c8fe0412db93e390234a5d");

  const regenerateApiKey = () => {
    const chars = "abcdef0123456789";
    let token = "fs_live_";
    for (let i = 0; i < 20; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    setMockApiKey(token);
  };

  const handleRiskChange = (val: 'Conservative' | 'Moderate' | 'Aggressive') => {
    onUpdateProfile({ riskTolerance: val });
  };

  const handleGoalChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdateProfile({ monthlyGoal: num });
    }
  };

  const handleSessionRevoke = (id: string) => {
    const updatedSessions = securitySettings.activeSessions.filter(s => s.id !== id);
    onUpdateSecurity({ activeSessions: updatedSessions });
  };

  const [photoSavedMessage, setPhotoSavedMessage] = React.useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          onUpdateProfile({ profilePhoto: result });
          setPhotoSavedMessage(true);
          setTimeout(() => setPhotoSavedMessage(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="profile-tab-view" className="space-y-6">
      {/* Upper Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-5 z-10">
          <div className="relative group shrink-0">
            {userProfile.profilePhoto ? (
              userProfile.profilePhoto.startsWith("data:") || userProfile.profilePhoto.startsWith("http") ? (
                <img
                  src={userProfile.profilePhoto}
                  alt="Profile Avatar"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full border-2 border-sky-500/40 object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-950 border-2 border-sky-500/40 flex items-center justify-center text-3xl shadow-lg">
                  {userProfile.profilePhoto}
                </div>
              )
            ) : (
              <div className="w-20 h-20 rounded-full bg-sky-500/10 border-2 border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-2xl shadow-lg">
                {userProfile.avatar || "U"}
              </div>
            )}

            {/* Hover overlay camera button */}
            <label
              htmlFor="dashboard-avatar-file-upload"
              className="absolute inset-0 bg-slate-950/70 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-sky-400/50"
              title="Upload new profile photo"
            >
              <Camera className="w-5 h-5 text-sky-400 mb-0.5" />
              <span className="text-[9px] font-bold">Change</span>
            </label>
            <input
              type="file"
              id="dashboard-avatar-file-upload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono rounded-full border border-emerald-500/20">
                {userProfile.role}
              </span>
            </div>
            <p className="text-slate-400 text-xs">{userProfile.email} | {userProfile.phone || "Not Provided"}</p>
            {photoSavedMessage && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono pt-1">
                <Check className="w-3 h-3" /> Profile photo updated & saved!
              </span>
            )}
          </div>
        </div>

        {/* Quick Upload & Emoji Preset Controls */}
        <div className="flex flex-col sm:items-end gap-2.5 z-10 w-full sm:w-auto">
          <label
            htmlFor="dashboard-avatar-file-upload"
            className="px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" /> Upload Profile Photo
          </label>

          <div className="flex items-center gap-1.5 justify-center sm:justify-end">
            <span className="text-[10px] font-mono text-slate-500 mr-1">Avatars:</span>
            {["💼", "📈", "🛡️", "👑", "🚀", "🤖"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onUpdateProfile({ profilePhoto: emoji });
                  setPhotoSavedMessage(true);
                  setTimeout(() => setPhotoSavedMessage(false), 3000);
                }}
                className={`w-7 h-7 rounded-lg bg-slate-950 border text-xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                  userProfile.profilePhoto === emoji ? "border-sky-400 text-white" : "border-slate-800 text-slate-400"
                }`}
                title={`Set avatar to ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Dossier Details Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-sky-400" />
            Sovereign Identity Credentials
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Platform Username</span>
              <span className="text-white font-bold">{userProfile.username || "Not Provided"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Biological Gender</span>
              <span className="text-white font-bold">{userProfile.gender || "Not Provided"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Date of Birth</span>
              <span className="text-white font-bold">{userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : "Not Provided"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400 uppercase tracking-wider text-[9px]">Session Activation Date</span>
              <span className="text-white font-bold">{userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleString() : "Not Provided"}</span>
            </div>
          </div>
        </div>
        {/* Financial Preference settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-sky-400" />
            Financial Targets & Profile Calibration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">Risk Tolerance Calibrator</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Conservative', 'Moderate', 'Aggressive'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRiskChange(r)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      userProfile.riskTolerance === r
                        ? "bg-sky-500/20 border-sky-500 text-sky-400"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Target Monthly Savings (USD)</label>
              <input
                type="number"
                value={userProfile.monthlyGoal}
                onChange={(e) => handleGoalChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Trading Base Currency</label>
                <select
                  value={userProfile.currency || "USD"}
                  onChange={(e) => onUpdateProfile({ currency: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono font-medium focus:outline-none focus:border-sky-500/50 cursor-pointer"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Settlement Bank Account</label>
                <select
                  disabled
                  value={userProfile.defaultAccount}
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                >
                  <option value="Chase Sapphire Preferred">Chase Sapphire</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-sky-400" />
            Security Shield & Access Configuration
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-semibold text-white">Multi-Factor Authentication (2FA)</h4>
                <p className="text-[10px] text-slate-500">Google/Microsoft Authenticator app compliance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => onUpdateSecurity({ twoFactorEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* Developer credentials mock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">FinSight Developer API Key</h4>
                  <p className="text-[10px] text-slate-500">For algorithmic trading integrations</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSecurity({ apiKeyEnabled: !securitySettings.apiKeyEnabled })}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium cursor-pointer"
                >
                  {securitySettings.apiKeyEnabled ? "Deactivate" : "Activate"}
                </button>
              </div>

              {securitySettings.apiKeyEnabled && (
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <input
                    type={apiKeyVisible ? "text" : "password"}
                    readOnly
                    value={mockApiKey}
                    className="flex-1 bg-transparent font-mono text-[10px] text-slate-300 focus:outline-none"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={regenerateApiKey}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-950/30 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Offline Backup Codes Left</span>
              <span className="font-mono text-xs font-bold text-white">{securitySettings.backupCodesCount} Codes</span>
            </div>
          </div>
        </div>

        {/* Notifications and settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-sky-400" />
            AI Reports & Alerts Subscriptions
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Continuous AI Wealth Summaries</h4>
                <p className="text-[10px] text-slate-500">Weekly predictive forecast reports in inbox</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.aiSummaries}
                  onChange={(e) => onUpdateNotifications({ aiSummaries: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Email Transaction Records</h4>
                <p className="text-[10px] text-slate-500">Receive monthly consolidated audit ledger statements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={(e) => onUpdateNotifications({ email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Push Alert Threshold Violations</h4>
                <p className="text-[10px] text-slate-500">Immediate warnings on anomalous risk variance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.push}
                  onChange={(e) => onUpdateNotifications({ push: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Active sessions list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Smartphone className="w-4.5 h-4.5 text-sky-400" />
            Active Session Security Audit
          </h3>

          <div className="space-y-3.5">
            {securitySettings.activeSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-slate-950/30 border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-950 text-slate-300 rounded-lg">
                    {s.device.toLowerCase().includes("mac") || s.device.toLowerCase().includes("windows") ? (
                      <Laptop className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold text-white">{s.device}</h4>
                      {s.isCurrent && (
                        <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.location} | {s.ip} | {s.lastActive}</p>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button
                    onClick={() => handleSessionRevoke(s.id)}
                    className="p-1.5 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
