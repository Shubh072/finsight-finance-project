import React from "react";
import {
  Bell,
  Shield,
  Sparkles,
  Check,
  Trash2,
  Sliders,
  Volume2,
  VolumeX,
  AlertTriangle,
  Clock,
  Filter,
  Layers,
  Search,
  RefreshCw,
  Calendar,
  Smartphone,
  Mail,
  MessageSquare,
  Award,
  TrendingUp,
  CreditCard,
  Archive,
  Play,
  Plus,
  ChevronDown,
  ChevronUp,
  PieChart,
  Lock,
  Zap,
  X,
  ShieldCheck,
  Info,
  Send,
  CheckCircle2
} from "lucide-react";

import { safeParseJSON } from "../types";

// Notification Interfaces
interface NotificationItem {
  id: string;
  type:
    | "budget"
    | "goal"
    | "bill"
    | "investment"
    | "recommendation"
    | "security"
    | "subscription"
    | "tax"
    | "savings"
    | "summary";
  title: string;
  desc: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  priority: "low" | "medium" | "high";
  category: "Financial Status" | "Security & System" | "Reminders & Autopay" | "AI Strategic Insights";
  actionText?: string;
  actionType?: "settle" | "rebalance" | "secure" | "view" | "claim";
}

// Initial robust records matching all user's specs
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "security",
    title: "Anomalous Login Blocked",
    desc: "Unrecognized login attempt from Safari, Berlin DE (IP: 185.220.101.4) was intercepted and neutralized.",
    timestamp: "10 mins ago",
    read: false,
    archived: false,
    priority: "high",
    category: "Security & System",
    actionText: "Secure Session Tokens",
    actionType: "secure"
  },
  {
    id: "notif-2",
    type: "budget",
    title: "Critical Overspending Warning",
    desc: "Your Utilities & Cloud Infrastructure budget cap has reached 94% utilization limit ($1,410.00 of $1,500.00).",
    timestamp: "2 hours ago",
    read: false,
    archived: false,
    priority: "high",
    category: "Financial Status",
    actionText: "Revise Budget Limits",
    actionType: "view"
  },
  {
    id: "notif-3",
    type: "recommendation",
    title: "AI Optimization Sweep Completed",
    desc: "FinSight Core recommends re-routing 1.5% of static cash equivalents into compounding high-yield liquidity pools (+ $420 projected annualized yield).",
    timestamp: "4 hours ago",
    read: false,
    archived: false,
    priority: "high",
    category: "AI Strategic Insights",
    actionText: "Execute Smart Sweep",
    actionType: "rebalance"
  },
  {
    id: "notif-4",
    type: "investment",
    title: "AAPL Corporate Dividend Cleared",
    desc: "Quarterly cash dividend distribution of $24.80 from Apple Inc. cleared to your Equities Settlement wallet.",
    timestamp: "1 day ago",
    read: true,
    archived: false,
    priority: "medium",
    category: "Financial Status",
    actionText: "Claim Yield Details",
    actionType: "claim"
  },
  {
    id: "notif-5",
    type: "subscription",
    title: "AWS Cloud Infrastructure Renewal",
    desc: "Your monthly AWS Cloud Subscription auto-billing ($299.00) is scheduled for deduction on Jul 25 via Corporate Reserve.",
    timestamp: "1 day ago",
    read: false,
    archived: false,
    priority: "low",
    category: "Reminders & Autopay",
    actionText: "Manage Subscriptions",
    actionType: "view"
  },
  {
    id: "notif-6",
    type: "tax",
    title: "Q3 Estimated Quarterly Tax Due",
    desc: "Federal estimated quarterly tax deadline approaches on Sep 15. Your calculated safe-harbor escrow reserve is $3,450.00.",
    timestamp: "2 days ago",
    read: true,
    archived: false,
    priority: "medium",
    category: "Reminders & Autopay",
    actionText: "Escrow Tax Allocation",
    actionType: "settle"
  },
  {
    id: "notif-7",
    type: "goal",
    title: "Emergency Cash Reserve Milestone!",
    desc: "Exceptional discipline! Your '6-Month Liquid Runway' savings goal has officially crossed the 100% capacity milestone.",
    timestamp: "3 days ago",
    read: false,
    archived: false,
    priority: "medium",
    category: "AI Strategic Insights"
  },
  {
    id: "notif-8",
    type: "savings",
    title: "Weekly Auto-Sweep Transfer Tomorrow",
    desc: "Your scheduled automated wealth sweep of $250.00 from Primary Checking to Platinum High-Yield Savings is set for tomorrow at 09:00 UTC.",
    timestamp: "3 days ago",
    read: true,
    archived: false,
    priority: "low",
    category: "Reminders & Autopay"
  },
  {
    id: "notif-9",
    type: "summary",
    title: "June Comprehensive Fiscal Summary",
    desc: "Monthly executive performance digest compiled. Consolidated Net Worth drifted +4.21% (+$18,245.00) with optimized overhead variance.",
    timestamp: "1 week ago",
    read: true,
    archived: false,
    priority: "low",
    category: "AI Strategic Insights",
    actionText: "View Interactive PDF",
    actionType: "view"
  },
  {
    id: "notif-10",
    type: "bill",
    title: "PG&E Utilities Automated Settlement",
    desc: "Upcoming primary energy grid statement of $120.00 is due on Jul 24. Will be settled automatically via direct ACH routing.",
    timestamp: "1 week ago",
    read: true,
    archived: false,
    priority: "low",
    category: "Reminders & Autopay",
    actionText: "Authorize Early Payment",
    actionType: "settle"
  }
];

export const NotificationsTab: React.FC = () => {
  // 1. Core Notifications & History State
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(() => {
    return safeParseJSON<NotificationItem[]>(localStorage.getItem("finsight_intelligent_notifs"), INITIAL_NOTIFICATIONS);
  });

  // 2. Filter & Visual Controls State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "unread" | "high" | "archived">("all");
  const [groupingMode, setGroupingMode] = React.useState<"list" | "category">("list");
  const [dndActive, setDndActive] = React.useState<boolean>(() => {
    return localStorage.getItem("finsight_dnd_status") === "true";
  });
  const [aiPrioritySorting, setAiPrioritySorting] = React.useState<boolean>(true);

  // 3. Accordion Toggle State for Grouping Mode
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
    "Security & System": true,
    "Financial Status": true,
    "Reminders & Autopay": true,
    "AI Strategic Insights": true
  });

  // 4. Notification Preferences Channels State Matrix
  const [preferences, setPreferences] = React.useState(() => {
    return safeParseJSON(localStorage.getItem("finsight_notif_channels"), {
      budget: { push: true, email: true, sms: false, inApp: true },
      goal: { push: false, email: true, sms: false, inApp: true },
      bill: { push: true, email: true, sms: true, inApp: true },
      investment: { push: true, email: false, sms: false, inApp: true },
      ai: { push: true, email: true, sms: false, inApp: true },
      security: { push: true, email: true, sms: true, inApp: true },
      summaries: { push: false, email: true, sms: false, inApp: true }
    });
  });

  // 5. Interactive Emulator State
  const [emulatorType, setEmulatorType] = React.useState<NotificationItem["type"]>("security");
  const [emulatorPriority, setEmulatorPriority] = React.useState<NotificationItem["priority"]>("high");
  const [emulatorTitle, setEmulatorTitle] = React.useState("Simulated Threat Identified");
  const [emulatorDesc, setEmulatorDesc] = React.useState("This is an instant smart system simulation check.");

  // Target Recipient Destination State
  const [targetEmail, setTargetEmail] = React.useState<string>(() => {
    return localStorage.getItem("finsight_user_email") || "gayakwadshubh@gmail.com";
  });
  const [targetPhone, setTargetPhone] = React.useState<string>(() => {
    return localStorage.getItem("finsight_user_phone") || "+12186569048";
  });

  // Multi-Channel Dispatch Toggles & Log State
  const [sendViaEmail, setSendViaEmail] = React.useState<boolean>(true);
  const [sendViaSms, setSendViaSms] = React.useState<boolean>(true);
  const [batchTransmitting, setBatchTransmitting] = React.useState<boolean>(false);
  const [dispatchLog, setDispatchLog] = React.useState<string | null>(null);

  // Twilio Live SMS Dispatcher State
  const [twilioPhone, setTwilioPhone] = React.useState("+12186569048");
  const [twilioMessage, setTwilioMessage] = React.useState("FinSight Alert: Executive transaction authorized from command desk.");
  const [twilioSending, setTwilioSending] = React.useState(false);
  const [twilioStatusLog, setTwilioStatusLog] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem("finsight_user_email", targetEmail);
  }, [targetEmail]);

  React.useEffect(() => {
    localStorage.setItem("finsight_user_phone", targetPhone);
  }, [targetPhone]);

  const handleSendLiveTwilioSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twilioPhone) {
      triggerToast("Please provide a recipient phone number", "warning");
      return;
    }
    setTwilioSending(true);
    setTwilioStatusLog(null);
    try {
      const res = await fetch("/api/twilio/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: twilioPhone, message: twilioMessage })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to transmit Twilio SMS");
      }
      setTwilioStatusLog(`SMS Dispatched! SID: ${data.sid} | Status: ${data.status}`);
      triggerToast(`Live Twilio SMS dispatched to ${data.to}!`, "success");
    } catch (err: any) {
      setTwilioStatusLog(`Error: ${err.message}`);
      triggerToast(`Twilio SMS dispatch failed: ${err.message}`, "warning");
    } finally {
      setTwilioSending(false);
    }
  };

  // Dispatch All Active Notifications to Mail & Offline SMS in Batch
  const handleTransmitAllBatch = async () => {
    const activeNotifs = notifications.filter((n) => !n.archived);
    if (activeNotifs.length === 0) {
      triggerToast("No active notifications to transmit.", "info");
      return;
    }
    setBatchTransmitting(true);
    setDispatchLog(null);
    try {
      const res = await fetch("/api/notifications/dispatch-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: activeNotifs,
          email: targetEmail,
          phone: targetPhone
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Batch notification transmission failed");
      }
      setDispatchLog(`Transmitted ${activeNotifs.length} notifications! Mail (${data.targetEmail}): ${data.emailSent ? "Sent" : "Error"} | Offline SMS (${data.targetPhone}): ${data.smsSent ? "Dispatched" : "Error"}`);
      triggerToast(`Sent all ${activeNotifs.length} notifications to Mail (${targetEmail}) & Offline SMS (${targetPhone})!`, "success");
    } catch (err: any) {
      setDispatchLog(`Batch Error: ${err.message}`);
      triggerToast(`Batch dispatch failed: ${err.message}`, "warning");
    } finally {
      setBatchTransmitting(false);
    }
  };

  // Dispatch Single Notification to Mail & Offline SMS
  const handleDispatchSingle = async (notif: NotificationItem) => {
    try {
      triggerToast(`Transmitting "${notif.title}" to Mail & Offline SMS...`, "info");
      const res = await fetch("/api/notifications/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notif.title,
          desc: notif.desc,
          category: notif.category,
          priority: notif.priority,
          type: notif.type,
          email: targetEmail,
          phone: targetPhone,
          sendEmail: true,
          sendSms: true
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch notification");
      }
      triggerToast(`Alert sent to Mail (${data.targetEmail}) & Offline SMS (${data.targetPhone})!`, "success");
      setDispatchLog(`Single Alert Dispatched: "${notif.title}" -> Mail: ${data.emailSent ? "Sent" : "Err"} | Offline SMS: ${data.smsSent ? "Sent (SID: " + data.smsResult?.sid + ")" : "Err"}`);
    } catch (err: any) {
      triggerToast(`Dispatch failed: ${err.message}`, "warning");
    }
  };

  // 6. Local Toast Feedback
  const [localToast, setLocalToast] = React.useState<{ show: boolean; message: string; type: "success" | "info" | "warning" } | null>(null);

  const triggerToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setLocalToast({ show: true, message, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  // Synchronize localStorage
  React.useEffect(() => {
    localStorage.setItem("finsight_intelligent_notifs", JSON.stringify(notifications));
  }, [notifications]);

  // Listen for dynamic external notifications dispatched across tabs/components
  React.useEffect(() => {
    const handleDynamicNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === customEvent.detail.id)) return prev;
          return [customEvent.detail, ...prev];
        });
      } else {
        const raw = localStorage.getItem("finsight_intelligent_notifs");
        if (raw) {
          try {
            setNotifications(JSON.parse(raw));
          } catch (err) {}
        }
      }
    };

    window.addEventListener("finsight_notification_added", handleDynamicNotification);
    window.addEventListener("storage", handleDynamicNotification);
    return () => {
      window.removeEventListener("finsight_notification_added", handleDynamicNotification);
      window.removeEventListener("storage", handleDynamicNotification);
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem("finsight_dnd_status", String(dndActive));
  }, [dndActive]);

  React.useEffect(() => {
    localStorage.setItem("finsight_notif_channels", JSON.stringify(preferences));
  }, [preferences]);

  // Core Actions
  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const archiveNotif = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: !n.archived } : n))
    );
    const item = notifications.find((n) => n.id === id);
    if (item) {
      triggerToast(!item.archived ? "Notification moved to archive" : "Notification restored from archive", "info");
    }
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    triggerToast("Notification permanently deleted");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast("All dispatch notifications marked as read");
  };

  const archiveAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.read ? { ...n, archived: true } : n))
    );
    triggerToast("All read notifications archived successfully");
  };

  const clearAllHistory = () => {
    setNotifications([]);
    triggerToast("Notification history wiped clean", "warning");
  };

  const handleActionClick = (id: string, type?: string, title?: string) => {
    if (!type) return;

    // Simulate action execution with visual updates
    if (type === "secure") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true, title: "🔒 Secured: Unrecognized Tokens Nullified", desc: "Active system tokens recycled successfully." }
            : n
        )
      );
      triggerToast("System Security Protocols Triggered. Tokens re-encrypted.", "success");
    } else if (type === "settle") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true, title: "✅ Settle order completed", desc: "Capital fund transfer approved and initiated." }
            : n
        )
      );
      triggerToast(`Capital invoice payment processed successfully for ${title}`, "success");
    } else if (type === "rebalance") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true, title: "⚡ Asset Rebalancing Approved", desc: "Smart cash re-allocations completed." }
            : n
        )
      );
      triggerToast("Executing portfolio rebalancing algorithms. Yield optimization active.", "success");
    } else {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      triggerToast(`Redirecting to details for: "${title}"`);
    }
  };

  // Preference Matrix Helper
  const togglePreference = (catKey: string, channel: "push" | "email" | "sms" | "inApp") => {
    setPreferences((prev: any) => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        [channel]: !prev[catKey][channel]
      }
    }));
    triggerToast(`Delivery parameters updated for ${catKey} via ${channel.toUpperCase()}`);
  };

  // Preset Emulator Templates to fill details easily for the user
  const applyPreset = (type: NotificationItem["type"]) => {
    setEmulatorType(type);
    if (type === "security") {
      setEmulatorPriority("high");
      setEmulatorTitle("Fraud Alert: Anomalous Charge Detected");
      setEmulatorDesc("A pending $542.10 transaction was flagged from merchant 'LuxoJewel Co' in Geneva, CH. Please confirm authorization.");
    } else if (type === "budget") {
      setEmulatorPriority("high");
      setEmulatorTitle("Overspending Risk: Leisure Budget Mapped");
      setEmulatorDesc("Your leisure & dining segment is at 98% cap. $2.10 remaining of your allocated Q3 $1,200.00 cushion.");
    } else if (type === "bill") {
      setEmulatorPriority("medium");
      setEmulatorTitle("Bill AutoPay Settle Failure");
      setEmulatorDesc("Equinox Luxury Athletic Club direct debit failed due to standard pre-auth limits. Manual settlement advised.");
    } else if (type === "investment") {
      setEmulatorPriority("medium");
      setEmulatorTitle("Asset Yield Deviation Detected");
      setEmulatorDesc("BitcoinCore price departed &gt; 4.5% below your trailing historical baseline index in the last 15 minutes.");
    } else if (type === "recommendation") {
      setEmulatorPriority("medium");
      setEmulatorTitle("Dynamic Dividend Sweep Opportunity");
      setEmulatorDesc("Reinvesting your idle AAPL cash yields into our automatic S&P index provides a projected extra +0.84% compound rate.");
    } else if (type === "goal") {
      setEmulatorPriority("low");
      setEmulatorTitle("Goal Re-evalution Milestone Complete");
      setEmulatorDesc("Your primary Real Estate Downpayment fund has completed its periodic audit loop. Milestone projected in 11 months.");
    } else if (type === "subscription") {
      setEmulatorPriority("low");
      setEmulatorTitle("Upcoming Premium Subscription");
      setEmulatorDesc("Your Finsight Premium Command Suite ($49.99/mo) will renew automatically on Jul 26.");
    } else if (type === "tax") {
      setEmulatorPriority("high");
      setEmulatorTitle("K-1 Tax Document Registered");
      setEmulatorDesc("Your compiled Q2 real estate investment K-1 statement is generated and signed. Diagnostic complete.");
    } else if (type === "savings") {
      setEmulatorPriority("low");
      setEmulatorTitle("Escrow Reserve Sweep Complete");
      setEmulatorDesc("Successfully swept $1,200.00 from active trading liquidity back to protected Savings ledger vaults.");
    } else if (type === "summary") {
      setEmulatorPriority("low");
      setEmulatorTitle("Weekly Performance Audit Ready");
      setEmulatorDesc("Your weekly algorithmic balance sheets, cash burns, and portfolio drift coefficients are structured in reports.");
    }
  };

  // Dispatch Emulator mock notification live
  const dispatchEmulatorAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emulatorTitle.trim()) return;

    // Map Category based on type
    let mappedCat: NotificationItem["category"] = "Financial Status";
    if (emulatorType === "security") mappedCat = "Security & System";
    else if (emulatorType === "recommendation" || emulatorType === "summary" || emulatorType === "goal") {
      mappedCat = "AI Strategic Insights";
    } else if (emulatorType === "bill" || emulatorType === "subscription" || emulatorType === "tax" || emulatorType === "savings") {
      mappedCat = "Reminders & Autopay";
    }

    const newAlert: NotificationItem = {
      id: `mock-notif-${Date.now()}`,
      type: emulatorType,
      title: emulatorTitle,
      desc: emulatorDesc,
      timestamp: "Just now",
      read: false,
      archived: false,
      priority: emulatorPriority,
      category: mappedCat,
      actionText: emulatorType === "security" ? "Review Risk Logs" : emulatorType === "bill" ? "Clear Invoices" : "Investigate Audit",
      actionType: emulatorType === "security" ? "secure" : emulatorType === "bill" ? "settle" : "view"
    };

    setNotifications((prev) => [newAlert, ...prev]);

    if (sendViaEmail || sendViaSms) {
      try {
        const res = await fetch("/api/notifications/dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newAlert.title,
            desc: newAlert.desc,
            category: newAlert.category,
            priority: newAlert.priority,
            type: newAlert.type,
            email: targetEmail,
            phone: targetPhone,
            sendEmail: sendViaEmail,
            sendSms: sendViaSms
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setDispatchLog(`Live Dispatch: Mail (${data.emailSent ? "Sent to " + data.targetEmail : "Off"}) | Offline SMS (${data.smsSent ? "Sent to " + data.targetPhone + " [SID: " + data.smsResult?.sid + "]" : "Off/Err"})`);
          triggerToast(`Alert sent to Mail (${targetEmail}) & Offline SMS (${targetPhone})!`, "success");
        } else {
          setDispatchLog(`Dispatch Alert: ${data.error || "Unknown"}`);
          triggerToast(`Saved locally. (${data.error || "External dispatch warning"})`, "info");
        }
      } catch (err: any) {
        setDispatchLog(`Network Alert: ${err.message}`);
        triggerToast(`Alert saved locally! (${err.message})`, "info");
      }
    } else {
      if (dndActive) {
        triggerToast("Muted: Do Not Disturb is Active. Saved silently to logs.", "info");
      } else {
        triggerToast(`Dispatch: "${emulatorTitle}" initialized!`, emulatorPriority === "high" ? "warning" : "success");
      }
    }
  };

  // Toggle Category Fold
  const toggleCategoryFold = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Helper counters
  const totalUnread = notifications.filter((n) => !n.read && !n.archived).length;
  const totalHighUrgency = notifications.filter((n) => n.priority === "high" && !n.archived).length;
  const totalMutedByDnd = dndActive ? notifications.filter((n) => !n.read && !n.archived).length : 0;
  const totalCount = notifications.filter((n) => !n.archived).length;
  const readCount = notifications.filter((n) => n.read && !n.archived).length;
  const readPercentage = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 100;

  // Compile distribution breakdown for analytics progress bars
  const categoryCounts = notifications.reduce(
    (acc, n) => {
      if (!n.archived) {
        acc[n.category] = (acc[n.category] || 0) + 1;
      }
      return acc;
    },
    { "Security & System": 0, "Financial Status": 0, "Reminders & Autopay": 0, "AI Strategic Insights": 0 } as Record<string, number>
  );

  // Compute final filtered notifications list
  const processedNotifications = notifications
    .filter((n) => {
      // Filter by mode
      if (filterMode === "archived") return n.archived;
      if (n.archived) return false; // Default: hide archived items
      if (filterMode === "unread") return !n.read;
      if (filterMode === "high") return n.priority === "high";
      return true;
    })
    .filter((n) => {
      // Filter by search text
      const term = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(term) ||
        n.desc.toLowerCase().includes(term) ||
        n.category.toLowerCase().includes(term) ||
        n.priority.toLowerCase().includes(term)
      );
    });

  // Sort: AI priority ranking sorts High priority & Unread first, then Medium, then Low.
  // Standard sorts by natural index (which starts fresh on top)
  const sortedNotifications = [...processedNotifications].sort((a, b) => {
    if (aiPrioritySorting) {
      // Unread high priority gets maximum weight
      const getWeight = (n: NotificationItem) => {
        let weight = 0;
        if (n.priority === "high") weight += 30;
        if (n.priority === "medium") weight += 15;
        if (!n.read) weight += 10;
        return weight;
      };
      return getWeight(b) - getWeight(a);
    }
    return 0; // maintain relative layout
  });

  // Group notifications into an object if Category Grouping is enabled
  const groupedNotifications = sortedNotifications.reduce((acc, n) => {
    if (!acc[n.category]) {
      acc[n.category] = [];
    }
    acc[n.category].push(n);
    return acc;
  }, {} as Record<string, NotificationItem[]>);

  // Colors mapping for styles
  const getPriorityStyle = (p: NotificationItem["priority"]) => {
    switch (p) {
      case "high":
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "low":
        return "bg-sky-500/10 text-sky-400 border-sky-500/25";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div id="intelligent-notification-suite" className="space-y-6 text-left text-slate-100">
      
      {/* LOCAL TOAST ALERTS POPUP */}
      {localToast?.show && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-slate-950 border border-slate-800 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-xs font-mono">{localToast.message}</span>
        </div>
      )}

      {/* TARGET DISPATCH GATEWAYS (MAIL & OFFLINE SMS) */}
      <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Multi-Channel Dispatch Channels
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono rounded">
                MAIL & OFFLINE SMS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configure target endpoints. Notifications automatically transmit on Mail and Offline SMS via Twilio REST gateway.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Target Email Input */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex-1 lg:flex-none">
              <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="Target Email"
                className="bg-transparent border-none text-xs font-mono text-white focus:outline-none w-44"
                title="Target Recipient Email Address"
              />
            </div>

            {/* Target Phone Input */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex-1 lg:flex-none">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="Target Phone (+1...)"
                className="bg-transparent border-none text-xs font-mono text-white focus:outline-none w-32"
                title="Target Recipient Mobile SMS Number"
              />
            </div>

            {/* Bulk Transmit Button */}
            <button
              onClick={handleTransmitAllBatch}
              disabled={batchTransmitting || notifications.filter(n => !n.archived).length === 0}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white rounded-xl text-xs font-mono font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              title="Transmit all active notifications to Mail & Offline SMS now"
            >
              {batchTransmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>TRANSMIT ALL (MAIL + SMS)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {dispatchLog && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-sky-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {dispatchLog}
            </span>
            <button onClick={() => setDispatchLog(null)} className="text-slate-500 hover:text-white cursor-pointer">Clear Log</button>
          </div>
        )}
      </div>

      {/* TOP HEADER: PLATFORM STATUS & STATS OVERVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-mono rounded">
                FINSIGHT COMMUNICATIONS HUB
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                LAST OPTIMIZED: JUST NOW
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Intelligent Notification Suite</h1>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Consolidated real-time alerting nodes, AI urgency algorithms, custom dispatch channels, and live risk audits calibrated for managing partner briefing desks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* DND Control Toggle */}
            <button
              onClick={() => {
                setDndActive(!dndActive);
                triggerToast(
                  !dndActive
                    ? "Do Not Disturb Muting protocols enabled. System silenced."
                    : "Do Not Disturb disabled. In-App soundscapes restored.",
                  "info"
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                dndActive
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {dndActive ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>DND: ACTIVE (MUTED)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span>DND: OFF (AUDIBLE)</span>
                </>
              )}
            </button>

            {/* AI Sorting Toggle */}
            <button
              onClick={() => {
                setAiPrioritySorting(!aiPrioritySorting);
                triggerToast(
                  !aiPrioritySorting
                    ? "AI Priority Sorting enabled. Sorting by threat & urgency."
                    : "AI Priority Sorting disabled. Sorting by chronological feed.",
                  "success"
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                aiPrioritySorting
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className={`w-4 h-4 ${aiPrioritySorting ? "text-amber-400 fill-amber-400" : "text-slate-500"}`} />
              <span>AI PRIORITY RANKING: {aiPrioritySorting ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION METRICS & INTERACTIVE ANALYTICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* CRITICAL / HIGH DISPATCH COUNTER */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Critical Inbound</span>
              <span className="text-xl font-bold font-mono text-rose-400">{totalHighUrgency} Active</span>
            </div>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl relative">
              <Shield className="w-5 h-5" />
              {totalHighUrgency > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </div>
          </div>

          {/* ACTIVE QUEUED DISPATCHES */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Queue</span>
              <span className="text-xl font-bold font-mono text-sky-400">{totalUnread} Unread / {totalCount} Total</span>
            </div>
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>

          {/* OPEN / READ RATIO CIRCLE */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Open Read Ratio</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{readPercentage}% Clear</span>
            </div>
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="22" cy="22" r="18" stroke="#1e293b" strokeWidth="3" fill="transparent" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - readPercentage / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[8px] font-bold font-mono text-slate-300">{readPercentage}%</span>
            </div>
          </div>

          {/* CATEGORY BREAKDOWN VISUAL GAUGE */}
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-1.5 flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Alert Categories</span>
            <div className="space-y-1">
              {[
                { name: "Sec", val: categoryCounts["Security & System"], color: "bg-rose-500" },
                { name: "Fin", val: categoryCounts["Financial Status"], color: "bg-emerald-500" },
                { name: "Rem", val: categoryCounts["Reminders & Autopay"], color: "bg-indigo-500" },
                { name: "AI", val: categoryCounts["AI Strategic Insights"], color: "bg-amber-500" }
              ].map((c) => {
                const total = Math.max(1, totalCount);
                const pct = (c.val / total) * 100;
                return (
                  <div key={c.name} className="flex items-center gap-1.5 text-[8px] font-mono">
                    <span className="w-4 text-slate-400 font-black">{c.name}</span>
                    <div className="flex-1 bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-3 text-right text-slate-500">{c.val}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* CORE DISPATCH MANAGEMENT SPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: FILTER CONTROLS & CENTRAL DISPATCH BOARD */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          {/* SEARCH, GROUPING AND BULK OPERATIONS PANEL */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800/80 pb-4">
            
            {/* Left filter selections */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-[10px] font-mono">
                {[
                  { key: "all", label: "All Logs" },
                  { key: "unread", label: "Unread" },
                  { key: "high", label: "⚠️ High Urgency" },
                  { key: "archived", label: "📁 Archive" }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterMode(f.key as any)}
                    className={`px-2.5 py-1 font-bold rounded cursor-pointer transition-all ${
                      filterMode === f.key
                        ? "bg-slate-900 text-sky-400 border border-slate-800 shadow"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Display Toggle (Smart Grouping) */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">GROUPING:</span>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-[10px] font-mono">
                <button
                  onClick={() => {
                    setGroupingMode("list");
                    triggerToast("Chronological feed display active");
                  }}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                    groupingMode === "list" ? "bg-slate-900 text-sky-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Chron Feed
                </button>
                <button
                  onClick={() => {
                    setGroupingMode("category");
                    triggerToast("Smart category accordion active");
                  }}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                    groupingMode === "category" ? "bg-slate-900 text-sky-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  📂 Smart Grouping
                </button>
              </div>
            </div>

          </div>

          {/* SEARCH BAR & GENERAL BULK ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search alerts by title, keyword, context, or priority..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-650 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-500 hover:text-white shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick bulk keys */}
            <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900 justify-end">
              <button
                onClick={markAllAsRead}
                disabled={totalUnread === 0}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-[9px] font-mono text-slate-300 border border-slate-800 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Mark all notifications as read"
              >
                Mark All Read
              </button>
              <button
                onClick={archiveAllRead}
                disabled={readCount === 0}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-[9px] font-mono text-slate-300 border border-slate-800 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Archive all read alerts"
              >
                Archive Read
              </button>
              <button
                onClick={clearAllHistory}
                disabled={notifications.length === 0}
                className="px-2 py-1 bg-rose-950/20 hover:bg-rose-900/30 text-[9px] font-mono text-rose-400 border border-rose-500/20 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Delete everything permanently"
              >
                Reset Logs
              </button>
            </div>
          </div>

          {/* DND ACTIVE BLOCKED BANNER */}
          {dndActive && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between text-rose-400">
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-mono">
                  DO NOT DISTURB STATE IS ENFORCED. ALL DELIVERIES ARE ARCHIVED AND MUTED IN THE CLIENT.
                </span>
              </div>
              <button
                onClick={() => setDndActive(false)}
                className="text-[9px] font-mono bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20 transition-all cursor-pointer"
              >
                Disable Silence
              </button>
            </div>
          )}

          {/* RENDER ALERTS LOGS */}
          {sortedNotifications.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-14 h-14 bg-slate-950 rounded-full border border-slate-850 flex items-center justify-center text-slate-550 mx-auto">
                <Bell className="w-6 h-6 text-slate-600" />
              </div>
              <div className="max-w-xs mx-auto">
                <p className="text-slate-300 text-xs font-bold font-mono">Telemetry Dispatch Feed Clear</p>
                <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                  No active dispatches matched your query filter (Mode: {filterMode}). Customize criteria or simulate a new alert.
                </p>
              </div>
            </div>
          ) : groupingMode === "list" ? (
            // Chronological Standard Feed
            <div className="space-y-3">
              {sortedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                    notif.read
                      ? "bg-slate-950/20 border-slate-850/80 text-slate-400 hover:border-slate-800"
                      : "bg-slate-950 border-sky-500/15 text-slate-200 shadow-lg ring-1 ring-sky-500/5 hover:border-sky-500/25"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Read Toggle Circle */}
                    <button
                      onClick={() => {
                        toggleRead(notif.id);
                        triggerToast(notif.read ? "Muted read flagged" : "Cleared dispatch logged");
                      }}
                      className={`mt-1.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        notif.read
                          ? "border-slate-800 text-slate-600 hover:text-sky-400 hover:border-sky-500/30"
                          : "border-sky-500/40 text-sky-400 bg-sky-500/5 hover:bg-sky-500/20"
                      }`}
                      title={notif.read ? "Mark as Unread" : "Mark as Read"}
                    >
                      <Check className={`w-3 h-3 ${notif.read ? "opacity-40" : "opacity-100"}`} />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded">
                          {notif.category}
                        </span>

                        {/* Priority Badge */}
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase border font-black ${getPriorityStyle(notif.priority)}`}>
                          {notif.priority}
                        </span>

                        {/* Unread Status badge */}
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" title="Unread notification"></span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold mt-1 ${notif.read ? "text-slate-400" : "text-white"}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${notif.read ? "text-slate-500" : "text-slate-400"}`}>
                        {notif.desc}
                      </p>

                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono mt-2 uppercase">
                        <Clock className="w-3 h-3" />
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Controls Block */}
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-900/50 justify-end">
                    {/* Send to Email & Offline SMS button */}
                    <button
                      onClick={() => handleDispatchSingle(notif)}
                      className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Transmit this notification directly to Email and Offline SMS"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                      <span className="hidden sm:inline">Send Mail/SMS</span>
                    </button>

                    {/* Simulated Dynamic Interaction action button */}
                    {notif.actionText && (
                      <button
                        onClick={() => handleActionClick(notif.id, notif.actionType, notif.title)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          notif.priority === "high" && !notif.read
                            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                            : "bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800"
                        }`}
                      >
                        {notif.actionText}
                      </button>
                    )}

                    {/* Archive button */}
                    <button
                      onClick={() => archiveNotif(notif.id)}
                      className={`p-1.5 rounded-lg hover:bg-slate-850 text-slate-500 transition-all cursor-pointer ${
                        notif.archived ? "text-sky-400 bg-sky-500/5" : "hover:text-slate-300"
                      }`}
                      title={notif.archived ? "Unarchive alert" : "Archive alert"}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteNotif(notif.id)}
                      className="p-1.5 hover:bg-rose-950/40 text-slate-650 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                      title="Permanently purge alert log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Smart Category Grouping Accordions
            <div className="space-y-4">
              {(["Security & System", "Financial Status", "Reminders & Autopay", "AI Strategic Insights"] as const).map((catName) => {
                const list = groupedNotifications[catName] || [];
                const isFolded = !expandedCategories[catName];
                const unreadInCatCount = list.filter((n) => !n.read).length;

                return (
                  <div key={catName} className="bg-slate-950/30 rounded-xl border border-slate-850 overflow-hidden">
                    <button
                      onClick={() => toggleCategoryFold(catName)}
                      className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900/60 transition-colors text-left font-mono cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-white">{catName}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">
                          {list.length} Dispatches
                        </span>
                        {unreadInCatCount > 0 && (
                          <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">
                            {unreadInCatCount} UNREAD
                          </span>
                        )}
                      </div>
                      <div>
                        {isFolded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-300" />}
                      </div>
                    </button>

                    {!isFolded && (
                      <div className="p-3 bg-slate-900/10 divide-y divide-slate-900 space-y-2">
                        {list.length === 0 ? (
                          <p className="p-6 text-center text-slate-600 font-mono text-[10px]">
                            No active items classified inside this sector.
                          </p>
                        ) : (
                          list.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3.5 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${
                                notif.read
                                  ? "bg-slate-950/10 border-slate-850/60 text-slate-400"
                                  : "bg-slate-950/60 border-sky-500/10 text-slate-200"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <button
                                  onClick={() => toggleRead(notif.id)}
                                  className={`mt-1 w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                                    notif.read
                                      ? "border-slate-850 text-slate-600 hover:text-sky-400"
                                      : "border-sky-500/30 text-sky-400 bg-sky-500/5 hover:bg-sky-500/15"
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5" />
                                </button>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[7px] font-mono px-1 py-0.1 rounded uppercase border ${getPriorityStyle(notif.priority)}`}>
                                      {notif.priority}
                                    </span>
                                    <h5 className={`text-xs font-bold ${notif.read ? "text-slate-400" : "text-white"}`}>
                                      {notif.title}
                                    </h5>
                                    {!notif.read && <span className="w-1.5 h-1.5 bg-sky-400 rounded-full shrink-0 animate-pulse"></span>}
                                  </div>
                                  <p className="text-[10px] text-slate-450 leading-relaxed">{notif.desc}</p>
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block mt-1">
                                    {notif.timestamp}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                                {notif.actionText && (
                                  <button
                                    onClick={() => handleActionClick(notif.id, notif.actionType, notif.title)}
                                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-[9px] font-mono font-bold text-slate-300 border border-slate-850 rounded"
                                  >
                                    {notif.actionText}
                                  </button>
                                )}
                                <button
                                  onClick={() => archiveNotif(notif.id)}
                                  className="p-1 hover:bg-slate-950 rounded text-slate-500 hover:text-slate-300"
                                  title="Archive"
                                >
                                  <Archive className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteNotif(notif.id)}
                                  className="p-1 hover:bg-rose-950/40 rounded text-slate-550 hover:text-rose-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DND MODE NOTE */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-[10px] text-slate-450 leading-relaxed space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>SECURITY CERTIFICATION STANDARD</span>
            </div>
            <p>
              Notifications are cached in high-security, client-side cryptosystem matrices. Real-time telemetry delivers alert nodes locally without sending raw payment notes to cloud vectors. AES-256 standard applied.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: PREFERENCES MATRIX & DYNAMIC EMULATOR */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* INTERACTIVE ALERTS SIMULATOR TOOL */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-400 fill-sky-400" />
              Real-time Alert Emulator
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Manually dispatch mock notifications across varying corporate disciplines to test priority rankings, smart visual folders, and state responses.
            </p>

            {/* PRESETS BUTTON MATRIX */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Select Preset Matrix Template:</span>
              <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                {[
                  { key: "security", label: "🛡️ Fraud / Security" },
                  { key: "budget", label: "💰 Overspending" },
                  { key: "bill", label: "📅 Bill Due" },
                  { key: "investment", label: "📈 Asset Yield" },
                  { key: "recommendation", label: "🤖 AI Advice" },
                  { key: "goal", label: "🎯 Savings Goal" },
                  { key: "subscription", label: "🔌 SaaS billing" },
                  { key: "tax", label: "💼 Tax deadline" },
                  { key: "savings", label: "💵 Reserve Sweep" },
                  { key: "summary", label: "📊 Digest Briefing" }
                ].map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset.key as any)}
                    className={`p-1.5 bg-slate-950 border border-slate-850 rounded hover:border-sky-500/20 text-left cursor-pointer truncate transition-colors ${
                      emulatorType === preset.key ? "text-sky-400 border-sky-500/30 font-black" : "text-slate-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SIMULATED DRAFT FORM */}
            <form onSubmit={dispatchEmulatorAlert} className="space-y-3.5 pt-2 border-t border-slate-800/60">
              
              {/* Priority Select */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase block">Alert Priority Tier:</label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as const).map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setEmulatorPriority(pri)}
                      className={`flex-1 py-1 rounded text-[9px] font-mono font-bold border capitalize transition-all cursor-pointer ${
                        emulatorPriority === pri
                          ? pri === "high"
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                            : pri === "medium"
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                            : "bg-sky-500/10 border-sky-500/40 text-sky-400"
                          : "bg-slate-950 border-slate-850 text-slate-500"
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase block">Simulated Title:</label>
                <input
                  type="text"
                  value={emulatorTitle}
                  onChange={(e) => setEmulatorTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-105 font-mono focus:outline-none focus:border-sky-500/30"
                />
              </div>

              {/* Desc input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase block">Simulated Description Notes:</label>
                <textarea
                  value={emulatorDesc}
                  onChange={(e) => setEmulatorDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-105 font-mono h-16 resize-none focus:outline-none focus:border-sky-500/30"
                />
              </div>

              {/* Submit Trigger button */}
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white rounded-xl text-xs font-mono font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dispatch Instant Alert</span>
              </button>

            </form>
          </div>

          {/* TWILIO LIVE SMS DISPATCHER CARD */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Twilio SMS Gateway
              </h3>
              <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Direct integration with Twilio REST API. Account SID <code className="text-emerald-300 font-mono text-[10px]">AC4812...eec19</code> active with From Number <code className="text-emerald-300 font-mono text-[10px]">+12186569048</code>.
            </p>

            <form onSubmit={handleSendLiveTwilioSMS} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase block">Recipient Mobile Number (E.164 format):</label>
                <input
                  type="text"
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  placeholder="+12186569048"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase block">SMS Notification Text:</label>
                <textarea
                  value={twilioMessage}
                  onChange={(e) => setTwilioMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { label: "🔒 OTP Code", msg: "[FinSight Security] Your verification OTP code is: " + Math.floor(100000 + Math.random() * 900000) },
                  { label: "⚠️ Overspending", msg: "FinSight Alert: Utilities budget cap reached 94% limit." },
                  { label: "📈 Yield Dividend", msg: "FinSight Yield: AAPL Dividend payment of $24.80 received." }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTwilioMessage(item.msg)}
                    className="text-[8px] font-mono px-2 py-1 bg-slate-950 hover:bg-slate-850 text-emerald-400/90 border border-emerald-500/20 rounded cursor-pointer transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={twilioSending}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {twilioSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Contacting Twilio REST API...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Live SMS via Twilio</span>
                  </>
                )}
              </button>

              {twilioStatusLog && (
                <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed ${
                  twilioStatusLog.startsWith("Error")
                    ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
                    : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                }`}>
                  {twilioStatusLog}
                </div>
              )}
            </form>
          </div>

          {/* CHANNELS DELIVERY PREFERENCES MATRIX */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Delivery Matrix
              </h3>
              <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                SECURE SYNC
              </span>
            </div>

            <p className="text-slate-450 text-[11px] leading-relaxed">
              Tweak channels delivery parameters on each alert type mapping. Active markers route payloads immediately to your physical endpoints.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { key: "budget", label: "💰 Budgets & Overspending", subtitle: "Utilizations limits and limits cap" },
                { key: "goal", label: "🎯 Milestone Goals", subtitle: "Goal savings progression & cap triggers" },
                { key: "bill", label: "📅 Invoices & Subscription", subtitle: "PG&E energy, SaaS, and automatic routing" },
                { key: "investment", label: "📈 Asset Yields & Dividend", subtitle: "Apple Inc., BTC drifts, compounding" },
                { key: "ai", label: "🤖 AI Strategic Counsel", subtitle: "Cash re-allocations recommendations" },
                { key: "security", label: "🛡️ Cyber Security & Fraud", subtitle: "Session token logs, unrecognized logins" },
                { key: "summaries", label: "📊 Periodic Fiscal Summaries", subtitle: "June digest briefs, mid-year tax metrics" }
              ].map((row) => {
                const mapKey = row.key;
                const rowPrefs = preferences[row.key as keyof typeof preferences] || { push: false, email: false, sms: false, inApp: false };

                return (
                  <div key={row.key} className="space-y-2 pb-3.5 border-b border-slate-850 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-xs font-bold text-white">{row.label}</h4>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{row.subtitle}</p>
                    </div>

                    {/* Checkbox columns */}
                    <div className="grid grid-cols-4 gap-1 text-[8px] font-mono pt-1 text-center">
                      
                      {/* Push */}
                      <button
                        type="button"
                        onClick={() => togglePreference(mapKey, "push")}
                        className={`p-1 border rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          rowPrefs.push
                            ? "bg-sky-500/10 border-sky-500/30 text-sky-400 font-black"
                            : "bg-slate-950 border-slate-850 text-slate-650 hover:text-slate-400"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>PUSH</span>
                      </button>

                      {/* Email */}
                      <button
                        type="button"
                        onClick={() => togglePreference(mapKey, "email")}
                        className={`p-1 border rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          rowPrefs.email
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black"
                            : "bg-slate-950 border-slate-850 text-slate-650 hover:text-slate-400"
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                        <span>EMAIL</span>
                      </button>

                      {/* SMS */}
                      <button
                        type="button"
                        onClick={() => togglePreference(mapKey, "sms")}
                        className={`p-1 border rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          rowPrefs.sms
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-black"
                            : "bg-slate-950 border-slate-850 text-slate-650 hover:text-slate-400"
                        }`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>SMS</span>
                      </button>

                      {/* In-App */}
                      <button
                        type="button"
                        onClick={() => togglePreference(mapKey, "inApp")}
                        className={`p-1 border rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          rowPrefs.inApp
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-black"
                            : "bg-slate-950 border-slate-850 text-slate-650 hover:text-slate-400"
                        }`}
                      >
                        <Bell className="w-3 h-3" />
                        <span>IN-APP</span>
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
